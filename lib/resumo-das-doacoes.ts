import type { DonationCash } from '@/types'

// BUG-02 · Os três cartões da tela Doações · Dinheiro, só com as doações do mês
// corrente em Brasília. O "Total recebido · mês" já era assim desde a US-17.
export interface ResumoDoMes {
  total: number
  recorrente: number
  doadores: number
}

type DoacaoParaResumo = Pick<DonationCash, 'client_id' | 'donated_at' | 'amount' | 'frequency'>

const centavos = (n: number) => Math.round(n * 100) / 100

export function resumoDoMes(doacoes: DoacaoParaResumo[], inicioDoMes: Date): ResumoDoMes {
  const doMes = doacoes.filter((d) => new Date(d.donated_at) >= inicioDoMes)
  const soma = (lista: DoacaoParaResumo[]) => centavos(lista.reduce((s, d) => s + Number(d.amount), 0))

  // Pessoas diferentes: a mesma ficha conta uma vez. Doação sem ficha não tem como
  // ser reconhecida como da mesma pessoa, então cada uma conta como uma.
  const fichas = new Set(doMes.filter((d) => d.client_id).map((d) => d.client_id))
  const semFicha = doMes.filter((d) => !d.client_id).length

  return {
    total: soma(doMes),
    recorrente: soma(doMes.filter((d) => d.frequency === 'monthly')),
    doadores: fichas.size + semFicha,
  }
}
