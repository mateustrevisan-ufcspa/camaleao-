// SEC-05 · Minimização de dados pessoais expostos.
// Confere, pela API, o que cada perfil recebe de dado pessoal.
import { test, expect } from '@playwright/test'
import type { SupabaseClient } from '@supabase/supabase-js'
import { CAIXA, COORDENACAO, entrarNaApi } from './apoio'

const MARCA = 'TESTE SEC-05'
const TELEFONE = '(51) 99876-5432'

let coordenacao: SupabaseClient
let caixa: SupabaseClient
let pessoaId: string

test.beforeAll(async () => {
  coordenacao = (await entrarNaApi(COORDENACAO)).api
  caixa = (await entrarNaApi(CAIXA)).api

  // A caixa cadastra a pessoa: gravar o telefone continua permitido ao balcão.
  const nova = await caixa.from('clients').insert({ name: MARCA, phone: TELEFONE, member_since: 2026 }).select('id').single()
  if (nova.error) throw new Error(`A caixa não conseguiu cadastrar a pessoa: ${nova.error.message}`)
  pessoaId = nova.data.id
})

test.afterAll(async () => {
  if (coordenacao) await coordenacao.from('clients').delete().like('name', `${MARCA}%`)
})

test('a coordenação vê o telefone inteiro e o balcão vê só o final', async () => {
  // Controle: o número existe e a coordenação o recebe inteiro.
  const daCoordenacao = await coordenacao.from('clients_view').select('phone, phone_masked').eq('id', pessoaId).single()
  expect(daCoordenacao.data).toEqual({ phone: TELEFONE, phone_masked: false })

  const daCaixa = await caixa.from('clients_view').select('phone, phone_masked').eq('id', pessoaId).single()
  expect(daCaixa.data).toEqual({ phone: '(••) •••••-5432', phone_masked: true })
})

test('ninguém lê a coluna phone direto da tabela', async () => {
  for (const api of [caixa, coordenacao]) {
    const direto = await api.from('clients').select('phone').eq('id', pessoaId)
    expect(direto.error, 'a coluna phone deveria estar fechada para leitura direta').not.toBeNull()

    const tudo = await api.from('clients').select('*').eq('id', pessoaId)
    expect(tudo.error, 'select * inclui phone e também deveria ser recusado').not.toBeNull()

    // As outras colunas continuam legíveis.
    const nome = await api.from('clients').select('id, name').eq('id', pessoaId).single()
    expect(nome.data?.name).toBe(MARCA)
  }
})

test('o balcão corrige o telefone sem enxergar o número antigo', async () => {
  const troca = await caixa.from('clients').update({ phone: '(51) 91111-2222' }).eq('id', pessoaId)
  expect(troca.error).toBeNull()

  const depois = await coordenacao.from('clients_view').select('phone').eq('id', pessoaId).single()
  expect(depois.data?.phone).toBe('(51) 91111-2222')
})

test('o CPF não existe mais e as views não devolvem o que as telas não usam', async () => {
  expect((await coordenacao.from('clients').select('cpf').limit(1)).error).not.toBeNull()
  expect((await coordenacao.from('clients_view').select('notes').limit(1)).error).not.toBeNull()
  expect((await coordenacao.from('sales_view').select('registered_by').limit(1)).error).not.toBeNull()
  expect((await coordenacao.from('donations_cash_view').select('registered_by').limit(1)).error).not.toBeNull()
})
