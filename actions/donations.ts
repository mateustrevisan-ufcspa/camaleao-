'use server'

import { redirect } from 'next/navigation'
import { addDonation, addDonationItem, getDonationCategory } from '@/lib/store'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { parseMoney, dateInputToISO } from '@/lib/utils'
import { AVISO_ESCOLHER_DOADOR, faltaEscolherDoador } from '@/lib/doador'

// Id de evento vindo do formulário.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function registerDonation(formData: FormData): Promise<{ error: string } | void> {
  if (faltaEscolherDoador(formData)) return { error: AVISO_ESCOLHER_DOADOR }
  const donated_at = dateInputToISO(formData.get('donated_at') as string)
  const amount = parseMoney((formData.get('amount') as string) || '0')
  const donorName = ((formData.get('donor_name') as string) || '').trim()
  // Evento é opcional (US-12): sem ele, a doação segue como antes.
  const eventId = ((formData.get('event_id') as string) || '').trim()
  // Campanha também é opcional (US-13), e a doação é de um evento ou de uma campanha.
  const campaignId = ((formData.get('campaign_id') as string) || '').trim()

  if (!donorName) return { error: 'Informe o nome do doador.' }
  if (amount <= 0) return { error: 'Informe um valor maior que zero.' }
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
  const donated_at = dateInputToISO(formData.get('donated_at') as string)
  const donorName = ((formData.get('donor_name') as string) || '').trim()
  const categoryId = ((formData.get('category_id') as string) || '').trim()
  const qRaw = ((formData.get('quantity') as string) || '').trim()
  const wRaw = ((formData.get('weight_kg') as string) || '').trim()
  const quantity = qRaw ? parseInt(qRaw, 10) : null
  const weight_kg = wRaw ? parseMoney(wRaw) : null
  const condition = formData.get('condition')
  const destination = formData.get('destination')

  if (!donorName) return { error: 'Informe o nome do doador.' }
  if (!categoryId) return { error: 'Escolha a categoria do item.' }
  // Quantidade e peso são opcionais (US-11); se vierem, precisam fazer sentido.
  if (quantity !== null && (!Number.isFinite(quantity) || quantity <= 0)) {
    return { error: 'A quantidade, se informada, precisa ser maior que zero.' }
  }
  if (weight_kg !== null && (!Number.isFinite(weight_kg) || weight_kg <= 0)) {
    return { error: 'O peso, se informado, precisa ser maior que zero.' }
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // O nome da categoria vem do banco, e não do navegador.
    const categoria = await getDonationCategory(categoryId)
    if (!categoria) return { error: 'Escolha uma categoria da lista.' }

    await addDonationItem({
      client_id:     (formData.get('client_id') as string) || null,
      donor_name:    donorName,
      // Pessoa com ficha: o telefone fica só na ficha, não é copiado para a doação (SEC-05).
      donor_phone:   formData.get('client_id') ? '' : ((formData.get('donor_phone') as string) || ''),
      category_id:   categoria.id,
      category_name: categoria.name,
      quantity,
      weight_kg,
      condition:     condition === 'good' || condition === 'needs_review' ? condition : null,
      destination:   destination === 'stock' || destination === 'direct' ? destination : null,
      notes:         (formData.get('notes') as string) || undefined,
      donated_at,
      registered_by: user?.id ?? null,
    })
  } catch (e) {
    console.error('registerDonationItem error:', e)
    return { error: 'Não foi possível registrar a doação. Tente novamente.' }
  }

  revalidatePath('/doacoes/itens')
  redirect('/doacoes/itens')
}
