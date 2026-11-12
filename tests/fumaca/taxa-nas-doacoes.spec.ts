// US-35 · Doação pela maquininha mostra o líquido na lista.
import { test, expect } from '@playwright/test'
import { atendimentos, textoDeAtendimentos } from '../../lib/atendimentos'
import { doacaoSemFicha, entrar, valorUnico } from './apoio'

test('doação no crédito à vista da PagBank aparece com o líquido', async ({ page }) => {
  await entrar(page)
  const valor = valorUnico(100)
  await page.goto('/doacoes/dinheiro/nova')
  await doacaoSemFicha(page, 'TESTE US-35 fumaça')
  await page.locator('input[name="amount"]').fill(valor.numero.toFixed(2))
  await page.getByLabel('Recebido por').selectOption({ label: 'PagBank' })
  await page.getByLabel('Forma', { exact: true }).selectOption({ label: 'Crédito à vista' })
  await expect(page.getByTestId('liquido-estimado')).toContainText('3,19%')
  await page.getByRole('button', { name: 'Registrar doação' }).click()
  await page.waitForURL(/\/doacoes\/dinheiro$/)

  const linha = page.getByRole('row').filter({ hasText: valor.exibido })
  const liquido = Math.round(valor.numero * (1 - 3.19 / 100) * 100) / 100
  await expect(linha.getByTestId('liquido-da-doacao')).toHaveText(`R$ ${liquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`)
  await expect(linha).toContainText('PagBank · Crédito à vista · 3,19%')
})

test('sem maquininha, o líquido é o próprio valor', async ({ page }) => {
  await entrar(page)
  const valor = valorUnico(40)
  await page.goto('/doacoes/dinheiro/nova')
  await doacaoSemFicha(page, 'TESTE US-35 sem maquininha')
  await page.locator('input[name="amount"]').fill(valor.numero.toFixed(2))
  await expect(page.getByTestId('liquido-estimado')).toHaveCount(0)
  await page.getByRole('button', { name: 'Registrar doação' }).click()
  await page.waitForURL(/\/doacoes\/dinheiro$/)

  const linha = page.getByRole('row').filter({ hasText: valor.exibido })
  await expect(linha.getByTestId('liquido-da-doacao')).toHaveText(valor.exibido)
})

// Pergunta 8 (Nílian, 09/11): atendimentos pelo bruto; pelo líquido só na maquininha de cartão.
// R$ 500 dá 10 atendimentos pelo bruto e 9,7 pelo líquido no crédito da PagBank.
test('na maquininha de cartão, lista e recibo contam os atendimentos pelo líquido', async ({ page }) => {
  await entrar(page)
  const doador = `TESTE US-35 atendimentos cartão ${Date.now()}`
  const valor = valorUnico(500)
  await page.goto('/doacoes/dinheiro/nova')
  await doacaoSemFicha(page, doador)
  await page.locator('input[name="amount"]').fill(valor.numero.toFixed(2))
  await page.getByLabel('Recebido por').selectOption({ label: 'PagBank' })
  await page.getByLabel('Forma', { exact: true }).selectOption({ label: 'Crédito à vista' })
  await page.getByRole('button', { name: 'Registrar doação' }).click()
  await page.waitForURL(/\/doacoes\/dinheiro$/)

  const liquido = Math.round(valor.numero * (1 - 3.19 / 100) * 100) / 100
  const esperado = textoDeAtendimentos(atendimentos(liquido, 50))
  const linha = page.getByRole('row').filter({ hasText: doador })
  await expect(linha.getByTestId('atendimentos-da-doacao')).toHaveText(esperado)

  const href = await linha.getByRole('link', { name: 'Recibo' }).getAttribute('href')
  await page.goto(href!)
  const recibo = page.getByTestId('recibo')
  // O recibo mostra o valor doado, e os atendimentos pelo líquido.
  await expect(recibo).toContainText(valor.exibido)
  await expect(recibo).toContainText(esperado)
})

test('no Pix, os atendimentos contam pelo valor doado', async ({ page }) => {
  await entrar(page)
  const doador = `TESTE US-35 atendimentos Pix ${Date.now()}`
  const valor = valorUnico(500)
  await page.goto('/doacoes/dinheiro/nova')
  await doacaoSemFicha(page, doador)
  await page.locator('input[name="amount"]').fill(valor.numero.toFixed(2))
  await page.getByLabel('Recebido por').selectOption({ label: 'PIX PagBank' })
  await page.getByLabel('Forma', { exact: true }).selectOption({ label: 'Pix' })
  await page.getByRole('button', { name: 'Registrar doação' }).click()
  await page.waitForURL(/\/doacoes\/dinheiro$/)

  const linha = page.getByRole('row').filter({ hasText: doador })
  await expect(linha.getByTestId('atendimentos-da-doacao')).toHaveText(textoDeAtendimentos(atendimentos(valor.numero, 50)))
})

test('a nova venda não mostra a Doação Solutions', async ({ page }) => {
  await entrar(page)
  await page.goto('/brecho/nova-venda')
  await page.getByRole('button', { name: /Crédito/ }).click()
  await expect(page.locator('#banco-da-venda option', { hasText: 'Doação Solutions' })).toHaveCount(0)
  await expect(page.locator('#banco-da-venda option', { hasText: 'PagBank' })).not.toHaveCount(0)
})
