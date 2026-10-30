import { expect, test } from '@playwright/test'
import { atendimentos, textoDeAtendimentos } from '../../lib/atendimentos'
import { entrar, valorUnico } from './apoio'

// US-19 · Contribuição convertida em atendimentos.

test('a conta e o texto: uma casa decimal e o plural do português', () => {
  expect(atendimentos(30, 50)).toBe(0.6)
  expect(atendimentos(138, 50)).toBe(2.8)
  expect(atendimentos(0, 50)).toBe(0)
  expect(atendimentos(100, 0)).toBe(0)
  expect(textoDeAtendimentos(0.6)).toBe('0,6 atendimento')
  expect(textoDeAtendimentos(1)).toBe('1 atendimento')
  expect(textoDeAtendimentos(1.5)).toBe('1,5 atendimento')
  expect(textoDeAtendimentos(2)).toBe('2 atendimentos')
  expect(textoDeAtendimentos(0)).toBe('0 atendimentos')
})

test.describe('Fumaça: atendimentos na tela', () => {
  test('a coordenação altera o valor, e a alteração fica registrada com o nome', async ({ page }) => {
    await entrar(page)
    await page.goto('/relatorios')
    await page.getByRole('link', { name: /Valor do atendimento/ }).click()
    await expect(page).toHaveURL(/\/relatorios\/atendimento$/)
    await expect(page.getByTestId('valor-em-vigor')).toHaveText('R$ 50,00')

    try {
      await page.getByLabel('Novo valor de um atendimento').fill('60,00')
      await page.getByRole('button', { name: 'Alterar valor' }).click()
      await expect(page.getByTestId('valor-em-vigor')).toHaveText('R$ 60,00')
      const primeira = page.getByTestId('historico-do-valor').locator('tbody tr').first()
      await expect(primeira).toContainText('R$ 60,00')
      await expect(primeira).toContainText('Coordenação Local')
    } finally {
      // Volta ao valor do seed, para os outros testes contarem com R$ 50.
      await page.getByLabel('Novo valor de um atendimento').fill('50,00')
      await page.getByRole('button', { name: 'Alterar valor' }).click()
      await expect(page.getByTestId('valor-em-vigor')).toHaveText('R$ 50,00')
    }
  })

  test('o aviso da venda mostra os atendimentos', async ({ page }) => {
    const valor = valorUnico(25) // de R$ 25,01 a R$ 25,99: sempre 0,5 atendimento com R$ 50
    await entrar(page)
    await page.goto('/brecho/nova-venda')
    await page.getByPlaceholder('Categoria (saia, blusa, vestido...)').fill('blusa')
    await page.getByPlaceholder('0,00').fill(valor.digitado)
    await page.getByRole('button', { name: 'Registrar venda' }).click()

    await expect(page).toHaveURL(/\/brecho\?venda=[\d.]+$/)
    const aviso = page.getByTestId('aviso-venda-registrada')
    await expect(aviso).toContainText(valor.exibido)
    await expect(aviso).toContainText('0,5 atendimento do Instituto')
  })

  test('a ficha mostra compras, doações e total em atendimentos', async ({ page }) => {
    await entrar(page)
    await page.goto('/clientes')
    await page.getByPlaceholder('Buscar cliente...').fill('Roberta')
    await page.getByText('Roberta Lima').first().click()

    // Mesmo período do teste da US-15: compras de R$ 138,00 e doação de R$ 100,00.
    const cartao = page.getByTestId('contribuicao-no-periodo')
    await cartao.getByRole('button', { name: 'Escolher datas' }).click()
    await cartao.getByLabel('De').fill('2026-03-01')
    await cartao.getByLabel('Até').fill('2026-06-30')
    await expect(cartao.getByTestId('atendimentos-compras')).toHaveText('2,8 atendimentos')
    await expect(cartao.getByTestId('atendimentos-doacoes')).toHaveText('2 atendimentos')
    await expect(cartao.getByTestId('atendimentos-total')).toHaveText('4,8 atendimentos')
  })

  test('a lista de doações mostra os atendimentos de cada doação', async ({ page }) => {
    await entrar(page)
    await page.goto('/doacoes/dinheiro')

    // Doação mensal da Roberta Lima, de R$ 100,00 (seed, 01/04/2026): 2 atendimentos com R$ 50.
    const linha = page.locator('tbody tr').filter({ hasText: 'Roberta Lima' }).filter({ hasText: 'R$ 100,00' }).first()
    await expect(linha.getByTestId('atendimentos-da-doacao')).toHaveText('2 atendimentos')
  })
})
