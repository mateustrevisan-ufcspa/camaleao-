'use client'

import { Download } from 'lucide-react'
import { Tag } from '@/components/ui/tag'
import type { DonationItem } from '@/types'

const COND_LABEL = { good: 'Bom', needs_review: 'Revisar' } as const
const DEST_LABEL = { stock: 'Estoque', direct: 'Direto' } as const

export function DonationsItemsList({ donations }: { donations: DonationItem[] }) {
  const totalPieces = donations.reduce((s, d) => s + (d.quantity ?? 0), 0)
  const toStock = donations.filter((d) => d.destination === 'stock').reduce((s, d) => s + (d.quantity ?? 0), 0)

  function handleExport() {
    const header = ['Data', 'Doador', 'Telefone', 'Categoria', 'Quantidade', 'Estado', 'Destino', 'Observações']
    const rows = donations.map((d) => [
      new Date(d.donated_at).toLocaleDateString('pt-BR'),
      d.donor_name, d.donor_phone, d.category_name, d.quantity,
      COND_LABEL[d.condition], DEST_LABEL[d.destination], d.notes ?? '',
    ])
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `doacoes-itens-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-paper border border-rule rounded-[16px] p-6">
          <div className="text-[13px] text-muted font-body mb-2 tracking-wide">Peças recebidas</div>
          <div className="font-display text-[38px] font-bold tracking-[-1.2px] leading-none text-ink">{totalPieces}</div>
        </div>
        <div className="rounded-[16px] p-6" style={{ backgroundColor: '#E2DCF3' }}>
          <div className="text-[13px] text-muted font-body mb-2 tracking-wide">Encaminhadas ao estoque</div>
          <div className="font-display text-[38px] font-bold tracking-[-1.2px] leading-none text-purple">{toStock}</div>
        </div>
        <div className="bg-paper border border-rule rounded-[16px] p-6">
          <div className="text-[13px] text-muted font-body mb-2 tracking-wide">Doações registradas</div>
          <div className="font-display text-[38px] font-bold tracking-[-1.2px] leading-none text-ink">{donations.length}</div>
        </div>
      </div>

      <div className="bg-paper border border-rule rounded-[16px] overflow-hidden">
        <div className="px-4 md:px-6 py-5 border-b border-rule flex justify-between items-center">
          <h3 className="font-display text-xl text-ink font-medium m-0">Itens recebidos</h3>
          <button onClick={handleExport} className="chip bg-bg"><Download size={11} /> Exportar CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-body min-w-[640px]">
            <thead>
              <tr className="bg-bg">
                {['Data', 'Doador', 'Categoria', 'Qtd', 'Estado', 'Destino', 'Obs.'].map((h) => (
                  <th key={h} className="text-left px-6 py-3.5 text-[11px] text-muted tracking-[1.5px] uppercase font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {donations.map((d, i) => (
                <tr key={d.id} className={i < donations.length - 1 ? 'border-b border-rule' : ''}>
                  <td className="px-6 py-4 font-mono text-xs text-muted">
                    {new Date(d.donated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-ink">{d.donor_name}</div>
                    {d.donor_phone && <div className="text-xs text-muted">{d.donor_phone}</div>}
                  </td>
                  <td className="px-6 py-4"><Tag>{d.category_name}</Tag></td>
                  <td className="px-6 py-4 text-sm font-display font-medium text-ink">{d.quantity}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-body px-2 py-1 rounded-full"
                      style={d.condition === 'good' ? { backgroundColor: '#DCEBE0', color: '#2E5C3E' } : { backgroundColor: '#FBE3CA', color: '#C97D3E' }}>
                      {COND_LABEL[d.condition]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted">{DEST_LABEL[d.destination]}</td>
                  <td className="px-6 py-4 text-xs text-muted max-w-[180px] truncate">{d.notes ?? '—'}</td>
                </tr>
              ))}
              {donations.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-10 text-center text-sm text-muted font-body italic">Nenhuma doação registrada ainda</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
