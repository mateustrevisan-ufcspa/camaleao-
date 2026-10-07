import { expect, test, type Page } from '@playwright/test'

// Usuária criada por supabase/seed.sql (só existe no Supabase local).
export const USUARIA = {
  email: process.env.FUMACA_EMAIL ?? 'voluntaria@camaleao.local',
  senha: process.env.FUMACA_SENHA ?? 'camaleao-local',
}

export async function entrar(page: Page) {
  await test.step('Login: abrir a tela de login', async () => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Bem-vindo de volta' }), 'a tela de login não carregou').toBeVisible()
  })

  await test.step('Login: preencher e-mail e senha e enviar', async () => {
    await page.locator('input[name="email"]').fill(USUARIA.email)
    await page.locator('input[name="password"]').fill(USUARIA.senha)
    await page.getByRole('button', { name: 'Entrar' }).click()
  })

  await test.step('Login: chegar ao painel do brechó', async () => {
    // Espera o que vier primeiro: o painel ou a mensagem de recusa.
    const recusa = page.getByText('E-mail ou senha incorretos.')
    await Promise.race([page.waitForURL(/\/brecho$/), recusa.waitFor()]).catch(() => {})
    await expect(recusa, 'o login foi recusado (o seed da usuária local rodou? use npm run db:reset)').toHaveCount(0)
    await expect(page, 'depois do login a aplicação deveria abrir /brecho').toHaveURL(/\/brecho$/)
  })
}

// Valor com centavos aleatórios para achar o registro recém-criado na lista.
export function valorUnico(base: number) {
  const centavos = Math.floor(Math.random() * 99) + 1
  const numero = base + centavos / 100
  return {
    numero,
    digitado: numero.toFixed(2).replace('.', ','),
    exibido: `R$ ${numero.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
  }
}
