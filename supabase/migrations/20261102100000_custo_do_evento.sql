-- US-33 · Custo do evento
-- A coordenação informa o custo do evento, em geral no fim dele. A tela mostra
-- arrecadado, custo e diferença, como na campanha (US-13).

-- ─────────────────────────────────────────
-- 1. Custo, começando em zero. Só a coordenação altera: a política
--    "coordenacao altera" da US-12 já vale para a coluna nova.
-- ─────────────────────────────────────────

alter table public.events
  add column if not exists cost numeric not null default 0 check (cost >= 0);

-- ─────────────────────────────────────────
-- 2. Total por evento com custo e diferença. Recriada com security_invoker,
--    como na US-12: soma só as doações que quem consulta enxerga.
-- ─────────────────────────────────────────

drop view if exists public.events_totals;
create view public.events_totals
with (security_invoker = true) as
select
  e.id,
  e.name,
  e.event_date,
  e.active,
  e.cost,
  count(d.id)::int as donation_count,
  coalesce(sum(d.amount), 0) as total,
  coalesce(sum(d.amount), 0) - e.cost as difference
from public.events e
left join public.donations_cash d on d.event_id = e.id
group by e.id;

-- Uma view recriada perde as permissões da anterior. Só quem está logado lê.
revoke all on public.events_totals from anon;
grant select on public.events_totals to authenticated;
