'use client'

import { useEffect, useState } from 'react'
import { Phone, Cake, Edit3, Plus } from 'lucide-react'
import { Tag } from '@/components/ui/tag'
import { fetchCustomerSales } from '@/actions/customers'
import type { Customer, Sale } from '@/types'

interface CustomerProfileProps {
  customer: Customer
  onEdit?: () => void
}

export function CustomerProfile({ customer, onEdit }: CustomerProfileProps) {
  const [sales, setSales] = useState<Sale[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchCustomerSales(customer.id)
      .then(setSales)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [customer.id])

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
                {customer.name[0]}
              </div>
              <div>
                <h2 className="font-display text-[26px] text-ink font-semibold tracking-[-0.5px] m-0 mb-1">
                  {customer.name}
                </h2>
                <div className="flex gap-3.5 text-xs text-muted font-body">
                  {customer.phone && (
                    <span className="flex items-center gap-1">
                      <Phone size={11} /> {customer.phone}
                    </span>
                  )}
                  {customer.birthday && (
                    <span className="flex items-center gap-1">
                      <Cake size={11} /> {customer.birthday}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <button onClick={onEdit} className="chip bg-bg">
              <Edit3 size={11} /> Editar
            </button>
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {customer.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
            <button onClick={onEdit} className="chip bg-transparent border-dashed text-muted">
              <Plus size={10} /> etiqueta
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 border-b border-rule">
          <div className="px-6 py-5 border-r border-rule">
            <div className="text-[11px] text-muted tracking-[1.5px] uppercase font-body mb-1">
              Apoiadora desde
            </div>
            <div className="font-display text-[22px] text-ink font-medium">
              {customer.member_since}
            </div>
          </div>
          <div className="px-6 py-5 border-r border-rule">
            <div className="text-[11px] text-muted tracking-[1.5px] uppercase font-body mb-1">
              Compras
            </div>
            <div className="font-display text-[22px] text-ink font-medium">
              {customer.purchase_count}
            </div>
          </div>
          <div className="px-6 py-5">
            <div className="text-[11px] text-muted tracking-[1.5px] uppercase font-body mb-1">
              Total apoiado
            </div>
            <div className="font-display text-[22px] text-accent font-medium">
              R$ {Number(customer.total_spent).toFixed(2)}
            </div>
          </div>
        </div>

        {/* History */}
        <div className="p-6">
          <h4 className="text-[11px] text-muted tracking-[1.5px] uppercase font-body mb-3.5">
            Histórico de compras
          </h4>
          {loading ? (
            <div className="text-sm text-muted font-body py-2">Carregando...</div>
          ) : sales.length === 0 ? (
            <div className="text-sm text-muted font-body italic py-2">Nenhuma compra registrada.</div>
          ) : (
            <>
              {sales.slice(0, 5).map((s, i) => (
                <div
                  key={s.id}
                  className={`flex justify-between items-center py-3 ${
                    i < Math.min(sales.length, 5) - 1 ? 'border-b border-rule' : ''
                  }`}
                >
                  <div>
                    <div className="font-body text-[13px] text-ink">{s.category || 'Venda'}</div>
                    <div className="font-mono text-[11px] text-muted mt-0.5">
                      {new Date(s.sold_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <div className="font-display text-[16px] text-ink">R$ {Number(s.amount).toFixed(2)}</div>
                </div>
              ))}
              {sales.length > 5 && (
                <p className="mt-4 text-center font-body text-[12px] text-muted">
                  Mostrando as 5 compras mais recentes de {sales.length}.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
