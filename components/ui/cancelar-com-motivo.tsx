'use client'

import { useState, useTransition } from 'react'

export function CancelarComMotivo({ rotulo, cancelar }: { rotulo: string; cancelar: (motivo: string) => Promise<{ error: string } | void> }) {
  const [aberto, setAberto] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!aberto) return <button type="button" onClick={() => setAberto(true)} className="chip bg-bg">{rotulo}</button>

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <input aria-label="Motivo do cancelamento" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo (obrigatório)" maxLength={300} className="input-base py-1 text-xs w-[200px]" />
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(async () => {
            setErro(null)
            const r = await cancelar(motivo)
            if (r?.error) setErro(r.error)
            else { setAberto(false); setMotivo('') }
          })}
          className="chip bg-coral text-white border-coral disabled:opacity-50"
        >
          Confirmar cancelamento
        </button>
        <button type="button" disabled={isPending} onClick={() => { setAberto(false); setMotivo(''); setErro(null) }} className="chip bg-bg">Voltar</button>
      </div>
      {erro && <span role="alert" className="text-xs text-coral">{erro}</span>}
    </div>
  )
}
