'use server'

import { revalidatePath } from 'next/cache'
import { addValorDoAtendimento } from '@/lib/store'
import { parseMoney } from '@/lib/utils'

// US-19 · A coordenação altera o valor de um atendimento. O banco recusa quem não
// é coordenação (política "coordenacao define") e preenche quem e quando.
export async function definirValorDoAtendimento(fd: FormData): Promise<{ error: string } | void> {
  const digitado = ((fd.get('valor') as string) || '').trim()
  const valor = Math.round(parseMoney(digitado) * 100) / 100

  if (!digitado || !Number.isFinite(valor) || valor <= 0) return { error: 'Informe um valor maior que zero.' }
  if (valor > 100000) return { error: 'Confira o valor: ele passa de R$ 100.000,00.' }

  try {
    await addValorDoAtendimento(valor)
  } catch (e) {
    console.error('definirValorDoAtendimento error:', e)
    return { error: 'Não foi possível alterar o valor. Só a coordenação altera o valor do atendimento.' }
  }
  revalidatePath('/relatorios/atendimento')
  revalidatePath('/relatorios')
}