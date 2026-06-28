'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Tag } from '@/components/ui/tag'
import { formatBRL } from '@/lib/utils'
import type { Client } from '@/types'

interface ClientsListProps {
  clients: Client[]
  selected: Client | null
  onSelect: (c: Client) => void
}

const tagFilters = ['todas', 'familiar', 'voluntário', 'brechó', 'tampinha']

export function ClientsList({ clients, selected, onSelect }: ClientsListProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('todas')

  const filtered = clients.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
    const matchFilter = filter === 'todas' || c.tags.includes(filter)
    return matchSearch && matchFilter
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 flex-wrap items-center">
        <span className="text-xs text-muted font-body">Filtrar:</span>
        {tagFilters.map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`chip transition-colors ${
              filter === t ? 'bg-ink text-bg border-ink' : 'bg-paper text-muted border-rule'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="bg-paper border border-rule rounded-[16px] overflow-hidden">
        <div className="p-4 border-b border-rule relative">
          <Search size={14} className="absolute left-7 top-[27px] text-muted pointer-events-none" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente..."
            className="input-base pl-9"
          />
        </div>
        <div>
          {filtered.map((c, i) => {
            const active = selected?.id === c.id
            return (
              <div
                key={c.id}
                onClick={() => onSelect(c)}
                className={`px-5 py-4 cursor-pointer transition-colors border-l-[3px] ${
                  i < filtered.length - 1 ? 'border-b border-rule' : ''
                } ${active ? 'bg-bg border-l-accent' : 'border-l-transparent hover:bg-bg/60'}`}
              >
                <div className="flex justify-between items-start mb-1.5">
                  <span className="font-body text-sm text-ink font-medium">{c.name}</span>
                  <span className="font-display text-[15px] text-ink">R$ {formatBRL(Number(c.total_spent))}</span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {c.tags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="px-5 py-8 text-center text-sm text-muted font-body">
              Nenhum cliente encontrado
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
