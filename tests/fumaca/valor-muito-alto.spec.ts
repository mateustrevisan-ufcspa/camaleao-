import { expect, test } from '@playwright/test'
import { doacaoSemFicha, entrar, valorUnico } from './apoio'

// US-34 · Confirmação de doação em dinheiro de valor muito alto (limite: R$ 1.000).
test.describe('Fumaça: doação de valor muito alto', () => {
  test('abaixo do limite, registra direto', async ({ page }) => {
    const doador = `TESTE US-34 abaixo ${Date.now()}`
    const valor = valorUnico(500)
    await entrar(page)
    await page.goto('/doacoes/dinheiro/nova')
    await doacaoSemFicha(page, doador)
    await page.locator('input[name="amount"]').fill(valor.numero.toFixed(2))
    await page.getByRole('button', { name: 'Registrar doação' }).click()
    await expect(page).toHaveURL(/\/doacoes\/dinheiro$/)
    await expect(page.getByRole('row').filter({ hasText: doador })).toBeVisible()
  })

  test('acima do limite, pede confirmação; sem confirmar, não registra', async ({ page }) => {
    const doador = `TESTE US-34 acima ${Date.now()}`
    await entrar(page)
    await page.goto('/doacoes/dinheiro/nova')
    await doacaoSemFicha(page, doador)
    await page.locator('input[name="amount"]').fill('10000')
    await page.getByRole('button', { name: 'Registrar doação' }).click()

    const confirmacao = page.getByTestId('confirmacao-valor-alto')
    await expect(confirmacao).toContainText('R$ 10.000,00')
    await expect(page).toHaveURL(/\/doacoes\/dinheiro\/nova$/)

    await confirmacao.getByRole('button', { name: 'Corrigir o valor' }).click()
    await expect(confirmacao).toHaveCount(0)

    await page.goto('/doacoes/dinheiro')
    await expect(page.getByRole('row').filter({ hasText: doador })).toHaveCount(0)
  })

  test('acima do limite, com confirmação, registra', async ({ page }) => {
    const doador = `TESTE US-34 confirmada ${Date.now()}`
    const valor = valorUnico(1500)
    await entrar(page)
    await page.goto('/doacoes/dinheiro/nova')
    await doacaoSemFicha(page, doador)
    await page.locator('input[name="amount"]').fill(valor.numero.toFixed(2))
    await page.getByRole('button', { name: 'Registrar doação' }).click()
    await page.getByTestId('confirmacao-valor-alto').getByRole('button', { name: 'Sim, registrar' }).click()
    await expect(page).toHaveURL(/\/doacoes\/dinheiro$/)
    // US-35: sem maquininha, o valor aparece duas vezes na linha (Valor e Líquido).
    await expect(page.getByRole('row').filter({ hasText: doador })).toContainText(valor.exibido)
  })
})