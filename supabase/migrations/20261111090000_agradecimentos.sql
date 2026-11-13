-- US-21a · Agradecimento com um clique, uma vez por período
-- Aprovação do termo pelo Instituto, a lista de quem pode receber agradecimento
-- e o registro de cada agradecimento, com a trava de um por período.

-- ─────────────────────────────────────────
-- 1. Aprovação do termo de mensagens pelo Instituto. Uma linha por versão.
--    Ninguém altera nem apaga: é o registro de que o Instituto aprovou.
-- ─────────────────────────────────────────

create table public.aprovacoes_do_termo (
  versao         text primary key check (btrim(versao) <> ''),
  aprovado_em    date not null,
  observacao     text check (observacao is null or length(observacao) <= 300),
  registrado_em  timestamptz not null default now(),
  registrado_por uuid references public.users(id) on delete set null
);

create or replace function public.carimbar_aprovacao_do_termo()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.registrado_em := now();
  new.registrado_por := auth.uid();
  if new.aprovado_em > (now() at time zone 'America/Sao_Paulo')::date then
    raise exception 'A data da aprovação não pode ser depois de hoje.' using errcode = '22023';
  end if;
  return new;
end;
$$;

create trigger carimbo_da_aprovacao_do_termo
  before insert on public.aprovacoes_do_termo
  for each row execute function public.carimbar_aprovacao_do_termo();

alter table public.aprovacoes_do_termo enable row level security;

create policy "coordenacao le" on public.aprovacoes_do_termo
  for select to authenticated using (public.eh_coordenacao());
create policy "coordenacao registra" on public.aprovacoes_do_termo
  for insert to authenticated with check (public.eh_coordenacao());

revoke all on public.aprovacoes_do_termo from anon;
grant select, insert on public.aprovacoes_do_termo to authenticated;

-- ─────────────────────────────────────────
-- 2. Quem pode receber agradecimento: está na lista da US-07 e autorizou uma
--    versão aprovada. security_invoker: só a coordenação lê as aprovações,
--    então só ela recebe linhas.
-- ─────────────────────────────────────────

create view public.destinatarios_do_agradecimento
with (security_invoker = true) as
select r.client_id, r.name, r.term_version, r.authorized_at
from public.message_recipients r
join public.aprovacoes_do_termo a on a.versao = r.term_version;

revoke all on public.destinatarios_do_agradecimento from anon;
grant select on public.destinatarios_do_agradecimento to authenticated;

-- ─────────────────────────────────────────
-- 3. Agradecimentos. Um por pessoa e por período (mês AAAA-MM, ou ano AAAA se
--    o Instituto preferir). Ninguém altera nem apaga.
-- ─────────────────────────────────────────

create table public.agradecimentos (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients(id) on delete cascade,
  periodo      text not null check (periodo ~ '^\d{4}(-(0[1-9]|1[0-2]))?$'),
  canal        text not null check (canal in ('whatsapp', 'email')),
  term_version text not null,
  enviado_em   timestamptz not null default now(),
  enviado_por  uuid references public.users(id) on delete set null,
  unique (client_id, periodo)
);

create index idx_agradecimentos_periodo on public.agradecimentos (periodo);

-- Quem, quando e a versão do termo vêm do banco. Sem autorização com termo
-- aprovado, o registro é recusado.
create or replace function public.registrar_agradecimento_carimbo()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_versao text;
begin
  select d.term_version into v_versao
    from public.destinatarios_do_agradecimento d
   where d.client_id = new.client_id;
  if not found then
    raise exception 'Esta pessoa não autorizou mensagens com um termo aprovado pelo Instituto.' using errcode = '42501';
  end if;
  new.term_version := v_versao;
  new.enviado_em := now();
  new.enviado_por := auth.uid();
  return new;
end;
$$;

create trigger carimbo_do_agradecimento
  before insert on public.agradecimentos
  for each row execute function public.registrar_agradecimento_carimbo();

alter table public.agradecimentos enable row level security;

create policy "coordenacao le" on public.agradecimentos
  for select to authenticated using (public.eh_coordenacao());
create policy "coordenacao registra" on public.agradecimentos
  for insert to authenticated with check (public.eh_coordenacao());

revoke all on public.agradecimentos from anon;
revoke update, delete, truncate on public.agradecimentos from authenticated;
grant select, insert on public.agradecimentos to authenticated;
