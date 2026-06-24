'use client'

import { useEffect, useState } from 'react'
import { Phone, Cake, Mail, Edit3, Plus } from 'lucide-react'
import { Tag } from '@/components/ui/tag'
import { fetchClientSales, fetchClientDonations } from '@/actions/clients'
import type { Client, Sale } from '@/types'

type Donation = { id: string; kind: 'cash' | 'items' | 'caps'; label: string; donated_at: string; detail: string }

interface ClientProfileProps {
  client: Client
  onEdit?: () => void
}

export function ClientProfile({ client, onEdit }: ClientProfileProps) {
  const [sales, setSales] = useState<Sale[]>([])
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    Promise.all([fetchClientSales(client.id), fetchClientDonations(client.id)])
      .then(([s, d]) => { setSales(s); setDonations(d) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [client.id])

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-paper border border-rule rounded-[16px] overflow-hidden">
        {/* Header */}
        <div className="px-7 pt-7 pb-5 border-b border-rule">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-4 items-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center font-display text-[22px] font-bold text-white shrink-0"
                style={{ background: 'linear-gradient(135deg, #E89E5C, #D87560)' }}
              >
                {client.name[0]}
              </div>
              <div>
                <h2 className="font-display text-[26px] text-ink font-semibold tracking-[-0.5px] m-0 mb-1">
                  {client.name}
                </h2>
                <div className="flex gap-3.5 text-xs text-muted font-body flex-wrap">
                  {client.phone && <span className="flex items-center gap-1"><Phone size={11} /> {client.phone}</span>}
                  {client.email && <span className="flex items-center gap-1"><Mail size={11} /> {client.email}</span>}
                  {client.birthday && <span className="flex items-center gap-1"><Cake size={11} /> {client.birthday}</span>}
                </div>
              </div>
            </div>
            <button onClick={onEdit} className="chip bg-bg">
              <Edit3 size={11} /> Editar
            </button>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {client.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
            <button onClick={onEdit} className="chip bg-transparent border-dashed text-muted">
              <Plus size={10} /> etiqueta
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 border-b border-rule">
          <div className="px-5 py-5 border-r border-rule">
            <div className="text-[11px] text-muted tracking-[1.5px] uppercase font-body mb-1">Desde</div>
            <div className="font-display text-[20px] text-ink font-medium">{client.member_since}</div>
          </div>
          <div className="px-5 py-5 border-r border-rule">
            <div className="text-[11px] text-muted tracking-[1.5px] uppercase font-body mb-1">Compras</div>
            <div className="font-display text-[20px] text-ink font-medium">{client.purchase_count}</div>
          </div>
          <div className="px-5 py-5 border-r border-rule">
            <div className="text-[11px] text-muted tracking-[1.5px] uppercase font-body mb-1">Total gasto</div>
            <div className="font-display text-[20px] text-accent font-medium">R$ {Number(client.total_spent).toFixed(2)}</div>
          </div>
          <div className="px-5 py-5">
            <div className="text-[11px] text-muted tracking-[1.5px] uppercase font-body mb-1">Doações</div>
            <div className="font-display text-[20px] text-emerald font-medium">{client.donation_count}</div>
          </div>
        </div>

        {/* Histórico de compras */}
        <div className="p-6 border-b border-rule">
          <h4 className="text-[11px] text-muted tracking-[1.5px] uppercase font-body mb-3.5">Histórico de compras</h4>
          {loading ? (
            <div className="text-sm text-muted font-body py-2">Carregando...</div>
          ) : sales.length === 0 ? (
            <div className="text-sm text-muted font-body italic py-2">Nenhuma compra registrada.</div>
          ) : (
            <>
              {sales.slice(0, 5).map((s, i) => (
                <div key={s.id} className={`flex justify-between items-center py-3 ${i < Math.min(sales.length, 5) - 1 ? 'border-b border-rule' : ''}`}>
                  <div>
                    <div className="font-body text-[13px] text-ink">{s.category || 'Venda'}</div>
                    <div className="font-mono text-[11px] text-muted mt-0.5">{new Date(s.sold_at).toLocaleDateString('pt-BR')}</div>
                  </div>
                  <div className="font-display text-[16px] text-ink">R$ {Number(s.amount).toFixed(2)}</div>
                </div>
              ))}
              {sales.length > 5 && (
                <p className="mt-4 text-center font-body text-[12px] text-muted">Mostrando as 5 compras mais recentes de {sales.length}.</p>
              )}
            </>
          )}
        </div>

        {/* Histórico de doações */}
        <div className="p-6">
          <h4 className="text-[11px] text-muted tracking-[1.5px] uppercase font-body mb-3.5">Histórico de doações</h4>
          {loading ? (
            <div className="text-sm text-muted font-body py-2">Carregando...</div>
          ) : donations.length === 0 ? (
            <div className="text-sm text-muted font-body italic py-2">Nenhuma doação registrada.</div>
          ) : (
            donations.slice(0, 6).map((d, i) => (
              <div key={d.id} className={`flex justify-between items-center py-3 ${i < Math.min(donations.length, 6) - 1 ? 'border-b border-rule' : ''}`}>
                <div>
                  <div className="font-body text-[13px] text-ink">{d.label}</div>
                  <div className="font-mono text-[11px] text-muted mt-0.5">{new Date(d.donated_at).toLocaleDateString('pt-BR')}</div>
                </div>
                <div className="font-display text-[15px] text-emerald">{d.detail}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
