-- US-19 · Contribuição convertida em atendimentos
-- Valor de referência de um atendimento do Instituto, informado pela coordenação
-- em 03/09/2026 (R$ 50). Cada alteração é uma linha nova: o valor em vigor é o da
-- linha mais recente, e as anteriores ficam como registro de quem alterou e quando.

-- ─────────────────────────────────────────
-- 1. Tabela. Ninguém altera nem apaga uma linha: alterar o valor é inserir outra.
-- ─────────────────────────────────────────

create table public.valor_do_atendimento (
  id           uuid primary key default gen_random_uuid(),
  valor        numeric(10,2) not null check (valor > 0 and valor <= 100000),
  definido_em  timestamptz not null default now(),
  definido_por uuid references public.users(id) on delete set null
);

create index idx_valor_do_atendimento_definido_em
  on public.valor_do_atendimento (definido_em desc);

-- ─────────────────────────────────────────
-- 2. Quem e quando vêm do banco, e não do formulário: o carimbo passa por cima
--    do que o cliente mandar. Na carga inicial (abaixo), auth.uid() é nulo.
-- ─────────────────────────────────────────

create or replace function public.carimbar_valor_do_atendimento()
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

create trigger carimbo_do_valor_do_atendimento
  before insert on public.valor_do_atendimento
  for each row execute function public.carimbar_valor_do_atendimento();

-- ─────────────────────────────────────────
-- 3. A equipe lê (o balcão precisa do valor para o aviso da venda); só a
--    coordenação grava. Sem política de update nem de delete: o histórico não muda.
-- ─────────────────────────────────────────

alter table public.valor_do_atendimento enable row level security;

create policy "equipe le" on public.valor_do_atendimento
  for select to authenticated using (public.eh_equipe());
create policy "coordenacao define" on public.valor_do_atendimento
  for insert to authenticated with check (public.eh_coordenacao());

revoke all on public.valor_do_atendimento from anon;

-- ─────────────────────────────────────────
-- 4. Valor inicial.
-- ─────────────────────────────────────────

insert into public.valor_do_atendimento (valor) values (50.00);