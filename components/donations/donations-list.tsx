'use client'

import { Download } from 'lucide-react'
import { Tag } from '@/components/ui/tag'
import { formatBRL } from '@/lib/utils'
import type { DonationCash } from '@/types'

interface DonationsListProps {
  donations: DonationCash[]
}

export function DonationsList({ donations }: DonationsListProps) {
  const total = donations.reduce((s, d) => s + d.amount, 0)
  const monthly = donations.filter((d) => d.frequency === 'monthly')
  const recurring = monthly.reduce((s, d) => s + d.amount, 0)

  function handleExport() {
    const header = ['Data', 'Doador', 'Telefone', 'Valor (R$)', 'Origem', 'Frequência', 'Observações']
    const rows = donations.map((d) => [
      new Date(d.donated_at).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      d.donor_name,
      d.donor_phone,
      d.amount.toFixed(2),
      d.origin,
      d.frequency,
      d.notes ?? '',
    ])

    const csv = [header, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n')

    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `doacoes-dinheiro-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-paper border border-rule rounded-[16px] p-6">
          <div className="text-[13px] text-muted font-body mb-2 tracking-wide">Total recebido · mês</div>
          <div className="font-display text-[38px] font-bold tracking-[-1.2px] leading-none text-ink">
            R$ {formatBRL(total)}
          </div>
        </div>
        <div className="rounded-[16px] p-6" style={{ backgroundColor: '#DCEBE0' }}>
          <div className="text-[13px] text-muted font-body mb-2 tracking-wide">Receita recorrente / mês</div>
          <div className="font-display text-[38px] font-bold tracking-[-1.2px] leading-none text-emerald">
            R$ {formatBRL(recurring)}
          </div>
        </div>
        <div className="bg-paper border border-rule rounded-[16px] p-6">
          <div className="text-[13px] text-muted font-body mb-2 tracking-wide">Total de doadores</div>
          <div className="font-display text-[38px] font-bold tracking-[-1.2px] leading-none text-ink">
            {donations.length}
          </div>
        </div>
      </div>

      <div className="bg-paper border border-rule rounded-[16px] overflow-hidden">
        <div className="px-4 md:px-6 py-5 border-b border-rule flex justify-between items-center">
          <h3 className="font-display text-xl text-ink font-medium m-0">Doações registradas</h3>
          <button onClick={handleExport} className="chip bg-bg"><Download size={11} /> Exportar CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-body min-w-[560px]">
            <thead>
              <tr className="bg-bg">
                {['Data', 'Doador', 'Valor', 'Origem', 'Frequência', 'Obs.'].map((h) => (
                  <th key={h} className="text-left px-6 py-3.5 text-[11px] text-muted tracking-[1.5px] uppercase font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {donations.map((d, i) => (
                <tr key={d.id} className={i < donations.length - 1 ? 'border-b border-rule' : ''}>
                  <td className="px-6 py-4 font-mono text-xs text-muted">
                    {new Date(d.donated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit', timeZone: 'America/Sao_Paulo' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-ink">{d.donor_name}</div>
                    {d.donor_phone && <div className="text-xs text-muted">{d.donor_phone}</div>}
                  </td>
                  <td className="px-6 py-4 text-sm font-display font-medium text-emerald">R$ {formatBRL(d.amount)}</td>
                  <td className="px-6 py-4"><Tag>{d.origin}</Tag></td>
                  <td className="px-6 py-4">
                    <span
                      className="text-xs font-body px-2 py-1 rounded-full"
                      style={d.frequency === 'monthly' ? { backgroundColor: '#DCEBE0', color: '#2E5C3E' } : { backgroundColor: '#F5F0EA', color: '#7A6E8A' }}
                    >
                      {d.frequency === 'monthly' ? 'mensal' : 'pontual'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-muted max-w-[180px] truncate">{d.notes ?? '—'}</td>
                </tr>
              ))}
              {donations.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-muted font-body italic">
                    Nenhuma doação registrada ainda
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
