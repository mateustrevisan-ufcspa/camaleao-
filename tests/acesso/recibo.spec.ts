// US-16 · Recibo: quem abre segue a matriz. A página lê pela API, com as políticas de quem consulta.
import { test, expect, type Page } from '@playwright/test'
import type { SupabaseClient } from '@supabase/supabase-js'
import { USUARIA } from '../fumaca/apoio'
import { CAIXA, COORDENACAO, entrarNaApi } from './apoio'

const MARCA = 'TESTE US-16'

let coordenacao: SupabaseClient
let antigaId: string
let deHojeId: string

async function entrarPelaTela(page: Page, email: string) {
  await page.goto('/login')
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill(USUARIA.senha)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL(/\/(brecho|doacoes\/itens)$/)
}

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  ;({ api: coordenacao } = await entrarNaApi(COORDENACAO))
  const { api: caixa, id: caixaId } = await entrarNaApi(CAIXA)

  // Doação de três dias atrás: fora do "dia" que o balcão enxerga.
  const antes = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  const antiga = await coordenacao
    .from('donations_cash')
    .insert({ donor_name: MARCA, amount: 80, frequency: 'one_time', donated_at: antes, created_at: antes })
    .select('id')
    .single()
  if (antiga.error) throw new Error(antiga.error.message)
  antigaId = antiga.data.id

  const deHoje = await caixa
    .from('donations_cash')
    .insert({ donor_name: MARCA, amount: 40, frequency: 'one_time', donated_at: new Date().toISOString(), registered_by: caixaId })
    .select('id')
    .single()
  if (deHoje.error) throw new Error(deHoje.error.message)
  deHojeId = deHoje.data.id
})

test.afterAll(async () => {
  if (coordenacao) await coordenacao.from('donations_cash').delete().eq('donor_name', MARCA)
})

test('o caixa abre o recibo da doação de hoje, e não o de uma doação antiga', async ({ page }) => {
  await entrarPelaTela(page, CAIXA)

  await page.goto(`/recibo/dinheiro/${deHojeId}`)
  await expect(page.getByTestId('recibo')).toContainText('R$ 40,00')

  await page.goto(`/recibo/dinheiro/${antigaId}`)
  await expect(page.getByRole('heading', { name: 'Recibo não encontrado' })).toBeVisible()
})

test('a coordenação abre o recibo da doação antiga', async ({ page }) => {
  await entrarPelaTela(page, COORDENACAO)
  await page.goto(`/recibo/dinheiro/${antigaId}`)
  await expect(page.getByTestId('recibo')).toContainText('R$ 80,00')
})

test('tipo ou id inválidos mostram "Recibo não encontrado"', async ({ page }) => {
  await entrarPelaTela(page, COORDENACAO)
  await page.goto('/recibo/venda/qualquer')
  await expect(page.getByRole('heading', { name: 'Recibo não encontrado' })).toBeVisible()
  await page.goto('/recibo/dinheiro/nao-e-um-id')
  await expect(page.getByRole('heading', { name: 'Recibo não encontrado' })).toBeVisible()
})
