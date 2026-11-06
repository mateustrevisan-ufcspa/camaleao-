-- US-04a · Editar e excluir doação de item
-- Balcão corrige e exclui as doações de item lançadas hoje; coordenação, qualquer uma.
-- Excluir guarda quem e quando, e a doação excluída some de toda leitura pela API.

-- ─────────────────────────────────────────
-- 1. Quem excluiu e quando.
-- ─────────────────────────────────────────

alter table public.donations_items
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references public.users(id) on delete set null;

-- ─────────────────────────────────────────
-- 2. Leitura: a mesma regra da US-23, sem as excluídas. Toda tela que lê
--    donations_items pela API (lista, ficha, relatório, exportação, sem ficha,
--    contribuição) deixa de ver a excluída sem mudar código.
-- ─────────────────────────────────────────

drop policy if exists "coordenacao le tudo, balcao le o dia" on public.donations_items;
create policy "coordenacao le tudo, balcao le o dia, sem as excluidas" on public.donations_items
  for select to authenticated
  using (
    deleted_at is null
    and (
      public.eh_coordenacao()
      or (public.eh_equipe() and created_at >= public.balcao_le_desde())
    )
  );

-- ─────────────────────────────────────────
-- 3. Alteração: coordenação em qualquer uma; balcão nas lançadas hoje.
-- ─────────────────────────────────────────

drop policy if exists "coordenacao altera" on public.donations_items;
create policy "coordenacao corrige tudo, balcao corrige o dia" on public.donations_items
  for update to authenticated
  using (
    deleted_at is null
    and (
      public.eh_coordenacao()
      or (public.eh_equipe() and created_at >= public.balcao_le_desde())
    )
  )
  with check (
    deleted_at is null
    and (
      public.eh_coordenacao()
      or (public.eh_equipe() and created_at >= public.balcao_le_desde())
    )
  );

-- ─────────────────────────────────────────
-- 4. A API só altera os campos do formulário (e client_id, que a US-14 usa
--    para ligar doação sem ficha). created_at, registered_by, deleted_at e
--    deleted_by ficam de fora, para todo mundo. As funções security definer
--    (mesclagem, exclusão) rodam como dona da tabela e não são afetadas.
-- ─────────────────────────────────────────

revoke update on public.donations_items from anon, authenticated;
grant update (
  client_id, donor_name, donor_phone, category_id, category_name,
  quantity, weight_kg, condition, destination, notes, donated_at
) on public.donations_items to authenticated;

-- ─────────────────────────────────────────
-- 5. Excluir. security definer: precisa marcar deleted_at, que a API não
--    altera. Confere o perfil na primeira linha, como as outras funções.
-- ─────────────────────────────────────────

create or replace function public.excluir_doacao_de_item(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_criada timestamptz;
begin
  if not public.eh_equipe() then
    raise exception 'sem permissão para excluir doação' using errcode = '42501';
  end if;

  select d.created_at into v_criada
    from public.donations_items d
   where d.id = p_id and d.deleted_at is null
   for update;

  if not found then
    raise exception 'doação não encontrada' using errcode = 'P0002';
  end if;

  if not public.eh_coordenacao() and v_criada < public.balcao_le_desde() then
    raise exception 'o balcão só exclui doação lançada hoje' using errcode = '42501';
  end if;

  update public.donations_items
     set deleted_at = now(), deleted_by = auth.uid()
   where id = p_id;
end;
$$;

revoke execute on function public.excluir_doacao_de_item(uuid) from public, anon;
grant execute on function public.excluir_doacao_de_item(uuid) to authenticated;
