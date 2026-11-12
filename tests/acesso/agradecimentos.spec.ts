// US-21a · Agradecimento: só com termo aprovado, um por período, só a coordenação.
import { test, expect } from '@playwright/test'
import type { SupabaseClient } from '@supabase/supabase-js'
import { CAIXA, COORDENACAO, entrarNaApi, recusado } from './apoio'

let coordenacao: SupabaseClient
let caixa: SupabaseClient
let comAutorizacao: string
let semAutorizacao: string
const periodo = '2026-11'

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  ;({ api: coordenacao } = await entrarNaApi(COORDENACAO))
  ;({ api: caixa } = await entrarNaApi(CAIXA))
  const a = await coordenacao.from('clients').insert({ name: `TESTE US-21a ${Date.now()}` }).select('id').single()
  const b = await coordenacao.from('clients').insert({ name: `TESTE US-21a sem ${Date.now()}` }).select('id').single()
  comAutorizacao = a.data!.id
  semAutorizacao = b.data!.id
  await coordenacao.from('message_consents').insert({ client_id: comAutorizacao, authorized: true, term_version: '2026-10' })
})

test('sem aprovação do termo, ninguém recebe agradecimento', async () => {
  const { data } = await coordenacao.from('aprovacoes_do_termo').select('versao').eq('versao', '2026-10')
  test.skip((data ?? []).length > 0, 'o termo já foi aprovado neste banco local; rode npm run db:reset')
  const r = await coordenacao.from('agradecimentos').insert({ client_id: comAutorizacao, periodo, canal: 'whatsapp', term_version: '' })
  expect(r.error?.code).toBe('42501')
})

test('o caixa não aprova o termo; a coordenação aprova, e quem e quando vêm do banco', async () => {
  expect((await caixa.from('aprovacoes_do_termo').insert({ versao: '2026-10', aprovado_em: '2026-11-01' })).error).not.toBeNull()
  const r = await coordenacao.from('aprovacoes_do_termo').upsert({ versao: '2026-10', aprovado_em: '2026-11-01' }, { ignoreDuplicates: true })
  expect(r.error).toBeNull()
})

test('com o termo aprovado, um agradecimento por período', async () => {
  const primeiro = await coordenacao.from('agradecimentos').insert({ client_id: comAutorizacao, periodo, canal: 'whatsapp', term_version: 'qualquer' }).select('term_version').single()
  expect(primeiro.error).toBeNull()
  expect(primeiro.data!.term_version).toBe('2026-10')
  const segundo = await coordenacao.from('agradecimentos').insert({ client_id: comAutorizacao, periodo, canal: 'email', term_version: '' })
  expect(segundo.error?.code).toBe('23505')
  // Quem não autorizou continua de fora.
  const sem = await coordenacao.from('agradecimentos').insert({ client_id: semAutorizacao, periodo, canal: 'whatsapp', term_version: '' })
  expect(sem.error?.code).toBe('42501')
})

test('o caixa não registra nem lê, e ninguém altera ou apaga', async () => {
  expect((await caixa.from('agradecimentos').insert({ client_id: comAutorizacao, periodo: '2026-10', canal: 'whatsapp', term_version: '' })).error).not.toBeNull()
  expect(recusado(await caixa.from('agradecimentos').select('id'))).toBe(true)
  expect(recusado(await caixa.from('destinatarios_do_agradecimento').select('client_id'))).toBe(true)
  const { data } = await coordenacao.from('agradecimentos').select('id').eq('client_id', comAutorizacao).single()
  expect(recusado(await coordenacao.from('agradecimentos').update({ canal: 'email' }).eq('id', data!.id).select())).toBe(true)
  expect(recusado(await coordenacao.from('agradecimentos').delete().eq('id', data!.id).select())).toBe(true)
})
