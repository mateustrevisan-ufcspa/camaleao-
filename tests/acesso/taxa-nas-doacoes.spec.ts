// US-35 · Taxa da maquininha nas doações em dinheiro, conferida pela API.
// Este arquivo roda antes do taxas.spec.ts (US-32), em ordem alfabética: o débito
// da Sicredi ainda está no 1,05% do seed (e o afterAll de lá também volta a 1,05).
import { test, expect } from '@playwright/test'
import type { SupabaseClient } from '@supabase/supabase-js'
import { CAIXA, COORDENACAO, entrarNaApi } from './apoio'

let coordenacao: SupabaseClient
let caixa: SupabaseClient
let caixaId: string
const bancos = new Map<string, string>()
const criadas: string[] = []

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  ;({ api: coordenacao } = await entrarNaApi(COORDENACAO))
  ;({ api: caixa, id: caixaId } = await entrarNaApi(CAIXA))
  const { data } = await coordenacao.from('banks').select('id, name')
  for (const b of data ?? []) bancos.set(b.name, b.id)
})

test.afterAll(async () => {
  if (coordenacao && criadas.length > 0) await coordenacao.from('donations_cash').delete().in('id', criadas)
})

async function registrar(campos: Record<string, unknown>) {
  const { data: origem } = await caixa.from('cash_origins').select('id').eq('name', 'PIX').single()
  const r = await caixa
    .from('donations_cash')
    .insert({
      donor_name: 'TESTE US-35',
      amount: 100,
      origin_id: origem!.id,
      frequency: 'one_time',
      donated_at: new Date().toISOString(),
      registered_by: caixaId,
      ...campos,
    })
    .select('id, taxa, net_amount')
    .single()
  if (r.data) criadas.push(r.data.id)
  return r
}

test('sem maquininha, o líquido é o valor, mesmo que o navegador mande outro', async () => {
  const r = await registrar({ net_amount: 1, taxa: 50 })
  expect(r.error).toBeNull()
  expect(r.data!.taxa).toBeNull()
  expect(Number(r.data!.net_amount)).toBe(100)
})

test('no crédito à vista da PagBank, o banco de dados aplica 3,19%', async () => {
  const r = await registrar({ bank_id: bancos.get('PagBank'), forma: 'credit', parcelado: false, net_amount: 100 })
  expect(r.error).toBeNull()
  expect(Number(r.data!.taxa)).toBe(3.19)
  expect(Number(r.data!.net_amount)).toBe(96.81)
})

test('sem taxa cadastrada (Doação Solutions), o líquido fica vazio', async () => {
  const r = await registrar({ bank_id: bancos.get('Doação Solutions'), forma: 'credit' })
  expect(r.error).toBeNull()
  expect(r.data!.taxa).toBeNull()
  expect(r.data!.net_amount).toBeNull()
})

test('combinação inválida é recusada', async () => {
  expect((await registrar({ bank_id: bancos.get('PagBank') })).error).not.toBeNull() // maquininha sem forma
  expect((await registrar({ bank_id: bancos.get('PagBank'), forma: 'debit', parcelado: true })).error).not.toBeNull()
  expect((await registrar({ bank_id: bancos.get('SICREDI'), forma: 'credit', bandeira: 'outras' })).error).not.toBeNull()
})

test('corrigir o valor refaz o líquido com a taxa gravada', async () => {
  const r = await registrar({ bank_id: bancos.get('SICREDI'), forma: 'debit' })
  expect(r.error).toBeNull()
  const corrigida = await coordenacao.from('donations_cash').update({ amount: 200 }).eq('id', r.data!.id).select('taxa, net_amount').single()
  expect(corrigida.error).toBeNull()
  expect(Number(corrigida.data!.taxa)).toBe(1.05)
  expect(Number(corrigida.data!.net_amount)).toBe(197.9)
})

test('a taxa gravada não muda por fora, e o líquido acompanha', async () => {
  const r = await registrar({ bank_id: bancos.get('SICREDI'), forma: 'debit' })
  expect(r.error).toBeNull()
  const mexida = await coordenacao.from('donations_cash').update({ taxa: 0, net_amount: 100 }).eq('id', r.data!.id).select('taxa, net_amount').single()
  expect(mexida.error).toBeNull()
  expect(Number(mexida.data!.taxa)).toBe(1.05)
  expect(Number(mexida.data!.net_amount)).toBe(98.95)
})

test('pela maquininha só no cartão de banco que também é de venda (pergunta 8)', async () => {
  const casos: [Record<string, unknown>, boolean][] = [
    [{ bank_id: bancos.get('PagBank'), forma: 'credit' }, true],
    [{ bank_id: bancos.get('SICREDI'), forma: 'debit' }, true],
    [{ bank_id: bancos.get('PIX PagBank'), forma: 'pix' }, false],
    [{ bank_id: bancos.get('Doação Solutions'), forma: 'credit' }, false],
    [{}, false],
  ]
  for (const [campos, esperado] of casos) {
    const r = await registrar(campos)
    expect(r.error).toBeNull()
    const v = await coordenacao.from('donations_cash_view').select('pela_maquininha').eq('id', r.data!.id).single()
    expect(v.data!.pela_maquininha).toBe(esperado)
  }
})

test('a venda não oferece banco que é só de doação', async () => {
  const { data } = await caixa.from('banks').select('name').in('uso', ['vendas', 'ambos']).eq('active', true)
  expect((data ?? []).map((b) => b.name)).not.toContain('Doação Solutions')
})
