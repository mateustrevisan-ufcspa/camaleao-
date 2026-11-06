import { expect, test } from '@playwright/test'
import { somasPorDia, somasPorSemana, totalDe } from '../../lib/vendas-por-periodo'
import { entrar, valorUnico } from './apoio'

// US-30 · Somas de vendas por dia e por semana (semana começando na segunda).
const venda = (sold_at: string, amount: number, net_amount: number | null = amount) => ({ sold_at, amount, net_amount })

test.describe('Fumaça: vendas por dia e por semana', () => {
  test('venda às 23h30 de domingo em Brasília fica no domingo e na semana do domingo', () => {
    // 01/11/2026 é domingo. 23h30 em Brasília é 02h30 de segunda em UTC.
    const vendas = [venda('2026-11-02T02:30:00.000Z', 50), venda('2026-11-02T15:00:00.000Z', 30)]

    const porDia = somasPorDia(vendas)
    expect(porDia.map((d) => [d.inicio, d.bruto])).toEqual([['2026-11-01', 50], ['2026-11-02', 30]])

    // Com a semana começando na segunda, o domingo 01/11 é uma semana só dele,
    // cortada no início do mês; a segunda 02/11 abre a semana seguinte.
    const semanas = somasPorSemana(vendas, 2026, 11)
    expect(semanas[0]).toMatchObject({ inicio: '2026-11-01', fim: '2026-11-01', vendas: 1, bruto: 50 })
    expect(semanas[1]).toMatchObject({ inicio: '2026-11-02', fim: '2026-11-08', vendas: 1, bruto: 30 })
  })

  test('as semanas cobrem o mês inteiro e somam o total do mês', () => {
    const vendas = [
      venda('2026-11-01T15:00:00.000Z', 10),
      venda('2026-11-15T15:00:00.000Z', 20, 19.5),
      venda('2026-11-30T23:00:00.000Z', 30, null), // sem taxa cadastrada: líquido pelo bruto
      venda('2026-12-01T03:30:00.000Z', 99), // 01/12 0h30 em Brasília: fora de novembro
    ]
    const semanas = somasPorSemana(vendas, 2026, 11)
    expect(semanas[0].inicio).toBe('2026-11-01')
    expect(semanas[semanas.length - 1].fim).toBe('2026-11-30')

    const total = totalDe(semanas)
    expect(total).toMatchObject({ vendas: 3, bruto: 60, liquido: 59.5, semLiquido: 1 })
  })

  test('a tela mostra a venda de hoje e o total igual ao do relatório consolidado', async ({ page }) => {
    const valor = valorUnico(60)
    await entrar(page)

    await page.goto('/brecho/nova-venda')
    await page.getByPlaceholder('Categoria (saia, blusa, vestido...)').first().fill('saia')
    await page.getByPlaceholder('0,00').first().fill(valor.digitado)
    await page.getByRole('button', { name: 'Registrar venda' }).click()
    await expect(page).toHaveURL(/\/brecho\?venda=/)

    await page.goto('/relatorios')
    const consolidado = (await page.getByTestId('relatorio-vendas').textContent())?.trim()

    await page.goto('/relatorios/vendas')
    await expect(page.getByTestId('total-do-mes')).toHaveText(consolidado!)
    await expect(page.getByTestId('vendas-por-dia').getByRole('row').last()).toBeVisible()
  })
})
