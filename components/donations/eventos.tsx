'use client'

import { useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import { alternarEvento, criarEvento } from '@/actions/eventos'
import { formatBRL } from '@/lib/utils'
import type { EventoComTotal } from '@/types'

// A data do evento vem como "2026-05-20": formatada à mão, sem fuso no meio.
export const dataDoEvento = (d: string) => {
  const [ano, mes, dia] = d.split('-')
  return `${dia}/${mes}/${ano}`
}

export function Eventos({ eventos }: { eventos: EventoComTotal[] }) {
  const [erro, setErro] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function criar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro(null)
    const form = e.currentTarget
    const fd = new FormData(form)
    startTransition(async () => {
      const res = await criarEvento(fd)
      if (res?.error) {
        setErro(res.error)
        return
      }
      form.reset()
    })
  }

  function alternar(ev: EventoComTotal) {
    setErro(null)
    startTransition(async () => {
      const res = await alternarEvento(ev.id, !ev.active)
      if (res?.error) setErro(res.error)
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {erro && (
        <div className="rounded-[10px] px-4 py-3 font-body text-[13px]" style={{ backgroundColor: '#F8DCD2', color: '#D87560' }}>
          {erro}
        </div>
      )}

      <form onSubmit={criar} className="bg-paper border border-rule rounded-[16px] p-6 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]">
          <label htmlFor="nome-do-evento" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
            Nome do evento
          </label>
          <input id="nome-do-evento" name="name" required maxLength={80} placeholder="Jantar de primavera" className="input-base" />
        </div>
        <div>
          <label htmlFor="data-do-evento" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
            Data do evento
          </label>
          <input id="data-do-evento" name="event_date" type="date" required className="input-base" />
        </div>
        <button type="submit" disabled={isPending} className="btn-dark disabled:opacity-50">
          <Plus size={14} /> Cadastrar evento
        </button>
      </form>

      <div className="bg-paper border border-rule rounded-[16px] overflow-hidden">
        <div className="px-6 py-5 border-b border-rule">
          <h3 className="font-display text-xl text-ink font-medium m-0">Eventos e arrecadação</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-body min-w-[560px]">
            <thead>
              <tr className="bg-bg">
                {['Evento', 'Data', 'Doações', 'Arrecadado', ''].map((h) => (
                  <th key={h} className="text-left px-6 py-3.5 text-[11px] text-muted tracking-[1.5px] uppercase font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {eventos.map((ev) => (
                <tr key={ev.id} className="border-t border-rule">
                  <td className="px-6 py-4 text-sm text-ink">
                    {ev.name}
                    {!ev.active && <span className="ml-2 text-xs text-muted">(desativado)</span>}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-muted">{dataDoEvento(ev.event_date)}</td>
                  <td className="px-6 py-4 text-sm text-ink">{ev.donation_count}</td>
                  <td className="px-6 py-4 text-sm font-display font-medium text-emerald">R$ {formatBRL(ev.total)}</td>
                  <td className="px-6 py-4 text-right">
                    <button type="button" onClick={() => alternar(ev)} disabled={isPending} className="chip bg-bg">
                      {ev.active ? 'Desativar' : 'Reativar'}
                    </button>
                  </td>
                </tr>
              ))}
              {eventos.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-muted font-body italic">
                    Nenhum evento cadastrado ainda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}