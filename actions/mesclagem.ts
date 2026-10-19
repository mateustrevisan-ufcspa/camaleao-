'use server'

import { revalidatePath } from 'next/cache'
import { mergeClients, undoMerge } from '@/lib/store'

type Resultado = { ok: true } | { error: string }

// As mensagens de recusa vêm da função do banco e já estão em português.
function mensagem(e: unknown) {
  return e instanceof Error && e.message ? e.message : 'Não foi possível concluir. Tente novamente.'
}

export async function mesclarFichas(manter: string, juntar: string): Promise<Resultado> {
  try {
    await mergeClients(manter, juntar)
  } catch (e) {
    console.error('mesclarFichas error:', e)
    return { error: mensagem(e) }
  }
  revalidatePath('/clientes')
  revalidatePath('/clientes/mesclar')
  return { ok: true }
}

export async function desfazerMesclagem(mesclagemId: string): Promise<Resultado> {
  try {
    await undoMerge(mesclagemId)
  } catch (e) {
    console.error('desfazerMesclagem error:', e)
    return { error: mensagem(e) }
  }
  revalidatePath('/clientes')
  revalidatePath('/clientes/mesclar')
  return { ok: true }
}
