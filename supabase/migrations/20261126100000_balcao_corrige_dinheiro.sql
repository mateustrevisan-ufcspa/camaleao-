-- US-37 · Correção e cancelamento de dinheiro pelo balcão, em qualquer data
-- O caixa não lê vendas e doações de outros dias (US-23 e US-28). Por isso corrige
-- e cancela por funções security definer, que conferem o perfil e devolvem só o
-- necessário. A coordenação usa as mesmas funções.

-- ─────────────────────────────────────────
-- 1. Cancelar: caixa e coordenação (era só a coordenação, US-04b).
-- ─────────────────────────────────────────

create or replace function public.cancelar_venda(p_id uuid, p_motivo text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.eh_caixa_ou_coordenacao() then
    raise exception 'só o caixa e a coordenação cancelam venda' using errcode = '42501';
  end if;
  if length(btrim(coalesce(p_motivo, ''))) < 5 then
    raise exception 'informe o motivo do cancelamento' using errcode = '22023';
  end if;
  update public.sales
     set deleted_at = now(), deleted_by = auth.uid(), motivo_da_alteracao = left(btrim(p_motivo), 300)
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
  if not public.eh_caixa_ou_coordenacao() then
    raise exception 'só o caixa e a coordenação cancelam doação em dinheiro' using errcode = '42501';
  end if;
  if length(btrim(coalesce(p_motivo, ''))) < 5 then
    raise exception 'informe o motivo do cancelamento' using errcode = '22023';
  end if;
  update public.donations_cash
     set deleted_at = now(), deleted_by = auth.uid(), motivo_da_alteracao = left(btrim(p_motivo), 300)
   where id = p_id and deleted_at is null;
  if not found then
    raise exception 'doação não encontrada' using errcode = 'P0002';
  end if;
end;
$$;

-- ─────────────────────────────────────────
-- 2. Os lançamentos de um dia, para corrigir. Pela data da venda ou da doação
--    (em São Paulo), e não pela data do lançamento. Sem telefone.
-- ─────────────────────────────────────────

create or replace function public.lancamentos_para_corrigir(p_dia date)
returns table (tipo text, id uuid, momento timestamptz, nome text, valor numeric, detalhe text)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_desde timestamptz := p_dia::timestamp at time zone 'America/Sao_Paulo';
  v_ate   timestamptz := (p_dia + 1)::timestamp at time zone 'America/Sao_Paulo';
begin
  if not public.eh_caixa_ou_coordenacao() then
    raise exception 'só o caixa e a coordenação corrigem lançamentos' using errcode = '42501';
  end if;
  if p_dia is null or p_dia > (now() at time zone 'America/Sao_Paulo')::date then
    raise exception 'escolha um dia até hoje' using errcode = '22023';
  end if;
  return query
    -- sales não tem coluna amount: o valor da venda é a soma dos itens (como na sales_view).
    select 'venda'::text, s.id, s.sold_at, s.customer_name,
           coalesce((select sum(si.amount) from public.sale_items si where si.sale_id = s.id), 0)::numeric,
           coalesce(pm.label, '')
      from public.sales s
      left join public.payment_methods pm on pm.id = s.payment_method_id
     where s.deleted_at is null and s.sold_at >= v_desde and s.sold_at < v_ate
    union all
    select 'doacao'::text, d.id, d.donated_at, d.donor_name, d.amount, coalesce(o.name, '')
      from public.donations_cash d
      left join public.cash_origins o on o.id = d.origin_id
     where d.deleted_at is null and d.donated_at >= v_desde and d.donated_at < v_ate
    order by 3;
end;
$$;

-- ─────────────────────────────────────────
-- 3. A doação que vai ser corrigida: só os campos do formulário (US-04b).
-- ─────────────────────────────────────────

create or replace function public.doacao_para_corrigir(p_id uuid)
returns table (
  id uuid, donor_name text, amount numeric, donated_at timestamptz, origin text, frequency text,
  notes text, bank_id uuid, forma text, parcelado boolean, bandeira text
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.eh_caixa_ou_coordenacao() then
    raise exception 'só o caixa e a coordenação corrigem lançamentos' using errcode = '42501';
  end if;
  return query
    select d.id, d.donor_name, d.amount, d.donated_at, coalesce(o.name, 'Outro'), d.frequency,
           d.notes, d.bank_id, d.forma, d.parcelado, d.bandeira
      from public.donations_cash d
      left join public.cash_origins o on o.id = d.origin_id
     where d.id = p_id and d.deleted_at is null;
end;
$$;

-- ─────────────────────────────────────────
-- 4. Corrigir. Os gatilhos de donations_cash continuam: o líquido é refeito
--    (US-35) e a trilha registra quem fez (SEC-04, com auth.uid() de quem chamou).
--    Motivo opcional (resposta 4).
-- ─────────────────────────────────────────

create or replace function public.corrigir_doacao_em_dinheiro(
  p_id uuid,
  p_amount numeric,
  p_donated_at timestamptz,
  p_origin_id uuid,
  p_frequency text,
  p_notes text,
  p_bank_id uuid,
  p_forma text,
  p_parcelado boolean,
  p_bandeira text,
  p_motivo text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.eh_caixa_ou_coordenacao() then
    raise exception 'só o caixa e a coordenação corrigem doação em dinheiro' using errcode = '42501';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'informe um valor maior que zero' using errcode = '22023';
  end if;
  if p_donated_at is null or p_donated_at > now() then
    raise exception 'a data da doação não pode ser depois de hoje' using errcode = '22023';
  end if;
  update public.donations_cash
     set amount = p_amount,
         donated_at = p_donated_at,
         origin_id = p_origin_id,
         frequency = p_frequency,
         notes = nullif(btrim(coalesce(p_notes, '')), ''),
         bank_id = p_bank_id,
         forma = p_forma,
         parcelado = coalesce(p_parcelado, false),
         bandeira = p_bandeira,
         motivo_da_alteracao = nullif(left(btrim(coalesce(p_motivo, '')), 300), '')
   where id = p_id and deleted_at is null;
  if not found then
    raise exception 'doação não encontrada' using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function public.lancamentos_para_corrigir(date) from public, anon;
grant execute on function public.lancamentos_para_corrigir(date) to authenticated;
revoke execute on function public.doacao_para_corrigir(uuid) from public, anon;
grant execute on function public.doacao_para_corrigir(uuid) to authenticated;
revoke execute on function public.corrigir_doacao_em_dinheiro(uuid, numeric, timestamptz, uuid, text, text, uuid, text, boolean, text, text) from public, anon;
grant execute on function public.corrigir_doacao_em_dinheiro(uuid, numeric, timestamptz, uuid, text, text, uuid, text, boolean, text, text) to authenticated;
