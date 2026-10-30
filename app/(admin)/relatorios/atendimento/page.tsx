import Link from 'next/link'
import { ValorDoAtendimento } from '@/components/reports/valor-do-atendimento'
import { getHistoricoDoValorDoAtendimento } from '@/lib/store'

export const dynamic = 'force-dynamic'

// US-19 · Só a coordenação abre: o proxy devolve o balcão para o brechó (a rota
// começa com /relatorios, que está em SO_COORDENACAO), e o banco só aceita
// alteração da coordenação.
export default async function ValorDoAtendimentoPage() {
  const historico = await getHistoricoDoValorDoAtendimento()

  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[900px]">
      <header className="mb-9">
        <div className="text-xs text-muted font-body tracking-[2px] uppercase mb-2">
          <Link href="/relatorios" className="text-muted no-underline hover:text-ink">Relatórios</Link> · Valor do atendimento
        </div>
        <h1 className="font-display text-[28px] md:text-[40px] text-ink font-semibold tracking-[-1px] m-0 leading-[1.1]">
          Valor do atendimento
        </h1>
        <p className="font-body text-muted text-sm mt-2 max-w-[600px]">
          Quanto custa, em média, um atendimento do Instituto. O sistema usa este valor para mostrar quantos atendimentos cada venda e cada doação ajudam a custear. A alteração vale na hora, sem nova publicação.
        </p>
      </header>
      <ValorDoAtendimento historico={historico} />
    </div>
  )
}
