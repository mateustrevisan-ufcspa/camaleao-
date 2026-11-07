import Link from 'next/link'
import { getAgradecimentosDoMes } from '@/lib/store'
import { atendimentos, textoDeAtendimentos } from '@/lib/atendimentos'
import { PERIODO_DO_AGRADECIMENTO, linkDoEmail, linkDoWhatsApp, textoDeAgradecimento } from '@/lib/mensagens'
import { TERMO_MENSAGENS } from '@/lib/termo-mensagens'
import { brTodayStr, formatBRL } from '@/lib/utils'
import { AprovacaoDoTermo } from '@/components/clients/aprovacao-do-termo'
import { BotaoDeAgradecer } from '@/components/clients/botao-de-agradecer'

export const dynamic = 'force-dynamic'

const MES = /^\d{4}-(0[1-9]|1[0-2])$/
const NOMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

function outroMes(ano: number, mes: number, passo: number) {
  const d = new Date(Date.UTC(ano, mes - 1 + passo, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

const dia = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })

// US-21a · Só a coordenação: /clientes/agradecimentos está em SO_COORDENACAO.
export default async function AgradecimentosPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const { mes } = await searchParams
  const escolhido = mes && MES.test(mes) ? mes : brTodayStr().slice(0, 7)
  const [ano, m] = escolhido.split('-').map(Number)
  // Provisório: um agradecimento por mês. Com 'ano', o período vira AAAA.
  const periodo = PERIODO_DO_AGRADECIMENTO === 'ano' ? String(ano) : escolhido
  const { pessoas, valorDoAtendimento, versoesAprovadas } = await getAgradecimentosDoMes(ano, m)
  const termoAprovado = versoesAprovadas.includes(TERMO_MENSAGENS.versao)
  const semAutorizacao = pessoas.filter((p) => !p.podeReceber).length

  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1100px]">
      <header className="mb-8">
        <div className="text-xs text-muted font-body tracking-[2px] uppercase mb-2">Clientes · Agradecimentos</div>
        <h1 className="font-display text-[28px] md:text-[40px] text-ink font-semibold tracking-[-1px] m-0">Agradecimentos de {NOMES[m - 1]} de {ano}</h1>
        <p className="font-body text-muted text-sm mt-2 max-w-[640px]">
          Quem contribuiu no mês, com o total e os atendimentos que ajudou a custear. O botão registra o agradecimento e abre o WhatsApp ou o e-mail com a mensagem pronta. Cada pessoa recebe um agradecimento por mês.
        </p>
      </header>

      <nav aria-label="Mês" className="flex gap-2 mb-6 font-body">
        <Link href={`/clientes/agradecimentos?mes=${outroMes(ano, m, -1)}`} className="chip bg-paper no-underline">Mês anterior</Link>
        <Link href={`/clientes/agradecimentos?mes=${outroMes(ano, m, 1)}`} className="chip bg-paper no-underline">Mês seguinte</Link>
      </nav>

      {!termoAprovado && <AprovacaoDoTermo />}

      {pessoas.length === 0 ? (
        <div className="bg-paper border border-rule rounded-[16px] p-10 text-center font-body text-sm text-muted">Nenhuma contribuição de quem tem ficha neste mês.</div>
      ) : (
        <ul data-testid="agradecimentos" className="m-0 p-0 list-none bg-paper border border-rule rounded-[16px] overflow-hidden font-body">
          {pessoas.map((p) => {
            const texto = textoDeAgradecimento({
              nome: p.name, mes: m, valor: p.total, pecas: p.pecas,
              atendimentos: textoDeAtendimentos(atendimentos(p.total, valorDoAtendimento)),
            })
            const whatsapp = linkDoWhatsApp(p.phone, texto)
            const email = linkDoEmail(p.email, 'Obrigado por apoiar o Instituto Camaleão', texto)
            return (
              <li key={p.id} data-testid="pessoa-para-agradecer" className="px-6 py-4 border-b border-rule last:border-0 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-ink font-medium">{p.name}</div>
                  <div className="text-xs text-muted mt-0.5">
                    {p.total > 0 && `R$ ${formatBRL(p.total)} · ${textoDeAtendimentos(atendimentos(p.total, valorDoAtendimento))}`}
                    {p.total > 0 && p.pecas > 0 && ' · '}
                    {p.pecas > 0 && `${p.pecas} ${p.pecas === 1 ? 'peça' : 'peças'}`}
                  </div>
                </div>
                <div data-testid="situacao-do-agradecimento" className="text-xs text-muted">
                  {p.agradecidaEm ? (
                    `Agradecida em ${dia(p.agradecidaEm)} (${p.canal === 'whatsapp' ? 'WhatsApp' : 'e-mail'})`
                  ) : !p.podeReceber ? (
                    'Sem autorização de mensagens'
                  ) : !whatsapp && !email ? (
                    'Autorizou, mas não tem contato registrado'
                  ) : (
                    <BotaoDeAgradecer clientId={p.id} periodo={periodo} whatsapp={whatsapp} email={email} />
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {semAutorizacao > 0 && (
        <p className="font-body text-xs text-muted mt-3">
          {semAutorizacao} {semAutorizacao === 1 ? 'pessoa contribuiu e não pode' : 'pessoas contribuíram e não podem'} receber mensagem: não autorizaram{termoAprovado ? '' : ', ou o termo ainda não foi aprovado'}.
        </p>
      )}
    </div>
  )
}
