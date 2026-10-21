import Link from 'next/link'
import { Mail, MessageCircle } from 'lucide-react'
import { getAniversariantes } from '@/lib/store'
import { linkDoEmail, linkDoWhatsApp, numeroParaWhatsApp, textoDeAniversario } from '@/lib/mensagens'
import type { Aniversariante } from '@/types'

export const dynamic = 'force-dynamic'

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

// Mês de hoje em Brasília: o servidor roda em UTC.
function mesAtual(): number {
  return Number(new Intl.DateTimeFormat('en-US', { timeZone: 'America/Sao_Paulo', month: 'numeric' }).format(new Date()))
}

function canais(p: Aniversariante): string {
  const lista = [numeroParaWhatsApp(p.phone) ? 'WhatsApp' : '', linkDoEmail(p.email, '', '') ? 'e-mail' : ''].filter(Boolean)
  return lista.length > 0 ? lista.join(' e ') : 'sem contato registrado'
}

export default async function AniversariantesPage({
  searchParams,
}: {
  searchParams: Promise<{ mes?: string }>
}) {
  const { mes: mesPedido } = await searchParams
  const pedido = Number(mesPedido)
  const mes = Number.isInteger(pedido) && pedido >= 1 && pedido <= 12 ? pedido : mesAtual()
  const pessoas = await getAniversariantes(mes)

  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1000px]">
      <header className="mb-8">
        <div className="text-xs text-muted font-body tracking-[2px] uppercase mb-2">Clientes · Aniversariantes</div>
        <h1 className="font-display text-[28px] md:text-[40px] text-ink font-semibold tracking-[-1px] m-0 leading-[1.1]">
          Aniversariantes de {MESES[mes - 1]}
        </h1>
        <p className="font-body text-muted text-sm mt-2 max-w-[600px]">
          O botão abre o WhatsApp ou o e-mail com a mensagem pronta. Só aparece para quem autorizou receber mensagens do Instituto.
        </p>
      </header>

      <nav aria-label="Mês" className="flex flex-wrap gap-2 mb-6">
        {MESES.map((nome, i) => (
          <Link
            key={nome}
            href={`/clientes/aniversariantes?mes=${i + 1}`}
            aria-current={i + 1 === mes ? 'page' : undefined}
            className={`chip no-underline transition-colors ${
              i + 1 === mes ? 'bg-ink text-bg border-ink' : 'bg-paper text-muted border-rule'
            }`}
          >
            {nome.slice(0, 3)}
          </Link>
        ))}
      </nav>

      {pessoas.length === 0 ? (
        <div className="bg-paper border border-rule rounded-[16px] p-10 text-center font-body text-sm text-muted">
          Ninguém faz aniversário em {MESES[mes - 1].toLowerCase()}.
        </div>
      ) : (
        <ul data-testid="aniversariantes" className="m-0 p-0 list-none bg-paper border border-rule rounded-[16px] overflow-hidden">
          {pessoas.map((p) => {
            const texto = textoDeAniversario(p.name)
            const whatsapp = linkDoWhatsApp(p.phone, texto)
            const email = linkDoEmail(p.email, 'Feliz aniversário!', texto)
            return (
              <li
                key={p.id}
                data-testid="aniversariante"
                className="px-6 py-4 border-b border-rule last:border-0 flex flex-wrap items-center justify-between gap-3"
              >
                <div className="flex items-center gap-4">
                  <span className="font-display text-[22px] text-coral w-9 text-center shrink-0">
                    {String(p.dia).padStart(2, '0')}
                  </span>
                  <div>
                    <div data-testid="nome" className="font-body text-sm text-ink font-medium">{p.name}</div>
                    <div className="font-body text-xs text-muted mt-0.5">{canais(p)}</div>
                  </div>
                </div>
                {!p.autorizou ? (
                  <span className="font-body text-xs text-muted">Sem autorização de mensagens</span>
                ) : !whatsapp && !email ? (
                  <span className="font-body text-xs text-muted">Autorizou, mas não tem contato registrado</span>
                ) : (
                  <div className="flex gap-2">
                    {whatsapp && (
                      <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="chip bg-bg no-underline">
                        <MessageCircle size={11} /> WhatsApp
                      </a>
                    )}
                    {email && (
                      <a href={email} className="chip bg-bg no-underline">
                        <Mail size={11} /> E-mail
                      </a>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
