'use client'

import { useState, useTransition } from 'react'
import { Check } from 'lucide-react'
import { registerDonationCaps } from '@/actions/donations'

export function NewDonationCapsForm() {
  const [isPending, startTransition] = useTransition()
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    fd.set('donated_at', date)
    startTransition(async () => {
      const res = await registerDonationCaps(fd)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-5">

          <div className="bg-paper border border-rule rounded-[16px] p-6">
            <div className="text-[11px] font-body text-muted tracking-[1px] uppercase mb-4">Doador</div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                  Nome <span className="text-accent">*</span>
                </label>
                <input name="donor_name" required placeholder="Nome completo" className="input-base" />
              </div>
              <div>
                <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">Telefone</label>
                <input name="donor_phone" placeholder="(51) 99999-9999" className="input-base" />
              </div>
            </div>
          </div>

          <div className="bg-paper border border-rule rounded-[16px] p-6">
            <div className="text-[11px] font-body text-muted tracking-[1px] uppercase mb-1">Tampinhas</div>
            <p className="text-[12px] font-body text-muted mb-4">Informe quantidade, peso, ou ambos.</p>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                    Data <span className="text-accent">*</span>
                  </label>
                  <input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} className="input-base" />
                </div>
                <div>
                  <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">Quantidade</label>
                  <input name="quantity" type="number" min="1" step="1" placeholder="0" className="input-base" />
                </div>
                <div>
                  <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">Peso (kg)</label>
                  <input name="weight_kg" inputMode="decimal" placeholder="0,0" className="input-base" />
                </div>
              </div>

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
            <div className="border-t border-rule pt-4 mb-6">
              <div className="text-[11px] text-muted tracking-[1.5px] uppercase font-body mb-1.5">Categoria</div>
              <div className="font-display text-[28px] font-bold tracking-[-1px] leading-none text-coral">
                Doação · Tampinhas
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
              className="w-full text-white border-none py-3.5 rounded-[10px] cursor-pointer font-body text-sm font-medium flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#E25A8F', boxShadow: '0 4px 14px rgba(226,90,143,0.35)' }}
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
