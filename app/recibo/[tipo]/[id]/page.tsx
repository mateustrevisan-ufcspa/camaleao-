import Link from 'next/link'
import { getRecibo } from '@/lib/store'
import { INSTITUTO } from '@/lib/instituto'
import { textoDeAtendimentos } from '@/lib/atendimentos'
import { brTodayStr, formatBRL } from '@/lib/utils'
import { BotaoImprimir } from '@/components/recibo/imprimir'

export const dynamic = 'force-dynamic'

const dataLonga = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Sao_Paulo' })

function Indisponivel() {
  return (
    <main className="min-h-screen bg-bg flex items-center justify-center p-6">
      <div className="bg-paper border border-rule rounded-[16px] p-8 max-w-[480px]">
        <h1 className="font-display text-2xl text-ink font-semibold m-0">Recibo não encontrado</h1>
        <p className="font-body text-sm text-muted mt-3">
          A doação não existe, foi excluída ou está fora do que o seu perfil enxerga. O balcão emite recibo só das doações lançadas hoje; para as outras, fale com a coordenação.
        </p>
      </div>
    </main>
  )
}

// US-16 · Recibo pronto para imprimir ou salvar em PDF. Fora do grupo (admin),
// para não ter a barra lateral; o proxy continua exigindo sessão.
export default async function ReciboPage({ params }: { params: Promise<{ tipo: string; id: string }> }) {
  const { tipo, id } = await params
  if (tipo !== 'dinheiro' && tipo !== 'itens') return <Indisponivel />
  // Id inválido faz o banco devolver erro: tratado como "não encontrado".
  const recibo = await getRecibo(tipo, id).catch(() => null)
  if (!recibo) return <Indisponivel />

  const voltar = tipo === 'dinheiro' ? '/doacoes/dinheiro' : '/doacoes/itens'

  return (
    <main className="min-h-screen bg-bg print:bg-white p-6 print:p-0">
      <div className="max-w-[720px] mx-auto flex justify-between items-center mb-4 print:hidden">
        <Link href={voltar} className="chip bg-paper no-underline">Voltar</Link>
        <BotaoImprimir />
      </div>

      <article
        data-testid="recibo"
        className="max-w-[720px] mx-auto bg-paper print:bg-white border border-rule print:border-0 rounded-[16px] print:rounded-none p-10 font-body text-ink"
      >
        <header className="border-b border-rule pb-6 mb-6">
          <div className="font-display text-2xl font-semibold">{INSTITUTO.nome}</div>
          {INSTITUTO.cnpj && <div className="text-sm text-muted mt-1">CNPJ {INSTITUTO.cnpj}</div>}
          {INSTITUTO.endereco && <div className="text-sm text-muted">{INSTITUTO.endereco}</div>}
        </header>

        <h1 className="font-display text-xl font-semibold m-0">Recibo de doação nº {recibo.numero}</h1>

        <p className="text-[15px] leading-relaxed mt-5">
          O {INSTITUTO.nome} recebeu de <strong>{recibo.doador}</strong>, em {dataLonga(recibo.data)},{' '}
          {recibo.tipo === 'dinheiro' ? (
            <>
              a doação em dinheiro de <strong>R$ {formatBRL(recibo.valor ?? 0)}</strong>
              {recibo.forma ? <>, por {recibo.forma}</> : null}.
            </>
          ) : (
            <>
              a doação de itens da categoria <strong>{recibo.categoria}</strong>
              {recibo.quantidade ? <>: {recibo.quantidade}</> : recibo.triagemPendente ? <>, com a quantidade a confirmar na triagem</> : null}.
            </>
          )}
        </p>

        {recibo.vinculo && <p className="text-[15px] mt-3">{recibo.vinculo}.</p>}

        {recibo.tipo === 'dinheiro' && recibo.atendimentos !== null && recibo.atendimentos > 0 && (
          <p className="text-[15px] mt-3">
            Com esse valor, o Instituto custeia cerca de <strong>{textoDeAtendimentos(recibo.atendimentos)}</strong>
            {recibo.valorDoAtendimento ? <> (referência de R$ {formatBRL(recibo.valorDoAtendimento)} por atendimento)</> : null}.
          </p>
        )}

        <p className="text-[15px] mt-6">Agradecemos o apoio.</p>

        {INSTITUTO.assinatura && (
          <div className="mt-16 w-[280px] border-t border-ink pt-2 text-sm">{INSTITUTO.assinatura}</div>
        )}

        <footer className="mt-10 pt-4 border-t border-rule text-xs text-muted">
          Emitido em {brTodayStr().split('-').reverse().join('/')} pelo sistema do {INSTITUTO.nome}.
        </footer>
      </article>
    </main>
  )
}
