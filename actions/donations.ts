'use server'

import { redirect } from 'next/navigation'
import { addDonation, addDonationItem, addDonationCaps } from '@/lib/store'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { parseMoney, dateInputToISO } from '@/lib/utils'

export async function registerDonation(formData: FormData): Promise<{ error: string } | void> {
  const donated_at = dateInputToISO(formData.get('donated_at') as string)
  const amount = parseMoney((formData.get('amount') as string) || '0')
  const donorName = ((formData.get('donor_name') as string) || '').trim()

  if (!donorName) return { error: 'Informe o nome do doador.' }
  if (amount <= 0) return { error: 'Informe um valor maior que zero.' }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await addDonation({
      client_id:     (formData.get('client_id') as string) || null,
      donated_at,
      donor_name:    donorName,
      donor_phone:   (formData.get('donor_phone') as string) || '',
      amount,
      origin:        (formData.get('origin') as string) || 'PIX',
      frequency:     (formData.get('frequency') as 'monthly' | 'one_time') || 'one_time',
      notes:         (formData.get('notes') as string) || undefined,
      registered_by: user?.id ?? null,
    })
  } catch (e) {
    console.error('registerDonation error:', e)
    return { error: 'Não foi possível registrar a doação. Tente novamente.' }
  }

  revalidatePath('/doacoes/dinheiro')
  redirect('/doacoes/dinheiro')
}

export async function registerDonationItem(formData: FormData): Promise<{ error: string } | void> {
  const donated_at = dateInputToISO(formData.get('donated_at') as string)
  const donorName = ((formData.get('donor_name') as string) || '').trim()
  const categoryName = ((formData.get('category_name') as string) || '').trim()
  const quantity = parseInt((formData.get('quantity') as string) || '0', 10)

  if (!donorName) return { error: 'Informe o nome do doador.' }
  if (!categoryName) return { error: 'Informe a categoria do item.' }
  if (!Number.isFinite(quantity) || quantity <= 0) return { error: 'Informe uma quantidade maior que zero.' }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await addDonationItem({
      client_id:     (formData.get('client_id') as string) || null,
      donor_name:    donorName,
      donor_phone:   (formData.get('donor_phone') as string) || '',
      category_id:   (formData.get('category_id') as string) || null,
      category_name: categoryName,
      quantity,
      condition:     (formData.get('condition') as 'good' | 'needs_review') || 'good',
      destination:   (formData.get('destination') as 'stock' | 'direct') || 'stock',
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

export async function registerDonationCaps(formData: FormData): Promise<{ error: string } | void> {
  const donated_at = dateInputToISO(formData.get('donated_at') as string)
  const donorName = ((formData.get('donor_name') as string) || '').trim()
  const qRaw = (formData.get('quantity') as string) || ''
  const wRaw = (formData.get('weight_kg') as string) || ''
  const quantity = qRaw ? parseInt(qRaw, 10) : null
  const weight_kg = wRaw ? parseMoney(wRaw) : null

  if (!donorName) return { error: 'Informe o nome do doador.' }
  if ((quantity === null || quantity <= 0) && (weight_kg === null || weight_kg <= 0)) {
    return { error: 'Informe quantidade ou peso (ao menos um).' }
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await addDonationCaps({
      client_id:     (formData.get('client_id') as string) || null,
      donor_name:    donorName,
      donor_phone:   (formData.get('donor_phone') as string) || '',
      quantity:      quantity && quantity > 0 ? quantity : null,
      weight_kg:     weight_kg && weight_kg > 0 ? weight_kg : null,
      notes:         (formData.get('notes') as string) || undefined,
      donated_at,
      registered_by: user?.id ?? null,
    })
  } catch (e) {
    console.error('registerDonationCaps error:', e)
    return { error: 'Não foi possível registrar a doação. Tente novamente.' }
  }

  revalidatePath('/doacoes/tampinhas')
  redirect('/doacoes/tampinhas')
}
