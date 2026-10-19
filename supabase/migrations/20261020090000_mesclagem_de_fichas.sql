-- US-08b · Mesclagem de duas fichas
-- Junta duas fichas da mesma pessoa em uma só, numa transação, guardando o
-- estado anterior para desfazer em até 30 dias. Só a coordenação.

-- ─────────────────────────────────────────
-- 1. Registro de cada mesclagem: é o "estado anterior" que permite desfazer.
-- ─────────────────────────────────────────

create table public.client_merges (
  id               uuid primary key default gen_random_uuid(),
  kept_id          uuid not null references public.clients(id) on delete cascade,
  removed_id       uuid not null,
  removed_name     text not null,
  -- A ficha que saiu, inteira, com as etiquetas em "_etiquetas". Vira null
  -- passados 30 dias: depois do prazo de desfazer, a cópia não tem finalidade.
  removed_snapshot jsonb,
  -- Campos da ficha que ficou que a mesclagem preencheu, com o valor de antes.
  kept_before      jsonb not null default '{}'::jsonb,
  -- Ids dos registros transferidos, por tabela.
  moved            jsonb not null,
  merged_at        timestamptz not null default now(),
  merged_by        uuid references public.users(id) on delete set null,
  undone_at        timestamptz,
  undone_by        uuid references public.users(id) on delete set null
);

create index idx_client_merges_kept      on public.client_merges (kept_id);
create index idx_client_merges_merged_at on public.client_merges (merged_at desc);

alter table public.client_merges enable row level security;

create policy "coordenacao le" on public.client_merges
  for select to authenticated using (public.eh_coordenacao());

-- Ninguém grava pela API: só as funções abaixo. E a cópia da ficha que saiu
-- (com o telefone inteiro) não é lida pela API, nem pela coordenação.
revoke all on public.client_merges from anon, authenticated;
grant select (id, kept_id, removed_id, removed_name, merged_at, merged_by, undone_at, undone_by)
  on public.client_merges to authenticated;

-- ─────────────────────────────────────────
-- 2. mesclar_fichas: junta p_juntar em p_manter e apaga p_juntar.
--    security definer: move autorizações de mensagem (que ninguém altera pela
--    API) e lê o telefone (que nenhum perfil lê direto desde a SEC-05).
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
  v_tampinhas uuid[];
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

  -- Passado o prazo de desfazer, a cópia das fichas que saíram não tem mais
  -- finalidade e sai (guardar o mínimo de dado pessoal).
  update public.client_merges
     set removed_snapshot = null
   where removed_snapshot is not null
     and merged_at < now() - interval '30 days';

  -- Trava as duas fichas, sempre na mesma ordem, até o fim da transação.
  perform 1 from public.clients where id in (p_manter, p_juntar) order by id for update;

  select * into v_manter from public.clients where id = p_manter;
  if not found then
    raise exception 'A ficha que fica não existe.' using errcode = 'P0002';
  end if;
  select * into v_juntar from public.clients where id = p_juntar;
  if not found then
    raise exception 'A ficha que sai não existe.' using errcode = 'P0002';
  end if;

  -- 1. Cópia da ficha que sai, com as etiquetas.
  v_copia := to_jsonb(v_juntar) || jsonb_build_object(
    '_etiquetas',
    coalesce((select jsonb_agg(ct.tag_id) from public.client_tags ct where ct.client_id = p_juntar), '[]'::jsonb)
  );

  -- 2. Compras, doações e autorizações de mensagem passam para a ficha que fica.
  with m as (update public.sales set client_id = p_manter where client_id = p_juntar returning id)
  select coalesce(array_agg(m.id), '{}') into v_vendas from m;

  with m as (update public.donations_cash set client_id = p_manter where client_id = p_juntar returning id)
  select coalesce(array_agg(m.id), '{}') into v_dinheiro from m;

  with m as (update public.donations_items set client_id = p_manter where client_id = p_juntar returning id)
  select coalesce(array_agg(m.id), '{}') into v_itens from m;

  with m as (update public.donations_caps set client_id = p_manter where client_id = p_juntar returning id)
  select coalesce(array_agg(m.id), '{}') into v_tampinhas from m;

  with m as (update public.message_consents set client_id = p_manter where client_id = p_juntar returning id)
  select coalesce(array_agg(m.id), '{}') into v_mensagens from m;

  -- 3. Etiquetas: a ficha que fica ganha as que não tinha.
  with t as (
    insert into public.client_tags (client_id, tag_id)
    select p_manter, ct.tag_id from public.client_tags ct where ct.client_id = p_juntar
    on conflict do nothing
    returning tag_id
  )
  select coalesce(array_agg(t.tag_id), '{}') into v_etiquetas from t;

  -- 4. Campo vazio na ficha que fica recebe o valor da que sai; o que já está
  --    preenchido não muda. v_antes guarda o valor anterior, para desfazer.
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
  -- Ano de entrada: fica o mais antigo.
  if v_juntar.member_since is not null
     and (v_manter.member_since is null or v_juntar.member_since < v_manter.member_since) then
    v_antes := v_antes || jsonb_build_object('member_since', v_manter.member_since);
    update public.clients set member_since = v_juntar.member_since where id = p_manter;
  end if;

  -- 5. A ficha que sai é apagada. Os registros dela já estão na que fica.
  delete from public.clients where id = p_juntar;

  insert into public.client_merges (kept_id, removed_id, removed_name, removed_snapshot, kept_before, moved, merged_by)
  values (
    p_manter, p_juntar, v_juntar.name, v_copia, v_antes,
    jsonb_build_object(
      'sales',            v_vendas,
      'donations_cash',   v_dinheiro,
      'donations_items',  v_itens,
      'donations_caps',   v_tampinhas,
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
-- 3. desfazer_mesclagem: em até 30 dias, as duas fichas voltam como eram.
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

  -- 1. A ficha que saiu volta, com o mesmo id, e as etiquetas dela.
  insert into public.clients
  select * from jsonb_populate_record(null::public.clients, v_m.removed_snapshot);

  insert into public.client_tags (client_id, tag_id)
  select v_m.removed_id, e.valor::uuid
    from jsonb_array_elements_text(v_m.removed_snapshot->'_etiquetas') as e(valor)
   where exists (select 1 from public.tags t where t.id = e.valor::uuid)
  on conflict do nothing;

  -- 2. Os registros transferidos voltam, se ainda estiverem na ficha que ficou.
  --    O que foi lançado na ficha que ficou depois da mesclagem continua nela.
  update public.sales set client_id = v_m.removed_id
   where client_id = v_m.kept_id
     and id in (select e.valor::uuid from jsonb_array_elements_text(v_m.moved->'sales') as e(valor));

  update public.donations_cash set client_id = v_m.removed_id
   where client_id = v_m.kept_id
     and id in (select e.valor::uuid from jsonb_array_elements_text(v_m.moved->'donations_cash') as e(valor));

  -- A US-11 leva as tampinhas para donations_items com o mesmo id. Por isso as
  -- tampinhas de uma mesclagem anterior a ela também são procuradas aqui.
  update public.donations_items set client_id = v_m.removed_id
   where client_id = v_m.kept_id
     and id in (
       select e.valor::uuid from jsonb_array_elements_text(v_m.moved->'donations_items') as e(valor)
       union all
       select e.valor::uuid from jsonb_array_elements_text(v_m.moved->'donations_caps') as e(valor)
     );

  update public.donations_caps set client_id = v_m.removed_id
   where client_id = v_m.kept_id
     and id in (select e.valor::uuid from jsonb_array_elements_text(v_m.moved->'donations_caps') as e(valor));

  update public.message_consents set client_id = v_m.removed_id
   where client_id = v_m.kept_id
     and id in (select e.valor::uuid from jsonb_array_elements_text(v_m.moved->'message_consents') as e(valor));

  -- 3. Sai da ficha que ficou a etiqueta que só chegou com a mesclagem.
  delete from public.client_tags
   where client_id = v_m.kept_id
     and tag_id in (select e.valor::uuid from jsonb_array_elements_text(v_m.moved->'client_tags') as e(valor));

  -- 4. Campo preenchido pela mesclagem volta ao valor anterior, se ninguém o
  --    mudou depois (o valor atual ainda é o que veio da ficha que saiu).
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

revoke execute on function public.mesclar_fichas(uuid, uuid) from public, anon;
grant  execute on function public.mesclar_fichas(uuid, uuid) to authenticated;
revoke execute on function public.desfazer_mesclagem(uuid) from public, anon;
grant  execute on function public.desfazer_mesclagem(uuid) to authenticated;
