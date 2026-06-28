import { Tag } from '@/components/ui/tag'
import { formatBRL } from '@/lib/utils'
import type { Sale } from '@/types'

interface SalesTodayProps {
  sales: Sale[]
}

export function SalesToday({ sales }: SalesTodayProps) {
  return (
    <div className="bg-paper border border-rule rounded-[16px] overflow-hidden">
      <div className="px-6 py-5 border-b border-rule flex justify-between items-center">
        <h3 className="font-display text-xl text-ink font-medium m-0">Últimas vendas</h3>
        <span className="text-xs text-muted font-body">{sales.length} registros</span>
      </div>
      <div>
        {sales.map((v, i) => (
          <div
            key={v.id}
            className={`grid items-center gap-4 px-6 py-4 ${i < sales.length - 1 ? 'border-b border-rule' : ''}`}
            style={{ gridTemplateColumns: '76px 1fr auto auto' }}
          >
            <div className="font-mono text-xs text-muted leading-tight">
              <div>{new Date(v.sold_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' })}</div>
              <div className="text-[10px] opacity-70">{v.time}</div>
            </div>
            <div>
              <div className="font-body text-sm text-ink font-medium">{v.customer_name}</div>
              <div className="font-body text-xs text-muted mt-0.5">{v.category}</div>
            </div>
            <Tag>{v.payment_method}</Tag>
            <div className="font-display text-[17px] text-ink font-medium">R$ {formatBRL(v.amount)}</div>
          </div>
        ))}
        {sales.length === 0 && (
          <div className="px-6 py-10 text-center text-sm text-muted font-body">
            Nenhuma venda registrada ainda.
          </div>
        )}
      </div>
    </div>
  )
}
