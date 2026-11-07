'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Download } from 'lucide-react'
import { Tag } from '@/components/ui/tag'
import { excluirDoacaoDeItem } from '@/actions/itens'
import { pecasDaDoacao, textoDaTriagem, triagemPendente } from '@/lib/triagem'
import { neutralizar } from '@/lib/planilha'
import type { DonationItem } from '@/types'

// "3 un · 1,5 kg", ou "só o registro" quando não veio nem quantidade nem peso.
function quantoChegou(d: DonationItem) {
  const partes = [
    d.quantity ? `${d.quantity} un` : '',
    d.weight_kg ? `${Number(d.weight_kg).toLocaleString('pt-BR')} kg` : '',
  ].filter(Boolean)
  return partes.length > 0 ? partes.join(' · ') : 'só o registro'
}

export function DonationsItemsList({ donations }: { donations: DonationItem[] }) {
  // US-04a: a exclusão pede confirmação na própria linha.
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function excluir(id: string) {
    setErro(null)
    startTransition(async () => {
      const res = await excluirDoacaoDeItem(id)
      if (res?.error) setErro(res.error)
      setConfirmando(null)
    })
  }

  // US-27: peças da triagem (ou a quantidade, na tampinha e nas doações antigas).
  const totalPieces = donations.reduce((s, d) => s + pecasDaDoacao(d), 0)
  const aproveitadas = donations.reduce((s, d) => s + (d.aproveitadas ?? 0), 0)

  function handleExport() {
    const header = ['Data', 'Doador', 'Telefone', 'Categoria', 'Quantidade', 'Peso (kg)', 'Aproveitadas', 'Redoadas', 'Descarte', 'Observações']
    const rows = donations.map((d) => [
      new Date(d.donated_at).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }),
      d.donor_name, d.donor_phone, d.category_name, d.quantity ?? '', d.weight_kg ?? '',
      d.aproveitadas ?? '', d.redoadas ?? '', d.descarte ?? '', d.notes ?? '',
    ])
    // US-09: célula que começa com sinal de fórmula sai como texto (injeção em planilha).
    const csv = [header, ...rows].map((r) => r.map((c) => `"${neutralizar(String(c)).replace(/"/g, '""')}"`).join(',')).join('\n')
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
          <div className="text-[13px] text-muted font-body mb-2 tracking-wide">Aproveitadas</div>
          <div className="font-display text-[38px] font-bold tracking-[-1.2px] leading-none text-purple">{aproveitadas}</div>
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
        {erro && (
          <div className="mx-6 mt-4 rounded-[10px] px-4 py-3 font-body text-[13px]" style={{ backgroundColor: '#F8DCD2', color: '#D87560' }}>
            {erro}
          </div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-body min-w-[760px]">
            <thead>
              <tr className="bg-bg">
                {['Data', 'Doador', 'Categoria', 'Chegou', 'Triagem', 'Obs.', ''].map((h, i) => (
                  <th key={`${h}-${i}`} className="text-left px-6 py-3.5 text-[11px] text-muted tracking-[1.5px] uppercase font-medium">{h}</th>
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
                  <td className="px-6 py-4"><Tag>{d.category_name}</Tag></td>
                  <td className="px-6 py-4 text-sm font-display font-medium text-ink">{quantoChegou(d)}</td>
                  <td data-testid="triagem-da-doacao" className="px-6 py-4 text-sm text-ink">
                    {triagemPendente(d) ? (
                      <span className="text-xs font-body px-2 py-1 rounded-full" style={{ backgroundColor: '#FBE3CA', color: '#C97D3E' }}>
                        Triagem pendente
                      </span>
                    ) : d.aproveitadas !== null ? (
                      textoDaTriagem(d)
                    ) : (
                      <span className="text-muted">·</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-muted max-w-[180px] truncate">{d.notes ?? '—'}</td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    {/* US-04a: tudo que aparece aqui pode ser alterado por quem está vendo
                        (o balcão só enxerga o que foi lançado hoje). US-16: o Recibo vem antes de "Editar". */}
                    <div data-testid="acoes-da-doacao" className="flex justify-end gap-2">
                      {confirmando === d.id ? (
                        <>
                          <button type="button" onClick={() => excluir(d.id)} disabled={isPending} className="chip bg-coral text-white border-coral disabled:opacity-50">
                            Confirmar exclusão
                          </button>
                          <button type="button" onClick={() => setConfirmando(null)} disabled={isPending} className="chip bg-bg">
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <Link href={`/recibo/itens/${d.id}`} target="_blank" className="chip bg-bg no-underline">Recibo</Link>
                          <Link href={`/doacoes/itens/${d.id}/editar`} className="chip bg-bg no-underline">Editar</Link>
                          <button type="button" onClick={() => setConfirmando(d.id)} className="chip bg-bg">Excluir</button>
                        </>
                      )}
                    </div>
                  </td>
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
