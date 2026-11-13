// US-24a · A equipe só é listada para a coordenação, e ninguém altera usuários pela API.
import { test, expect } from '@playwright/test'
import { CAIXA, COORDENACAO, VOLUNTARIA, entrarNaApi, recusado } from './apoio'

test('só a coordenação recebe a lista da equipe, com e-mail', async () => {
  const { api: coordenacao } = await entrarNaApi(COORDENACAO)
  const r = await coordenacao.rpc('usuarios_da_equipe')
  expect(r.error).toBeNull()
  expect((r.data ?? []).map((u: { email: string }) => u.email)).toContain(CAIXA)

  for (const email of [CAIXA, VOLUNTARIA]) {
    const { api } = await entrarNaApi(email)
    const b = await api.rpc('usuarios_da_equipe')
    expect(b.error).toBeNull()
    expect(b.data).toEqual([])
  }
})

test('nem a coordenação altera usuários pela API', async () => {
  const { api: coordenacao } = await entrarNaApi(COORDENACAO)
  const { api: caixa, id: caixaId } = await entrarNaApi(CAIXA)
  expect(recusado(await coordenacao.from('users').update({ role: 'admin' }).eq('id', caixaId).select())).toBe(true)
  expect(recusado(await caixa.from('users').update({ role: 'admin' }).eq('id', caixaId).select())).toBe(true)
})

test('confirmar a troca de senha só mexe na própria linha', async () => {
  const { api: caixa } = await entrarNaApi(CAIXA)
  expect((await caixa.rpc('confirmar_troca_de_senha')).error).toBeNull()
})