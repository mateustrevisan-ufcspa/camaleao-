// US-06 · Busca de pessoa: o que a busca devolve, conferido pela API como caixa.
import { test, expect } from '@playwright/test'
import { CAIXA, entrarNaApi } from './apoio'

test('a busca acha pelo telefone inteiro e não devolve o telefone inteiro', async () => {
  const { api } = await entrarNaApi(CAIXA)
  // Roberta Lima vem do seed, com o telefone (51) 99812-3344.
  const { data, error } = await api.rpc('buscar_pessoas', { p_termo: '51998123344' })
  expect(error).toBeNull()
  expect(data).toHaveLength(1)
  expect(Object.keys(data[0]).sort()).toEqual(['id', 'ja_comprou', 'ja_doou', 'name', 'nickname', 'phone_final', 'tags'])
  expect(data[0]).toMatchObject({ name: 'Roberta Lima', phone_final: '3344', ja_comprou: true, ja_doou: true })
  expect(JSON.stringify(data)).not.toContain('99812')
})

test('menos de 4 dígitos não busca por telefone e 1 letra não busca nada', async () => {
  const { api } = await entrarNaApi(CAIXA)
  expect((await api.rpc('buscar_pessoas', { p_termo: '334' })).data).toHaveLength(0)
  expect((await api.rpc('buscar_pessoas', { p_termo: 'a' })).data).toHaveLength(0)
})

test('sem login a busca é recusada', async () => {
  const { api } = await entrarNaApi(CAIXA)
  await api.auth.signOut()
  expect((await api.rpc('buscar_pessoas', { p_termo: 'roberta' })).error).not.toBeNull()
})
