// US-30 · Somas de vendas: só a coordenação abre.
import { test, expect } from '@playwright/test'
import { CAIXA } from './apoio'

const SENHA = process.env.FUMACA_SENHA ?? 'camaleao-local'

test('o caixa não abre as somas de vendas', async ({ page }) => {
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: 'Bem-vindo de volta' })).toBeVisible()
  await page.locator('input[name="email"]').fill(CAIXA)
  await page.locator('input[name="password"]').fill(SENHA)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL(/\/brecho$/)

  await page.goto('/relatorios/vendas')
  await expect(page).toHaveURL(/\/brecho\?aviso=restrito/)
})
