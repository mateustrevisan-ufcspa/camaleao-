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
