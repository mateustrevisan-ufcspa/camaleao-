'use server'

import { revalidatePath } from 'next/cache'
import { addEvento, setEventoAtivo } from '@/lib/store'

const DATA = /^\d{4}-\d{2}-\d{2}$/

function revalidarTelas() {
  revalidatePath('/doacoes/eventos')
  revalidatePath('/doacoes/dinheiro/nova')
}

export async function criarEvento(fd: FormData): Promise<{ error: string } | void> {
  const name = ((fd.get('name') as string) || '').trim()
  const date = ((fd.get('event_date') as string) || '').trim()
  if (!name) return { error: 'Informe o nome do evento.' }
  if (name.length > 80) return { error: 'Use um nome de até 80 letras.' }
  if (!DATA.test(date)) return { error: 'Informe a data do evento.' }
  try {
    await addEvento(name, date)
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