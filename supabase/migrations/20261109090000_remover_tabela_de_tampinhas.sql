-- TS-04 · Remover a tabela antiga de tampinhas
-- Desde a US-11 (Sprint 4), tampinha é doação de item da categoria "tampinha",
-- com o mesmo id da linha antiga. A tabela donations_caps ficou congelada e vazia.
-- Primeiro saem as citações (view e funções), depois a tabela.

-- ─────────────────────────────────────────
-- 1. clients_view sem a tabela antiga. Mesmas colunas, na mesma ordem
--    (definição da SEC-05), então "create or replace" basta e mantém as permissões.
-- ─────────────────────────────────────────

create or replace view public.clients_view
with (security_invoker = true) as
select
  c.id,
  c.name,
  public.telefone_da_pessoa(c.id) as phone,
  (not public.eh_coordenacao()) as phone_masked,
  c.email,
  c.birthday,
  c.member_since,
  c.created_at,
  coalesce(array_remove(array_agg(distinct t.name), null), '{}') as tags,
  (select count(*) from public.sales s where s.client_id = c.id) as purchase_count,
  coalesce((select sum(si.amount) from public.sale_items si join public.sales s on s.id = si.sale_id where s.client_id = c.id), 0) as total_spent,
  (select max(s.sold_at) from public.sales s where s.client_id = c.id) as last_purchase_at,
  (select count(*) from public.donations_cash dc where dc.client_id = c.id)
   + (select count(*) from public.donations_items di where di.client_id = c.id) as donation_count,
  coalesce((select sum(dc.amount) from public.donations_cash dc where dc.client_id = c.id), 0) as donation_total,
  greatest(
    (select max(dc.donated_at) from public.donations_cash dc where dc.client_id = c.id),
    (select max(di.donated_at) from public.donations_items di where di.client_id = c.id)
  ) as last_donation_at
from public.clients c
left join public.client_tags ct on ct.client_id = c.id
left join public.tags t on t.id = ct.tag_id
group by c.id;

-- ─────────────────────────────────────────
-- 2. buscar_pessoas (US-06) sem a tabela antiga. Mesmo corpo, menos uma linha.
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
  from public.clients c
  cross join termo
  where public.eh_equipe()
    and length(termo.texto) >= 2
    and (
      position(termo.texto in extensions.unaccent(lower(c.name))) > 0
      or position(termo.texto in extensions.unaccent(lower(coalesce(c.nickname, '')))) > 0
      or (
        length(termo.digitos) >= 4
        and position(termo.digitos in regexp_replace(coalesce(c.phone, ''), '\D', '', 'g')) > 0
      )
    )
  order by
    (extensions.unaccent(lower(c.name)) like termo.texto || '%'
      or extensions.unaccent(lower(coalesce(c.nickname, ''))) like termo.texto || '%') desc,
    c.name
  limit least(greatest(coalesce(p_limite, 8), 1), 20)
$$;

-- ─────────────────────────────────────────
-- 3. mesclar_fichas (US-08b) sem o passo das tampinhas antigas.
--    Mesmo corpo da US-08b; mesclagens novas não guardam a lista donations_caps.
-- ─────────────────────────────────────────

create or replace function public.mesclar_fichas(p_manter uuid, p_juntar uuid)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_manter    public.clients%rowtype;
  v_juntar    public.clients%rowtype;
  v_antes     jsonb := '{}'::jsonb;
  v_copia     jsonb;
  v_vendas    uuid[];
  v_dinheiro  uuid[];
  v_itens     uuid[];
  v_mensagens uuid[];
  v_etiquetas uuid[];
  v_id        uuid;
begin
  if not public.eh_coordenacao() then
    raise exception 'Só a coordenação mescla fichas.' using errcode = '42501';
  end if;
  if p_manter is null or p_juntar is null or p_manter = p_juntar then
    raise exception 'Escolha duas fichas diferentes.' using errcode = '22023';
  end if;

  update public.client_merges
     set removed_snapshot = null
   where removed_snapshot is not null
     and merged_at < now() - interval '30 days';

  perform 1 from public.clients where id in (p_manter, p_juntar) order by id for update;

  select * into v_manter from public.clients where id = p_manter;
  if not found then
    raise exception 'A ficha que fica não existe.' using errcode = 'P0002';
  end if;
  select * into v_juntar from public.clients where id = p_juntar;
  if not found then
    raise exception 'A ficha que sai não existe.' using errcode = 'P0002';
  end if;

  v_copia := to_jsonb(v_juntar) || jsonb_build_object(
    '_etiquetas',
    coalesce((select jsonb_agg(ct.tag_id) from public.client_tags ct where ct.client_id = p_juntar), '[]'::jsonb)
  );

  with m as (update public.sales set client_id = p_manter where client_id = p_juntar returning id)
  select coalesce(array_agg(m.id), '{}') into v_vendas from m;

  with m as (update public.donations_cash set client_id = p_manter where client_id = p_juntar returning id)
  select coalesce(array_agg(m.id), '{}') into v_dinheiro from m;

  with m as (update public.donations_items set client_id = p_manter where client_id = p_juntar returning id)
  select coalesce(array_agg(m.id), '{}') into v_itens from m;

  with m as (update public.message_consents set client_id = p_manter where client_id = p_juntar returning id)
  select coalesce(array_agg(m.id), '{}') into v_mensagens from m;

  with t as (
    insert into public.client_tags (client_id, tag_id)
    select p_manter, ct.tag_id from public.client_tags ct where ct.client_id = p_juntar
    on conflict do nothing
    returning tag_id
  )
  select coalesce(array_agg(t.tag_id), '{}') into v_etiquetas from t;

  if coalesce(btrim(v_manter.phone), '') = '' and coalesce(btrim(v_juntar.phone), '') <> '' then
    v_antes := v_antes || jsonb_build_object('phone', v_manter.phone);
    update public.clients set phone = v_juntar.phone where id = p_manter;
  end if;
  if coalesce(btrim(v_manter.email), '') = '' and coalesce(btrim(v_juntar.email), '') <> '' then
    v_antes := v_antes || jsonb_build_object('email', v_manter.email);
    update public.clients set email = v_juntar.email where id = p_manter;
  end if;
  if coalesce(btrim(v_manter.birthday), '') = '' and coalesce(btrim(v_juntar.birthday), '') <> '' then
    v_antes := v_antes || jsonb_build_object('birthday', v_manter.birthday);
    update public.clients set birthday = v_juntar.birthday where id = p_manter;
  end if;
  if coalesce(btrim(v_manter.nickname), '') = '' and coalesce(btrim(v_juntar.nickname), '') <> '' then
    v_antes := v_antes || jsonb_build_object('nickname', v_manter.nickname);
    update public.clients set nickname = v_juntar.nickname where id = p_manter;
  end if;
  if v_juntar.member_since is not null
     and (v_manter.member_since is null or v_juntar.member_since < v_manter.member_since) then
    v_antes := v_antes || jsonb_build_object('member_since', v_manter.member_since);
    update public.clients set member_since = v_juntar.member_since where id = p_manter;
  end if;

  delete from public.clients where id = p_juntar;

  insert into public.client_merges (kept_id, removed_id, removed_name, removed_snapshot, kept_before, moved, merged_by)
  values (
    p_manter, p_juntar, v_juntar.name, v_copia, v_antes,
    jsonb_build_object(
      'sales',            v_vendas,
      'donations_cash',   v_dinheiro,
      'donations_items',  v_itens,
      'message_consents', v_mensagens,
      'client_tags',      v_etiquetas
    ),
    auth.uid()
  )
  returning id into v_id;

  return v_id;
end;
$$;

-- ─────────────────────────────────────────
-- 4. desfazer_mesclagem (US-08b) sem o update da tabela antiga. Mesclagem feita
--    antes da US-11 guardou as tampinhas em moved->'donations_caps'; elas estão
--    em donations_items com o mesmo id, e continuam sendo procuradas lá.
-- ─────────────────────────────────────────

create or replace function public.desfazer_mesclagem(p_mesclagem uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_m public.client_merges%rowtype;
begin
  if not public.eh_coordenacao() then
    raise exception 'Só a coordenação desfaz mesclagens.' using errcode = '42501';
  end if;

  select * into v_m from public.client_merges where id = p_mesclagem for update;
  if not found then
    raise exception 'Mesclagem não encontrada.' using errcode = 'P0002';
  end if;
  if v_m.undone_at is not null then
    raise exception 'Esta mesclagem já foi desfeita.' using errcode = '22023';
  end if;
  if v_m.removed_snapshot is null or v_m.merged_at < now() - interval '30 days' then
    raise exception 'Passaram os 30 dias: esta mesclagem não pode mais ser desfeita.' using errcode = '22023';
  end if;
  perform 1 from public.clients where id = v_m.kept_id for update;

  insert into public.clients
  select * from jsonb_populate_record(null::public.clients, v_m.removed_snapshot);

  insert into public.client_tags (client_id, tag_id)
  select v_m.removed_id, e.valor::uuid
    from jsonb_array_elements_text(v_m.removed_snapshot->'_etiquetas') as e(valor)
   where exists (select 1 from public.tags t where t.id = e.valor::uuid)
  on conflict do nothing;

  update public.sales set client_id = v_m.removed_id
   where client_id = v_m.kept_id
     and id in (select e.valor::uuid from jsonb_array_elements_text(v_m.moved->'sales') as e(valor));

  update public.donations_cash set client_id = v_m.removed_id
   where client_id = v_m.kept_id
     and id in (select e.valor::uuid from jsonb_array_elements_text(v_m.moved->'donations_cash') as e(valor));

  -- coalesce: mesclagem nova não tem a chave donations_caps.
  update public.donations_items set client_id = v_m.removed_id
   where client_id = v_m.kept_id
     and id in (
       select e.valor::uuid from jsonb_array_elements_text(coalesce(v_m.moved->'donations_items', '[]'::jsonb)) as e(valor)
       union all
       select e.valor::uuid from jsonb_array_elements_text(coalesce(v_m.moved->'donations_caps', '[]'::jsonb)) as e(valor)
     );

  update public.message_consents set client_id = v_m.removed_id
   where client_id = v_m.kept_id
     and id in (select e.valor::uuid from jsonb_array_elements_text(v_m.moved->'message_consents') as e(valor));

  delete from public.client_tags
   where client_id = v_m.kept_id
     and tag_id in (select e.valor::uuid from jsonb_array_elements_text(v_m.moved->'client_tags') as e(valor));

  if v_m.kept_before ? 'phone' then
    update public.clients set phone = v_m.kept_before->>'phone'
     where id = v_m.kept_id and phone is not distinct from v_m.removed_snapshot->>'phone';
  end if;
  if v_m.kept_before ? 'email' then
    update public.clients set email = v_m.kept_before->>'email'
     where id = v_m.kept_id and email is not distinct from v_m.removed_snapshot->>'email';
  end if;
  if v_m.kept_before ? 'birthday' then
    update public.clients set birthday = v_m.kept_before->>'birthday'
     where id = v_m.kept_id and birthday is not distinct from v_m.removed_snapshot->>'birthday';
  end if;
  if v_m.kept_before ? 'nickname' then
    update public.clients set nickname = v_m.kept_before->>'nickname'
     where id = v_m.kept_id and nickname is not distinct from v_m.removed_snapshot->>'nickname';
  end if;
  if v_m.kept_before ? 'member_since' then
    update public.clients set member_since = (v_m.kept_before->>'member_since')::int
     where id = v_m.kept_id and member_since is not distinct from (v_m.removed_snapshot->>'member_since')::int;
  end if;

  update public.client_merges
     set undone_at = now(), undone_by = auth.uid()
   where id = p_mesclagem;
end;
$$;

-- ─────────────────────────────────────────
-- 5. A tabela sai, com as políticas e o índice. Se ainda houver linha, a
--    migração para: nada de apagar dado sem conferir.
-- ─────────────────────────────────────────

do $$
begin
  if exists (select 1 from public.donations_caps) then
    raise exception 'donations_caps ainda tem linhas; confira antes de apagar (TS-04).';
  end if;
end $$;

drop table public.donations_caps;
