# Unificação de pessoas em `clients` — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fundir `supporters` + `customers` numa única tabela `clients`, religar vendas e doações a ela, e entregar uma tela única "Clientes" com picker buscar-ou-criar reusado em todos os fluxos.

**Architecture:** Tabela `clients` + `client_tags`; agregados em `clients_view` (calculados de `sales`/`donations_*`); componente `ClientPicker` compartilhado nos forms; tela `/clientes` (lista + perfil + edição). Banco está vazio — reestruturação limpa com re-seed.

**Tech Stack:** Next.js 14 (App Router, Server Actions), Supabase (Postgres + RLS + PostgREST), TypeScript, Tailwind.

## Global Constraints

- Decimais BR via `parseMoney` (lib/utils.ts) — nunca `parseFloat` direto em valor.
- Datas/fronteiras de tempo no fuso `America/Sao_Paulo` (helpers `brNowParts`/`brMidnightUtc` em lib/store.ts).
- Server actions retornam `{ error: string } | void`; `redirect()` sempre FORA do `try`.
- `registered_by` = `user.id` do `supabase.auth.getUser()` em toda escrita.
- Colunas desnormalizadas de snapshot (`sales.customer_name`, `donations_*.donor_name/phone`) permanecem.
- Verificação: `npm run build` limpo + teste de fluxo node sob JWT autenticado (RLS), nunca service_role pra validar caminho real.
- Não usar `parseFloat`/`Math.random`/`Date.now` em código novo de servidor onde houver helper.
- Projeto: `c:\Users\Administrator\Documents\programas\camaleao-admin`. Branch: `feat/clients-unification`.
- Credenciais de teste: ver .env.local (não versionado).

---

### Task 1: Migration do banco + schema canônico + re-seed

**Files:**
- Modify: `supabase/schema.sql` (reescreve seção de pessoas, views, RPC, RLS, seed)
- Create: `supabase/migrations/20260611120000_clients_unification.sql`

**Interfaces:**
- Produces (objetos no banco): tabela `clients(id,name,phone,email,cpf,birthday,member_since,notes,created_at)`, tabela `client_tags(client_id,tag_id)`, colunas `client_id` em `sales`/`donations_cash`/`donations_items`/`donations_caps`, view `clients_view`, função `register_sale(p_client_id,...)`.

- [ ] **Step 1: Escrever a migration**

Criar `supabase/migrations/20260611120000_clients_unification.sql`:

```sql
-- Drop objetos dependentes do modelo antigo
drop view if exists customers_view;
drop function if exists register_sale(uuid,text,uuid,uuid,int,numeric,uuid,timestamptz,jsonb);

-- Religar FKs: remover vínculos antigos, adicionar client_id
alter table sales            drop column if exists customer_id;
alter table sales            add column if not exists client_id uuid references clients(id) on delete set null;
alter table donations_cash   drop column if exists supporter_id;
alter table donations_cash   add column if not exists client_id uuid references clients(id) on delete set null;
alter table donations_items  drop column if exists supporter_id;
alter table donations_items  add column if not exists client_id uuid references clients(id) on delete set null;
alter table donations_caps   drop column if exists supporter_id;
alter table donations_caps   add column if not exists client_id uuid references clients(id) on delete set null;

-- Tabela clients (substitui supporters + customers)
create table if not exists clients (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  phone        text,
  email        text,
  cpf          text unique,
  birthday     text,
  member_since int,
  notes        text,
  created_at   timestamptz default now()
);

create table if not exists client_tags (
  client_id uuid references clients(id) on delete cascade,
  tag_id    uuid references tags(id)    on delete cascade,
  primary key (client_id, tag_id)
);

-- Drop tabelas antigas (depois de soltar FKs acima)
drop table if exists customer_tags;
drop table if exists customers;
drop table if exists supporters;

create index if not exists idx_clients_phone        on clients (phone);
create index if not exists idx_clients_cpf          on clients (cpf);
create index if not exists idx_sales_client_id      on sales (client_id);
create index if not exists idx_dcash_client_id      on donations_cash (client_id);
create index if not exists idx_ditems_client_id     on donations_items (client_id);
create index if not exists idx_dcaps_client_id      on donations_caps (client_id);

-- register_sale sem update de stats (view calcula)
create or replace function register_sale(
  p_client_id         uuid,
  p_customer_name     text,
  p_payment_method_id uuid,
  p_bank_id           uuid,
  p_installments      int,
  p_net_amount        numeric,
  p_registered_by     uuid,
  p_sold_at           timestamptz,
  p_items             jsonb
) returns uuid language plpgsql as $$
declare v_sale_id uuid; v_item jsonb;
begin
  insert into sales (client_id, customer_name, payment_method_id, bank_id, installments, net_amount, registered_by, sold_at)
  values (p_client_id, p_customer_name, p_payment_method_id, p_bank_id, p_installments, p_net_amount, p_registered_by, p_sold_at)
  returning id into v_sale_id;
  for v_item in select * from jsonb_array_elements(p_items) loop
    insert into sale_items (sale_id, category_id, category_name, amount)
    values (v_sale_id, (v_item->>'category_id')::uuid, v_item->>'category_name', (v_item->>'amount')::numeric);
  end loop;
  return v_sale_id;
end; $$;

-- clients_view: agregados de compras + doações
create or replace view clients_view as
select
  c.id, c.name, c.phone, c.email, c.birthday, c.member_since, c.notes, c.created_at,
  coalesce(array_remove(array_agg(distinct t.name), null), '{}') as tags,
  count(distinct s.id)                                  as purchase_count,
  coalesce(sum(distinct_si.amount), 0)                  as total_spent,
  max(s.sold_at)                                        as last_purchase_at,
  (select count(*) from donations_cash dc where dc.client_id = c.id)
   + (select count(*) from donations_items di where di.client_id = c.id)
   + (select count(*) from donations_caps dp where dp.client_id = c.id) as donation_count,
  coalesce((select sum(dc.amount) from donations_cash dc where dc.client_id = c.id), 0) as donation_total,
  greatest(
    (select max(dc.donated_at) from donations_cash dc where dc.client_id = c.id),
    (select max(di.donated_at) from donations_items di where di.client_id = c.id),
    (select max(dp.donated_at) from donations_caps dp where dp.client_id = c.id)
  ) as last_donation_at
from clients c
left join client_tags ct on ct.client_id = c.id
left join tags t on t.id = ct.tag_id
left join sales s on s.client_id = c.id
left join lateral (select coalesce(sum(si.amount),0) as amount from sale_items si where si.sale_id = s.id) distinct_si on true
group by c.id;

-- RLS
alter table clients     enable row level security;
alter table client_tags enable row level security;
create policy "authenticated read"  on clients     for select using (auth.role() = 'authenticated');
create policy "authenticated write" on clients     for all    using (auth.role() = 'authenticated');
create policy "authenticated read"  on client_tags for select using (auth.role() = 'authenticated');
create policy "authenticated write" on client_tags for all    using (auth.role() = 'authenticated');
```

> Nota sobre `total_spent`: o join `sales` × agregação de itens via `lateral` evita duplicar soma quando há múltiplas tags/doações no mesmo group. Validar no Step 4 que o número bate.

- [ ] **Step 2: Aplicar a migration**

Run:
```bash
cd "c:/Users/Administrator/Documents/programas/camaleao-admin"
export SUPABASE_ACCESS_TOKEN=$(grep -m1 . /dev/null 2>/dev/null; echo "$SUPABASE_ACCESS_TOKEN")
printf 'Y\n' | npx supabase db push
```
Expected: `Applying migration 20260611120000_clients_unification.sql... Finished supabase db push.`
(Se faltar token: `npx supabase login` ou exportar `SUPABASE_ACCESS_TOKEN`.)

- [ ] **Step 3: Re-seed lookups + user row**

As migrations iniciais já trazem o seed de lookups; se o banco estiver vazio, re-aplicar o seed de lookups e recriar a linha do user. Rodar via PostgREST com service_role (script node em scratchpad) OU via SQL no dashboard. Conteúdo mínimo:
- tags (5), payment_methods (4), banks (5), item_categories (10), cash_origins (5) — valores idênticos ao bloco SEED de `supabase/schema.sql`.
- `insert into users (id, name, role) values ('ad54e844-0dfe-4e56-8162-6a3661ea1d4d', 'Pedro Lacerda', 'admin');`

Verificar:
```bash
curl -s "https://PROJETO.supabase.co/rest/v1/tags?select=name" -H "apikey: $ANON" 
```
Expected: array com 5 tags.

- [ ] **Step 4: Teste de fluxo sob RLS (script node em scratchpad)**

Criar script no scratchpad que: login (JWT) → insere `client` → `register_sale` RPC com `p_client_id` → insere `donations_cash` com `client_id` → lê `clients_view` e confere `purchase_count=1`, `total_spent` = valor da venda, `donation_count>=1`, `donation_total` = valor doado → insere venda com `client_id=null` (avulso) → cleanup.

Run: `node <scratchpad>/t1.mjs`
Expected: todas linhas `OK`, exit 0.

- [ ] **Step 5: Atualizar schema.sql canônico**

Editar `supabase/schema.sql`: substituir blocos de `supporters`/`customers`/`customer_tags`/`customers_view`/`register_sale`/RLS antigos pelo modelo `clients` (mesmo conteúdo da migration), mantendo seed de lookups. `donations_cash_view` permanece inalterada.

- [ ] **Step 6: Commit**

```bash
git add supabase/
git commit -m "feat(db): unifica supporters+customers em clients com clients_view"
```

---

### Task 2: Tipos + camada store

**Files:**
- Modify: `types/index.ts`
- Modify: `lib/store.ts`

**Interfaces:**
- Consumes: objetos do banco da Task 1 (`clients_view`, `register_sale(p_client_id,...)`).
- Produces:
  - Tipo `Client { id; name; phone; email?; tags: string[]; birthday: string; member_since: number; purchase_count: number; total_spent: number; last_purchase_at: string; donation_count: number; donation_total: number; last_donation_at: string|null; notes?: string; created_at?: string }`
  - `getClients(): Promise<Client[]>`
  - `addClient(data: { name; phone; birthday; email?; tags: string[]; member_since: number }): Promise<Client>`
  - `updateClient(clientId: string, data: { name; phone; birthday; email?; tags: string[] }): Promise<Client>`
  - `getClientSalesHistory(clientId: string): Promise<Sale[]>`
  - `getClientDonationsHistory(clientId: string): Promise<{ id; kind: 'cash'|'items'|'caps'; label: string; donated_at: string; detail: string }[]>`
  - `addSale(...)` agora aceita `client_id?: string|null` (em vez de `customer_id`).
  - adders de doação aceitam `client_id?: string|null`.

- [ ] **Step 1: Reescrever tipo `Customer`→`Client`**

Em `types/index.ts`, substituir interface `Customer` por `Client` (campos acima; remove `supporter_id`, adiciona `email?`, `donation_count`, `donation_total`, `last_donation_at`). Adicionar `client_id?: string | null` em `DonationCash`, `DonationItem`, `DonationCaps` (opcional, snapshot).

- [ ] **Step 2: Ajustar store — leitura de clients**

Em `lib/store.ts`: `getCustomers`→`getClients` lendo `clients_view` (`order('name')`). `getCustomerSalesHistory`→`getClientSalesHistory` lendo `sales_view` por `client_id`. Substituir todas refs `customers_view`→`clients_view` (`getBirthdaysThisMonth`, `getTopCustomerInsight`, `getReportData` count). `getDashboardStats`/`getMonthSales`/`getTodaySales` inalterados.

- [ ] **Step 3: Store — addClient/updateClient**

Reescrever `addCustomer`→`addClient`: insere em `clients` (name/phone/email/birthday/member_since), liga tags em `client_tags`, retorna linha de `clients_view`. `updateCustomer`→`updateClient`: update em `clients` por `clientId` + replace tags em `client_tags`. `updateCustomerTagsStore`→`updateClientTagsStore` (chave `client_id`). Remover a lógica de criar supporter.

- [ ] **Step 4: Store — addSale/addDonation* com client_id**

`addSale`: trocar campo `customer_id`→`client_id`, RPC param `p_client_id`. `addDonation`/`addDonationItem`/`addDonationCaps`: aceitar e inserir `client_id`.

- [ ] **Step 5: Store — getClientDonationsHistory (nova)**

```ts
export async function getClientDonationsHistory(clientId: string) {
  const supabase = await createClient()
  const [cash, items, caps] = await Promise.all([
    supabase.from('donations_cash').select('id, amount, donated_at').eq('client_id', clientId),
    supabase.from('donations_items').select('id, category_name, quantity, donated_at').eq('client_id', clientId),
    supabase.from('donations_caps').select('id, quantity, weight_kg, donated_at').eq('client_id', clientId),
  ])
  const rows = [
    ...(cash.data ?? []).map(d => ({ id: d.id, kind: 'cash' as const, label: 'Dinheiro', donated_at: d.donated_at, detail: `R$ ${Number(d.amount).toFixed(2)}` })),
    ...(items.data ?? []).map(d => ({ id: d.id, kind: 'items' as const, label: 'Itens', donated_at: d.donated_at, detail: `${d.quantity}× ${d.category_name}` })),
    ...(caps.data ?? []).map(d => ({ id: d.id, kind: 'caps' as const, label: 'Tampinhas', donated_at: d.donated_at, detail: d.weight_kg ? `${Number(d.weight_kg).toFixed(1)} kg` : `${d.quantity} un` })),
  ]
  return rows.sort((a, b) => new Date(b.donated_at).getTime() - new Date(a.donated_at).getTime())
}
```

- [ ] **Step 6: Build**

Run: `npm run build`
Expected: pode falhar em actions/components que ainda usam nomes antigos — OK nesta task se o erro for só nesses arquivos (serão corrigidos nas Tasks 3-6). Confirmar que `lib/store.ts` e `types/index.ts` não têm erro próprio rodando `npx tsc --noEmit 2>&1 | grep -E "store.ts|types/index"` → vazio.

- [ ] **Step 7: Commit**

```bash
git add lib/store.ts types/index.ts
git commit -m "refactor(store): API de clients + histórico de doações + agregados via view"
```

---

### Task 3: Server actions

**Files:**
- Create: `actions/clients.ts` (renomeia `actions/customers.ts`)
- Delete: `actions/customers.ts`
- Modify: `actions/sales.ts`, `actions/donations.ts`

**Interfaces:**
- Consumes: `addClient`, `updateClient`, `getClientSalesHistory`, `getClientDonationsHistory` (Task 2).
- Produces:
  - `saveNewClient(formData): Promise<Client>` (era `createCustomer`)
  - `saveClient(formData): Promise<Client>` (era `editCustomer`)
  - `fetchClientSales(clientId): Promise<Sale[]>`, `fetchClientDonations(clientId)`
  - `updateClientTags(id, tags)`
  - `registerSale` envia `client_id`; `registerDonation*` enviam `client_id`.

- [ ] **Step 1: Criar actions/clients.ts**

Copiar conteúdo de `actions/customers.ts`, renomear: `createCustomer`→`saveNewClient`, `editCustomer`→`saveClient` (FormData usa `client_id`/`supporter_id`→ remover supporter_id; passar `client_id`), `fetchCustomerSales`→`fetchClientSales`, adicionar `fetchClientDonations(clientId){ return getClientDonationsHistory(clientId) }`, `updateCustomerTags`→`updateClientTags`. `revalidatePath('/brecho/compradoras')`→`revalidatePath('/clientes')`. Deletar `actions/customers.ts`.

- [ ] **Step 2: sales.ts e donations.ts → client_id**

`actions/sales.ts`: o campo do form `customer_id`→`client_id`; `addSale({ client_id: (formData.get('client_id') as string) || null, ... })`. `actions/donations.ts`: nas 3 actions, ler `client_id` do form e passar pro adder; `donor_name` continua (snapshot/anônimo).

- [ ] **Step 3: Build**

Run: `npx tsc --noEmit 2>&1 | grep -E "actions/"` 
Expected: vazio (components ainda podem quebrar — Tasks 4-6).

- [ ] **Step 4: Commit**

```bash
git add actions/
git commit -m "refactor(actions): clients actions + client_id em vendas e doações"
```

---

### Task 4: Componente compartilhado `ClientPicker`

**Files:**
- Create: `components/clients/client-picker.tsx`
- Create: `components/clients/new-client-modal.tsx` (renomeia new-customer-modal)

**Interfaces:**
- Consumes: `saveNewClient` (Task 3), tipo `Client`.
- Produces:
  - `NewClientModal({ tags, onClose, onCreated })` (era NewCustomerModal; usa `saveNewClient`).
  - `ClientPicker({ clients, tags, selected, onSelect, allowAnonymous }: { clients: Client[]; tags: DbTag[]; selected: Client | null; onSelect: (c: Client | null) => void; allowAnonymous?: boolean })` — busca nome/telefone, dropdown, "Cadastrar novo" (abre NewClientModal), "Anônimo/avulso" (onSelect(null)). Quando selecionado mostra chip com nome + botão limpar.

- [ ] **Step 1: Criar new-client-modal.tsx**

Copiar `components/shop/new-customer-modal.tsx` → `components/clients/new-client-modal.tsx`, renomear componente `NewClientModal`, trocar import/uso `createCustomer`→`saveNewClient`, tipo `Customer`→`Client`. Manter máscara dd/mm + feedback de erro. Adicionar campo opcional `email` (input type=email, name="email").

- [ ] **Step 2: Criar client-picker.tsx**

Extrair a UI de busca de compradora de `components/shop/new-sale-form.tsx` (bloco "Compradora": input de busca + dropdown filtrado + chip selecionado + botões "Cadastrar nova"/"Cliente avulso") para um componente standalone `ClientPicker` com a interface acima. Estado interno: `search`, `showDropdown`, `showModal`. Ao criar via modal, adiciona à lista local e seleciona. `allowAnonymous` controla exibição do botão "Anônimo/avulso".

```tsx
'use client'
import { useState } from 'react'
import { Plus, X, Search } from 'lucide-react'
import { Tag } from '@/components/ui/tag'
import { NewClientModal } from '@/components/clients/new-client-modal'
import type { Client } from '@/types'
interface DbTag { id: string; name: string; color: string; bg_color: string }
interface Props { clients: Client[]; tags: DbTag[]; selected: Client | null; onSelect: (c: Client | null) => void; allowAnonymous?: boolean }
export function ClientPicker({ clients, tags, selected, onSelect, allowAnonymous = true }: Props) {
  const [list, setList] = useState<Client[]>(clients)
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const filtered = list.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search))
  function created(c: Client) { setList(prev => [...prev, c].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'))); onSelect(c); setShowModal(false) }
  // ... markup: se selected → chip com nome/telefone + X (onSelect(null)); senão → input busca + dropdown (filtered.slice(0,5)) + botões
  // "Cadastrar novo" → setShowModal(true); "Anônimo/avulso" (se allowAnonymous) → onSelect(null) + setSearch('')
  return (/* JSX espelhando o bloco atual de new-sale-form */)
}
```

(Reproduzir o markup exato do bloco "Compradora" de new-sale-form atual, trocando `selectedCustomer`→`selected`, `customerList`→`list`, `setSelectedCustomer`→`onSelect`.)

- [ ] **Step 3: Build**

Run: `npx tsc --noEmit 2>&1 | grep -E "client-picker|new-client-modal"`
Expected: vazio.

- [ ] **Step 4: Commit**

```bash
git add components/clients/
git commit -m "feat(clients): ClientPicker compartilhado + NewClientModal"
```

---

### Task 5: Forms de venda e doação usam ClientPicker

**Files:**
- Modify: `components/shop/new-sale-form.tsx`
- Modify: `components/donations/new-donation-form.tsx`, `new-donation-item-form.tsx`, `new-donation-caps-form.tsx`
- Modify: `app/(admin)/brecho/nova-venda/page.tsx`, `app/(admin)/doacoes/*/nova/page.tsx`

**Interfaces:**
- Consumes: `ClientPicker` (Task 4), `getClients` (Task 2).
- Produces: forms enviam `client_id` (ou vazio p/ anônimo) + `customer_name`/`donor_name` derivado do cliente selecionado.

- [ ] **Step 1: new-sale-form usa ClientPicker**

Remover o bloco de busca de compradora e estados relacionados; renderizar `<ClientPicker clients={clients} tags={tags} selected={selected} onSelect={setSelected} />`. Em `handleSubmit`: `if (selected) { fd.set('client_id', selected.id); fd.set('customer_name', selected.name) } else { fd.set('customer_name','Cliente avulso') }`. Prop `customers`→`clients` (tipo `Client[]`).

- [ ] **Step 2: nova-venda page passa clients**

`getCustomers()`→`getClients()`; passar `clients` ao form.

- [ ] **Step 3: 3 forms de doação usam ClientPicker**

Em cada form de doação, adicionar bloco "Doador" com `<ClientPicker allowAnonymous clients={clients} tags={tags} selected={selected} onSelect={setSelected} />` no topo. `handleSubmit`: `if (selected) { fd.set('client_id', selected.id); fd.set('donor_name', selected.name); if (selected.phone) fd.set('donor_phone', selected.phone) } else { /* usa campos digitados/anônimo */ }`. Manter inputs de nome/telefone como fallback quando anônimo (ou esconder quando cliente selecionado). As 3 pages `nova` passam `clients={await getClients()}`.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: `✓ Compiled successfully`, sem erro de tipo.

- [ ] **Step 5: Commit**

```bash
git add components/ app/
git commit -m "feat(forms): venda e doações usam ClientPicker (buscar-ou-criar + anônimo)"
```

---

### Task 6: Tela Clientes + navegação

**Files:**
- Create: `app/(admin)/clientes/page.tsx`
- Create: `components/clients/clients-page-client.tsx`, `clients-list.tsx`, `client-profile.tsx`, `edit-client-modal.tsx`
- Delete: `app/(admin)/brecho/compradoras/page.tsx` e os `components/shop/customers-*`, `customer-profile.tsx`, `edit-customer-modal.tsx`, `new-customer-modal.tsx`
- Modify: `components/layout/sidebar.tsx`

**Interfaces:**
- Consumes: `getClients`, `getTags`, `fetchClientSales`, `fetchClientDonations`, `saveClient`, `EditClientModal`.
- Produces: rota `/clientes` funcional.

- [ ] **Step 1: Migrar componentes shop→clients**

Copiar `customers-page-client.tsx`→`clients-page-client.tsx`, `customers-list.tsx`→`clients-list.tsx`, `customer-profile.tsx`→`client-profile.tsx`, `edit-customer-modal.tsx`→`edit-client-modal.tsx`. Renomear componentes/props `Customer`→`Client`, imports de actions (`editCustomer`→`saveClient`, `fetchCustomerSales`→`fetchClientSales`). Total_spent já formatado (`Number(...).toFixed(2)`).

- [ ] **Step 2: client-profile mostra doações**

Em `client-profile.tsx`, além do histórico de compras (`fetchClientSales`), buscar `fetchClientDonations(client.id)` e renderizar seção "Histórico de doações" (lista `label` + `detail` + data). Adicionar bloco de stats de doação (`donation_count`, `donation_total`) ao lado das compras.

- [ ] **Step 3: Página /clientes**

```tsx
// app/(admin)/clientes/page.tsx
import { ClientsPageClient } from '@/components/clients/clients-page-client'
import { getClients, getTags } from '@/lib/store'
export const dynamic = 'force-dynamic'
export default async function ClientesPage() {
  const [clients, tags] = await Promise.all([getClients(), getTags()])
  return (<div className="px-4 py-6 md:px-14 md:py-10 max-w-[1300px]"><ClientsPageClient clients={clients} tags={tags} /></div>)
}
```

- [ ] **Step 4: Sidebar**

`topNav`: adicionar `{ href: '/clientes', label: 'Clientes', icon: Users }` (import `Users` de lucide-react) entre Doações e Relatórios. Remover `{ href: '/brecho/compradoras', label: 'Compradoras' }` de `brechoSub`.

- [ ] **Step 5: Remover rota e componentes antigos**

Deletar `app/(admin)/brecho/compradoras/` e `components/shop/{customers-page-client,customers-list,customer-profile,edit-customer-modal,new-customer-modal}.tsx`. Garantir que nada importa esses arquivos (`grep -rn "compradoras\|customer-profile\|NewCustomerModal\|customers-list" app components`).

- [ ] **Step 6: Build + verificação de rota**

Run: `npm run build`
Expected: `✓ Compiled successfully`; lista de rotas inclui `/clientes` e NÃO inclui `/brecho/compradoras`.

- [ ] **Step 7: Commit**

```bash
git add app/ components/
git commit -m "feat(clientes): tela única de clientes (compras + doações) e nav de topo"
```

---

### Task 7: Seed de exemplo + teste de integração + build final

**Files:**
- Create: script de seed em scratchpad (não commitado)

**Interfaces:**
- Consumes: schema final (Task 1) + app (Tasks 2-6).

- [ ] **Step 1: Seed de exemplo**

Script node (scratchpad, service_role) que cria ~8 `clients`, vincula tags, ~40 vendas (`register_sale` com `p_client_id`), ~15 doações (cash/items/caps) com `client_id` — datas espalhadas no ano + algumas hoje. Rodar.

Run: `node <scratchpad>/seed.mjs`
Expected: linhas `✓`, sem erro.

- [ ] **Step 2: Teste de fluxo end-to-end sob RLS**

Script (JWT autenticado) que: cria client → venda vinculada → doação vinculada → venda anônima (`client_id null`) → edita client (nome+tags) → lê `clients_view` confirmando `purchase_count`, `total_spent`, `donation_count`, `donation_total`, `tags`. Cleanup dos registros TESTE.

Run: `node <scratchpad>/e2e.mjs`
Expected: todas `OK`, exit 0.

- [ ] **Step 3: Build final + smoke da rota**

Run: `npm run build`
Expected: `✓ Compiled successfully`, rotas `/clientes`, `/brecho/nova-venda`, `/doacoes/*` presentes.

- [ ] **Step 4: Commit (se houver ajuste)**

```bash
git add -A
git commit -m "test(clients): seed de exemplo e validação de fluxo unificado" || echo "nada a commitar"
```

---

## Self-Review

**Spec coverage:**
- Tabela única `clients` + `client_tags` → Task 1 ✓
- FKs religadas (sales/donations client_id) → Task 1 ✓
- Agregados via clients_view → Task 1 (view) + Task 2 (leitura) ✓
- register_sale sem stats → Task 1 ✓
- ClientPicker compartilhado + anônimo → Task 4 + Task 5 ✓
- Tela Clientes (compras + doações + edição) → Task 6 ✓
- Nav topo "Clientes", remove Compradoras → Task 6 ✓
- Doações usam picker → Task 5 ✓
- Migração + re-seed lookups + user row → Task 1 ✓
- RLS clients/client_tags → Task 1 ✓
- Erros {error}/feedback → mantidos (Tasks 3,4,5) ✓
- Testes sob RLS + build → Tasks 1,2,5,6,7 ✓
- donations_cash_view inalterada → respeitado (não tocada) ✓

**Placeholders:** Markup de componentes referencia arquivos EXISTENTES a copiar (não outra task) — DRY válido. SQL, store helpers e ClientPicker interface têm código real.

**Type consistency:** `Client` (Task 2) usado em Tasks 3-6; `client_id` consistente em store/actions/RPC `p_client_id`; `saveNewClient`/`saveClient` consistentes Task 3↔4↔6; `getClientDonationsHistory` retorno usado em `fetchClientDonations` (Task 3) e client-profile (Task 6).

## Notas de risco
- View `clients_view` com join de `sales` + agregação de itens: validar soma no Task 1 Step 4 (risco de dupla contagem). Se `total_spent` inflar, trocar por subquery escalar como nas doações.
- `db push` precisa de rede + token; sem Docker o caminho é cloud (já configurado).
