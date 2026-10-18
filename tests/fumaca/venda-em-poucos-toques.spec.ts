import { expect, test } from '@playwright/test'
import { entrar } from './apoio'

// US-05 · Venda registrada em poucos toques.
test.describe('Fumaça: venda em poucos toques', () => {
  test('venda simples pelo atalho: um toque na peça e um no registrar', async ({ page }) => {
    await entrar(page)
    await page.goto('/brecho/nova-venda')

    const atalho = page.getByTestId('atalho-da-venda').first()
    await expect(atalho, 'nenhum atalho apareceu (o seed rodou?)').toBeVisible()
    const valor = ((await atalho.textContent()) ?? '').split('R$')[1]?.trim()
    expect(valor, 'o atalho deveria mostrar o valor').toBeTruthy()

    await test.step('toque 1: o atalho preenche a peça', async () => {
      await atalho.click()
      await expect(page.getByPlaceholder('0,00').first()).toHaveValue(valor!)
    })

    await test.step('toque 2: registrar, sem escolher pessoa (venda avulsa)', async () => {
      await expect(page.getByText('Sem pessoa escolhida, a venda fica como Cliente avulso.')).toBeVisible()
      await page.getByRole('button', { name: 'Registrar venda' }).click()
      await expect(page).toHaveURL(/\/brecho$/)
      await expect(page.getByText(`R$ ${valor}`).first()).toBeVisible()
    })
  })

  test('a pessoa aparece enquanto se digita', async ({ page }) => {
    await entrar(page)
    await page.goto('/brecho/nova-venda')
    await page.getByLabel('Buscar pessoa').fill('3344')
    await expect(page.getByTestId('resultado-da-busca').getByText('Roberta Lima')).toBeVisible()
  })
})
