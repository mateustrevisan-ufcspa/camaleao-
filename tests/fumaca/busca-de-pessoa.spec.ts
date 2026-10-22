import { expect, test, type Page } from '@playwright/test'
import { entrar } from './apoio'

// US-06: a busca tem de responder em menos de 2 segundos.
const LIMITE_MS = 2000

async function buscar(page: Page, termo: string, esperado: string) {
  const campo = page.getByLabel('Buscar pessoa')
  const lista = page.getByTestId('resultado-da-busca')
  await campo.fill('')
  const inicio = Date.now()
  await campo.fill(termo)
  await expect(lista.getByText(esperado), `"${termo}" deveria achar ${esperado}`).toBeVisible({ timeout: LIMITE_MS })
  const tempo = Date.now() - inicio
  expect(tempo, `a busca por "${termo}" levou ${tempo} ms`).toBeLessThan(LIMITE_MS)
  return lista
}

test.describe('Fumaça: busca de pessoa', () => {
  test('na nova venda: nome sem acento, apelido e telefone', async ({ page }) => {
    await entrar(page)
    await page.goto('/brecho/nova-venda')
    // Primeira busca fora da medição: em desenvolvimento ela inclui a compilação da tela.
    await page.getByLabel('Buscar pessoa').fill('rob')
    await expect(page.getByTestId('resultado-da-busca').getByText('Roberta Lima')).toBeVisible()

    await buscar(page, 'claudia', 'Cláudia Berthold')
    await buscar(page, 'beta', 'Roberta Lima')
    const lista = await buscar(page, '3344', 'Roberta Lima')

    await test.step('a lista mostra quem já comprou e quem já doou', async () => {
      await expect(lista.getByText('já comprou')).toBeVisible()
      await expect(lista.getByText('já doou')).toBeVisible()
    })

    await test.step('escolher a pessoa preenche a venda', async () => {
      await lista.getByText('Roberta Lima').click()
      await expect(page.getByRole('button', { name: 'Trocar pessoa' })).toBeVisible()
    })
  })

  test('na nova doação: a mesma busca', async ({ page }) => {
    await entrar(page)
    for (const tela of ['/doacoes/dinheiro/nova', '/doacoes/itens/nova']) {
      await page.goto(tela)
      await page.getByLabel('Buscar pessoa').fill('rob')
      await expect(page.getByTestId('resultado-da-busca').getByText('Roberta Lima'), `a busca não funcionou em ${tela}`).toBeVisible()
    }
  })
})
