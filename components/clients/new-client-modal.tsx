'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { X, Check } from 'lucide-react'
import { saveNewClient } from '@/actions/clients'
import { TERMO_MENSAGENS } from '@/lib/termo-mensagens'
import type { Client } from '@/types'

interface DbTag { id: string; name: string; color: string; bg_color: string }

interface NewClientModalProps {
  tags: DbTag[]
  onClose: () => void
  onCreated: (client: Client) => void
}

export function NewClientModal({ tags, onClose, onCreated }: NewClientModalProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [birthday, setBirthday] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    nameRef.current?.focus()
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  function toggleTag(name: string) {
    setSelectedTags((prev) => (prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]))
  }

  // Máscara dd/mm: só dígitos, barra automática após o dia
  function handleBirthdayChange(e: React.ChangeEvent<HTMLInputElement>) {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
    setBirthday(digits.length <= 2 ? digits : `${digits.slice(0, 2)}/${digits.slice(2)}`)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // Na nova doação a janela abre dentro do <form> da doação. No React o envio sobe
    // pelos componentes, mesmo com o portal: sem isto, a doação também seria enviada.
    e.stopPropagation()
    setError(null)
    const fd = new FormData(e.currentTarget)
    fd.set('tags', JSON.stringify(selectedTags))
    startTransition(async () => {
      try {
        const client = await saveNewClient(fd)
        onCreated(client)
      } catch (err) {
        console.error(err)
        setError('Não foi possível cadastrar. Tente novamente.')
      }
    })
  }

  // No body, e não onde o componente está: assim a janela não fica dentro de outro <form>.
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(31,22,56,0.4)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-novo-cliente"
        className="bg-paper rounded-[20px] w-full max-w-[440px] max-h-full shadow-xl flex flex-col overflow-hidden"
      >
        <div className="shrink-0 flex items-center justify-between px-7 pt-7 pb-5 border-b border-rule">
          <div>
            <h2 id="titulo-novo-cliente" className="font-display text-[22px] text-ink font-semibold tracking-[-0.4px] m-0">
              Novo cliente
            </h2>
            <p className="font-body text-xs text-muted mt-1 m-0">
              Cadastre uma pessoa (cliente e/ou doador(a)).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="w-8 h-8 flex items-center justify-center rounded-full text-muted hover:text-ink hover:bg-bg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="min-h-0 flex-1 flex flex-col">
          {/* BUG-03: só os campos rolam; cabeçalho e botões ficam à vista em tela baixa. */}
          <div className="min-h-0 flex-1 overflow-y-auto px-7 py-6 flex flex-col gap-5">
            <div>
              <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                Nome completo <span className="text-accent">*</span>
              </label>
              <input ref={nameRef} name="name" required placeholder="Ex.: Roberta Lima" className="input-base" />
            </div>
            <div>
              <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                Apelido
              </label>
              <input name="nickname" placeholder="Como a pessoa é conhecida no Instituto" className="input-base" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                  Telefone
                </label>
                <input name="phone" type="tel" placeholder="(51) 99999-9999" className="input-base" />
              </div>
              <div>
                <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                  Aniversário
                </label>
                <input
                  name="birthday"
                  placeholder="dd/mm"
                  inputMode="numeric"
                  maxLength={5}
                  value={birthday}
                  onChange={handleBirthdayChange}
                  className="input-base"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                E-mail
              </label>
              <input name="email" type="email" placeholder="email@exemplo.com" className="input-base" />
            </div>
            <label className="flex items-start gap-2.5 font-body text-[13px] text-ink cursor-pointer">
              <input type="checkbox" name="autoriza_mensagens" className="mt-0.5" />
              <span>
                Autoriza receber mensagens do Instituto
                <span className="block text-[11px] text-muted mt-0.5">
                  Leia o termo para a pessoa antes de marcar: {TERMO_MENSAGENS.texto}
                </span>
              </span>
            </label>
            <div>
              <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-2">
                Etiquetas
              </label>
              <div className="flex gap-2 flex-wrap">
                {tags.map((tag) => {
                  const active = selectedTags.includes(tag.name)
                  return (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.name)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-body cursor-pointer transition-all"
                      style={
                        active
                          ? { backgroundColor: tag.bg_color, color: tag.color, border: `1.5px solid ${tag.color}` }
                          : { backgroundColor: '#FFFFFF', color: '#7A6E8A', border: '1px solid #EEE4D5' }
                      }
                    >
                      {active && <Check size={10} />}
                      {tag.name}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="shrink-0 px-7 py-4 border-t border-rule flex flex-col gap-3">
            {error && (
              <div className="rounded-[10px] px-4 py-3 font-body text-[13px]" style={{ backgroundColor: '#F8DCD2', color: '#D87560' }}>
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-[10px] border border-rule bg-transparent font-body text-sm text-muted cursor-pointer hover:text-ink hover:bg-bg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 btn-primary rounded-[10px] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? 'Salvando...' : 'Cadastrar'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}
