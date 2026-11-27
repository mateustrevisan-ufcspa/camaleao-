// US-04b · Correção e cancelamento de dinheiro, com motivo, e o cancelado some. O caixa cancela e corrige só pelas funções (US-37).
import { test, expect } from '@playwright/test'
import type { SupabaseClient } from '@supabase/supabase-js'
import { CAIXA, COORDENACAO, entrarNaApi, recusado } from './apoio'

let coordenacao: SupabaseClient
let caixa: SupabaseClient
let caixaId: string
let origemId: string

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  ;({ api: coordenacao } = await entrarNaApi(COORDENACAO))
  ;({ api: caixa, id: caixaId } = await entrarNaApi(CAIXA))
  const { data } = await caixa.from('cash_origins').select('id').eq('name', 'PIX').single()
  origemId = data!.id
})

async function doacaoDoCaixa(valor = 100) {
  const r = await caixa.from('donations_cash')
    .insert({ donor_name: 'TESTE US-04b', amount: valor, origin_id: origemId, frequency: 'one_time', donated_at: new Date().toISOString(), registered_by: caixaId })
    .select('id').single()
  return r.data!.id as string
}

test('o caixa não altera pela API; a coordenação corrige, com ou sem motivo, e o líquido é refeito', async () => {
  const id = await doacaoDoCaixa()
  expect(recusado(await caixa.from('donations_cash').update({ amount: 10, motivo_da_alteracao: 'tentativa do caixa' }).eq('id', id).select())).toBe(true)

  // Resposta 4: sem motivo, a correção entra.
  const semMotivo = await coordenacao.from('donations_cash').update({ amount: 120 }).eq('id', id).select('net_amount').single()
  expect(semMotivo.error).toBeNull()
  expect(Number(semMotivo.data!.net_amount)).toBe(120)
  // Com motivo, ele vai para a trilha.
  const ok = await coordenacao.from('donations_cash').update({ amount: 150, motivo_da_alteracao: 'valor digitado errado' }).eq('id', id).select('amount, net_amount').single()
  expect(ok.error).toBeNull()
  expect(Number(ok.data!.net_amount)).toBe(150)
  const { data: trilha } = await coordenacao.from('trilha_de_auditoria').select('motivo').eq('registro_id', id)
  expect(trilha).toContainEqual({ motivo: 'valor digitado errado' })

  // Taxa e líquido não são alterados à mão.
  expect((await coordenacao.from('donations_cash').update({ net_amount: 1 }).eq('id', id)).error).not.toBeNull()
})

test('a doação cancelada some para todos e fica na trilha com o motivo', async () => {
  const id = await doacaoDoCaixa()
  expect((await coordenacao.rpc('cancelar_doacao_em_dinheiro', { p_id: id, p_motivo: 'x' })).error).not.toBeNull()
  expect((await coordenacao.rpc('cancelar_doacao_em_dinheiro', { p_id: id, p_motivo: 'lançada em dobro' })).error).toBeNull()

  expect((await coordenacao.from('donations_cash_view').select('id').eq('id', id)).data).toEqual([])
  expect((await caixa.from('donations_cash_view').select('id').eq('id', id)).data).toEqual([])
  const { data: trilha } = await coordenacao.from('trilha_de_auditoria').select('acao, motivo').eq('registro_id', id)
  expect(trilha).toContainEqual({ acao: 'exclusao', motivo: 'lançada em dobro' })
})

test('a venda cancelada some', async () => {
  const { data: forma } = await caixa.from('payment_methods').select('id').eq('name', 'cash').single()
  const { data: vendaId } = await caixa.rpc('register_sale', {
    p_client_id: null, p_customer_name: 'TESTE US-04b', p_payment_method_id: forma!.id, p_bank_id: null,
    p_installments: null, p_net_amount: 20, p_registered_by: caixaId, p_sold_at: new Date().toISOString(),
    p_items: [{ category_name: 'blusa', amount: 20 }],
  })
  expect((await coordenacao.rpc('cancelar_venda', { p_id: vendaId, p_motivo: 'registrada no cliente errado' })).error).toBeNull()
  expect((await coordenacao.from('sales_view').select('id').eq('id', vendaId)).data).toEqual([])
  expect((await coordenacao.from('sale_items').select('id').eq('sale_id', vendaId)).data).toEqual([])
})
