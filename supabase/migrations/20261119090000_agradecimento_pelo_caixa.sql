-- US-39 · Agradecimento enviado também pelo caixa
-- A lista e o registro do agradecimento passam a ser funções security definer,
-- para caixa e coordenação. A lista não traz contato; o contato do canal escolhido
-- só sai no registro, um por pessoa e por período.

-- ─────────────────────────────────────────
-- 1. O intervalo de um período, em São Paulo: AAAA-MM (mês) ou AAAA (ano).
--    A US-41 acrescenta a semana.
-- ─────────────────────────────────────────

create or replace function public.intervalo_do_periodo(p_periodo text, out desde timestamptz, out ate timestamptz)
language plpgsql
stable
set search_path = ''
as $$
declare
  v_inicio date;
  v_fim    date;
begin
  if p_periodo ~ '^\d{4}-(0[1-9]|1[0-2])$' then
    v_inicio := to_date(p_periodo || '-01', 'YYYY-MM-DD');
    v_fim := (v_inicio + interval '1 month')::date;
  elsif p_periodo ~ '^\d{4}$' then
    v_inicio := to_date(p_periodo || '-01-01', 'YYYY-MM-DD');
    v_fim := (v_inicio + interval '1 year')::date;
  else
    raise exception 'período inválido' using errcode = '22023';
  end if;
  desde := v_inicio::timestamp at time zone 'America/Sao_Paulo';
  ate := v_fim::timestamp at time zone 'America/Sao_Paulo';
end;
$$;

-- ─────────────────────────────────────────
-- 2. Quem contribuiu no período, com as somas da US-21a e a situação da
--    mensagem. Sem telefone nem e-mail: só se há contato válido para cada canal.
--    Doação pela maquininha conta atendimentos pelo líquido (US-35, pergunta 8).
-- ─────────────────────────────────────────

create or replace function public.pessoas_para_agradecer(p_periodo text)
returns table (
  client_id uuid,
  nome text,
  compras numeric,
  doacoes numeric,
  doacoes_para_atendimentos numeric,
  pecas int,
  doacoes_de_item int,
  pode_receber boolean,
  termo_que_nao_vale boolean,
  agradecida_em timestamptz,
  canal text,
  tem_whatsapp boolean,
  tem_email boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_desde timestamptz;
  v_ate   timestamptz;
begin
  if not public.eh_caixa_ou_coordenacao() then
    raise exception 'só o caixa e a coordenação agradecem' using errcode = '42501';
  end if;
  select i.desde, i.ate into v_desde, v_ate from public.intervalo_do_periodo(p_periodo) i;

  return query
  with vendas as (
    -- sales não tem coluna amount: o valor da venda é a soma dos itens (como na sales_view).
    select s.client_id, coalesce(sum(si.amount), 0) as total
      from public.sales s
      left join public.sale_items si on si.sale_id = s.id
     where s.deleted_at is null and s.client_id is not null and s.sold_at >= v_desde and s.sold_at < v_ate
     group by s.client_id
  ), dinheiro as (
    select d.client_id,
           sum(d.amount) as total,
           sum(case
                 when coalesce(d.forma in ('debit', 'credit') and b.uso <> 'doacoes', false) and d.net_amount is not null
                   then d.net_amount
                 else d.amount
               end) as para_atendimentos
      from public.donations_cash d
      left join public.banks b on b.id = d.bank_id
     where d.deleted_at is null and d.client_id is not null and d.donated_at >= v_desde and d.donated_at < v_ate
     group by d.client_id
  ), itens as (
    select i.client_id,
           sum(case
                 when i.aproveitadas is not null then i.aproveitadas + coalesce(i.redoadas, 0) + coalesce(i.descarte, 0)
                 else coalesce(i.quantity, 0)
               end)::int as pecas,
           -- Quantas doações de item, mesmo com a triagem pendente (pecas 0). A US-41 usa na lista semanal.
           count(*)::int as doacoes_de_item
      from public.donations_items i
     where i.deleted_at is null and i.client_id is not null and i.donated_at >= v_desde and i.donated_at < v_ate
     group by i.client_id
  ), ids as (
    select v.client_id from vendas v
    union select d.client_id from dinheiro d
    union select i.client_id from itens i
  ), podem as (
    select x.client_id from public.destinatarios_do_agradecimento x
  ), autorizaram as (
    select r.client_id from public.message_recipients r
  )
  select
    c.id,
    c.name,
    coalesce(v.total, 0),
    coalesce(d.total, 0),
    coalesce(d.para_atendimentos, 0),
    coalesce(it.pecas, 0),
    coalesce(it.doacoes_de_item, 0),
    (c.id in (select client_id from podem)),
    (c.id in (select client_id from autorizaram) and c.id not in (select client_id from podem)),
    a.enviado_em,
    a.canal,
    regexp_replace(coalesce(c.phone, ''), '\D', '', 'g') ~ '^(\d{10,11}|55\d{10,11})$',
    coalesce(c.email, '') ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'
  from ids
  join public.clients c on c.id = ids.client_id
  left join vendas v on v.client_id = c.id
  left join dinheiro d on d.client_id = c.id
  left join itens it on it.client_id = c.id
  left join public.agradecimentos a on a.client_id = c.id and a.periodo = p_periodo;
end;
$$;

-- ─────────────────────────────────────────
-- 3. Registrar e receber o contato do canal escolhido. O gatilho da US-21a
--    confere o termo aprovado (42501) e o unique, o segundo do período (23505).
-- ─────────────────────────────────────────

create or replace function public.registrar_agradecimento(p_client_id uuid, p_periodo text, p_canal text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_desde   timestamptz;
  v_ate     timestamptz;
  v_phone   text;
  v_email   text;
  v_contato text;
begin
  if not public.eh_caixa_ou_coordenacao() then
    raise exception 'só o caixa e a coordenação agradecem' using errcode = '42501';
  end if;
  if p_canal not in ('whatsapp', 'email') then
    raise exception 'canal inválido' using errcode = '22023';
  end if;
  select i.desde, i.ate into v_desde, v_ate from public.intervalo_do_periodo(p_periodo) i;

  if not (
    exists (select 1 from public.sales s where s.client_id = p_client_id and s.deleted_at is null and s.sold_at >= v_desde and s.sold_at < v_ate)
    or exists (select 1 from public.donations_cash d where d.client_id = p_client_id and d.deleted_at is null and d.donated_at >= v_desde and d.donated_at < v_ate)
    or exists (select 1 from public.donations_items i where i.client_id = p_client_id and i.deleted_at is null and i.donated_at >= v_desde and i.donated_at < v_ate)
  ) then
    raise exception 'esta pessoa não contribuiu neste período' using errcode = '22023';
  end if;

  select c.phone, c.email into v_phone, v_email from public.clients c where c.id = p_client_id;
  if p_canal = 'whatsapp' then
    v_contato := v_phone;
    if regexp_replace(coalesce(v_contato, ''), '\D', '', 'g') !~ '^(\d{10,11}|55\d{10,11})$' then
      raise exception 'sem telefone com DDD na ficha' using errcode = '22023';
    end if;
  else
    v_contato := v_email;
    if coalesce(v_contato, '') !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then
      raise exception 'sem e-mail válido na ficha' using errcode = '22023';
    end if;
  end if;

  insert into public.agradecimentos (client_id, periodo, canal, term_version)
  values (p_client_id, p_periodo, p_canal, '');

  return v_contato;
end;
$$;

-- ─────────────────────────────────────────
-- 4. A versão atual do termo foi aprovada? Para o caixa, que não lê as aprovações.
-- ─────────────────────────────────────────

create or replace function public.termo_aprovado(p_versao text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select public.eh_equipe() and exists (select 1 from public.aprovacoes_do_termo a where a.versao = p_versao)
$$;

revoke execute on function public.intervalo_do_periodo(text) from public, anon;
grant execute on function public.intervalo_do_periodo(text) to authenticated;
revoke execute on function public.pessoas_para_agradecer(text) from public, anon;
grant execute on function public.pessoas_para_agradecer(text) to authenticated;
revoke execute on function public.registrar_agradecimento(uuid, text, text) from public, anon;
grant execute on function public.registrar_agradecimento(uuid, text, text) to authenticated;
revoke execute on function public.termo_aprovado(text) from public, anon;
grant execute on function public.termo_aprovado(text) to authenticated;
