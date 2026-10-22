import { expect, test } from '@playwright/test'
import { entrar, valorUnico } from './apoio'

// US-12 · Evento cadastrado, doação vinculada e total por evento.
test.describe('Fumaça: doação de evento', () => {
  test('cadastrar evento, doar para ele e ver o total', async ({ page }) => {
    const evento = `Jantar teste ${Date.now()}`
    const valor = valorUnico(77)
    await entrar(page)

    await test.step('cadastrar o evento', async () => {
      await page.goto('/doacoes/eventos')
      await page.getByLabel('Nome do evento').fill(evento)
      await page.getByLabel('Data do evento').fill('2026-10-23')
      await page.getByRole('button', { name: 'Cadastrar evento' }).click()
      await expect(page.getByRole('row').filter({ hasText: evento })).toBeVisible()
    })

    await test.step('doar para o evento', async () => {
      await page.goto('/doacoes/dinheiro/nova')
      await page.getByPlaceholder('Nome completo (ou Anônimo)').fill('TESTE US-12 fumaça')
      await page.locator('input[name="amount"]').fill(valor.numero.toFixed(2))
      await page.getByLabel('Evento').selectOption({ label: `${evento} · 23/10/2026` })
      await page.getByRole('button', { name: 'Registrar doação' }).click()
      await expect(page).toHaveURL(/\/doacoes\/dinheiro$/)
      await expect(page.getByText(`Evento: ${evento}`)).toBeVisible()
    })

    await test.step('o total do evento mostra a doação', async () => {
      await page.goto('/doacoes/eventos')
      await expect(page.getByRole('row').filter({ hasText: evento }).getByText(valor.exibido)).toBeVisible()
    })
  })
})