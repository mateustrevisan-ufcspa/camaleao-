import { dataDeBrasilia } from './utils'

// US-30 · Somas de vendas por dia e por semana, no horário de Brasília.

// Dia em que a semana começa: 0 = domingo, 1 = segunda. Segunda-feira, como na
// planilha do brechó (resposta da Nílian, coordenação, 03/11).
export const INICIO_DA_SEMANA: 0 | 1 = 1

export interface VendaParaSoma {
  sold_at: string
  amount: number
  // Sem taxa cadastrada (US-32), o líquido fica vazio e a soma usa o bruto.
  net_amount: number | null
}

export interface SomaDoPeriodo {
  inicio: string // AAAA-MM-DD, em Brasília
  fim: string
  vendas: number
  bruto: number
  liquido: number
  semLiquido: number
}

const centavos = (n: number) => Math.round(n * 100) / 100

function partes(dia: string): [number, number, number] {
  const [a, m, d] = dia.split('-').map(Number)
  return [a, m, d]
}

// Soma dias a uma data AAAA-MM-DD, sem fuso no meio.
export function somarDias(dia: string, n: number): string {
  const [a, m, d] = partes(dia)
  return new Date(Date.UTC(a, m - 1, d + n)).toISOString().slice(0, 10)
}

function diaDaSemana(dia: string): number {
  const [a, m, d] = partes(dia)
  return new Date(Date.UTC(a, m - 1, d)).getUTCDay()
}

export function inicioDaSemana(dia: string): string {
  return somarDias(dia, -((diaDaSemana(dia) - INICIO_DA_SEMANA + 7) % 7))
}

const vazia = (inicio: string, fim: string): SomaDoPeriodo => ({ inicio, fim, vendas: 0, bruto: 0, liquido: 0, semLiquido: 0 })

function somar(s: SomaDoPeriodo, v: VendaParaSoma) {
  s.vendas += 1
  s.bruto += Number(v.amount)
  s.liquido += Number(v.net_amount ?? v.amount)
  if (v.net_amount === null) s.semLiquido += 1
}

const arredondar = (s: SomaDoPeriodo): SomaDoPeriodo => ({ ...s, bruto: centavos(s.bruto), liquido: centavos(s.liquido) })

// Um item por dia com venda, em ordem.
export function somasPorDia(vendas: VendaParaSoma[]): SomaDoPeriodo[] {
  const porDia = new Map<string, SomaDoPeriodo>()
  for (const v of vendas) {
    const dia = dataDeBrasilia(v.sold_at)
    const s = porDia.get(dia) ?? vazia(dia, dia)
    somar(s, v)
    porDia.set(dia, s)
  }
  return [...porDia.values()].sort((a, b) => a.inicio.localeCompare(b.inicio)).map(arredondar)
}

// Todas as semanas que tocam o mês, cortadas no primeiro e no último dia do mês,
// inclusive as sem venda: assim a soma das semanas é o total do mês.
export function somasPorSemana(vendas: VendaParaSoma[], ano: number, mes: number): SomaDoPeriodo[] {
  const primeiro = `${ano}-${String(mes).padStart(2, '0')}-01`
  const ultimo = somarDias(`${mes === 12 ? ano + 1 : ano}-${String(mes === 12 ? 1 : mes + 1).padStart(2, '0')}-01`, -1)

  const semanas: SomaDoPeriodo[] = []
  for (let inicio = inicioDaSemana(primeiro); inicio <= ultimo; inicio = somarDias(inicio, 7)) {
    const fim = somarDias(inicio, 6)
    semanas.push(vazia(inicio < primeiro ? primeiro : inicio, fim > ultimo ? ultimo : fim))
  }

  for (const v of vendas) {
    const dia = dataDeBrasilia(v.sold_at)
    const semana = semanas.find((s) => s.inicio <= dia && dia <= s.fim)
    if (semana) somar(semana, v) // venda fora do mês não entra
  }
  return semanas.map(arredondar)
}

export function totalDe(somas: SomaDoPeriodo[]): { vendas: number; bruto: number; liquido: number; semLiquido: number } {
  return {
    vendas: somas.reduce((t, s) => t + s.vendas, 0),
    bruto: centavos(somas.reduce((t, s) => t + s.bruto, 0)),
    liquido: centavos(somas.reduce((t, s) => t + s.liquido, 0)),
    semLiquido: somas.reduce((t, s) => t + s.semLiquido, 0),
  }
}
