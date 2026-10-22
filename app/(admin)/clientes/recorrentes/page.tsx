import Link from 'next/link'
import { DIAS_PARA_INTERROMPIDO, getDoadoresRecorrentes } from '@/lib/store'
import { formatBRL } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const dataCurta = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })

export default async function DoadoresRecorrentesPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>
}) {
  const { filtro } = await searchParams
  const soInterrompidos = filtro === 'interrompidos'
  const { doadores, mensaisSemFicha } = await getDoadoresRecorrentes()
  const interrompidos = doadores.filter((d) => d.interrompido).length
  const lista = soInterrompidos ? doadores.filter((d) => d.interrompido) : doadores

  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1000px]">
      <header className="mb-8">
        <div className="text-xs text-muted font-body tracking-[2px] uppercase mb-2">Clientes · Doadores recorrentes</div>
        <h1 className="font-display text-[28px] md:text-[40px] text-ink font-semibold tracking-[-1px] m-0 leading-[1.1]">
          Doadores recorrentes
        </h1>
        <p className="font-body text-muted text-sm mt-2 max-w-[600px]">
          Quem já fez doação mensal, com a data da última doação. Mais de {DIAS_PARA_INTERROMPIDO} dias sem doar aparece como interrompido.
        </p>
      </header>

      <nav aria-label="Filtro" className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/clientes/recorrentes"
          aria-current={!soInterrompidos ? 'page' : undefined}
          className={`chip no-underline ${!soInterrompidos ? 'bg-ink text-bg border-ink' : 'bg-paper text-muted border-rule'}`}
        >
          Todos ({doadores.length})
        </Link>
        <Link
          href="/clientes/recorrentes?filtro=interrompidos"
          aria-current={soInterrompidos ? 'page' : undefined}
          className={`chip no-underline ${soInterrompidos ? 'bg-ink text-bg border-ink' : 'bg-paper text-muted border-rule'}`}
        >
          Só interrompidos ({interrompidos})
        </Link>
      </nav>

      {lista.length === 0 ? (
        <div className="bg-paper border border-rule rounded-[16px] p-10 text-center font-body text-sm text-muted">
          {soInterrompidos ? 'Nenhum doador recorrente interrompido.' : 'Nenhuma pessoa com doação mensal.'}
        </div>
      ) : (
        <ul data-testid="doadores-recorrentes" className="m-0 p-0 list-none bg-paper border border-rule rounded-[16px] overflow-hidden">
          {lista.map((d) => (
            <li
              key={d.id}
              data-testid="doador-recorrente"
              className="px-6 py-4 border-b border-rule last:border-0 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <div className="font-body text-sm text-ink font-medium">{d.name}</div>
                <div className="font-body text-xs text-muted mt-0.5">
                  R$ {formatBRL(d.valorMensal)} por mês · última doação em {dataCurta(d.ultimaDoacao)}
                </div>
              </div>
              {d.interrompido ? (
                <span className="text-xs font-body px-2 py-1 rounded-full" style={{ backgroundColor: '#F8DCD2', color: '#D87560' }}>
                  interrompida há {d.diasSemDoar} dias
                </span>
              ) : (
                <span className="text-xs font-body px-2 py-1 rounded-full" style={{ backgroundColor: '#DCEBE0', color: '#2E5C3E' }}>
                  em dia
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      {mensaisSemFicha > 0 && (
        <p className="font-body text-xs text-muted mt-4">
          {mensaisSemFicha === 1 ? '1 doação mensal está' : `${mensaisSemFicha} doações mensais estão`} sem ficha e não aparecem aqui. Ligue a doação a uma pessoa em Doações · Sem ficha.
        </p>
      )}
    </div>
  )
}
