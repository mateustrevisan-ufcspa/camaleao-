-- US-27 · Contagem da triagem do item doado
-- A doação de item tem dois momentos: a entrada e, dias depois, a triagem, com
-- quantas peças foram aproveitadas, redoadas e descartadas (até 300 cada).

-- ─────────────────────────────────────────
-- 1. As três contagens e quem e quando registrou a triagem.
--    Ou as três têm valor, ou nenhuma (triagem pendente).
-- ─────────────────────────────────────────

alter table public.donations_items
  add column if not exists aproveitadas int check (aproveitadas between 0 and 300),
  add column if not exists redoadas     int check (redoadas between 0 and 300),
  add column if not exists descarte     int check (descarte between 0 and 300),
  add column if not exists triado_em    timestamptz,
  add column if not exists triado_por   uuid references public.users(id) on delete set null;

alter table public.donations_items
  add constraint donations_items_triagem_completa check (
    (aproveitadas is null and redoadas is null and descarte is null)
    or (aproveitadas is not null and redoadas is not null and descarte is not null)
  );

-- ─────────────────────────────────────────
-- 2. Quem e quando da triagem vêm do banco. Contagem que não mudou mantém o
--    carimbo antigo (exclusão, mesclagem e correção de outros campos).
-- ─────────────────────────────────────────

create or replace function public.carimbar_triagem()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.triado_em  := case when new.aproveitadas is null then null else now() end;
    new.triado_por := case when new.aproveitadas is null then null else auth.uid() end;
  elsif (new.aproveitadas, new.redoadas, new.descarte)
        is distinct from (old.aproveitadas, old.redoadas, old.descarte) then
    new.triado_em  := case when new.aproveitadas is null then null else now() end;
    new.triado_por := case when new.aproveitadas is null then null else auth.uid() end;
  else
    new.triado_em  := old.triado_em;
    new.triado_por := old.triado_por;
  end if;
  return new;
end;
$$;

create trigger carimbo_da_triagem
  before insert or update on public.donations_items
  for each row execute function public.carimbar_triagem();

-- ─────────────────────────────────────────
-- 3. A edição pela API (US-04a) também altera as três contagens, nas doações
--    que a política deixa alterar (balcão: as lançadas hoje).
-- ─────────────────────────────────────────

grant update (aproveitadas, redoadas, descarte) on public.donations_items to authenticated;

-- ─────────────────────────────────────────
-- 4. Triagem de doação de outro dia. security definer: o balcão não enxerga
--    nem altera a doação de ontem pela API. Altera só as três contagens, só de
--    doação não excluída e ainda pendente; a coordenação pode refazer.
-- ─────────────────────────────────────────

create or replace function public.registrar_triagem(
  p_id uuid,
  p_aproveitadas int,
  p_redoadas int,
  p_descarte int
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.eh_equipe() then
    raise exception 'sem permissão para registrar triagem' using errcode = '42501';
  end if;
  if p_aproveitadas is null or p_redoadas is null or p_descarte is null then
    raise exception 'informe as três contagens' using errcode = '22023';
  end if;

  update public.donations_items d
     set aproveitadas = p_aproveitadas,
         redoadas     = p_redoadas,
         descarte     = p_descarte
   where d.id = p_id
     and d.deleted_at is null
     and (d.aproveitadas is null or public.eh_coordenacao());

  if not found then
    raise exception 'doação não encontrada ou com triagem já registrada' using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function public.registrar_triagem(uuid, int, int, int) from public, anon;
grant execute on function public.registrar_triagem(uuid, int, int, int) to authenticated;

-- ─────────────────────────────────────────
-- 5. Doações com triagem pendente, de qualquer dia, para o balcão achar a
--    sacola. Só data, nome, categoria e observação; sem telefone. Tampinha não
--    tem triagem; doação antiga com quantidade ou peso também não fica pendente.
-- ─────────────────────────────────────────

create or replace function public.triagens_pendentes()
returns table (id uuid, donated_at timestamptz, donor_name text, category_name text, notes text)
language sql
stable
security definer
set search_path = ''
as $$
  select d.id, d.donated_at, d.donor_name, d.category_name, d.notes
    from public.donations_items d
   where public.eh_equipe()
     and d.deleted_at is null
     and d.aproveitadas is null
     and d.quantity is null
     and d.weight_kg is null
     and lower(coalesce(d.category_name, '')) <> 'tampinha'
   order by d.donated_at, d.created_at
   limit 200
$$;

revoke execute on function public.triagens_pendentes() from public, anon;
grant execute on function public.triagens_pendentes() to authenticated;
