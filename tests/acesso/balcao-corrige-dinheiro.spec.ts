// US-37 · O caixa corrige e cancela dinheiro de qualquer data, só pelas funções.
import { test, expect } from '@playwright/test'
import type { SupabaseClient } from '@supabase/supabase-js'
import { CAIXA, COORDENACAO, VOLUNTARIA, entrarNaApi, recusado } from './apoio'

let coordenacao: SupabaseClient
let caixa: SupabaseClient
let voluntaria: SupabaseClient
let doacaoAntiga: string
let origemId: string
const DEZ_DIAS = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
const diaDe = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(d)

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  ;({ api: coordenacao } = await entrarNaApi(COORDENACAO))
  ;({ api: caixa } = await entrarNaApi(CAIXA))
  ;({ api: voluntaria } = await entrarNaApi(VOLUNTARIA))
  const { data: origem } = await coordenacao.from('cash_origins').select('id').eq('name', 'PIX').single()
  origemId = origem!.id
  const r = await coordenacao.from('donations_cash')
    .insert({ donor_name: 'TESTE US-37', amount: 70, origin_id: origemId, frequency: 'one_time', donated_at: DEZ_DIAS.toISOString(), created_at: DEZ_DIAS.toISOString() })
    .select('id').single()
  doacaoAntiga = r.data!.id
})

test('o caixa não lê a doação antiga pela API, mas a vê na lista do dia', async () => {
  expect(recusado(await caixa.from('donations_cash_view').select('id').eq('id', doacaoAntiga))).toBe(true)
  const { data, error } = await caixa.rpc('lancamentos_para_corrigir', { p_dia: diaDe(DEZ_DIAS) })
  expect(error).toBeNull()
  expect((data ?? []).map((l: { id: string }) => l.id)).toContain(doacaoAntiga)
  // Dia depois de hoje é recusado.
  expect((await caixa.rpc('lancamentos_para_corrigir', { p_dia: '2099-01-01' })).error).not.toBeNull()
})

test('a voluntária não usa as funções', async () => {
  expect((await voluntaria.rpc('lancamentos_para_corrigir', { p_dia: diaDe(DEZ_DIAS) })).error).not.toBeNull()
  expect((await voluntaria.rpc('doacao_para_corrigir', { p_id: doacaoAntiga })).error).not.toBeNull()
  expect((await voluntaria.rpc('cancelar_doacao_em_dinheiro', { p_id: doacaoAntiga, p_motivo: 'tentativa da voluntária' })).error).not.toBeNull()
})

test('o caixa corrige sem motivo; o líquido é refeito e a trilha registra', async () => {
  const { error } = await caixa.rpc('corrigir_doacao_em_dinheiro', {
    p_id: doacaoAntiga, p_amount: 75, p_donated_at: DEZ_DIAS.toISOString(), p_origin_id: origemId,
    p_frequency: 'one_time', p_notes: null, p_bank_id: null, p_forma: null, p_parcelado: false, p_bandeira: null, p_motivo: '',
  })
  expect(error).toBeNull()
  const { data } = await coordenacao.from('donations_cash_view').select('amount, net_amount').eq('id', doacaoAntiga).single()
  expect(Number(data!.amount)).toBe(75)
  expect(Number(data!.net_amount)).toBe(75)
  const { data: trilha } = await coordenacao.from('trilha_de_auditoria').select('acao').eq('registro_id', doacaoAntiga)
  expect(trilha).toContainEqual({ acao: 'alteracao' })
})

test('o caixa cancela com motivo; sem motivo é recusado', async () => {
  expect((await caixa.rpc('cancelar_doacao_em_dinheiro', { p_id: doacaoAntiga, p_motivo: '' })).error).not.toBeNull()
  expect((await caixa.rpc('cancelar_doacao_em_dinheiro', { p_id: doacaoAntiga, p_motivo: 'lançada no dia errado' })).error).toBeNull()
  expect((await coordenacao.from('donations_cash_view').select('id').eq('id', doacaoAntiga)).data).toEqual([])
  const { data: trilha } = await coordenacao.from('trilha_de_auditoria').select('acao, motivo').eq('registro_id', doacaoAntiga)
  expect(trilha).toContainEqual({ acao: 'exclusao', motivo: 'lançada no dia errado' })
})
