# US-08b · Mesclagem de duas fichas (8 SP)

> Como coordenadora do Instituto, eu quero juntar em uma só as fichas que são da mesma pessoa, para que o histórico dela não fique dividido e ninguém seja agradecido duas vezes.

**Tipo:** user story · **Épico:** Ficha única (pedido N) · **Implementa:** Mateus · **Revisa:** Alissa · **Branch:** `us-08b-mesclagem-de-fichas` · **Depende de:** nada para começar. A US-08a, que aponta os pares repetidos, integra depois desta e leva para a tela daqui.

## De onde vem

A US-08 (13 SP) foi quebrada no planejamento de 16/10, como a régua pede para histórias de 13. Os critérios ficaram assim:

| Critério da US-08 | Fica em |
| --- | --- |
| Deve apontar fichas com nome parecido ou telefone igual | US-08a |
| Deve mostrar, antes de confirmar, o que será fundido | **US-08b** |
| Deve executar a fusão em transação única, guardando o estado anterior | **US-08b** |
| Deve transferir compras, doações, eventos e tags para a ficha mantida | **US-08b** |
| Deve permitir desfazer a mesclagem por até 30 dias | **US-08b** |
| Deve restringir a operação ao perfil de coordenação | as duas |

## Critérios de aceitação

- [ ] Deve mostrar, antes de confirmar, o que será fundido
- [ ] Deve executar a fusão em transação única, guardando o estado anterior
- [ ] Deve transferir compras, doações, eventos e tags para a ficha mantida
- [ ] Deve permitir desfazer a mesclagem por até 30 dias
- [ ] Deve restringir a operação ao perfil de coordenação

## Decisões

- **A fusão é uma função do banco,** `mesclar_fichas(manter, juntar)`, em `plpgsql`: tudo acontece numa transação só, ou nada acontece. É `security definer` porque mexe em tabelas que a coordenação não altera pela API (autorizações de mensagem) e lê o telefone, que nenhum perfil lê direto desde a SEC-05. A primeira linha confere `eh_coordenacao()`.
- **O que passa para a ficha que fica:** compras, doações (dinheiro, itens e tampinhas), autorizações de mensagem e etiquetas. "Eventos" do critério são doações em dinheiro com evento (US-12), então vão junto com as doações.
- **Campo vazio na ficha que fica recebe o valor da que sai** (telefone, e-mail, aniversário, apelido). O que já está preenchido não muda. O ano de entrada fica o mais antigo dos dois.
- **A ficha que sai é apagada.** Assim nenhuma outra tela precisa aprender a esconder fichas mescladas.
- **O estado anterior fica em `client_merges`:** uma cópia da ficha que saiu (com as etiquetas), os ids de cada registro transferido e o valor anterior de cada campo preenchido.
- **Desfazer** (`desfazer_mesclagem`) recria a ficha que saiu com o mesmo id, devolve os registros que ainda estão na ficha que ficou, tira as etiquetas que só chegaram com a mesclagem e volta os campos preenchidos, se ninguém os mudou depois. O que foi lançado na ficha que ficou depois da mesclagem continua nela.
- **30 dias.** Depois do prazo a função recusa, e a cópia da ficha que saiu é apagada na próxima mesclagem (dado pessoal sem finalidade não fica guardado).
- **A cópia não sai pela API,** nem para a coordenação: a tabela libera para leitura só as colunas de identificação, e a cópia é lida só pelas funções.
- **A autorização de mensagens anda junto.** As linhas do histórico de autorização (US-07) mudam de ficha, sem perder data e versão do termo. A situação que vale depois é a decisão mais recente das duas fichas.
- **Telas:** `/clientes/mesclar` mostra as duas fichas lado a lado, o resultado e a lista das mesclagens dos últimos 30 dias, com o botão de desfazer. Na tela Clientes, a coordenação vê o atalho "Mesclar com outra ficha" acima da ficha aberta. A rota já está em `lib/rotas.ts`.
- **A US-08a chega depois** com a lista de pares e um link para esta tela com as duas fichas já escolhidas (`?manter=...&juntar=...`).

## 1. Branch

```bash
git checkout main && git pull
git checkout -b us-08b-mesclagem-de-fichas
git push -u origin us-08b-mesclagem-de-fichas
npm ci
```

---

## Parte A · Banco

### A1. Migração nova

Arquivo novo: `supabase/migrations/20261020090000_mesclagem_de_fichas.sql`.

```sql
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
```

### A2. Conferir no banco

```bash
npm run db:reset
```

O `db:reset` tem de passar sem erro. A conferência da fusão e do desfazer é o teste de acesso (Parte D), que monta duas fichas, mescla, confere e desfaz.

Pontos para olhar com calma ao rodar pela primeira vez:

- `insert into public.clients select * from jsonb_populate_record(...)`: a cópia é `to_jsonb` da linha inteira, então as colunas batem com a tabela. Se alguma story futura acrescentar coluna em `clients`, a cópia antiga volta com essa coluna vazia, o que é o esperado.
- As funções rodam como dona das tabelas e passam por cima das políticas, como `buscar_pessoas` (US-06). A trava é a primeira linha, `eh_coordenacao()`.

---

## Parte B · Dados

### B1. `types/index.ts`

No **fim do arquivo**, depois de `MessageConsent`:

```diff
 export interface MessageConsent {
   authorized: boolean
   term_version: string
   recorded_at: string
 }
+
+// Mesclagem de fichas (US-08b): uma linha da lista dos últimos 30 dias.
+export interface Mesclagem {
+  id: string
+  mantida: string
+  removida: string
+  merged_at: string
+  undone_at: string | null
+}
```

### B2. `lib/store.ts`: o import do topo

O tipo entra **depois de `Client,`** (é a linha reservada para a US-08b):

```diff
   Client,
+  Mesclagem,
   DonationCaps,
```

### B3. `lib/store.ts`: as funções

Logo **depois** de `updateClient` (e antes de `getDonations`):

```ts
// ── MESCLAGEM DE FICHAS (US-08b) ──
// Só a coordenação mescla e desfaz: as funções do banco conferem o perfil.

export async function getFichasParaMesclar(ids: string[]): Promise<Client[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('clients_view').select(COLUNAS_PESSOA).in('id', ids)
  if (error) throw new Error(error.message)
  return comApelidos((data ?? []) as Client[])
}

export async function mergeClients(manter: string, juntar: string): Promise<string> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('mesclar_fichas', { p_manter: manter, p_juntar: juntar })
  if (error) throw new Error(error.message)
  return data as string
}

export async function undoMerge(mesclagemId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.rpc('desfazer_mesclagem', { p_mesclagem: mesclagemId })
  if (error) throw new Error(error.message)
}

export async function getMesclagensRecentes(): Promise<Mesclagem[]> {
  const supabase = await createClient()
  const desde = new Date(Date.now() - 30 * DAY_MS).toISOString()
  const { data, error } = await supabase
    .from('client_merges')
    .select('id, kept_id, removed_name, merged_at, undone_at')
    .gte('merged_at', desde)
    .order('merged_at', { ascending: false })
  if (error) throw new Error(error.message)
  const linhas = data ?? []
  if (linhas.length === 0) return []

  const { data: mantidas, error: erroNomes } = await supabase
    .from('clients')
    .select('id, name')
    .in('id', linhas.map((l) => l.kept_id))
  if (erroNomes) throw new Error(erroNomes.message)
  const nomes = new Map((mantidas ?? []).map((c) => [c.id as string, c.name as string]))

  return linhas.map((l) => ({
    id: l.id,
    mantida: nomes.get(l.kept_id) ?? 'ficha apagada',
    removida: l.removed_name,
    merged_at: l.merged_at,
    undone_at: l.undone_at,
  }))
}
```

### B4. `actions/mesclagem.ts` (arquivo novo)

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { mergeClients, undoMerge } from '@/lib/store'

type Resultado = { ok: true } | { error: string }

// As mensagens de recusa vêm da função do banco e já estão em português.
function mensagem(e: unknown) {
  return e instanceof Error && e.message ? e.message : 'Não foi possível concluir. Tente novamente.'
}

export async function mesclarFichas(manter: string, juntar: string): Promise<Resultado> {
  try {
    await mergeClients(manter, juntar)
  } catch (e) {
    console.error('mesclarFichas error:', e)
    return { error: mensagem(e) }
  }
  revalidatePath('/clientes')
  revalidatePath('/clientes/mesclar')
  return { ok: true }
}

export async function desfazerMesclagem(mesclagemId: string): Promise<Resultado> {
  try {
    await undoMerge(mesclagemId)
  } catch (e) {
    console.error('desfazerMesclagem error:', e)
    return { error: mensagem(e) }
  }
  revalidatePath('/clientes')
  revalidatePath('/clientes/mesclar')
  return { ok: true }
}
```

---

## Parte C · Telas

### C1. `app/(admin)/clientes/mesclar/page.tsx` (arquivo novo)

```tsx
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { MesclarFichas } from '@/components/clients/mesclar-fichas'
import { getFichasParaMesclar, getMesclagensRecentes, getMessageConsent, getTags } from '@/lib/store'

export const dynamic = 'force-dynamic'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function MesclarFichasPage({
  searchParams,
}: {
  searchParams: Promise<{ manter?: string; juntar?: string }>
}) {
  const { manter, juntar } = await searchParams
  const ids = [manter, juntar].filter((v): v is string => !!v && UUID.test(v))

  const [fichas, mesclagens, tags] = await Promise.all([
    ids.length > 0 ? getFichasParaMesclar(ids) : Promise.resolve([]),
    getMesclagensRecentes(),
    getTags(),
  ])
  const fica = fichas.find((f) => f.id === manter) ?? null
  const sai = fichas.find((f) => f.id === juntar) ?? null
  const [autorizacaoFica, autorizacaoSai] = await Promise.all([
    fica ? getMessageConsent(fica.id) : Promise.resolve(null),
    sai ? getMessageConsent(sai.id) : Promise.resolve(null),
  ])

  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1100px]">
      <div className="mb-8">
        <Link
          href="/clientes"
          className="flex items-center gap-1 text-muted text-[13px] font-body no-underline hover:text-ink transition-colors w-fit"
        >
          <ChevronLeft size={14} /> Clientes
        </Link>
      </div>

      <h1 className="font-display text-[28px] md:text-[40px] text-ink font-semibold tracking-[-1px] m-0 mb-2">
        Mesclar fichas
      </h1>
      <p className="font-body text-muted text-sm mb-9 mt-2 max-w-[640px]">
        Junte duas fichas da mesma pessoa. Confira o resultado antes de confirmar: dá para desfazer em até 30 dias.
      </p>

      <MesclarFichas
        fica={fica}
        sai={sai}
        autorizacaoFica={autorizacaoFica}
        autorizacaoSai={autorizacaoSai}
        mesclagens={mesclagens}
        tags={tags}
      />
    </div>
  )
}
```

### C2. `components/clients/mesclar-fichas.tsx` (arquivo novo)

```tsx
'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftRight, GitMerge, Undo2 } from 'lucide-react'
import { ClientPicker } from '@/components/clients/client-picker'
import { desfazerMesclagem, mesclarFichas } from '@/actions/mesclagem'
import { formatBRL } from '@/lib/utils'
import type { Client, Mesclagem, MessageConsent, PessoaEncontrada } from '@/types'

interface DbTag { id: string; name: string; color: string; bg_color: string }

interface MesclarFichasProps {
  fica: Client | null
  sai: Client | null
  autorizacaoFica: MessageConsent | null
  autorizacaoSai: MessageConsent | null
  mesclagens: Mesclagem[]
  tags: DbTag[]
}

const DIA_MS = 24 * 60 * 60 * 1000

const vazio = (v?: string | null) => !v || v.trim() === ''
const valor = (v?: string | null) => (vazio(v) ? '' : (v as string))
const dataCurta = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })

// A ficha já escolhida, no formato que o ClientPicker mostra.
function comoPessoa(c: Client): PessoaEncontrada {
  return {
    id: c.id,
    name: c.name,
    nickname: c.nickname ?? '',
    phone_final: (c.phone ?? '').replace(/\D/g, '').slice(-4),
    tags: c.tags,
    ja_comprou: c.purchase_count > 0,
    ja_doou: c.donation_count > 0,
  }
}

function textoDaAutorizacao(a: MessageConsent | null) {
  if (!a) return 'não foi perguntada'
  return a.authorized ? 'autorizou' : 'retirou a autorização'
}

// Depois da mesclagem vale a decisão mais recente das duas fichas.
function autorizacaoDepois(a: MessageConsent | null, b: MessageConsent | null) {
  if (!a) return b
  if (!b) return a
  return new Date(a.recorded_at) >= new Date(b.recorded_at) ? a : b
}

// Mesma regra da função mesclar_fichas no banco: campo vazio na ficha que fica
// recebe o valor da que sai; o que já está preenchido não muda.
function linhasDaPrevia(fica: Client, sai: Client, aFica: MessageConsent | null, aSai: MessageConsent | null) {
  const campo = (a?: string | null, b?: string | null) => (vazio(a) ? valor(b) : valor(a))
  const anos = [fica.member_since, sai.member_since].filter((n) => Number.isFinite(n) && n > 0)
  const compras = (c: Client) => `${c.purchase_count} · R$ ${formatBRL(Number(c.total_spent))}`
  return [
    { rotulo: 'Nome', fica: fica.name, sai: sai.name, depois: fica.name },
    { rotulo: 'Apelido', fica: valor(fica.nickname), sai: valor(sai.nickname), depois: campo(fica.nickname, sai.nickname) },
    { rotulo: 'Telefone', fica: valor(fica.phone), sai: valor(sai.phone), depois: campo(fica.phone, sai.phone) },
    { rotulo: 'E-mail', fica: valor(fica.email), sai: valor(sai.email), depois: campo(fica.email, sai.email) },
    { rotulo: 'Aniversário', fica: valor(fica.birthday), sai: valor(sai.birthday), depois: campo(fica.birthday, sai.birthday) },
    {
      rotulo: 'Desde',
      fica: fica.member_since ? String(fica.member_since) : '',
      sai: sai.member_since ? String(sai.member_since) : '',
      depois: anos.length > 0 ? String(Math.min(...anos)) : '',
    },
    {
      rotulo: 'Etiquetas',
      fica: fica.tags.join(', '),
      sai: sai.tags.join(', '),
      depois: Array.from(new Set([...fica.tags, ...sai.tags])).join(', '),
    },
    {
      rotulo: 'Compras',
      fica: compras(fica),
      sai: compras(sai),
      depois: `${fica.purchase_count + sai.purchase_count} · R$ ${formatBRL(Number(fica.total_spent) + Number(sai.total_spent))}`,
    },
    { rotulo: 'Doações', fica: String(fica.donation_count), sai: String(sai.donation_count), depois: String(fica.donation_count + sai.donation_count) },
    {
      rotulo: 'Mensagens',
      fica: textoDaAutorizacao(aFica),
      sai: textoDaAutorizacao(aSai),
      depois: textoDaAutorizacao(autorizacaoDepois(aFica, aSai)),
    },
  ]
}

export function MesclarFichas({ fica, sai, autorizacaoFica, autorizacaoSai, mesclagens, tags }: MesclarFichasProps) {
  const router = useRouter()
  const [conferido, setConferido] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function ir(ficaId?: string, saiId?: string) {
    const p = new URLSearchParams()
    if (ficaId) p.set('manter', ficaId)
    if (saiId) p.set('juntar', saiId)
    const q = p.toString()
    setConferido(false)
    router.push(q ? `/clientes/mesclar?${q}` : '/clientes/mesclar')
  }

  function mesclar() {
    if (!fica || !sai) return
    setErro(null)
    startTransition(async () => {
      const res = await mesclarFichas(fica.id, sai.id)
      if ('error' in res) {
        setErro(res.error)
        return
      }
      setAviso(`${sai.name} foi juntada a ${fica.name}. Se foi engano, desfaça na lista abaixo em até 30 dias.`)
      ir()
    })
  }

  function desfazer(id: string) {
    setErro(null)
    startTransition(async () => {
      const res = await desfazerMesclagem(id)
      if ('error' in res) {
        setErro(res.error)
        return
      }
      setAviso('Mesclagem desfeita: as duas fichas voltaram como eram.')
      router.refresh()
    })
  }

  const mesmaFicha = !!fica && !!sai && fica.id === sai.id
  const linhas = fica && sai && !mesmaFicha ? linhasDaPrevia(fica, sai, autorizacaoFica, autorizacaoSai) : []

  return (
    <div className="flex flex-col gap-6">
      {aviso && (
        <div className="rounded-[10px] px-4 py-3 font-body text-[13px]" style={{ backgroundColor: '#DCEBE0', color: '#2E5C3E' }}>
          {aviso}
        </div>
      )}
      {erro && (
        <div className="rounded-[10px] px-4 py-3 font-body text-[13px]" style={{ backgroundColor: '#F8DCD2', color: '#D87560' }}>
          {erro}
        </div>
      )}

      <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
        <div className="bg-paper border border-rule rounded-[16px] p-6">
          <div className="text-[11px] font-body text-muted tracking-[1px] uppercase mb-3">Ficha que fica</div>
          <ClientPicker
            tags={tags}
            allowAnonymous={false}
            selected={fica ? comoPessoa(fica) : null}
            onSelect={(p) => ir(p?.id, sai?.id)}
          />
        </div>
        <div className="bg-paper border border-rule rounded-[16px] p-6">
          <div className="text-[11px] font-body text-muted tracking-[1px] uppercase mb-3">Ficha que sai</div>
          <ClientPicker
            tags={tags}
            allowAnonymous={false}
            selected={sai ? comoPessoa(sai) : null}
            onSelect={(p) => ir(fica?.id, p?.id)}
          />
        </div>
      </div>

      {mesmaFicha && (
        <p className="font-body text-sm text-muted m-0">Escolha duas fichas diferentes.</p>
      )}

      {fica && sai && linhas.length > 0 && (
        <div className="bg-paper border border-rule rounded-[16px] overflow-hidden">
          <div className="px-6 py-5 border-b border-rule flex flex-wrap justify-between items-start gap-3">
            <div className="max-w-[640px]">
              <h3 className="font-display text-xl text-ink font-medium m-0">O que vai acontecer</h3>
              <p className="font-body text-[13px] text-muted mt-1 mb-0">
                A ficha que sai é apagada. Compras, doações, etiquetas e autorização de mensagens passam para a que fica.
                Campo vazio na que fica recebe o valor da outra.
              </p>
            </div>
            <button type="button" onClick={() => ir(sai.id, fica.id)} className="chip bg-bg">
              <ArrowLeftRight size={11} /> Inverter: manter a outra
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-body min-w-[640px]">
              <thead>
                <tr className="bg-bg">
                  {['', 'Fica', 'Sai', 'Depois da mesclagem'].map((h) => (
                    <th key={h} className="text-left px-6 py-3.5 text-[11px] text-muted tracking-[1.5px] uppercase font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr key={l.rotulo} className="border-t border-rule">
                    <td className="px-6 py-3 text-[11px] text-muted tracking-[1px] uppercase">{l.rotulo}</td>
                    <td className="px-6 py-3 text-sm text-ink">{l.fica}</td>
                    <td className="px-6 py-3 text-sm text-muted">{l.sai}</td>
                    <td className="px-6 py-3 text-sm text-ink font-medium">{l.depois}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-5 border-t border-rule flex flex-wrap items-center justify-between gap-4">
            <label className="flex items-center gap-2 font-body text-sm text-ink cursor-pointer">
              <input type="checkbox" checked={conferido} onChange={(e) => setConferido(e.target.checked)} />
              Conferi: as duas fichas são da mesma pessoa.
            </label>
            <button
              type="button"
              onClick={mesclar}
              disabled={!conferido || isPending}
              className="btn-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <GitMerge size={14} /> {isPending ? 'Mesclando...' : 'Mesclar fichas'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-paper border border-rule rounded-[16px] overflow-hidden">
        <div className="px-6 py-5 border-b border-rule">
          <h3 className="font-display text-xl text-ink font-medium m-0">Mesclagens dos últimos 30 dias</h3>
        </div>
        {mesclagens.length === 0 ? (
          <p className="px-6 py-6 font-body text-sm text-muted italic m-0">Nenhuma mesclagem nos últimos 30 dias.</p>
        ) : (
          <ul data-testid="mesclagens-recentes" className="m-0 p-0 list-none">
            {mesclagens.map((m) => (
              <li key={m.id} className="px-6 py-4 border-b border-rule last:border-0 flex flex-wrap justify-between items-center gap-3">
                <div>
                  <div className="font-body text-sm text-ink">{m.removida} foi juntada a {m.mantida}</div>
                  <div className="font-mono text-[11px] text-muted mt-0.5">
                    {dataCurta(m.merged_at)}
                    {m.undone_at
                      ? ` · desfeita em ${dataCurta(m.undone_at)}`
                      : ` · dá para desfazer até ${dataCurta(new Date(new Date(m.merged_at).getTime() + 30 * DIA_MS).toISOString())}`}
                  </div>
                </div>
                {!m.undone_at && (
                  <button type="button" onClick={() => desfazer(m.id)} disabled={isPending} className="chip bg-bg">
                    <Undo2 size={11} /> Desfazer
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
```

### C3. Atalho na tela Clientes

`app/(admin)/clientes/page.tsx`: a página passa a saber se quem está logado é da coordenação.

```diff
 import { ClientsPageClient } from '@/components/clients/clients-page-client'
 import { getClients, getTags } from '@/lib/store'
+import { createClient } from '@/lib/supabase/server'
 
 export const dynamic = 'force-dynamic'
 
 export default async function ClientesPage() {
   const [clients, tags] = await Promise.all([getClients(), getTags()])
+  const supabase = await createClient()
+  const { data: { user } } = await supabase.auth.getUser()
+  const perfil = user
+    ? (await supabase.from('users').select('role').eq('id', user.id).maybeSingle()).data
+    : null
 
   return (
     <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1300px]">
-      <ClientsPageClient clients={clients} tags={tags} />
+      <ClientsPageClient clients={clients} tags={tags} ehCoordenacao={perfil?.role === 'admin'} />
     </div>
   )
 }
```

`components/clients/clients-page-client.tsx`: o atalho fica **acima** da ficha, fora de `client-profile.tsx` (que a US-10 está mudando).

```diff
 import { useState } from 'react'
-import { Plus } from 'lucide-react'
+import Link from 'next/link'
+import { GitMerge, Plus } from 'lucide-react'
 import { ClientsList } from '@/components/clients/clients-list'
```

```diff
 interface ClientsPageClientProps {
   clients: Client[]
   tags: DbTag[]
+  ehCoordenacao: boolean
 }
 
-export function ClientsPageClient({ clients: initial, tags }: ClientsPageClientProps) {
+export function ClientsPageClient({ clients: initial, tags, ehCoordenacao }: ClientsPageClientProps) {
```

```diff
         {selected ? (
-          <ClientProfile client={selected} onEdit={() => setShowEdit(true)} />
+          <div className="flex flex-col gap-3">
+            {ehCoordenacao && (
+              <Link href={`/clientes/mesclar?manter=${selected.id}`} className="chip bg-bg self-end no-underline">
+                <GitMerge size={11} /> Mesclar com outra ficha
+              </Link>
+            )}
+            <ClientProfile client={selected} onEdit={() => setShowEdit(true)} />
+          </div>
         ) : (
```

### C4. Conferir na tela

```bash
npm run db:reset
npm run env:local -- --force
npm run dev
```

Como coordenação (`voluntaria@camaleao.local`, senha `camaleao-local`):

1. Cadastre duas fichas de teste: "Teste Mesclar A" sem e-mail e "Teste Mesclar B" com e-mail e aniversário. Registre uma venda para a B.
2. Abra a A em **Clientes** e use **Mesclar com outra ficha**. Escolha a B como ficha que sai. A tabela mostra o e-mail e o aniversário da B na coluna "Depois da mesclagem", e 1 compra.
3. Tente **Mesclar fichas** sem marcar a conferência: o botão fica desligado. Marque e confirme.
4. Em **Clientes**, a B sumiu e a A tem a compra. A lista "Mesclagens dos últimos 30 dias" mostra a operação.
5. Use **Desfazer**: a B volta, com a compra, e a A volta sem e-mail.
6. Entre como caixa e abra `/clientes/mesclar` direto: volta para o brechó com o aviso de área restrita. O atalho não aparece na tela Clientes.

---

## Parte D · Testes

### D1. `tests/acesso/mesclagem.spec.ts` (arquivo novo)

```ts
// US-08b · Mesclagem de duas fichas, conferida pela API.
import { test, expect } from '@playwright/test'
import type { SupabaseClient } from '@supabase/supabase-js'
import { CAIXA, COORDENACAO, entrarNaApi, recusado } from './apoio'

const MARCA = 'TESTE US-08b'

let coordenacao: SupabaseClient
let caixa: SupabaseClient
let fica: string // sem e-mail, desde 2026, etiqueta "familiar"
let sai: string // com e-mail, desde 2024, etiqueta "brechó", uma venda, uma doação e autorização
let mesclagem: string

// Os testes contam uma história só, nesta ordem.
test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  ;({ api: coordenacao } = await entrarNaApi(COORDENACAO))
  ;({ api: caixa } = await entrarNaApi(CAIXA))

  const a = await coordenacao.from('clients').insert({ name: `${MARCA} fica`, member_since: 2026 }).select('id').single()
  const b = await coordenacao
    .from('clients')
    .insert({ name: `${MARCA} sai`, email: 'sai@teste.local', member_since: 2024 })
    .select('id')
    .single()
  if (a.error || b.error) throw new Error(`Não cadastrou as fichas do teste: ${a.error?.message ?? b.error?.message}`)
  fica = a.data.id
  sai = b.data.id

  const { data: tags } = await coordenacao.from('tags').select('id, name').in('name', ['familiar', 'brechó'])
  const tag = (nome: string) => tags!.find((t) => t.name === nome)!.id

  const preparos = await Promise.all([
    coordenacao.from('client_tags').insert([
      { client_id: fica, tag_id: tag('familiar') },
      { client_id: sai, tag_id: tag('brechó') },
    ]),
    coordenacao.from('sales').insert({ client_id: sai, customer_name: MARCA }),
    coordenacao.from('donations_cash').insert({
      client_id: sai, donor_name: MARCA, amount: 10, frequency: 'one_time', donated_at: new Date().toISOString(),
    }),
    coordenacao.from('message_consents').insert({ client_id: sai, authorized: true, term_version: 'teste-08b' }),
  ])
  const falha = preparos.find((r) => r.error)
  if (falha) throw new Error(`Preparo do teste falhou: ${falha.error!.message}`)
})

test.afterAll(async () => {
  if (!coordenacao) return
  await coordenacao.from('sales').delete().eq('customer_name', MARCA)
  await coordenacao.from('donations_cash').delete().eq('donor_name', MARCA)
  // Apagar as fichas apaga junto etiquetas, autorizações e o registro da mesclagem.
  await coordenacao.from('clients').delete().like('name', `${MARCA}%`)
})

test('o balcão não mescla', async () => {
  expect((await caixa.rpc('mesclar_fichas', { p_manter: fica, p_juntar: sai })).error).not.toBeNull()
  const { data } = await coordenacao.from('clients').select('id').in('id', [fica, sai])
  expect(data).toHaveLength(2)
})

test('a mesclagem leva compra, doação, etiqueta e autorização, e apaga a ficha que sai', async () => {
  const r = await coordenacao.rpc('mesclar_fichas', { p_manter: fica, p_juntar: sai })
  expect(r.error).toBeNull()
  mesclagem = r.data as string

  expect((await coordenacao.from('clients').select('id').eq('id', sai)).data).toHaveLength(0)

  const venda = await coordenacao.from('sales').select('client_id').eq('customer_name', MARCA).single()
  expect(venda.data?.client_id).toBe(fica)
  const doacao = await coordenacao.from('donations_cash').select('client_id').eq('donor_name', MARCA).single()
  expect(doacao.data?.client_id).toBe(fica)

  const ficha = await coordenacao.from('clients_view').select('email, member_since, tags').eq('id', fica).single()
  expect(ficha.data).toMatchObject({ email: 'sai@teste.local', member_since: 2024 })
  expect([...ficha.data!.tags].sort()).toEqual(['brechó', 'familiar'])

  const autorizacao = await coordenacao.from('message_consent_status').select('authorized').eq('client_id', fica).single()
  expect(autorizacao.data?.authorized).toBe(true)
})

test('a cópia da ficha que saiu não sai pela API, e o balcão não lê as mesclagens', async () => {
  expect((await coordenacao.from('client_merges').select('id, removed_name').eq('id', mesclagem)).data).toHaveLength(1)
  expect((await coordenacao.from('client_merges').select('removed_snapshot').eq('id', mesclagem)).error).not.toBeNull()
  expect(recusado(await caixa.from('client_merges').select('id').eq('id', mesclagem))).toBe(true)
})

test('desfazer devolve as duas fichas como eram', async () => {
  expect((await caixa.rpc('desfazer_mesclagem', { p_mesclagem: mesclagem })).error).not.toBeNull()
  expect((await coordenacao.rpc('desfazer_mesclagem', { p_mesclagem: mesclagem })).error).toBeNull()

  expect((await coordenacao.from('clients').select('id').eq('id', sai)).data).toHaveLength(1)
  const venda = await coordenacao.from('sales').select('client_id').eq('customer_name', MARCA).single()
  expect(venda.data?.client_id).toBe(sai)

  const fichaFica = await coordenacao.from('clients_view').select('email, member_since, tags').eq('id', fica).single()
  expect(fichaFica.data).toMatchObject({ email: null, member_since: 2026, tags: ['familiar'] })
  const fichaSai = await coordenacao.from('clients_view').select('email, tags').eq('id', sai).single()
  expect(fichaSai.data).toMatchObject({ email: 'sai@teste.local', tags: ['brechó'] })

  const autorizacao = await coordenacao.from('message_consent_status').select('authorized').eq('client_id', sai).single()
  expect(autorizacao.data?.authorized).toBe(true)
})

test('a mesma mesclagem não é desfeita duas vezes', async () => {
  expect((await coordenacao.rpc('desfazer_mesclagem', { p_mesclagem: mesclagem })).error).not.toBeNull()
})
```

### D2. `tests/fumaca/mesclagem.spec.ts` (arquivo novo)

A fumaça confere a tela e a prévia, sem confirmar a mesclagem: o seed é de todos os testes.

```ts
import { expect, test } from '@playwright/test'
import { entrar } from './apoio'

// US-08b · A tela mostra o que vai acontecer antes de mesclar.
test.describe('Fumaça: mesclagem de fichas', () => {
  test('escolher as duas fichas mostra a prévia, e o botão só liga depois da conferência', async ({ page }) => {
    await entrar(page)
    await page.goto('/clientes/mesclar')
    await expect(page.getByRole('heading', { name: 'Mesclar fichas' })).toBeVisible()

    await page.getByLabel('Buscar pessoa').first().fill('roberta')
    await page.getByTestId('resultado-da-busca').getByText('Roberta Lima').click()
    await expect(page).toHaveURL(/manter=/)

    await page.getByLabel('Buscar pessoa').fill('mariana')
    await page.getByTestId('resultado-da-busca').getByText('Mariana Fontes').click()
    await expect(page).toHaveURL(/juntar=/)

    await expect(page.getByText('Depois da mesclagem')).toBeVisible()
    const botao = page.getByRole('button', { name: 'Mesclar fichas' })
    await expect(botao).toBeDisabled()
    await page.getByLabel('Conferi: as duas fichas são da mesma pessoa.').check()
    await expect(botao).toBeEnabled()
  })
})
```

### D3. Rodar tudo

```bash
npm run db:reset
npm run env:local -- --force
npm run lint
npm run build
npm run test:fumaca
npm run test:acesso
```

---

## Pull Request

Título: `US-08b · Mesclagem de duas fichas`. Base: `main`. No corpo, além do modelo:

- a quebra da US-08 e quais critérios ficaram aqui;
- como cada critério é atendido, um por linha;
- a saída do `npm run test:fumaca` e do `npm run test:acesso`;
- um print da prévia e um da lista de mesclagens com o botão de desfazer.

Mova o cartão para **Em revisão** e avise a Alissa no mesmo dia. **Meta: PR pronto na quarta 21/10, integrado na quinta 22/10.**

**Produção:** a migração acrescenta uma tabela e duas funções, sem mexer no que existe. Faça o merge e aplique a migração em produção no mesmo dia.

## Revisão (Alissa)

1. `git fetch && git checkout us-08b-mesclagem-de-fichas && npm ci && npm run db:reset && npm run env:local -- --force`.
2. `npm run lint`, `npm run build`, `npm run test:fumaca` e `npm run test:acesso`.
3. Ler a migração: `eh_coordenacao()` na primeira linha das duas funções, a cópia fora da leitura da API, o desfazer só devolvendo o que ainda está na ficha que ficou.
4. Fazer os passos de C4, incluindo o desfazer e a tentativa como caixa.
5. Aprovar no GitHub com **Approve** em até 24 horas.

## Tarefas no Trello

1. [Mateus] Criar a branch `us-08b-mesclagem-de-fichas` e fazer o primeiro push até 19/10
2. [Mateus] Migração: tabela `client_merges` e funções `mesclar_fichas` e `desfazer_mesclagem`
3. [Mateus] Tipo, funções em `lib/store.ts` e actions de mesclar e desfazer
4. [Mateus] Tela `/clientes/mesclar`: escolha das fichas, prévia do resultado, conferência e confirmação
5. [Mateus] Lista das mesclagens dos últimos 30 dias com o botão de desfazer
6. [Mateus] Atalho "Mesclar com outra ficha" na tela Clientes, só para a coordenação
7. [Mateus] Testes de acesso (mesclar, desfazer, recusas) e de fumaça (prévia); PR pronto até 21/10
8. [Alissa] Revisar rodando os testes e aprovar no GitHub em até 24 horas
9. [Mateus] Fazer o merge, aplicar a migração em produção e mover o cartão no mesmo dia
