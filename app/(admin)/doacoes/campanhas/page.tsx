import { Campanhas } from '@/components/donations/campanhas'
import { getCampanhasComTotal } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default async function CampanhasPage() {
  const campanhas = await getCampanhasComTotal()

  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1100px]">
      <header className="mb-9">
        <div className="text-xs text-muted font-body tracking-[2px] uppercase mb-2">Doações · Campanhas</div>
        <h1 className="font-display text-[28px] md:text-[40px] text-ink font-semibold tracking-[-1px] m-0 leading-[1.1]">
          Campanhas
        </h1>
        <p className="font-body text-muted text-sm mt-2 max-w-[600px]">
          Campanhas como Adapta e Natalenço, que têm custo para o Instituto. A doação para uma campanha é registrada em dinheiro, escolhendo a campanha.
        </p>
      </header>
      <Campanhas campanhas={campanhas} />
    </div>
  )
}