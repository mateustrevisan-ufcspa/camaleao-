'use client'

import { useState, useTransition } from 'react'
import { formatBRL } from '@/lib/utils'

// US-33 · Custo de evento ou campanha, alterado na própria linha da tabela.
export function CustoEditavel({
  valor,
  rotulo,
  salvar,
}: {
  valor: number
  // Nome acessível do campo, por exemplo "Custo do evento Bazar de primavera".
  rotulo: string
  salvar: (fd: FormData) => Promise<{ error: string } | void>
}) {
  const [editando, setEditando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await salvar(fd)
      if (res?.error) {
        setErro(res.error)
        return
      }
      setEditando(false)
    })
  }

  function cancelar() {
    setErro(null)
    setEditando(false)
  }

  if (!editando) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-display text-ink">R$ {formatBRL(valor)}</span>
        <button
          type="button"
          onClick={() => setEditando(true)}
          aria-label={`Alterar ${rotulo.charAt(0).toLowerCase()}${rotulo.slice(1)}`}
          className="chip bg-bg"
        >
          Alterar
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={enviar} className="flex flex-wrap items-center gap-2">
      <input name="cost" aria-label={rotulo} inputMode="decimal" defaultValue={formatBRL(valor)} autoFocus className="input-base w-[110px]" />
      <button type="submit" disabled={isPending} className="chip bg-accent-soft text-accent-deep border-accent-soft disabled:opacity-50">
        Salvar
      </button>
      <button type="button" onClick={cancelar} disabled={isPending} className="chip bg-bg">
        Cancelar
      </button>
      {erro && <span className="w-full text-xs text-coral font-body">{erro}</span>}
    </form>
  )
}
