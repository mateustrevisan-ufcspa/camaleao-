// US-28 · Perfil de voluntária sem dinheiro e sem caixa.
// Regras: docs/seguranca/matriz-de-permissoes.md.
import { test, expect } from '@playwright/test'
import type { SupabaseClient } from '@supabase/supabase-js'
import { CAIXA, COORDENACAO, VOLUNTARIA, entrarNaApi, entrarPelaTela, recusado } from './apoio'

const MARCA = 'TESTE US-28'

let coordenacao: SupabaseClient
let caixa: SupabaseClient
let caixaId: string
let voluntaria: SupabaseClient
let voluntariaId: string
let vendaDeHojeId: string
let doacaoDeHojeId: string

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  ;({ api: coordenacao } = await entrarNaApi(COORDENACAO))
  ;({ api: caixa, id: caixaId } = await entrarNaApi(CAIXA))
  ;({ api: voluntaria, id: voluntariaId } = await entrarNaApi(VOLUNTARIA))

  // Uma venda e uma doação em dinheiro lançadas hoje pelo caixa.
  const agora = new Date().toISOString()
  const venda = await caixa.from('sales').insert({ customer_name: MARCA, registered_by: caixaId, sold_at: agora }).select('id').single()
  if (venda.error) throw new Error(`O caixa não registrou a venda: ${venda.error.message}`)
  vendaDeHojeId = venda.data.id

  const doacao = await caixa
    .from('donations_cash')
    .insert({ donor_name: MARCA, amount: 20, frequency: 'one_time', donated_at: agora, registered_by: caixaId })
    .select('id')
    .single()
  if (doacao.error) throw new Error(`O caixa não registrou a doação: ${doacao.error.message}`)
  doacaoDeHojeId = doacao.data.id
})

test.afterAll(async () => {
  if (!coordenacao) return
  await coordenacao.from('sales').delete().eq('customer_name', MARCA)
  await coordenacao.from('donations_cash').delete().eq('donor_name', MARCA)
  await coordenacao.from('donations_items').delete().eq('donor_name', MARCA)
})

test.describe('voluntária no banco', () => {
  test('não lê vendas nem doações em dinheiro, nem as de hoje', async () => {
    // Controle: o caixa enxerga as duas. Sem isso, o teste não provaria nada.
    expect((await caixa.from('sales').select('id').eq('id', vendaDeHojeId)).data).toHaveLength(1)
    expect((await caixa.from('donations_cash').select('id').eq('id', doacaoDeHojeId)).data).toHaveLength(1)

    expect(recusado(await voluntaria.from('sales').select('id').eq('id', vendaDeHojeId))).toBe(true)
    expect(recusado(await voluntaria.from('sales_view').select('id').eq('id', vendaDeHojeId))).toBe(true)
    expect(recusado(await voluntaria.from('sale_items').select('sale_id').eq('sale_id', vendaDeHojeId))).toBe(true)
    expect(recusado(await voluntaria.from('donations_cash').select('id').eq('id', doacaoDeHojeId))).toBe(true)
    expect(recusado(await voluntaria.from('donations_cash_view').select('id').eq('id', doacaoDeHojeId))).toBe(true)
  })

  test('não registra venda, item de venda nem doação em dinheiro', async () => {
    const agora = new Date().toISOString()
    expect((await voluntaria.from('sales').insert({ customer_name: MARCA, registered_by: voluntariaId, sold_at: agora })).error).not.toBeNull()
    expect(
      (await voluntaria.from('sale_items').insert({ sale_id: vendaDeHojeId, category_name: MARCA, amount: 1 })).error,
    ).not.toBeNull()
    expect(
      (await voluntaria.from('donations_cash').insert({ donor_name: MARCA, amount: 5, frequency: 'one_time', donated_at: agora, registered_by: voluntariaId })).error,
    ).not.toBeNull()
    expect(
      (await voluntaria.rpc('register_sale', {
        p_client_id: null, p_customer_name: MARCA, p_payment_method_id: null, p_bank_id: null,
        p_installments: null, p_net_amount: 1, p_registered_by: voluntariaId, p_sold_at: agora,
        p_items: [{ category_id: null, category_name: MARCA, amount: 1 }],
      })).error,
    ).not.toBeNull()
  })

  test('continua registrando doação de item e lendo fichas', async () => {
    const item = await voluntaria
      .from('donations_items')
      .insert({ donor_name: MARCA, category_name: 'roupa', quantity: 1, donated_at: new Date().toISOString(), registered_by: voluntariaId })
      .select('id')
      .single()
    expect(item.error).toBeNull()
    expect((await voluntaria.from('donations_items').select('id').eq('id', item.data!.id)).data).toHaveLength(1)

    const fichas = await voluntaria.from('clients_view').select('id').limit(1)
    expect(fichas.error).toBeNull()
    expect(fichas.data!.length).toBeGreaterThan(0)
  })

  test('o caixa continua registrando venda e doação em dinheiro', async () => {
    const agora = new Date().toISOString()
    expect((await caixa.from('sales').insert({ customer_name: MARCA, registered_by: caixaId, sold_at: agora })).error).toBeNull()
    expect(
      (await caixa.from('donations_cash').insert({ donor_name: MARCA, amount: 7, frequency: 'one_time', donated_at: agora, registered_by: caixaId })).error,
    ).toBeNull()
  })
})

test.describe('voluntária na tela', () => {
  test('entra direto em Doações · Itens, sem Brechó nem Dinheiro no menu', async ({ page }) => {
    await entrarPelaTela(page, VOLUNTARIA)
    await page.waitForURL(/\/doacoes\/itens$/)

    const menu = page.getByRole('navigation')
    await expect(menu.getByRole('link', { name: 'Itens' })).toBeVisible()
    await expect(menu.getByRole('link', { name: 'Clientes' })).toBeVisible()
    await expect(menu.getByRole('link', { name: 'Brechó' })).toHaveCount(0)
    await expect(menu.getByRole('link', { name: 'Dinheiro' })).toHaveCount(0)
  })

  test('pelo endereço direto, brechó e doações em dinheiro levam a Doações · Itens', async ({ page }) => {
    await entrarPelaTela(page, VOLUNTARIA)
    await page.waitForURL(/\/doacoes\/itens$/)

    for (const endereco of ['/brecho', '/brecho/nova-venda', '/doacoes/dinheiro', '/doacoes/dinheiro/nova']) {
      await page.goto(endereco)
      await expect(page, `${endereco} deveria levar a Doações · Itens`).toHaveURL(/\/doacoes\/itens$/)
    }
  })

  test('tela da coordenação leva a Doações · Itens com o aviso', async ({ page }) => {
    await entrarPelaTela(page, VOLUNTARIA)
    await page.waitForURL(/\/doacoes\/itens$/)
    await page.goto('/brecho/financeiro')
    await expect(page).toHaveURL(/\/doacoes\/itens\?aviso=restrito$/)
    await expect(page.getByText('Essa área é restrita à coordenação do Instituto.')).toBeVisible()
  })

  test('o caixa continua entrando no brechó', async ({ page }) => {
    await entrarPelaTela(page, CAIXA)
    await page.waitForURL(/\/brecho$/)
    await expect(page.getByRole('navigation').getByRole('link', { name: 'Brechó' })).toBeVisible()
  })
})
