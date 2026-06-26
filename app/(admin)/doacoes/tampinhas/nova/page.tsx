import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { NewDonationCapsForm } from '@/components/donations/new-donation-caps-form'

export default function NovaDoacaoTampinhasPage() {
  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1000px]">
      <div className="mb-8">
        <Link
          href="/doacoes/tampinhas"
          className="flex items-center gap-1 text-muted text-[13px] font-body no-underline hover:text-ink transition-colors w-fit"
        >
          <ChevronLeft size={14} /> Voltar
        </Link>
      </div>

      <h1 className="font-display text-[28px] md:text-[40px] text-ink font-semibold tracking-[-1px] m-0 mb-2">
        Nova doação de tampinhas
      </h1>
      <p className="font-body text-muted text-sm mb-9 mt-2">
        Registre tampinhas recebidas. Os campos com{' '}
        <span className="text-accent">*</span> são obrigatórios.
      </p>

      <NewDonationCapsForm />
    </div>
  )
}
