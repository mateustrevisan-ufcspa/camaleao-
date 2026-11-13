// US-31 · A coordenação cadastra quem capta, marca a doação e vê a comissão calculada.
import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { doacaoSemFicha, entrar } from './apoio'

// Doação em dinheiro pela tela, sem maquininha: o líquido é o próprio valor.
async function doar(page: Page, nome: string, valor: string) {
  await page.goto('/doacoes/dinheiro/nova')
  await doacaoSemFicha(page, nome)
  await page.locator('input[name="amount"]').fill(valor)
  await page.getByRole('button', { name: 'Registrar doação' }).click()
  await page.waitForURL(/\/doacoes\/dinheiro$/)
}

test('doação marcada mostra 25% do líquido na linha, na soma do mês e na das marcadas', async ({ page }) => {
  const doador = `TESTE US-31 ${Date.now()}`
  const semComissao = `TESTE US-31 sem ${Date.now()}`
  const captador = `Captadora ${Date.now()}`

  await entrar(page)
  await doar(page, doador, '300.00')
  await doar(page, semComissao, '300.00')
  await page.goto('/relatorios/comissoes')
  await expect(page.getByTestId('percentual-em-vigor')).toHaveText('25%')
  await page.getByLabel('Nome de quem capta').fill(captador)
  await page.getByRole('button', { name: 'Cadastrar' }).click()
  await expect(page.getByTestId('captador').filter({ hasText: captador })).toBeVisible()

  // Sem maquininha, o líquido é R$ 300,00: a comissão é R$ 75,00.
  const linha = page.getByTestId('doacao-com-comissao').filter({ hasText: doador })
  await linha.getByLabel(`Quem captou a doação de ${doador}`).selectOption({ label: captador })
  await linha.getByRole('button', { name: 'Salvar' }).click()
  await expect(linha.getByTestId('comissao-da-doacao')).toHaveText('R$ 75,00 (25%)')
  await expect(page.getByTestId('comissao-por-captador')).toContainText(`${captador}: R$ 75,00`)

  const outra = page.getByTestId('doacao-com-comissao').filter({ hasText: semComissao })
  await outra.getByLabel(`Quem captou a doação de ${semComissao}`).selectOption({ label: 'Sem comissão' })
  await outra.getByRole('button', { name: 'Salvar' }).click()
  await expect(outra.getByTestId('comissao-da-doacao')).toHaveText('sem comissão')

  await linha.getByLabel(`Somar a comissão da doação de ${doador}`).check()
  await expect(page.getByTestId('comissao-das-marcadas')).toHaveText('R$ 75,00')
})
