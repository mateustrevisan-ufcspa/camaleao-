import { expect, test } from '@playwright/test'
import { resumoDoMes } from '../../lib/resumo-das-doacoes'

// BUG-02 · Cartões da tela Doações · Dinheiro.
const INICIO_DE_OUTUBRO = new Date('2026-10-01T03:00:00.000Z') // 0h de 01/10 em Brasília

const doacao = (extra: { client_id?: string | null; donated_at: string; amount: number; frequency?: 'monthly' | 'one_time' }) => ({
  client_id: null,
  frequency: 'one_time' as const,
  ...extra,
})

test('os cartões olham só o mês e contam pessoas, e não doações', () => {
  const resumo = resumoDoMes(
    [
      doacao({ client_id: 'ana', donated_at: '2026-10-05T15:00:00.000Z', amount: 50, frequency: 'monthly' }),
      doacao({ client_id: 'ana', donated_at: '2026-10-20T15:00:00.000Z', amount: 30 }),
      doacao({ client_id: 'bia', donated_at: '2026-10-21T15:00:00.000Z', amount: 100, frequency: 'monthly' }),
      doacao({ donated_at: '2026-10-22T15:00:00.000Z', amount: 20 }), // sem ficha
      doacao({ donated_at: '2026-10-23T15:00:00.000Z', amount: 20 }), // outra sem ficha
      doacao({ client_id: 'ana', donated_at: '2026-09-30T15:00:00.000Z', amount: 999, frequency: 'monthly' }), // setembro
    ],
    INICIO_DE_OUTUBRO,
  )
  expect(resumo).toEqual({ total: 220, recorrente: 150, doadores: 4 })
})

test('a virada do mês segue Brasília: 23h59 de 30/09 ainda é setembro', () => {
  const resumo = resumoDoMes(
    [doacao({ client_id: 'ana', donated_at: '2026-10-01T02:59:00.000Z', amount: 10, frequency: 'monthly' })],
    INICIO_DE_OUTUBRO,
  )
  expect(resumo).toEqual({ total: 0, recorrente: 0, doadores: 0 })
})

test('sem doações no mês, tudo zero', () => {
  expect(resumoDoMes([], INICIO_DE_OUTUBRO)).toEqual({ total: 0, recorrente: 0, doadores: 0 })
})
