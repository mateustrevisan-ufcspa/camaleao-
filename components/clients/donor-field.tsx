'use client'

import { useState } from 'react'
import { ClientPicker } from '@/components/clients/client-picker'
import type { PessoaEncontrada } from '@/types'

interface DbTag { id: string; name: string; color: string; bg_color: string }

// Campo de doador reusável nos forms de doação.
// Pessoa selecionada → grava client_id/donor_name em hidden inputs. O telefone fica só na ficha.
// Sem pessoa → só depois de marcar "Doação sem ficha" (US-14) aparecem nome e telefone,
// e o form leva sem_ficha=1. Sem nenhuma das duas, o servidor recusa a doação.
// Em todos os casos o <form> pai lê via FormData (names: client_id, donor_name, donor_phone, sem_ficha).
export function DonorField({ tags }: { tags: DbTag[] }) {
  const [selected, setSelected] = useState<PessoaEncontrada | null>(null)
  const [semFicha, setSemFicha] = useState(false)

  function escolher(p: PessoaEncontrada | null) {
    setSelected(p)
    if (p) setSemFicha(false)
  }

  return (
    <div className="bg-paper border border-rule rounded-[16px] p-6">
      <div className="text-[11px] font-body text-muted tracking-[1px] uppercase mb-4">Doador</div>
      <ClientPicker tags={tags} selected={selected} onSelect={escolher} allowAnonymous={false} />

      {selected ? (
        <>
          <input type="hidden" name="client_id" value={selected.id} />
          <input type="hidden" name="donor_name" value={selected.name} />
        </>
      ) : (
        <>
          <label className="flex items-center gap-2 mt-4 font-body text-[13px] text-ink cursor-pointer">
            <input type="checkbox" checked={semFicha} onChange={(e) => setSemFicha(e.target.checked)} />
            Doação sem ficha (anônima ou de quem não quer cadastro)
          </label>
          {semFicha ? (
            <div className="flex flex-col gap-3 mt-4">
              <input type="hidden" name="sem_ficha" value="1" />
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
          ) : (
            <p className="font-body text-[12px] text-muted mt-2 mb-0">
              Busque a pessoa, cadastre uma nova ou marque doação sem ficha.
            </p>
          )}
        </>
      )}
    </div>
  )
}
