// SEC-04 · A correção com motivo aparece em Relatórios · Alterações.
import { test, expect } from '@playwright/test'
import { doacaoSemFicha, entrar } from './apoio'

test('corrigir uma doação de item com motivo aparece na trilha', async ({ page }) => {
  await entrar(page)
  const nome = `TESTE SEC-04 ${Date.now()}`
  const motivo = `teste da trilha ${Date.now()}`
  await page.goto('/doacoes/itens/nova')
  await doacaoSemFicha(page, nome)
  await page.getByLabel('Categoria').selectOption({ label: 'blusa' })
  await page.getByRole('button', { name: 'Registrar doação' }).click()
  await expect(page).toHaveURL(/\/doacoes\/itens$/)

  await page.getByRole('row').filter({ hasText: nome }).getByRole('link', { name: 'Editar' }).click()
  await expect(page).toHaveURL(/\/doacoes\/itens\/[0-9a-f-]+\/editar$/)
  await page.getByLabel('Observações').fill('corrigida no teste')
  await page.getByLabel('Motivo da correção (opcional)').fill(motivo)
  await page.getByRole('button', { name: 'Salvar alteração' }).click()
  await expect(page).toHaveURL(/\/doacoes\/itens$/)

  await page.goto('/relatorios/alteracoes?tabela=donations_items')
  // Outros testes podem gravar na trilha: procura pelo motivo, e não pela primeira linha.
  const linha = page.getByTestId('alteracao').filter({ hasText: motivo })
  await expect(linha).toBeVisible()
  await expect(linha).toContainText('corrigida no teste')
  await expect(linha).toContainText('Doação de item · alteração')
})

test('o formulário de nova doação não pede motivo', async ({ page }) => {
  await entrar(page)
  await page.goto('/doacoes/itens/nova')
  await expect(page.getByLabel('Motivo da correção (opcional)')).toHaveCount(0)
})
