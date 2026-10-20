// US-08a · Possíveis repetidos, conferidos pela API.
import { test, expect } from '@playwright/test'
import { CAIXA, COORDENACAO, entrarNaApi } from './apoio'

type Par = { nome_a: string; nome_b: string; motivo: string; telefone_final_a: string; telefone_final_b: string }

const doPar = (pares: Par[], x: string, y: string) =>
  pares.find((p) => [p.nome_a, p.nome_b].sort().join('|') === [x, y].sort().join('|'))

test('a coordenação recebe os pares do seed, com o motivo e só o final do telefone', async () => {
  const { api } = await entrarNaApi(COORDENACAO)
  const { data, error } = await api.rpc('possiveis_repetidos', { p_limite: 100 })
  expect(error).toBeNull()
  const pares = data as Par[]

  expect(doPar(pares, 'Cláudia Berthold', 'Claudia Bertold')?.motivo).toBe('nome parecido')
  const porTelefone = doPar(pares, 'Antônia Ferreira', 'Toninha')
  expect(porTelefone?.motivo).toBe('telefone igual')
  expect(porTelefone?.telefone_final_a).toBe('8899')
  expect(JSON.stringify(pares)).not.toContain('99711')
})

test('o balcão não recebe nenhum par', async () => {
  const { api } = await entrarNaApi(CAIXA)
  const r = await api.rpc('possiveis_repetidos', { p_limite: 100 })
  expect(r.error).toBeNull()
  expect(r.data).toHaveLength(0)
})

test('sem login a função é recusada', async () => {
  const { api } = await entrarNaApi(CAIXA)
  await api.auth.signOut()
  expect((await api.rpc('possiveis_repetidos', { p_limite: 100 })).error).not.toBeNull()
})
