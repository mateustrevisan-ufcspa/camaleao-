// US-04a · Editar e excluir doação de item, conferido pela API.
import { test, expect } from '@playwright/test'
import type { SupabaseClient } from '@supabase/supabase-js'
import { COORDENACAO, VOLUNTARIA, entrarNaApi, recusado } from './apoio'

const MARCA = 'TESTE US-04a'

let coordenacao: SupabaseClient
let voluntaria: SupabaseClient
let voluntariaId: string
let deAnteontemId: string

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  ;({ api: coordenacao } = await entrarNaApi(COORDENACAO))
  ;({ api: voluntaria, id: voluntariaId } = await entrarNaApi(VOLUNTARIA))

  // Lançada dois dias atrás: o balcão não enxerga nem altera.
  const antes = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  const r = await coordenacao
    .from('donations_items')
    .insert({ donor_name: MARCA, category_name: 'roupa', quantity: 2, donated_at: antes, created_at: antes })
    .select('id')
    .single()
  if (r.error) throw new Error(`Não criou a doação antiga: ${r.error.message}`)
  deAnteontemId = r.data.id
})

test.afterAll(async () => {
  // As excluídas ficam no banco local, invisíveis; o db reset da esteira limpa.
  if (coordenacao) await coordenacao.from('donations_items').delete().eq('donor_name', MARCA)
})

test('a voluntária não altera nem exclui doação lançada antes de hoje', async () => {
  expect(recusado(await voluntaria.from('donations_items').update({ quantity: 9 }).eq('id', deAnteontemId).select())).toBe(true)
  expect((await voluntaria.rpc('excluir_doacao_de_item', { p_id: deAnteontemId })).error).not.toBeNull()

  const { data } = await coordenacao.from('donations_items').select('quantity').eq('id', deAnteontemId).single()
  expect(data!.quantity).toBe(2)
})

test('a coordenação corrige a doação antiga', async () => {
  const r = await coordenacao.from('donations_items').update({ quantity: 4 }).eq('id', deAnteontemId).select('quantity').single()
  expect(r.error).toBeNull()
  expect(r.data!.quantity).toBe(4)
})

test('ninguém muda pela API quem lançou nem quando', async () => {
  expect((await coordenacao.from('donations_items').update({ created_at: new Date().toISOString() }).eq('id', deAnteontemId)).error).not.toBeNull()
  expect((await coordenacao.from('donations_items').update({ deleted_at: new Date().toISOString() }).eq('id', deAnteontemId)).error).not.toBeNull()
})

test('a voluntária corrige e exclui a doação que lançou hoje, e a excluída some para todos', async () => {
  const nova = await voluntaria
    .from('donations_items')
    .insert({ donor_name: MARCA, category_name: 'roupa', quantity: 1, donated_at: new Date().toISOString(), registered_by: voluntariaId })
    .select('id')
    .single()
  expect(nova.error).toBeNull()
  const id = nova.data!.id

  const corrigida = await voluntaria.from('donations_items').update({ quantity: 6 }).eq('id', id).select('quantity').single()
  expect(corrigida.error).toBeNull()
  expect(corrigida.data!.quantity).toBe(6)

  expect((await voluntaria.rpc('excluir_doacao_de_item', { p_id: id })).error).toBeNull()

  expect(recusado(await voluntaria.from('donations_items').select('id').eq('id', id))).toBe(true)
  expect(recusado(await coordenacao.from('donations_items').select('id').eq('id', id))).toBe(true)
  // Excluída não se exclui de novo nem se altera.
  expect((await coordenacao.rpc('excluir_doacao_de_item', { p_id: id })).error).not.toBeNull()
  expect(recusado(await coordenacao.from('donations_items').update({ quantity: 3 }).eq('id', id).select())).toBe(true)
})
