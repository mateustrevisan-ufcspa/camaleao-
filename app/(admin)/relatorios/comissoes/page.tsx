import Link from 'next/link'
import { Comissoes } from '@/components/reports/comissoes'
import { getCaptadores, getDoacoesComComissao, getPercentuaisDeComissao } from '@/lib/store'
import { brTodayStr } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const MES = /^\d{4}-(0[1-9]|1[0-2])$/
const NOMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
function outroMes(ano: number, mes: number, passo: number) {
  const d = new Date(Date.UTC(ano, mes - 1 + passo, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

// US-31 · Só a coordenação: a rota começa com /relatorios (SO_COORDENACAO), e as políticas do banco só devolvem para ela.
export default async function ComissoesPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const { mes } = await searchParams
  const escolhido = mes && MES.test(mes) ? mes : brTodayStr().slice(0, 7)
  const [ano, m] = escolhido.split('-').map(Number)
  const [doacoes, captadores, percentuais] = await Promise.all([
    getDoacoesComComissao(ano, m),
    getCaptadores(),
    getPercentuaisDeComissao(),
  ])

  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1200px]">
      <header className="mb-8">
        <div className="text-xs text-muted font-body tracking-[2px] uppercase mb-2">
          <Link href="/relatorios" className="text-muted no-underline hover:text-ink">Relatórios</Link> · Comissões
        </div>
        <h1 className="font-display text-[28px] md:text-[40px] text-ink font-semibold tracking-[-1px] m-0">Comissões de {NOMES[m - 1]} de {ano}</h1>
        <p className="font-body text-muted text-sm mt-2 max-w-[640px]">
          Em cada doação em dinheiro, marque quem captou ou &quot;Sem comissão&quot;. O sistema calcula a comissão sobre o líquido. Marque as doações em &quot;Somar&quot; para somar só algumas.
        </p>
      </header>
      <nav aria-label="Mês" className="flex gap-2 mb-6 font-body">
        <Link href={`/relatorios/comissoes?mes=${outroMes(ano, m, -1)}`} className="chip bg-paper no-underline">Mês anterior</Link>
        <Link href={`/relatorios/comissoes?mes=${outroMes(ano, m, 1)}`} className="chip bg-paper no-underline">Mês seguinte</Link>
      </nav>
      <Comissoes doacoes={doacoes} captadores={captadores} percentuais={percentuais} />
    </div>
  )
}
