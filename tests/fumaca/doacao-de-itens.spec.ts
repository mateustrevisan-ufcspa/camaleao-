import { expect, test } from '@playwright/test'
import { entrar } from './apoio'

// US-11 · Doação de itens com categorias editáveis.
test.describe('Fumaça: doação de itens e categorias', () => {
  test('tampinha só com o registro de que chegou, pela tela antiga', async ({ page }) => {
    // Sem a palavra "tampinha" no nome, para a etiqueta ser o único "tampinha" da linha.
    const doadora = `Doadora US-11 ${Date.now()}`
    await entrar(page)

    await page.goto('/doacoes/tampinhas/nova')
    await expect(page).toHaveURL(/\/doacoes\/itens\/nova\?categoria=tampinha$/)
    await expect(page.getByLabel('Categoria')).toHaveValue(/.+/)

    await page.getByPlaceholder('Nome completo (ou Anônimo)').fill(doadora)
    await page.getByRole('button', { name: 'Registrar doação' }).click()
    await expect(page).toHaveURL(/\/doacoes\/itens$/)

    const linha = page.getByRole('row').filter({ hasText: doadora })
    await expect(linha.getByText('tampinha')).toBeVisible()
    await expect(linha.getByText('só o registro')).toBeVisible()
  })

  test('categoria cadastrada na tela aparece no formulário', async ({ page }) => {
    const nome = `teste ${Date.now()}`
    await entrar(page)

    await page.goto('/doacoes/categorias')
    await page.getByLabel('Nova categoria').fill(nome)
    await page.getByRole('button', { name: 'Cadastrar' }).click()
    await expect(page.getByLabel(`Nome da categoria ${nome}`)).toBeVisible()

    await page.goto('/doacoes/itens/nova')
    await expect(page.getByLabel('Categoria').locator('option', { hasText: nome })).toHaveCount(1)
  })
})