import Link from 'next/link'
import { getPessoasParaAgradecer, souCoordenacao } from '@/lib/store'
import { atendimentos, textoDeAtendimentos } from '@/lib/atendimentos'
import { textoDeAgradecimento, textoDeAgradecimentoAnual, textoDeAgradecimentoSemanal } from '@/lib/mensagens'
import { FORMATO, nomeDoPeriodo, outroPeriodo, periodoPadrao, type TipoDeAgradecimento } from '@/lib/periodos'
import { brTodayStr, formatBRL } from '@/lib/utils'
import { AprovacaoDoTermo } from '@/components/clients/aprovacao-do-termo'
import { BotaoDeAgradecer } from '@/components/clients/botao-de-agradecer'
import type { PessoaParaAgradecer } from '@/types'

export const dynamic = 'force-dynamic'

// US-41 · Três agradecimentos (resposta 2): mensal, semanal e anual.
const ABAS: { tipo: TipoDeAgradecimento; rotulo: string; explica: string }[] = [
  { tipo: 'mensal', rotulo: 'Mensal', explica: 'Quem comprou no brechó ou doou dinheiro no mês, com o total e os atendimentos. Envie até o dia 10 do mês seguinte.' },
  { tipo: 'semanal', rotulo: 'Semanal', explica: 'Quem trouxe item na sede na semana (tampinhas, roupas e outros), com uma mensagem padrão.' },
  { tipo: 'anual', rotulo: 'Anual', explica: 'Todo mundo que contribuiu no ano: o total e os atendimentos de quem comprou ou doou dinheiro, e um texto fixo para quem só doou item.' },
]

const dia = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })

function entraNaLista(tipo: TipoDeAgradecimento, p: PessoaParaAgradecer) {
  if (tipo === 'mensal') return p.total > 0
  // Semanal: quem trouxe item, mesmo com a triagem pendente (pecas 0).
  if (tipo === 'semanal') return p.doacoesDeItem > 0
  return true
}

// US-21a, US-39 e US-41 · Caixa e coordenação: /clientes/agradecimentos está em SO_CAIXA_OU_COORDENACAO,
// e as funções do banco conferem de novo. A aprovação do termo é só da coordenação.
export default async function AgradecimentosPage({ searchParams }: { searchParams: Promise<{ tipo?: string; periodo?: string }> }) {
  const pedido = await searchParams
  const tipo: TipoDeAgradecimento = pedido.tipo === 'semanal' || pedido.tipo === 'anual' ? pedido.tipo : 'mensal'
  const periodo = pedido.periodo && FORMATO[tipo].test(pedido.periodo) ? pedido.periodo : periodoPadrao(tipo, brTodayStr())
  const aba = ABAS.find((a) => a.tipo === tipo)!

  const [{ pessoas: todas, valorDoAtendimento, termoAprovado }, coordenacao] = await Promise.all([
    getPessoasParaAgradecer(periodo),
    souCoordenacao(),
  ])
  const pessoas = todas.filter((p) => entraNaLista(tipo, p))
  const semAutorizacao = pessoas.filter((p) => !p.podeReceber).length

  function textoPara(p: PessoaParaAgradecer) {
    const at = textoDeAtendimentos(atendimentos(p.paraAtendimentos, valorDoAtendimento))
    if (tipo === 'semanal') return textoDeAgradecimentoSemanal(p.name)
    if (tipo === 'anual') return textoDeAgradecimentoAnual({ nome: p.name, ano: Number(periodo), valor: p.total, atendimentos: at })
    return textoDeAgradecimento({ nome: p.name, mes: Number(periodo.slice(5, 7)), valor: p.total, atendimentos: at })
  }

  function resumo(p: PessoaParaAgradecer) {
    const partes: string[] = []
    if (tipo !== 'semanal' && p.total > 0) partes.push(`R$ ${formatBRL(p.total)} · ${textoDeAtendimentos(atendimentos(p.paraAtendimentos, valorDoAtendimento))}`)
    if (tipo !== 'mensal' && p.pecas > 0) partes.push(`${p.pecas} ${p.pecas === 1 ? 'peça' : 'peças'}`)
    if (tipo === 'semanal' && p.pecas === 0) partes.push('doação com a triagem pendente')
    return partes.join(' · ')
  }

  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1100px]">
      <header className="mb-6">
        <div className="text-xs text-muted font-body tracking-[2px] uppercase mb-2">Clientes · Agradecimentos</div>
        <h1 className="font-display text-[28px] md:text-[40px] text-ink font-semibold tracking-[-1px] m-0">
          Agradecimento {aba.rotulo.toLowerCase()}: {nomeDoPeriodo(tipo, periodo)}
        </h1>
        <p className="font-body text-muted text-sm mt-2 max-w-[680px]">
          {aba.explica} O botão registra o agradecimento e abre o WhatsApp ou o e-mail com a mensagem pronta. Cada pessoa recebe um agradecimento por período.
        </p>
      </header>

      <nav aria-label="Tipo de agradecimento" className="flex flex-wrap gap-2 mb-3 font-body">
        {ABAS.map((a) => (
          <Link
            key={a.tipo}
            href={`/clientes/agradecimentos?tipo=${a.tipo}`}
            aria-current={a.tipo === tipo ? 'page' : undefined}
            className={`chip no-underline ${a.tipo === tipo ? 'bg-ink text-bg border-ink' : 'bg-paper text-muted border-rule'}`}
          >
            {a.rotulo}
          </Link>
        ))}
      </nav>
      <nav aria-label="Período" className="flex gap-2 mb-6 font-body">
        <Link href={`/clientes/agradecimentos?tipo=${tipo}&periodo=${outroPeriodo(tipo, periodo, -1)}`} className="chip bg-paper no-underline">Anterior</Link>
        <Link href={`/clientes/agradecimentos?tipo=${tipo}&periodo=${outroPeriodo(tipo, periodo, 1)}`} className="chip bg-paper no-underline">Seguinte</Link>
      </nav>

      {!termoAprovado && (coordenacao ? <AprovacaoDoTermo /> : (
        <div data-testid="termo-nao-aprovado" className="rounded-[12px] px-4 py-3 mb-6 font-body text-sm text-ink" style={{ backgroundColor: '#FBE3CA' }}>
          O termo de mensagens ainda não foi aprovado: ninguém recebe agradecimento. Fale com a coordenação.
        </div>
      ))}

      {pessoas.length === 0 ? (
        <div className="bg-paper border border-rule rounded-[16px] p-10 text-center font-body text-sm text-muted">Ninguém com ficha para agradecer neste período.</div>
      ) : (
        <ul data-testid="agradecimentos" className="m-0 p-0 list-none bg-paper border border-rule rounded-[16px] overflow-hidden font-body">
          {pessoas.map((p) => (
            <li key={p.id} data-testid="pessoa-para-agradecer" className="px-6 py-4 border-b border-rule last:border-0 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm text-ink font-medium">{p.name}</div>
                <div className="text-xs text-muted mt-0.5">{resumo(p)}</div>
              </div>
              <div data-testid="situacao-do-agradecimento" className="text-xs text-muted">
                {p.agradecidaEm ? (
                  `Agradecida em ${dia(p.agradecidaEm)} (${p.canal === 'whatsapp' ? 'WhatsApp' : 'e-mail'})`
                ) : p.termoQueNaoVale ? (
                  'Autorizou um termo que não vale (veja a ficha)'
                ) : !p.podeReceber ? (
                  'Sem autorização de mensagens'
                ) : !p.temWhatsApp && !p.temEmail ? (
                  'Autorizou, mas não tem contato registrado'
                ) : (
                  <BotaoDeAgradecer clientId={p.id} periodo={periodo} texto={textoPara(p)} temWhatsApp={p.temWhatsApp} temEmail={p.temEmail} />
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {semAutorizacao > 0 && (
        <p className="font-body text-xs text-muted mt-3">
          {semAutorizacao} {semAutorizacao === 1 ? 'pessoa contribuiu e não pode' : 'pessoas contribuíram e não podem'} receber mensagem: não autorizaram, autorizaram um termo anterior (veja a ficha){termoAprovado ? '' : ' ou o termo ainda não foi aprovado'}.
        </p>
      )}
    </div>
  )
}
