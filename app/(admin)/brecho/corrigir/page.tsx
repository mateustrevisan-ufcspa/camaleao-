import Link from 'next/link'
import { getLancamentosParaCorrigir } from '@/lib/store'
import { brTodayStr, formatBRL } from '@/lib/utils'
import { CancelarLancamento } from '@/components/shop/cancelar-lancamento'

export const dynamic = 'force-dynamic'

const DIA = /^\d{4}-\d{2}-\d{2}$/
const hora = (iso: string) => new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' })

// US-37 · Caixa e coordenação: /brecho está em SO_CAIXA_OU_COORDENACAO, e as funções do banco conferem de novo.
export default async function CorrigirLancamentoPage({ searchParams }: { searchParams: Promise<{ dia?: string }> }) {
  const { dia: pedido } = await searchParams
  const hoje = brTodayStr()
  const dia = pedido && DIA.test(pedido) && pedido <= hoje ? pedido : hoje
  const lancamentos = await getLancamentosParaCorrigir(dia)
  const voltar = `/brecho/corrigir?dia=${dia}`

  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1100px]">
      <header className="mb-8">
        <div className="text-xs text-muted font-body tracking-[2px] uppercase mb-2">Brechó · Corrigir lançamento</div>
        <h1 className="font-display text-[28px] md:text-[40px] text-ink font-semibold tracking-[-1px] m-0">Corrigir ou cancelar</h1>
        <p className="font-body text-muted text-sm mt-2 max-w-[640px]">
          Escolha o dia da venda ou da doação. Doação em dinheiro: corrija os dados ou cancele. Venda: cancele e registre de novo em Nova venda. Cancelar pede o motivo; tudo fica em Relatórios · Alterações.
        </p>
      </header>

      <form className="flex gap-2 items-end mb-6 font-body">
        <label className="text-[11px] text-muted tracking-[1px] uppercase">Dia
          <input name="dia" type="date" max={hoje} defaultValue={dia} className="input-base mt-1.5" />
        </label>
        <button type="submit" className="chip bg-ink text-bg border-ink">Ver</button>
      </form>

      {lancamentos.length === 0 ? (
        <div className="bg-paper border border-rule rounded-[16px] p-10 text-center font-body text-sm text-muted">Nenhuma venda nem doação em dinheiro neste dia.</div>
      ) : (
        <ul data-testid="lancamentos-para-corrigir" className="m-0 p-0 list-none bg-paper border border-rule rounded-[16px] overflow-hidden font-body">
          {lancamentos.map((l) => (
            <li key={`${l.tipo}:${l.id}`} data-testid="lancamento" className="px-6 py-4 border-b border-rule last:border-0 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm text-ink font-medium">{l.tipo === 'venda' ? 'Venda' : 'Doação'} · {l.nome}</div>
                <div className="text-xs text-muted mt-0.5">{hora(l.momento)} · R$ {formatBRL(l.valor)}{l.detalhe && ` · ${l.detalhe}`}</div>
              </div>
              <div className="flex gap-2 items-start">
                {l.tipo === 'doacao' && (
                  <Link href={`/doacoes/corrigir/${l.id}?voltar=${encodeURIComponent(voltar)}`} className="chip bg-bg no-underline">Corrigir</Link>
                )}
                <CancelarLancamento tipo={l.tipo} id={l.id} />
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="font-body text-xs text-muted mt-3">
        Venda registrada errada: cancele e <Link href="/brecho/nova-venda" className="text-accent-deep">registre de novo</Link>.
      </p>
    </div>
  )
}
