// US-27 · Triagem de doação de outro dia, conferida pela API.
import { test, expect } from '@playwright/test'
import type { SupabaseClient } from '@supabase/supabase-js'
import { COORDENACAO, VOLUNTARIA, entrarNaApi, recusado } from './apoio'

const MARCA = 'TESTE US-27'

let coordenacao: SupabaseClient
let voluntaria: SupabaseClient
let voluntariaId: string
let deAnteontemId: string

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  ;({ api: coordenacao } = await entrarNaApi(COORDENACAO))
  ;({ api: voluntaria, id: voluntariaId } = await entrarNaApi(VOLUNTARIA))

  const antes = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  const r = await coordenacao
    .from('donations_items')
    .insert({ donor_name: MARCA, category_name: 'roupa', notes: 'sacola azul', donated_at: antes, created_at: antes })
    .select('id')
    .single()
  if (r.error) throw new Error(`Não criou a doação antiga: ${r.error.message}`)
  deAnteontemId = r.data.id
})

test.afterAll(async () => {
  if (coordenacao) await coordenacao.from('donations_items').delete().eq('donor_name', MARCA)
})

test('a voluntária vê a doação de outro dia na triagem pendente, sem telefone', async () => {
  const r = await voluntaria.rpc('triagens_pendentes')
  expect(r.error).toBeNull()
  const linha = (r.data as { id: string; notes: string }[]).find((p) => p.id === deAnteontemId)
  expect(linha?.notes).toBe('sacola azul')
  expect(linha).not.toHaveProperty('donor_phone')
  // Pela API, a doação de outro dia continua fora do alcance dela.
  expect(recusado(await voluntaria.from('donations_items').select('id').eq('id', deAnteontemId))).toBe(true)
})

test('a voluntária registra a triagem e não altera os outros campos', async () => {
  expect(recusado(await voluntaria.from('donations_items').update({ notes: 'trocado' }).eq('id', deAnteontemId).select())).toBe(true)

  const r = await voluntaria.rpc('registrar_triagem', { p_id: deAnteontemId, p_aproveitadas: 12, p_redoadas: 3, p_descarte: 1 })
  expect(r.error).toBeNull()

  const { data } = await coordenacao
    .from('donations_items')
    .select('aproveitadas, redoadas, descarte, notes, triado_por, triado_em')
    .eq('id', deAnteontemId)
    .single()
  expect(data).toMatchObject({ aproveitadas: 12, redoadas: 3, descarte: 1, notes: 'sacola azul', triado_por: voluntariaId })
  expect(data!.triado_em).not.toBeNull()
})

test('a voluntária não refaz uma triagem já registrada; a coordenação refaz', async () => {
  expect((await voluntaria.rpc('registrar_triagem', { p_id: deAnteontemId, p_aproveitadas: 1, p_redoadas: 1, p_descarte: 1 })).error).not.toBeNull()
  expect((await coordenacao.rpc('registrar_triagem', { p_id: deAnteontemId, p_aproveitadas: 10, p_redoadas: 5, p_descarte: 1 })).error).toBeNull()
})

test('contagem fora de 0 a 300, ou só uma das três, é recusada', async () => {
  expect((await coordenacao.rpc('registrar_triagem', { p_id: deAnteontemId, p_aproveitadas: 301, p_redoadas: 0, p_descarte: 0 })).error).not.toBeNull()
  expect((await coordenacao.from('donations_items').update({ aproveitadas: 5, redoadas: null }).eq('id', deAnteontemId)).error).not.toBeNull()
})
