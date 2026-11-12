'use client'

import { useState, useTransition } from 'react'
import { Mail, MessageCircle } from 'lucide-react'
import { registrarAgradecimento } from '@/actions/agradecimentos'

// Registra no servidor antes de abrir o WhatsApp ou o e-mail: sem registro, nada sai.
export function BotaoDeAgradecer({ clientId, periodo, whatsapp, email }: {
  clientId: string; periodo: string; whatsapp: string | null; email: string | null
}) {
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  function agradecer(canal: 'whatsapp' | 'email', link: string) {
    setErro(null)
    // A janela abre já no clique (senão o navegador bloqueia) e só recebe o link depois do registro.
    const janela = canal === 'whatsapp' ? window.open('about:blank', '_blank') : null
    startTransition(async () => {
      const r = await registrarAgradecimento(clientId, periodo, canal)
      if (r?.error) {
        janela?.close()
        setErro(r.error)
        return
      }
      if (janela) janela.location.href = link
      else window.location.href = link
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        {whatsapp && (
          <button type="button" disabled={isPending} onClick={() => agradecer('whatsapp', whatsapp)} className="chip bg-bg disabled:opacity-50">
            <MessageCircle size={11} /> WhatsApp
          </button>
        )}
        {email && (
          <button type="button" disabled={isPending} onClick={() => agradecer('email', email)} className="chip bg-bg disabled:opacity-50">
            <Mail size={11} /> E-mail
          </button>
        )}
      </div>
      {erro && <span role="alert" className="text-xs text-coral">{erro}</span>}
    </div>
  )
}
