// SEC-04 · Trilha de auditoria, conferida pela API.
import { test, expect } from '@playwright/test'
import type { SupabaseClient } from '@supabase/supabase-js'
import { CAIXA, COORDENACAO, VOLUNTARIA, entrarNaApi, recusado } from './apoio'

let coordenacao: SupabaseClient
let coordenacaoId: string
let caixa: SupabaseClient
let caixaId: string

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  ;({ api: coordenacao, id: coordenacaoId } = await entrarNaApi(COORDENACAO))
  ;({ api: caixa, id: caixaId } = await entrarNaApi(CAIXA))
})

async function novaDoacaoDeItem(campos: Record<string, unknown> = {}) {
  const { data: categoria } = await caixa.from('item_categories').select('id, name').eq('name', 'blusa').single()
  const r = await caixa
    .from('donations_items')
    .insert({
      donor_name: 'TESTE SEC-04',
      category_id: categoria!.id,
      category_name: categoria!.name,
      donated_at: new Date().toISOString(),
      registered_by: caixaId,
      ...campos,
    })
    .select('id')
    .single()
  if (r.error) throw new Error(`Não criou a doação: ${r.error.message}`)
  return r.data.id as string
}

const daTrilha = (id: string) =>
  coordenacao.from('trilha_de_auditoria').select('acao, campos, antes, depois, motivo, feito_por').eq('registro_id', id).order('feito_em')

test('correção com motivo entra na trilha com quem fez, e o motivo não fica na linha', async () => {
  const id = await novaDoacaoDeItem()
  const r = await caixa
    .from('donations_items')
    .update({ notes: 'corrigido', motivo_da_alteracao: 'digitei errado' })
    .eq('id', id)
    .select('motivo_da_alteracao')
    .single()
  expect(r.error).toBeNull()
  expect(r.data!.motivo_da_alteracao).toBeNull()

  const { data } = await daTrilha(id)
  expect(data).toHaveLength(1)
  expect(data![0]).toMatchObject({ acao: 'alteracao', campos: ['notes'], motivo: 'digitei errado', feito_por: caixaId })
  expect(data![0].antes).toEqual({ notes: null })
  expect(data![0].depois).toEqual({ notes: 'corrigido' })
})

test('correção sem motivo também entra, com o motivo vazio', async () => {
  const id = await novaDoacaoDeItem()
  expect((await caixa.from('donations_items').update({ notes: 'sem motivo' }).eq('id', id)).error).toBeNull()
  const { data } = await daTrilha(id)
  expect(data).toHaveLength(1)
  expect(data![0]).toMatchObject({ acao: 'alteracao', motivo: null, feito_por: caixaId })
})

test('exclusão pede motivo e entra como exclusão', async () => {
  const id = await novaDoacaoDeItem()
  expect((await caixa.rpc('excluir_doacao_de_item', { p_id: id, p_motivo: '' })).error).not.toBeNull()
  expect((await caixa.rpc('excluir_doacao_de_item', { p_id: id, p_motivo: '  ' })).error).not.toBeNull()
  expect((await caixa.rpc('excluir_doacao_de_item', { p_id: id, p_motivo: 'lançada em dobro' })).error).toBeNull()

  const { data } = await daTrilha(id)
  expect(data!.at(-1)).toMatchObject({ acao: 'exclusao', motivo: 'lançada em dobro', feito_por: caixaId })
})

test('o balcão não lê a trilha, e ninguém grava, altera ou apaga pela API', async () => {
  expect(recusado(await caixa.from('trilha_de_auditoria').select('id').limit(1))).toBe(true)
  const { api: voluntaria } = await entrarNaApi(VOLUNTARIA)
  expect(recusado(await voluntaria.from('trilha_de_auditoria').select('id').limit(1))).toBe(true)

  expect((await coordenacao.from('trilha_de_auditoria').insert({ tabela: 'sales', registro_id: coordenacaoId, acao: 'alteracao' })).error).not.toBeNull()
  const { data } = await coordenacao.from('trilha_de_auditoria').select('id').limit(1).single()
  expect(recusado(await coordenacao.from('trilha_de_auditoria').update({ motivo: 'x' }).eq('id', data!.id).select())).toBe(true)
  expect(recusado(await coordenacao.from('trilha_de_auditoria').delete().eq('id', data!.id).select())).toBe(true)
  // A linha continua lá.
  expect((await coordenacao.from('trilha_de_auditoria').select('id').eq('id', data!.id)).data).toHaveLength(1)
})

test('telefone não fica na trilha, nem o da ficha nem o do doador, e vincular doação a uma ficha não entra', async () => {
  const { data: ficha } = await coordenacao.from('clients').insert({ name: 'TESTE SEC-04 ficha', phone: '(51) 90000-1111' }).select('id').single()
  await coordenacao.from('clients').update({ phone: '(51) 90000-2222' }).eq('id', ficha!.id)
  const { data: trilhaDaFicha } = await daTrilha(ficha!.id)
  expect(trilhaDaFicha![0].antes).toEqual({ phone: '(alterado)' })
  expect(JSON.stringify(trilhaDaFicha)).not.toContain('90000')

  const id = await novaDoacaoDeItem({ donor_phone: '(51) 90000-3333' })
  await caixa.from('donations_items').update({ donor_phone: '(51) 90000-4444' }).eq('id', id)
  await caixa.rpc('excluir_doacao_de_item', { p_id: id, p_motivo: 'teste do telefone' })
  const { data: trilhaDoDoador } = await daTrilha(id)
  expect(trilhaDoDoador!.length).toBeGreaterThan(0)
  expect(JSON.stringify(trilhaDoDoador)).not.toContain('90000')

  const outra = await novaDoacaoDeItem()
  await coordenacao.from('donations_items').update({ client_id: ficha!.id }).eq('id', outra)
  expect((await daTrilha(outra)).data).toHaveLength(0)

  await coordenacao.from('donations_items').update({ client_id: null }).eq('id', outra)
  await coordenacao.from('clients').delete().eq('id', ficha!.id)
})

test('a mesclagem e o desfazer ficam fora da trilha (têm registro próprio)', async () => {
  const a = await coordenacao.from('clients').insert({ name: 'TESTE SEC-04 fica' }).select('id').single()
  const b = await coordenacao.from('clients').insert({ name: 'TESTE SEC-04 sai', email: 'sai@exemplo.test', member_since: 2025 }).select('id').single()
  const fica = a.data!.id as string
  const sai = b.data!.id as string

  const r = await coordenacao.rpc('mesclar_fichas', { p_manter: fica, p_juntar: sai })
  expect(r.error).toBeNull()
  expect((await daTrilha(fica)).data).toHaveLength(0)
  expect((await daTrilha(sai)).data).toHaveLength(0)

  expect((await coordenacao.rpc('desfazer_mesclagem', { p_mesclagem: r.data as string })).error).toBeNull()
  expect((await daTrilha(fica)).data).toHaveLength(0)
  expect((await daTrilha(sai)).data).toHaveLength(0)
})
