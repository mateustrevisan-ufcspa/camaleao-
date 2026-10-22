-- US-11 · Doação de itens com categorias editáveis
-- Categorias que faltavam, peso opcional na doação de item e as tampinhas
-- levadas para as doações de item.

-- ─────────────────────────────────────────
-- 1. Categorias pedidas pelo Instituto em 03/09/2026. Lenço e as roupas
--    (blusa, vestido, calça...) já existem.
-- ─────────────────────────────────────────

insert into public.item_categories (name, type) values
  ('tampinha', 'donation'),
  ('peruca',   'donation'),
  ('batom',    'donation')
on conflict (name) do nothing;

-- ─────────────────────────────────────────
-- 2. Peso opcional. A quantidade já aceitava vazio no banco; a obrigação
--    estava só no formulário.
-- ─────────────────────────────────────────

alter table public.donations_items
  add column if not exists weight_kg numeric check (weight_kg > 0);

-- ─────────────────────────────────────────
-- 3. Tampinhas viram doação de item da categoria "tampinha", com o mesmo id,
--    a mesma pessoa, as mesmas datas e quem registrou. O id igual deixa a
--    mesclagem de fichas (US-08b) achar o registro ao desfazer uma mesclagem
--    feita antes desta migração.
-- ─────────────────────────────────────────

insert into public.donations_items (
  id, client_id, donor_name, donor_phone, category_id, category_name,
  quantity, weight_kg, notes, registered_by, donated_at, created_at
)
select
  dc.id, dc.client_id, dc.donor_name, dc.donor_phone,
  (select ic.id from public.item_categories ic where ic.name = 'tampinha'),
  'tampinha',
  dc.quantity, dc.weight_kg, dc.notes, dc.registered_by, dc.donated_at, dc.created_at
from public.donations_caps dc
on conflict (id) do nothing;

delete from public.donations_caps dc
 where exists (select 1 from public.donations_items di where di.id = dc.id);

-- ─────────────────────────────────────────
-- 4. A tabela de tampinhas fica congelada: continua existindo (a clients_view,
--    a busca e a mesclagem ainda a citam), mas ninguém grava nela.
-- ─────────────────────────────────────────

drop policy if exists "equipe registra em seu nome" on public.donations_caps;
revoke insert, update on public.donations_caps from authenticated;

comment on table public.donations_caps is
  'Congelada desde a US-11 (Sprint 4): tampinhas são doações de item da categoria tampinha. Remover em story futura.';