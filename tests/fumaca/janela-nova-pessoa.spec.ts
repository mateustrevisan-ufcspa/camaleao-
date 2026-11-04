import { expect, test } from '@playwright/test'
import { entrar } from './apoio'

// BUG-03 · A janela de nova pessoa cabe em tela baixa: título e botões ao alcance.
// Alturas de tela útil, sem a barra do navegador: notebook de 1366x768 e celular de 390x844.
const TELAS = [
  { nome: 'notebook 1366x768', viewport: { width: 1366, height: 600 } },
  { nome: 'celular 390x844', viewport: { width: 390, height: 664 } },
]

const ENTRADAS = [
  { nome: 'Doações · Itens · Nova doação', endereco: '/doacoes/itens/nova' },
  { nome: 'Brechó · Nova venda', endereco: '/brecho/nova-venda' },
]

for (const tela of TELAS) {
  test.describe(`Fumaça: janela de nova pessoa, ${tela.nome}`, () => {
    test.use({ viewport: tela.viewport })

    for (const entrada of ENTRADAS) {
      test(`${entrada.nome}: título visível e Cadastrar ao alcance`, async ({ page }) => {
        const nome = `TESTE BUG-03 ${Date.now()}`
        await entrar(page)
        await page.goto(entrada.endereco)

        await page.getByRole('button', { name: 'Cadastrar novo' }).click()
        await expect(page.getByRole('heading', { name: 'Novo cliente' })).toBeInViewport()

        await page.getByPlaceholder('Ex.: Roberta Lima').fill(nome)
        const cadastrar = page.getByRole('button', { name: 'Cadastrar', exact: true })
        // Sem rolagem na janela, o botão fica fora da tela e o clique não acontece.
        await cadastrar.click({ timeout: 5_000 })

        await expect(page.getByRole('heading', { name: 'Novo cliente' })).toHaveCount(0)
        await expect(page.getByText(nome).first()).toBeVisible()
        // Na nova doação, o envio do cadastro não pode disparar o envio da doação.
        await expect(page.getByText('Escolha a pessoa ou marque doação sem ficha.')).toHaveCount(0)
      })
    }
  })
}