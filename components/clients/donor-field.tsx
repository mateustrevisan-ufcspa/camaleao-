'use client'

import { useState } from 'react'
import { ClientPicker } from '@/components/clients/client-picker'
import type { Client } from '@/types'

interface DbTag { id: string; name: string; color: string; bg_color: string }

// Campo de doador reusável nos forms de doação.
// Cliente selecionado → grava client_id/donor_name/donor_phone em hidden inputs.
// Anônimo (sem cliente) → mostra inputs de nome/telefone para digitar.
// Em ambos os casos o <form> pai lê via FormData (names: client_id, donor_name, donor_phone).
export function DonorField({ clients, tags }: { clients: Client[]; tags: DbTag[] }) {
  const [selected, setSelected] = useState<Client | null>(null)

  return (
    <div className="bg-paper border border-rule rounded-[16px] p-6">
      <div className="text-[11px] font-body text-muted tracking-[1px] uppercase mb-4">Doador</div>
      <ClientPicker clients={clients} tags={tags} selected={selected} onSelect={setSelected} />

      {selected ? (
        <>
          <input type="hidden" name="client_id" value={selected.id} />
          <input type="hidden" name="donor_name" value={selected.name} />
          <input type="hidden" name="donor_phone" value={selected.phone} />
        </>
      ) : (
        <div className="flex flex-col gap-3 mt-4">
          <div>
            <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
              Nome do doador <span className="text-accent">*</span>
            </label>
            <input name="donor_name" required placeholder="Nome completo (ou Anônimo)" className="input-base" />
          </div>
          <div>
            <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">Telefone</label>
            <input name="donor_phone" placeholder="(51) 99999-9999" className="input-base" />
          </div>
        </div>
      )}
    </div>
  )
}
