'use server'

import { redirect } from 'next/navigation'
import { addSale, confirmSale, getTaxaEmVigor } from '@/lib/store'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { parseMoney, dateInputToISO } from '@/lib/utils'
import { pedeBandeira, valorLiquido, type Bandeira } from '@/lib/taxas'

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
  const installments = formData.get('installments') ? Number(formData.get('installments')) : undefined
  // US-32: taxa única para qualquer número de parcelas; uma parcela é crédito à vista.
  const parcelado = paymentMethodName === 'credit' && (installments ?? 1) > 1
  const bandeiraDigitada = formData.get('card_brand')
  const comBandeira = pedeBandeira(bankName, paymentMethodName)
  const bandeira: Bandeira | null =
    comBandeira && (bandeiraDigitada === 'visa_master' || bandeiraDigitada === 'outras') ? bandeiraDigitada : null
  if (comBandeira && !bandeira) return { error: 'Escolha a bandeira do cartão.' }

  try {
    // Resolve FKs de payment_method e bank pelo nome
    const [{ data: pm }, { data: bank }] = await Promise.all([
      supabase.from('payment_methods').select('id').eq('name', paymentMethodName).single(),
      bankName
        ? supabase.from('banks').select('id, uso').eq('name', bankName).single()
        : Promise.resolve({ data: null }),
    ])
    // US-35: banco só de doação (Doação Solutions) não entra na venda, mesmo que o pedido não venha da tela.
    if ((bank as { uso?: string } | null)?.uso === 'doacoes') return { error: 'Escolha o banco ou a maquininha da lista.' }

    // US-32: taxa em vigor da combinação; sem taxa cadastrada, o líquido fica vazio.
    const taxa = paymentMethodName === 'cash' || !bankName
      ? null
      : await getTaxaEmVigor(bankName, paymentMethodName, parcelado, bandeira)

    await addSale({
      client_id:          (formData.get('client_id') as string) || null,
      customer_name:      (formData.get('customer_name') as string) || 'Cliente avulso',
      payment_method:     paymentMethodName,
      confirmed:          false,
      payment_method_id:  pm?.id ?? undefined,
      bank_id:            (bank as { id: string } | null)?.id ?? undefined,
      installments,
      net_amount:         valorLiquido(total, paymentMethodName, taxa),
      card_brand:         bandeira,
      sold_at:            dateInputToISO(formData.get('sold_at') as string),
      registered_by:      user?.id ?? null,
      items,
    })
  } catch (e) {
    console.error('registerSale error:', e)
    return { error: 'Não foi possível registrar a venda. Tente novamente.' }
  }

  // US-19: o painel mostra o aviso da venda com os atendimentos que ela ajuda a custear.
  redirect(`/brecho?venda=${total.toFixed(2)}`)
}

export async function markSaleConfirmed(id: string) {
  await confirmSale(id)
  revalidatePath('/brecho/financeiro')
}
