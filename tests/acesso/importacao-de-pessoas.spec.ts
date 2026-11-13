// US-09 · Só a coordenação usa a função de repetidas e o registro de importações.
import { test, expect } from '@playwright/test'
import { CAIXA, COORDENACAO, entrarNaApi, recusado } from './apoio'

test('a coordenação acha a ficha pelo telefone sem receber o telefone', async () => {
  const { api } = await entrarNaApi(COORDENACAO)
  const r = await api.rpc('pessoas_ja_cadastradas', {
    p_telefones: ['51 99812-3344', ''],
    p_nomes: ['Qualquer nome', 'Mariana Fontes'],
  })
  expect(r.error).toBeNull()
  expect(r.data).toEqual([
    expect.objectContaining({ posicao: 1, nome: 'Roberta Lima', motivo: 'telefone' }),
    expect.objectContaining({ posicao: 2, nome: 'Mariana Fontes', motivo: 'nome' }),
  ])
  expect(JSON.stringify(r.data)).not.toContain('99812')
})

test('o balcão não usa a função nem lê as importações', async () => {
  const { api } = await entrarNaApi(CAIXA)
  const r = await api.rpc('pessoas_ja_cadastradas', { p_telefones: ['51 99812-3344'], p_nomes: ['x'] })
  expect(r.error).toBeNull()
  expect(r.data).toEqual([])
  expect(recusado(await api.from('importacoes_de_pessoas').select('id'))).toBe(true)
  expect((await api.from('importacoes_de_pessoas').insert({ arquivo: 'x', importadas: 0, descartadas: 0 })).error).not.toBeNull()
})
