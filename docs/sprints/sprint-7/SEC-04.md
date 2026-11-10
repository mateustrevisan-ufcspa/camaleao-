# SEC-04 · Trilha de auditoria de alterações e cancelamentos (5 SP)

> Como coordenadora do Instituto, eu quero saber quem alterou ou cancelou cada registro e por quê, para que uma diferença de caixa possa ser esclarecida sem acusar ninguém.

**Tipo:** segurança (soma com as technical stories na velocity) · **Implementa:** Mateus · **Revisa:** Alissa · **Branch:** `sec-04-trilha-de-auditoria` · **Depende de:** US-35 integrada (o gatilho do líquido roda antes do da trilha) · **PR pronto:** quarta 11/11, 18h · **Merge:** quarta 11/11, à noite, o primeiro da noite, depois do `db push`

## Por que entra agora, sem a resposta do Instituto

O cartão dizia que a SEC-04 esperava o Instituto decidir quem corrige lançamento com dinheiro. Essa decisão muda **quem pode** corrigir (é da US-04b); a trilha registra quem corrigiu, quando, o que mudou e por quê, qualquer que seja a regra. Ela já cobre o que hoje é editável: doação de item (US-04a), triagem (US-27), fichas, eventos, campanhas e categorias. Quando a US-04b chegar, as correções e os cancelamentos de dinheiro entram na mesma trilha sem código novo.

## Critérios de aceitação

- [ ] Toda alteração e exclusão em doações de item, doações em dinheiro, vendas, fichas, eventos, campanhas e categorias fica registrada no banco: tabela, registro, campos alterados (antes e depois), motivo, quem e quando
- [ ] Quem e quando vêm do banco de dados; ninguém grava, altera nem apaga a trilha pela API, nem a coordenação
- [ ] A exclusão de doação de item pede motivo (obrigatório); a correção pode ter motivo (opcional)
- [ ] Ligar uma doação a uma ficha (US-14) e a mesclagem (US-08b, que tem registro próprio) não entram na trilha
- [ ] Telefone e e-mail da ficha não ficam guardados na trilha: aparece só que mudaram
- [ ] A coordenação vê a trilha em Relatórios · Alterações; o balcão não vê
- [ ] Testes de acesso e de fumaça passam

## Decisões

- **Gatilho genérico** `registrar_na_trilha()`, `security definer`, antes de `update` e de `delete` em sete tabelas. Ele compara a linha antes e depois, guarda só os campos que mudaram e ignora `created_at`.
- **O motivo viaja na própria linha:** coluna `motivo_da_alteracao` nas três tabelas com dinheiro ou item (`donations_items`, `donations_cash`, `sales`). Quem altera manda o motivo junto, no mesmo `update`; o gatilho copia para a trilha e apaga da linha. Assim o motivo de hoje não aparece na próxima alteração.
- **Exclusão de verdade e exclusão marcada:** `delete` vira ação "exclusão" com a linha inteira em `antes`; marcar `deleted_at` (US-04a, e a US-04b no cancelamento) também vira "exclusão".
- **Fora da trilha:** mudança só de `client_id` (vincular doação sem ficha, US-14; mesclar, US-08b). Os cadastros de taxa (US-32) e de valor do atendimento (US-19) já são histórico, linha por linha.
- **Dados pessoais:** em `clients`, `phone` e `email` são gravados como `"(alterado)"`. A trilha prova que mudou, sem guardar o número antigo (SEC-05).
- **Ordem dos gatilhos:** o PostgreSQL roda os gatilhos `before` em ordem alfabética do nome. `liquido_da_doacao` (US-35) vem antes de `trilha_de_auditoria`, então a trilha já vê o líquido refeito.

## 1. Branch

```bash
git checkout main && git pull
git checkout -b sec-04-trilha-de-auditoria
git push -u origin sec-04-trilha-de-auditoria
```

## Parte A · Migração `supabase/migrations/20261110090000_trilha_de_auditoria.sql`

```sql
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
-- 3. Valor que vai para a trilha. Telefone e e-mail da ficha não são guardados.
-- ─────────────────────────────────────────

create or replace function public.valor_para_trilha(p_tabela text, p_campo text, p_valor jsonb)
returns jsonb
language sql
immutable
set search_path = ''
as $$
  select case
    when p_tabela = 'clients' and p_campo in ('phone', 'email') and p_valor is not null and p_valor <> 'null'::jsonb
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
  v_antes  jsonb := to_jsonb(old);
  v_depois jsonb;
  v_campos text[];
  v_motivo text;
  v_acao   text := 'alteracao';
begin
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

  -- Nada mudou, ou só o vínculo com a ficha (US-14, US-08b): fora da trilha.
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
-- 5. As sete tabelas.
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
     set deleted_at = now(), deleted_by = auth.uid(), motivo_da_alteracao = btrim(p_motivo)
   where id = p_id;
end;
$$;

revoke execute on function public.excluir_doacao_de_item(uuid, text) from public, anon;
grant execute on function public.excluir_doacao_de_item(uuid, text) to authenticated;
```

**Atenção para quem vier depois:** coluna nova numa dessas sete tabelas entra na trilha sozinha. Se a coluna for dado pessoal (como telefone), acrescente o nome em `valor_para_trilha`.

## Parte B · `types/index.ts`

No fim do arquivo:

```ts
// SEC-04 · Uma linha da trilha de auditoria, como a tela mostra.
export interface AlteracaoNaTrilha {
  id: number
  tabela: string
  registro_id: string
  acao: 'alteracao' | 'exclusao'
  campos: string[]
  antes: Record<string, unknown> | null
  depois: Record<string, unknown> | null
  motivo: string | null
  feito_em: string
  feitoPor: string | null
}
```

## Parte C · `lib/store.ts`

1. No `import type` do topo, uma linha nova: `  AlteracaoNaTrilha,`.
2. Em `updateDonationItem`, o tipo de `campos` ganha `motivo_da_alteracao?: string | null` (depois de `donor_phone?: string`).
3. `deleteDonationItem` recebe o motivo:

```diff
-export async function deleteDonationItem(id: string): Promise<void> {
+export async function deleteDonationItem(id: string, motivo: string): Promise<void> {
   const supabase = await createClient()
-  const { error } = await supabase.rpc('excluir_doacao_de_item', { p_id: id })
+  const { error } = await supabase.rpc('excluir_doacao_de_item', { p_id: id, p_motivo: motivo })
   if (error) throw new Error(error.message)
 }
```

4. Seção nova no fim do arquivo:

```ts
// ── TRILHA DE AUDITORIA (SEC-04) ──
// Só a coordenação lê (política do banco). Os nomes de quem fez vêm numa consulta só.

export const TABELAS_DA_TRILHA: Record<string, string> = {
  donations_items: 'Doação de item',
  donations_cash: 'Doação em dinheiro',
  sales: 'Venda',
  clients: 'Ficha',
  events: 'Evento',
  campaigns: 'Campanha',
  item_categories: 'Categoria de item',
}

export async function getTrilha(tabela: string | null, limite = 200): Promise<AlteracaoNaTrilha[]> {
  const supabase = await createClient()
  let consulta = supabase
    .from('trilha_de_auditoria')
    .select('id, tabela, registro_id, acao, campos, antes, depois, motivo, feito_por, feito_em')
    .order('feito_em', { ascending: false })
    .limit(limite)
  if (tabela && tabela in TABELAS_DA_TRILHA) consulta = consulta.eq('tabela', tabela)
  const { data, error } = await consulta
  if (error) throw new Error(error.message)
  const linhas = data ?? []

  const ids = [...new Set(linhas.map((l) => l.feito_por).filter((id): id is string => Boolean(id)))]
  const nomes = new Map<string, string>()
  if (ids.length > 0) {
    const { data: usuarios, error: erroNomes } = await supabase.from('users').select('id, name').in('id', ids)
    if (erroNomes) throw new Error(erroNomes.message)
    for (const u of usuarios ?? []) nomes.set(u.id as string, u.name as string)
  }

  return linhas.map((l) => ({
    id: Number(l.id),
    tabela: l.tabela as string,
    registro_id: l.registro_id as string,
    acao: l.acao as AlteracaoNaTrilha['acao'],
    campos: (l.campos ?? []) as string[],
    antes: (l.antes ?? null) as AlteracaoNaTrilha['antes'],
    depois: (l.depois ?? null) as AlteracaoNaTrilha['depois'],
    motivo: (l.motivo ?? null) as string | null,
    feito_em: l.feito_em as string,
    feitoPor: l.feito_por ? nomes.get(l.feito_por as string) ?? 'conta removida' : null,
  }))
}
```

`TABELAS_DA_TRILHA` fica em `lib/store.ts` para a página usar o mesmo nome; se o lint reclamar de exportar constante de um arquivo de servidor, mova para `lib/trilha.ts` e importe nos dois.

## Parte D · `actions/itens.ts`

```diff
 export async function editarDoacaoDeItem(id: string, formData: FormData): Promise<{ error: string } | void> {
...
+    // SEC-04: o motivo da correção é opcional e vai junto, no mesmo update.
+    const motivo = ((formData.get('motivo_da_alteracao') as string) || '').trim().slice(0, 300)
     await updateDonationItem(id, {
       ...novos,
       weight_kg: original.weight_kg,
       ...(antiga ? { quantity: original.quantity } : {}),
       donated_at: donatedAt,
       ...doador,
+      motivo_da_alteracao: motivo || null,
     })
...
-export async function excluirDoacaoDeItem(id: string): Promise<{ error: string } | void> {
+export async function excluirDoacaoDeItem(id: string, motivo: string): Promise<{ error: string } | void> {
   if (!UUID.test(id)) return { error: AVISO_SEM_PERMISSAO }
+  const texto = (motivo ?? '').trim().slice(0, 300)
+  if (texto.length < 3) return { error: 'Escreva o motivo da exclusão.' }
   try {
-    await deleteDonationItem(id)
+    await deleteDonationItem(id, texto)
```

## Parte E · Telas da doação de item

`components/donations/donations-items-list.tsx`: a confirmação na linha ganha o campo do motivo.

```diff
   const [confirmando, setConfirmando] = useState<string | null>(null)
+  const [motivo, setMotivo] = useState('')
...
   function excluir(id: string) {
     setErro(null)
     startTransition(async () => {
-      const res = await excluirDoacaoDeItem(id)
+      const res = await excluirDoacaoDeItem(id, motivo)
       if (res?.error) setErro(res.error)
-      setConfirmando(null)
+      else { setConfirmando(null); setMotivo('') }
     })
   }
...
                       {confirmando === d.id ? (
                         <>
+                          <input
+                            aria-label="Motivo da exclusão"
+                            value={motivo}
+                            onChange={(e) => setMotivo(e.target.value)}
+                            placeholder="Motivo (obrigatório)"
+                            maxLength={300}
+                            className="input-base py-1 text-xs w-[180px]"
+                          />
                           <button type="button" onClick={() => excluir(d.id)} disabled={isPending} className="chip bg-coral text-white border-coral disabled:opacity-50">
```

No botão "Cancelar" da confirmação, troque `onClick={() => setConfirmando(null)}` por `onClick={() => { setConfirmando(null); setMotivo('') }}`.

`components/donations/new-donation-item-form.tsx`: logo depois do `textarea` das observações, só no modo de edição:

```tsx
              {doacao && (
                <div>
                  <label htmlFor="motivo-da-correcao" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                    Motivo da correção (opcional)
                  </label>
                  <input id="motivo-da-correcao" name="motivo_da_alteracao" maxLength={300} placeholder="Ex.: quantidade digitada errada" className="input-base" />
                </div>
              )}
```

## Parte F · Tela da coordenação: `/relatorios/alteracoes`

### `app/(admin)/relatorios/alteracoes/page.tsx` (arquivo novo)

```tsx
import Link from 'next/link'
import { TABELAS_DA_TRILHA, getTrilha } from '@/lib/store'
import type { AlteracaoNaTrilha } from '@/types'

export const dynamic = 'force-dynamic'

const quando = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' })

function valor(v: unknown): string {
  if (v === null || v === undefined || v === '') return 'vazio'
  if (typeof v === 'boolean') return v ? 'sim' : 'não'
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) return quando(v)
  return String(v)
}

function Mudancas({ a }: { a: AlteracaoNaTrilha }) {
  if (a.acao === 'exclusao' && !a.depois) return <span>registro apagado</span>
  return (
    <ul className="m-0 p-0 list-none">
      {a.campos.map((c) => (
        <li key={c}>
          <span className="text-muted">{c}:</span> {valor(a.antes?.[c])} → {valor(a.depois?.[c])}
        </li>
      ))}
    </ul>
  )
}

// SEC-04 · Só a coordenação abre: a rota começa com /relatorios (SO_COORDENACAO),
// e a política do banco só devolve a trilha para ela.
export default async function AlteracoesPage({ searchParams }: { searchParams: Promise<{ tabela?: string }> }) {
  const { tabela } = await searchParams
  const escolhida = tabela && tabela in TABELAS_DA_TRILHA ? tabela : null
  const linhas = await getTrilha(escolhida)

  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1200px]">
      <header className="mb-8">
        <div className="text-xs text-muted font-body tracking-[2px] uppercase mb-2">
          <Link href="/relatorios" className="text-muted no-underline hover:text-ink">Relatórios</Link> · Alterações
        </div>
        <h1 className="font-display text-[28px] md:text-[40px] text-ink font-semibold tracking-[-1px] m-0">Alterações e exclusões</h1>
        <p className="font-body text-muted text-sm mt-2 max-w-[640px]">
          Quem alterou ou excluiu cada registro, quando, o que mudou e por quê. O sistema grava sozinho; ninguém altera esta lista.
        </p>
      </header>

      <nav aria-label="Tipo de registro" className="flex flex-wrap gap-2 mb-6">
        <Link href="/relatorios/alteracoes" className={`chip no-underline ${!escolhida ? 'bg-ink text-bg border-ink' : 'bg-paper text-muted'}`}>Todos</Link>
        {Object.entries(TABELAS_DA_TRILHA).map(([chave, rotulo]) => (
          <Link key={chave} href={`/relatorios/alteracoes?tabela=${chave}`} className={`chip no-underline ${escolhida === chave ? 'bg-ink text-bg border-ink' : 'bg-paper text-muted'}`}>
            {rotulo}
          </Link>
        ))}
      </nav>

      <div className="bg-paper border border-rule rounded-[16px] overflow-x-auto">
        <table data-testid="trilha" className="w-full border-collapse font-body text-[13px] min-w-[860px]">
          <thead>
            <tr className="bg-bg text-left text-[11px] text-muted uppercase tracking-[1px]">
              <th className="px-5 py-3 font-medium">Quando</th>
              <th className="px-5 py-3 font-medium">Quem</th>
              <th className="px-5 py-3 font-medium">O quê</th>
              <th className="px-5 py-3 font-medium">Mudou</th>
              <th className="px-5 py-3 font-medium">Motivo</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((a) => (
              <tr key={a.id} data-testid="alteracao" className="border-t border-rule align-top">
                <td className="px-5 py-3 text-muted whitespace-nowrap">{quando(a.feito_em)}</td>
                <td className="px-5 py-3 text-ink">{a.feitoPor ?? 'sistema'}</td>
                <td className="px-5 py-3 text-ink">
                  {TABELAS_DA_TRILHA[a.tabela] ?? a.tabela} · {a.acao === 'exclusao' ? 'exclusão' : 'alteração'}
                </td>
                <td className="px-5 py-3 text-ink"><Mudancas a={a} /></td>
                <td data-testid="motivo" className="px-5 py-3 text-ink">{a.motivo ?? <span className="text-muted">não informado</span>}</td>
              </tr>
            ))}
            {linhas.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-muted italic">Nenhuma alteração registrada</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="font-body text-xs text-muted mt-3">Mostra as 200 mais recentes. Telefone e e-mail das fichas aparecem só como &quot;(alterado)&quot;.</p>
    </div>
  )
}
```

### Link em `app/(admin)/relatorios/page.tsx`

Depois do link "Vendas por dia e por semana", uma linha nova (no conflito com as outras stories da sprint que põem link aqui, fique com todas):

```tsx
        <p className="font-body text-sm mt-1">
          <Link href="/relatorios/alteracoes" className="text-accent-deep">Alterações e exclusões</Link>
        </p>
```

## Parte G · Testes

### `tests/acesso/trilha-de-auditoria.spec.ts` (arquivo novo)

```ts
// SEC-04 · Trilha de auditoria, conferida pela API.
import { test, expect } from '@playwright/test'
import type { SupabaseClient } from '@supabase/supabase-js'
import { CAIXA, COORDENACAO, VOLUNTARIA, entrarNaApi, recusado } from './apoio'

let coordenacao: SupabaseClient
let coordenacaoId: string
let caixa: SupabaseClient
let caixaId: string

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  ;({ api: coordenacao, id: coordenacaoId } = await entrarNaApi(COORDENACAO))
  ;({ api: caixa, id: caixaId } = await entrarNaApi(CAIXA))
})

async function novaDoacaoDeItem() {
  const { data: categoria } = await caixa.from('item_categories').select('id, name').eq('name', 'blusa').single()
  const r = await caixa
    .from('donations_items')
    .insert({ donor_name: 'TESTE SEC-04', category_id: categoria!.id, category_name: categoria!.name, donated_at: new Date().toISOString(), registered_by: caixaId })
    .select('id')
    .single()
  return r.data!.id as string
}

const daTrilha = (id: string) =>
  coordenacao.from('trilha_de_auditoria').select('acao, campos, antes, depois, motivo, feito_por').eq('registro_id', id).order('feito_em')

test('correção com motivo entra na trilha com quem fez, e o motivo não fica na linha', async () => {
  const id = await novaDoacaoDeItem()
  const r = await caixa.from('donations_items').update({ notes: 'corrigido', motivo_da_alteracao: 'digitei errado' }).eq('id', id).select('motivo_da_alteracao').single()
  expect(r.error).toBeNull()
  expect(r.data!.motivo_da_alteracao).toBeNull()

  const { data } = await daTrilha(id)
  expect(data).toHaveLength(1)
  expect(data![0]).toMatchObject({ acao: 'alteracao', campos: ['notes'], motivo: 'digitei errado', feito_por: caixaId })
  expect(data![0].antes).toEqual({ notes: null })
  expect(data![0].depois).toEqual({ notes: 'corrigido' })
})

test('exclusão pede motivo e entra como exclusão', async () => {
  const id = await novaDoacaoDeItem()
  expect((await caixa.rpc('excluir_doacao_de_item', { p_id: id, p_motivo: '' })).error).not.toBeNull()
  expect((await caixa.rpc('excluir_doacao_de_item', { p_id: id, p_motivo: 'lançada em dobro' })).error).toBeNull()

  const { data } = await daTrilha(id)
  expect(data!.at(-1)).toMatchObject({ acao: 'exclusao', motivo: 'lançada em dobro', feito_por: caixaId })
})

test('o balcão não lê a trilha, e ninguém grava, altera ou apaga pela API', async () => {
  expect(recusado(await caixa.from('trilha_de_auditoria').select('id').limit(1))).toBe(true)
  const { api: voluntaria } = await entrarNaApi(VOLUNTARIA)
  expect(recusado(await voluntaria.from('trilha_de_auditoria').select('id').limit(1))).toBe(true)

  expect((await coordenacao.from('trilha_de_auditoria').insert({ tabela: 'sales', registro_id: coordenacaoId, acao: 'alteracao' })).error).not.toBeNull()
  const { data } = await coordenacao.from('trilha_de_auditoria').select('id').limit(1).single()
  expect(recusado(await coordenacao.from('trilha_de_auditoria').update({ motivo: 'x' }).eq('id', data!.id).select())).toBe(true)
  expect(recusado(await coordenacao.from('trilha_de_auditoria').delete().eq('id', data!.id).select())).toBe(true)
})

test('telefone da ficha não fica na trilha, e vincular doação a uma ficha não entra', async () => {
  const { data: ficha } = await coordenacao.from('clients').insert({ name: 'TESTE SEC-04 ficha', phone: '(51) 90000-1111' }).select('id').single()
  await coordenacao.from('clients').update({ phone: '(51) 90000-2222' }).eq('id', ficha!.id)
  const { data: trilhaDaFicha } = await daTrilha(ficha!.id)
  expect(trilhaDaFicha![0].antes).toEqual({ phone: '(alterado)' })
  expect(JSON.stringify(trilhaDaFicha)).not.toContain('90000')

  const id = await novaDoacaoDeItem()
  await coordenacao.from('donations_items').update({ client_id: ficha!.id }).eq('id', id)
  expect((await daTrilha(id)).data).toHaveLength(0)

  await coordenacao.from('donations_items').update({ client_id: null }).eq('id', id)
  await coordenacao.from('clients').delete().eq('id', ficha!.id)
})
```

As doações de teste ficam no banco local, como nos outros testes de acesso (o `db reset` limpa).

### `tests/fumaca/trilha-de-auditoria.spec.ts` (arquivo novo)

```ts
// SEC-04 · A correção com motivo aparece em Relatórios · Alterações.
import { test, expect } from '@playwright/test'
import { doacaoSemFicha, entrar } from './apoio'

test('corrigir uma doação de item com motivo aparece na trilha', async ({ page }) => {
  await entrar(page)
  const nome = `TESTE SEC-04 ${Date.now()}`
  await page.goto('/doacoes/itens/nova')
  await doacaoSemFicha(page, nome)
  await page.getByLabel('Categoria').selectOption({ label: 'blusa' })
  await page.getByRole('button', { name: /Registrar/ }).click()
  await page.waitForURL(/\/doacoes\/itens$/)

  await page.getByRole('row').filter({ hasText: nome }).getByRole('link', { name: 'Editar' }).click()
  await page.getByLabel('Observações').fill('corrigida no teste')
  await page.getByLabel('Motivo da correção (opcional)').fill('teste da trilha')
  await page.getByRole('button', { name: /Salvar/ }).click()
  await page.waitForURL(/\/doacoes\/itens$/)

  await page.goto('/relatorios/alteracoes?tabela=donations_items')
  // Outros testes podem gravar na trilha ao mesmo tempo: procura pelo motivo, e não pela primeira linha.
  await expect(page.getByTestId('motivo').filter({ hasText: 'teste da trilha' }).first()).toBeVisible()
})
```

Os rótulos "Categoria", "Observações" e o nome do botão de salvar vêm do formulário da doação de item; se algum for diferente, use o mesmo do teste `tests/fumaca/editar-e-excluir-item.spec.ts`.

### Testes que já existem e mudam

- `tests/acesso/editar-e-excluir-item.spec.ts` e `tests/fumaca/editar-e-excluir-item.spec.ts`: a exclusão passa a pedir motivo. Na API, `rpc('excluir_doacao_de_item', { p_id, p_motivo: 'teste' })`; na tela, preencher "Motivo da exclusão" antes de "Confirmar exclusão".

## Conferir

```bash
npm run db:reset
npm run lint
npm run build
npm run test:fumaca
npm run test:acesso
```

Na tela, com `npm run dev`: caixa corrige e exclui uma doação de item de hoje (a exclusão sem motivo mostra o aviso); coordenação abre Relatórios · Alterações e vê as duas, com o nome da caixa e os motivos; corrigir o telefone de uma ficha aparece como "(alterado)".

## Pull Request

Título: `SEC-04 · Trilha de auditoria de alterações e cancelamentos`. A Alissa revisa com as duas contas (corrigir, excluir sem motivo, excluir com motivo, conferir a tela) e escreve no PR o que testou.

**Integração, quarta 11/11, à noite, o primeiro da noite:** `migration list --remote` (só a `20261110090000` pendente), `db push --remote`, `migration list --remote` de novo; merge; conferência com a conta da coordenação (uma correção de teste numa categoria: renomear e voltar, e ver as duas linhas na tela); registro no `PROGRESSO.md`. Avisar no grupo da equipe que a exclusão de item agora pede motivo.

## Fora desta story

- Correção e cancelamento de venda e de doação em dinheiro: US-04b, que usa esta trilha.
- Trilha de cadastro de usuários (US-24a): a criação e a desativação são feitas com a chave secreta no servidor, e quem fez fica registrado pela própria US-24a.
- Exportar a trilha em planilha: não pedido.
