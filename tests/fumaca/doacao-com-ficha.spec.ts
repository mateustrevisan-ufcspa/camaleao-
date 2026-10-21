import { expect, test } from '@playwright/test'
import { doacaoSemFicha, entrar, valorUnico } from './apoio'

// US-14 · Toda doação vinculada a uma ficha.
test.describe('Fumaça: doação ligada a uma ficha', () => {
  test('sem pessoa, a doação só vai depois de marcar doação sem ficha', async ({ page }) => {
    const valor = valorUnico(23)
    await entrar(page)
    await page.goto('/doacoes/dinheiro/nova')
    await page.locator('input[name="amount"]').fill(valor.numero.toFixed(2))

    await test.step('sem pessoa e sem marcar, o servidor recusa', async () => {
      await page.getByRole('button', { name: 'Registrar doação' }).click()
      await expect(page.getByText('Escolha a pessoa ou marque doação sem ficha.')).toBeVisible()
      await expect(page).toHaveURL(/\/doacoes\/dinheiro\/nova$/)
    })

    await test.step('marcando doação sem ficha, registra', async () => {
      await doacaoSemFicha(page, `TESTE US-14 anônima ${Date.now()}`)
      await page.getByRole('button', { name: 'Registrar doação' }).click()
      await expect(page).toHaveURL(/\/doacoes\/dinheiro$/)
    })
  })

  test('doação sem ficha é ligada depois e sai da lista', async ({ page }) => {
    const doador = `TESTE US-14 ligar ${Date.now()}`
    const valor = valorUnico(31)
    await entrar(page)

    await test.step('registrar uma doação sem ficha', async () => {
      await page.goto('/doacoes/dinheiro/nova')
      await doacaoSemFicha(page, doador)
      await page.locator('input[name="amount"]').fill(valor.numero.toFixed(2))
      await page.getByRole('button', { name: 'Registrar doação' }).click()
      await expect(page).toHaveURL(/\/doacoes\/dinheiro$/)
    })

    await test.step('ligar à ficha da Daniela Krause', async () => {
      await page.goto('/doacoes/sem-ficha')
      const linha = page.getByTestId('doacoes-sem-ficha').getByRole('listitem').filter({ hasText: doador })
      await linha.getByRole('button', { name: 'Ligar a uma ficha' }).click()
      await linha.getByLabel('Buscar pessoa').fill('daniela')
      await linha.getByTestId('resultado-da-busca').getByText('Daniela Krause').click()
      await linha.getByRole('button', { name: 'Ligar a Daniela Krause' }).click()
      await expect(page.getByText(`Doação de ${doador} ligada à ficha de Daniela Krause.`)).toBeVisible()
      await expect(page.getByTestId('doacoes-sem-ficha').getByText(doador)).toHaveCount(0)
    })
  })

  test('o histórico da ficha mostra os tipos de doação', async ({ page }) => {
    await entrar(page)
    await page.goto('/clientes')
    await page.getByPlaceholder('Buscar cliente...').fill('Patrícia')
    await page.getByText('Patrícia Nunes').first().click()
    // Patrícia tem compras e tampinhas (doação de item desde a US-11) no seed.
    const historico = page.getByTestId('historico-da-pessoa')
    await expect(historico.getByText('Compra', { exact: true }).first()).toBeVisible()
    await expect(historico.getByText('Doação · itens', { exact: true }).first()).toBeVisible()
  })
})
