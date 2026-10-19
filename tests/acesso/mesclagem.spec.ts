// US-08b · Mesclagem de duas fichas, conferida pela API.
import { test, expect } from '@playwright/test'
import type { SupabaseClient } from '@supabase/supabase-js'
import { CAIXA, COORDENACAO, entrarNaApi, recusado } from './apoio'

const MARCA = 'TESTE US-08b'

let coordenacao: SupabaseClient
let caixa: SupabaseClient
let fica: string // sem e-mail, desde 2026, etiqueta "familiar"
let sai: string // com e-mail, desde 2024, etiqueta "brechó", uma venda, uma doação e autorização
let mesclagem: string

// Os testes contam uma história só, nesta ordem.
test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  ;({ api: coordenacao } = await entrarNaApi(COORDENACAO))
  ;({ api: caixa } = await entrarNaApi(CAIXA))

  const a = await coordenacao.from('clients').insert({ name: `${MARCA} fica`, member_since: 2026 }).select('id').single()
  const b = await coordenacao
    .from('clients')
    .insert({ name: `${MARCA} sai`, email: 'sai@teste.local', member_since: 2024 })
    .select('id')
    .single()
  if (a.error || b.error) throw new Error(`Não cadastrou as fichas do teste: ${a.error?.message ?? b.error?.message}`)
  fica = a.data.id
  sai = b.data.id

  const { data: tags } = await coordenacao.from('tags').select('id, name').in('name', ['familiar', 'brechó'])
  const tag = (nome: string) => tags!.find((t) => t.name === nome)!.id

  const preparos = await Promise.all([
    coordenacao.from('client_tags').insert([
      { client_id: fica, tag_id: tag('familiar') },
      { client_id: sai, tag_id: tag('brechó') },
    ]),
    coordenacao.from('sales').insert({ client_id: sai, customer_name: MARCA }),
    coordenacao.from('donations_cash').insert({
      client_id: sai, donor_name: MARCA, amount: 10, frequency: 'one_time', donated_at: new Date().toISOString(),
    }),
    coordenacao.from('message_consents').insert({ client_id: sai, authorized: true, term_version: 'teste-08b' }),
  ])
  const falha = preparos.find((r) => r.error)
  if (falha) throw new Error(`Preparo do teste falhou: ${falha.error!.message}`)
})

test.afterAll(async () => {
  if (!coordenacao) return
  await coordenacao.from('sales').delete().eq('customer_name', MARCA)
  await coordenacao.from('donations_cash').delete().eq('donor_name', MARCA)
  // Apagar as fichas apaga junto etiquetas, autorizações e o registro da mesclagem.
  await coordenacao.from('clients').delete().like('name', `${MARCA}%`)
})

test('o balcão não mescla', async () => {
  expect((await caixa.rpc('mesclar_fichas', { p_manter: fica, p_juntar: sai })).error).not.toBeNull()
  const { data } = await coordenacao.from('clients').select('id').in('id', [fica, sai])
  expect(data).toHaveLength(2)
})

test('a mesclagem leva compra, doação, etiqueta e autorização, e apaga a ficha que sai', async () => {
  const r = await coordenacao.rpc('mesclar_fichas', { p_manter: fica, p_juntar: sai })
  expect(r.error).toBeNull()
  mesclagem = r.data as string

  expect((await coordenacao.from('clients').select('id').eq('id', sai)).data).toHaveLength(0)

  const venda = await coordenacao.from('sales').select('client_id').eq('customer_name', MARCA).single()
  expect(venda.data?.client_id).toBe(fica)
  const doacao = await coordenacao.from('donations_cash').select('client_id').eq('donor_name', MARCA).single()
  expect(doacao.data?.client_id).toBe(fica)

  const ficha = await coordenacao.from('clients_view').select('email, member_since, tags').eq('id', fica).single()
  expect(ficha.data).toMatchObject({ email: 'sai@teste.local', member_since: 2024 })
  expect([...ficha.data!.tags].sort()).toEqual(['brechó', 'familiar'])

  const autorizacao = await coordenacao.from('message_consent_status').select('authorized').eq('client_id', fica).single()
  expect(autorizacao.data?.authorized).toBe(true)
})

test('a cópia da ficha que saiu não sai pela API, e o balcão não lê as mesclagens', async () => {
  expect((await coordenacao.from('client_merges').select('id, removed_name').eq('id', mesclagem)).data).toHaveLength(1)
  expect((await coordenacao.from('client_merges').select('removed_snapshot').eq('id', mesclagem)).error).not.toBeNull()
  expect(recusado(await caixa.from('client_merges').select('id').eq('id', mesclagem))).toBe(true)
})

test('desfazer devolve as duas fichas como eram', async () => {
  expect((await caixa.rpc('desfazer_mesclagem', { p_mesclagem: mesclagem })).error).not.toBeNull()
  expect((await coordenacao.rpc('desfazer_mesclagem', { p_mesclagem: mesclagem })).error).toBeNull()

  expect((await coordenacao.from('clients').select('id').eq('id', sai)).data).toHaveLength(1)
  const venda = await coordenacao.from('sales').select('client_id').eq('customer_name', MARCA).single()
  expect(venda.data?.client_id).toBe(sai)

  const fichaFica = await coordenacao.from('clients_view').select('email, member_since, tags').eq('id', fica).single()
  expect(fichaFica.data).toMatchObject({ email: null, member_since: 2026, tags: ['familiar'] })
  const fichaSai = await coordenacao.from('clients_view').select('email, tags').eq('id', sai).single()
  expect(fichaSai.data).toMatchObject({ email: 'sai@teste.local', tags: ['brechó'] })

  const autorizacao = await coordenacao.from('message_consent_status').select('authorized').eq('client_id', sai).single()
  expect(autorizacao.data?.authorized).toBe(true)
})

test('a mesma mesclagem não é desfeita duas vezes', async () => {
  expect((await coordenacao.rpc('desfazer_mesclagem', { p_mesclagem: mesclagem })).error).not.toBeNull()
})
