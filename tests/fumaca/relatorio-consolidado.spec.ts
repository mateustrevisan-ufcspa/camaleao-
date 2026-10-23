import { expect, test, type Locator } from '@playwright/test'
import { entrar } from './apoio'

// US-17 · Relatório consolidado do Instituto.

// O primeiro valor em reais dentro de um trecho da tela.
async function reais(trecho: Locator): Promise<string> {
  const texto = (await trecho.textContent()) ?? ''
  const achado = texto.match(/R\$\s?[\d.]+,\d{2}/)
  expect(achado, `nenhum valor em reais em "${texto}"`).not.toBeNull()
  return achado![0].replace(/\s/g, ' ')
}

test.describe('Fumaça: relatório consolidado', () => {
  test('junho do seed: totais, itens por categoria e ranking', async ({ page }) => {
    await entrar(page)
    await page.goto('/relatorios?de=2026-06-01&ate=2026-06-30')
    const secao = page.getByTestId('relatorio-consolidado')

    // Junho no seed: 6 vendas (R$ 433,00) e 2 doações em dinheiro (R$ 250,00 e R$ 480,00).
    await expect(secao.getByTestId('relatorio-vendas')).toHaveText('R$ 433,00')
    await expect(secao.getByTestId('relatorio-doacoes')).toHaveText('R$ 730,00')
    await expect(secao.getByTestId('relatorio-total')).toHaveText('R$ 1.163,00')

    const tampinha = secao.getByTestId('relatorio-itens').getByRole('row').filter({ hasText: 'tampinha' })
    await expect(tampinha).toContainText('4.600')
    await expect(tampinha).toContainText('16,5 kg')

    const primeiro = secao.getByTestId('relatorio-ranking').getByRole('listitem').first()
    await expect(primeiro).toContainText('Sônia Maria Reis')
    await expect(primeiro).toContainText('R$ 250,00')
  })

  test('mostra a parte das doações que veio de ingresso de evento', async ({ page }) => {
    await entrar(page)
    // Maio no seed: doações de R$ 50,00 e o ingresso de R$ 120,00 do Jantar de outono (US-12).
    await page.goto('/relatorios?de=2026-05-01&ate=2026-05-31')
    const secao = page.getByTestId('relatorio-consolidado')
    await expect(secao.getByTestId('relatorio-evento')).toHaveText('das quais no evento Jantar de outono: R$ 120,00')
  })

  test('mostra a parte das doações que foi para cada campanha', async ({ page }) => {
    await entrar(page)
    // Julho no seed: a doação de R$ 150,00 ao Natalenço 2026 (US-13).
    await page.goto('/relatorios?de=2026-07-01&ate=2026-07-31')
    const secao = page.getByTestId('relatorio-consolidado')
    await expect(secao.getByTestId('relatorio-campanha')).toHaveText('das quais na campanha Natalenço 2026: R$ 150,00')
  })

  test('este mês bate com o painel do brechó e com a tela de doações', async ({ page }) => {
    await entrar(page)

    await page.goto('/relatorios')
    const secao = page.getByTestId('relatorio-consolidado')
    await expect(secao.getByRole('link', { name: 'Este mês' })).toHaveAttribute('aria-current', 'page')
    const vendas = await reais(secao.getByTestId('relatorio-vendas'))
    const doacoes = await reais(secao.getByTestId('relatorio-doacoes'))

    await page.goto('/brecho')
    expect(await reais(page.getByText(/^Mês de /).locator('..')), 'vendas do mês no painel').toBe(vendas)

    await page.goto('/doacoes/dinheiro')
    expect(await reais(page.getByText('Total recebido · mês').locator('..')), 'doações do mês na tela de doações').toBe(doacoes)
  })
})