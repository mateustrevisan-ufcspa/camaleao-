'use client'

import { useState, useTransition } from 'react'
import { registrarTriagemDaDoacao } from '@/actions/itens'
import { MAXIMO_DA_CONTAGEM } from '@/lib/triagem'
import type { TriagemPendente } from '@/types'

const dataBR = (iso: string) =>
  new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', timeZone: 'America/Sao_Paulo' })

// US-27 · Doações à espera da triagem, de qualquer dia. Quem é do balcão registra
// as três contagens do papel da sacola; o resto da doação não muda.
export function TriagemPendenteLista({ pendentes }: { pendentes: TriagemPendente[] }) {
  const [erro, setErro] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function registrar(id: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await registrarTriagemDaDoacao(id, fd)
      if (res?.error) setErro(res.error)
    })
  }

  if (pendentes.length === 0) return null

  return (
    <div data-testid="triagem-pendente" className="bg-paper border border-rule rounded-[16px] overflow-hidden mb-8">
      <div className="px-4 md:px-6 py-5 border-b border-rule">
        <h3 className="font-display text-xl text-ink font-medium m-0">Triagem pendente ({pendentes.length})</h3>
        <p className="font-body text-xs text-muted mt-1 m-0">
          Doações sem as contagens, de qualquer dia. Quando o papel da sacola voltar da triagem, registre aqui.
        </p>
      </div>
      {erro && (
        <div className="mx-6 mt-4 rounded-[10px] px-4 py-3 font-body text-[13px]" style={{ backgroundColor: '#F8DCD2', color: '#D87560' }}>
          {erro}
        </div>
      )}
      <ul className="m-0 p-0 list-none">
        {pendentes.map((p) => (
          <li key={p.id} data-testid="pendente" className="border-t border-rule first:border-t-0 px-4 md:px-6 py-4">
            <form onSubmit={(e) => registrar(p.id, e)} className="flex flex-wrap items-end gap-3">
              <div className="min-w-[200px] flex-1">
                <div className="font-mono text-xs text-muted">{dataBR(p.donated_at)}</div>
                <div className="text-sm text-ink font-body">{p.donor_name}</div>
                <div className="text-xs text-muted font-body">
                  {p.category_name}
                  {p.notes ? ` · ${p.notes}` : ''}
                </div>
              </div>
              {(['aproveitadas', 'redoadas', 'descarte'] as const).map((campo) => (
                <label key={campo} className="text-[11px] font-body text-muted tracking-[1px] uppercase">
                  {campo === 'aproveitadas' ? 'Aproveitadas' : campo === 'redoadas' ? 'Redoadas' : 'Descarte'}
                  <input
                    name={campo}
                    type="number"
                    min="0"
                    max={MAXIMO_DA_CONTAGEM}
                    step="1"
                    inputMode="numeric"
                    required
                    className="input-base mt-1.5 w-[110px] normal-case"
                  />
                </label>
              ))}
              <button type="submit" disabled={isPending} className="btn-dark disabled:opacity-50">
                Registrar triagem
              </button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  )
}
