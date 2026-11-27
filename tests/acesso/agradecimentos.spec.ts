// US-21a · Agradecimento: só com termo aprovado, um por período, só a coordenação.
import { test, expect } from '@playwright/test'
import type { SupabaseClient } from '@supabase/supabase-js'
import { CAIXA, COORDENACAO, entrarNaApi, recusado } from './apoio'
import { TERMO_MENSAGENS } from '../../lib/termo-mensagens'

// US-36: a versão do termo vem do código, e não escrita à mão.
const VERSAO = TERMO_MENSAGENS.versao

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
  await coordenacao.from('message_consents').insert({ client_id: comAutorizacao, authorized: true, term_version: VERSAO })
})

test('sem aprovação do termo, ninguém recebe agradecimento', async () => {
  const { data } = await coordenacao.from('aprovacoes_do_termo').select('versao').eq('versao', VERSAO)
  test.skip((data ?? []).length > 0, 'o termo já foi aprovado neste banco local; rode npm run db:reset')
  const r = await coordenacao.from('agradecimentos').insert({ client_id: comAutorizacao, periodo, canal: 'whatsapp', term_version: '' })
  expect(r.error?.code).toBe('42501')
})

test('o caixa não aprova o termo; a coordenação aprova, e quem e quando vêm do banco', async () => {
  expect((await caixa.from('aprovacoes_do_termo').insert({ versao: VERSAO, aprovado_em: '2026-11-01' })).error).not.toBeNull()
  const r = await coordenacao.from('aprovacoes_do_termo').upsert({ versao: VERSAO, aprovado_em: '2026-11-01' }, { ignoreDuplicates: true })
  expect(r.error).toBeNull()
})

test('com o termo aprovado, um agradecimento por período', async () => {
  const primeiro = await coordenacao.from('agradecimentos').insert({ client_id: comAutorizacao, periodo, canal: 'whatsapp', term_version: 'qualquer' }).select('term_version').single()
  expect(primeiro.error).toBeNull()
  expect(primeiro.data!.term_version).toBe(VERSAO)
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

test('autorização pela 2026-10 não vale, mesmo com a versão atual aprovada', async () => {
  const p = await coordenacao.from('clients').insert({ name: `TESTE US-36 ${Date.now()}` }).select('id').single()
  await coordenacao.from('message_consents').insert({ client_id: p.data!.id, authorized: true, term_version: '2026-10' })
  await coordenacao.from('aprovacoes_do_termo').upsert({ versao: VERSAO, aprovado_em: '2026-11-01' }, { ignoreDuplicates: true })
  expect((await coordenacao.from('destinatarios_do_agradecimento').select('client_id').eq('client_id', p.data!.id)).data).toEqual([])
  const r = await coordenacao.from('agradecimentos').insert({ client_id: p.data!.id, periodo: '2026-11', canal: 'whatsapp', term_version: '' })
  expect(r.error?.code).toBe('42501')
  // Registrar de novo pela versão atual: linha nova, e a pessoa passa a valer.
  await coordenacao.from('message_consents').insert({ client_id: p.data!.id, authorized: true, term_version: VERSAO })
  expect((await coordenacao.from('destinatarios_do_agradecimento').select('client_id').eq('client_id', p.data!.id)).data).toHaveLength(1)
  expect((await coordenacao.from('message_consents').select('term_version').eq('client_id', p.data!.id)).data).toHaveLength(2)
})
