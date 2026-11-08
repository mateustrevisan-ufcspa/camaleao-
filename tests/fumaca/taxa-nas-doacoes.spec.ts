// US-35 · Doação pela maquininha mostra o líquido na lista.
import { test, expect } from '@playwright/test'
import { doacaoSemFicha, entrar, valorUnico } from './apoio'

test('doação no crédito à vista da PagBank aparece com o líquido', async ({ page }) => {
  await entrar(page)
  const valor = valorUnico(100)
  await page.goto('/doacoes/dinheiro/nova')
  await doacaoSemFicha(page, 'TESTE US-35 fumaça')
  await page.locator('input[name="amount"]').fill(valor.numero.toFixed(2))
  await page.getByLabel('Recebido por').selectOption({ label: 'PagBank' })
  await page.getByLabel('Forma', { exact: true }).selectOption({ label: 'Crédito à vista' })
  await expect(page.getByTestId('liquido-estimado')).toContainText('3,19%')
  await page.getByRole('button', { name: 'Registrar doação' }).click()
  await page.waitForURL(/\/doacoes\/dinheiro$/)

  const linha = page.getByRole('row').filter({ hasText: valor.exibido })
  const liquido = Math.round(valor.numero * (1 - 3.19 / 100) * 100) / 100
  await expect(linha.getByTestId('liquido-da-doacao')).toHaveText(`R$ ${liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  await expect(linha).toContainText('PagBank · Crédito à vista · 3,19%')
})

test('sem maquininha, o líquido é o próprio valor', async ({ page }) => {
  await entrar(page)
  const valor = valorUnico(40)
  await page.goto('/doacoes/dinheiro/nova')
  await doacaoSemFicha(page, 'TESTE US-35 sem maquininha')
  await page.locator('input[name="amount"]').fill(valor.numero.toFixed(2))
  await expect(page.getByTestId('liquido-estimado')).toHaveCount(0)
  await page.getByRole('button', { name: 'Registrar doação' }).click()
  await page.waitForURL(/\/doacoes\/dinheiro$/)

  const linha = page.getByRole('row').filter({ hasText: valor.exibido })
  await expect(linha.getByTestId('liquido-da-doacao')).toHaveText(valor.exibido)
})

test('a nova venda não mostra a Doação Solutions', async ({ page }) => {
  await entrar(page)
  await page.goto('/brecho/nova-venda')
  await page.getByRole('button', { name: /Crédito/ }).click()
  await expect(page.locator('#banco-da-venda option', { hasText: 'Doação Solutions' })).toHaveCount(0)
  await expect(page.locator('#banco-da-venda option', { hasText: 'PagBank' })).not.toHaveCount(0)
})
