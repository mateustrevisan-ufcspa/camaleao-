'use server'

import { revalidatePath } from 'next/cache'
import { addCampanha, setCampanhaEncerrada, setCustoDaCampanha } from '@/lib/store'
import { AVISO_CUSTO, lerCusto } from '@/lib/custo'

const DATA = /^\d{4}-\d{2}-\d{2}$/

function revalidarTelas() {
  revalidatePath('/doacoes/campanhas')
  revalidatePath('/doacoes/dinheiro/nova')
}

export async function criarCampanha(fd: FormData): Promise<{ error: string } | void> {
  const name = ((fd.get('name') as string) || '').trim()
  const inicio = ((fd.get('starts_on') as string) || '').trim()
  const fim = ((fd.get('ends_on') as string) || '').trim()
  // US-33: a mesma leitura da edição do custo (vazio vale zero; texto inválido é recusado).
  const custo = lerCusto(fd.get('estimated_cost'))

  if (!name) return { error: 'Informe o nome da campanha.' }
  if (name.length > 80) return { error: 'Use um nome de até 80 letras.' }
  if (!DATA.test(inicio)) return { error: 'Informe a data de início.' }
  if (fim && (!DATA.test(fim) || fim < inicio)) return { error: 'O fim previsto precisa ser depois do início.' }
  if (custo === null) return { error: AVISO_CUSTO }

  try {
    await addCampanha({ name, starts_on: inicio, ends_on: fim || null, estimated_cost: custo })
  } catch (e) {
    console.error('criarCampanha error:', e)
    return { error: 'Não foi possível cadastrar a campanha. Tente novamente.' }
  }
  revalidarTelas()
}

export async function encerrarCampanha(id: string, encerrar: boolean): Promise<{ error: string } | void> {
  try {
    await setCampanhaEncerrada(id, encerrar)
  } catch (e) {
    console.error('encerrarCampanha error:', e)
    return { error: 'Não foi possível alterar a campanha. Tente novamente.' }
  }
  revalidarTelas()
}

// US-33: o custo da campanha passa a ser editável, porque só é conhecido no fim.
export async function alterarCustoDaCampanha(id: string, fd: FormData): Promise<{ error: string } | void> {
  const custo = lerCusto(fd.get('cost'))
  if (custo === null) return { error: AVISO_CUSTO }
  try {
    await setCustoDaCampanha(id, custo)
  } catch (e) {
    console.error('alterarCustoDaCampanha error:', e)
    return { error: 'Não foi possível alterar o custo. Só a coordenação altera.' }
  }
  revalidarTelas()
}