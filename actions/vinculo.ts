'use server'

import { revalidatePath } from 'next/cache'
import { linkDonationToClient } from '@/lib/store'
import type { DoacaoSemFicha } from '@/types'

// US-14: liga uma doação sem ficha a uma pessoa. Só a coordenação consegue (US-23).
export async function ligarDoacao(
  tipo: DoacaoSemFicha['tipo'],
  id: string,
  clientId: string
): Promise<{ ok: true } | { error: string }> {
  if (tipo !== 'dinheiro' && tipo !== 'itens') return { error: 'Tipo de doação inválido.' }
  try {
    await linkDonationToClient(tipo, id, clientId)
  } catch (e) {
    console.error('ligarDoacao error:', e)
    return { error: e instanceof Error && e.message ? e.message : 'Não foi possível ligar a doação. Tente novamente.' }
  }
  revalidatePath('/doacoes/sem-ficha')
  revalidatePath('/clientes')
  return { ok: true }
}
