import { DoacoesSemFicha } from '@/components/donations/doacoes-sem-ficha'
import { getDoacoesSemFicha, getTags } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default async function DoacoesSemFichaPage() {
  const [doacoes, tags] = await Promise.all([getDoacoesSemFicha(), getTags()])

  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1000px]">
      <header className="mb-9">
        <div className="text-xs text-muted font-body tracking-[2px] uppercase mb-2">Doações · Sem ficha</div>
        <h1 className="font-display text-[28px] md:text-[40px] text-ink font-semibold tracking-[-1px] m-0 leading-[1.1]">
          Doações sem ficha
        </h1>
        <p className="font-body text-muted text-sm mt-2 max-w-[600px]">
          Doações registradas sem uma pessoa. Quando souber de quem foi, ligue a doação à ficha: ela passa a contar no histórico e na contribuição da pessoa.
        </p>
      </header>
      <DoacoesSemFicha doacoes={doacoes} tags={tags} />
    </div>
  )
}
