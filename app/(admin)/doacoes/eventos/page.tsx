import { Eventos } from '@/components/donations/eventos'
import { getEventosComTotal } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default async function EventosPage() {
  const eventos = await getEventosComTotal()

  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1100px]">
      <header className="mb-9">
        <div className="text-xs text-muted font-body tracking-[2px] uppercase mb-2">Doações · Eventos</div>
        <h1 className="font-display text-[28px] md:text-[40px] text-ink font-semibold tracking-[-1px] m-0 leading-[1.1]">
          Eventos
        </h1>
        <p className="font-body text-muted text-sm mt-2 max-w-[560px]">
          Festas, jantares e outros eventos com ingresso. O valor pago entra como doação em dinheiro vinculada ao evento.
        </p>
      </header>
      <Eventos eventos={eventos} />
    </div>
  )
}