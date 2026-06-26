import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getDonations } from '@/lib/store'
import { DonationsList } from '@/components/donations/donations-list'

export const dynamic = 'force-dynamic'

export default async function DoacoesDinheiroPage() {
  const donations = await getDonations()

  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1300px]">
      <header className="mb-9 flex items-end justify-between gap-4">
        <div>
          <div className="text-xs text-muted font-body tracking-[2px] uppercase mb-2">
            Doações · Dinheiro · {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </div>
          <h1 className="font-display text-[28px] md:text-[40px] text-ink font-semibold tracking-[-1px] m-0 leading-[1.1]">
            Doações <span className="text-emerald">financeiras</span>
          </h1>
        </div>
        <Link
          href="/doacoes/dinheiro/nova"
          className="flex items-center gap-2 bg-emerald text-white no-underline px-4 py-2.5 rounded-[10px] font-body text-sm font-medium hover:opacity-90 transition-opacity shrink-0"
          style={{ boxShadow: '0 4px 14px rgba(92,138,110,0.3)' }}
        >
          <Plus size={15} /> Nova doação
        </Link>
      </header>
      <DonationsList donations={donations} />
    </div>
  )
}
