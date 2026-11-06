import { expect, test, type Page } from '@playwright/test'
import { entrar, valorUnico } from './apoio'
import { valorLiquido } from '../../lib/taxas'
import { formatBRL } from '../../lib/utils'

// US-29 · Forma de pagamento na conferência do recebimento.
test.describe('Fumaça: forma de pagamento no financeiro', () => {
  test('venda no crédito em 3x na SICREDI aparece com forma, parcelas e banco', async ({ page }) => {
    const valor = valorUnico(140)
    await entrar(page)

    await test.step('registrar a venda no crédito', async () => {
      await page.goto('/brecho/nova-venda')
      await page.getByPlaceholder('Categoria (saia, blusa, vestido...)').first().fill('vestido')
      await page.getByPlaceholder('0,00').first().fill(valor.digitado)
      await page.getByRole('button', { name: 'Crédito' }).click()
      await page.getByLabel('Banco / maquininha').selectOption('SICREDI')
      await page.getByLabel('Parcelas').selectOption('3')
      await page.getByRole('button', { name: 'Registrar venda' }).click()
      await expect(page).toHaveURL(/\/brecho\?venda=/)
    })

    await test.step('o financeiro mostra a forma, as parcelas e o banco', async () => {
      await page.goto('/brecho/financeiro')
      const pagamento = page.getByRole('row').filter({ hasText: valor.exibido }).getByTestId('pagamento-da-venda')
      await expect(pagamento).toContainText('Crédito em 3x')
      await expect(pagamento).toContainText('SICREDI')
    })
  })
})

// US-32 · Taxas das maquininhas: o líquido da venda usa a taxa em vigor.
async function registrarVenda(page: Page, v: { digitado: string; forma: 'Crédito' | 'Débito' | 'PIX'; banco: string; parcelas?: string; bandeira?: string }) {
  await page.goto('/brecho/nova-venda')
  await page.getByPlaceholder('Categoria (saia, blusa, vestido...)').first().fill('vestido')
  await page.getByPlaceholder('0,00').first().fill(v.digitado)
  await page.getByRole('button', { name: v.forma, exact: true }).click()
  await page.getByLabel('Banco / maquininha').selectOption(v.banco)
  if (v.parcelas) await page.getByLabel('Parcelas').selectOption(v.parcelas)
  if (v.bandeira) await page.getByLabel('Bandeira').selectOption({ label: v.bandeira })
  await page.getByRole('button', { name: 'Registrar venda' }).click()
  await expect(page).toHaveURL(/\/brecho\?venda=/)
}

async function liquidoNoFinanceiro(page: Page, exibido: string) {
  await page.goto('/brecho/financeiro')
  return page.getByRole('row').filter({ hasText: exibido }).getByTestId('liquido-da-venda')
}

test.describe('Fumaça: taxas das maquininhas (US-32)', () => {
  test('crédito parcelado na Sicredi usa 2,07%', async ({ page }) => {
    const valor = valorUnico(200)
    await entrar(page)
    await registrarVenda(page, { digitado: valor.digitado, forma: 'Crédito', banco: 'SICREDI', parcelas: '3' })
    await expect(await liquidoNoFinanceiro(page, valor.exibido)).toHaveText(`R$ ${formatBRL(valorLiquido(valor.numero, 'credit', 2.07)!)}`)
  })

  test('débito na PagBank com outra bandeira usa 2,98%', async ({ page }) => {
    const valor = valorUnico(120)
    await entrar(page)
    await registrarVenda(page, { digitado: valor.digitado, forma: 'Débito', banco: 'PagBank', bandeira: 'Outras (Elo, Banri, BaneseCard, Cabal, Afinz...)' })
    await expect(await liquidoNoFinanceiro(page, valor.exibido)).toHaveText(`R$ ${formatBRL(valorLiquido(valor.numero, 'debit', 2.98)!)}`)
  })

  test('Pix na PagBank usa 0,19%; a bandeira só aparece no débito da PagBank', async ({ page }) => {
    const valor = valorUnico(90)
    await entrar(page)
    await page.goto('/brecho/nova-venda')
    await page.getByRole('button', { name: 'Crédito', exact: true }).click()
    await page.getByLabel('Banco / maquininha').selectOption('PagBank')
    await expect(page.getByLabel('Bandeira')).toHaveCount(0)
    await page.getByRole('button', { name: 'Débito', exact: true }).click()
    await page.getByLabel('Banco / maquininha').selectOption('SICREDI')
    await expect(page.getByLabel('Bandeira')).toHaveCount(0)

    await registrarVenda(page, { digitado: valor.digitado, forma: 'PIX', banco: 'PIX PagBank' })
    await expect(await liquidoNoFinanceiro(page, valor.exibido)).toHaveText(`R$ ${formatBRL(valorLiquido(valor.numero, 'pix', 0.19)!)}`)
  })

  test('Stone e PIX TON saem da lista de maquininhas', async ({ page }) => {
    await entrar(page)
    await page.goto('/brecho/nova-venda')
    await page.getByRole('button', { name: 'Crédito', exact: true }).click()
    await expect(page.getByLabel('Banco / maquininha').locator('option', { hasText: 'Stone' })).toHaveCount(0)
    await page.getByRole('button', { name: 'PIX', exact: true }).click()
    await expect(page.getByLabel('Banco / maquininha').locator('option', { hasText: 'PIX TON' })).toHaveCount(0)
  })
})
