// US-39 · O caixa agradece pelas funções: lista sem contato, contato só no registro.
import { test, expect } from '@playwright/test'
import type { SupabaseClient } from '@supabase/supabase-js'
import { CAIXA, COORDENACAO, VOLUNTARIA, entrarNaApi, recusado } from './apoio'
import { TERMO_MENSAGENS } from '../../lib/termo-mensagens'

let coordenacao: SupabaseClient
let caixa: SupabaseClient
let voluntaria: SupabaseClient
let pessoa: string
let semDoacao: string
const mes = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit' }).format(new Date())

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  ;({ api: coordenacao } = await entrarNaApi(COORDENACAO))
  ;({ api: caixa } = await entrarNaApi(CAIXA))
  ;({ api: voluntaria } = await entrarNaApi(VOLUNTARIA))
  await coordenacao.from('aprovacoes_do_termo').upsert({ versao: TERMO_MENSAGENS.versao, aprovado_em: '2026-11-01' }, { ignoreDuplicates: true })
  const a = await coordenacao.from('clients').insert({ name: `TESTE US-39 ${Date.now()}`, phone: '(51) 99800-1234', email: 'us39@exemplo.com' }).select('id').single()
  const b = await coordenacao.from('clients').insert({ name: `TESTE US-39 sem ${Date.now()}`, phone: '(51) 99800-5678' }).select('id').single()
  pessoa = a.data!.id
  semDoacao = b.data!.id
  for (const id of [pessoa, semDoacao]) {
    await coordenacao.from('message_consents').insert({ client_id: id, authorized: true, term_version: TERMO_MENSAGENS.versao })
  }
  const { data: origem } = await coordenacao.from('cash_origins').select('id').eq('name', 'PIX').single()
  await coordenacao.from('donations_cash').insert({ client_id: pessoa, donor_name: 'TESTE US-39', amount: 100, origin_id: origem!.id, frequency: 'one_time', donated_at: new Date().toISOString() })
})

test('o caixa vê a lista do mês sem contato; a voluntária não', async () => {
  const { data, error } = await caixa.rpc('pessoas_para_agradecer', { p_periodo: mes })
  expect(error).toBeNull()
  const linha = (data as Record<string, unknown>[]).find((r) => r.client_id === pessoa)!
  expect(linha.pode_receber).toBe(true)
  expect(linha.tem_whatsapp).toBe(true)
  expect(Object.keys(linha)).not.toContain('phone')
  expect(Object.keys(linha)).not.toContain('email')
  expect((await voluntaria.rpc('pessoas_para_agradecer', { p_periodo: mes })).error).not.toBeNull()
  expect((await caixa.rpc('termo_aprovado', { p_versao: TERMO_MENSAGENS.versao })).data).toBe(true)
})

test('o caixa registra e recebe só o contato do canal, uma vez por período', async () => {
  const r = await caixa.rpc('registrar_agradecimento', { p_client_id: pessoa, p_periodo: mes, p_canal: 'whatsapp' })
  expect(r.error).toBeNull()
  expect(r.data).toBe('(51) 99800-1234')
  const outra = await caixa.rpc('registrar_agradecimento', { p_client_id: pessoa, p_periodo: mes, p_canal: 'email' })
  expect(outra.error?.code).toBe('23505')
  // Quem não contribuiu no período não sai, nem com autorização.
  expect((await caixa.rpc('registrar_agradecimento', { p_client_id: semDoacao, p_periodo: mes, p_canal: 'whatsapp' })).error?.code).toBe('22023')
  expect((await voluntaria.rpc('registrar_agradecimento', { p_client_id: pessoa, p_periodo: '2026', p_canal: 'whatsapp' })).error).not.toBeNull()
})

test('o caixa continua sem ler as tabelas', async () => {
  expect(recusado(await caixa.from('agradecimentos').select('id'))).toBe(true)
  expect(recusado(await caixa.from('aprovacoes_do_termo').select('versao'))).toBe(true)
  expect(recusado(await caixa.from('destinatarios_do_agradecimento').select('client_id'))).toBe(true)
})
