// US-04b · A coordenação corrige e cancela uma doação em dinheiro pela tela.
import { test, expect } from '@playwright/test'
import { doacaoSemFicha, entrar, valorUnico } from './apoio'

test('corrigir o valor e depois cancelar', async ({ page }) => {
  await entrar(page)
  const valor = valorUnico(40)
  const nome = `TESTE US-04b ${Date.now()}`
  await page.goto('/doacoes/dinheiro/nova')
  await doacaoSemFicha(page, nome)
  await page.locator('input[name="amount"]').fill(valor.numero.toFixed(2))
  await page.getByRole('button', { name: 'Registrar doação' }).click()
  await page.waitForURL(/\/doacoes\/dinheiro$/)

  const linha = page.getByRole('row').filter({ hasText: nome })
  await linha.getByRole('link', { name: 'Corrigir' }).click()
  await page.getByLabel('Valor (R$)').fill('45.00')
  await page.getByLabel('Motivo da correção (opcional)').fill('valor conferido no extrato')
  await page.getByRole('button', { name: 'Salvar correção' }).click()
  await page.waitForURL(/\/doacoes\/dinheiro$/)
  await expect(linha).toContainText('R$ 45,00')

  await linha.getByRole('button', { name: 'Cancelar' }).click()
  await linha.getByLabel('Motivo do cancelamento').fill('doação de teste')
  await linha.getByRole('button', { name: 'Confirmar cancelamento' }).click()
  await expect(page.getByRole('row').filter({ hasText: nome })).toHaveCount(0)

  await page.goto('/relatorios/alteracoes?tabela=donations_cash')
  await expect(page.getByTestId('motivo').filter({ hasText: 'doação de teste' }).first()).toBeVisible()
})
