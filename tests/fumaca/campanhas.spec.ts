import { expect, test } from '@playwright/test'
import { entrar, valorUnico } from './apoio'

// US-13 · Campanha cadastrada, doação vinculada, total e encerramento.
// A doação escolhe uma pessoa (Antônia Ferreira), para o teste valer com ou sem
// a escolha explícita de "doação sem ficha" da US-14.
const reais = (n: number) => `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

test.describe('Fumaça: doação de campanha', () => {
  test('cadastrar, doar, ver arrecadado, custo e diferença, e encerrar', async ({ page }) => {
    const campanha = `Campanha teste ${Date.now()}`
    const valor = valorUnico(30)
    await entrar(page)

    await test.step('cadastrar a campanha com custo de R$ 100,00', async () => {
      await page.goto('/doacoes/campanhas')
      await page.getByLabel('Nome da campanha').fill(campanha)
      await page.getByLabel('Início').fill('2026-10-01')
      await page.getByLabel('Custo estimado').fill('100,00')
      await page.getByRole('button', { name: 'Cadastrar' }).click()
      await expect(page.getByRole('row').filter({ hasText: campanha })).toBeVisible()
    })

    await test.step('doar para a campanha', async () => {
      await page.goto('/doacoes/dinheiro/nova')
      await page.getByLabel('Buscar pessoa').fill('antonia')
      await page.getByTestId('resultado-da-busca').getByText('Antônia Ferreira').click()
      await page.locator('input[name="amount"]').fill(valor.numero.toFixed(2))
      await page.getByLabel('Campanha').selectOption({ label: campanha })
      await page.getByRole('button', { name: 'Registrar doação' }).click()
      await expect(page).toHaveURL(/\/doacoes\/dinheiro$/)
      await expect(page.getByText(`Campanha: ${campanha}`)).toBeVisible()
    })

    await test.step('a campanha mostra arrecadado, custo e diferença', async () => {
      await page.goto('/doacoes/campanhas')
      const linha = page.getByRole('row').filter({ hasText: campanha })
      await expect(linha).toContainText(valor.exibido)
      await expect(linha).toContainText('R$ 100,00')
      await expect(linha.getByTestId('diferenca-da-campanha')).toHaveText(`− ${reais(100 - valor.numero)}`)
    })

    await test.step('encerrar mantém a campanha na lista e tira do formulário', async () => {
      const linha = page.getByRole('row').filter({ hasText: campanha })
      await linha.getByRole('button', { name: 'Encerrar' }).click()
      await expect(linha.getByText(/encerrada em/)).toBeVisible()
      await expect(linha).toContainText(valor.exibido)

      await page.goto('/doacoes/dinheiro/nova')
      await expect(page.getByLabel('Campanha').locator('option', { hasText: campanha })).toHaveCount(0)
    })
  })
})