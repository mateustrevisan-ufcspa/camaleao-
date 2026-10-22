// US-12 · Doação vinculada a um evento, conferida pela API.
import { test, expect } from '@playwright/test'
import type { SupabaseClient } from '@supabase/supabase-js'
import { CAIXA, COORDENACAO, entrarNaApi } from './apoio'

const MARCA = 'TESTE US-12'

let coordenacao: SupabaseClient
let caixa: SupabaseClient
let caixaId: string
let eventoId: string

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  ;({ api: coordenacao } = await entrarNaApi(COORDENACAO))
  ;({ api: caixa, id: caixaId } = await entrarNaApi(CAIXA))
})

test.afterAll(async () => {
  if (!coordenacao) return
  await coordenacao.from('donations_cash').delete().eq('donor_name', MARCA)
  await coordenacao.from('events').delete().eq('name', MARCA)
})

test('a caixa não cadastra evento; a coordenação cadastra', async () => {
  expect((await caixa.from('events').insert({ name: MARCA, event_date: '2026-10-23' })).error).not.toBeNull()

  const r = await coordenacao.from('events').insert({ name: MARCA, event_date: '2026-10-23' }).select('id').single()
  expect(r.error).toBeNull()
  eventoId = r.data!.id
})

test('a caixa lê o evento e registra a doação vinculada', async () => {
  expect((await caixa.from('events').select('id').eq('id', eventoId)).data).toHaveLength(1)
  const r = await caixa.from('donations_cash').insert({
    donor_name: MARCA, amount: 35, frequency: 'one_time', donated_at: new Date().toISOString(),
    registered_by: caixaId, event_id: eventoId,
  })
  expect(r.error).toBeNull()
})

test('o total do evento soma a doação, e a doação sem evento continua valendo', async () => {
  const total = await coordenacao.from('events_totals').select('donation_count, total').eq('id', eventoId).single()
  expect(total.data).toMatchObject({ donation_count: 1 })
  expect(Number(total.data!.total)).toBe(35)

  const semEvento = await caixa.from('donations_cash').insert({
    donor_name: MARCA, amount: 5, frequency: 'one_time', donated_at: new Date().toISOString(), registered_by: caixaId,
  })
  expect(semEvento.error).toBeNull()
})

test('evento com doação não é apagado', async () => {
  expect((await coordenacao.from('events').delete().eq('id', eventoId)).error).not.toBeNull()
})