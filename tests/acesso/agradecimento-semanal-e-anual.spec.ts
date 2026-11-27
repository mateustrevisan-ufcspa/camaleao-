// US-41 · Semana só com item; mês só com compra ou dinheiro; ano com qualquer contribuição.
import { test, expect } from '@playwright/test'
import type { SupabaseClient } from '@supabase/supabase-js'
import { CAIXA, COORDENACAO, entrarNaApi } from './apoio'
import { TERMO_MENSAGENS } from '../../lib/termo-mensagens'
import { semanaDe } from '../../lib/periodos'

let coordenacao: SupabaseClient
let caixa: SupabaseClient
let soItem: string
let soDinheiro: string
const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
const semana = semanaDe(hoje)
const mes = hoje.slice(0, 7)
const ano = hoje.slice(0, 4)

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  ;({ api: coordenacao } = await entrarNaApi(COORDENACAO))
  ;({ api: caixa } = await entrarNaApi(CAIXA))
  await coordenacao.from('aprovacoes_do_termo').upsert({ versao: TERMO_MENSAGENS.versao, aprovado_em: '2026-11-01' }, { ignoreDuplicates: true })
  const a = await coordenacao.from('clients').insert({ name: `TESTE US-41 item ${Date.now()}`, phone: '(51) 99761-5520' }).select('id').single()
  const b = await coordenacao.from('clients').insert({ name: `TESTE US-41 dinheiro ${Date.now()}`, phone: '(51) 99822-5566' }).select('id').single()
  soItem = a.data!.id
  soDinheiro = b.data!.id
  for (const id of [soItem, soDinheiro]) {
    await coordenacao.from('message_consents').insert({ client_id: id, authorized: true, term_version: TERMO_MENSAGENS.versao })
  }
  const item = await coordenacao.from('donations_items').insert({ client_id: soItem, donor_name: 'TESTE US-41', category_name: 'roupa', quantity: 3, donated_at: new Date().toISOString() })
  if (item.error) throw new Error(`Não criou a doação de item: ${item.error.message}`)
  const { data: origem } = await coordenacao.from('cash_origins').select('id').eq('name', 'PIX').single()
  const dinheiro = await coordenacao.from('donations_cash').insert({ client_id: soDinheiro, donor_name: 'TESTE US-41', amount: 50, origin_id: origem!.id, frequency: 'one_time', donated_at: new Date().toISOString() })
  if (dinheiro.error) throw new Error(`Não criou a doação em dinheiro: ${dinheiro.error.message}`)
})

test('a semana aceita quem doou item; o mês recusa quem só doou item', async () => {
  expect((await caixa.rpc('registrar_agradecimento', { p_client_id: soItem, p_periodo: mes, p_canal: 'whatsapp' })).error?.code).toBe('22023')
  expect((await caixa.rpc('registrar_agradecimento', { p_client_id: soItem, p_periodo: semana, p_canal: 'whatsapp' })).error).toBeNull()
  // Uma vez por semana, e o ano é outro período.
  expect((await caixa.rpc('registrar_agradecimento', { p_client_id: soItem, p_periodo: semana, p_canal: 'whatsapp' })).error?.code).toBe('23505')
  expect((await caixa.rpc('registrar_agradecimento', { p_client_id: soItem, p_periodo: ano, p_canal: 'whatsapp' })).error).toBeNull()
})

test('a semana recusa quem só doou dinheiro; o mês e o ano aceitam', async () => {
  expect((await caixa.rpc('registrar_agradecimento', { p_client_id: soDinheiro, p_periodo: semana, p_canal: 'whatsapp' })).error?.code).toBe('22023')
  expect((await caixa.rpc('registrar_agradecimento', { p_client_id: soDinheiro, p_periodo: mes, p_canal: 'whatsapp' })).error).toBeNull()
  expect((await caixa.rpc('registrar_agradecimento', { p_client_id: soDinheiro, p_periodo: ano, p_canal: 'whatsapp' })).error).toBeNull()
})

test('a lista da semana traz a doação de item', async () => {
  const { data, error } = await caixa.rpc('pessoas_para_agradecer', { p_periodo: semana })
  expect(error).toBeNull()
  const linhas = data as Record<string, unknown>[]
  expect(linhas.find((r) => r.client_id === soItem)?.doacoes_de_item).toBe(1)
  // Quem doou dinheiro também vem da função; a página é que filtra a aba semanal por doacoes_de_item.
  expect(linhas.find((r) => r.client_id === soDinheiro)?.doacoes_de_item).toBe(0)
})

test('período fora do formato é recusado pela tabela e pela função', async () => {
  expect((await caixa.rpc('pessoas_para_agradecer', { p_periodo: '2026-S60' })).error).not.toBeNull()
  expect((await coordenacao.from('agradecimentos').insert({ client_id: soItem, periodo: '2026-W47', canal: 'email', term_version: '' })).error).not.toBeNull()
})
