// US-31 · A coordenação cadastra quem capta, marca a doação e vê a comissão calculada.
import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import { doacaoSemFicha, entrar } from './apoio'
import { CAIXA, entrarNaApi } from '../acesso/apoio'

// Doação em dinheiro pela tela, sem maquininha: o líquido é o próprio valor.
async function doar(page: Page, nome: string, valor: string) {
  await page.goto('/doacoes/dinheiro/nova')
  await doacaoSemFicha(page, nome)
  await page.locator('input[name="amount"]').fill(valor)
  await page.getByRole('button', { name: 'Registrar doação' }).click()
  await page.waitForURL(/\/doacoes\/dinheiro$/)
}

test('doação marcada mostra 25% do líquido na linha, na soma do mês e na das marcadas', async ({ page }) => {
  const doador = `TESTE US-31 ${Date.now()}`
  const semComissao = `TESTE US-31 sem ${Date.now()}`
  const captador = `Captadora ${Date.now()}`

  await entrar(page)
  await doar(page, doador, '300.00')
  await doar(page, semComissao, '300.00')
  await page.goto('/relatorios/comissoes')
  await expect(page.getByTestId('percentual-em-vigor')).toHaveText('25%')
  await page.getByLabel('Nome de quem capta').fill(captador)
  await page.getByRole('button', { name: 'Cadastrar' }).click()
  await expect(page.getByTestId('captador').filter({ hasText: captador })).toBeVisible()

  // Sem maquininha, o líquido é R$ 300,00: a comissão é R$ 75,00.
  const linha = page.getByTestId('doacao-com-comissao').filter({ hasText: doador })
  await linha.getByLabel(`Quem captou a doação de ${doador}`).selectOption({ label: captador })
  await linha.getByRole('button', { name: 'Salvar' }).click()
  await expect(linha.getByTestId('comissao-da-doacao')).toHaveText('R$ 75,00 (25%)')
  await expect(page.getByTestId('comissao-por-captador')).toContainText(`${captador}: R$ 75,00`)

  const outra = page.getByTestId('doacao-com-comissao').filter({ hasText: semComissao })
  await outra.getByLabel(`Quem captou a doação de ${semComissao}`).selectOption({ label: 'Sem comissão' })
  await outra.getByRole('button', { name: 'Salvar' }).click()
  await expect(outra.getByTestId('comissao-da-doacao')).toHaveText('sem comissão')

  await linha.getByLabel(`Somar a comissão da doação de ${doador}`).check()
  await expect(page.getByTestId('comissao-das-marcadas')).toHaveText('R$ 75,00')
})

// US-38 · A venda aparece na segunda tabela, com a mesma marcação e o mesmo percentual.
test('venda marcada mostra 25% do líquido na linha e entra na soma do mês', async ({ page }) => {
  const cliente = `TESTE US-38 ${Date.now()}`
  const captador = `Captadora vendas ${Date.now()}`
  // Preparo pela API, como o caixa: venda em dinheiro de R$ 120,00 (líquido igual ao valor).
  const { api: caixa, id: caixaId } = await entrarNaApi(CAIXA)
  const { data: forma } = await caixa.from('payment_methods').select('id').eq('name', 'cash').single()
  const { error } = await caixa.rpc('register_sale', {
    p_client_id: null, p_customer_name: cliente, p_payment_method_id: forma!.id, p_bank_id: null,
    p_installments: null, p_net_amount: 120, p_registered_by: caixaId, p_sold_at: new Date().toISOString(),
    p_items: [{ category_name: 'blusa', amount: 120 }],
  })
  expect(error).toBeNull()

  await entrar(page)
  await page.goto('/relatorios/comissoes')
  await page.getByLabel('Nome de quem capta').fill(captador)
  await page.getByRole('button', { name: 'Cadastrar' }).click()
  await expect(page.getByTestId('captador').filter({ hasText: captador })).toBeVisible()

  const linha = page.getByTestId('venda-com-comissao').filter({ hasText: cliente })
  await linha.getByLabel(`Quem captou da venda para ${cliente}`).selectOption({ label: captador })
  await linha.getByRole('button', { name: 'Salvar' }).click()
  // 25% de R$ 120,00.
  await expect(linha.getByTestId('comissao-da-venda')).toHaveText('R$ 30,00 (25%)')
  await expect(page.getByTestId('comissao-por-captador')).toContainText(`${captador}: R$ 30,00`)
})
