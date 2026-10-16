'use client'

import { useEffect, useState } from 'react'
import { Plus, X, Search } from 'lucide-react'
import { Tag } from '@/components/ui/tag'
import { NewClientModal } from '@/components/clients/new-client-modal'
import { buscarPessoas } from '@/actions/search'
import type { Client, PessoaEncontrada } from '@/types'

interface DbTag { id: string; name: string; color: string; bg_color: string }

interface ClientPickerProps {
  tags: DbTag[]
  selected: PessoaEncontrada | null
  onSelect: (p: PessoaEncontrada | null) => void
  allowAnonymous?: boolean
}

// A busca só dispara com 2 letras ou mais, e espera a pessoa parar de digitar.
const MINIMO_DE_LETRAS = 2
const ESPERA_MS = 250

// Quem acabou de ser cadastrada entra na seleção sem passar pela busca.
function recemCadastrada(c: Client): PessoaEncontrada {
  return {
    id: c.id,
    name: c.name,
    nickname: c.nickname ?? '',
    phone_final: (c.phone ?? '').replace(/\D/g, '').slice(-4),
    tags: c.tags,
    ja_comprou: false,
    ja_doou: false,
  }
}

function detalhe(p: PessoaEncontrada) {
  return [p.nickname && `"${p.nickname}"`, p.phone_final && `tel. final ${p.phone_final}`].filter(Boolean).join(' · ')
}

export function ClientPicker({ tags, selected, onSelect, allowAnonymous = true }: ClientPickerProps) {
  const [search, setSearch] = useState('')
  // O resultado guarda o termo que o gerou: resposta atrasada de um termo antigo é ignorada.
  const [resultado, setResultado] = useState<{ termo: string; pessoas: PessoaEncontrada[] } | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const termo = search.trim()
  const termoValido = termo.length >= MINIMO_DE_LETRAS

  useEffect(() => {
    if (termo.length < MINIMO_DE_LETRAS) return
    let ativo = true
    const espera = setTimeout(() => {
      buscarPessoas(termo)
        .then((pessoas) => { if (ativo) setResultado({ termo, pessoas }) })
        .catch((e) => {
          console.error(e)
          if (ativo) setResultado({ termo, pessoas: [] })
        })
    }, ESPERA_MS)
    return () => { ativo = false; clearTimeout(espera) }
  }, [termo])

  const buscando = termoValido && resultado?.termo !== termo
  const pessoas = termoValido && resultado?.termo === termo ? resultado.pessoas : []

  function handleCreated(client: Client) {
    onSelect(recemCadastrada(client))
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
            <div className="font-body text-xs text-muted">{detalhe(selected)}</div>
          </div>
          <button type="button" aria-label="Trocar pessoa" onClick={() => onSelect(null)} className="text-muted hover:text-ink transition-colors shrink-0">
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
            placeholder="Buscar por nome, apelido ou telefone..."
            aria-label="Buscar pessoa"
            className="input-base pl-10"
          />
          {showDropdown && termoValido && (
            <div data-testid="resultado-da-busca" className="absolute z-10 w-full mt-1 bg-paper border border-rule rounded-[10px] overflow-hidden shadow-sm">
              {pessoas.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onMouseDown={() => { onSelect(p); setSearch(''); setShowDropdown(false) }}
                  className="w-full text-left px-4 py-3 flex items-center justify-between gap-3 hover:bg-accent-soft/30 transition-colors border-b border-rule last:border-0"
                >
                  <span className="min-w-0">
                    <span className="block font-body text-sm text-ink font-medium truncate">{p.name}</span>
                    {detalhe(p) && <span className="block font-body text-xs text-muted truncate">{detalhe(p)}</span>}
                  </span>
                  <span className="flex gap-1 shrink-0">
                    {p.ja_comprou && <Tag>já comprou</Tag>}
                    {p.ja_doou && <Tag>já doou</Tag>}
                    {!p.ja_comprou && !p.ja_doou && <Tag>primeira vez</Tag>}
                  </span>
                </button>
              ))}
              {buscando && (
                <div className="px-4 py-3 text-sm text-muted font-body italic">Buscando...</div>
              )}
              {!buscando && pessoas.length === 0 && (
                <div className="px-4 py-3 text-sm text-muted font-body italic">Nenhuma pessoa encontrada</div>
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
