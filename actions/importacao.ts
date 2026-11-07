'use server'

import { revalidatePath } from 'next/cache'
import { readSheet } from 'read-excel-file/node'
import { addPessoasImportadas, addRegistroDeImportacao, getPessoasJaCadastradas, souCoordenacao } from '@/lib/store'
import {
  LINHAS_MAXIMAS,
  TAMANHO_MAXIMO,
  lerPessoas,
  normalizarAniversario,
  normalizarEmail,
  normalizarNome,
  normalizarTelefone,
  repetidasNaPlanilha,
  sugerirMapa,
  textoDaCelula,
  type Mapa,
} from '@/lib/importacao'
import type { LinhaDaPrevia } from '@/types'

const AVISO_RESTRITO = 'Só a coordenação importa pessoas.'
const COLUNAS_MAXIMAS = 26

async function lerArquivo(fd: FormData): Promise<{ erro: string } | { linhas: string[][]; arquivo: string }> {
  const arquivo = fd.get('arquivo')
  if (!(arquivo instanceof File) || arquivo.size === 0) return { erro: 'Escolha a planilha.' }
  if (!arquivo.name.toLowerCase().endsWith('.xlsx')) {
    return { erro: 'A planilha precisa estar em .xlsx. No Excel ou no Google Planilhas, salve como .xlsx.' }
  }
  if (arquivo.size > TAMANHO_MAXIMO) return { erro: 'A planilha passa de 900 KB. Divida em duas e importe uma de cada vez.' }
  try {
    // readSheet só lê os valores das células: nenhuma fórmula é executada.
    const dados = await readSheet(Buffer.from(await arquivo.arrayBuffer()))
    const linhas = dados.map((l) => l.slice(0, COLUNAS_MAXIMAS).map(textoDaCelula))
    if (linhas.length < 2) return { erro: 'A planilha está vazia ou só tem o título.' }
    if (linhas.length - 1 > LINHAS_MAXIMAS) {
      return { erro: `A planilha tem mais de ${LINHAS_MAXIMAS} linhas. Divida e importe em partes.` }
    }
    return { linhas, arquivo: arquivo.name }
  } catch (e) {
    console.error('lerArquivo error:', e)
    return { erro: 'Não foi possível ler a planilha. Confira se o arquivo é um .xlsx válido.' }
  }
}

// Passo 1: títulos, algumas linhas de amostra e a sugestão de colunas.
export async function lerPlanilha(
  fd: FormData
): Promise<{ error: string } | { cabecalho: string[]; amostra: string[][]; total: number; mapa: Mapa }> {
  if (!(await souCoordenacao())) return { error: AVISO_RESTRITO }
  const lido = await lerArquivo(fd)
  if ('erro' in lido) return { error: lido.erro }
  const [cabecalho, ...resto] = lido.linhas
  return { cabecalho, amostra: resto.slice(0, 5), total: resto.length, mapa: sugerirMapa(cabecalho) }
}

function lerMapa(fd: FormData): Mapa {
  const coluna = (nome: string) => {
    const bruto = fd.get(`coluna_${nome}`)
    if (typeof bruto !== 'string' || bruto === '') return null
    const v = Number(bruto)
    return Number.isInteger(v) && v >= 0 && v < COLUNAS_MAXIMAS ? v : null
  }
  return { nome: coluna('nome'), telefone: coluna('telefone'), email: coluna('email'), aniversario: coluna('aniversario') }
}

// Passo 2: cada linha normalizada, com a situação.
export async function prepararImportacao(fd: FormData): Promise<{ error: string } | { linhas: LinhaDaPrevia[] }> {
  if (!(await souCoordenacao())) return { error: AVISO_RESTRITO }
  const mapa = lerMapa(fd)
  if (mapa.nome === null) return { error: 'Escolha a coluna do nome.' }
  const lido = await lerArquivo(fd)
  if ('erro' in lido) return { error: lido.erro }

  const pessoas = lerPessoas(lido.linhas.slice(1), mapa)
  const repetidas = repetidasNaPlanilha(pessoas)
  try {
    const cadastradas = await getPessoasJaCadastradas(pessoas.map((p) => p.telefone), pessoas.map((p) => p.nome))
    return {
      linhas: pessoas.map((p, i): LinhaDaPrevia => {
        const repetida = repetidas[i]
        const ficha = cadastradas.get(i)
        return {
          ...p,
          situacao: !p.nome ? 'invalida' : ficha !== undefined ? 'cadastrada' : repetida !== null ? 'repetida' : 'nova',
          referencia: ficha ?? (repetida !== null ? `linha ${repetida}` : null),
        }
      }),
    }
  } catch (e) {
    console.error('prepararImportacao error:', e)
    return { error: 'Não foi possível conferir as fichas que já existem. Tente de novo.' }
  }
}

// Passo 3: grava as linhas marcadas. Tudo é conferido de novo aqui.
export async function importarPessoas(entrada: {
  arquivo: string
  total: number
  pessoas: { nome: string; telefone: string | null; email: string | null; aniversario: string | null }[]
}): Promise<{ error: string } | { importadas: number; descartadas: number }> {
  if (!(await souCoordenacao())) return { error: AVISO_RESTRITO }
  if (!Array.isArray(entrada?.pessoas) || entrada.pessoas.length > LINHAS_MAXIMAS) {
    return { error: 'Lista de pessoas inválida.' }
  }

  type Ficha = { name: string; phone: string | null; email: string | null; birthday: string | null }
  const limpas = entrada.pessoas
    .map((p) => ({
      name: normalizarNome(String(p?.nome ?? '')),
      phone: p?.telefone ? normalizarTelefone(String(p.telefone)) : null,
      email: p?.email ? normalizarEmail(String(p.email)) : null,
      birthday: p?.aniversario ? normalizarAniversario(String(p.aniversario)) : null,
    }))
    .filter((p): p is Ficha => p.name !== null)

  const total = Math.min(Math.max(Number(entrada.total) || 0, entrada.pessoas.length), LINHAS_MAXIMAS)
  let importadas: number
  try {
    // Quem já tem ficha não entra, mesmo que o navegador mande.
    const cadastradas = await getPessoasJaCadastradas(limpas.map((p) => p.phone), limpas.map((p) => p.name))
    const novas = limpas.filter((_, i) => !cadastradas.has(i))
    // Um insert só: se falhar, nenhuma ficha foi criada.
    importadas = novas.length > 0 ? await addPessoasImportadas(novas) : 0
  } catch (e) {
    console.error('importarPessoas error:', e)
    return { error: 'Não foi possível gravar a importação. Nenhuma ficha foi criada; tente de novo.' }
  }

  const descartadas = total - importadas
  revalidatePath('/clientes')
  try {
    await addRegistroDeImportacao(String(entrada.arquivo ?? ''), importadas, descartadas)
  } catch (e) {
    // As fichas já entraram: avisar, e não sugerir importar de novo.
    console.error('addRegistroDeImportacao error:', e)
    return { error: `${importadas} fichas foram criadas, mas o registro da importação falhou. Não importe de novo; avise a equipe.` }
  }
  return { importadas, descartadas }
}
