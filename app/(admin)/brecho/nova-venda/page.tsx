import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { NewSaleForm } from '@/components/shop/new-sale-form'
import { getClients, getPaymentMethods, getBanks, getTags, getItemCategories } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default async function NovaVendaPage() {
  const [clients, paymentMethods, banks, tags, categories] = await Promise.all([
    getClients(),
    getPaymentMethods(),
    getBanks(),
    getTags(),
    getItemCategories(),
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

      <NewSaleForm clients={clients} paymentMethods={paymentMethods} banks={banks} tags={tags} categories={categories} />
    </div>
  )
}
