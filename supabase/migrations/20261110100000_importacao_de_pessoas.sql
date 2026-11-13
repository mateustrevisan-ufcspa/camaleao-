-- US-09 · Importação de pessoas a partir de planilha
-- Função que diz quais linhas da planilha já têm ficha, sem devolver telefone,
-- e o registro de cada importação. Só a coordenação.

-- ─────────────────────────────────────────
-- 1. pessoas_ja_cadastradas: para cada posição das listas, a ficha que já
--    existe com o mesmo final de telefone (8 dígitos) ou, sem telefone, com o
--    mesmo nome (sem acento, em minúsculas: nome_para_comparar, da US-08a).
--    security definer porque compara telefones, que nenhum perfil lê direto
--    (SEC-05). Começa por eh_coordenacao(): para o balcão, nada.
-- ─────────────────────────────────────────

create or replace function public.pessoas_ja_cadastradas(p_telefones text[], p_nomes text[])
returns table (posicao int, client_id uuid, nome text, motivo text)
language sql
stable
security definer
set search_path = ''
as $$
  with entrada as (
    select e.posicao::int as posicao,
           right(regexp_replace(coalesce(e.telefone, ''), '\D', '', 'g'), 8) as final,
           public.nome_para_comparar(btrim(coalesce(n.nome, ''))) as nome
      from unnest(p_telefones) with ordinality as e(telefone, posicao)
      join unnest(p_nomes) with ordinality as n(nome, posicao) using (posicao)
     where public.eh_coordenacao()
  )
  select distinct on (en.posicao)
         en.posicao, c.id, c.name,
         case when length(en.final) = 8
                   and right(regexp_replace(coalesce(c.phone, ''), '\D', '', 'g'), 8) = en.final
              then 'telefone' else 'nome' end
    from entrada en
    join public.clients c
      on (length(en.final) = 8 and right(regexp_replace(coalesce(c.phone, ''), '\D', '', 'g'), 8) = en.final)
      or (length(en.final) < 8 and en.nome <> '' and public.nome_para_comparar(c.name) = en.nome)
   order by en.posicao, c.created_at
$$;

revoke execute on function public.pessoas_ja_cadastradas(text[], text[]) from public, anon;
grant execute on function public.pessoas_ja_cadastradas(text[], text[]) to authenticated;

-- ─────────────────────────────────────────
-- 2. Registro de cada importação. Quem e quando vêm do banco.
-- ─────────────────────────────────────────

create table public.importacoes_de_pessoas (
  id          uuid primary key default gen_random_uuid(),
  arquivo     text not null check (length(arquivo) between 1 and 200),
  importadas  int not null check (importadas >= 0),
  descartadas int not null check (descartadas >= 0),
  feita_em    timestamptz not null default now(),
  feita_por   uuid references public.users(id) on delete set null
);

create or replace function public.carimbar_importacao()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.feita_em := now();
  new.feita_por := auth.uid();
  return new;
end;
$$;

create trigger carimbo_da_importacao
  before insert on public.importacoes_de_pessoas
  for each row execute function public.carimbar_importacao();

alter table public.importacoes_de_pessoas enable row level security;

create policy "coordenacao le" on public.importacoes_de_pessoas
  for select to authenticated using (public.eh_coordenacao());
create policy "coordenacao registra" on public.importacoes_de_pessoas
  for insert to authenticated with check (public.eh_coordenacao());

revoke all on public.importacoes_de_pessoas from anon;
grant select, insert on public.importacoes_de_pessoas to authenticated;
