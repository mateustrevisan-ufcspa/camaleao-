'use client'

import { useState, useTransition } from 'react'
import { Plus } from 'lucide-react'
import { criarCampanha, encerrarCampanha } from '@/actions/campanhas'
import { formatBRL } from '@/lib/utils'
import type { CampanhaComTotal } from '@/types'

// "2026-07-01" vira "01/07/2026", sem fuso no meio.
const dataBR = (d: string) => d.split('-').reverse().join('/')

function periodo(c: CampanhaComTotal) {
  return c.ends_on ? `${dataBR(c.starts_on)} a ${dataBR(c.ends_on)}` : `desde ${dataBR(c.starts_on)}`
}

export function Campanhas({ campanhas }: { campanhas: CampanhaComTotal[] }) {
  const [erro, setErro] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function criar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro(null)
    const form = e.currentTarget
    const fd = new FormData(form)
    startTransition(async () => {
      const res = await criarCampanha(fd)
      if (res?.error) {
        setErro(res.error)
        return
      }
      form.reset()
    })
  }

  function alternar(c: CampanhaComTotal) {
    setErro(null)
    startTransition(async () => {
      const res = await encerrarCampanha(c.id, !c.closed_at)
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

      <form onSubmit={criar} className="bg-paper border border-rule rounded-[16px] p-6 grid gap-3 grid-cols-1 md:grid-cols-[2fr_1fr_1fr_1fr_auto] items-end">
        <div>
          <label htmlFor="nome-da-campanha" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
            Nome da campanha
          </label>
          <input id="nome-da-campanha" name="name" required maxLength={80} placeholder="Natalenço 2026" className="input-base" />
        </div>
        <div>
          <label htmlFor="inicio-da-campanha" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
            Início
          </label>
          <input id="inicio-da-campanha" name="starts_on" type="date" required className="input-base" />
        </div>
        <div>
          <label htmlFor="fim-da-campanha" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
            Fim previsto
          </label>
          <input id="fim-da-campanha" name="ends_on" type="date" className="input-base" />
        </div>
        <div>
          <label htmlFor="custo-da-campanha" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
            Custo estimado
          </label>
          <input id="custo-da-campanha" name="estimated_cost" inputMode="decimal" placeholder="0,00" className="input-base" />
        </div>
        <button type="submit" disabled={isPending} className="btn-dark disabled:opacity-50">
          <Plus size={14} /> Cadastrar
        </button>
      </form>

      <div className="bg-paper border border-rule rounded-[16px] overflow-hidden">
        <div className="px-6 py-5 border-b border-rule">
          <h3 className="font-display text-xl text-ink font-medium m-0">Arrecadado, custo e diferença</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-body min-w-[720px]">
            <thead>
              <tr className="bg-bg">
                {['Campanha', 'Período', 'Doações', 'Arrecadado', 'Custo', 'Diferença', ''].map((h) => (
                  <th key={h} className="text-left px-6 py-3.5 text-[11px] text-muted tracking-[1.5px] uppercase font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {campanhas.map((c) => (
                <tr key={c.id} className="border-t border-rule">
                  <td className="px-6 py-4 text-sm text-ink">
                    {c.name}
                    {c.closed_at && (
                      <span className="block text-xs text-muted">
                        encerrada em {new Date(c.closed_at).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs text-muted">{periodo(c)}</td>
                  <td className="px-6 py-4 text-sm text-ink">{c.donation_count}</td>
                  <td className="px-6 py-4 text-sm font-display text-emerald">R$ {formatBRL(c.raised)}</td>
                  <td className="px-6 py-4 text-sm font-display text-ink">R$ {formatBRL(c.estimated_cost)}</td>
                  <td
                    data-testid="diferenca-da-campanha"
                    className={`px-6 py-4 text-sm font-display font-medium ${c.difference < 0 ? 'text-coral' : 'text-emerald'}`}
                  >
                    {c.difference < 0 ? '− ' : ''}R$ {formatBRL(Math.abs(c.difference))}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button type="button" onClick={() => alternar(c)} disabled={isPending} className="chip bg-bg">
                      {c.closed_at ? 'Reabrir' : 'Encerrar'}
                    </button>
                  </td>
                </tr>
              ))}
              {campanhas.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-sm text-muted font-body italic">
                    Nenhuma campanha cadastrada ainda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="px-6 py-4 m-0 border-t border-rule font-body text-[12px] text-muted">
          Diferença é o arrecadado menos o custo estimado. Campanha encerrada sai do formulário de doação e continua aqui, com o histórico.
        </p>
      </div>
    </div>
  )
}