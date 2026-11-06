import { expect, test } from '@playwright/test'
import { doacaoSemFicha, entrar } from './apoio'

// US-27 · Entrada sem contagem, triagem depois e somas no relatório.
test.describe('Fumaça: contagem da triagem', () => {
  test('entrada sem contagem fica pendente; a triagem depois aparece na lista e no relatório', async ({ page }) => {
    const categoria = `triagem ${Date.now()}`
    const doadora = `TESTE US-27 ${Date.now()}`
    await entrar(page)

    await test.step('categoria própria, para o relatório ter só esta doação', async () => {
      await page.goto('/doacoes/categorias')
      await page.getByLabel('Nova categoria').fill(categoria)
      await page.getByRole('button', { name: 'Cadastrar' }).click()
      await expect(page.getByLabel(`Nome da categoria ${categoria}`)).toBeVisible()
    })

    await test.step('entrada: sem Quantidade, sem Peso, sem Estado e sem Destino', async () => {
      await page.goto('/doacoes/itens/nova')
      await doacaoSemFicha(page, doadora)
      await page.getByLabel('Categoria').selectOption({ label: categoria })
      await expect(page.getByLabel('Quantidade')).toHaveCount(0)
      await expect(page.getByLabel('Peso (kg)')).toHaveCount(0)
      await expect(page.getByText('Estado', { exact: true })).toHaveCount(0)
      await expect(page.getByLabel('Aproveitadas')).toBeVisible()
      await page.getByRole('button', { name: 'Registrar doação' }).click()
      await expect(page).toHaveURL(/\/doacoes\/itens$/)
      await expect(page.getByRole('row').filter({ hasText: doadora }).getByText('Triagem pendente')).toBeVisible()
    })

    await test.step('triagem: as três contagens na seção de pendentes', async () => {
      const pendente = page.getByTestId('pendente').filter({ hasText: doadora })
      await pendente.getByLabel('Aproveitadas').fill('12')
      await pendente.getByLabel('Redoadas').fill('3')
      await pendente.getByLabel('Descarte').fill('1')
      await pendente.getByRole('button', { name: 'Registrar triagem' }).click()
      await expect(page.getByTestId('pendente').filter({ hasText: doadora })).toHaveCount(0)
      await expect(
        page.getByRole('row').filter({ hasText: doadora }).getByTestId('triagem-da-doacao'),
      ).toHaveText('12 aproveitadas · 3 redoadas · 1 descarte')
    })

    await test.step('o relatório consolidado soma as contagens da categoria', async () => {
      await page.goto('/relatorios')
      const linha = page.getByTestId('relatorio-itens').getByRole('row').filter({ hasText: categoria })
      await expect(linha).toContainText('16') // peças
      await expect(linha).toContainText('12')
      await expect(linha).toContainText('3')
    })
  })

  test('contagem acima de 300 é recusada', async ({ page }) => {
    await entrar(page)
    await page.goto('/doacoes/itens/nova')
    await doacaoSemFicha(page, `TESTE US-27 limite ${Date.now()}`)
    await page.getByLabel('Categoria').selectOption({ index: 1 })
    await page.getByLabel('Aproveitadas').fill('301')
    await page.getByRole('button', { name: 'Registrar doação' }).click()
    // O navegador barra pelo max=300; sem ele, o servidor responderia com o aviso.
    await expect(page).toHaveURL(/\/doacoes\/itens\/nova/)
  })
})
