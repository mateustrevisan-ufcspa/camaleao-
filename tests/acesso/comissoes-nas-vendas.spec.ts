// US-38 · Comissão nas vendas: só a coordenação, mesmo percentual, sobre o líquido.
import { test, expect } from '@playwright/test'
import type { SupabaseClient } from '@supabase/supabase-js'
import { CAIXA, COORDENACAO, entrarNaApi, recusado } from './apoio'

let coordenacao: SupabaseClient
let caixa: SupabaseClient
let caixaId: string
let vendaId: string
let captadorId: string

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  ;({ api: coordenacao } = await entrarNaApi(COORDENACAO))
  ;({ api: caixa, id: caixaId } = await entrarNaApi(CAIXA))
  const { data: forma } = await caixa.from('payment_methods').select('id').eq('name', 'cash').single()
  const { data } = await caixa.rpc('register_sale', {
    p_client_id: null, p_customer_name: 'TESTE US-38', p_payment_method_id: forma!.id, p_bank_id: null,
    p_installments: null, p_net_amount: 80, p_registered_by: caixaId, p_sold_at: new Date().toISOString(),
    p_items: [{ category_name: 'blusa', amount: 80 }],
  })
  vendaId = data as string
  const c = await coordenacao.from('captadores').insert({ nome: `Captação US-38 ${Date.now()}` }).select('id').single()
  captadorId = c.data!.id
})

test('a comissão da venda usa o percentual em vigor sobre o líquido', async () => {
  const { data: p } = await coordenacao.from('percentual_de_comissao').select('percentual').order('definido_em', { ascending: false }).limit(1).single()
  const r = await coordenacao.from('comissoes_de_venda').insert({ sale_id: vendaId, teve_comissao: true, captador_id: captadorId, percentual: 99 }).select('percentual').single()
  expect(r.error).toBeNull()
  expect(Number(r.data!.percentual)).toBe(Number(p!.percentual))
  const { data: v } = await coordenacao.from('comissoes_de_venda_view').select('valor').eq('sale_id', vendaId).single()
  expect(Number(v!.valor)).toBe(Math.round(80 * Number(p!.percentual)) / 100)
  expect((await coordenacao.from('comissoes_de_venda').insert({ sale_id: vendaId, teve_comissao: false })).error).not.toBeNull()
})

test('o caixa não marca nem lê; a venda cancelada some da view', async () => {
  expect((await caixa.from('comissoes_de_venda').insert({ sale_id: vendaId, teve_comissao: false })).error).not.toBeNull()
  expect(recusado(await caixa.from('comissoes_de_venda_view').select('id'))).toBe(true)
  expect((await coordenacao.rpc('cancelar_venda', { p_id: vendaId, p_motivo: 'teste da US-38' })).error).toBeNull()
  expect((await coordenacao.from('comissoes_de_venda_view').select('id').eq('sale_id', vendaId)).data).toEqual([])
})
