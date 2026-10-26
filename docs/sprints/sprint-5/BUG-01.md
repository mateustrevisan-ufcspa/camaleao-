# BUG-01 · Data de amanhã na doação de item depois das 21h (1 SP)

> Como voluntária do brechó, eu quero que a doação de item registrada à noite fique com a data de hoje, para que ela conste no dia em que chegou, e não no dia seguinte.

**Tipo:** correção · **Implementa:** Laís · **Revisa:** Alissa · **Branch:** `bug-01-data-da-doacao-de-item` · **Depende de:** nada · **Publica:** terça 27/10, depois das 22h (regras no [README](README.md#publicação-durante-a-avaliação))

## Critérios de aceitação

- [ ] Deve abrir o formulário de doação de item com a data de hoje no horário de Brasília, também depois das 21h
- [ ] Deve impedir escolher no campo uma data depois de hoje
- [ ] Deve recusar no servidor doação em dinheiro ou de item com data depois de hoje
- [ ] Deve ter teste automatizado com o relógio do navegador às 21h30 de Brasília

## O problema

O formulário de doação de item calcula "hoje" assim:

```ts
const today = new Date().toISOString().split('T')[0]
```

`toISOString()` devolve a data em UTC. Às 21h de Brasília já é meia-noite em UTC, então a partir desse horário o campo abre com a data de amanhã, e o `max={today}` também passa a aceitar amanhã. Na hora de gravar, `dateInputToISO` só usa "agora" quando a data é a de hoje em Brasília; com a data de amanhã, a doação é gravada no dia seguinte, ao meio-dia.

A doação em dinheiro já usa `brTodayStr()` (a mesma correção que a US-05 fez na venda). Mas nenhuma das duas Server Actions recusa data futura: uma aba aberta desde a véspera ou uma data digitada à mão ainda gravam no futuro.

As avaliadoras podem testar à noite, por isso esta correção entra na terça, durante a avaliação. Ela não muda nada na tela além da data que o campo mostra.

## 1. Branch

```bash
git checkout main && git pull
git checkout -b bug-01-data-da-doacao-de-item
git push -u origin bug-01-data-da-doacao-de-item
```

## 2. `components/donations/new-donation-item-form.tsx`

Troque o cálculo de "hoje" pelo de Brasília. No topo do arquivo:

```diff
 import { registerDonationItem } from '@/actions/donations'
 import { DonorField } from '@/components/clients/donor-field'
+import { brTodayStr } from '@/lib/utils'
```

Dentro do componente:

```diff
   const [isPending, startTransition] = useTransition()
-  const today = new Date().toISOString().split('T')[0]
+  // Dia de Brasília, e não de UTC: depois das 21h o UTC já está no dia seguinte (BUG-01).
+  const today = brTodayStr()
   const [date, setDate] = useState(today)
```

E ligue o rótulo ao campo, para o teste (e o leitor de tela) acharem o campo pelo nome:

```diff
-                  <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
+                  <label htmlFor="data-da-doacao" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                     Data <span className="text-accent">*</span>
                   </label>
-                  <input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} className="input-base" />
+                  <input id="data-da-doacao" type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} className="input-base" />
```

## 3. `components/donations/new-donation-form.tsx`

A data já está certa; só ligue o rótulo ao campo, igual ao passo anterior:

```diff
-                  <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
+                  <label htmlFor="data-da-doacao" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                     Data <span className="text-accent">*</span>
                   </label>
-                  <input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} className="input-base" />
+                  <input id="data-da-doacao" type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} className="input-base" />
```

## 4. `actions/donations.ts`: o servidor recusa data futura

No import de `@/lib/utils`, acrescente `brTodayStr`:

```diff
-import { parseMoney, dateInputToISO } from '@/lib/utils'
+import { parseMoney, dateInputToISO, brTodayStr } from '@/lib/utils'
```

Logo depois da constante `UUID`, a função que confere a data:

```ts
// BUG-01: data depois de hoje (em Brasília) não entra, venha do formulário ou não.
// As duas datas estão no formato AAAA-MM-DD, então a comparação de texto basta.
function dataDepoisDeHoje(formData: FormData): boolean {
  const informada = ((formData.get('donated_at') as string) || '').trim()
  return informada !== '' && informada > brTodayStr()
}

const AVISO_DATA_FUTURA = 'A data da doação não pode ser depois de hoje.'
```

E uma linha nova no começo das duas funções, logo depois da conferência do doador:

```diff
 export async function registerDonation(formData: FormData): Promise<{ error: string } | void> {
   if (faltaEscolherDoador(formData)) return { error: AVISO_ESCOLHER_DOADOR }
+  if (dataDepoisDeHoje(formData)) return { error: AVISO_DATA_FUTURA }
   const donated_at = dateInputToISO(formData.get('donated_at') as string)
```

```diff
 export async function registerDonationItem(formData: FormData): Promise<{ error: string } | void> {
   if (faltaEscolherDoador(formData)) return { error: AVISO_ESCOLHER_DOADOR }
+  if (dataDepoisDeHoje(formData)) return { error: AVISO_DATA_FUTURA }
   const donated_at = dateInputToISO(formData.get('donated_at') as string)
```

## 5. Teste: `tests/fumaca/data-da-doacao.spec.ts` (arquivo novo)

O relógio do Playwright (`page.clock`) muda só a hora do navegador. É o que interessa aqui, porque a data padrão é calculada no navegador.

```ts
import { expect, test } from '@playwright/test'
import { doacaoSemFicha, entrar } from './apoio'

// BUG-01 · Às 21h30 de Brasília já é o dia seguinte em UTC. Os dois formulários de
// doação precisam abrir com a data de Brasília.
const NOITE = new Date('2026-10-27T21:30:00-03:00')
const HOJE_NA_NOITE = '2026-10-27'

test.describe('Fumaça: data da doação à noite', () => {
  for (const tela of ['/doacoes/itens/nova', '/doacoes/dinheiro/nova']) {
    test(`${tela} às 21h30 abre com a data de hoje e não aceita amanhã`, async ({ page }) => {
      await entrar(page)
      await page.clock.setFixedTime(NOITE)
      await page.goto(tela)

      const data = page.getByLabel('Data')
      await expect(data).toHaveValue(HOJE_NA_NOITE)
      await expect(data).toHaveAttribute('max', HOJE_NA_NOITE)
    })
  }

  test('o servidor recusa doação com data depois de hoje', async ({ page }) => {
    await entrar(page)
    await page.goto('/doacoes/dinheiro/nova')

    const formulario = page.locator('form').filter({ has: page.getByRole('button', { name: 'Registrar doação' }) })
    // Sem a validação do navegador (o campo tem max), para a data chegar ao servidor.
    await formulario.evaluate((f) => { (f as HTMLFormElement).noValidate = true })

    await doacaoSemFicha(page, `Doação no futuro ${Date.now()}`)
    await page.locator('input[name="amount"]').fill('10.00')
    await page.getByLabel('Data').fill('2099-01-01')
    await page.getByRole('button', { name: 'Registrar doação' }).click()

    await expect(page.getByText('A data da doação não pode ser depois de hoje.')).toBeVisible()
    await expect(page).toHaveURL(/\/doacoes\/dinheiro\/nova$/)
  })
})
```

Se `getByLabel('Data')` achar mais de um campo (outro rótulo com a palavra "Data" no mesmo formulário), troque por `page.locator('#data-da-doacao')`.

## 6. Conferir

```bash
npm run lint
npm run build
npm run db:start            # se o banco local não estiver de pé
npx playwright test data-da-doacao doacao-de-itens fluxos-criticos
```

Na tela, com `npm run dev`:

- Mude o relógio do computador para 21h30 (ou rode o teste) e abra Doações · Itens · Nova doação: a data é a de hoje.
- Tente escolher amanhã no calendário: não deixa.

## 7. Pull Request

Título: `BUG-01 · Data de amanhã na doação de item depois das 21h`, com os critérios no corpo. PR pronto até terça 27/10 às 18h; a Alissa revisa no mesmo dia.

**Merge:** terça 27/10, depois das 22h, com o aviso no grupo das avaliadoras uma hora antes. Depois do deploy da Vercel, entre com a conta de conferência da voluntária e abra Doações · Itens · Nova doação: a data é a de hoje. Registre o horário do merge e da conferência no `PROGRESSO.md`.

Sem migração.
