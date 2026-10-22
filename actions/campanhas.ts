'use server'

import { revalidatePath } from 'next/cache'
import { addCampanha, setCampanhaEncerrada } from '@/lib/store'
import { parseMoney } from '@/lib/utils'

const DATA = /^\d{4}-\d{2}-\d{2}$/

function revalidarTelas() {
  revalidatePath('/doacoes/campanhas')
  revalidatePath('/doacoes/dinheiro/nova')
}

export async function criarCampanha(fd: FormData): Promise<{ error: string } | void> {
  const name = ((fd.get('name') as string) || '').trim()
  const inicio = ((fd.get('starts_on') as string) || '').trim()
  const fim = ((fd.get('ends_on') as string) || '').trim()
  const custoDigitado = ((fd.get('estimated_cost') as string) || '').trim()
  const custo = custoDigitado ? parseMoney(custoDigitado) : 0

  if (!name) return { error: 'Informe o nome da campanha.' }
  if (name.length > 80) return { error: 'Use um nome de até 80 letras.' }
  if (!DATA.test(inicio)) return { error: 'Informe a data de início.' }
  if (fim && (!DATA.test(fim) || fim < inicio)) return { error: 'O fim previsto precisa ser depois do início.' }
  if (!Number.isFinite(custo) || custo < 0) return { error: 'O custo estimado precisa ser zero ou mais.' }

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