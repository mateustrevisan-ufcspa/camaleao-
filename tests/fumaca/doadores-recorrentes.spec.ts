import { expect, test } from '@playwright/test'
import { entrar, valorUnico } from './apoio'

// US-20 · Acompanhamento de doadores recorrentes.
test.describe('Fumaça: doadores recorrentes', () => {
  test('quem parou de doar aparece como interrompido, e o filtro mostra só esses', async ({ page }) => {
    await entrar(page)
    await page.goto('/clientes/recorrentes')

    // Roberta Lima: doação mensal de R$ 100,00 em 01/04/2026, no seed.
    const roberta = page.getByTestId('doador-recorrente').filter({ hasText: 'Roberta Lima' })
    await expect(roberta.getByText('R$ 100,00 por mês · última doação em 01/04/2026')).toBeVisible()
    await expect(roberta.getByText(/interrompida há \d+ dias/)).toBeVisible()

    await page.getByRole('link', { name: /Só interrompidos/ }).click()
    await expect(page).toHaveURL(/filtro=interrompidos/)
    await expect(page.getByTestId('doador-recorrente').filter({ hasText: 'Roberta Lima' })).toBeVisible()
    await expect(page.getByText(/em dia/)).toHaveCount(0)
  })

  test('quem doou este mês aparece em dia e sai do filtro de interrompidos', async ({ page }) => {
    const valor = valorUnico(40)
    await entrar(page)

    await test.step('registrar uma doação mensal para a Helena Vasconcelos', async () => {
      await page.goto('/doacoes/dinheiro/nova')
      await page.getByLabel('Buscar pessoa').fill('helena')
      await page.getByTestId('resultado-da-busca').getByText('Helena Vasconcelos').click()
      await page.locator('input[name="amount"]').fill(valor.numero.toFixed(2))
      await page.getByRole('button', { name: 'Mensal' }).click()
      await page.getByRole('button', { name: 'Registrar doação' }).click()
      await expect(page).toHaveURL(/\/doacoes\/dinheiro$/)
    })

    await page.goto('/clientes/recorrentes')
    const helena = page.getByTestId('doador-recorrente').filter({ hasText: 'Helena Vasconcelos' })
    await expect(helena.getByText('em dia')).toBeVisible()

    await page.goto('/clientes/recorrentes?filtro=interrompidos')
    await expect(page.getByTestId('doador-recorrente').filter({ hasText: 'Helena Vasconcelos' })).toHaveCount(0)
  })
})
