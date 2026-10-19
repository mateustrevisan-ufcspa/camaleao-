import { expect, test } from '@playwright/test'
import { entrar } from './apoio'

// US-08b · A tela mostra o que vai acontecer antes de mesclar.
test.describe('Fumaça: mesclagem de fichas', () => {
  test('escolher as duas fichas mostra a prévia, e o botão só liga depois da conferência', async ({ page }) => {
    await entrar(page)
    await page.goto('/clientes/mesclar')
    await expect(page.getByRole('heading', { name: 'Mesclar fichas' })).toBeVisible()

    await page.getByLabel('Buscar pessoa').first().fill('roberta')
    await page.getByTestId('resultado-da-busca').getByText('Roberta Lima').click()
    await expect(page).toHaveURL(/manter=/)

    // Com a primeira ficha escolhida, a única busca que sobra é a da ficha que sai.
    await page.getByLabel('Buscar pessoa').last().fill('mariana')
    await page.getByTestId('resultado-da-busca').getByText('Mariana Fontes').click()
    await expect(page).toHaveURL(/juntar=/)

    await expect(page.getByText('Depois da mesclagem')).toBeVisible()
    const botao = page.getByRole('button', { name: 'Mesclar fichas' })
    await expect(botao).toBeDisabled()
    await page.getByLabel('Conferi: as duas fichas são da mesma pessoa.').check()
    await expect(botao).toBeEnabled()
  })
})
