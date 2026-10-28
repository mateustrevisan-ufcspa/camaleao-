# BUG-02 · Cartões da tela de doações em dinheiro com os números do mês (1 SP)

> Como coordenadora do Instituto, eu quero que os cartões da tela de doações em dinheiro mostrem os números do mês, para que eu não confunda o que entrou no mês com o histórico inteiro.

**Tipo:** correção · **Implementa:** Bibiana · **Revisa:** Laís · **Branch:** `bug-02-cartoes-de-doacoes` · **Depende de:** nada · **Publica:** terça 27/10, depois das 22h (regras no [README](README.md#publicação-durante-a-avaliação))

## Critérios de aceitação

- [ ] Deve somar em "Receita recorrente / mês" só as doações mensais do mês corrente em Brasília
- [ ] Deve contar no cartão de doadores as pessoas diferentes que doaram no mês, e não as doações (doação sem ficha conta uma vez cada)
- [ ] Deve manter o "Total recebido · mês" batendo com o relatório consolidado (US-17)
- [ ] Deve ter o cálculo dos três cartões numa função com teste

## O problema

Em `components/donations/donations-list.tsx`, a US-17 já filtrou o primeiro cartão pelo mês. Os outros dois continuam olhando todas as doações que a tela recebe:

```ts
const total = donations.filter((d) => new Date(d.donated_at) >= inicioDoMes).reduce((s, d) => s + d.amount, 0)
const monthly = donations.filter((d) => d.frequency === 'monthly')        // todas, de qualquer mês
const recurring = monthly.reduce((s, d) => s + d.amount, 0)
// ...
<div>Total de doadores</div> ... {donations.length}                       // conta doações, não pessoas
```

A Nílian avalia esta tela como coordenação, então a correção entra na terça, durante a avaliação. Os nomes dos cartões mudam pouco ("Total de doadores" passa a "Doadores · mês") e nada mais na tela muda.

**Fora desta correção:** o balcão vê esta mesma tela só com as doações lançadas hoje (regra do banco), então para ele os cartões "do mês" mostram o dia. Se as avaliadoras do balcão estranharem, isso entra no replanejamento de sexta junto com o pedido de a estagiária não ver o financeiro.

## 1. Branch

```bash
git checkout main && git pull
git checkout -b bug-02-cartoes-de-doacoes
git push -u origin bug-02-cartoes-de-doacoes
```

## 2. `lib/resumo-das-doacoes.ts` (arquivo novo)

O cálculo sai do componente para uma função sem banco e sem tela, que o teste chama direto:

```ts
import type { DonationCash } from '@/types'

// BUG-02 · Os três cartões da tela Doações · Dinheiro, só com as doações do mês
// corrente em Brasília. O "Total recebido · mês" já era assim desde a US-17.
export interface ResumoDoMes {
  total: number
  recorrente: number
  doadores: number
}

type DoacaoParaResumo = Pick<DonationCash, 'client_id' | 'donated_at' | 'amount' | 'frequency'>

const centavos = (n: number) => Math.round(n * 100) / 100

export function resumoDoMes(doacoes: DoacaoParaResumo[], inicioDoMes: Date): ResumoDoMes {
  const doMes = doacoes.filter((d) => new Date(d.donated_at) >= inicioDoMes)
  const soma = (lista: DoacaoParaResumo[]) => centavos(lista.reduce((s, d) => s + Number(d.amount), 0))

  // Pessoas diferentes: a mesma ficha conta uma vez. Doação sem ficha não tem como
  // ser reconhecida como da mesma pessoa, então cada uma conta como uma.
  const fichas = new Set(doMes.filter((d) => d.client_id).map((d) => d.client_id))
  const semFicha = doMes.filter((d) => !d.client_id).length

  return {
    total: soma(doMes),
    recorrente: soma(doMes.filter((d) => d.frequency === 'monthly')),
    doadores: fichas.size + semFicha,
  }
}
```

## 3. `components/donations/donations-list.tsx`

Troque o cálculo do topo do componente:

```diff
 import { Tag } from '@/components/ui/tag'
 import { formatBRL, inicioDoMesBR } from '@/lib/utils'
+import { resumoDoMes } from '@/lib/resumo-das-doacoes'
 import type { DonationCash } from '@/types'
```

```diff
 export function DonationsList({ donations }: DonationsListProps) {
-  // Só as doações deste mês, em Brasília: o cartão diz "mês" e bate com o relatório (US-17).
-  const inicioDoMes = inicioDoMesBR()
-  const total = donations.filter((d) => new Date(d.donated_at) >= inicioDoMes).reduce((s, d) => s + d.amount, 0)
-  const monthly = donations.filter((d) => d.frequency === 'monthly')
-  const recurring = monthly.reduce((s, d) => s + d.amount, 0)
+  // Os três cartões olham só o mês corrente, em Brasília (US-17 e BUG-02).
+  const { total, recorrente, doadores } = resumoDoMes(donations, inicioDoMesBR())
```

E nos cartões:

```diff
           <div className="text-[13px] text-muted font-body mb-2 tracking-wide">Receita recorrente / mês</div>
           <div className="font-display text-[38px] font-bold tracking-[-1.2px] leading-none text-emerald">
-            R$ {formatBRL(recurring)}
+            R$ {formatBRL(recorrente)}
           </div>
```

```diff
-          <div className="text-[13px] text-muted font-body mb-2 tracking-wide">Total de doadores</div>
+          <div className="text-[13px] text-muted font-body mb-2 tracking-wide">Doadores · mês</div>
           <div className="font-display text-[38px] font-bold tracking-[-1.2px] leading-none text-ink">
-            {donations.length}
+            {doadores}
           </div>
```

Confira com `grep -n "monthly\|recurring" components/donations/donations-list.tsx` se sobrou algum uso das variáveis antigas mais abaixo no arquivo (por exemplo, na lista). Se a lista usar `monthly` para outra coisa, mantenha só o que ela usa.

## 4. Teste: `tests/fumaca/resumo-das-doacoes.spec.ts` (arquivo novo)

É um teste da função, sem navegador. O caminho é relativo porque os testes não usam o atalho `@/`:

```ts
import { expect, test } from '@playwright/test'
import { resumoDoMes } from '../../lib/resumo-das-doacoes'

// BUG-02 · Cartões da tela Doações · Dinheiro.
const INICIO_DE_OUTUBRO = new Date('2026-10-01T03:00:00.000Z') // 0h de 01/10 em Brasília

const doacao = (extra: { client_id?: string | null; donated_at: string; amount: number; frequency?: 'monthly' | 'one_time' }) => ({
  client_id: null,
  frequency: 'one_time' as const,
  ...extra,
})

test('os cartões olham só o mês e contam pessoas, e não doações', () => {
  const resumo = resumoDoMes(
    [
      doacao({ client_id: 'ana', donated_at: '2026-10-05T15:00:00.000Z', amount: 50, frequency: 'monthly' }),
      doacao({ client_id: 'ana', donated_at: '2026-10-20T15:00:00.000Z', amount: 30 }),
      doacao({ client_id: 'bia', donated_at: '2026-10-21T15:00:00.000Z', amount: 100, frequency: 'monthly' }),
      doacao({ donated_at: '2026-10-22T15:00:00.000Z', amount: 20 }), // sem ficha
      doacao({ donated_at: '2026-10-23T15:00:00.000Z', amount: 20 }), // outra sem ficha
      doacao({ client_id: 'ana', donated_at: '2026-09-30T15:00:00.000Z', amount: 999, frequency: 'monthly' }), // setembro
    ],
    INICIO_DE_OUTUBRO,
  )
  expect(resumo).toEqual({ total: 220, recorrente: 150, doadores: 4 })
})

test('a virada do mês segue Brasília: 23h59 de 30/09 ainda é setembro', () => {
  const resumo = resumoDoMes(
    [doacao({ client_id: 'ana', donated_at: '2026-10-01T02:59:00.000Z', amount: 10, frequency: 'monthly' })],
    INICIO_DE_OUTUBRO,
  )
  expect(resumo).toEqual({ total: 0, recorrente: 0, doadores: 0 })
})

test('sem doações no mês, tudo zero', () => {
  expect(resumoDoMes([], INICIO_DE_OUTUBRO)).toEqual({ total: 0, recorrente: 0, doadores: 0 })
})
```

O teste da US-17 (`relatorio-consolidado.spec.ts`) continua conferindo que o "Total recebido · mês" bate com o relatório; ele precisa passar sem mudança.

## 5. Conferir

```bash
npm run lint
npm run build
npm run db:start            # se o banco local não estiver de pé
npx playwright test resumo-das-doacoes relatorio-consolidado fluxos-criticos
```

Na tela, com `npm run dev`, como coordenação, em Doações · Dinheiro: some à mão as doações do mês marcadas como mensais na lista e compare com o cartão do meio.

## 6. Pull Request

Título: `BUG-02 · Cartões da tela de doações em dinheiro com os números do mês`, com os critérios no corpo. PR pronto até terça 27/10 às 18h; a Laís revisa no mesmo dia.

**Merge:** terça 27/10, depois das 22h, junto com a BUG-01 (uma depois da outra, cada uma com o seu deploy conferido), com o aviso no grupo das avaliadoras uma hora antes. Depois do deploy, entre com a conta de conferência da coordenação e abra Doações · Dinheiro. Registre no `PROGRESSO.md`.

Sem migração.
