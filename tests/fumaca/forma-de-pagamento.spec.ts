import { expect, test } from '@playwright/test'
import { entrar, valorUnico } from './apoio'

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
