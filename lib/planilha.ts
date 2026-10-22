// Células da exportação em planilha (US-18), no padrão brasileiro e protegidas
// contra injeção em planilha.
import type { CellObject, Row } from 'write-excel-file/node'

// Texto que começa com =, +, -, @, tabulação ou quebra de linha pode ser lido
// como fórmula quando a planilha é aberta ou copiada para outra. O apóstrofo na
// frente faz o programa tratar o conteúdo como texto.
export function neutralizar(texto: string | null | undefined): string {
  const t = texto ?? ''
  return /^[=+\-@\t\r\n]/.test(t) ? `'${t}` : t
}

// A planilha não tem fuso: a data e a hora vão como em Brasília (UTC-3, sem
// horário de verão), como nas telas.
function emBrasilia(iso: string): Date {
  return new Date(new Date(iso).getTime() - 3 * 60 * 60 * 1000)
}

export const FORMATO_DATA = 'dd/mm/yyyy'
export const FORMATO_DATA_HORA = 'dd/mm/yyyy hh:mm'
export const FORMATO_REAIS = '"R$" #,##0.00'

export const texto = (v: string | null | undefined): CellObject => ({ value: neutralizar(v), type: String })
export const numero = (v: number | string | null | undefined): CellObject =>
  v === null || v === undefined || v === '' ? { value: '', type: String } : { value: Number(v), type: Number }
export const reais = (v: number | string | null | undefined): CellObject =>
  v === null || v === undefined || v === '' ? { value: '', type: String } : { value: Number(v), type: Number, format: FORMATO_REAIS }
export const dataHora = (iso: string): CellObject => ({ value: emBrasilia(iso), type: Date, format: FORMATO_DATA_HORA })

export const cabecalho = (nomes: string[]): Row => nomes.map((n) => ({ value: n, type: String, fontWeight: 'bold' }))