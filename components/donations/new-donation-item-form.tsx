'use client'

import { useState, useTransition } from 'react'
import { Check } from 'lucide-react'
import { registerDonationItem } from '@/actions/donations'
import { DonorField } from '@/components/clients/donor-field'
import { brTodayStr } from '@/lib/utils'

interface Category { id: string; name: string }
interface DbTag { id: string; name: string; color: string; bg_color: string }

interface NewDonationItemFormProps {
  categories: Category[]
  tags: DbTag[]
  categoriaInicial?: string
}

// Categorias em que estado e destino não fazem sentido: só se registra que chegou.
const SEM_ESTADO = ['tampinha']

export function NewDonationItemForm({ categories, tags, categoriaInicial }: NewDonationItemFormProps) {
  const [isPending, startTransition] = useTransition()
  // Dia de Brasília, e não de UTC: depois das 21h o UTC já está no dia seguinte (BUG-01).
  const today = brTodayStr()
  const [date, setDate] = useState(today)
  const [categoryId, setCategoryId] = useState(categories.find((c) => c.name === categoriaInicial)?.id ?? '')
  const [condition, setCondition] = useState<'good' | 'needs_review'>('good')
  const [destination, setDestination] = useState<'stock' | 'direct'>('stock')
  const [error, setError] = useState<string | null>(null)

  const categoria = categories.find((c) => c.id === categoryId)
  const comEstado = !categoria || !SEM_ESTADO.includes(categoria.name)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    fd.set('donated_at', date)
    fd.set('category_id', categoryId)
    if (comEstado) {
      fd.set('condition', condition)
      fd.set('destination', destination)
    }
    startTransition(async () => {
      const res = await registerDonationItem(fd)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-5">

          <DonorField tags={tags} />

          <div className="bg-paper border border-rule rounded-[16px] p-6">
            <div className="text-[11px] font-body text-muted tracking-[1px] uppercase mb-4">Item doado</div>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="data-da-doacao" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                    Data <span className="text-accent">*</span>
                  </label>
                  <input id="data-da-doacao" type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} className="input-base" />
                </div>
                <div>
                  <label htmlFor="categoria-do-item" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                    Categoria <span className="text-accent">*</span>
                  </label>
                  <select
                    id="categoria-do-item"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required
                    className="input-base"
                  >
                    <option value="">Escolha...</option>
                    {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="quantidade-do-item" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                    Quantidade
                  </label>
                  <input id="quantidade-do-item" name="quantity" type="number" min="1" step="1" placeholder="opcional" className="input-base" />
                </div>
                <div>
                  <label htmlFor="peso-do-item" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                    Peso (kg)
                  </label>
                  <input id="peso-do-item" name="weight_kg" inputMode="decimal" placeholder="opcional" className="input-base" />
                </div>
              </div>

              {comEstado && (
                <>
                  <div>
                    <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-2">Estado</label>
                    <div className="flex gap-2">
                      {([['good', 'Bom'], ['needs_review', 'Revisar']] as const).map(([val, lbl]) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setCondition(val)}
                          className="px-4 py-2 rounded-[8px] text-[13px] font-body transition-all"
                          style={
                            condition === val
                              ? { border: '2px solid #5C8A6E', backgroundColor: '#5C8A6E15', color: '#2E5C3E', fontWeight: 500 }
                              : { border: '1px solid #EEE4D5', backgroundColor: '#FFFFFF', color: '#7A6E8A' }
                          }
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-2">Destino</label>
                    <div className="flex gap-2">
                      {([['stock', 'Estoque'], ['direct', 'Direto']] as const).map(([val, lbl]) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setDestination(val)}
                          className="px-4 py-2 rounded-[8px] text-[13px] font-body transition-all"
                          style={
                            destination === val
                              ? { border: '2px solid #4B3A9B', backgroundColor: '#4B3A9B15', color: '#4B3A9B', fontWeight: 500 }
                              : { border: '1px solid #EEE4D5', backgroundColor: '#FFFFFF', color: '#7A6E8A' }
                          }
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">Observações</label>
                <textarea name="notes" rows={3} placeholder="Contexto sobre a doação..." className="input-base resize-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="md:sticky md:top-6 md:self-start">
          <div className="bg-paper border border-rule rounded-[16px] p-6">
            <div className="text-[11px] text-muted tracking-[2px] uppercase font-body mb-4">Resumo</div>
            <div className="text-[13px] font-body text-muted mb-1">Categoria</div>
            <div className="text-sm font-body text-ink font-medium mb-5">{categoria?.name ?? 'escolha na lista'}</div>
            {comEstado && (
              <>
                <div className="text-[13px] font-body text-muted mb-1">Estado · Destino</div>
                <div className="text-sm font-body text-ink font-medium mb-5">
                  {condition === 'good' ? 'Bom' : 'Revisar'} · {destination === 'stock' ? 'Estoque' : 'Direto'}
                </div>
              </>
            )}
            <div className="border-t border-rule pt-4 mb-6">
              <div className="font-display text-[28px] font-bold tracking-[-1px] leading-none text-emerald">
                Doação · Itens
              </div>
            </div>
            {error && (
              <div className="rounded-[10px] px-4 py-3 font-body text-[13px] mb-4" style={{ backgroundColor: '#F8DCD2', color: '#D87560' }}>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-emerald text-white border-none py-3.5 rounded-[10px] cursor-pointer font-body text-sm font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: '0 4px 14px rgba(92,138,110,0.35)' }}
            >
              <Check size={16} />
              {isPending ? 'Registrando...' : 'Registrar doação'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}