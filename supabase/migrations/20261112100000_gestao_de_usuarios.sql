-- US-24a · Gestão de usuários pela coordenação
-- Troca de senha obrigatória no primeiro acesso, registro de quem cadastrou e
-- desativou, lista da equipe para a coordenação e a trava da última coordenação.

-- ─────────────────────────────────────────
-- 1. Colunas novas em users. Quem grava é o servidor, com a chave secreta,
--    depois de conferir que é a coordenação. Continua sem política de escrita
--    pela API (US-23).
-- ─────────────────────────────────────────

alter table public.users
  add column if not exists trocar_senha   boolean not null default false,
  add column if not exists criado_por     uuid references public.users(id) on delete set null,
  add column if not exists desativado_em  timestamptz,
  add column if not exists desativado_por uuid references public.users(id) on delete set null;

-- ─────────────────────────────────────────
-- 2. Quem trocou a senha marca que trocou. Só a própria linha.
-- ─────────────────────────────────────────

create or replace function public.confirmar_troca_de_senha()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.users set trocar_senha = false where id = auth.uid()
$$;

revoke execute on function public.confirmar_troca_de_senha() from public, anon;
grant execute on function public.confirmar_troca_de_senha() to authenticated;

-- ─────────────────────────────────────────
-- 3. A equipe, com e-mail e último acesso (que ficam em auth.users).
--    security definer para ler auth.users; começa por eh_coordenacao().
-- ─────────────────────────────────────────

create or replace function public.usuarios_da_equipe()
returns table (
  id             uuid,
  name           text,
  role           text,
  active         boolean,
  trocar_senha   boolean,
  email          text,
  ultimo_acesso  timestamptz,
  criado_em      timestamptz,
  desativado_em  timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select u.id, u.name, u.role, coalesce(u.active, false), u.trocar_senha,
         a.email::text, a.last_sign_in_at, u.created_at, u.desativado_em
    from public.users u
    join auth.users a on a.id = u.id
   where public.eh_coordenacao()
   order by coalesce(u.active, false) desc, u.name
$$;

revoke execute on function public.usuarios_da_equipe() from public, anon;
grant execute on function public.usuarios_da_equipe() to authenticated;

-- ─────────────────────────────────────────
-- 4. O sistema nunca fica sem coordenação ativa. Gatilho, e não política:
--    vale também para a chave secreta, que passa por cima das políticas.
-- ─────────────────────────────────────────

create or replace function public.manter_uma_coordenacao()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.role = 'admin' and coalesce(old.active, false)
     and (new.role <> 'admin' or not coalesce(new.active, false))
     and not exists (
       select 1 from public.users u
        where u.id <> old.id and u.role = 'admin' and coalesce(u.active, false)
     ) then
    raise exception 'O sistema precisa de pelo menos uma coordenação ativa.' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger manter_uma_coordenacao
  before update on public.users
  for each row execute function public.manter_uma_coordenacao();