-- US-08a · Sugestão de possíveis repetidos
-- Pares de fichas com nome parecido ou telefone igual, para a coordenação.

-- ─────────────────────────────────────────
-- 1. Comparação de nomes por trigramas.
-- ─────────────────────────────────────────

create extension if not exists pg_trgm with schema extensions;

-- O nome do jeito que a comparação usa: minúsculo e sem acento.
-- immutable para poder entrar num índice. O unaccent de um argumento não é
-- immutable porque depende do dicionário configurado; aqui o dicionário vai
-- fixo, então o resultado é sempre o mesmo para o mesmo nome.
create or replace function public.nome_para_comparar(p_nome text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select lower(extensions.unaccent('extensions.unaccent'::regdictionary, coalesce(p_nome, '')))
$$;

create index if not exists idx_clients_nome_trigramas
  on public.clients using gin (public.nome_para_comparar(name) extensions.gin_trgm_ops);

-- Os 8 últimos dígitos do telefone: "(51) 99711-8899" e "99711-8899" batem.
create index if not exists idx_clients_telefone_final
  on public.clients ((right(regexp_replace(coalesce(phone, ''), '\D', '', 'g'), 8)));

-- ─────────────────────────────────────────
-- 2. possiveis_repetidos: pares de fichas com nome parecido (semelhança de
--    0,5 ou mais) ou com os mesmos 8 últimos dígitos de telefone.
--
--    security definer porque compara telefones, que nenhum perfil lê direto
--    desde a SEC-05. Sai só o final do telefone. Como a função passa por cima
--    das políticas, cada parte começa por public.eh_coordenacao(): para o
--    balcão, nenhum par.
-- ─────────────────────────────────────────

create or replace function public.possiveis_repetidos(p_limite int default 50)
returns table (
  id_a             uuid,
  nome_a           text,
  apelido_a        text,
  telefone_final_a text,
  criada_a         timestamptz,
  id_b             uuid,
  nome_b           text,
  apelido_b        text,
  telefone_final_b text,
  criada_b         timestamptz,
  motivo           text,
  semelhanca       numeric
)
language sql
stable
security definer
set search_path = ''
as $$
  with por_nome as (
    select a.id as a, b.id as b,
           extensions.similarity(public.nome_para_comparar(a.name), public.nome_para_comparar(b.name)) as sim
      from public.clients a
      join public.clients b
        on b.id > a.id
       and public.nome_para_comparar(b.name) operator(extensions.%) public.nome_para_comparar(a.name)
     where public.eh_coordenacao()
  ),
  por_telefone as (
    select a.id as a, b.id as b
      from public.clients a
      join public.clients b
        on b.id > a.id
       and right(regexp_replace(coalesce(b.phone, ''), '\D', '', 'g'), 8)
         = right(regexp_replace(coalesce(a.phone, ''), '\D', '', 'g'), 8)
     where public.eh_coordenacao()
       and length(regexp_replace(coalesce(a.phone, ''), '\D', '', 'g')) >= 8
  ),
  pares as (
    select coalesce(n.a, t.a) as a,
           coalesce(n.b, t.b) as b,
           n.sim,
           t.a is not null as mesmo_telefone
      from (select * from por_nome where sim >= 0.5) n
      full join por_telefone t on t.a = n.a and t.b = n.b
  )
  select
    ca.id, ca.name, coalesce(ca.nickname, ''),
    right(regexp_replace(coalesce(ca.phone, ''), '\D', '', 'g'), 4), ca.created_at,
    cb.id, cb.name, coalesce(cb.nickname, ''),
    right(regexp_replace(coalesce(cb.phone, ''), '\D', '', 'g'), 4), cb.created_at,
    case
      when p.mesmo_telefone and p.sim is not null then 'nome parecido e telefone igual'
      when p.mesmo_telefone then 'telefone igual'
      else 'nome parecido'
    end,
    round(coalesce(p.sim, 0)::numeric, 2)
  from pares p
  join public.clients ca on ca.id = p.a
  join public.clients cb on cb.id = p.b
  order by p.mesmo_telefone desc, p.sim desc nulls last, ca.name
  limit least(greatest(coalesce(p_limite, 50), 1), 200)
$$;

revoke execute on function public.possiveis_repetidos(int) from public, anon;
grant  execute on function public.possiveis_repetidos(int) to authenticated;
