// US-19 · Valor do atendimento, conferido pela API.
import { test, expect } from '@playwright/test'
import type { SupabaseClient } from '@supabase/supabase-js'
import { CAIXA, COORDENACAO, entrarNaApi, recusado } from './apoio'

let coordenacao: SupabaseClient
let coordenacaoId: string
let caixa: SupabaseClient
let caixaId: string

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  ;({ api: coordenacao, id: coordenacaoId } = await entrarNaApi(COORDENACAO))
  ;({ api: caixa, id: caixaId } = await entrarNaApi(CAIXA))
})

test.afterAll(async () => {
  // Ninguém apaga linha: o valor volta a R$ 50 com uma linha nova.
  if (coordenacao) await coordenacao.from('valor_do_atendimento').insert({ valor: 50 })
})

const vigente = (api: SupabaseClient) =>
  api.from('valor_do_atendimento').select('id, valor, definido_por, definido_em').order('definido_em', { ascending: false }).limit(1).single()

test('a caixa lê o valor, mas não grava', async () => {
  const leitura = await vigente(caixa)
  expect(leitura.error).toBeNull()
  expect(Number(leitura.data!.valor)).toBeGreaterThan(0)

  expect((await caixa.from('valor_do_atendimento').insert({ valor: 1 })).error).not.toBeNull()
})

test('a coordenação grava, e quem e quando vêm do banco', async () => {
  const r = await coordenacao
    .from('valor_do_atendimento')
    .insert({ valor: 55, definido_por: caixaId, definido_em: '2000-01-01T00:00:00Z' })
    .select('valor, definido_por, definido_em')
    .single()
  expect(r.error).toBeNull()
  expect(Number(r.data!.valor)).toBe(55)
  expect(r.data!.definido_por).toBe(coordenacaoId)
  expect(new Date(r.data!.definido_em).getFullYear()).toBeGreaterThan(2000)
})

test('ninguém altera nem apaga uma linha, nem a coordenação', async () => {
  const { data } = await vigente(coordenacao)
  const id = data!.id

  expect(recusado(await coordenacao.from('valor_do_atendimento').update({ valor: 1 }).eq('id', id).select())).toBe(true)
  expect(recusado(await coordenacao.from('valor_do_atendimento').delete().eq('id', id).select())).toBe(true)
  expect(recusado(await caixa.from('valor_do_atendimento').delete().eq('id', id).select())).toBe(true)

  const depois = await vigente(coordenacao)
  expect(Number(depois.data!.valor)).toBe(55)
})
