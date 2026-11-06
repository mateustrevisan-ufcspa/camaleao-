'use server'

import { redirect } from 'next/navigation'
import { addDonation, addDonationItem, getDonationCategory } from '@/lib/store'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { parseMoney, dateInputToISO, brTodayStr } from '@/lib/utils'
import { AVISO_ESCOLHER_DOADOR, faltaEscolherDoador } from '@/lib/doador'
import { camposPelaCategoria, lerCamposDoItem } from '@/lib/campos-do-item'
import { semTriagem } from '@/lib/triagem'
import { AVISO_VALOR_ALTO, pedeConfirmacao } from '@/lib/valor-alto'

// Id de evento vindo do formulário.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// BUG-01: data depois de hoje (em Brasília) não entra, venha do formulário ou não.
// As duas datas estão no formato AAAA-MM-DD, então a comparação de texto basta.
function dataDepoisDeHoje(formData: FormData): boolean {
  const informada = ((formData.get('donated_at') as string) || '').trim()
  return informada !== '' && informada > brTodayStr()
}

const AVISO_DATA_FUTURA = 'A data da doação não pode ser depois de hoje.'

export async function registerDonation(formData: FormData): Promise<{ error: string } | void> {
  if (faltaEscolherDoador(formData)) return { error: AVISO_ESCOLHER_DOADOR }
  if (dataDepoisDeHoje(formData)) return { error: AVISO_DATA_FUTURA }
  const donated_at = dateInputToISO(formData.get('donated_at') as string)
  const amount = parseMoney((formData.get('amount') as string) || '0')
  const donorName = ((formData.get('donor_name') as string) || '').trim()
  // Evento é opcional (US-12): sem ele, a doação segue como antes.
  const eventId = ((formData.get('event_id') as string) || '').trim()
  // Campanha também é opcional (US-13), e a doação é de um evento ou de uma campanha.
  const campaignId = ((formData.get('campaign_id') as string) || '').trim()

  if (!donorName) return { error: 'Informe o nome do doador.' }
  if (amount <= 0) return { error: 'Informe um valor maior que zero.' }
    // US-34: valor muito alto só entra com a confirmação do formulário.
  if (pedeConfirmacao(amount) && formData.get('confirmar_valor_alto') !== 'sim') return { error: AVISO_VALOR_ALTO }
  if (eventId && !UUID.test(eventId)) return { error: 'Escolha um evento da lista.' }
  if (campaignId && !UUID.test(campaignId)) return { error: 'Escolha uma campanha da lista.' }
  if (eventId && campaignId) return { error: 'A doação é de um evento ou de uma campanha, não dos dois.' }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await addDonation({
      client_id:     (formData.get('client_id') as string) || null,
      donated_at,
      donor_name:    donorName,
      // Pessoa com ficha: o telefone fica só na ficha, não é copiado para a doação (SEC-05).
      donor_phone:   formData.get('client_id') ? '' : ((formData.get('donor_phone') as string) || ''),
      amount,
      origin:        (formData.get('origin') as string) || 'PIX',
      frequency:     (formData.get('frequency') as 'monthly' | 'one_time') || 'one_time',
      notes:         (formData.get('notes') as string) || undefined,
      registered_by: user?.id ?? null,
      event_id:      eventId || null,
      campaign_id:   campaignId || null,
    })
  } catch (e) {
    console.error('registerDonation error:', e)
    return { error: 'Não foi possível registrar a doação. Tente novamente.' }
  }

  revalidatePath('/doacoes/dinheiro')
  redirect('/doacoes/dinheiro')
}

export async function registerDonationItem(formData: FormData): Promise<{ error: string } | void> {
  if (faltaEscolherDoador(formData)) return { error: AVISO_ESCOLHER_DOADOR }
  const donorName = ((formData.get('donor_name') as string) || '').trim()
  if (!donorName) return { error: 'Informe o nome do doador.' }
  const lido = lerCamposDoItem(formData)
  if ('erro' in lido) return { error: lido.erro }
  const { campos } = lido

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // O nome da categoria vem do banco, e não do navegador.
    const categoria = await getDonationCategory(campos.category_id)
    if (!categoria) return { error: 'Escolha uma categoria da lista.' }

    await addDonationItem({
      client_id:     (formData.get('client_id') as string) || null,
      donor_name:    donorName,
      // Pessoa com ficha: o telefone fica só na ficha, não é copiado para a doação (SEC-05).
      donor_phone:   formData.get('client_id') ? '' : ((formData.get('donor_phone') as string) || ''),
      // US-27: contagens da triagem, ou a quantidade da tampinha.
      ...camposPelaCategoria(campos, categoria.name, semTriagem(categoria.name)),
      category_id:   categoria.id,
      notes:         campos.notes ?? undefined,
      registered_by: user?.id ?? null,
    })
  } catch (e) {
    console.error('registerDonationItem error:', e)
    return { error: 'Não foi possível registrar a doação. Tente novamente.' }
  }

  revalidatePath('/doacoes/itens')
  redirect('/doacoes/itens')
}
