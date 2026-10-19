import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { NewSaleForm } from '@/components/shop/new-sale-form'
import { getPaymentMethods, getBanks, getTags, getItemCategories, getAtalhosDaVenda } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default async function NovaVendaPage() {
  const [paymentMethods, banks, tags, categories, atalhos] = await Promise.all([
    getPaymentMethods(),
    getBanks(),
    getTags(),
    getItemCategories(),
    // Se os atalhos falharem, a tela abre sem eles e a venda é digitada como antes.
    getAtalhosDaVenda().catch((e) => {
      console.error('atalhos da venda:', e)
      return []
    }),
  ])

  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1000px]">
      <div className="mb-8">
        <Link
          href="/brecho"
          className="flex items-center gap-1 text-muted text-[13px] font-body no-underline hover:text-ink transition-colors w-fit"
        >
          <ChevronLeft size={14} /> Voltar
        </Link>
      </div>

      <h1 className="font-display text-[28px] md:text-[40px] text-ink font-semibold tracking-[-1px] m-0 mb-2">
        Nova venda
      </h1>
      <p className="font-body text-muted text-sm mb-9 mt-2">
        Preencha os dados da compra. Os campos com{' '}
        <span className="text-accent">*</span> são obrigatórios.
      </p>

      <NewSaleForm paymentMethods={paymentMethods} banks={banks} tags={tags} categories={categories} atalhos={atalhos} />
    </div>
  )
}
