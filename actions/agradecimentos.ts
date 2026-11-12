'use server'

import { revalidatePath } from 'next/cache'
import { addAgradecimento, addAprovacaoDoTermo, souCoordenacao } from '@/lib/store'
import { TERMO_MENSAGENS } from '@/lib/termo-mensagens'
import { brTodayStr } from '@/lib/utils'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PERIODO = /^\d{4}(-(0[1-9]|1[0-2]))?$/

export async function registrarAgradecimento(clientId: string, periodo: string, canal: string): Promise<{ error: string } | void> {
  if (!(await souCoordenacao())) return { error: 'Só a coordenação registra agradecimentos.' }
  if (!UUID.test(clientId) || !PERIODO.test(periodo) || (canal !== 'whatsapp' && canal !== 'email')) {
    return { error: 'Agradecimento inválido.' }
  }
  try {
    await addAgradecimento(clientId, periodo, canal)
  } catch (e) {
    const codigo = (e as { code?: string }).code
    if (codigo === '23505') return { error: 'Esta pessoa já foi agradecida neste período.' }
    if (codigo === '42501') return { error: 'Esta pessoa não autorizou mensagens com um termo aprovado pelo Instituto.' }
    console.error('registrarAgradecimento error:', e)
    return { error: 'Não foi possível registrar o agradecimento. Tente novamente.' }
  }
  revalidatePath('/clientes/agradecimentos')
}

// A coordenação registra que o Instituto aprovou a versão atual do termo.
export async function registrarAprovacaoDoTermo(fd: FormData): Promise<{ error: string } | void> {
  if (!(await souCoordenacao())) return { error: 'Só a coordenação registra a aprovação.' }
  const data = ((fd.get('aprovado_em') as string) || '').trim()
  const observacao = ((fd.get('observacao') as string) || '').trim().slice(0, 300) || null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || data > brTodayStr()) return { error: 'Informe a data da aprovação, até hoje.' }
  try {
    await addAprovacaoDoTermo(TERMO_MENSAGENS.versao, data, observacao)
  } catch (e) {
    if ((e as { code?: string }).code === '23505') return { error: 'Esta versão do termo já tem aprovação registrada.' }
    console.error('registrarAprovacaoDoTermo error:', e)
    return { error: 'Não foi possível registrar a aprovação.' }
  }
  revalidatePath('/clientes/agradecimentos')
}
