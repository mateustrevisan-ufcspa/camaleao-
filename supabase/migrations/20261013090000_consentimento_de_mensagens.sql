-- US-07 · Contato e consentimento de mensagens
-- Registro de quem autorizou, ou deixou de autorizar, mensagens do Instituto.
-- Texto e versões do termo: docs/privacidade/termo-de-mensagens.md

-- ─────────────────────────────────────────
-- 1. Registro de autorização. Só cresce: cada linha é uma decisão da pessoa
--    (autorizou ou retirou), com data, versão do termo e quem registrou.
--    A situação atual é sempre a linha mais recente. Ninguém altera nem apaga
--    uma linha, nem a coordenação: é o histórico que comprova o consentimento.
-- ─────────────────────────────────────────

create table public.message_consents (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients(id) on delete cascade,
  authorized   boolean not null,
  term_version text not null check (btrim(term_version) <> ''),
  recorded_at  timestamptz not null default now(),
  recorded_by  uuid references public.users(id) on delete set null
);

create index idx_message_consents_client on public.message_consents (client_id, recorded_at desc);

-- Data e autoria são do servidor: quem registra não escolhe nenhuma das duas.
create or replace function public.message_consents_carimbo()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.recorded_at := clock_timestamp();
  new.recorded_by := auth.uid();
  return new;
end;
$$;

create trigger message_consents_carimbo
  before insert on public.message_consents
  for each row execute function public.message_consents_carimbo();

alter table public.message_consents enable row level security;

create policy "equipe le" on public.message_consents
  for select to authenticated using (public.eh_equipe());
create policy "equipe registra" on public.message_consents
  for insert to authenticated with check (public.eh_equipe());
-- Sem política de update nem de delete: ninguém altera nem apaga pela API.
revoke all on public.message_consents from anon;
revoke update, delete, truncate on public.message_consents from authenticated;

-- ─────────────────────────────────────────
-- 2. Situação atual de cada pessoa: a decisão mais recente.
--    Quem nunca foi perguntada não aparece aqui, e não aparecer conta como
--    "não autorizou".
-- ─────────────────────────────────────────

create view public.message_consent_status
with (security_invoker = true) as
select distinct on (mc.client_id)
  mc.client_id,
  mc.authorized,
  mc.term_version,
  mc.recorded_at
from public.message_consents mc
order by mc.client_id, mc.recorded_at desc, mc.id desc;

revoke all on public.message_consent_status from anon;
grant select on public.message_consent_status to authenticated;

-- ─────────────────────────────────────────
-- 3. A trava do envio. Toda funcionalidade que mandar mensagem (agradecimento,
--    aniversário, campanha) monta a lista de destinatários a partir desta view,
--    e de nenhum outro lugar. Quem não autorizou, ou retirou a autorização, não
--    está nela.
-- ─────────────────────────────────────────

create view public.message_recipients
with (security_invoker = true) as
select
  c.id   as client_id,
  c.name,
  st.term_version,
  st.recorded_at as authorized_at
from public.clients c
join public.message_consent_status st on st.client_id = c.id
where st.authorized is true;

revoke all on public.message_recipients from anon;
grant select on public.message_recipients to authenticated;

-- Para conferir uma pessoa só, na hora de enviar.
create or replace function public.pode_receber_mensagem(p_client_id uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce(
    (select st.authorized from public.message_consent_status st where st.client_id = p_client_id),
    false
  )
$$;
