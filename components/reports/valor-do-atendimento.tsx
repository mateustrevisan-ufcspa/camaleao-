'use client'

import { useState, useTransition } from 'react'
import { definirValorDoAtendimento } from '@/actions/atendimento'
import { VALOR_INICIAL_DO_ATENDIMENTO } from '@/lib/atendimentos'
import { formatBRL } from '@/lib/utils'
import type { AlteracaoDoValorDoAtendimento } from '@/types'

const dataEHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' })

export function ValorDoAtendimento({ historico }: { historico: AlteracaoDoValorDoAtendimento[] }) {
  const [erro, setErro] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const vigente = historico[0]?.valor ?? VALOR_INICIAL_DO_ATENDIMENTO

  function definir(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro(null)
    const form = e.currentTarget
    const fd = new FormData(form)
    startTransition(async () => {
      const res = await definirValorDoAtendimento(fd)
      if (res?.error) {
        setErro(res.error)
        return
      }
      form.reset()
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-paper border border-rule rounded-[16px] p-6">
        <div className="text-[13px] text-muted font-body mb-2 tracking-wide">Valor em vigor</div>
        <div data-testid="valor-em-vigor" className="font-display text-[38px] font-bold tracking-[-1.2px] leading-none text-ink">
          R$ {formatBRL(vigente)}
        </div>
      </div>

      {erro && (
        <div className="rounded-[10px] px-4 py-3 font-body text-[13px]" style={{ backgroundColor: '#F8DCD2', color: '#D87560' }}>
          {erro}
        </div>
      )}

      <form onSubmit={definir} className="bg-paper border border-rule rounded-[16px] p-6 grid gap-3 grid-cols-1 md:grid-cols-[1fr_auto] items-end">
        <div>
          <label htmlFor="novo-valor-do-atendimento" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
            Novo valor de um atendimento
          </label>
          <input id="novo-valor-do-atendimento" name="valor" required inputMode="decimal" placeholder="50,00" className="input-base" />
        </div>
        <button type="submit" disabled={isPending} className="btn-dark disabled:opacity-50">
          Alterar valor
        </button>
      </form>

      <div className="bg-paper border border-rule rounded-[16px] overflow-hidden">
        <div className="px-6 py-5 border-b border-rule">
          <h3 className="font-display text-xl text-ink font-medium m-0">Quem alterou e quando</h3>
        </div>
        <div className="overflow-x-auto">
          <table data-testid="historico-do-valor" className="w-full border-collapse font-body min-w-[520px]">
            <thead>
              <tr className="bg-bg">
                {['Valor', 'Quando', 'Quem'].map((h) => (
                  <th key={h} className="text-left px-6 py-3.5 text-[11px] text-muted tracking-[1.5px] uppercase font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historico.map((h) => (
                <tr key={h.id} className="border-t border-rule">
                  <td className="px-6 py-3.5 text-sm text-ink">R$ {formatBRL(h.valor)}</td>
                  <td className="px-6 py-3.5 text-sm text-muted">{dataEHora(h.definidoEm)}</td>
                  <td className="px-6 py-3.5 text-sm text-muted">
                    {h.definidoPor ?? 'valor inicial, informado pela coordenação em 03/09/2026'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
