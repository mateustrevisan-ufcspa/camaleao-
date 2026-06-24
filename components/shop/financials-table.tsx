'use client'

import { useTransition } from 'react'
import { Check, Download } from 'lucide-react'
import { Tag } from '@/components/ui/tag'
import { markSaleConfirmed } from '@/actions/sales'
import { formatBRL } from '@/lib/utils'
import type { Sale } from '@/types'

interface FinancialsTableProps {
  sales: Sale[]
}

export function FinancialsTable({ sales }: FinancialsTableProps) {
  const [isPending, startTransition] = useTransition()

  function handleConfirm(id: string) {
    startTransition(() => markSaleConfirmed(id))
  }

  function handleExport() {
    const header = ['Data', 'Hora', 'Compradora', 'Categoria', 'Bruto (R$)', 'Líquido (R$)', 'Pagamento', 'Banco', 'Parcelas', 'Conferido']
    const rows = sales.map((v) => [
      new Date(v.sold_at).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      v.time,
      v.customer_name,
      v.category,
      v.amount.toFixed(2),
      (v.net_amount ?? v.amount).toFixed(2),
      v.payment_method,
      v.bank ?? '',
      v.installments ?? '',
      v.confirmed ? 'Sim' : 'Não',
    ])

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `vendas-camaleao-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const totalGross = sales.reduce((s, v) => s + v.amount, 0)
  const totalNet = sales.reduce((s, v) => s + (v.net_amount ?? v.amount), 0)
  const fees = totalGross - totalNet

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-paper border border-rule rounded-[16px] p-6">
          <div className="text-[13px] text-muted font-body mb-2 tracking-wide">Valor bruto · mês</div>
          <div className="font-display text-[38px] font-bold tracking-[-1.2px] leading-none text-ink">
            R$ {formatBRL(totalGross)}
          </div>
        </div>
        <div className="rounded-[16px] p-6" style={{ backgroundColor: '#DCEBE0' }}>
          <div className="text-[13px] text-muted font-body mb-2 tracking-wide">Valor líquido recebido</div>
          <div className="font-display text-[38px] font-bold tracking-[-1.2px] leading-none text-emerald">
            R$ {formatBRL(totalNet)}
          </div>
        </div>
        <div className="bg-paper border border-rule rounded-[16px] p-6">
          <div className="text-[13px] text-muted font-body mb-2 tracking-wide">Taxas / descontos</div>
          <div className="font-display text-[38px] font-bold tracking-[-1.2px] leading-none text-coral">
            R$ {formatBRL(fees)}
          </div>
        </div>
      </div>

      <div className="bg-paper border border-rule rounded-[16px] overflow-hidden">
        <div className="px-4 md:px-6 py-5 border-b border-rule flex justify-between items-center">
          <h3 className="font-display text-xl text-ink font-medium m-0">Vendas para conciliar</h3>
          <div className="flex gap-2">
            <button onClick={handleExport} className="chip bg-bg"><Download size={11} /> Exportar CSV</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-body min-w-[560px]">
            <thead>
              <tr className="bg-bg">
                {['Data', 'Compradora', 'Bruto', 'Líquido', 'Banco', 'Status'].map((h) => (
                  <th key={h} className="text-left px-6 py-3.5 text-[11px] text-muted tracking-[1.5px] uppercase font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sales.map((v, i) => (
                <tr key={v.id} className={i < sales.length - 1 ? 'border-b border-rule' : ''}>
                  <td className="px-6 py-4 font-mono text-xs text-muted">
                    {new Date(v.sold_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' })}
                  </td>
                  <td className="px-6 py-4 text-sm text-ink">{v.customer_name}</td>
                  <td className="px-6 py-4 text-sm text-ink font-display">R$ {formatBRL(v.amount)}</td>
                  <td className="px-6 py-4 text-sm font-display font-medium text-emerald">R$ {formatBRL(v.net_amount ?? v.amount)}</td>
                  <td className="px-6 py-4"><Tag>{v.bank ?? v.payment_method}</Tag></td>
                  <td className="px-6 py-4">
                    {v.confirmed ? (
                      <span className="flex items-center gap-1.5 text-xs text-emerald font-medium">
                        <Check size={13} /> Conferido
                      </span>
                    ) : (
                      <button
                        onClick={() => handleConfirm(v.id)}
                        disabled={isPending}
                        className="chip bg-accent-soft text-accent-deep border-accent-soft font-medium disabled:opacity-50"
                      >
                        Conferir
                      </button>
                    )}
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
