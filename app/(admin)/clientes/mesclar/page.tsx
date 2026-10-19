import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { MesclarFichas } from '@/components/clients/mesclar-fichas'
import { getFichasParaMesclar, getMesclagensRecentes, getMessageConsent, getTags } from '@/lib/store'

export const dynamic = 'force-dynamic'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function MesclarFichasPage({
  searchParams,
}: {
  searchParams: Promise<{ manter?: string; juntar?: string }>
}) {
  const { manter, juntar } = await searchParams
  const ids = [manter, juntar].filter((v): v is string => !!v && UUID.test(v))

  const [fichas, mesclagens, tags] = await Promise.all([
    ids.length > 0 ? getFichasParaMesclar(ids) : Promise.resolve([]),
    getMesclagensRecentes(),
    getTags(),
  ])
  const fica = fichas.find((f) => f.id === manter) ?? null
  const sai = fichas.find((f) => f.id === juntar) ?? null
  const [autorizacaoFica, autorizacaoSai] = await Promise.all([
    fica ? getMessageConsent(fica.id) : Promise.resolve(null),
    sai ? getMessageConsent(sai.id) : Promise.resolve(null),
  ])

  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1100px]">
      <div className="mb-8">
        <Link
          href="/clientes"
          className="flex items-center gap-1 text-muted text-[13px] font-body no-underline hover:text-ink transition-colors w-fit"
        >
          <ChevronLeft size={14} /> Clientes
        </Link>
      </div>

      <h1 className="font-display text-[28px] md:text-[40px] text-ink font-semibold tracking-[-1px] m-0 mb-2">
        Mesclar fichas
      </h1>
      <p className="font-body text-muted text-sm mb-9 mt-2 max-w-[640px]">
        Junte duas fichas da mesma pessoa. Confira o resultado antes de confirmar: dá para desfazer em até 30 dias.
      </p>

      <MesclarFichas
        fica={fica}
        sai={sai}
        autorizacaoFica={autorizacaoFica}
        autorizacaoSai={autorizacaoSai}
        mesclagens={mesclagens}
        tags={tags}
      />
    </div>
  )
}
