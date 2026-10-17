# US-08a · Sugestão de possíveis repetidos (5 SP)

> Como coordenadora do Instituto, eu quero que o sistema me aponte as fichas que parecem ser da mesma pessoa, para que eu encontre os cadastros repetidos sem precisar procurar um por um.

**Tipo:** user story · **Épico:** Ficha única (pedido N) · **Implementa:** Alissa · **Revisa:** Mateus · **Branch:** `us-08a-possiveis-repetidos` · **Depende de:** nada para começar. O link "Comparar e mesclar" leva à tela da US-08b, que integra antes (quinta 22/10); esta integra na sexta.

## De onde vem

Parte da US-08 (13 SP), quebrada no planejamento de 16/10. A divisão dos critérios está no guia da [US-08b](US-08b.md). Ficaram aqui:

## Critérios de aceitação

- [ ] Deve apontar fichas com nome parecido ou telefone igual
- [ ] Deve restringir a operação ao perfil de coordenação

## O problema

O brechó registrava as vendas numa planilha que não lembra quem já comprou: nome e telefone eram pedidos a cada compra. Quando essa base chegar ao sistema, e mesmo no uso do dia a dia, a mesma pessoa vai aparecer em mais de uma ficha ("Cláudia Berthold" e "Claudia Bertold", ou "Antônia Ferreira" e "Toninha" com o mesmo celular). Hoje não há como achar esses pares sem ler a lista inteira.

## Decisões

- **A comparação roda no banco,** pela função `possiveis_repetidos`. Ela é `security definer` porque compara telefones, que nenhum perfil lê direto desde a SEC-05, e devolve só os quatro últimos dígitos. A primeira condição é `eh_coordenacao()`: para o balcão, a função não devolve nenhum par.
- **Nome parecido** usa a extensão `pg_trgm` do PostgreSQL (que o Supabase traz), sem acento e sem diferenciar maiúscula. O par entra com semelhança de 0,5 ou mais. Um índice de trigramas no nome deixa a comparação rápida mesmo com milhares de fichas.
- **Telefone igual** compara os 8 últimos dígitos, para "(51) 99711-8899" e "51 99711-8899" e "99711-8899" serem o mesmo número.
- **A lista não decide nada.** Cada par leva para a tela de mesclagem (US-08b) com as duas fichas já escolhidas; a ficha cadastrada antes fica como "a que fica", e dá para inverter lá.
- **Nome parecido nem sempre é a mesma pessoa.** A tela diz isso. Marcar um par como "não são a mesma pessoa", para ele sumir da lista, fica anotado como melhoria possível, fora dos critérios.
- **Tela em `/clientes/repetidos`** (já em `lib/rotas.ts`), com um submenu novo em Clientes: "Fichas" e "Possíveis repetidos". Só a coordenação vê o segundo item.
- **Duas fichas repetidas de exemplo no seed,** para os testes e para a demonstração.

## 1. Branch

```bash
git checkout main && git pull
git checkout -b us-08a-possiveis-repetidos
git push -u origin us-08a-possiveis-repetidos
npm ci
```

---

## Parte A · Banco

### A1. Migração nova

Arquivo novo: `supabase/migrations/20261021090000_possiveis_repetidos.sql`.

```sql
-- US-08a · Sugestão de possíveis repetidos
-- Pares de fichas com nome parecido ou telefone igual, para a coordenação.

-- ─────────────────────────────────────────
-- 1. Comparação de nomes por trigramas.
-- ─────────────────────────────────────────

create extension if not exists pg_trgm with schema extensions;

-- O nome do jeito que a comparação usa: minúsculo e sem acento.
-- immutable para poder entrar num índice. O unaccent de um argumento não é
-- immutable porque depende do dicionário configurado; aqui o dicionário vai
-- fixo, então o resultado é sempre o mesmo para o mesmo nome.
create or replace function public.nome_para_comparar(p_nome text)
returns text
language sql
immutable
parallel safe
set search_path = ''
as $$
  select lower(extensions.unaccent('extensions.unaccent'::regdictionary, coalesce(p_nome, '')))
$$;

create index if not exists idx_clients_nome_trigramas
  on public.clients using gin (public.nome_para_comparar(name) extensions.gin_trgm_ops);

-- Os 8 últimos dígitos do telefone: "(51) 99711-8899" e "99711-8899" batem.
create index if not exists idx_clients_telefone_final
  on public.clients ((right(regexp_replace(coalesce(phone, ''), '\D', '', 'g'), 8)));

-- ─────────────────────────────────────────
-- 2. possiveis_repetidos: pares de fichas com nome parecido (semelhança de
--    0,5 ou mais) ou com os mesmos 8 últimos dígitos de telefone.
--
--    security definer porque compara telefones, que nenhum perfil lê direto
--    desde a SEC-05. Sai só o final do telefone. Como a função passa por cima
--    das políticas, cada parte começa por public.eh_coordenacao(): para o
--    balcão, nenhum par.
-- ─────────────────────────────────────────

create or replace function public.possiveis_repetidos(p_limite int default 50)
returns table (
  id_a             uuid,
  nome_a           text,
  apelido_a        text,
  telefone_final_a text,
  criada_a         timestamptz,
  id_b             uuid,
  nome_b           text,
  apelido_b        text,
  telefone_final_b text,
  criada_b         timestamptz,
  motivo           text,
  semelhanca       numeric
)
language sql
stable
security definer
set search_path = ''
as $$
  with por_nome as (
    select a.id as a, b.id as b,
           extensions.similarity(public.nome_para_comparar(a.name), public.nome_para_comparar(b.name)) as sim
      from public.clients a
      join public.clients b
        on b.id > a.id
       and public.nome_para_comparar(b.name) operator(extensions.%) public.nome_para_comparar(a.name)
     where public.eh_coordenacao()
  ),
  por_telefone as (
    select a.id as a, b.id as b
      from public.clients a
      join public.clients b
        on b.id > a.id
       and right(regexp_replace(coalesce(b.phone, ''), '\D', '', 'g'), 8)
         = right(regexp_replace(coalesce(a.phone, ''), '\D', '', 'g'), 8)
     where public.eh_coordenacao()
       and length(regexp_replace(coalesce(a.phone, ''), '\D', '', 'g')) >= 8
  ),
  pares as (
    select coalesce(n.a, t.a) as a,
           coalesce(n.b, t.b) as b,
           n.sim,
           t.a is not null as mesmo_telefone
      from (select * from por_nome where sim >= 0.5) n
      full join por_telefone t on t.a = n.a and t.b = n.b
  )
  select
    ca.id, ca.name, coalesce(ca.nickname, ''),
    right(regexp_replace(coalesce(ca.phone, ''), '\D', '', 'g'), 4), ca.created_at,
    cb.id, cb.name, coalesce(cb.nickname, ''),
    right(regexp_replace(coalesce(cb.phone, ''), '\D', '', 'g'), 4), cb.created_at,
    case
      when p.mesmo_telefone and p.sim is not null then 'nome parecido e telefone igual'
      when p.mesmo_telefone then 'telefone igual'
      else 'nome parecido'
    end,
    round(coalesce(p.sim, 0)::numeric, 2)
  from pares p
  join public.clients ca on ca.id = p.a
  join public.clients cb on cb.id = p.b
  order by p.mesmo_telefone desc, p.sim desc nulls last, ca.name
  limit least(greatest(coalesce(p_limite, 50), 1), 200)
$$;

revoke execute on function public.possiveis_repetidos(int) from public, anon;
grant  execute on function public.possiveis_repetidos(int) to authenticated;
```

Pontos para olhar ao rodar pela primeira vez:

- `operator(extensions.%)` é a forma de usar o operador `%` do `pg_trgm` com o `search_path` vazio. O `%` aceita pares com semelhança a partir de 0,3 (o padrão do `pg_trgm`) e usa o índice; o filtro de 0,5 vem depois.
- Se o `create index` reclamar que a função não é immutable, confira se o `unaccent` está no esquema `extensions` (a US-06 o criou lá).

### A2. Seed: duas fichas repetidas de exemplo

`supabase/seed-demo.sql`, logo **depois** do insert da Antônia Ferreira (`returning id into cli8;`) e antes do comentário `-- Tags dos clientes`:

```diff
   insert into clients (name, phone, birthday, email, member_since) values
     ('Antônia Ferreira',     '(51) 99711-8899', '12/06', null,                2024) returning id into cli8;
 
+  -- Fichas repetidas de exemplo (US-08a): a Cláudia de novo, com o nome
+  -- digitado diferente, e a Antônia de novo, pelo apelido e com o mesmo celular.
+  insert into clients (name, phone, birthday, email, member_since) values
+    ('Claudia Bertold', null,            null, null, 2026),
+    ('Toninha',         '51 99711-8899', null, null, 2026);
+
   -- Tags dos clientes
```

### A3. Conferir no banco

```bash
npm run db:reset
```

O `db:reset` tem de passar sem erro. A conferência dos pares é o teste de acesso (Parte D), que entra como coordenação e como caixa.

---

## Parte B · Dados

### B1. `types/index.ts`

Logo **depois** do bloco `PessoaEncontrada`:

```diff
   ja_comprou: boolean
   ja_doou: boolean
 }
 
+// Um par de fichas que parecem ser da mesma pessoa (US-08a). O telefone vem
+// reduzido aos quatro últimos dígitos.
+export interface ParRepetido {
+  id_a: string
+  nome_a: string
+  apelido_a: string
+  telefone_final_a: string
+  criada_a: string
+  id_b: string
+  nome_b: string
+  apelido_b: string
+  telefone_final_b: string
+  criada_b: string
+  motivo: 'nome parecido' | 'telefone igual' | 'nome parecido e telefone igual'
+  semelhanca: number
+}
+
 export interface Sale {
```

### B2. `lib/store.ts`: o import do topo

O tipo entra **depois de `PessoaEncontrada,`** (é a linha reservada para a US-08a):

```diff
   PessoaEncontrada,
+  ParRepetido,
   Sale,
```

### B3. `lib/store.ts`: a função

Logo **depois** de `getClients` (e antes de `getTodaySales`):

```ts
// ── POSSÍVEIS REPETIDOS (US-08a) ──
// Pares de fichas com nome parecido ou telefone igual. Só a coordenação recebe pares.
export async function getPossiveisRepetidos(): Promise<ParRepetido[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('possiveis_repetidos', { p_limite: 100 })
  if (error) throw new Error(error.message)
  return ((data ?? []) as ParRepetido[]).map((p) => ({ ...p, semelhanca: Number(p.semelhanca) }))
}
```

---

## Parte C · Telas

### C1. `app/(admin)/clientes/repetidos/page.tsx` (arquivo novo)

```tsx
import Link from 'next/link'
import { GitMerge } from 'lucide-react'
import { getPossiveisRepetidos } from '@/lib/store'
import type { ParRepetido } from '@/types'

export const dynamic = 'force-dynamic'

const dataCurta = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })

// A ficha cadastrada antes fica, por padrão: costuma ser a que tem mais histórico.
// Na tela de mesclagem dá para inverter.
function enderecoDaMesclagem(p: ParRepetido) {
  const aPrimeiro = new Date(p.criada_a) <= new Date(p.criada_b)
  const manter = aPrimeiro ? p.id_a : p.id_b
  const juntar = aPrimeiro ? p.id_b : p.id_a
  return `/clientes/mesclar?manter=${manter}&juntar=${juntar}`
}

function Ficha({ nome, apelido, final, criada }: { nome: string; apelido: string; final: string; criada: string }) {
  return (
    <div>
      <div className="font-body text-sm text-ink font-medium">
        {nome}
        {apelido && <span className="text-muted font-normal"> · {apelido}</span>}
      </div>
      <div className="font-mono text-[11px] text-muted mt-0.5">
        {[final && `tel. final ${final}`, `cadastrada em ${dataCurta(criada)}`].filter(Boolean).join(' · ')}
      </div>
    </div>
  )
}

export default async function PossiveisRepetidosPage() {
  const pares = await getPossiveisRepetidos()

  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1100px]">
      <header className="mb-9">
        <div className="text-xs text-muted font-body tracking-[2px] uppercase mb-2">Clientes · Possíveis repetidos</div>
        <h1 className="font-display text-[28px] md:text-[40px] text-ink font-semibold tracking-[-1px] m-0 leading-[1.1]">
          Possíveis repetidos
        </h1>
        <p className="font-body text-muted text-sm mt-2 max-w-[600px]">
          Pares de fichas com nome parecido ou com o mesmo telefone. Confira antes de mesclar: nome parecido nem sempre é a mesma pessoa.
        </p>
      </header>

      {pares.length === 0 ? (
        <div className="bg-paper border border-rule rounded-[16px] p-10 text-center font-body text-sm text-muted">
          Nenhum par de fichas parecidas.
        </div>
      ) : (
        <ul data-testid="pares-repetidos" className="m-0 p-0 list-none flex flex-col gap-3">
          {pares.map((p) => (
            <li
              key={`${p.id_a}-${p.id_b}`}
              className="bg-paper border border-rule rounded-[16px] p-5 flex flex-wrap items-center justify-between gap-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 min-w-[260px]">
                <Ficha nome={p.nome_a} apelido={p.apelido_a} final={p.telefone_final_a} criada={p.criada_a} />
                <Ficha nome={p.nome_b} apelido={p.apelido_b} final={p.telefone_final_b} criada={p.criada_b} />
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-xs font-body px-2 py-1 rounded-full" style={{ backgroundColor: '#FBE3CA', color: '#C97D3E' }}>
                  {p.motivo}
                </span>
                {p.semelhanca > 0 && (
                  <span className="font-mono text-[11px] text-muted">nomes {Math.round(p.semelhanca * 100)}% parecidos</span>
                )}
                <Link href={enderecoDaMesclagem(p)} className="chip bg-bg no-underline">
                  <GitMerge size={11} /> Comparar e mesclar
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
```

### C2. Submenu de Clientes: `components/layout/sidebar.tsx`

A lista nova entra **depois** de `doacoesSub` e da linha em branco que vem depois dela (a Laís mexe dentro de `doacoesSub`; as duas mudanças não se encostam):

```diff
 const doacoesSub = [
   ...
 ]
 
+const clientesSub = [
+  { href: '/clientes', label: 'Fichas' },
+  { href: '/clientes/repetidos', label: 'Possíveis repetidos' },
+]
+
 interface SidebarProps {
```

```diff
   const inDoacoes = pathname.startsWith('/doacoes')
+  const inClientes = pathname.startsWith('/clientes')
```

```diff
             const sub = href === '/brecho' && inBrecho
               ? brechoSub
               : href === '/doacoes' && inDoacoes
               ? doacoesSub
+              : href === '/clientes' && inClientes
+              ? clientesSub
               : null
```

"Fichas" só fica marcado na própria `/clientes`, como "Visão geral" do brechó:

```diff
                       const subActive =
-                        subHref === '/brecho'
-                          ? pathname === '/brecho'
+                        subHref === '/brecho' || subHref === '/clientes'
+                          ? pathname === subHref
                           : pathname.startsWith(subHref)
```

"Possíveis repetidos" aparece só para a coordenação, porque a rota está em `lib/rotas.ts`.

### C3. Conferir na tela

```bash
npm run db:reset
npm run env:local -- --force
npm run dev
```

1. Como coordenação, abra **Clientes**: o submenu tem "Fichas" e "Possíveis repetidos".
2. Em **Possíveis repetidos**: "Cláudia Berthold" e "Claudia Bertold" por nome parecido; "Antônia Ferreira" e "Toninha" por telefone igual, com o final 8899 e sem o número inteiro.
3. Depois de trazer a `main` com a US-08b: **Comparar e mesclar** abre a mesclagem com as duas fichas escolhidas, a mais antiga como "a que fica".
4. Cadastre "Roberta Lima Souza" e volte à lista: aparece o par com "Roberta Lima".
5. Como caixa: o submenu mostra só "Fichas", e `/clientes/repetidos` direto volta para o brechó com o aviso.

---

## Parte D · Testes

### D1. `tests/acesso/repetidos.spec.ts` (arquivo novo)

```ts
// US-08a · Possíveis repetidos, conferidos pela API.
import { test, expect } from '@playwright/test'
import { CAIXA, COORDENACAO, entrarNaApi } from './apoio'

type Par = { nome_a: string; nome_b: string; motivo: string; telefone_final_a: string; telefone_final_b: string }

const doPar = (pares: Par[], x: string, y: string) =>
  pares.find((p) => [p.nome_a, p.nome_b].sort().join('|') === [x, y].sort().join('|'))

test('a coordenação recebe os pares do seed, com o motivo e só o final do telefone', async () => {
  const { api } = await entrarNaApi(COORDENACAO)
  const { data, error } = await api.rpc('possiveis_repetidos', { p_limite: 100 })
  expect(error).toBeNull()
  const pares = data as Par[]

  expect(doPar(pares, 'Cláudia Berthold', 'Claudia Bertold')?.motivo).toBe('nome parecido')
  const porTelefone = doPar(pares, 'Antônia Ferreira', 'Toninha')
  expect(porTelefone?.motivo).toBe('telefone igual')
  expect(porTelefone?.telefone_final_a).toBe('8899')
  expect(JSON.stringify(pares)).not.toContain('99711')
})

test('o balcão não recebe nenhum par', async () => {
  const { api } = await entrarNaApi(CAIXA)
  const r = await api.rpc('possiveis_repetidos', { p_limite: 100 })
  expect(r.error).toBeNull()
  expect(r.data).toHaveLength(0)
})

test('sem login a função é recusada', async () => {
  const { api } = await entrarNaApi(CAIXA)
  await api.auth.signOut()
  expect((await api.rpc('possiveis_repetidos', { p_limite: 100 })).error).not.toBeNull()
})
```

### D2. `tests/fumaca/repetidos.spec.ts` (arquivo novo)

Este teste usa a tela da US-08b: rode depois de trazer a `main` com ela.

```ts
import { expect, test } from '@playwright/test'
import { entrar } from './apoio'

// US-08a · A lista de possíveis repetidos leva para a mesclagem.
test.describe('Fumaça: possíveis repetidos', () => {
  test('a lista mostra o par do seed e leva para a mesclagem', async ({ page }) => {
    await entrar(page)
    await page.goto('/clientes/repetidos')

    const par = page.getByTestId('pares-repetidos').getByRole('listitem').filter({ hasText: 'Claudia Bertold' })
    await expect(par.getByText('nome parecido', { exact: true })).toBeVisible()

    await par.getByRole('link', { name: 'Comparar e mesclar' }).click()
    await expect(page).toHaveURL(/\/clientes\/mesclar\?manter=.+&juntar=.+/)
    await expect(page.getByText('Depois da mesclagem')).toBeVisible()
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

Título: `US-08a · Sugestão de possíveis repetidos`. Base: `main`. No corpo, além do modelo:

- a quebra da US-08 e quais critérios ficaram aqui;
- como cada critério é atendido, um por linha;
- a saída do `npm run test:fumaca` e do `npm run test:acesso`;
- um print da lista de pares.

Mova o cartão para **Em revisão** e avise o Mateus no mesmo dia. **Meta: PR pronto na quinta 22/10, integrado até o meio-dia de sexta 23/10.**

**Produção:** a migração acrescenta uma extensão, uma função, dois índices e a função dos pares, sem mexer no que existe. Faça o merge e o Mateus aplica a migração no mesmo dia. Com as fichas de teste de produção, a lista pode vir vazia; o par de demonstração está no banco local.

## Revisão (Mateus)

1. `git fetch && git checkout us-08a-possiveis-repetidos && npm ci && npm run db:reset && npm run env:local -- --force`.
2. `npm run lint`, `npm run build`, `npm run test:fumaca` e `npm run test:acesso`.
3. Ler a migração: `eh_coordenacao()` nas duas partes, só o final do telefone na saída, a função de nome `immutable` usada no índice.
4. Fazer os passos de C3 como coordenação e como caixa.
5. Aprovar no GitHub com **Approve** em até 24 horas.

## Tarefas no Trello

1. [Alissa] Criar a branch `us-08a-possiveis-repetidos` e fazer o primeiro push até 19/10
2. [Alissa] Migração: `pg_trgm`, nome sem acento num índice, índice do final do telefone e função `possiveis_repetidos`
3. [Alissa] Duas fichas repetidas de exemplo no seed
4. [Alissa] Tipo e função em `lib/store.ts`
5. [Alissa] Tela `/clientes/repetidos` com os pares, o motivo e o link para a mesclagem
6. [Alissa] Submenu de Clientes com "Fichas" e "Possíveis repetidos"
7. [Alissa] Testes de acesso e de fumaça; PR pronto para revisão até 22/10
8. [Mateus] Revisar rodando os testes e aprovar no GitHub em até 24 horas
9. [Mateus] Aplicar a migração em produção no dia do merge
10. [Alissa] Fazer o merge e mover o cartão para Concluído até o meio-dia de 23/10
