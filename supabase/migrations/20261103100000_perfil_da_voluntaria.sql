-- US-28 · Perfil de voluntária sem dinheiro e sem caixa
-- A voluntária (volunteer) deixa de ler e de registrar vendas, itens de venda e
-- doações em dinheiro. O caixa (cashier) continua como na US-23. Doações de item,
-- tampinhas, fichas e busca continuam iguais para as duas.

-- ─────────────────────────────────────────
-- 1. Caixa ou coordenação. Como eh_coordenacao, usa auth_role (security definer)
--    e devolve false para quem não tem perfil ou está desativado.
-- ─────────────────────────────────────────

create or replace function public.eh_caixa_ou_coordenacao()
returns boolean
language sql
stable
as $$ select coalesce(public.auth_role() in ('admin', 'cashier'), false) $$;

-- ─────────────────────────────────────────
-- 2. Vendas: o caixa lê o que foi lançado hoje e registra em seu nome.
--    Alterar e apagar continuam só da coordenação (políticas da US-23).
-- ─────────────────────────────────────────

drop policy if exists "coordenacao le tudo, balcao le o dia" on public.sales;
create policy "coordenacao le tudo, caixa le o dia" on public.sales
  for select to authenticated
  using (
    public.eh_coordenacao()
    or (public.eh_caixa_ou_coordenacao() and created_at >= public.balcao_le_desde())
  );

drop policy if exists "equipe registra em seu nome" on public.sales;
create policy "caixa registra em seu nome" on public.sales
  for insert to authenticated
  with check (public.eh_caixa_ou_coordenacao() and (registered_by is null or registered_by = auth.uid()));

-- ─────────────────────────────────────────
-- 3. Itens de venda: a leitura segue a venda (política da US-23, sem mudança,
--    porque a subconsulta em sales já passa pela política nova).
-- ─────────────────────────────────────────

drop policy if exists "equipe registra itens" on public.sale_items;
create policy "caixa registra itens" on public.sale_items
  for insert to authenticated
  with check (
    public.eh_caixa_ou_coordenacao()
    and exists (select 1 from public.sales s where s.id = sale_items.sale_id)
  );

-- ─────────────────────────────────────────
-- 4. Doações em dinheiro: mesma regra das vendas.
-- ─────────────────────────────────────────

drop policy if exists "coordenacao le tudo, balcao le o dia" on public.donations_cash;
create policy "coordenacao le tudo, caixa le o dia" on public.donations_cash
  for select to authenticated
  using (
    public.eh_coordenacao()
    or (public.eh_caixa_ou_coordenacao() and created_at >= public.balcao_le_desde())
  );

drop policy if exists "equipe registra em seu nome" on public.donations_cash;
create policy "caixa registra em seu nome" on public.donations_cash
  for insert to authenticated
  with check (public.eh_caixa_ou_coordenacao() and (registered_by is null or registered_by = auth.uid()));