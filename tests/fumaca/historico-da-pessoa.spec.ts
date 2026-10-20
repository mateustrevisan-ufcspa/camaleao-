import { expect, test } from '@playwright/test'
import { entrar } from './apoio'

// US-10 · Histórico unificado na ficha. Usa a Roberta Lima do seed:
// duas compras e uma doação em dinheiro de R$ 100,00.
test.describe('Fumaça: histórico unificado na ficha', () => {
  test('compras e doações numa lista só, com o tipo e o registro original', async ({ page }) => {
    await entrar(page)
    await page.goto('/clientes')
    await page.getByPlaceholder('Buscar cliente...').fill('Roberta')
    await page.getByText('Roberta Lima').first().click()
    await expect(page.getByRole('heading', { name: 'Roberta Lima' })).toBeVisible()

    const historico = page.getByTestId('historico-da-pessoa')

    await test.step('a lista tem compra e doação, cada uma com o tipo', async () => {
      await expect(historico.getByText('Compra', { exact: true }).first()).toBeVisible()
      await expect(historico.getByText('Doação · dinheiro', { exact: true }).first()).toBeVisible()
    })

    await test.step('a lista vem da mais recente para a mais antiga', async () => {
      const datas = await historico.getByTestId('data-do-registro').allTextContents()
      const emMs = datas.map((d) => {
        const [dia, mes, ano] = d.trim().split('/').map(Number)
        return Date.UTC(ano, mes - 1, dia)
      })
      expect(emMs.length).toBeGreaterThanOrEqual(3)
      expect(emMs).toEqual([...emMs].sort((a, b) => b - a))
    })

    await test.step('o registro original abre a partir da lista', async () => {
      await historico.getByText('Doação · dinheiro', { exact: true }).first().click()
      const painel = page.getByRole('dialog', { name: 'Registro original' })
      await expect(painel.getByRole('heading', { name: 'Doação em dinheiro' })).toBeVisible()
      await expect(painel.getByText('R$ 100,00')).toBeVisible()
      await painel.getByRole('button', { name: 'Fechar' }).click()
      await expect(painel).toHaveCount(0)
    })
  })
})
