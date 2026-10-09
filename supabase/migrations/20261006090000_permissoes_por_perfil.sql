-- US-23 · Permissões por perfil de usuário
-- Troca "qualquer autenticado lê e escreve tudo" por regras por perfil, negando por padrão.
-- Perfis (users.role): admin = coordenação; volunteer e cashier = balcão.
-- Matriz: docs/seguranca/matriz-de-permissoes.md

-- ─────────────────────────────────────────
-- 1. Funções de apoio
-- ─────────────────────────────────────────

-- Papel de quem está logado. Devolve NULL para quem não tem perfil ou está
-- desativado, e NULL não passa em nenhuma política: é o "negar por padrão".
-- security definer: lê public.users sem passar pelas políticas da própria
-- tabela. Sem isso, a política de users chamaria esta função, que leria users,
-- que chamaria a política de novo.
create or replace function public.auth_role()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select u.role from public.users u where u.id = auth.uid() and u.active is true
$$;

create or replace function public.eh_coordenacao()
returns boolean
language sql
stable
as $$ select coalesce(public.auth_role() = 'admin', false) $$;

-- Qualquer pessoa com perfil e ativa: coordenação ou balcão.
create or replace function public.eh_equipe()
returns boolean
language sql
stable
as $$ select public.auth_role() is not null $$;

-- A partir de quando o balcão enxerga vendas e doações: 00:00 de hoje em São Paulo.
-- Se a matriz mudar (por exemplo, para a semana), muda só esta função.
create or replace function public.balcao_le_desde()
returns timestamptz
language sql
stable
as $$
  select date_trunc('day', now() at time zone 'America/Sao_Paulo') at time zone 'America/Sao_Paulo'
$$;

-- ─────────────────────────────────────────
-- 2. Sai o que valia para qualquer autenticado
-- ─────────────────────────────────────────

drop policy if exists "authenticated read" on public.users;
drop policy if exists "authenticated read" on public.tags;
drop policy if exists "authenticated read" on public.payment_methods;
drop policy if exists "authenticated read" on public.banks;
drop policy if exists "authenticated read" on public.item_categories;
drop policy if exists "authenticated read" on public.cash_origins;
drop policy if exists "authenticated read" on public.clients;
drop policy if exists "authenticated read" on public.client_tags;
drop policy if exists "authenticated read" on public.sales;
drop policy if exists "authenticated read" on public.sale_items;
drop policy if exists "authenticated read" on public.donations_cash;
drop policy if exists "authenticated read" on public.donations_items;
drop policy if exists "authenticated read" on public.donations_caps;

drop policy if exists "authenticated write" on public.clients;
drop policy if exists "authenticated write" on public.client_tags;
drop policy if exists "authenticated write" on public.sales;
drop policy if exists "authenticated write" on public.sale_items;
drop policy if exists "authenticated write" on public.donations_cash;
drop policy if exists "authenticated write" on public.donations_items;
drop policy if exists "authenticated write" on public.donations_caps;

-- As políticas "admin write" das tabelas de configuração continuam. Elas usam
-- auth_role(), então passam a exigir também que o admin esteja ativo.

-- ─────────────────────────────────────────
-- 3. Usuários: cada pessoa lê a própria linha; a coordenação lê todas.
--    Sem política de escrita: ninguém altera usuários pela API.
-- ─────────────────────────────────────────

create policy "le o proprio perfil ou coordenacao" on public.users
  for select to authenticated
  using (id = auth.uid() or public.eh_coordenacao());

-- ─────────────────────────────────────────
-- 4. Configuração: a equipe lê (os formulários precisam); só a coordenação altera.
-- ─────────────────────────────────────────

create policy "equipe le" on public.tags            for select to authenticated using (public.eh_equipe());
create policy "equipe le" on public.payment_methods for select to authenticated using (public.eh_equipe());
create policy "equipe le" on public.banks           for select to authenticated using (public.eh_equipe());
create policy "equipe le" on public.item_categories for select to authenticated using (public.eh_equipe());
create policy "equipe le" on public.cash_origins    for select to authenticated using (public.eh_equipe());

-- ─────────────────────────────────────────
-- 5. Pessoas: a equipe busca, cadastra e corrige; só a coordenação apaga.
-- ─────────────────────────────────────────

create policy "equipe le" on public.clients
  for select to authenticated using (public.eh_equipe());
create policy "equipe cadastra" on public.clients
  for insert to authenticated with check (public.eh_equipe());
create policy "equipe corrige" on public.clients
  for update to authenticated using (public.eh_equipe()) with check (public.eh_equipe());
create policy "coordenacao apaga" on public.clients
  for delete to authenticated using (public.eh_coordenacao());

-- Etiquetas da pessoa: corrigir o cadastro troca as etiquetas (apaga e insere).
create policy "equipe le" on public.client_tags
  for select to authenticated using (public.eh_equipe());
create policy "equipe marca" on public.client_tags
  for insert to authenticated with check (public.eh_equipe());
create policy "equipe desmarca" on public.client_tags
  for delete to authenticated using (public.eh_equipe());

-- ─────────────────────────────────────────
-- 6. Vendas: a equipe registra; o balcão lê só o que foi lançado hoje;
--    alterar e apagar é da coordenação.
-- ─────────────────────────────────────────

create policy "coordenacao le tudo, balcao le o dia" on public.sales
  for select to authenticated
  using (
    public.eh_coordenacao()
    or (public.eh_equipe() and created_at >= public.balcao_le_desde())
  );
create policy "equipe registra em seu nome" on public.sales
  for insert to authenticated
  with check (public.eh_equipe() and (registered_by is null or registered_by = auth.uid()));
create policy "coordenacao altera" on public.sales
  for update to authenticated using (public.eh_coordenacao()) with check (public.eh_coordenacao());
create policy "coordenacao apaga" on public.sales
  for delete to authenticated using (public.eh_coordenacao());

-- Itens seguem a venda: quem enxerga a venda enxerga os itens dela.
-- A subconsulta em sales passa pelas políticas de sales de quem está consultando.
create policy "le os itens das vendas que enxerga" on public.sale_items
  for select to authenticated
  using (exists (select 1 from public.sales s where s.id = sale_items.sale_id));
create policy "equipe registra itens" on public.sale_items
  for insert to authenticated
  with check (
    public.eh_equipe()
    and exists (select 1 from public.sales s where s.id = sale_items.sale_id)
  );
create policy "coordenacao altera" on public.sale_items
  for update to authenticated using (public.eh_coordenacao()) with check (public.eh_coordenacao());
create policy "coordenacao apaga" on public.sale_items
  for delete to authenticated using (public.eh_coordenacao());

-- ─────────────────────────────────────────
-- 7. Doações (dinheiro, itens, tampinhas): mesma regra das vendas.
-- ─────────────────────────────────────────

create policy "coordenacao le tudo, balcao le o dia" on public.donations_cash
  for select to authenticated
  using (
    public.eh_coordenacao()
    or (public.eh_equipe() and created_at >= public.balcao_le_desde())
  );
create policy "equipe registra em seu nome" on public.donations_cash
  for insert to authenticated
  with check (public.eh_equipe() and (registered_by is null or registered_by = auth.uid()));
create policy "coordenacao altera" on public.donations_cash
  for update to authenticated using (public.eh_coordenacao()) with check (public.eh_coordenacao());
create policy "coordenacao apaga" on public.donations_cash
  for delete to authenticated using (public.eh_coordenacao());

create policy "coordenacao le tudo, balcao le o dia" on public.donations_items
  for select to authenticated
  using (
    public.eh_coordenacao()
    or (public.eh_equipe() and created_at >= public.balcao_le_desde())
  );
create policy "equipe registra em seu nome" on public.donations_items
  for insert to authenticated
  with check (public.eh_equipe() and (registered_by is null or registered_by = auth.uid()));
create policy "coordenacao altera" on public.donations_items
  for update to authenticated using (public.eh_coordenacao()) with check (public.eh_coordenacao());
create policy "coordenacao apaga" on public.donations_items
  for delete to authenticated using (public.eh_coordenacao());

create policy "coordenacao le tudo, balcao le o dia" on public.donations_caps
  for select to authenticated
  using (
    public.eh_coordenacao()
    or (public.eh_equipe() and created_at >= public.balcao_le_desde())
  );
create policy "equipe registra em seu nome" on public.donations_caps
  for insert to authenticated
  with check (public.eh_equipe() and (registered_by is null or registered_by = auth.uid()));
create policy "coordenacao altera" on public.donations_caps
  for update to authenticated using (public.eh_coordenacao()) with check (public.eh_coordenacao());
create policy "coordenacao apaga" on public.donations_caps
  for delete to authenticated using (public.eh_coordenacao());

-- ─────────────────────────────────────────
-- 8. Views: passam a respeitar as políticas de quem consulta.
--    Por padrão uma view roda com a permissão de quem a criou e ignora as
--    políticas das tabelas. Sem isto, as tabelas ficariam fechadas e as views
--    continuariam devolvendo tudo.
-- ─────────────────────────────────────────

alter view public.clients_view        set (security_invoker = true);
alter view public.sales_view          set (security_invoker = true);
alter view public.donations_cash_view set (security_invoker = true);
