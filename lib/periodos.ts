// US-41 · Períodos do agradecimento: mês (AAAA-MM), semana ISO (AAAA-Snn, de
// segunda a domingo) e ano (AAAA). Datas em texto AAAA-MM-DD, no dia de São Paulo.

export type TipoDeAgradecimento = 'mensal' | 'semanal' | 'anual'

export const FORMATO: Record<TipoDeAgradecimento, RegExp> = {
  mensal: /^\d{4}-(0[1-9]|1[0-2])$/,
  semanal: /^\d{4}-S(0[1-9]|[1-4]\d|5[0-3])$/,
  anual: /^\d{4}$/,
}

const NOMES_DOS_MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

function utc(dia: string): Date {
  const [y, m, d] = dia.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

const texto = (d: Date) => d.toISOString().slice(0, 10)

export function somarDias(dia: string, n: number): string {
  const d = utc(dia)
  d.setUTCDate(d.getUTCDate() + n)
  return texto(d)
}

// Semana ISO de um dia: a semana é do ano da sua quinta-feira.
export function semanaDe(dia: string): string {
  const t = utc(dia)
  t.setUTCDate(t.getUTCDate() + 4 - (t.getUTCDay() || 7))
  const ano = t.getUTCFullYear()
  const semana = Math.ceil(((t.getTime() - Date.UTC(ano, 0, 1)) / 86400000 + 1) / 7)
  return `${ano}-S${String(semana).padStart(2, '0')}`
}

// Segunda-feira de uma semana ISO: a semana 1 é a que tem o dia 4 de janeiro.
export function segundaDaSemana(periodo: string): string {
  const ano = Number(periodo.slice(0, 4))
  const semana = Number(periodo.slice(6))
  const jan4 = new Date(Date.UTC(ano, 0, 4))
  const segunda = new Date(jan4)
  segunda.setUTCDate(5 - (jan4.getUTCDay() || 7) + (semana - 1) * 7)
  return texto(segunda)
}

export function outroPeriodo(tipo: TipoDeAgradecimento, periodo: string, passo: number): string {
  if (tipo === 'anual') return String(Number(periodo) + passo)
  if (tipo === 'semanal') return semanaDe(somarDias(segundaDaSemana(periodo), 7 * passo))
  const [ano, mes] = periodo.split('-').map(Number)
  const d = new Date(Date.UTC(ano, mes - 1 + passo, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

// Onde cada aba abre: mês anterior, semana anterior e ano atual.
export function periodoPadrao(tipo: TipoDeAgradecimento, hoje: string): string {
  if (tipo === 'anual') return hoje.slice(0, 4)
  if (tipo === 'semanal') return semanaDe(somarDias(hoje, -7))
  return outroPeriodo('mensal', hoje.slice(0, 7), -1)
}

export function nomeDoPeriodo(tipo: TipoDeAgradecimento, periodo: string): string {
  if (tipo === 'anual') return periodo
  if (tipo === 'mensal') {
    const [ano, mes] = periodo.split('-').map(Number)
    return `${NOMES_DOS_MESES[mes - 1]} de ${ano}`
  }
  const inicio = segundaDaSemana(periodo)
  const fim = somarDias(inicio, 6)
  const br = (d: string) => d.split('-').reverse().slice(0, 2).join('/')
  return `semana de ${br(inicio)} a ${br(fim)}/${fim.slice(0, 4)}`
}
