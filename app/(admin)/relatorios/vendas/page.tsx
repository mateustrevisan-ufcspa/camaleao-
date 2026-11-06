import Link from 'next/link'
import { getVendasDoMes } from '@/lib/store'
import { somasPorDia, somasPorSemana, totalDe, INICIO_DA_SEMANA, type SomaDoPeriodo } from '@/lib/vendas-por-periodo'
import { brTodayStr, formatBRL } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const MES = /^\d{4}-(0[1-9]|1[0-2])$/
const DIAS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']

const diaMes = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`
const diaDaSemana = (d: string) => {
  const [a, m, dia] = d.split('-').map(Number)
  return DIAS[new Date(Date.UTC(a, m - 1, dia)).getUTCDay()]
}

function Tabela({ titulo, testId, linhas, rotulo }: { titulo: string; testId: string; linhas: SomaDoPeriodo[]; rotulo: (s: SomaDoPeriodo) => string }) {
  return (
    <div className="bg-paper border border-rule rounded-[16px] overflow-hidden">
      <div className="px-6 py-5 border-b border-rule">
        <h3 className="font-display text-xl text-ink font-medium m-0">{titulo}</h3>
      </div>
      <table data-testid={testId} className="w-full border-collapse font-body text-[13px]">
        <thead>
          <tr className="bg-bg text-left text-[11px] text-muted uppercase tracking-[1px]">
            <th className="px-6 py-3 font-medium">Período</th>
            <th className="px-6 py-3 font-medium text-right">Vendas</th>
            <th className="px-6 py-3 font-medium text-right">Bruto</th>
            <th className="px-6 py-3 font-medium text-right">Líquido</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((s) => (
            <tr key={s.inicio} className="border-t border-rule">
              <td className="px-6 py-3 text-ink">{rotulo(s)}</td>
              <td className="px-6 py-3 text-right text-ink">{s.vendas}</td>
              <td className="px-6 py-3 text-right text-ink">R$ {formatBRL(s.bruto)}</td>
              <td className="px-6 py-3 text-right text-emerald">R$ {formatBRL(s.liquido)}</td>
            </tr>
          ))}
          {linhas.length === 0 && (
            <tr>
              <td colSpan={4} className="px-6 py-8 text-center text-muted italic">Nenhuma venda no mês</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// US-30 · Só a coordenação abre: a rota começa com /relatorios (SO_COORDENACAO).
export default async function VendasPorPeriodoPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const { mes } = await searchParams
  const escolhido = mes && MES.test(mes) ? mes : brTodayStr().slice(0, 7)
  const [ano, m] = escolhido.split('-').map(Number)

  const vendas = await getVendasDoMes(ano, m)
  const porDia = somasPorDia(vendas)
  const porSemana = somasPorSemana(vendas, ano, m)
  const total = totalDe(porDia)
  const nomeDoMes = new Date(Date.UTC(ano, m - 1, 15)).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' })

  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1100px]">
      <header className="mb-9">
        <div className="text-xs text-muted font-body tracking-[2px] uppercase mb-2">
          <Link href="/relatorios" className="text-muted no-underline hover:text-ink">Relatórios</Link> · Vendas por dia e por semana
        </div>
        <h1 className="font-display text-[28px] md:text-[40px] text-ink font-semibold tracking-[-1px] m-0 leading-[1.1]">
          Vendas de {nomeDoMes}
        </h1>
        <form method="get" className="flex items-end gap-2 mt-4">
          <label className="text-[11px] font-body text-muted tracking-[1px] uppercase">
            Mês
            <input type="month" name="mes" defaultValue={escolhido} className="input-base mt-1.5 normal-case" />
          </label>
          <button type="submit" className="chip bg-bg">Ver</button>
        </form>
      </header>

      <div className="bg-paper border border-rule rounded-[16px] p-6 mb-6">
        <div className="text-[13px] text-muted font-body mb-2">Total do mês ({total.vendas} vendas)</div>
        <div data-testid="total-do-mes" className="font-display text-[34px] font-bold tracking-[-1px] leading-none text-accent">
          R$ {formatBRL(total.bruto)}
        </div>
        <div className="text-[13px] text-muted font-body mt-2">
          Líquido: <span className="text-emerald">R$ {formatBRL(total.liquido)}</span>
          {total.semLiquido > 0 && ` · ${total.semLiquido} venda(s) sem taxa cadastrada, somadas pelo bruto`}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Tabela titulo="Por dia" testId="vendas-por-dia" linhas={porDia} rotulo={(s) => `${diaDaSemana(s.inicio)} ${diaMes(s.inicio)}`} />
        <Tabela
          titulo={`Por semana (começa ${INICIO_DA_SEMANA === 0 ? 'no domingo' : 'na segunda'})`}
          testId="vendas-por-semana"
          linhas={porSemana}
          rotulo={(s) => (s.inicio === s.fim ? diaMes(s.inicio) : `${diaMes(s.inicio)} a ${diaMes(s.fim)}`)}
        />
      </div>

      <p className="font-body text-[12px] text-muted mt-6">
        Dias e semanas no horário de Brasília. A semana que começa num mês e termina no outro aparece cortada no limite do mês, para a soma das semanas ser o total do mês.
      </p>
    </div>
  )
}
