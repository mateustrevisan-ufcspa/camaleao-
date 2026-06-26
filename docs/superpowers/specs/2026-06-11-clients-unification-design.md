# Unificação de pessoas em `clients`

**Data:** 2026-06-11
**Branch:** `feat/clients-unification`

## Problema

O modelo atual separa pessoa em duas tabelas: `supporters` (doadores) e
`customers` (compradoras do brechó, extensão de supporter). Consequências:

- Registrar venda força criar `supporter` + `customer` e vincular.
- Doações guardam doador como **texto livre** (`donor_name`) — não viram ficha,
  não têm tags nem histórico.
- Tags só existem no lado `customers`.
- Mesma pessoa que compra e doa vira dois registros desconexos.

O usuário quer **uma tabela de pessoa**, com tudo vinculado a ela, e **uma tela**
pra gerenciar info/tags/histórico.

> Contexto operacional: no momento do design o banco estava **vazio** (todas as
> tabelas públicas zeradas, provável `db reset`; só o auth user persiste). Logo
> não há dados de produção a migrar — a reestruturação é limpa e inclui re-seed.

## Decisões (aprovadas)

1. **Tabela única `clients`** substitui `supporters` + `customers`.
2. **Agregados via view** (`clients_view`), calculados em tempo real de
   `sales` + `donations_*`. `register_sale` deixa de atualizar stats.
3. **"Clientes" como item de topo** no menu; tela única gerencia todos.
4. **Picker compartilhado buscar-ou-criar + anônimo** em venda e nas 3 doações.

## Modelo de dados

### Tabelas novas

```sql
create table clients (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  phone        text,
  email        text,
  cpf          text unique,
  birthday     text,                 -- formato dd/mm (mantém convenção atual)
  member_since int,
  notes        text,
  created_at   timestamptz default now()
);

create table client_tags (
  client_id uuid references clients(id) on delete cascade,
  tag_id    uuid references tags(id)    on delete cascade,
  primary key (client_id, tag_id)
);
```

### FKs religadas (todas nullable → avulso/anônimo)

- `sales.client_id            uuid references clients(id) on delete set null`
- `donations_cash.client_id   uuid references clients(id) on delete set null`
- `donations_items.client_id  uuid references clients(id) on delete set null`
- `donations_caps.client_id   uuid references clients(id) on delete set null`

Colunas desnormalizadas de snapshot **permanecem** para preservar histórico se o
cliente for desvinculado: `sales.customer_name`, `donations_*.donor_name`,
`donations_*.donor_phone`. As colunas `*.supporter_id` / `sales.customer_id` saem.

### `clients_view`

```
id, name, phone, email, birthday, member_since, notes, created_at,
tags             text[]      -- agregado de client_tags
purchase_count   int         -- count(sales)
total_spent      numeric     -- sum(sale_items.amount) das vendas do cliente
last_purchase_at timestamptz
donation_count   int         -- dinheiro + itens + tampinhas
donation_total   numeric     -- soma R$ de donations_cash
last_donation_at timestamptz -- máximo donated_at entre os 3 tipos
```

### `register_sale`

Troca `p_customer_id`→`p_client_id`, grava `sales.client_id`, e **remove** o
bloco que atualizava `purchase_count/total_spent/last_purchase_at` (a view calcula).

### Objetos removidos

`supporters`, `customers`, `customer_tags`, `customers_view`. Índices e policies
correspondentes. `donations_cash_view` **permanece inalterada** (só junta
`cash_origins`, não referencia pessoa).

## Componentes (frontend)

### `<ClientPicker>` (novo, compartilhado)

Extraído da busca de compradora do form de venda + `NewCustomerModal`.
- Busca por nome/telefone (client-side sobre lista carregada).
- "Cadastrar novo" inline (modal) → cria `client` e já seleciona.
- Botão "Anônimo / avulso" → `client_id = null`, usa nome digitado/"Anônimo".
- Props: `clients`, `tags`, `value`, `onChange`, `allowAnonymous`.
- Reusado em: `new-sale-form`, `new-donation-form`, `new-donation-item-form`,
  `new-donation-caps-form`.

### Tela Clientes (`/clientes`)

Substitui `/brecho/compradoras`. Lista filtrável + perfil. Perfil mostra:
- Info + tags (editáveis via modal — reaproveita `EditCustomerModal` → `EditClientModal`).
- **Histórico de compras** e **histórico de doações** (dinheiro/itens/tampinhas).
- Stats da `clients_view`.

### Navegação

`sidebar.tsx` topNav: Brechó · Doações · **Clientes** · Relatórios.
Remove subitem "Compradoras" de `brechoSub`.

## Impacto por arquivo

**Banco:** nova migration `supabase/migrations/<ts>_clients_unification.sql`;
atualizar `supabase/schema.sql` como canônico.

**Store (`lib/store.ts`):** renomear/ajustar `getCustomers→getClients`,
`addCustomer→addClient`, `updateCustomer→updateClient`,
`getCustomerSalesHistory→getClientSalesHistory` + novo `getClientDonationsHistory`.
View alvo `clients_view`. `addSale` passa `client_id`. Adders de doação passam `client_id`.

**Actions:** `actions/customers.ts`→`actions/clients.ts`. Para evitar colisão com
`createClient` do Supabase, os server actions chamam-se **`saveNewClient`** e
**`saveClient`** (não `createClient`). `actions/sales.ts` e `actions/donations.ts`
passam `client_id`.

**Tipos:** `Customer`→`Client` (campos da view); doações ganham `client_id?`.

**Componentes:** novo `ClientPicker`; `customers-page-client`→`clients-page-client`;
`customer-profile`→`client-profile` (+ histórico de doações); `customers-list`→
`clients-list`; `new-customer-modal`→`new-client-modal`; `edit-customer-modal`→
`edit-client-modal`. Forms de venda/doação usam `ClientPicker`.

**Rotas:** criar `app/(admin)/clientes/page.tsx`; remover
`app/(admin)/brecho/compradoras/`.

## Migração + re-seed

1. Migration aplica o novo schema (drop antigos, cria `clients`/`client_tags`,
   altera FKs, recria view + RPC, RLS).
2. Re-seed de lookups (tags, payment_methods, banks, item_categories,
   cash_origins) — incluído na migration (como hoje).
3. Re-criar linha em `users` para o auth user existente
   (`ad54e844-0dfe-4e56-8162-6a3661ea1d4d`, admin).
4. Script JS de dados de exemplo (clientes + vendas + doações vinculadas) pra demo.

## RLS

Replicar políticas de `customers`/`supporters` para `clients`/`client_tags`:
`authenticated read` (select) + `authenticated write` (all). Remover policies
das tabelas antigas.

## Erros + testes

- Forms mantêm retorno `{ error }` + banner de feedback.
- Teste de fluxo sob RLS (usuário autenticado, não service_role):
  criar cliente → venda vinculada → doação vinculada → anônimo (client_id null) →
  edição de info/tags → `clients_view` agregando compras+doações corretamente.
- `npm run build` limpo.

## Fora de escopo (YAGNI)

Merge de clientes duplicados, import em massa, soft-delete/auditoria, doações no
relatório consolidado (task separada).
