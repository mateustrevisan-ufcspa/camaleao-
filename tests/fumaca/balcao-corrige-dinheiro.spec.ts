// US-37 · O caixa acha uma doação em dinheiro pelo dia, corrige sem motivo e cancela com motivo.
import { test, expect } from '@playwright/test'
import { CAIXA, VOLUNTARIA, entrarPelaTela } from '../acesso/apoio'
import { doacaoSemFicha, valorUnico } from './apoio'

test('o caixa corrige e cancela pela tela Brechó · Corrigir lançamento', async ({ page }) => {
  await entrarPelaTela(page, CAIXA)
  await expect(page).toHaveURL(/\/brecho$/)

  // Registra uma doação em dinheiro de hoje.
  const valor = valorUnico(40)
  const nome = `TESTE US-37 ${Date.now()}`
  await page.goto('/doacoes/dinheiro/nova')
  await doacaoSemFicha(page, nome)
  await page.locator('input[name="amount"]').fill(valor.numero.toFixed(2))
  await page.getByRole('button', { name: 'Registrar doação' }).click()
  await page.waitForURL(/\/doacoes\/dinheiro$/)

  // Acha pelo dia (hoje, o padrão da tela) e corrige, sem motivo.
  await page.goto('/brecho/corrigir')
  const linha = page.getByTestId('lancamento').filter({ hasText: nome })
  await expect(linha).toContainText(valor.exibido)
  await linha.getByRole('link', { name: 'Corrigir' }).click()
  await page.getByLabel('Valor (R$)').fill('45.00')
  await page.getByRole('button', { name: 'Salvar correção' }).click()
  // O formulário volta para o dia aberto em Corrigir lançamento.
  await page.waitForURL(/\/brecho\/corrigir\?dia=\d{4}-\d{2}-\d{2}$/)
  await expect(page.getByTestId('lancamento').filter({ hasText: nome })).toContainText('R$ 45,00')

  // Cancela, com motivo, e a linha some.
  const corrigida = page.getByTestId('lancamento').filter({ hasText: nome })
  await corrigida.getByRole('button', { name: 'Cancelar' }).click()
  await corrigida.getByLabel('Motivo do cancelamento').fill('doação de teste do balcão')
  await corrigida.getByRole('button', { name: 'Confirmar cancelamento' }).click()
  await expect(page.getByTestId('lancamento').filter({ hasText: nome })).toHaveCount(0)
})

test('a voluntária volta para as doações de item ao abrir Corrigir lançamento', async ({ page }) => {
  await entrarPelaTela(page, VOLUNTARIA)
  await page.waitForURL(/\/doacoes\/itens$/)
  await page.goto('/brecho/corrigir')
  await expect(page).toHaveURL(/\/doacoes\/itens/)
})
