'use client'

import { useEffect, useState, useTransition } from 'react'
import { MessageCircle } from 'lucide-react'
import { authorizeMessages, fetchMessageConsent, revokeMessages } from '@/actions/consent'
import { TERMO_MENSAGENS } from '@/lib/termo-mensagens'
import type { MessageConsent } from '@/types'

function dia(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })
}

// Autorização de mensagens na ficha da pessoa (US-07).
// A ficha monta este componente com key={client.id}: trocar de pessoa recomeça o estado.
export function MessageConsentCard({ clientId }: { clientId: string }) {
  // undefined = carregando; null = nunca foi perguntada.
  const [consent, setConsent] = useState<MessageConsent | null | undefined>(undefined)
  const [lendoTermo, setLendoTermo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    let ativo = true
    fetchMessageConsent(clientId)
      .then((c) => { if (ativo) setConsent(c) })
      .catch((e) => {
        console.error(e)
        if (ativo) setError('Não foi possível carregar a autorização.')
      })
    return () => { ativo = false }
  }, [clientId])

  function registrar(acao: (id: string) => Promise<MessageConsent | null>) {
    setError(null)
    startTransition(async () => {
      try {
        setConsent(await acao(clientId))
        setLendoTermo(false)
      } catch (e) {
        console.error(e)
        setError('Não foi possível registrar. Tente novamente.')
      }
    })
  }

  const situacao =
    consent === undefined ? 'Carregando...'
    : consent === null ? 'Ainda não foi perguntada. Sem autorização, não recebe mensagens.'
    : consent.authorized ? `Autorizou em ${dia(consent.recorded_at)} (termo ${consent.term_version}).`
    : `Retirou a autorização em ${dia(consent.recorded_at)}. Não recebe mensagens.`

  return (
    <div className="p-6 border-b border-rule" data-testid="autorizacao-de-mensagens">
      <h4 className="text-[11px] text-muted tracking-[1.5px] uppercase font-body mb-3.5 flex items-center gap-1.5">
        <MessageCircle size={12} /> Mensagens do Instituto
      </h4>
      <p className="font-body text-[13px] text-ink m-0 mb-3">{situacao}</p>

      {lendoTermo && (
        <div className="bg-bg border border-rule rounded-[10px] p-4 mb-3">
          <p className="font-body text-[11px] text-muted tracking-[1px] uppercase m-0 mb-2">
            Leia para a pessoa (termo {TERMO_MENSAGENS.versao})
          </p>
          <p className="font-body text-[13px] text-ink m-0 mb-3">{TERMO_MENSAGENS.texto}</p>
          <div className="flex gap-2">
            <button type="button" disabled={isPending} onClick={() => registrar(authorizeMessages)} className="chip bg-ink text-bg border-ink disabled:opacity-50">
              A pessoa autorizou
            </button>
            <button type="button" disabled={isPending} onClick={() => setLendoTermo(false)} className="chip">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {consent !== undefined && !lendoTermo && (
        consent?.authorized ? (
          <button type="button" disabled={isPending} onClick={() => registrar(revokeMessages)} className="chip disabled:opacity-50">
            Retirar autorização
          </button>
        ) : (
          <button type="button" onClick={() => setLendoTermo(true)} className="chip bg-accent-soft text-accent-deep border-accent-soft">
            Registrar autorização
          </button>
        )
      )}

      {error && <p className="font-body text-[12px] mt-3 m-0" style={{ color: '#D87560' }}>{error}</p>}
    </div>
  )
}
