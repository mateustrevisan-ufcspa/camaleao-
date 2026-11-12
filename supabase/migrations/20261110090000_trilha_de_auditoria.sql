-- SEC-04 · Trilha de auditoria de alterações e cancelamentos
-- Quem alterou ou excluiu, quando, o que mudou e por quê, gravado pelo banco.
-- Ninguém altera nem apaga a trilha pela API.

-- ─────────────────────────────────────────
-- 1. Motivo: viaja na própria linha, no mesmo update. O gatilho leva para a
--    trilha e limpa a coluna.
-- ─────────────────────────────────────────

alter table public.donations_items add column if not exists motivo_da_alteracao text;
alter table public.donations_cash  add column if not exists motivo_da_alteracao text;
alter table public.sales           add column if not exists motivo_da_alteracao text;

-- donations_items tem permissão de alteração por coluna desde a US-04a.
grant update (motivo_da_alteracao) on public.donations_items to authenticated;

-- ─────────────────────────────────────────
-- 2. A trilha.
-- ─────────────────────────────────────────

create table public.trilha_de_auditoria (
  id          bigint generated always as identity primary key,
  tabela      text not null,
  registro_id uuid not null,
  acao        text not null check (acao in ('alteracao', 'exclusao')),
  campos      text[] not null default '{}',
  antes       jsonb,
  depois      jsonb,
  motivo      text,
  feito_por   uuid references public.users(id) on delete set null,
  feito_em    timestamptz not null default now()
);

create index idx_trilha_registro on public.trilha_de_auditoria (tabela, registro_id, feito_em desc);
create index idx_trilha_feito_em on public.trilha_de_auditoria (feito_em desc);

alter table public.trilha_de_auditoria enable row level security;

create policy "coordenacao le" on public.trilha_de_auditoria
  for select to authenticated using (public.eh_coordenacao());

-- Sem política de insert, update nem delete: só o gatilho grava.
revoke all on public.trilha_de_auditoria from anon;
revoke insert, update, delete, truncate on public.trilha_de_auditoria from authenticated;
grant select on public.trilha_de_auditoria to authenticated;

-- ─────────────────────────────────────────
-- 3. Valor que vai para a trilha. Telefone e e-mail não são guardados: nem os
--    da ficha, nem o telefone do doador escrito na doação ou na venda (SEC-05).
-- ─────────────────────────────────────────

create or replace function public.valor_para_trilha(p_tabela text, p_campo text, p_valor jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select case
    when p_campo in ('phone', 'email', 'donor_phone') and p_valor is not null and p_valor <> 'null'::jsonb
      then to_jsonb('(alterado)'::text)
    else p_valor
  end
$$;

-- ─────────────────────────────────────────
-- 4. O gatilho. security definer: grava numa tabela que ninguém grava pela API.
--    auth.uid() continua sendo quem fez a alteração.
-- ─────────────────────────────────────────

create or replace function public.registrar_na_trilha()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_antes    jsonb := to_jsonb(old);
  v_depois   jsonb;
  v_campos   text[];
  v_motivo   text;
  v_acao     text := 'alteracao';
  v_contexto text;
begin
  -- A mesclagem (US-08b) e o desfazer têm registro próprio (client_merges):
  -- o que elas alteram e apagam fica fora da trilha. Olhar a pilha de chamadas
  -- evita recriar as duas funções (a TS-04 também as recria).
  get diagnostics v_contexto = pg_context;
  if v_contexto like '%mesclar_fichas(%' or v_contexto like '%desfazer_mesclagem(%' then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;

  if tg_op = 'DELETE' then
    insert into public.trilha_de_auditoria (tabela, registro_id, acao, campos, antes, motivo, feito_por)
    values (
      tg_table_name,
      old.id,
      'exclusao',
      '{}',
      (select jsonb_object_agg(k, public.valor_para_trilha(tg_table_name, k, v_antes -> k))
         from jsonb_object_keys(v_antes) k
        where k <> 'motivo_da_alteracao'),
      nullif(btrim(v_antes ->> 'motivo_da_alteracao'), ''),
      auth.uid()
    );
    return old;
  end if;

  v_depois := to_jsonb(new);
  v_motivo := nullif(btrim(v_depois ->> 'motivo_da_alteracao'), '');

  select coalesce(array_agg(k order by k), '{}') into v_campos
    from jsonb_object_keys(v_depois) k
   where k not in ('motivo_da_alteracao', 'created_at')
     and (v_antes -> k) is distinct from (v_depois -> k);

  -- Nada mudou, ou só o vínculo com a ficha (US-14; ficha apagada põe client_id
  -- nulo nas doações): fora da trilha.
  if v_campos = '{}' or v_campos = array['client_id'] then
    new := jsonb_populate_record(new, '{"motivo_da_alteracao": null}'::jsonb);
    return new;
  end if;

  if 'deleted_at' = any (v_campos) and (v_antes ->> 'deleted_at') is null and (v_depois ->> 'deleted_at') is not null then
    v_acao := 'exclusao';
  end if;

  insert into public.trilha_de_auditoria (tabela, registro_id, acao, campos, antes, depois, motivo, feito_por)
  values (
    tg_table_name,
    new.id,
    v_acao,
    v_campos,
    (select jsonb_object_agg(k, public.valor_para_trilha(tg_table_name, k, v_antes -> k)) from unnest(v_campos) k),
    (select jsonb_object_agg(k, public.valor_para_trilha(tg_table_name, k, v_depois -> k)) from unnest(v_campos) k),
    v_motivo,
    auth.uid()
  );

  -- O motivo desta alteração não fica na linha (não vale para a próxima).
  -- Em tabela sem a coluna, o jsonb_populate_record ignora a chave.
  new := jsonb_populate_record(new, '{"motivo_da_alteracao": null}'::jsonb);
  return new;
end;
$$;

revoke execute on function public.registrar_na_trilha() from public, anon, authenticated;

-- ─────────────────────────────────────────
-- 5. As sete tabelas. Os gatilhos before rodam em ordem alfabética do nome:
--    carimbo_da_triagem (US-27) e liquido_da_doacao (US-35) vêm antes, e a
--    trilha já vê o que eles preencheram.
-- ─────────────────────────────────────────

create trigger trilha_de_auditoria before update or delete on public.donations_items
  for each row execute function public.registrar_na_trilha();
create trigger trilha_de_auditoria before update or delete on public.donations_cash
  for each row execute function public.registrar_na_trilha();
create trigger trilha_de_auditoria before update or delete on public.sales
  for each row execute function public.registrar_na_trilha();
create trigger trilha_de_auditoria before update or delete on public.clients
  for each row execute function public.registrar_na_trilha();
create trigger trilha_de_auditoria before update or delete on public.events
  for each row execute function public.registrar_na_trilha();
create trigger trilha_de_auditoria before update or delete on public.campaigns
  for each row execute function public.registrar_na_trilha();
create trigger trilha_de_auditoria before update or delete on public.item_categories
  for each row execute function public.registrar_na_trilha();

-- ─────────────────────────────────────────
-- 6. Excluir doação de item passa a pedir o motivo. Mesmo corpo da US-04a,
--    com o motivo gravado no mesmo update que marca a exclusão.
--    Pergunta 4 (09/11): o Instituto quer motivo opcional na correção. Na
--    exclusão ele continua obrigatório, como proposto ao Instituto, porque a
--    doação excluída some das somas e do recibo. Decidir junto com a US-04b.
-- ─────────────────────────────────────────

drop function if exists public.excluir_doacao_de_item(uuid);

create function public.excluir_doacao_de_item(p_id uuid, p_motivo text)
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
  if length(btrim(coalesce(p_motivo, ''))) < 3 then
    raise exception 'informe o motivo da exclusão' using errcode = '22023';
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
     set deleted_at = now(), deleted_by = auth.uid(), motivo_da_alteracao = left(btrim(p_motivo), 300)
   where id = p_id;
end;
$$;

revoke execute on function public.excluir_doacao_de_item(uuid, text) from public, anon;
grant execute on function public.excluir_doacao_de_item(uuid, text) to authenticated;
