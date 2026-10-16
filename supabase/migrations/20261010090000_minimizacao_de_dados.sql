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
