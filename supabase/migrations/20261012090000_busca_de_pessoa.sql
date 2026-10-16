-- US-06 · Busca de pessoa em qualquer tela
-- Apelido na ficha e uma função de busca por nome, apelido ou telefone.

-- ─────────────────────────────────────────
-- 1. Apelido
-- ─────────────────────────────────────────

alter table public.clients add column if not exists nickname text;

-- Depois da SEC-05, coluna nova em clients não nasce com leitura liberada.
-- Antes da SEC-05 este grant não muda nada.
grant select (nickname) on public.clients to authenticated;

-- ─────────────────────────────────────────
-- 2. Busca sem diferenciar acento: "claudia" acha "Cláudia".
-- ─────────────────────────────────────────

create extension if not exists unaccent with schema extensions;

-- ─────────────────────────────────────────
-- 3. buscar_pessoas: a busca roda no banco e devolve só o que a lista mostra.
--    Antes, as telas de venda e de doação recebiam a lista inteira de pessoas,
--    com todos os dados, e filtravam no navegador.
--
--    security definer, por dois motivos:
--      - compara o termo com o telefone inteiro sem devolver o telefone
--        (só os quatro últimos dígitos saem daqui, para qualquer perfil);
--      - "já comprou" e "já doou" olham todo o histórico. O balcão só enxerga as
--        vendas e doações do dia (US-23), mas saber se a pessoa já é conhecida é
--        o objetivo desta história. Sai só o sim ou não, sem valor nem data.
--    Como a função passa por cima das políticas, a primeira condição do where
--    é public.eh_equipe(): sem perfil ativo, não volta nada.
-- ─────────────────────────────────────────

create or replace function public.buscar_pessoas(p_termo text, p_limite int default 8)
returns table (
  id          uuid,
  name        text,
  nickname    text,
  phone_final text,
  tags        text[],
  ja_comprou  boolean,
  ja_doou     boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  with termo as (
    select
      extensions.unaccent(lower(btrim(coalesce(p_termo, '')))) as texto,
      regexp_replace(coalesce(p_termo, ''), '\D', '', 'g')     as digitos
  )
  select
    c.id,
    c.name,
    coalesce(c.nickname, ''),
    right(regexp_replace(coalesce(c.phone, ''), '\D', '', 'g'), 4),
    coalesce(
      (select array_agg(t.name order by t.name)
         from public.client_tags ct
         join public.tags t on t.id = ct.tag_id
        where ct.client_id = c.id),
      '{}'
    ),
    exists (select 1 from public.sales s where s.client_id = c.id),
    exists (select 1 from public.donations_cash  d where d.client_id = c.id)
      or exists (select 1 from public.donations_items d where d.client_id = c.id)
      or exists (select 1 from public.donations_caps  d where d.client_id = c.id)
  from public.clients c
  cross join termo
  where public.eh_equipe()
    and length(termo.texto) >= 2
    and (
      position(termo.texto in extensions.unaccent(lower(c.name))) > 0
      or position(termo.texto in extensions.unaccent(lower(coalesce(c.nickname, '')))) > 0
      -- Telefone: só com 4 dígitos ou mais, para ninguém descobrir números
      -- testando um dígito por vez.
      or (
        length(termo.digitos) >= 4
        and position(termo.digitos in regexp_replace(coalesce(c.phone, ''), '\D', '', 'g')) > 0
      )
    )
  order by
    -- Primeiro quem tem o nome ou o apelido começando pelo termo.
    (extensions.unaccent(lower(c.name)) like termo.texto || '%'
      or extensions.unaccent(lower(coalesce(c.nickname, ''))) like termo.texto || '%') desc,
    c.name
  limit least(greatest(coalesce(p_limite, 8), 1), 20)
$$;

revoke execute on function public.buscar_pessoas(text, int) from public, anon;
grant  execute on function public.buscar_pessoas(text, int) to authenticated;
