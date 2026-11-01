import { expect, test } from '@playwright/test'
import { doacaoSemFicha, entrar, valorUnico } from './apoio'

// US-16 · Recibo de doação.
test.describe('Fumaça: recibo de doação', () => {
  test('recibo da doação em dinheiro com valor, forma e atendimentos', async ({ page }) => {
    const doador = `TESTE US-16 ${Date.now()}`
    const valor = valorUnico(100)
    await entrar(page)

    await page.goto('/doacoes/dinheiro/nova')
    await doacaoSemFicha(page, doador)
    await page.locator('input[name="amount"]').fill(valor.numero.toFixed(2))
    await page.getByRole('button', { name: 'Registrar doação' }).click()
    await expect(page).toHaveURL(/\/doacoes\/dinheiro$/)

    const href = await page.getByRole('row').filter({ hasText: doador }).getByRole('link', { name: 'Recibo' }).getAttribute('href')
    expect(href).toMatch(/^\/recibo\/dinheiro\/[0-9a-f-]+$/)
    await page.goto(href!)

    const recibo = page.getByTestId('recibo')
    await expect(recibo).toContainText('Instituto Camaleão')
    await expect(recibo).toContainText(doador)
    await expect(recibo).toContainText(valor.exibido)
    // "PIX" é a primeira origem do formulário.
    await expect(recibo).toContainText('por PIX')
    // R$ 100,xx com o atendimento de R$ 50: cerca de 2 atendimentos.
    await expect(recibo).toContainText('2 atendimentos')
    await expect(page.getByRole('button', { name: 'Imprimir ou salvar em PDF' })).toBeVisible()
  })

  test('recibo da doação de item, sem valor', async ({ page }) => {
    const doadora = `TESTE US-16 item ${Date.now()}`
    await entrar(page)

    await page.goto('/doacoes/itens/nova')
    await doacaoSemFicha(page, doadora)
    await page.getByLabel('Categoria').selectOption({ index: 1 })
    await page.getByRole('button', { name: 'Registrar doação' }).click()
    await expect(page).toHaveURL(/\/doacoes\/itens$/)

    const href = await page.getByRole('row').filter({ hasText: doadora }).getByRole('link', { name: 'Recibo' }).getAttribute('href')
    expect(href).toMatch(/^\/recibo\/itens\/[0-9a-f-]+$/)
    await page.goto(href!)

    const recibo = page.getByTestId('recibo')
    await expect(recibo).toContainText(doadora)
    await expect(recibo).toContainText('doação de itens da categoria')
    await expect(recibo).not.toContainText('R$')
  })
})
