'use server'

import { revalidatePath } from 'next/cache'
import { addAgradecimento, addAprovacaoDoTermo, souCaixaOuCoordenacao, souCoordenacao } from '@/lib/store'
import { ASSUNTO_DO_AGRADECIMENTO, linkDoEmail, linkDoWhatsApp } from '@/lib/mensagens'
import { TERMO_MENSAGENS } from '@/lib/termo-mensagens'
import { brTodayStr } from '@/lib/utils'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PERIODO = /^\d{4}(-(0[1-9]|1[0-2]))?$/

// US-39 · Caixa e coordenação. O banco registra e devolve o contato; o link é montado aqui.
export async function registrarAgradecimento(
  clientId: string, periodo: string, canal: string, texto: string
): Promise<{ error: string } | { link: string }> {
  if (!(await souCaixaOuCoordenacao())) return { error: 'Só o caixa e a coordenação enviam agradecimentos.' }
  const mensagem = String(texto ?? '').trim().slice(0, 1500)
  if (!UUID.test(clientId) || !PERIODO.test(periodo) || (canal !== 'whatsapp' && canal !== 'email') || !mensagem) {
    return { error: 'Agradecimento inválido.' }
  }
  let contato: string
  try {
    contato = await addAgradecimento(clientId, periodo, canal)
  } catch (e) {
    const codigo = (e as { code?: string }).code
    if (codigo === '23505') return { error: 'Esta pessoa já foi agradecida neste período.' }
    if (codigo === '42501') return { error: 'Esta pessoa não autorizou mensagens com um termo aprovado pelo Instituto.' }
    if (codigo === '22023') return { error: 'Não deu para agradecer: confira o contato na ficha e se a pessoa contribuiu neste período.' }
    console.error('registrarAgradecimento error:', e)
    return { error: 'Não foi possível registrar o agradecimento. Tente novamente.' }
  }
  const link = canal === 'whatsapp' ? linkDoWhatsApp(contato, mensagem) : linkDoEmail(contato, ASSUNTO_DO_AGRADECIMENTO, mensagem)
  revalidatePath('/clientes/agradecimentos')
  // O banco já conferiu o contato; sem link aqui, só se a regra de lá e a de lib/mensagens divergirem.
  return link ? { link } : { error: 'Agradecimento registrado, mas o contato não serve para este canal. Confira a ficha.' }
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
