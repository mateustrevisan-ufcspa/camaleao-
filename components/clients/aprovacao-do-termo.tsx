'use client'

import { useState, useTransition } from 'react'
import { registrarAprovacaoDoTermo } from '@/actions/agradecimentos'
import { TERMO_MENSAGENS } from '@/lib/termo-mensagens'
import { brTodayStr } from '@/lib/utils'

export function AprovacaoDoTermo() {
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setErro(null)
    startTransition(async () => {
      const r = await registrarAprovacaoDoTermo(fd)
      if (r?.error) setErro(r.error)
    })
  }

  return (
    <form onSubmit={enviar} data-testid="aprovacao-do-termo" className="rounded-[16px] p-6 border mb-6 font-body" style={{ backgroundColor: '#FBE3CA', borderColor: '#C97D3E' }}>
      <div className="text-sm text-ink font-medium">O Instituto ainda não aprovou o texto de autorização de mensagens (versão {TERMO_MENSAGENS.versao}).</div>
      <p className="text-xs text-muted mt-1 mb-3">
        Enquanto não houver aprovação registrada, ninguém aparece para agradecimento. Quando a coordenação do Instituto aprovar, registre aqui a data.
      </p>
      <blockquote className="text-xs text-ink bg-paper rounded-[10px] p-3 m-0 mb-3">{TERMO_MENSAGENS.texto}</blockquote>
      <div className="flex flex-wrap gap-3 items-end">
        <label className="text-[11px] text-muted tracking-[1px] uppercase">Aprovado em
          <input name="aprovado_em" type="date" max={brTodayStr()} required className="input-base mt-1.5" />
        </label>
        <label className="text-[11px] text-muted tracking-[1px] uppercase flex-1 min-w-[220px]">Observação
          <input name="observacao" maxLength={300} placeholder="Ex.: aprovado pela Flávia no WhatsApp" className="input-base mt-1.5" />
        </label>
        <button type="submit" disabled={isPending} className="chip bg-ink text-bg border-ink disabled:opacity-50">Registrar aprovação</button>
      </div>
      {erro && <div role="alert" className="text-xs text-coral mt-2">{erro}</div>}
    </form>
  )
}
