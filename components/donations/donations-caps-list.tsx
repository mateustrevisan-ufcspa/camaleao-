'use client'

import { Download } from 'lucide-react'
import type { DonationCaps } from '@/types'

export function DonationsCapsList({ donations }: { donations: DonationCaps[] }) {
  const totalCaps = donations.reduce((s, d) => s + (d.quantity ?? 0), 0)
  const totalKg = donations.reduce((s, d) => s + (Number(d.weight_kg) || 0), 0)

  function handleExport() {
    const header = ['Data', 'Doador', 'Telefone', 'Quantidade', 'Peso (kg)', 'Observações']
    const rows = donations.map((d) => [
      new Date(d.donated_at).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      d.donor_name, d.donor_phone, d.quantity ?? '', d.weight_kg ?? '', d.notes ?? '',
    ])
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `doacoes-tampinhas-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-[16px] p-6" style={{ backgroundColor: '#FDE7E7' }}>
          <div className="text-[13px] text-muted font-body mb-2 tracking-wide">Tampinhas (unidades)</div>
          <div className="font-display text-[38px] font-bold tracking-[-1.2px] leading-none" style={{ color: '#E25A8F' }}>
            {totalCaps.toLocaleString('pt-BR')}
          </div>
        </div>
        <div className="bg-paper border border-rule rounded-[16px] p-6">
          <div className="text-[13px] text-muted font-body mb-2 tracking-wide">Peso total</div>
          <div className="font-display text-[38px] font-bold tracking-[-1.2px] leading-none text-ink">
            {totalKg.toFixed(1)} kg
          </div>
        </div>
        <div className="bg-paper border border-rule rounded-[16px] p-6">
          <div className="text-[13px] text-muted font-body mb-2 tracking-wide">Doações registradas</div>
          <div className="font-display text-[38px] font-bold tracking-[-1.2px] leading-none text-ink">{donations.length}</div>
        </div>
      </div>

      <div className="bg-paper border border-rule rounded-[16px] overflow-hidden">
        <div className="px-4 md:px-6 py-5 border-b border-rule flex justify-between items-center">
          <h3 className="font-display text-xl text-ink font-medium m-0">Tampinhas recebidas</h3>
          <button onClick={handleExport} className="chip bg-bg"><Download size={11} /> Exportar CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-body min-w-[560px]">
            <thead>
              <tr className="bg-bg">
                {['Data', 'Doador', 'Quantidade', 'Peso (kg)', 'Obs.'].map((h) => (
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
                  <td className="px-6 py-4 text-sm font-display font-medium text-ink">{d.quantity != null ? d.quantity.toLocaleString('pt-BR') : '—'}</td>
                  <td className="px-6 py-4 text-sm text-ink">{d.weight_kg != null ? `${Number(d.weight_kg).toFixed(1)} kg` : '—'}</td>
                  <td className="px-6 py-4 text-xs text-muted max-w-[200px] truncate">{d.notes ?? '—'}</td>
                </tr>
              ))}
              {donations.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-sm text-muted font-body italic">Nenhuma doação registrada ainda</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
