'use client'

import { Phone, Cake, Mail, Edit3, Plus } from 'lucide-react'
import { Tag } from '@/components/ui/tag'
import { formatBRL } from '@/lib/utils'
import { MessageConsentCard } from '@/components/clients/message-consent'
import { HistoricoDaPessoa } from '@/components/clients/historico-da-pessoa'
import type { Client } from '@/types'

interface ClientProfileProps {
  client: Client
  onEdit?: () => void
}

export function ClientProfile({ client, onEdit }: ClientProfileProps) {
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
                {client.nickname && (
                  <div className="font-body text-[13px] text-muted mb-1">Apelido: {client.nickname}</div>
                )}
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
            <div className="font-display text-[20px] text-accent font-medium">R$ {formatBRL(Number(client.total_spent))}</div>
          </div>
          <div className="px-5 py-5">
            <div className="text-[11px] text-muted tracking-[1.5px] uppercase font-body mb-1">Doações</div>
            <div className="font-display text-[20px] text-emerald font-medium">{client.donation_count}</div>
          </div>
        </div>

        <MessageConsentCard key={client.id} clientId={client.id} />

        <HistoricoDaPessoa key={`historico-${client.id}`} clientId={client.id} />
      </div>
    </div>
  )
}
