// US-11 · Categorias e tampinhas: o que o balcão não pode fazer.
import { test, expect } from '@playwright/test'
import { CAIXA, entrarNaApi } from './apoio'

test('a caixa não cadastra categoria', async () => {
  const { api } = await entrarNaApi(CAIXA)
  const r = await api.from('item_categories').insert({ name: `caixa ${Date.now()}`, type: 'donation' })
  expect(r.error).not.toBeNull()
})

test('ninguém grava na tabela antiga de tampinhas', async () => {
  const { api } = await entrarNaApi(CAIXA)
  const r = await api.from('donations_caps').insert({
    donor_name: 'TESTE US-11', quantity: 1, donated_at: new Date().toISOString(),
  })
  expect(r.error).not.toBeNull()
})

test('a caixa registra doação de item sem quantidade e sem peso', async () => {
  const { api, id } = await entrarNaApi(CAIXA)
  const { data: categoria } = await api.from('item_categories').select('id, name').eq('name', 'tampinha').single()
  const r = await api.from('donations_items').insert({
    donor_name: 'TESTE US-11', category_id: categoria!.id, category_name: categoria!.name,
    donated_at: new Date().toISOString(), registered_by: id,
  })
  expect(r.error).toBeNull()
})