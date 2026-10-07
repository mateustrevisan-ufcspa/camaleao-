import { expect, test } from '@playwright/test'
import { entrar, valorUnico } from './apoio'

test.describe('Fumaça: fluxos críticos', () => {
  test('login com a usuária local', async ({ page }) => {
    await entrar(page)
  })

  test('rota protegida sem login volta para /login', async ({ page }) => {
    await test.step('Acessar /brecho sem sessão', async () => {
      await page.goto('/brecho')
    })
    await test.step('Ser redirecionado para o login', async () => {
      await expect(page, 'uma rota interna abriu sem login').toHaveURL(/\/login$/)
    })
  })

  test('registro de venda', async ({ page }) => {
    const valor = valorUnico(137)
    await entrar(page)

    await test.step('Venda: abrir o formulário de nova venda', async () => {
      await page.goto('/brecho/nova-venda')
      await expect(page.getByRole('button', { name: 'Registrar venda' }), 'o formulário de venda não carregou').toBeVisible()
    })

    await test.step(`Venda: preencher uma peça de ${valor.exibido}`, async () => {
      await page.getByPlaceholder('Categoria (saia, blusa, vestido...)').fill('blusa')
      await page.getByPlaceholder('0,00').fill(valor.digitado)
    })

    await test.step('Venda: registrar', async () => {
      await page.getByRole('button', { name: 'Registrar venda' }).click()
      await expect(page, 'depois de registrar a venda a aplicação deveria voltar para /brecho').toHaveURL(/\/brecho$/)
    })

    await test.step('Venda: conferir que aparece nas vendas de hoje', async () => {
      await expect(page.getByText(valor.exibido).first(), `a venda de ${valor.exibido} não apareceu no painel`).toBeVisible()
    })
  })

  test('registro de doação em dinheiro', async ({ page }) => {
    const valor = valorUnico(42)
    const doador = `Doador Fumaça ${Date.now()}`
    await entrar(page)

    await test.step('Doação: abrir o formulário de nova doação', async () => {
      await page.goto('/doacoes/dinheiro/nova')
      await expect(page.getByRole('button', { name: 'Registrar doação' }), 'o formulário de doação não carregou').toBeVisible()
    })

    await test.step(`Doação: preencher doador e valor de ${valor.exibido}`, async () => {
      await page.getByPlaceholder('Nome completo (ou Anônimo)').fill(doador)
      await page.locator('input[name="amount"]').fill(valor.numero.toFixed(2))
    })

    await test.step('Doação: registrar', async () => {
      await page.getByRole('button', { name: 'Registrar doação' }).click()
      await expect(page, 'depois de registrar a doação a aplicação deveria abrir /doacoes/dinheiro').toHaveURL(/\/doacoes\/dinheiro$/)
    })

    await test.step('Doação: conferir que aparece na lista', async () => {
      await expect(page.getByText(doador), `a doação de "${doador}" não apareceu na lista`).toBeVisible()
    })
  })
})
