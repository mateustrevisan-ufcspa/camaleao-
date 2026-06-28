'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { ClientsList } from '@/components/clients/clients-list'
import { ClientProfile } from '@/components/clients/client-profile'
import { NewClientModal } from '@/components/clients/new-client-modal'
import { EditClientModal } from '@/components/clients/edit-client-modal'
import type { Client } from '@/types'

interface DbTag { id: string; name: string; color: string; bg_color: string }

interface ClientsPageClientProps {
  clients: Client[]
  tags: DbTag[]
}

export function ClientsPageClient({ clients: initial, tags }: ClientsPageClientProps) {
  const [list, setList] = useState<Client[]>(initial)
  const [selected, setSelected] = useState<Client | undefined>(initial[0])
  const [showModal, setShowModal] = useState(false)
  const [showEdit, setShowEdit] = useState(false)

  function handleCreated(client: Client) {
    setList((prev) => [...prev, client].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR')))
    setSelected(client)
    setShowModal(false)
  }

  function handleSaved(client: Client) {
    setList((prev) =>
      prev.map((c) => (c.id === client.id ? client : c)).sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
    )
    setSelected(client)
    setShowEdit(false)
  }

  return (
    <>
      {showModal && (
        <NewClientModal tags={tags} onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}

      {showEdit && selected && (
        <EditClientModal client={selected} tags={tags} onClose={() => setShowEdit(false)} onSaved={handleSaved} />
      )}

      <header className="mb-6 md:mb-9 flex flex-col gap-4 md:flex-row md:justify-between md:items-end">
        <div>
          <h1 className="font-display text-[28px] md:text-[40px] text-ink font-semibold tracking-[-1px] m-0">
            Clientes
          </h1>
          <p className="font-body text-muted text-sm mt-2 m-0">
            {list.length} pessoas cadastradas · compras, doações, etiquetas e perfis
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-dark self-start md:self-auto">
          <Plus size={14} /> Novo cliente
        </button>
      </header>

      <div className="grid gap-5 grid-cols-1 md:grid-cols-[1fr_1.2fr]">
        <ClientsList clients={list} selected={selected ?? null} onSelect={setSelected} />
        {selected ? (
          <ClientProfile client={selected} onEdit={() => setShowEdit(true)} />
        ) : (
          <div className="bg-paper border border-rule rounded-[16px] p-10 flex items-center justify-center">
            <p className="font-body text-sm text-muted">Nenhum cliente cadastrado ainda.</p>
          </div>
        )}
      </div>
    </>
  )
}
