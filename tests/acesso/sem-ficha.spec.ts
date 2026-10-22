// US-14 · Doação sem ficha: só a coordenação liga uma doação a uma pessoa.
import { test, expect } from '@playwright/test'
import type { SupabaseClient } from '@supabase/supabase-js'
import { CAIXA, COORDENACAO, entrarNaApi } from './apoio'

const MARCA = 'TESTE US-14'

let coordenacao: SupabaseClient
let caixa: SupabaseClient
let doacaoId: string
let pessoaId: string

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  ;({ api: coordenacao } = await entrarNaApi(COORDENACAO))
  let caixaId: string
  ;({ api: caixa, id: caixaId } = await entrarNaApi(CAIXA))

  const pessoa = await coordenacao.from('clients').insert({ name: MARCA, member_since: 2026 }).select('id').single()
  if (pessoa.error) throw new Error(`Não cadastrou a pessoa do teste: ${pessoa.error.message}`)
  pessoaId = pessoa.data.id

  const doacao = await caixa
    .from('donations_cash')
    .insert({ donor_name: MARCA, amount: 12, frequency: 'one_time', donated_at: new Date().toISOString(), registered_by: caixaId })
    .select('id')
    .single()
  if (doacao.error) throw new Error(`Não registrou a doação do teste: ${doacao.error.message}`)
  doacaoId = doacao.data.id
})

test.afterAll(async () => {
  if (!coordenacao) return
  await coordenacao.from('donations_cash').delete().eq('donor_name', MARCA)
  await coordenacao.from('clients').delete().eq('name', MARCA)
})

test('a caixa não liga a doação a uma ficha', async () => {
  const r = await caixa.from('donations_cash').update({ client_id: pessoaId }).eq('id', doacaoId).select('id')
  expect(r.data ?? []).toHaveLength(0)
  const depois = await coordenacao.from('donations_cash').select('client_id').eq('id', doacaoId).single()
  expect(depois.data?.client_id).toBeNull()
})

test('a coordenação liga a doação, e ela passa a contar na ficha', async () => {
  const r = await coordenacao.from('donations_cash').update({ client_id: pessoaId }).eq('id', doacaoId).is('client_id', null).select('id')
  expect(r.data).toHaveLength(1)
  const ficha = await coordenacao.from('clients_view').select('donation_count, donation_total').eq('id', pessoaId).single()
  expect(ficha.data).toMatchObject({ donation_count: 1 })
  expect(Number(ficha.data!.donation_total)).toBe(12)
})
