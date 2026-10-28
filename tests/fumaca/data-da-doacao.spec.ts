import { expect, test } from '@playwright/test'
import { doacaoSemFicha, entrar } from './apoio'

// BUG-01 · Às 21h30 de Brasília já é o dia seguinte em UTC. Os dois formulários de
// doação precisam abrir com a data de Brasília.
// O dia é o de hoje (em Brasília), e não uma data fixa: o servidor monta a página
// com o relógio de verdade, e page.clock só muda o navegador.
const HOJE_NA_NOITE = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
const NOITE = new Date(`${HOJE_NA_NOITE}T21:30:00-03:00`)

test.describe('Fumaça: data da doação à noite', () => {
  for (const lista of ['/doacoes/itens', '/doacoes/dinheiro']) {
    test(`${lista}/nova às 21h30 abre com a data de hoje e não aceita amanhã`, async ({ page }) => {
      await entrar(page)
      await page.clock.setFixedTime(NOITE)
      await page.goto(lista)
      // Pelo link, e não pelo endereço: o formulário é montado no navegador, com o relógio às 21h30.
      await page.getByRole('link', { name: 'Nova doação' }).click()
      await expect(page).toHaveURL(new RegExp(`${lista}/nova$`))

      const data = page.getByLabel('Data')
      await expect(data).toHaveValue(HOJE_NA_NOITE)
      await expect(data).toHaveAttribute('max', HOJE_NA_NOITE)
    })
  }

  test('o servidor recusa doação com data depois de hoje', async ({ page }) => {
    await entrar(page)
    await page.goto('/doacoes/dinheiro/nova')

    const formulario = page.locator('form').filter({ has: page.getByRole('button', { name: 'Registrar doação' }) })
    // Sem a validação do navegador (o campo tem max), para a data chegar ao servidor.
    await formulario.evaluate((f) => { (f as HTMLFormElement).noValidate = true })

    await doacaoSemFicha(page, `Doação no futuro ${Date.now()}`)
    await page.locator('input[name="amount"]').fill('10.00')
    await page.getByLabel('Data').fill('2099-01-01')
    await page.getByRole('button', { name: 'Registrar doação' }).click()

    await expect(page.getByText('A data da doação não pode ser depois de hoje.')).toBeVisible()
    await expect(page).toHaveURL(/\/doacoes\/dinheiro\/nova$/)
  })
})