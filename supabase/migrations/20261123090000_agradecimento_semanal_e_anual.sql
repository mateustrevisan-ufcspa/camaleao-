-- US-41 · Agradecimento semanal e anual
-- A semana (AAAA-Snn, semana ISO de segunda a domingo) entra como período, e o
-- registro passa a conferir o tipo de contribuição de cada período: semana, item;
-- mês, compra ou dinheiro; ano, qualquer uma.
-- pessoas_para_agradecer (US-39) não muda: aceita qualquer período que
-- intervalo_do_periodo entenda. Os grants da US-39 continuam valendo, porque
-- create or replace mantém as permissões da função.

-- ─────────────────────────────────────────
-- 1. A tabela aceita a semana. O check da US-21a foi criado na coluna, sem
--    nome, e o Postgres o chamou de agradecimentos_periodo_check.
-- ─────────────────────────────────────────

alter table public.agradecimentos drop constraint if exists agradecimentos_periodo_check;
alter table public.agradecimentos
  add constraint agradecimentos_periodo_check
  check (periodo ~ '^\d{4}(-(0[1-9]|1[0-2])|-S(0[1-9]|[1-4][0-9]|5[0-3]))?$');

-- ─────────────────────────────────────────
-- 2. O intervalo da semana, em São Paulo.
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
  elsif p_periodo ~ '^\d{4}-S(0[1-9]|[1-4][0-9]|5[0-3])$' then
    -- Segunda-feira da semana ISO: ano ISO, semana ISO e dia 1.
    v_inicio := to_date(replace(p_periodo, '-S', '-') || '-1', 'IYYY-IW-ID');
    v_fim := v_inicio + 7;
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
-- 3. O registro confere o tipo de contribuição do período (resposta 2):
--    semana, quem trouxe item; mês, quem comprou ou doou dinheiro; ano, qualquer um.
-- ─────────────────────────────────────────

create or replace function public.registrar_agradecimento(p_client_id uuid, p_periodo text, p_canal text)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_desde    timestamptz;
  v_ate      timestamptz;
  v_compras  boolean;
  v_dinheiro boolean;
  v_itens    boolean;
  v_phone    text;
  v_email    text;
  v_contato  text;
begin
  if not public.eh_caixa_ou_coordenacao() then
    raise exception 'só o caixa e a coordenação agradecem' using errcode = '42501';
  end if;
  if p_canal not in ('whatsapp', 'email') then
    raise exception 'canal inválido' using errcode = '22023';
  end if;
  select i.desde, i.ate into v_desde, v_ate from public.intervalo_do_periodo(p_periodo) i;

  v_compras := exists (select 1 from public.sales s where s.client_id = p_client_id and s.deleted_at is null and s.sold_at >= v_desde and s.sold_at < v_ate);
  v_dinheiro := exists (select 1 from public.donations_cash d where d.client_id = p_client_id and d.deleted_at is null and d.donated_at >= v_desde and d.donated_at < v_ate);
  v_itens := exists (select 1 from public.donations_items i where i.client_id = p_client_id and i.deleted_at is null and i.donated_at >= v_desde and i.donated_at < v_ate);

  if (p_periodo ~ '-S' and not v_itens)
     or (p_periodo ~ '^\d{4}-\d{2}$' and not (v_compras or v_dinheiro))
     or (p_periodo ~ '^\d{4}$' and not (v_compras or v_dinheiro or v_itens)) then
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
