// US-31 · Comissão por doação: só a coordenação, percentual e quem e quando pelo banco.
import { test, expect } from '@playwright/test'
import type { SupabaseClient } from '@supabase/supabase-js'
import { CAIXA, COORDENACAO, entrarNaApi, recusado } from './apoio'

let coordenacao: SupabaseClient
let coordenacaoId: string
let caixa: SupabaseClient
let doacaoId: string
let outraDoacaoId: string
let captadorId: string

test.describe.configure({ mode: 'serial' })

async function novaDoacao(api: SupabaseClient, valor: number) {
  const { data: origem } = await api.from('cash_origins').select('id').eq('name', 'PIX').single()
  // Sem banco (bank_id nulo): o líquido é o próprio valor (US-35).
  const d = await api.from('donations_cash').insert({ donor_name: 'TESTE US-31', amount: valor, origin_id: origem!.id, frequency: 'one_time', donated_at: new Date().toISOString() }).select('id').single()
  return d.data!.id as string
}

test.beforeAll(async () => {
  ;({ api: coordenacao, id: coordenacaoId } = await entrarNaApi(COORDENACAO))
  ;({ api: caixa } = await entrarNaApi(CAIXA))
  doacaoId = await novaDoacao(coordenacao, 200)
  outraDoacaoId = await novaDoacao(coordenacao, 100)
  const c = await coordenacao.from('captadores').insert({ nome: `Captação teste ${Date.now()}` }).select('id').single()
  captadorId = c.data!.id
})

test('a comissão é 25% do líquido, e percentual, quem e quando vêm do banco', async () => {
  const r = await coordenacao
    .from('comissoes_de_doacao')
    .insert({ donation_id: doacaoId, teve_comissao: true, captador_id: captadorId, percentual: 99, definido_por: null })
    .select('percentual, definido_por')
    .single()
  expect(r.error).toBeNull()
  expect(Number(r.data!.percentual)).toBe(25)
  expect(r.data!.definido_por).toBe(coordenacaoId)
  const { data: v } = await coordenacao.from('comissoes_view').select('valor').eq('donation_id', doacaoId).single()
  expect(Number(v!.valor)).toBe(50)
  // Uma por doação, e o percentual não muda pela API.
  expect((await coordenacao.from('comissoes_de_doacao').insert({ donation_id: doacaoId, teve_comissao: false })).error).not.toBeNull()
  await coordenacao.from('comissoes_de_doacao').update({ percentual: 80 }).eq('donation_id', doacaoId)
  const { data: k } = await coordenacao.from('comissoes_de_doacao').select('percentual').eq('donation_id', doacaoId).single()
  expect(Number(k!.percentual)).toBe(25)
})

test('teve comissão sem quem captou, ou sem comissão com alguém, é recusado', async () => {
  expect((await coordenacao.from('comissoes_de_doacao').insert({ donation_id: outraDoacaoId, teve_comissao: true, captador_id: null })).error).not.toBeNull()
  expect((await coordenacao.from('comissoes_de_doacao').insert({ donation_id: outraDoacaoId, teve_comissao: false, captador_id: captadorId })).error).not.toBeNull()
  const sem = await coordenacao.from('comissoes_de_doacao').insert({ donation_id: outraDoacaoId, teve_comissao: false, captador_id: null })
  expect(sem.error).toBeNull()
  const { data: v } = await coordenacao.from('comissoes_view').select('valor').eq('donation_id', outraDoacaoId).single()
  expect(v!.valor).toBeNull()
})

test('o percentual novo vale para as próximas marcações, e nenhuma linha muda', async () => {
  expect((await coordenacao.from('percentual_de_comissao').insert({ percentual: 30 })).error).toBeNull()
  // A doação marcada antes continua com 25%.
  const { data: antiga } = await coordenacao.from('comissoes_view').select('percentual').eq('donation_id', doacaoId).single()
  expect(Number(antiga!.percentual)).toBe(25)
  // Desmarcar e marcar de novo usa o percentual novo.
  await coordenacao.from('comissoes_de_doacao').delete().eq('donation_id', outraDoacaoId)
  const nova = await coordenacao.from('comissoes_de_doacao').insert({ donation_id: outraDoacaoId, teve_comissao: true, captador_id: captadorId }).select('percentual').single()
  expect(Number(nova.data!.percentual)).toBe(30)
  // Ninguém altera nem apaga uma linha do percentual (sem política de update e delete).
  const { data: linhas } = await coordenacao.from('percentual_de_comissao').select('id').order('definido_em', { ascending: false }).limit(1)
  await coordenacao.from('percentual_de_comissao').update({ percentual: 1 }).eq('id', linhas![0].id)
  await coordenacao.from('percentual_de_comissao').delete().eq('id', linhas![0].id)
  const { data: depois } = await coordenacao.from('percentual_de_comissao').select('percentual').eq('id', linhas![0].id).single()
  expect(Number(depois!.percentual)).toBe(30)
  // Volta para 25%, para não mudar os outros testes.
  expect((await coordenacao.from('percentual_de_comissao').insert({ percentual: 25 })).error).toBeNull()
})

test('o caixa não vê nem lança comissão, percentual nem quem capta', async () => {
  expect(recusado(await caixa.from('comissoes_de_doacao').select('id'))).toBe(true)
  expect(recusado(await caixa.from('comissoes_view').select('id'))).toBe(true)
  expect(recusado(await caixa.from('captadores').select('id'))).toBe(true)
  expect(recusado(await caixa.from('percentual_de_comissao').select('id'))).toBe(true)
  expect((await caixa.from('captadores').insert({ nome: 'Caixa tentando' })).error).not.toBeNull()
  expect((await caixa.from('percentual_de_comissao').insert({ percentual: 50 })).error).not.toBeNull()
  expect((await caixa.from('comissoes_de_doacao').insert({ donation_id: doacaoId, teve_comissao: false })).error).not.toBeNull()
})

test('a correção da comissão entra na trilha (SEC-04)', async () => {
  const outro = await coordenacao.from('captadores').insert({ nome: `Captação teste 2 ${Date.now()}` }).select('id').single()
  const { data: k } = await coordenacao.from('comissoes_de_doacao').update({ captador_id: outro.data!.id }).eq('donation_id', doacaoId).select('id').single()
  const { data } = await coordenacao.from('trilha_de_auditoria').select('campos').eq('registro_id', k!.id)
  expect((data ?? []).some((t) => (t.campos as string[]).includes('captador_id'))).toBe(true)
})
