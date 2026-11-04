import { parseMoney } from '@/lib/utils'

// US-33 · Custo digitado pela coordenação ("150", "1.234,50", "R$ 80"). Vazio vale zero.
// Devolve null quando não é um valor de zero para cima.
export function lerCusto(valor: FormDataEntryValue | null): number | null {
  const digitado = typeof valor === 'string' ? valor.trim() : ''
  if (!digitado) return 0
  // O parseMoney lê "abc" como zero; aqui só passam algarismos, ponto e vírgula.
  const numeros = digitado.replace(/^R\$/i, '').replace(/\s/g, '')
  if (!/^[\d.,]+$/.test(numeros) || !/\d/.test(numeros)) return null
  const custo = parseMoney(numeros)
  return Number.isFinite(custo) && custo >= 0 && custo <= 10_000_000 ? Math.round(custo * 100) / 100 : null
}

export const AVISO_CUSTO = 'O custo precisa ser zero ou mais.'
