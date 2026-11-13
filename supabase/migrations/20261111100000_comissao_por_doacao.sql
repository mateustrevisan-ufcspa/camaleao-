-- US-31 · Comissão por doação, com quem captou
-- Cadastro de quem capta, o percentual da comissão (uma linha por alteração, como
-- o valor do atendimento da US-19), a marcação de cada doação em dinheiro (teve ou
-- não comissão, para quem) e a view que calcula o valor sobre o líquido. Só a coordenação.

-- ─────────────────────────────────────────
-- 1. Quem capta. Desativar em vez de apagar: as comissões antigas apontam para cá.
-- ─────────────────────────────────────────

create table public.captadores (
  id         uuid primary key default gen_random_uuid(),
  nome       text not null check (length(btrim(nome)) between 2 and 80),
  ativo      boolean not null default true,
  criado_em  timestamptz not null default now(),
  criado_por uuid default auth.uid() references public.users(id) on delete set null
);

create unique index idx_captadores_nome on public.captadores (lower(btrim(nome)));

alter table public.captadores enable row level security;

create policy "coordenacao le" on public.captadores
  for select to authenticated using (public.eh_coordenacao());
create policy "coordenacao cadastra" on public.captadores
  for insert to authenticated with check (public.eh_coordenacao());
create policy "coordenacao altera" on public.captadores
  for update to authenticated using (public.eh_coordenacao()) with check (public.eh_coordenacao());

revoke all on public.captadores from anon;
grant select, insert, update on public.captadores to authenticated;

-- ─────────────────────────────────────────
-- 2. Percentual da comissão. Ninguém altera nem apaga uma linha: alterar o
--    percentual é inserir outra. O em vigor é o da linha mais recente.
-- ─────────────────────────────────────────

create table public.percentual_de_comissao (
  id           uuid primary key default gen_random_uuid(),
  percentual   numeric(5,2) not null check (percentual >= 0 and percentual <= 100),
  definido_em  timestamptz not null default now(),
  definido_por uuid references public.users(id) on delete set null
);

create index idx_percentual_de_comissao_definido_em
  on public.percentual_de_comissao (definido_em desc);

create or replace function public.carimbar_percentual_de_comissao()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.definido_em := now();
  new.definido_por := auth.uid();
  return new;
end;
$$;

create trigger carimbo_do_percentual
  before insert on public.percentual_de_comissao
  for each row execute function public.carimbar_percentual_de_comissao();

alter table public.percentual_de_comissao enable row level security;

create policy "coordenacao le" on public.percentual_de_comissao
  for select to authenticated using (public.eh_coordenacao());
create policy "coordenacao define" on public.percentual_de_comissao
  for insert to authenticated with check (public.eh_coordenacao());

revoke all on public.percentual_de_comissao from anon;
grant select, insert on public.percentual_de_comissao to authenticated;

-- Percentual inicial (Nílian, 09/11). Na migração, auth.uid() é nulo.
insert into public.percentual_de_comissao (percentual) values (25.00);

-- ─────────────────────────────────────────
-- 3. A marcação de cada doação. Uma por doação; some com a doação apagada.
--    Teve comissão: com quem captou. Sem comissão: sem ninguém.
-- ─────────────────────────────────────────

create table public.comissoes_de_doacao (
  id            uuid primary key default gen_random_uuid(),
  donation_id   uuid not null unique references public.donations_cash(id) on delete cascade,
  teve_comissao boolean not null,
  captador_id   uuid references public.captadores(id) on delete restrict,
  percentual    numeric(5,2) check (percentual >= 0 and percentual <= 100),
  definido_em   timestamptz not null default now(),
  definido_por  uuid references public.users(id) on delete set null,
  constraint comissao_com_quem_captou check (
    (teve_comissao and captador_id is not null) or (not teve_comissao and captador_id is null)
  )
);

create index idx_comissoes_captador on public.comissoes_de_doacao (captador_id);

-- Quem e quando vêm do banco, também na correção. O percentual é o em vigor na
-- marcação e não muda depois, nem pela API: para usar o novo, desmarcar e marcar.
create or replace function public.carimbar_comissao()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.definido_em := now();
  new.definido_por := auth.uid();
  if tg_op = 'INSERT' then
    new.percentual := (
      select p.percentual
        from public.percentual_de_comissao p
       order by p.definido_em desc
       limit 1
    );
  else
    new.percentual := old.percentual;
  end if;
  return new;
end;
$$;

-- "carimbo" vem antes de "trilha" na ordem alfabética: a trilha já vê o carimbo.
create trigger carimbo_da_comissao
  before insert or update on public.comissoes_de_doacao
  for each row execute function public.carimbar_comissao();

-- SEC-04: correção e desmarcação entram na trilha.
create trigger trilha_de_auditoria before update or delete on public.comissoes_de_doacao
  for each row execute function public.registrar_na_trilha();

alter table public.comissoes_de_doacao enable row level security;

create policy "coordenacao le" on public.comissoes_de_doacao
  for select to authenticated using (public.eh_coordenacao());
create policy "coordenacao marca" on public.comissoes_de_doacao
  for insert to authenticated with check (public.eh_coordenacao());
create policy "coordenacao corrige" on public.comissoes_de_doacao
  for update to authenticated using (public.eh_coordenacao()) with check (public.eh_coordenacao());
create policy "coordenacao desmarca" on public.comissoes_de_doacao
  for delete to authenticated using (public.eh_coordenacao());

revoke all on public.comissoes_de_doacao from anon;
grant select, insert, update, delete on public.comissoes_de_doacao to authenticated;

-- ─────────────────────────────────────────
-- 4. Marcações com a doação, quem captou e o valor calculado sobre o líquido.
--    security_invoker: só a coordenação recebe linhas, e doação cancelada
--    (US-04b) não aparece. Sem líquido (taxa não cadastrada), valor nulo.
-- ─────────────────────────────────────────

create view public.comissoes_view
with (security_invoker = true) as
select
  k.id,
  k.donation_id,
  k.teve_comissao,
  k.captador_id,
  c.nome as captador_nome,
  k.percentual,
  case
    when k.teve_comissao and d.net_amount is not null and k.percentual is not null
      then round(d.net_amount * k.percentual / 100, 2)
  end as valor,
  k.definido_em,
  d.donated_at,
  d.donor_name,
  d.amount,
  d.net_amount
from public.comissoes_de_doacao k
left join public.captadores c on c.id = k.captador_id
join public.donations_cash d on d.id = k.donation_id;

revoke all on public.comissoes_view from anon;
grant select on public.comissoes_view to authenticated;
