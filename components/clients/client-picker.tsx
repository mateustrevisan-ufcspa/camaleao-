'use client'

import { useState } from 'react'
import { Plus, X, Search } from 'lucide-react'
import { Tag } from '@/components/ui/tag'
import { NewClientModal } from '@/components/clients/new-client-modal'
import type { Client } from '@/types'

interface DbTag { id: string; name: string; color: string; bg_color: string }

interface ClientPickerProps {
  clients: Client[]
  tags: DbTag[]
  selected: Client | null
  onSelect: (c: Client | null) => void
  allowAnonymous?: boolean
}

export function ClientPicker({ clients, tags, selected, onSelect, allowAnonymous = true }: ClientPickerProps) {
  const [list, setList] = useState<Client[]>(clients)
  const [search, setSearch] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const filtered = list.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  )

  function handleCreated(client: Client) {
    setList((prev) => [...prev, client].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')))
    onSelect(client)
    setShowModal(false)
  }

  return (
    <>
      {showModal && (
        <NewClientModal tags={tags} onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}

      {selected ? (
        <div className="flex items-center gap-3 bg-accent-soft/30 rounded-[10px] px-4 py-3 mb-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-display text-sm font-bold text-white shrink-0"
            style={{ background: 'linear-gradient(135deg, #E89E5C, #D87560)' }}
          >
            {selected.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-body text-sm font-medium text-ink truncate">{selected.name}</div>
            <div className="font-body text-xs text-muted">{selected.phone}</div>
          </div>
          <button type="button" onClick={() => onSelect(null)} className="text-muted hover:text-ink transition-colors shrink-0">
            <X size={14} />
          </button>
        </div>
      ) : (
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3.5 top-3.5 text-muted pointer-events-none" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setShowDropdown(true) }}
            onFocus={() => setShowDropdown(true)}
            onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            placeholder="Buscar por nome ou telefone..."
            className="input-base pl-10"
          />
          {showDropdown && search && (
            <div className="absolute z-10 w-full mt-1 bg-paper border border-rule rounded-[10px] overflow-hidden shadow-sm">
              {filtered.slice(0, 5).map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onMouseDown={() => { onSelect(c); setSearch(''); setShowDropdown(false) }}
                  className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-accent-soft/30 transition-colors border-b border-rule last:border-0"
                >
                  <span className="font-body text-sm text-ink font-medium">{c.name}</span>
                  <div className="flex gap-1">
                    {c.tags.slice(0, 2).map((t) => <Tag key={t}>{t}</Tag>)}
                  </div>
                </button>
              ))}
              {filtered.length === 0 && (
                <div className="px-4 py-3 text-sm text-muted font-body italic">Nenhum cliente encontrado</div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-2">
        <button type="button" onClick={() => setShowModal(true)} className="chip bg-accent-soft text-accent-deep border-accent-soft">
          <Plus size={11} /> Cadastrar novo
        </button>
        {allowAnonymous && (
          <button type="button" onClick={() => { onSelect(null); setSearch('') }} className="chip">
            Anônimo / avulso
          </button>
        )}
      </div>
    </>
  )
}
