// US-05 · Atalhos da venda: o balcão recebe os atalhos e nada sobre pessoas.
import { test, expect } from '@playwright/test'
import { CAIXA, entrarNaApi } from './apoio'

test('a caixa recebe os atalhos, só com categoria, valor e vezes', async () => {
  const { api } = await entrarNaApi(CAIXA)
  const { data, error } = await api.rpc('atalhos_da_venda', { p_limite: 8 })
  expect(error).toBeNull()
  expect(data.length).toBeGreaterThan(0)
  expect(data.length).toBeLessThanOrEqual(8)
  expect(Object.keys(data[0]).sort()).toEqual(['categoria', 'valor', 'vezes'])
})

test('sem login os atalhos são recusados', async () => {
  const { api } = await entrarNaApi(CAIXA)
  await api.auth.signOut()
  expect((await api.rpc('atalhos_da_venda', { p_limite: 8 })).error).not.toBeNull()
})
