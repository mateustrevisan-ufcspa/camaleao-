# SEC-05 · Minimização de dados pessoais expostos (3 SP)

> Como apoiadora do Instituto, eu quero que o sistema guarde e exiba apenas os meus dados que ele realmente usa, para que um eventual vazamento exponha o mínimo possível a meu respeito.

**Tipo:** user story · **Implementa:** Mateus · **Revisa:** Alissa · **Branch:** `sec-05-minimizacao-de-dados` · **Depende de:** nada para começar. Os testes do passo 7 usam a pasta `tests/acesso`, que chega à `main` com a SEC-03 (PR #11).

## Critérios de aceitação

- [ ] Deve remover o campo de CPF, que não é usado por nenhuma funcionalidade do escopo
- [ ] Deve limitar as colunas devolvidas pelas views ao que cada tela utiliza
- [ ] Deve mascarar o telefone para o perfil de balcão, exibindo apenas os últimos dígitos
- [ ] Deve registrar em documento quais dados pessoais são coletados e com que finalidade

## O problema

A modelagem de ameaças (25/09) confirmou que a view de pessoas devolvia o registro pessoal completo. A US-23 fechou quem lê cada linha. Falta fechar o que cada linha carrega:

- `clients.cpf` existe no banco, com índice e restrição de unicidade, e nenhuma tela lê nem grava esse campo.
- As funções de `lib/store.ts` pedem `select('*')` às três views. Tudo o que a view tiver vai para o navegador, use a tela ou não.
- O balcão vê o telefone inteiro de todas as pessoas cadastradas.

## Decisões

- **A máscara vale no banco, e não só na tela.** É a mesma regra da matriz de permissões: esconder na interface não protege, porque o Supabase expõe a tabela por HTTP. Mascarar só na view deixaria `GET /rest/v1/clients?select=phone` devolvendo tudo para a caixa.
- **Por que privilégio de coluna.** As políticas (RLS) decidem linha, não coluna, e coordenação e balcão são o mesmo papel no banco (`authenticated`). A saída é tirar a leitura da coluna `phone` de todo mundo e criar um único caminho de leitura, a função `telefone_da_pessoa`, que devolve o número inteiro à coordenação e `(••) •••••-1234` ao balcão.
- **Gravar continua igual.** O balcão cadastra e corrige o telefone (matriz, linha "Clientes: cadastrar e corrigir pessoa"). Só não lê de volta.
- **A tela de edição não pode gravar a máscara.** Para quem recebe o telefone mascarado, o campo abre vazio, com a máscara de dica, e só é gravado se a pessoa digitar um número novo. A view devolve `phone_masked` para a tela saber em qual caso está, e a Server Action recusa qualquer telefone com `•`.
- **O telefone deixa de ser copiado para a doação quando a pessoa tem ficha.** Hoje o formulário copia o telefone da ficha para `donor_phone`. Com a máscara, o balcão passaria a gravar `(••) •••••-1234` na doação. A trava fica na Server Action: com `client_id`, `donor_phone` vai vazio. Doador sem ficha continua informando o telefone à mão.
- **Colunas que saem das views:** `clients.notes` (nenhuma tela lê nem grava) e `registered_by` de `sales_view` e `donations_cash_view` (as telas não mostram quem registrou). As colunas continuam nas tabelas.
- **E-mail fica como está.** O critério fala de telefone. Mascarar o e-mail para o balcão entra como decisão em aberto no documento do passo 6.

## O que esta story não faz

- Não mexe na lista de pessoas que as telas de nova venda e nova doação recebem inteira. Isso sai na US-06, que troca a lista por uma busca no banco.
- Não remove `donor_phone` das tabelas de doação nem mascara esse campo nas listas de doações. O balcão só enxerga as doações lançadas no dia. Fica registrado no documento como ponto em aberto.

## 1. Branch

```bash
git checkout main && git pull
git checkout -b sec-05-minimizacao-de-dados
npm ci
```

## 2. Antes de escrever: existe CPF gravado em produção?

Remover a coluna apaga o que estiver nela, sem volta. No SQL Editor do projeto hospedado:

```sql
select count(*) as com_cpf from public.clients where cpf is not null and btrim(cpf) <> '';
```

- **Zero:** siga. Registre o resultado e a data no Pull Request.
- **Maior que zero:** pare. Não é decisão da equipe apagar dado do Instituto. Avise a Flávia, combine se ela quer uma cópia antes e registre a resposta no `PROGRESSO.md`.

A mesma pergunta vale para `notes`, que continua na tabela, só para saber se alguém usa:

```sql
select count(*) as com_observacao from public.clients where notes is not null and btrim(notes) <> '';
```

## 3. Migração nova

Arquivo novo: `supabase/migrations/20261010090000_minimizacao_de_dados.sql`. Não edite as migrações antigas.

```sql
-- SEC-05 · Minimização de dados pessoais expostos
-- O sistema passa a guardar e devolver só os dados pessoais que alguma tela usa.
-- Inventário e finalidade de cada dado: docs/privacidade/dados-pessoais.md

-- ─────────────────────────────────────────
-- 1. CPF: nenhuma funcionalidade do escopo usa. Sai a coluna, com o índice e a
--    restrição de unicidade que dependiam dela.
-- ─────────────────────────────────────────

drop index if exists public.idx_clients_cpf;
alter table public.clients drop column if exists cpf;

-- ─────────────────────────────────────────
-- 2. Telefone: a coordenação vê inteiro; o balcão vê só os quatro últimos dígitos.
-- ─────────────────────────────────────────

-- "(51) 99812-3344" vira "(••) •••••-3344". Vazio continua vazio.
create or replace function public.mascarar_telefone(p_telefone text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case
    when p_telefone is null or btrim(p_telefone) = '' then ''
    when length(regexp_replace(p_telefone, '\D', '', 'g')) < 4 then '••••'
    else '(••) •••••-' || right(regexp_replace(p_telefone, '\D', '', 'g'), 4)
  end
$$;

-- Único caminho de leitura do telefone de uma pessoa. A coluna clients.phone
-- deixa de poder ser lida direto (item 3), então é esta função que decide o que
-- cada perfil recebe. security definer: lê a coluna em nome do dono da tabela.
-- Quem não tem perfil, ou está desativado, recebe NULL.
create or replace function public.telefone_da_pessoa(p_client_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when public.eh_coordenacao() then coalesce(c.phone, '')
    when public.eh_equipe()      then public.mascarar_telefone(c.phone)
  end
  from public.clients c
  where c.id = p_client_id
$$;

revoke execute on function public.telefone_da_pessoa(uuid) from public, anon;
grant  execute on function public.telefone_da_pessoa(uuid) to authenticated;

-- ─────────────────────────────────────────
-- 3. A coluna phone sai do alcance da API.
--    Esconder o telefone só na view não bastaria: o Supabase expõe a tabela por
--    HTTP, e bastaria pedir /rest/v1/clients?select=phone. Como as políticas
--    (RLS) valem por linha, e não por coluna, a trava é de privilégio: sai a
--    leitura da tabela inteira e volta a leitura de cada coluna, menos phone.
--    Gravar continua como antes (insert e update seguem as políticas da US-23).
--
--    ATENÇÃO para as próximas migrações: coluna nova em clients não nasce com
--    leitura liberada. Quem criar coluna precisa do
--    grant select (nome_da_coluna) on public.clients to authenticated;
-- ─────────────────────────────────────────

revoke select on public.clients from anon, authenticated;

do $$
declare
  colunas text;
begin
  select string_agg(quote_ident(column_name), ', ' order by ordinal_position)
    into colunas
    from information_schema.columns
   where table_schema = 'public' and table_name = 'clients' and column_name <> 'phone';
  execute format('grant select (%s) on public.clients to authenticated', colunas);
end $$;

-- ─────────────────────────────────────────
-- 4. Views: só as colunas que alguma tela usa.
--    Saem: clients.notes (nenhuma tela lê nem grava) e registered_by das views
--    de vendas e de doações em dinheiro (as telas não mostram quem registrou).
--    Como "create or replace view" não deixa tirar coluna, as três são
--    recriadas. security_invoker continua ligado: sem ele a view ignora as
--    políticas das tabelas (US-23).
-- ─────────────────────────────────────────

drop view if exists public.clients_view;
create view public.clients_view
with (security_invoker = true) as
select
  c.id,
  c.name,
  public.telefone_da_pessoa(c.id) as phone,
  -- true quando o telefone acima veio mascarado. A tela de edição usa isto para
  -- não gravar a máscara por cima do número.
  (not public.eh_coordenacao()) as phone_masked,
  c.email,
  c.birthday,
  c.member_since,
  c.created_at,
  coalesce(array_remove(array_agg(distinct t.name), null), '{}') as tags,
  (select count(*) from public.sales s where s.client_id = c.id) as purchase_count,
  coalesce((select sum(si.amount) from public.sale_items si join public.sales s on s.id = si.sale_id where s.client_id = c.id), 0) as total_spent,
  (select max(s.sold_at) from public.sales s where s.client_id = c.id) as last_purchase_at,
  (select count(*) from public.donations_cash dc where dc.client_id = c.id)
   + (select count(*) from public.donations_items di where di.client_id = c.id)
   + (select count(*) from public.donations_caps dp where dp.client_id = c.id) as donation_count,
  coalesce((select sum(dc.amount) from public.donations_cash dc where dc.client_id = c.id), 0) as donation_total,
  greatest(
    (select max(dc.donated_at) from public.donations_cash dc where dc.client_id = c.id),
    (select max(di.donated_at) from public.donations_items di where di.client_id = c.id),
    (select max(dp.donated_at) from public.donations_caps dp where dp.client_id = c.id)
  ) as last_donation_at
from public.clients c
left join public.client_tags ct on ct.client_id = c.id
left join public.tags t on t.id = ct.tag_id
group by c.id;

drop view if exists public.sales_view;
create view public.sales_view
with (security_invoker = true) as
select
  s.id,
  s.client_id,
  s.customer_name,
  s.installments,
  s.net_amount,
  s.confirmed,
  s.sold_at,
  s.created_at,
  to_char(s.sold_at at time zone 'America/Sao_Paulo', 'HH24:MI') as time,
  pm.name as payment_method,
  b.name  as bank,
  coalesce(sum(si.amount), 0) as amount,
  coalesce(
    string_agg(coalesce(si.category_name, ic.name), ', ' order by si.created_at),
    ''
  ) as category
from public.sales s
left join public.payment_methods pm on pm.id = s.payment_method_id
left join public.banks b on b.id = s.bank_id
left join public.sale_items si on si.sale_id = s.id
left join public.item_categories ic on ic.id = si.category_id
group by s.id, pm.name, b.name;

drop view if exists public.donations_cash_view;
create view public.donations_cash_view
with (security_invoker = true) as
select
  d.id,
  d.client_id,
  d.donor_name,
  d.donor_phone,
  d.amount,
  d.frequency,
  d.donated_at,
  d.notes,
  d.created_at,
  coalesce(o.name, '') as origin
from public.donations_cash d
left join public.cash_origins o on o.id = d.origin_id;

-- Uma view recriada perde as permissões da anterior. Só quem está logado lê;
-- o que cada pessoa enxerga continua decidido pelas políticas das tabelas.
revoke all on public.clients_view, public.sales_view, public.donations_cash_view from anon;
grant select on public.clients_view, public.sales_view, public.donations_cash_view to authenticated;
```

Três cuidados que estão nos comentários e valem repetir:

1. **`security_invoker` nas três views.** Recriar a view sem essa opção desfaz a US-23: a view volta a ignorar as políticas. Os testes da SEC-03 pegam isso em `sales_view`.
2. **Coluna nova em `clients` não nasce legível.** A US-06 (apelido) já traz o `grant select (nickname)`. Quem criar coluna depois precisa do mesmo.
3. **`revoke` de `anon` nas views.** Uma view recriada volta com as permissões padrão do Supabase.

## 4. Código

Nos blocos abaixo, linha com `-` sai e linha com `+` entra. As outras são contexto, para achar o lugar.

### 4.1 `types/index.ts`

```diff
@@ -2,10 +2,12 @@ export interface Client {
   id: string
   name: string
+  // Inteiro para a coordenação; "(••) •••••-1234" para o balcão (SEC-05).
   phone: string
+  // true quando phone veio mascarado: não pode ser gravado de volta.
+  phone_masked: boolean
   email?: string
   tags: string[]
   birthday: string
   member_since: number
-  notes?: string
   purchase_count: number
   total_spent: number
```

### 4.2 `lib/store.ts`: listas de colunas no lugar de `select('*')`

As três constantes entram logo abaixo de `DAY_MS`. Depois, cada `select('*')` de `clients_view`, `sales_view` e `donations_cash_view` vira a constante correspondente (são 3, 5 e 2 trocas), e `updateClient` passa a aceitar o telefone ausente.

Cada lista precisa ser **um texto só, sem concatenar com `+`**. O `supabase-js` lê o texto do `select` para conferir os tipos e só consegue fazer isso com um literal. Com o texto quebrado em pedaços, o `tsc` acusa `GenericStringError` em todas as funções.

```diff
@@ -24,4 +24,12 @@ function brMidnightUtc(y: number, m: number, d: number): Date {
 const DAY_MS = 24 * 60 * 60 * 1000
 
+// Colunas que as telas usam de cada view (SEC-05). Nada de select('*'): coluna
+// nova na view só chega ao navegador se alguém a pedir aqui.
+// Cada lista é um texto só, sem concatenar: o supabase-js lê o texto para
+// conferir os tipos, e só consegue fazer isso com um literal.
+const COLUNAS_PESSOA = 'id, name, phone, phone_masked, email, birthday, member_since, created_at, tags, purchase_count, total_spent, last_purchase_at, donation_count, donation_total, last_donation_at'
+const COLUNAS_VENDA = 'id, time, client_id, customer_name, category, amount, payment_method, bank, installments, net_amount, confirmed, sold_at, created_at'
+const COLUNAS_DOACAO_DINHEIRO = 'id, client_id, donated_at, donor_name, donor_phone, amount, origin, frequency, notes, created_at'
+
 const MONTH_NAMES = [
   'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
@@ -33,5 +41,5 @@ export async function getClients(): Promise<Client[]> {
   const { data, error } = await supabase
     .from('clients_view')
-    .select('*')
+    .select(COLUNAS_PESSOA)
     .order('name')
 
@@ -47,5 +55,5 @@ export async function getTodaySales(): Promise<Sale[]> {
   const { data, error } = await supabase
     .from('sales_view')
-    .select('*')
+    .select(COLUNAS_VENDA)
     .gte('sold_at', today.toISOString())
     .order('sold_at')
@@ -60,5 +68,5 @@ export async function getRecentSales(limit = 8): Promise<Sale[]> {
   const { data, error } = await supabase
     .from('sales_view')
-    .select('*')
+    .select(COLUNAS_VENDA)
     .order('sold_at', { ascending: false })
     .limit(limit)
@@ -72,5 +80,5 @@ export async function getAllSales(): Promise<Sale[]> {
   const { data, error } = await supabase
     .from('sales_view')
-    .select('*')
+    .select(COLUNAS_VENDA)
     .order('sold_at', { ascending: false })
 
@@ -87,5 +95,5 @@ export async function getMonthSales(): Promise<Sale[]> {
   const { data, error } = await supabase
     .from('sales_view')
-    .select('*')
+    .select(COLUNAS_VENDA)
     .gte('sold_at', monthStart.toISOString())
     .order('sold_at', { ascending: false })
@@ -133,5 +141,5 @@ export async function addClient(
   const { data: full, error: viewError } = await supabase
     .from('clients_view')
-    .select('*')
+    .select(COLUNAS_PESSOA)
     .eq('id', client.id)
     .single()
@@ -208,11 +216,19 @@ export async function updateClientTagsStore(id: string, tags: string[]): Promise
 export async function updateClient(
   clientId: string,
-  data: { name: string; phone: string; birthday: string; email?: string; tags: string[] }
+  // phone ausente = manter o telefone que já está gravado (SEC-05).
+  data: { name: string; phone?: string; birthday: string; email?: string; tags: string[] }
 ): Promise<Client> {
   const supabase = await createClient()
 
+  const campos: { name: string; birthday: string; email: string | null; phone?: string } = {
+    name: data.name,
+    birthday: data.birthday,
+    email: data.email || null,
+  }
+  if (data.phone !== undefined) campos.phone = data.phone
+
   const { error } = await supabase
     .from('clients')
-    .update({ name: data.name, phone: data.phone, birthday: data.birthday, email: data.email || null })
+    .update(campos)
     .eq('id', clientId)
   if (error) throw new Error(error.message)
@@ -222,5 +238,5 @@ export async function updateClient(
   const { data: full, error: viewError } = await supabase
     .from('clients_view')
-    .select('*')
+    .select(COLUNAS_PESSOA)
     .eq('id', clientId)
     .single()
@@ -233,5 +249,5 @@ export async function getDonations(): Promise<DonationCash[]> {
   const { data, error } = await supabase
     .from('donations_cash_view')
-    .select('*')
+    .select(COLUNAS_DOACAO_DINHEIRO)
     .order('donated_at', { ascending: false })
 
@@ -356,5 +372,5 @@ export async function getClientSalesHistory(clientId: string): Promise<Sale[]> {
   const { data, error } = await supabase
     .from('sales_view')
-    .select('*')
+    .select(COLUNAS_VENDA)
     .eq('client_id', clientId)
     .order('sold_at', { ascending: false })
@@ -395,5 +411,5 @@ export async function getReportData(year: number) {
       .gte('sold_at', start)
       .lt('sold_at', end),
-    supabase.from('clients_view').select('*', { count: 'exact', head: true }),
+    supabase.from('clients_view').select('id', { count: 'exact', head: true }),
     supabase.from('clients_view')
       .select('created_at')
@@ -511,5 +527,5 @@ export async function addDonation(
   const { data: full, error: viewError } = await supabase
     .from('donations_cash_view')
-    .select('*')
+    .select(COLUNAS_DOACAO_DINHEIRO)
     .eq('id', inserted.id)
     .single()
```

Ao terminar, `grep -n "select('\*'" lib/store.ts` não deve achar nada.

### 4.3 `actions/clients.ts`: telefone vazio com `phone_keep` mantém o número

```diff
@@ -29,7 +29,13 @@ export async function saveClient(formData: FormData): Promise<Client> {
   const clientId = formData.get('client_id') as string
 
+  // Quem vê o telefone mascarado recebe o campo vazio e só o preenche para
+  // trocar o número. Vazio com phone_keep = manter o que está gravado.
+  const telefone = ((formData.get('phone') as string) || '').trim()
+  const manterTelefone = formData.get('phone_keep') === '1' && telefone === ''
+  if (telefone.includes('•')) throw new Error('Telefone mascarado não pode ser gravado.')
+
   const client = await updateClient(clientId, {
     name:     (formData.get('name') as string).trim(),
-    phone:    (formData.get('phone') as string) || '',
+    phone:    manterTelefone ? undefined : telefone,
     birthday: (formData.get('birthday') as string) || '',
     email:    (formData.get('email') as string) || undefined,
```

### 4.4 `components/clients/edit-client-modal.tsx`

```diff
@@ -84,5 +84,13 @@ export function EditClientModal({ client, tags, onClose, onSaved }: EditClientMo
             <div>
               <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">Telefone</label>
-              <input name="phone" type="tel" defaultValue={client.phone} placeholder="(51) 99999-9999" className="input-base" />
+              {client.phone_masked ? (
+                <>
+                  <input type="hidden" name="phone_keep" value="1" />
+                  <input name="phone" type="tel" defaultValue="" placeholder={client.phone || '(51) 99999-9999'} className="input-base" />
+                  <p className="font-body text-[11px] text-muted mt-1 m-0">Preencha só se o número mudou.</p>
+                </>
+              ) : (
+                <input name="phone" type="tel" defaultValue={client.phone} placeholder="(51) 99999-9999" className="input-base" />
+              )}
             </div>
             <div>
```

### 4.5 `actions/donations.ts`: três trocas iguais

```diff
@@ -23,5 +23,6 @@ export async function registerDonation(formData: FormData): Promise<{ error: str
       donated_at,
       donor_name:    donorName,
-      donor_phone:   (formData.get('donor_phone') as string) || '',
+      // Pessoa com ficha: o telefone fica só na ficha, não é copiado para a doação (SEC-05).
+      donor_phone:   formData.get('client_id') ? '' : ((formData.get('donor_phone') as string) || ''),
       amount,
       origin:        (formData.get('origin') as string) || 'PIX',
@@ -56,5 +57,6 @@ export async function registerDonationItem(formData: FormData): Promise<{ error:
       client_id:     (formData.get('client_id') as string) || null,
       donor_name:    donorName,
-      donor_phone:   (formData.get('donor_phone') as string) || '',
+      // Pessoa com ficha: o telefone fica só na ficha, não é copiado para a doação (SEC-05).
+      donor_phone:   formData.get('client_id') ? '' : ((formData.get('donor_phone') as string) || ''),
       category_id:   (formData.get('category_id') as string) || null,
       category_name: categoryName,
@@ -95,5 +97,6 @@ export async function registerDonationCaps(formData: FormData): Promise<{ error:
       client_id:     (formData.get('client_id') as string) || null,
       donor_name:    donorName,
-      donor_phone:   (formData.get('donor_phone') as string) || '',
+      // Pessoa com ficha: o telefone fica só na ficha, não é copiado para a doação (SEC-05).
+      donor_phone:   formData.get('client_id') ? '' : ((formData.get('donor_phone') as string) || ''),
       quantity:      quantity && quantity > 0 ? quantity : null,
       weight_kg:     weight_kg && weight_kg > 0 ? weight_kg : null,
```

## 5. `supabase/schema.sql`

O `schema.sql` é só o retrato do banco, e nenhum comando o aplica. Atualize para bater com a migração:

- na tabela `clients`, tire a linha `cpf text unique,` e, nos índices, a linha `idx_clients_cpf`;
- troque as três views pelas definições do item 4 da migração;
- acrescente as funções `mascarar_telefone` e `telefone_da_pessoa` e o bloco de privilégios do item 3.

## 6. `docs/privacidade/dados-pessoais.md`

Arquivo novo (a pasta `docs/privacidade/` também é nova). Conteúdo proposto, para você revisar contra o que encontrar no banco:

```markdown
# Dados pessoais no Camaleão Admin

**Story:** SEC-05 · Minimização de dados pessoais expostos
**Revisão:** Mateus Trevisan, DD/10/2026
**Regra:** o sistema guarda só o dado que alguma funcionalidade usa, e cada perfil recebe só o que precisa para a sua tarefa.

## De quem o sistema guarda dados

| Quem | Onde | Para quê |
| --- | --- | --- |
| Apoiadoras do Instituto (quem compra no brechó ou doa) | `clients` e os registros de venda e doação | Reconhecer a pessoa no balcão, somar a contribuição dela e, com autorização, agradecer |
| Equipe (coordenação, voluntárias e caixa) | `auth.users` e `users` | Login e controle de acesso por perfil |

## Dados das apoiadoras

| Dado | Onde fica | Finalidade | Coordenação | Balcão |
| --- | --- | --- | --- | --- |
| Nome | `clients.name` | Identificar a pessoa na busca e nos registros | vê | vê |
| Telefone | `clients.phone` | Diferenciar pessoas de mesmo nome e contato, quando autorizado | vê inteiro | vê os 4 últimos dígitos; grava, mas não lê de volta |
| E-mail | `clients.email` | Contato, quando autorizado | vê | vê (decisão em aberto) |
| Aniversário (dia e mês, sem o ano) | `clients.birthday` | Lista de aniversariantes do mês | vê | vê |
| Ano de entrada | `clients.member_since` | Mostrar desde quando a pessoa apoia o Instituto | vê | vê |
| Etiquetas | `client_tags` | Classificar o vínculo (familiar, voluntário, brechó, tampinha) | vê | vê |
| Nome e telefone de quem doa sem ter ficha | `donor_name` e `donor_phone` nas tabelas de doação | Registrar a origem da doação | vê | só nas doações lançadas hoje |
| Nome na venda | `sales.customer_name` | Manter o histórico se a ficha for apagada | vê | só nas vendas lançadas hoje |

O sistema não guarda CPF, endereço, data de nascimento completa, dado de saúde nem dado de pagamento além da forma de pagamento da venda.

## O que saiu na SEC-05

- **CPF.** A coluna `clients.cpf` existia e nenhuma tela lia nem gravava. Foi removida em DD/10/2026. Conferência antes de remover: N registros com CPF em produção.
- **Leitura direta do telefone.** A coluna `clients.phone` não pode mais ser lida pela API. O telefone sai só pela função `telefone_da_pessoa`, inteiro para a coordenação e mascarado para o balcão.
- **Colunas das views.** `clients_view` deixou de devolver `notes`; `sales_view` e `donations_cash_view` deixaram de devolver `registered_by`. As telas pedem colunas pelo nome, e não `select('*')`.
- **Telefone copiado para a doação.** Quando a doação é de alguém com ficha, o telefone fica só na ficha.

## Pontos em aberto

1. **`clients.notes`.** A coluna continua na tabela e nenhuma tela usa. Se a conferência em produção mostrar que está vazia, a proposta é removê-la.
2. **E-mail para o balcão.** Hoje o balcão vê o e-mail inteiro. Mascarar segue o mesmo desenho do telefone.
3. **`donor_phone` nas doações.** É uma cópia do telefone de quem doa sem ficha. O balcão só enxerga as doações do dia. Avaliar na reorganização das doações (US-11 a US-13).
4. **Prazo de guarda.** Por quanto tempo o Instituto quer manter a ficha de quem deixou de apoiar. Pergunta para a coordenação.

## Autorização de mensagens

O registro de quem autorizou mensagens do Instituto, com data e versão do termo, é da US-07: `docs/privacidade/termo-de-mensagens.md`.
```

Troque `DD/10/2026` e `N` pelo que você encontrar no passo 2.

## 7. Testes de acesso

Os testes entram em `tests/acesso/`, pasta criada pela SEC-03. Se o PR #11 ainda não estiver na `main`, faça os passos 3 a 6, suba a branch e acrescente os testes depois de trazer a `main`.

### 7.1 `tests/acesso/apoio.ts`

Arquivo novo, com o login pela API. O `acesso.spec.ts` da Laís não muda. A US-06 e a US-07 trazem este mesmo arquivo, igual, para que as três branches se juntem sem conflito.

```ts
// Apoio dos testes de acesso: login pela API com a chave anônima, nunca com a
// chave de serviço (que ignora todas as políticas e faria qualquer teste passar).
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { USUARIA } from '../fumaca/apoio'

const URL_API = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const CHAVE_ANONIMA = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

export const COORDENACAO = USUARIA.email
export const CAIXA = 'caixa@camaleao.local'

export async function entrarNaApi(email: string): Promise<{ api: SupabaseClient; id: string }> {
  if (!URL_API || !CHAVE_ANONIMA) {
    throw new Error('Faltam as variáveis do Supabase local. Rode npm run env:local com o banco ligado.')
  }
  if (!/127\.0\.0\.1|localhost/.test(URL_API)) {
    throw new Error(`Os testes de acesso só rodam no banco local, e o endereço configurado é ${URL_API}.`)
  }
  const api = createClient(URL_API, CHAVE_ANONIMA, { auth: { persistSession: false } })
  const { data, error } = await api.auth.signInWithPassword({ email, password: USUARIA.senha })
  if (error || !data.user) {
    throw new Error(`Login na API falhou para ${email}: ${error?.message}`)
  }
  return { api, id: data.user.id }
}

// Com as políticas, uma leitura proibida costuma voltar vazia em vez de dar erro.
export const recusado = (r: { error: unknown; data: unknown }) =>
  r.error !== null || (Array.isArray(r.data) && r.data.length === 0)
```

### 7.2 `tests/acesso/minimizacao.spec.ts`

```ts
// SEC-05 · Minimização de dados pessoais expostos.
// Confere, pela API, o que cada perfil recebe de dado pessoal.
import { test, expect } from '@playwright/test'
import type { SupabaseClient } from '@supabase/supabase-js'
import { CAIXA, COORDENACAO, entrarNaApi } from './apoio'

const MARCA = 'TESTE SEC-05'
const TELEFONE = '(51) 99876-5432'

let coordenacao: SupabaseClient
let caixa: SupabaseClient
let pessoaId: string

test.beforeAll(async () => {
  coordenacao = (await entrarNaApi(COORDENACAO)).api
  caixa = (await entrarNaApi(CAIXA)).api

  // A caixa cadastra a pessoa: gravar o telefone continua permitido ao balcão.
  const nova = await caixa.from('clients').insert({ name: MARCA, phone: TELEFONE, member_since: 2026 }).select('id').single()
  if (nova.error) throw new Error(`A caixa não conseguiu cadastrar a pessoa: ${nova.error.message}`)
  pessoaId = nova.data.id
})

test.afterAll(async () => {
  if (coordenacao) await coordenacao.from('clients').delete().like('name', `${MARCA}%`)
})

test('a coordenação vê o telefone inteiro e o balcão vê só o final', async () => {
  // Controle: o número existe e a coordenação o recebe inteiro.
  const daCoordenacao = await coordenacao.from('clients_view').select('phone, phone_masked').eq('id', pessoaId).single()
  expect(daCoordenacao.data).toEqual({ phone: TELEFONE, phone_masked: false })

  const daCaixa = await caixa.from('clients_view').select('phone, phone_masked').eq('id', pessoaId).single()
  expect(daCaixa.data).toEqual({ phone: '(••) •••••-5432', phone_masked: true })
})

test('ninguém lê a coluna phone direto da tabela', async () => {
  for (const api of [caixa, coordenacao]) {
    const direto = await api.from('clients').select('phone').eq('id', pessoaId)
    expect(direto.error, 'a coluna phone deveria estar fechada para leitura direta').not.toBeNull()

    const tudo = await api.from('clients').select('*').eq('id', pessoaId)
    expect(tudo.error, 'select * inclui phone e também deveria ser recusado').not.toBeNull()

    // As outras colunas continuam legíveis.
    const nome = await api.from('clients').select('id, name').eq('id', pessoaId).single()
    expect(nome.data?.name).toBe(MARCA)
  }
})

test('o balcão corrige o telefone sem enxergar o número antigo', async () => {
  const troca = await caixa.from('clients').update({ phone: '(51) 91111-2222' }).eq('id', pessoaId)
  expect(troca.error).toBeNull()

  const depois = await coordenacao.from('clients_view').select('phone').eq('id', pessoaId).single()
  expect(depois.data?.phone).toBe('(51) 91111-2222')
})

test('o CPF não existe mais e as views não devolvem o que as telas não usam', async () => {
  expect((await coordenacao.from('clients').select('cpf').limit(1)).error).not.toBeNull()
  expect((await coordenacao.from('clients_view').select('notes').limit(1)).error).not.toBeNull()
  expect((await coordenacao.from('sales_view').select('registered_by').limit(1)).error).not.toBeNull()
  expect((await coordenacao.from('donations_cash_view').select('registered_by').limit(1)).error).not.toBeNull()
})
```

## 8. Rodar e conferir

```bash
npm run db:reset
npm run env:local -- --force
npm run lint
npm run build
npm run test:fumaca
npm run test:acesso
```

O que observar:

- **`npm run test:acesso`** é a conferência que importa, porque passa pela API de verdade. O ponto mais delicado da story é o cadastro de pessoa com a coluna `phone` fechada: `addClient` grava com `.insert(...).select('id')`, e só funciona porque a API devolve apenas a coluna pedida. Isso foi conferido contra um PostgREST 12 na preparação do guia. Se no seu banco local o cadastro falhar com `permission denied for table clients`, pare e registre no `PROGRESSO.md`.
- **Na tela, como caixa** (`caixa@camaleao.local`): em Clientes, o telefone aparece como `(••) •••••-3344`. Em Editar, o campo de telefone abre vazio. Salve sem preencher e confira, como coordenação, que o número continua o mesmo. Depois preencha um número novo e confira que trocou.
- **Na tela, como coordenação** (`voluntaria@camaleao.local`): tudo como antes.

Conferência direto no banco, simulando a caixa:

```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

```sql
begin;
set local role authenticated;
set local request.jwt.claims = '{"sub":"00000000-0000-4000-8000-000000000003","role":"authenticated"}';
select name, phone, phone_masked from clients_view order by name limit 2;   -- (••) •••••-8899, true
select phone from clients limit 1;                                          -- ERROR: permission denied
select id, name from clients limit 1;                                       -- funciona
rollback;
```

Com o final do `sub` em `...0001` (coordenação), a primeira consulta traz o telefone inteiro e `phone_masked` falso. A segunda continua recusada: ninguém lê a coluna direto.

```bash
git add -A
git commit -m "SEC-05: CPF removido, telefone mascarado para o balcão e views com as colunas que as telas usam"
git push -u origin sec-05-minimizacao-de-dados
```

## 9. Pull Request

Título: `SEC-05 · Minimização de dados pessoais expostos`. Base: `main`. No corpo, além do modelo:

- o resultado da consulta do passo 2 (quantos CPFs havia em produção), com a data;
- a saída do `npm run test:acesso`;
- um print da ficha vista pela caixa e outro pela coordenação.

Mova o cartão para **Em revisão** e avise a Alissa no mesmo dia.

## 10. Produção

A migração é compatível com o código que está no ar hoje, então a ordem que evita tela quebrada é: **aprovação, migração em produção, merge**, os três no mesmo dia.

1. Com o PR aprovado, repita a consulta do passo 2.
2. Cole a migração no SQL Editor do projeto hospedado e rode.
3. Confira:

```sql
select count(*) from information_schema.columns
 where table_schema = 'public' and table_name = 'clients' and column_name = 'cpf';   -- 0
select relname, reloptions from pg_class where relname in ('clients_view', 'sales_view', 'donations_cash_view');   -- security_invoker=true nas três
select has_column_privilege('authenticated', 'public.clients', 'phone', 'select');   -- false
```

4. Faça o merge, mova o cartão para **Concluído** e registre no `PROGRESSO.md`.

## Revisão (Alissa)

1. `git fetch && git checkout sec-05-minimizacao-de-dados && npm ci && npm run db:reset && npm run env:local -- --force`.
2. `npm run test:acesso` na sua máquina.
3. Como caixa, abra Clientes e confira a máscara. Edite uma pessoa sem mexer no telefone, salve, e confira como coordenação que o número não mudou. Esse é o erro que mais importa pegar: a máscara gravada por cima do número.
4. Como caixa, registre uma doação escolhendo uma pessoa com ficha e confira, como coordenação, que a doação ficou sem telefone.
5. Leia `docs/privacidade/dados-pessoais.md`: a tabela bate com o que você vê nas telas?
6. Aprove no GitHub com **Approve**, no mesmo dia, e confira se a aprovação aparece no PR.

## Tarefas no Trello

1. [Mateus] Conferir em produção se existe CPF gravado e registrar o resultado
2. [Mateus] Migração: remover o CPF, fechar a leitura direta do telefone e criar `telefone_da_pessoa`
3. [Mateus] Recriar as três views só com as colunas usadas, mantendo `security_invoker`
4. [Mateus] Trocar `select('*')` por listas de colunas em `lib/store.ts`
5. [Mateus] Tela de edição e Server Actions: não gravar a máscara e não copiar o telefone para a doação
6. [Mateus] Escrever `docs/privacidade/dados-pessoais.md` e atualizar `supabase/schema.sql`
7. [Mateus] Testes de acesso da SEC-05 em `tests/acesso/`
8. [Alissa] Revisar rodando como caixa e como coordenação, e aprovar no GitHub
9. [Mateus] Aplicar a migração em produção depois da aprovação, fazer o merge e mover o cartão
