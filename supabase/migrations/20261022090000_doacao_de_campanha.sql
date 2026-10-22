-- US-13 · Doação vinculada a uma campanha
-- Campanhas do Instituto (Adapta, Natalenço), com período e custo estimado, e
-- doação em dinheiro ligada a uma delas. Mostra arrecadado, custo e diferença.

-- ─────────────────────────────────────────
-- 1. Campanhas. A equipe lê (para escolher na doação); a coordenação cadastra,
--    altera e apaga. Campanha com doação não é apagada: encerra.
--    Encerrar só marca a data (closed_at): o histórico continua acessível.
-- ─────────────────────────────────────────

create table public.campaigns (
  id             uuid primary key default gen_random_uuid(),
  name           text not null check (btrim(name) <> ''),
  starts_on      date not null,
  ends_on        date,
  estimated_cost numeric not null default 0 check (estimated_cost >= 0),
  closed_at      timestamptz,
  created_at     timestamptz not null default now(),
  created_by     uuid default auth.uid() references public.users(id) on delete set null,
  check (ends_on is null or ends_on >= starts_on)
);

alter table public.campaigns enable row level security;

create policy "equipe le" on public.campaigns
  for select to authenticated using (public.eh_equipe());
create policy "coordenacao cadastra" on public.campaigns
  for insert to authenticated with check (public.eh_coordenacao());
create policy "coordenacao altera" on public.campaigns
  for update to authenticated using (public.eh_coordenacao()) with check (public.eh_coordenacao());
create policy "coordenacao apaga" on public.campaigns
  for delete to authenticated using (public.eh_coordenacao());

revoke all on public.campaigns from anon;

-- ─────────────────────────────────────────
-- 2. Doação em dinheiro com campanha, opcional. Uma doação é de um evento ou
--    de uma campanha, nunca dos dois.
-- ─────────────────────────────────────────

alter table public.donations_cash
  add column if not exists campaign_id uuid references public.campaigns(id) on delete restrict;

alter table public.donations_cash
  add constraint donations_cash_evento_ou_campanha check (event_id is null or campaign_id is null);

create index if not exists idx_dcash_campaign_id on public.donations_cash (campaign_id);

-- ─────────────────────────────────────────
-- 3. A view de doações em dinheiro passa a trazer a campanha. Recriada, como na
--    US-12, com security_invoker.
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
  coalesce(e.name, '') as event_name,
  d.campaign_id,
  coalesce(c.name, '') as campaign_name
from public.donations_cash d
left join public.cash_origins o on o.id = d.origin_id
left join public.events e on e.id = d.event_id
left join public.campaigns c on c.id = d.campaign_id;

-- ─────────────────────────────────────────
-- 4. Arrecadado, custo e diferença por campanha. security_invoker: soma só as
--    doações que quem consulta enxerga (a coordenação, todas).
-- ─────────────────────────────────────────

create view public.campaigns_totals
with (security_invoker = true) as
select
  c.id,
  c.name,
  c.starts_on,
  c.ends_on,
  c.estimated_cost,
  c.closed_at,
  count(d.id)::int as donation_count,
  coalesce(sum(d.amount), 0) as raised,
  coalesce(sum(d.amount), 0) - c.estimated_cost as difference
from public.campaigns c
left join public.donations_cash d on d.campaign_id = c.id
group by c.id;

-- Uma view recriada perde as permissões da anterior. Só quem está logado lê.
revoke all on public.donations_cash_view, public.campaigns_totals from anon;
grant select on public.donations_cash_view, public.campaigns_totals to authenticated;