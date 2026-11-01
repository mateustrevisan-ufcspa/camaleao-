'use server'

import { revalidatePath } from 'next/cache'
import { addEvento, setCustoDoEvento, setEventoAtivo } from '@/lib/store'
import { AVISO_CUSTO, lerCusto } from '@/lib/custo'

const DATA = /^\d{4}-\d{2}-\d{2}$/

function revalidarTelas() {
  revalidatePath('/doacoes/eventos')
  revalidatePath('/doacoes/dinheiro/nova')
}

export async function criarEvento(fd: FormData): Promise<{ error: string } | void> {
  const name = ((fd.get('name') as string) || '').trim()
  const date = ((fd.get('event_date') as string) || '').trim()
  const custo = lerCusto(fd.get('cost'))
  if (!name) return { error: 'Informe o nome do evento.' }
  if (name.length > 80) return { error: 'Use um nome de até 80 letras.' }
  if (!DATA.test(date)) return { error: 'Informe a data do evento.' }
  if (custo === null) return { error: AVISO_CUSTO }
  try {
    await addEvento(name, date, custo)
  } catch (e) {
    console.error('criarEvento error:', e)
    return { error: 'Não foi possível cadastrar o evento. Tente novamente.' }
  }
  revalidarTelas()
}

export async function alternarEvento(id: string, ativo: boolean): Promise<{ error: string } | void> {
  try {
    await setEventoAtivo(id, ativo)
  } catch (e) {
    console.error('alternarEvento error:', e)
    return { error: 'Não foi possível alterar o evento. Tente novamente.' }
  }
  revalidarTelas()
}

// US-33: o custo é informado quando fica conhecido, em geral no fim do evento.
export async function alterarCustoDoEvento(id: string, fd: FormData): Promise<{ error: string } | void> {
  const custo = lerCusto(fd.get('cost'))
  if (custo === null) return { error: AVISO_CUSTO }
  try {
    await setCustoDoEvento(id, custo)
  } catch (e) {
    console.error('alterarCustoDoEvento error:', e)
    return { error: 'Não foi possível alterar o custo. Só a coordenação altera.' }
  }
  revalidarTelas()
}