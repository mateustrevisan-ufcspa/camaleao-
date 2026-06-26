import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { NewDonationItemForm } from '@/components/donations/new-donation-item-form'
import { getDonationCategories, getClients, getTags } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default async function NovaDoacaoItemPage() {
  const [categories, clients, tags] = await Promise.all([getDonationCategories(), getClients(), getTags()])

  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1000px]">
      <div className="mb-8">
        <Link
          href="/doacoes/itens"
          className="flex items-center gap-1 text-muted text-[13px] font-body no-underline hover:text-ink transition-colors w-fit"
        >
          <ChevronLeft size={14} /> Voltar
        </Link>
      </div>

      <h1 className="font-display text-[28px] md:text-[40px] text-ink font-semibold tracking-[-1px] m-0 mb-2">
        Nova doação de itens
      </h1>
      <p className="font-body text-muted text-sm mb-9 mt-2">
        Registre roupas e acessórios doados. Os campos com{' '}
        <span className="text-accent">*</span> são obrigatórios.
      </p>

      <NewDonationItemForm categories={categories} clients={clients} tags={tags} />
    </div>
  )
}
