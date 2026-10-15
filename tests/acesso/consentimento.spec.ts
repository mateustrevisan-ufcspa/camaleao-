// US-07 · Contato e consentimento de mensagens.
// Confere, pela API e como caixa, o registro de autorização e a trava do envio.
import { test, expect } from '@playwright/test'
import type { SupabaseClient } from '@supabase/supabase-js'
import { CAIXA, COORDENACAO, entrarNaApi } from './apoio'

const MARCA = 'TESTE US-07'
const TERMO = 'teste-1'

let coordenacao: SupabaseClient
let coordenacaoId: string
let caixa: SupabaseClient
let caixaId: string
let pessoaId: string

const destinatarios = () => caixa.from('message_recipients').select('client_id').eq('client_id', pessoaId)

test.beforeAll(async () => {
  ;({ api: coordenacao, id: coordenacaoId } = await entrarNaApi(COORDENACAO))
  ;({ api: caixa, id: caixaId } = await entrarNaApi(CAIXA))

  const nova = await caixa.from('clients').insert({ name: MARCA, member_since: 2026 }).select('id').single()
  if (nova.error) throw new Error(`Não cadastrou a pessoa do teste: ${nova.error.message}`)
  pessoaId = nova.data.id
})

test.afterAll(async () => {
  // Apagar a pessoa apaga junto o histórico de autorização dela.
  if (coordenacao) await coordenacao.from('clients').delete().eq('name', MARCA)
})

// Os testes abaixo contam uma história só, nesta ordem.
test.describe.configure({ mode: 'serial' })

test('quem nunca foi perguntada não recebe mensagem', async () => {
  expect((await destinatarios()).data).toHaveLength(0)
  expect((await caixa.rpc('pode_receber_mensagem', { p_client_id: pessoaId })).data).toBe(false)
})

test('a autorização fica registrada com data, versão do termo e autoria do servidor', async () => {
  // A caixa tenta escolher a data e pôr o registro no nome de outra pessoa.
  const registro = await caixa
    .from('message_consents')
    .insert({ client_id: pessoaId, authorized: true, term_version: TERMO, recorded_at: '2020-01-01T00:00:00Z', recorded_by: coordenacaoId })
    .select('authorized, term_version, recorded_at, recorded_by')
    .single()
  expect(registro.error).toBeNull()
  expect(registro.data?.term_version).toBe(TERMO)
  expect(registro.data?.recorded_by).toBe(caixaId)
  expect(Date.now() - new Date(registro.data!.recorded_at).getTime()).toBeLessThan(60_000)

  expect((await destinatarios()).data).toHaveLength(1)
})

test('o registro não pode ser alterado nem apagado', async () => {
  const alterar = await caixa.from('message_consents').update({ authorized: false }).eq('client_id', pessoaId).select()
  expect(alterar.error).not.toBeNull()
  const apagar = await coordenacao.from('message_consents').delete().eq('client_id', pessoaId).select()
  expect(apagar.error).not.toBeNull()

  expect((await destinatarios()).data).toHaveLength(1)
})

test('retirar a autorização tira a pessoa da lista de envio e mantém o histórico', async () => {
  const retirada = await caixa.from('message_consents').insert({ client_id: pessoaId, authorized: false, term_version: TERMO })
  expect(retirada.error).toBeNull()

  expect((await destinatarios()).data).toHaveLength(0)
  expect((await caixa.rpc('pode_receber_mensagem', { p_client_id: pessoaId })).data).toBe(false)

  const historico = await caixa.from('message_consents').select('authorized').eq('client_id', pessoaId)
  expect(historico.data).toHaveLength(2)
})
