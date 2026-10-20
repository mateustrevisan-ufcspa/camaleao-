import { expect, test, type Page } from '@playwright/test'
import { entrar } from './apoio'

// US-15 · Contribuição total da pessoa no período. Usa datas do seed (março a
// junho de 2026), que os outros testes não alteram: eles gravam com a data de hoje.

async function abrirFicha(page: Page, nome: string) {
  await page.goto('/clientes')
  await page.getByPlaceholder('Buscar cliente...').fill(nome.split(' ')[0])
  await page.getByText(nome).first().click()
  await expect(page.getByRole('heading', { name: nome })).toBeVisible()
}

async function escolherDatas(page: Page, de: string, ate: string) {
  const cartao = page.getByTestId('contribuicao-no-periodo')
  await cartao.getByRole('button', { name: 'Escolher datas' }).click()
  await cartao.getByLabel('De').fill(de)
  await cartao.getByLabel('Até').fill(ate)
  return cartao
}

test.describe('Fumaça: contribuição no período', () => {
  test('soma compras e doações em dinheiro no período', async ({ page }) => {
    await entrar(page)
    // Três cliques desde o menu: Clientes, a pessoa, e o total já aparece (este ano).
    await abrirFicha(page, 'Roberta Lima')
    await expect(page.getByTestId('contribuicao-total')).toBeVisible()

    // Roberta, de março a junho: compras de R$ 90,00 e R$ 48,00 e uma doação de R$ 100,00.
    const cartao = await escolherDatas(page, '2026-03-01', '2026-06-30')
    await expect(cartao.getByTestId('contribuicao-compras')).toHaveText('R$ 138,00')
    await expect(cartao.getByTestId('contribuicao-doacoes')).toHaveText('R$ 100,00')
    await expect(cartao.getByTestId('contribuicao-total')).toHaveText('R$ 238,00')
  })

  test('lista os itens doados com categoria e data', async ({ page }) => {
    await entrar(page)
    await abrirFicha(page, 'Patrícia Nunes')

    // Patrícia, em junho: uma compra de R$ 65,00 e as tampinhas de 05/06.
    const cartao = await escolherDatas(page, '2026-06-01', '2026-06-30')
    await expect(cartao.getByTestId('contribuicao-total')).toHaveText('R$ 65,00')
    const itens = cartao.getByTestId('contribuicao-itens')
    await expect(itens.getByText('tampinha · 1200 un · 4,5 kg')).toBeVisible()
    await expect(itens.getByText('05/06/2026')).toBeVisible()
  })
})
