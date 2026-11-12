// US-09 · Importação de pessoas a partir de planilha: leitura das colunas e
// normalização dos campos. Sem banco: o servidor e os testes usam as mesmas regras.

export const TAMANHO_MAXIMO = 900 * 1024
export const LINHAS_MAXIMAS = 2000

export type Campo = 'nome' | 'telefone' | 'email' | 'aniversario'
export type Mapa = Record<Campo, number | null>

export const ROTULOS: Record<Campo, string> = {
  nome: 'Nome',
  telefone: 'Telefone',
  email: 'E-mail',
  aniversario: 'Aniversário',
}

const semAcento = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

// Títulos de coluna que costumam aparecer em planilhas de cadastro.
const PALAVRAS: Record<Campo, string[]> = {
  nome: ['nome', 'cliente', 'doador', 'doadora', 'apoiador', 'pessoa'],
  telefone: ['telefone', 'celular', 'whatsapp', 'whats', 'fone', 'contato'],
  email: ['e-mail', 'email', 'mail'],
  aniversario: ['aniversario', 'nascimento', 'data de nascimento', 'niver'],
}

export function sugerirMapa(cabecalho: string[]): Mapa {
  const titulos = cabecalho.map((c) => semAcento(c ?? ''))
  const achar = (campo: Campo) => {
    const i = titulos.findIndex((t) => PALAVRAS[campo].some((p) => t.includes(p)))
    return i >= 0 ? i : null
  }
  return { nome: achar('nome'), telefone: achar('telefone'), email: achar('email'), aniversario: achar('aniversario') }
}

// Valor de célula como texto. Data vira AAAA-MM-DD (as datas chegam em UTC).
export function textoDaCelula(v: unknown): string {
  if (v === null || v === undefined) return ''
  if (v instanceof Date) return Number.isNaN(v.getTime()) ? '' : v.toISOString().slice(0, 10)
  return String(v).trim()
}

export function normalizarNome(v: string): string | null {
  const nome = v.replace(/\s+/g, ' ').trim()
  return nome.length >= 2 && nome.length <= 120 ? nome : null
}

// DDD assumido no celular sem DDD. Na planilha do brechó (12/11), um terço dos
// telefones vinha sem DDD, e o Instituto é de Porto Alegre.
export const DDD_PADRAO = '51'

// Celular sem DDD: 9 dígitos começando com 9.
export function celularSemDDD(v: string): boolean {
  const d = v.replace(/\D/g, '')
  return d.length === 9 && d.startsWith('9')
}

// "51 99812 3344", "+55 (51) 99812-3344" e "51998123344" viram "(51) 99812-3344".
// "99812-3344" (celular sem DDD) também, com o DDD_PADRAO.
export function normalizarTelefone(v: string): string | null {
  let d = v.replace(/\D/g, '')
  if ((d.length === 12 || d.length === 13) && d.startsWith('55')) d = d.slice(2)
  if (celularSemDDD(d)) d = DDD_PADRAO + d
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return null
}

export function normalizarEmail(v: string): string | null {
  const e = v.trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) && e.length <= 120 ? e : null
}

// O sistema guarda o aniversário como "dd/mm", sem o ano (US-22).
export function normalizarAniversario(v: string): string | null {
  const t = v.trim()
  let dia: number, mes: number
  const iso = t.match(/^(\d{4})-(\d{2})-(\d{2})/)
  const br = t.match(/^(\d{1,2})\/(\d{1,2})(?:\/\d{2,4})?$/)
  if (iso) [dia, mes] = [Number(iso[3]), Number(iso[2])]
  else if (br) [dia, mes] = [Number(br[1]), Number(br[2])]
  else return null
  if (mes < 1 || mes > 12 || dia < 1 || dia > 31) return null
  return `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}`
}

export interface PessoaDaPlanilha {
  linha: number // número da linha na planilha, contando o título como 1
  nome: string | null
  telefone: string | null
  email: string | null
  aniversario: string | null
  avisos: string[]
}

export function lerPessoas(linhas: string[][], mapa: Mapa): PessoaDaPlanilha[] {
  const celula = (l: string[], campo: Campo) => {
    const i = mapa[campo]
    return i === null ? '' : (l[i] ?? '')
  }
  return linhas.map((l, i) => {
    const avisos: string[] = []
    const nome = normalizarNome(celula(l, 'nome'))
    if (!nome) avisos.push('sem nome')
    const brutoTelefone = celula(l, 'telefone')
    const telefone = brutoTelefone ? normalizarTelefone(brutoTelefone) : null
    if (brutoTelefone && !telefone) {
      avisos.push(/\d/.test(brutoTelefone) ? 'telefone ignorado (dígitos a menos ou a mais)' : 'telefone ignorado (não é número)')
    } else if (telefone && celularSemDDD(brutoTelefone)) {
      avisos.push(`DDD ${DDD_PADRAO} assumido`)
    }
    const brutoEmail = celula(l, 'email')
    const email = brutoEmail ? normalizarEmail(brutoEmail) : null
    if (brutoEmail && !email) avisos.push('e-mail ignorado')
    const brutoAniversario = celula(l, 'aniversario')
    const aniversario = brutoAniversario ? normalizarAniversario(brutoAniversario) : null
    if (brutoAniversario && !aniversario) avisos.push('aniversário ignorado')
    return { linha: i + 2, nome, telefone, email, aniversario, avisos }
  })
}

// Chave de repetição: final do telefone ou, sem telefone, o nome sem acento.
export function chaveDeRepeticao(p: { nome: string | null; telefone: string | null }): string | null {
  const final = (p.telefone ?? '').replace(/\D/g, '').slice(-8)
  if (final.length === 8) return `t:${final}`
  return p.nome ? `n:${semAcento(p.nome)}` : null
}

// Para cada pessoa, a linha anterior da planilha com a mesma chave (ou null).
// Linha sem nome não entra, então também não conta como primeira ocorrência.
export function repetidasNaPlanilha(pessoas: PessoaDaPlanilha[]): (number | null)[] {
  const primeira = new Map<string, number>()
  return pessoas.map((p) => {
    if (!p.nome) return null
    const chave = chaveDeRepeticao(p)
    if (!chave) return null
    const antes = primeira.get(chave)
    if (antes !== undefined) return antes
    primeira.set(chave, p.linha)
    return null
  })
}
