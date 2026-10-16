import { expect, test } from '@playwright/test'
import { entrar } from './apoio'

test.describe('Fumaça: contato e autorização de mensagens', () => {
  test('cadastra telefone, e-mail e aniversário e registra a autorização na ficha', async ({ page }) => {
    const nome = `Pessoa Fumaça ${Date.now()}`
    await entrar(page)
    await page.goto('/clientes')

    await test.step('Cadastrar com telefone, e-mail e aniversário', async () => {
      await page.getByRole('button', { name: 'Novo cliente' }).click()
      await page.locator('input[name="name"]').fill(nome)
      await page.locator('input[name="phone"]').fill('(51) 99700-1122')
      await page.locator('input[name="birthday"]').fill('0911')
      await page.locator('input[name="email"]').fill('fumaca@exemplo.com')
      await page.getByRole('button', { name: 'Cadastrar', exact: true }).click()
    })

    await test.step('A ficha mostra os três dados', async () => {
      await expect(page.getByRole('heading', { name: nome })).toBeVisible()
      await expect(page.getByText('(51) 99700-1122')).toBeVisible()
      await expect(page.getByText('fumaca@exemplo.com')).toBeVisible()
      await expect(page.getByText('09/11')).toBeVisible()
    })

    const cartao = page.getByTestId('autorizacao-de-mensagens')

    await test.step('Sem autorização no cadastro, a pessoa não recebe mensagens', async () => {
      await expect(cartao.getByText('Ainda não foi perguntada')).toBeVisible()
    })

    await test.step('Registrar a autorização mostra o termo e grava data e versão', async () => {
      await cartao.getByRole('button', { name: 'Registrar autorização' }).click()
      await expect(cartao.getByText('Leia para a pessoa')).toBeVisible()
      await cartao.getByRole('button', { name: 'A pessoa autorizou' }).click()
      await expect(cartao.getByText(/Autorizou em \d{2}\/\d{2}\/\d{4} \(termo .+\)/)).toBeVisible()
    })

    await test.step('Retirar a autorização vale na hora', async () => {
      await cartao.getByRole('button', { name: 'Retirar autorização' }).click()
      await expect(cartao.getByText(/Retirou a autorização em/)).toBeVisible()
      await expect(cartao.getByRole('button', { name: 'Registrar autorização' })).toBeVisible()
    })
  })
})
