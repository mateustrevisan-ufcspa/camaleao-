'use server'

import { redirect } from 'next/navigation'
import { addSale, confirmSale } from '@/lib/store'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { parseMoney, dateInputToISO } from '@/lib/utils'

function calcNetAmount(amount: number, paymentMethod: string): number {
  if (paymentMethod === 'credit') return parseFloat((amount * 0.98).toFixed(2))
  if (paymentMethod === 'debit')  return parseFloat((amount * 0.982).toFixed(2))
  return amount
}

type SaleItemInput = { category_id?: string | null; category_name: string; amount: number | string }

export async function registerSale(formData: FormData): Promise<{ error: string } | void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const itemsRaw = formData.get('items') as string
  const items = (JSON.parse(itemsRaw) as SaleItemInput[])
    .map((p) => ({
      category_id:   p.category_id || null,
      category_name: (p.category_name || '').trim(),
      amount:        parseMoney(p.amount),
    }))
    .filter((p) => p.amount > 0)

  if (items.length === 0) return { error: 'Adicione ao menos uma peça com valor.' }

  const total = items.reduce((s, p) => s + p.amount, 0)
  const paymentMethodName = formData.get('payment_method') as string
  const bankName = (formData.get('bank') as string) || null

  try {
    // Resolve FKs de payment_method e bank pelo nome
    const [{ data: pm }, { data: bank }] = await Promise.all([
      supabase.from('payment_methods').select('id').eq('name', paymentMethodName).single(),
      bankName
        ? supabase.from('banks').select('id').eq('name', bankName).single()
        : Promise.resolve({ data: null }),
    ])

    await addSale({
      client_id:          (formData.get('client_id') as string) || null,
      customer_name:      (formData.get('customer_name') as string) || 'Cliente avulso',
      payment_method:     paymentMethodName,
      confirmed:          false,
      payment_method_id:  pm?.id ?? undefined,
      bank_id:            (bank as { id: string } | null)?.id ?? undefined,
      installments:       formData.get('installments') ? Number(formData.get('installments')) : undefined,
      net_amount:         calcNetAmount(total, paymentMethodName),
      sold_at:            dateInputToISO(formData.get('sold_at') as string),
      registered_by:      user?.id ?? null,
      items,
    })
  } catch (e) {
    console.error('registerSale error:', e)
    return { error: 'Não foi possível registrar a venda. Tente novamente.' }
  }

  redirect('/brecho')
}

export async function markSaleConfirmed(id: string) {
  await confirmSale(id)
  revalidatePath('/brecho/financeiro')
}
