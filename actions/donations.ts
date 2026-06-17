'use server'

import { redirect } from 'next/navigation'
import { addDonation } from '@/lib/store'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { parseMoney } from '@/lib/utils'

export async function registerDonation(formData: FormData): Promise<{ error: string } | void> {
  const donated_at = (formData.get('donated_at') as string) || new Date().toISOString().split('T')[0]
  const amount = parseMoney((formData.get('amount') as string) || '0')
  const donorName = ((formData.get('donor_name') as string) || '').trim()

  if (!donorName) return { error: 'Informe o nome do doador.' }
  if (amount <= 0) return { error: 'Informe um valor maior que zero.' }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await addDonation({
      donated_at:    new Date(donated_at).toISOString(),
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
