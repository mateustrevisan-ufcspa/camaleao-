// US-24a · Cadastrar, primeiro acesso com troca de senha e desativar.
import { test, expect } from '@playwright/test'
import { entrar } from './apoio'

test.describe.configure({ mode: 'serial' })

const sufixo = Date.now()
const nome = `TESTE US-24a ${sufixo}`
const email = `teste-${sufixo}@camaleao.local`
let senhaProvisoria = ''

test('a coordenação cadastra uma voluntária e vê a senha provisória uma vez', async ({ page }) => {
  await entrar(page)
  await page.goto('/equipe')
  await page.locator('input[name="name"]').fill(nome)
  await page.locator('input[name="email"]').fill(email)
  await page.locator('select[name="role"]').selectOption('volunteer')
  await page.getByRole('button', { name: 'Cadastrar' }).click()
  const aviso = page.getByTestId('senha-provisoria')
  await expect(aviso).toContainText(nome)
  senhaProvisoria = (await aviso.locator('code').textContent()) ?? ''
  expect(senhaProvisoria).toHaveLength(12)
  await expect(page.getByTestId('usuario').filter({ hasText: nome })).toContainText('senha provisória')
})

test('no primeiro acesso ela troca a senha e chega às doações de item', async ({ page }) => {
  await page.goto('/login')
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill(senhaProvisoria)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL(/\/trocar-senha$/)
  await page.goto('/doacoes/itens')
  await expect(page, 'com senha provisória, nenhuma tela abre').toHaveURL(/\/trocar-senha$/)
  await page.locator('input[name="nova"]').fill('senha-nova-123')
  await page.locator('input[name="repetida"]').fill('senha-nova-123')
  await page.getByRole('button', { name: 'Salvar e entrar' }).click()
  await page.waitForURL(/\/doacoes\/itens/)
})

test('desativada, ela não entra mais', async ({ page }) => {
  await entrar(page)
  await page.goto('/equipe')
  await page.getByTestId('usuario').filter({ hasText: nome }).getByRole('button', { name: 'Desativar' }).click()
  await expect(page.getByTestId('usuario').filter({ hasText: nome })).toContainText('desativada')

  await page.context().clearCookies()
  await page.goto('/login')
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill('senha-nova-123')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByText('Seu acesso está desativado.')).toBeVisible()
})

test('a coordenação não vê o botão de desativar a própria conta', async ({ page }) => {
  await entrar(page)
  await page.goto('/equipe')
  const eu = page.getByTestId('usuario').filter({ hasText: 'voluntaria@camaleao.local' })
  await expect(eu.getByRole('button', { name: 'Desativar' })).toHaveCount(0)
})