'use client'

import { useState, useTransition } from 'react'
import { Check } from 'lucide-react'
import { registerDonation } from '@/actions/donations'

const origins = ['PIX', 'Dinheiro', 'Site', 'Transferência', 'Outro']

export function NewDonationForm() {
  const [isPending, startTransition] = useTransition()
  const [frequency, setFrequency] = useState<'monthly' | 'one_time'>('one_time')
  const today = new Date().toISOString().split('T')[0]
  const [date, setDate] = useState(today)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    fd.set('frequency', frequency)
    fd.set('donated_at', date)
    startTransition(async () => {
      const res = await registerDonation(fd)
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
            <div className="text-[11px] font-body text-muted tracking-[1px] uppercase mb-4">Dados da doação</div>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                    Data <span className="text-accent">*</span>
                  </label>
                  <input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} className="input-base" />
                </div>
                <div>
                  <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                    Valor (R$) <span className="text-accent">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted text-[13px] font-body pointer-events-none">R$</span>
                    <input name="amount" required placeholder="0,00" type="number" min="0.01" step="0.01" className="input-base pl-8" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                  Origem <span className="text-accent">*</span>
                </label>
                <select name="origin" required className="input-base">
                  {origins.map((o) => <option key={o}>{o}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-2">Frequência</label>
                <div className="flex gap-2">
                  {(['one_time', 'monthly'] as const).map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setFrequency(f)}
                      className="px-4 py-2 rounded-[8px] text-[13px] font-body transition-all"
                      style={
                        frequency === f
                          ? { border: '2px solid #5C8A6E', backgroundColor: '#5C8A6E15', color: '#2E5C3E', fontWeight: 500 }
                          : { border: '1px solid #EEE4D5', backgroundColor: '#FFFFFF', color: '#7A6E8A' }
                      }
                    >
                      {f === 'one_time' ? 'Pontual' : 'Mensal'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">Observações</label>
                <textarea name="notes" rows={3} placeholder="Contexto sobre a doação ou doador..." className="input-base resize-none" />
              </div>
            </div>
          </div>
        </div>

        <div className="md:sticky md:top-6 md:self-start">
          <div className="bg-paper border border-rule rounded-[16px] p-6">
            <div className="text-[11px] text-muted tracking-[2px] uppercase font-body mb-4">Resumo</div>
            <div className="text-[13px] font-body text-muted mb-1">Frequência</div>
            <div className="text-sm font-body text-ink font-medium mb-5">
              {frequency === 'one_time' ? 'Pontual' : 'Mensal'}
            </div>
            <div className="border-t border-rule pt-4 mb-6">
              <div className="text-[11px] text-muted tracking-[1.5px] uppercase font-body mb-1.5">Categoria</div>
              <div className="font-display text-[28px] font-bold tracking-[-1px] leading-none text-emerald">
                Doação · Dinheiro
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
