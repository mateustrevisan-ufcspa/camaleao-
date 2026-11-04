import { expect, test } from '@playwright/test'
import { doacaoSemFicha, entrar, valorUnico } from './apoio'

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
      await doacaoSemFicha(page, 'TESTE US-12 fumaça')
      await page.locator('input[name="amount"]').fill(valor.numero.toFixed(2))
      await page.getByLabel('Evento').selectOption({ label: `${evento} · 23/10/2026` })
      await page.getByRole('button', { name: 'Registrar doação' }).click()
      await expect(page).toHaveURL(/\/doacoes\/dinheiro$/)
      await expect(page.getByText(`Evento: ${evento}`)).toBeVisible()
    })

    await test.step('o total do evento mostra a doação', async () => {
      await page.goto('/doacoes/eventos')
      // Pela célula do arrecadado: com custo zero (US-33), a diferença mostra o mesmo valor.
      await expect(page.getByRole('row').filter({ hasText: evento }).getByTestId('arrecadado-do-evento')).toHaveText(valor.exibido)
    })
  })

  // US-33 · Custo informado pela coordenação depois do evento.
  test('custo informado depois do evento muda a diferença', async ({ page }) => {
    const evento = `Bazar teste ${Date.now()}`
    await entrar(page)
    await page.goto('/doacoes/eventos')

    await page.getByLabel('Nome do evento').fill(evento)
    await page.getByLabel('Data do evento').fill('2026-10-23')
    await page.getByRole('button', { name: 'Cadastrar evento' }).click()

    const linha = page.getByRole('row').filter({ hasText: evento })
    await expect(linha.getByTestId('diferenca-do-evento')).toHaveText('R$ 0,00')

    await test.step('valor inválido não salva', async () => {
      await linha.getByRole('button', { name: `Alterar custo do evento ${evento}` }).click()
      await linha.getByLabel(`Custo do evento ${evento}`).fill('abc')
      await linha.getByRole('button', { name: 'Salvar' }).click()
      await expect(linha.getByText('O custo precisa ser zero ou mais.')).toBeVisible()
      await linha.getByRole('button', { name: 'Cancelar' }).click()
    })

    await test.step('custo de R$ 150,00 deixa a diferença negativa', async () => {
      await linha.getByRole('button', { name: `Alterar custo do evento ${evento}` }).click()
      await linha.getByLabel(`Custo do evento ${evento}`).fill('150,00')
      await linha.getByRole('button', { name: 'Salvar' }).click()
      await expect(linha.getByTestId('diferenca-do-evento')).toHaveText('− R$ 150,00')
    })
  })
})