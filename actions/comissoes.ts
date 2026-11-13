'use server'

import { revalidatePath } from 'next/cache'
import {
  addCaptador,
  addPercentualDeComissao,
  removeMarcacaoDeComissao,
  setCaptadorAtivo,
  setMarcacaoDeComissao,
  souCoordenacao,
} from '@/lib/store'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const AVISO_RESTRITO = 'Só a coordenação lança comissões.'
const SEM_COMISSAO = 'sem'

function atualizar() {
  revalidatePath('/relatorios/comissoes')
  revalidatePath('/relatorios')
}

export async function cadastrarCaptador(fd: FormData): Promise<{ error: string } | void> {
  if (!(await souCoordenacao())) return { error: AVISO_RESTRITO }
  const nome = ((fd.get('nome') as string) || '').replace(/\s+/g, ' ').trim()
  if (nome.length < 2 || nome.length > 80) return { error: 'Informe o nome de quem capta.' }
  try {
    await addCaptador(nome)
  } catch (e) {
    if ((e as { code?: string }).code === '23505') return { error: 'Já existe alguém com este nome.' }
    console.error('cadastrarCaptador error:', e)
    return { error: 'Não foi possível cadastrar.' }
  }
  atualizar()
}

export async function alterarCaptador(id: string, ativo: boolean): Promise<{ error: string } | void> {
  if (!(await souCoordenacao())) return { error: AVISO_RESTRITO }
  if (!UUID.test(id)) return { error: 'Pessoa não encontrada.' }
  try {
    await setCaptadorAtivo(id, ativo)
  } catch (e) {
    console.error('alterarCaptador error:', e)
    return { error: 'Não foi possível alterar.' }
  }
  atualizar()
}

export async function definirPercentualDeComissao(fd: FormData): Promise<{ error: string } | void> {
  if (!(await souCoordenacao())) return { error: AVISO_RESTRITO }
  const digitado = ((fd.get('percentual') as string) || '').replace('%', '').trim()
  // Só número de verdade, com até duas casas: "25", "25,5", "12.75".
  const percentual = /^\d{1,3}([.,]\d{1,2})?$/.test(digitado) ? Number(digitado.replace(',', '.')) : NaN
  if (!Number.isFinite(percentual) || percentual < 0 || percentual > 100) return { error: 'Informe um percentual de 0 a 100 (por exemplo, 25).' }
  try {
    await addPercentualDeComissao(Math.round(percentual * 100) / 100)
  } catch (e) {
    console.error('definirPercentualDeComissao error:', e)
    return { error: 'Não foi possível alterar o percentual.' }
  }
  atualizar()
}

// No formulário, "captador_id" é o id de quem captou ou "sem" (sem comissão).
export async function marcarComissao(donationId: string, fd: FormData): Promise<{ error: string } | void> {
  if (!(await souCoordenacao())) return { error: AVISO_RESTRITO }
  if (!UUID.test(donationId)) return { error: 'Doação não encontrada.' }
  const escolha = ((fd.get('captador_id') as string) || '').trim()
  if (escolha !== SEM_COMISSAO && !UUID.test(escolha)) return { error: 'Escolha quem captou ou "Sem comissão".' }
  try {
    await setMarcacaoDeComissao(donationId, escolha === SEM_COMISSAO ? null : escolha)
  } catch (e) {
    console.error('marcarComissao error:', e)
    return { error: 'Não foi possível salvar a comissão.' }
  }
  atualizar()
}

export async function desmarcarComissao(donationId: string): Promise<{ error: string } | void> {
  if (!(await souCoordenacao())) return { error: AVISO_RESTRITO }
  if (!UUID.test(donationId)) return { error: 'Doação não encontrada.' }
  try {
    await removeMarcacaoDeComissao(donationId)
  } catch (e) {
    console.error('desmarcarComissao error:', e)
    return { error: 'Não foi possível desmarcar.' }
  }
  atualizar()
}
