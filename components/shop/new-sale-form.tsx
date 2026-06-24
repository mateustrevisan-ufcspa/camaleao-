'use client'

import { useState, useTransition } from 'react'
import { Plus, X, Check, Smartphone, Banknote, CreditCard } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { ClientPicker } from '@/components/clients/client-picker'
import { registerSale } from '@/actions/sales'
import { parseMoney } from '@/lib/utils'
import type { Client } from '@/types'

interface PaymentMethod { id: string; name: string; label: string }
interface Bank { id: string; name: string; type: string }
interface DbTag { id: string; name: string; color: string; bg_color: string }
interface Category { id: string; name: string; type: string }

interface NewSaleFormProps {
  clients: Client[]
  paymentMethods: PaymentMethod[]
  banks: Bank[]
  tags: DbTag[]
  categories: Category[]
}

const PM_META: Record<string, { icon: LucideIcon; color: string }> = {
  pix:    { icon: Smartphone, color: '#5C8A6E' },
  cash:   { icon: Banknote,   color: '#E89E5C' },
  debit:  { icon: CreditCard, color: '#4B3A9B' },
  credit: { icon: CreditCard, color: '#D87560' },
}
const DEFAULT_META = { icon: CreditCard, color: '#7A6E8A' }

export function NewSaleForm({ clients, paymentMethods, banks, tags, categories }: NewSaleFormProps) {
  const pixBanks  = banks.filter(b => b.type === 'pix')
  const cardBanks = banks.filter(b => b.type === 'card')

  const defaultPm = paymentMethods[0]?.name ?? 'pix'

  const [paymentMethod, setPaymentMethod] = useState(defaultPm)
  const [bank, setBank] = useState(pixBanks[0]?.name ?? '')
  const [installments, setInstallments] = useState(1)
  const [items, setItems] = useState([{ category: '', amount: '' }])
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0])
  const [selected, setSelected] = useState<Client | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const total = items.reduce((s, p) => s + parseMoney(p.amount), 0)

  // Resolve category_id pelo nome digitado (case-insensitive), null se categoria livre
  function resolveCategoryId(name: string): string | null {
    const n = name.trim().toLowerCase()
    return categories.find((c) => c.name.toLowerCase() === n)?.id ?? null
  }

  function handlePaymentMethodChange(name: string) {
    setPaymentMethod(name)
    if (name === 'pix') setBank(pixBanks[0]?.name ?? '')
    else if (name === 'credit' || name === 'debit') setBank(cardBanks[0]?.name ?? '')
    else setBank('')
  }

  function handleSubmit() {
    setError(null)
    const fd = new FormData()
    if (selected) {
      fd.set('client_id', selected.id)
      fd.set('customer_name', selected.name)
    } else {
      fd.set('customer_name', 'Cliente avulso')
    }
    fd.set(
      'items',
      JSON.stringify(
        items.map((p) => ({
          category_id:   resolveCategoryId(p.category),
          category_name: p.category.trim(),
          amount:        parseMoney(p.amount),
        }))
      )
    )
    fd.set('payment_method', paymentMethod)
    fd.set('sold_at', saleDate)
    if (bank) fd.set('bank', bank)
    if (paymentMethod === 'credit') fd.set('installments', String(installments))
    startTransition(async () => {
      const res = await registerSale(fd)
      if (res?.error) setError(res.error)
    })
  }

  const visibleBanks =
    paymentMethod === 'pix' ? pixBanks :
    paymentMethod === 'credit' || paymentMethod === 'debit' ? cardBanks : []

  return (
    <>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-5">

          {/* Cliente */}
          <div className="bg-paper border border-rule rounded-[16px] p-6">
            <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-3">
              Cliente <span className="text-accent">*</span>
            </label>
            <ClientPicker clients={clients} tags={tags} selected={selected} onSelect={setSelected} />
          </div>

          {/* Data */}
          <div className="bg-paper border border-rule rounded-[16px] p-6">
            <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-3">
              Data da venda
            </label>
            <input
              type="date"
              value={saleDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSaleDate(e.target.value)}
              className="input-base"
            />
            {saleDate !== new Date().toISOString().split('T')[0] && (
              <p className="text-[12px] text-muted font-body mt-2">Registrando com data retroativa</p>
            )}
          </div>

          {/* Peças */}
          <div className="bg-paper border border-rule rounded-[16px] p-6">
            <div className="flex justify-between items-center mb-4">
              <label className="text-[11px] font-body text-muted tracking-[1px] uppercase">
                Peças <span className="text-accent">*</span>
              </label>
              <button type="button" onClick={() => setItems([...items, { category: '', amount: '' }])} className="chip bg-bg text-ink border-rule">
                <Plus size={11} /> Adicionar peça
              </button>
            </div>
            <div className="flex flex-col gap-2.5">
              {items.map((p, i) => (
                <div key={i} className="grid gap-2.5" style={{ gridTemplateColumns: '1fr 130px 32px' }}>
                  <input
                    list="sale-categories"
                    placeholder="Categoria (saia, blusa, vestido...)"
                    value={p.category}
                    onChange={(e) => { const nv = [...items]; nv[i].category = e.target.value; setItems(nv) }}
                    className="input-base"
                  />
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted text-[13px] font-body pointer-events-none">R$</span>
                    <input
                      inputMode="decimal"
                      placeholder="0,00"
                      value={p.amount}
                      onChange={(e) => { const nv = [...items]; nv[i].amount = e.target.value; setItems(nv) }}
                      className="input-base pl-8"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                    className="border border-rule rounded-[8px] bg-paper flex items-center justify-center cursor-pointer hover:bg-bg transition-colors"
                  >
                    <X size={14} className="text-muted" />
                  </button>
                </div>
              ))}
            </div>
            <datalist id="sale-categories">
              {categories.map((c) => <option key={c.id} value={c.name} />)}
            </datalist>
          </div>

          {/* Pagamento */}
          <div className="bg-paper border border-rule rounded-[16px] p-6">
            <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-3">
              Forma de pagamento <span className="text-accent">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {paymentMethods.map((pm) => {
                const meta = PM_META[pm.name] ?? DEFAULT_META
                const Icon = meta.icon
                const active = paymentMethod === pm.name
                return (
                  <button
                    key={pm.id}
                    type="button"
                    onClick={() => handlePaymentMethodChange(pm.name)}
                    className="p-4 rounded-[12px] flex flex-col items-center gap-2 cursor-pointer transition-all font-body"
                    style={active
                      ? { border: `2px solid ${meta.color}`, backgroundColor: `${meta.color}15` }
                      : { border: '1px solid #EEE4D5', backgroundColor: '#FFFFFF' }}
                  >
                    <Icon size={20} color={active ? meta.color : '#7A6E8A'} strokeWidth={1.5} />
                    <span className={`text-[13px] ${active ? 'text-ink font-medium' : 'text-muted'}`}>{pm.label}</span>
                  </button>
                )
              })}
            </div>

            {visibleBanks.length > 0 && (
              <div className="mt-4 grid gap-2.5" style={{ gridTemplateColumns: paymentMethod === 'credit' ? '1fr 1fr' : '1fr' }}>
                <div>
                  <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                    Banco / maquininha
                  </label>
                  <select
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    className="input-base"
                  >
                    {visibleBanks.map((b) => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>
                {paymentMethod === 'credit' && (
                  <div>
                    <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                      Parcelas
                    </label>
                    <select
                      value={installments}
                      onChange={(e) => setInstallments(Number(e.target.value))}
                      className="input-base"
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}x</option>)}
                    </select>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Resumo sticky */}
        <div className="md:sticky md:top-6 md:self-start">
          <div className="bg-paper border border-rule rounded-[16px] p-6">
            <div className="text-[11px] text-muted tracking-[2px] uppercase font-body mb-4">Resumo</div>
            <div className="flex flex-col gap-2.5 mb-5">
              {items.filter((p) => p.amount).map((p, i) => (
                <div key={i} className="flex justify-between text-[13px] font-body text-ink">
                  <span className="text-muted">{p.category || 'Peça'}</span>
                  <span>R$ {parseMoney(p.amount).toFixed(2)}</span>
                </div>
              ))}
              {items.filter((p) => p.amount).length === 0 && (
                <div className="text-[13px] font-body text-muted italic">Nenhuma peça adicionada</div>
              )}
            </div>
            <div className="border-t border-rule pt-4 mb-6">
              <div className="text-[11px] text-muted tracking-[1.5px] uppercase font-body mb-1.5">Total</div>
              <div className="font-display text-[44px] font-bold tracking-[-1.8px] leading-none text-accent-deep">
                R$ {total.toFixed(2)}
              </div>
            </div>
            {error && (
              <div className="rounded-[10px] px-4 py-3 font-body text-[13px] mb-4" style={{ backgroundColor: '#F8DCD2', color: '#D87560' }}>
                {error}
              </div>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || total === 0}
              className="w-full bg-accent text-white border-none py-3.5 rounded-[10px] cursor-pointer font-body text-sm font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ boxShadow: '0 4px 14px rgba(232,158,92,0.35)' }}
            >
              <Check size={16} />
              {isPending ? 'Registrando...' : 'Registrar venda'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
