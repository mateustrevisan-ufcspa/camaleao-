// US-13 · Doação vinculada a uma campanha, conferida pela API.
import { test, expect } from '@playwright/test'
import type { SupabaseClient } from '@supabase/supabase-js'
import { CAIXA, COORDENACAO, entrarNaApi } from './apoio'

const MARCA = 'TESTE US-13'

let coordenacao: SupabaseClient
let caixa: SupabaseClient
let caixaId: string
let campanhaId: string

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  ;({ api: coordenacao } = await entrarNaApi(COORDENACAO))
  ;({ api: caixa, id: caixaId } = await entrarNaApi(CAIXA))
})

test.afterAll(async () => {
  if (!coordenacao) return
  await coordenacao.from('donations_cash').delete().eq('donor_name', MARCA)
  await coordenacao.from('campaigns').delete().eq('name', MARCA)
})

const doacao = (extra: Record<string, unknown>) => ({
  donor_name: MARCA, amount: 60, frequency: 'one_time', donated_at: new Date().toISOString(), registered_by: caixaId, ...extra,
})

test('a caixa não cadastra campanha; a coordenação cadastra com período e custo', async () => {
  expect((await caixa.from('campaigns').insert({ name: MARCA, starts_on: '2026-10-01' })).error).not.toBeNull()

  const r = await coordenacao
    .from('campaigns')
    .insert({ name: MARCA, starts_on: '2026-10-01', ends_on: '2026-12-20', estimated_cost: 100 })
    .select('id')
    .single()
  expect(r.error).toBeNull()
  campanhaId = r.data!.id
})

test('a caixa registra a doação vinculada, e o total mostra arrecadado, custo e diferença', async () => {
  expect((await caixa.from('donations_cash').insert(doacao({ campaign_id: campanhaId }))).error).toBeNull()

  const total = await coordenacao
    .from('campaigns_totals')
    .select('donation_count, raised, estimated_cost, difference')
    .eq('id', campanhaId)
    .single()
  expect(total.data?.donation_count).toBe(1)
  expect(Number(total.data!.raised)).toBe(60)
  expect(Number(total.data!.estimated_cost)).toBe(100)
  expect(Number(total.data!.difference)).toBe(-40)
})

test('a doação é de um evento ou de uma campanha, não dos dois', async () => {
  const { data: eventos } = await coordenacao.from('events').select('id').limit(1)
  expect(eventos?.length).toBe(1)
  const r = await caixa.from('donations_cash').insert(doacao({ campaign_id: campanhaId, event_id: eventos![0].id }))
  expect(r.error).not.toBeNull()
})

test('encerrar mantém o histórico, e campanha com doação não é apagada', async () => {
  const encerrar = await coordenacao.from('campaigns').update({ closed_at: new Date().toISOString() }).eq('id', campanhaId).select('id')
  expect(encerrar.data).toHaveLength(1)
  const total = await coordenacao.from('campaigns_totals').select('raised, closed_at').eq('id', campanhaId).single()
  expect(Number(total.data!.raised)).toBe(60)
  expect(total.data!.closed_at).not.toBeNull()

  expect((await coordenacao.from('campaigns').delete().eq('id', campanhaId)).error).not.toBeNull()
})