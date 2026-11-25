-- US-04b · Correção e cancelamento de venda e de doação em dinheiro
-- Coordenação corrige (motivo opcional) e cancela (motivo obrigatório). O balcão
-- entra na US-37, que troca as condições destas políticas e funções.
-- Cancelado fica no banco com quem e quando, e some de toda leitura pela API.

-- ─────────────────────────────────────────
-- 1. Quem cancelou e quando. Mesmo nome da US-04a: a trilha (SEC-04) registra
--    a marca como "exclusão".
-- ─────────────────────────────────────────

alter table public.sales
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references public.users(id) on delete set null;

alter table public.donations_cash
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references public.users(id) on delete set null;

-- ─────────────────────────────────────────
-- 2. Leitura: as regras da US-28, sem as canceladas.
-- ─────────────────────────────────────────

drop policy if exists "coordenacao le tudo, caixa le o dia" on public.sales;
create policy "coordenacao le tudo, caixa le o dia, sem as canceladas" on public.sales
  for select to authenticated
  using (
    deleted_at is null
    and (
      public.eh_coordenacao()
      or (public.eh_caixa_ou_coordenacao() and created_at >= public.balcao_le_desde())
    )
  );

drop policy if exists "coordenacao le tudo, caixa le o dia" on public.donations_cash;
create policy "coordenacao le tudo, caixa le o dia, sem as canceladas" on public.donations_cash
  for select to authenticated
  using (
    deleted_at is null
    and (
      public.eh_coordenacao()
      or (public.eh_caixa_ou_coordenacao() and created_at >= public.balcao_le_desde())
    )
  );

-- ─────────────────────────────────────────
-- 3. Alteração: continua só da coordenação (US-23), e não em cancelada.
-- ─────────────────────────────────────────

drop policy if exists "coordenacao altera" on public.sales;
create policy "coordenacao altera, sem as canceladas" on public.sales
  for update to authenticated
  using (deleted_at is null and public.eh_coordenacao())
  with check (deleted_at is null and public.eh_coordenacao());

drop policy if exists "coordenacao altera" on public.donations_cash;
create policy "coordenacao altera, sem as canceladas" on public.donations_cash
  for update to authenticated
  using (deleted_at is null and public.eh_coordenacao())
  with check (deleted_at is null and public.eh_coordenacao());

-- ─────────────────────────────────────────
-- 4. A API altera só os campos dos formulários. Fora: created_at, registered_by,
--    deleted_at, deleted_by, e na doação a taxa e o líquido (gatilho da US-35).
--    Na venda: conferir o recebimento (financeiro) e ligar a ficha.
-- ─────────────────────────────────────────

revoke update on public.donations_cash from anon, authenticated;
grant update (
  client_id, donor_name, donor_phone, amount, origin_id, frequency, donated_at, notes,
  event_id, campaign_id, bank_id, forma, parcelado, bandeira, motivo_da_alteracao
) on public.donations_cash to authenticated;

revoke update on public.sales from anon, authenticated;
grant update (confirmed, client_id, motivo_da_alteracao) on public.sales to authenticated;

-- ─────────────────────────────────────────
-- 5. Cancelar. security definer: marca deleted_at, que a API não altera.
--    Só a coordenação nesta story; a US-37 abre ao caixa.
-- ─────────────────────────────────────────

create or replace function public.cancelar_venda(p_id uuid, p_motivo text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.eh_coordenacao() then
    raise exception 'só a coordenação cancela venda' using errcode = '42501';
  end if;
  if length(btrim(coalesce(p_motivo, ''))) < 5 then
    raise exception 'informe o motivo do cancelamento' using errcode = '22023';
  end if;
  update public.sales
     set deleted_at = now(), deleted_by = auth.uid(), motivo_da_alteracao = btrim(p_motivo)
   where id = p_id and deleted_at is null;
  if not found then
    raise exception 'venda não encontrada' using errcode = 'P0002';
  end if;
end;
$$;

create or replace function public.cancelar_doacao_em_dinheiro(p_id uuid, p_motivo text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.eh_coordenacao() then
    raise exception 'só a coordenação cancela doação em dinheiro' using errcode = '42501';
  end if;
  if length(btrim(coalesce(p_motivo, ''))) < 5 then
    raise exception 'informe o motivo do cancelamento' using errcode = '22023';
  end if;
  update public.donations_cash
     set deleted_at = now(), deleted_by = auth.uid(), motivo_da_alteracao = btrim(p_motivo)
   where id = p_id and deleted_at is null;
  if not found then
    raise exception 'doação não encontrada' using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function public.cancelar_venda(uuid, text) from public, anon;
grant execute on function public.cancelar_venda(uuid, text) to authenticated;
revoke execute on function public.cancelar_doacao_em_dinheiro(uuid, text) from public, anon;
grant execute on function public.cancelar_doacao_em_dinheiro(uuid, text) to authenticated;
