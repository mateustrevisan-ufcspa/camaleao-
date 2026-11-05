import { expect, test } from '@playwright/test'
import { doacaoSemFicha, entrar } from './apoio'

// US-04a · Editar e excluir doação de item pela tela.
test.describe('Fumaça: editar e excluir doação de item', () => {
  test('editar muda a linha; excluir pede confirmação e tira da lista', async ({ page }) => {
    const doadora = `TESTE US-04a ${Date.now()}`
    await entrar(page)

    await test.step('registrar uma doação com 3 peças', async () => {
      await page.goto('/doacoes/itens/nova')
      await doacaoSemFicha(page, doadora)
      await page.getByLabel('Categoria').selectOption({ index: 1 })
      await page.getByLabel('Quantidade').fill('3')
      await page.getByRole('button', { name: 'Registrar doação' }).click()
      await expect(page).toHaveURL(/\/doacoes\/itens$/)
      await expect(page.getByRole('row').filter({ hasText: doadora }).getByText('3 un')).toBeVisible()
    })

    await test.step('editar: o formulário abre preenchido e salvar altera', async () => {
      await page.getByRole('row').filter({ hasText: doadora }).getByRole('link', { name: 'Editar' }).click()
      await expect(page).toHaveURL(/\/doacoes\/itens\/[0-9a-f-]+\/editar$/)
      await expect(page.getByLabel('Quantidade')).toHaveValue('3')
      await expect(page.getByLabel('Nome')).toHaveValue(doadora)
      await page.getByLabel('Quantidade').fill('5')
      await page.getByLabel('Observações').fill('corrigido no teste')
      await page.getByRole('button', { name: 'Salvar alteração' }).click()
      await expect(page).toHaveURL(/\/doacoes\/itens$/)
      const linha = page.getByRole('row').filter({ hasText: doadora })
      await expect(linha.getByText('5 un')).toBeVisible()
      await expect(linha.getByText('corrigido no teste')).toBeVisible()
    })

    await test.step('excluir: pede confirmação e a linha some', async () => {
      const linha = page.getByRole('row').filter({ hasText: doadora })
      await linha.getByRole('button', { name: 'Excluir' }).click()
      await linha.getByRole('button', { name: 'Confirmar exclusão' }).click()
      await expect(page.getByRole('row').filter({ hasText: doadora })).toHaveCount(0)
    })
  })
})
