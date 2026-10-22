-- US-12 · Doação vinculada a um evento
-- Eventos do Instituto (festa, jantar) e doação em dinheiro ligada a um deles.

-- ─────────────────────────────────────────
-- 1. Eventos. A equipe lê (para escolher na doação); a coordenação cadastra,
--    altera e apaga. Evento com doação não é apagado: desativa.
-- ─────────────────────────────────────────

create table public.events (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (btrim(name) <> ''),
  event_date date not null,
  active     boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid() references public.users(id) on delete set null
);

alter table public.events enable row level security;

create policy "equipe le" on public.events
  for select to authenticated using (public.eh_equipe());
create policy "coordenacao cadastra" on public.events
  for insert to authenticated with check (public.eh_coordenacao());
create policy "coordenacao altera" on public.events
  for update to authenticated using (public.eh_coordenacao()) with check (public.eh_coordenacao());
create policy "coordenacao apaga" on public.events
  for delete to authenticated using (public.eh_coordenacao());

revoke all on public.events from anon;

-- ─────────────────────────────────────────
-- 2. Doação em dinheiro com evento, opcional. Sem evento, tudo como antes.
-- ─────────────────────────────────────────

alter table public.donations_cash
  add column if not exists event_id uuid references public.events(id) on delete restrict;

create index if not exists idx_dcash_event_id on public.donations_cash (event_id);

-- ─────────────────────────────────────────
-- 3. A view de doações em dinheiro passa a trazer o evento. Como "create or
--    replace view" não deixa mudar colunas no meio, ela é recriada, com
--    security_invoker (sem ele a view ignora as políticas: US-23).
-- ─────────────────────────────────────────

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
  coalesce(o.name, '') as origin,
  d.event_id,
  coalesce(e.name, '') as event_name
from public.donations_cash d
left join public.cash_origins o on o.id = d.origin_id
left join public.events e on e.id = d.event_id;

-- ─────────────────────────────────────────
-- 4. Total arrecadado por evento. security_invoker: soma só as doações que
--    quem consulta enxerga (a coordenação, todas).
-- ─────────────────────────────────────────

create view public.events_totals
with (security_invoker = true) as
select
  e.id,
  e.name,
  e.event_date,
  e.active,
  count(d.id)::int as donation_count,
  coalesce(sum(d.amount), 0) as total
from public.events e
left join public.donations_cash d on d.event_id = e.id
group by e.id;

-- Uma view recriada perde as permissões da anterior. Só quem está logado lê.
revoke all on public.donations_cash_view, public.events_totals from anon;
grant select on public.donations_cash_view, public.events_totals to authenticated;