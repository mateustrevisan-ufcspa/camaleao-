'use client'

import { useRef, useState, useTransition } from 'react'
import { Check } from 'lucide-react'
import { registerDonation } from '@/actions/donations'
import { DonorField } from '@/components/clients/donor-field'
import { dataDoEvento } from '@/components/donations/eventos'
import type { Campanha, Evento, TaxaEmVigor } from '@/types'
import { BANDEIRAS, FORMAS_DA_DOACAO, pedeBandeira, textoDaTaxa, type Bandeira, type FormaDaDoacao } from '@/lib/taxas'
import { brTodayStr, formatBRL, parseMoney } from '@/lib/utils'
import { pedeConfirmacao } from '@/lib/valor-alto'

interface DbTag { id: string; name: string; color: string; bg_color: string }

const origins = ['PIX', 'Dinheiro', 'Site', 'Transferência', 'Outro']

export function NewDonationForm({ tags, eventos, campanhas, bancos, taxas }: {
  tags: DbTag[]
  eventos: Evento[]
  campanhas: Campanha[]
  bancos: { id: string; name: string; type: string }[]
  taxas: TaxaEmVigor[]
}) {
  const [isPending, startTransition] = useTransition()
  const [frequency, setFrequency] = useState<'monthly' | 'one_time'>('one_time')
  const [eventoId, setEventoId] = useState('')
  const [campanhaId, setCampanhaId] = useState('')
  // Hoje em Brasília: em UTC, depois das 21h já seria amanhã (achado na US-17).
  const today = brTodayStr()
  const [date, setDate] = useState(today)
    const [error, setError] = useState<string | null>(null)
  // US-34: valor acima do limite esperando confirmação; null quando não há nada a confirmar.
  const [valorAConfirmar, setValorAConfirmar] = useState<number | null>(null)
  const formRef = useRef<HTMLFormElement>(null)

  // US-35: maquininha ('' = sem maquininha), forma e bandeira.
  const [bancoId, setBancoId] = useState('')
  const [forma, setForma] = useState<FormaDaDoacao>('pix')
  const [bandeira, setBandeira] = useState<Bandeira>('visa_master')
  const [valorDigitado, setValorDigitado] = useState(0)
  const banco = bancos.find((b) => b.id === bancoId)
  const formasDoBanco = (Object.keys(FORMAS_DA_DOACAO) as FormaDaDoacao[]).filter((f) => FORMAS_DA_DOACAO[f].tipoDoBanco === banco?.type)
  const escolha = FORMAS_DA_DOACAO[forma]
  const comBandeira = !!banco && pedeBandeira(banco.name, escolha.forma)
  const taxa = banco
    ? taxas.find(
        (t) =>
          t.bank_id === banco.id &&
          t.forma === escolha.forma &&
          t.parcelado === escolha.parcelado &&
          (t.bandeira ?? null) === (comBandeira ? bandeira : null)
      )?.taxa ?? null
    : null

  function escolherBanco(id: string) {
    setBancoId(id)
    const tipo = bancos.find((b) => b.id === id)?.type
    setForma(tipo === 'pix' ? 'pix' : 'debit')
  }

  function enviar(confirmado: boolean) {
    if (!formRef.current) return
    setError(null)
    const fd = new FormData(formRef.current)
    const valor = parseMoney((fd.get('amount') as string) || '0')
    if (pedeConfirmacao(valor) && !confirmado) {
      setValorAConfirmar(valor)
      return
    }
    if (confirmado) fd.set('confirmar_valor_alto', 'sim')
    setValorAConfirmar(null)
    fd.set('frequency', frequency)
    fd.set('donated_at', date)
    if (bancoId) {
      fd.set('bank_id', bancoId)
      fd.set('forma', forma)
      if (comBandeira) fd.set('bandeira', bandeira)
    }
    startTransition(async () => {
      const res = await registerDonation(fd)
      if (res?.error) setError(res.error)
    })
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    enviar(false)
  }

  function corrigirValor() {
    setValorAConfirmar(null)
    formRef.current?.querySelector<HTMLInputElement>('input[name="amount"]')?.focus()
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-5">

          <DonorField tags={tags} />

          <div className="bg-paper border border-rule rounded-[16px] p-6">
            <div className="text-[11px] font-body text-muted tracking-[1px] uppercase mb-4">Dados da doação</div>
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="data-da-doacao" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                    Data <span className="text-accent">*</span>
                  </label>
                  <input id="data-da-doacao" type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} className="input-base" />
                </div>
                <div>
                  <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                    Valor (R$) <span className="text-accent">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-muted text-[13px] font-body pointer-events-none">R$</span>
                                        <input
                      name="amount"
                      required
                      placeholder="0,00"
                      type="number"
                      min="0.01"
                      step="0.01"
                      onChange={(e) => { setValorAConfirmar(null); setValorDigitado(parseMoney(e.target.value || '0')) }}
                      className="input-base pl-8"
                    />
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

              <div className="grid gap-3" style={{ gridTemplateColumns: banco ? (comBandeira ? '1fr 1fr 1fr' : '1fr 1fr') : '1fr' }}>
                <div>
                  <label htmlFor="maquininha-da-doacao" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                    Recebido por
                  </label>
                  <select id="maquininha-da-doacao" value={bancoId} onChange={(e) => escolherBanco(e.target.value)} className="input-base">
                    <option value="">Sem maquininha (espécie ou transferência)</option>
                    {bancos.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
                {banco && (
                  <div>
                    <label htmlFor="forma-da-doacao" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                      Forma
                    </label>
                    <select id="forma-da-doacao" value={forma} onChange={(e) => setForma(e.target.value as FormaDaDoacao)} className="input-base">
                      {formasDoBanco.map((f) => <option key={f} value={f}>{FORMAS_DA_DOACAO[f].rotulo}</option>)}
                    </select>
                  </div>
                )}
                {comBandeira && (
                  <div>
                    <label htmlFor="bandeira-da-doacao" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                      Bandeira
                    </label>
                    <select id="bandeira-da-doacao" value={bandeira} onChange={(e) => setBandeira(e.target.value as Bandeira)} className="input-base">
                      {BANDEIRAS.map((b) => <option key={b.valor} value={b.valor}>{b.rotulo}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {eventos.length > 0 && (
                <div>
                  <label htmlFor="evento-da-doacao" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                    Evento (opcional)
                  </label>
                  <select
                    id="evento-da-doacao"
                    name="event_id"
                    value={eventoId}
                    onChange={(e) => { setEventoId(e.target.value); if (e.target.value) setCampanhaId('') }}
                    className="input-base"
                  >
                    <option value="">Sem evento</option>
                    {eventos.map((ev) => (
                      <option key={ev.id} value={ev.id}>{ev.name} · {dataDoEvento(ev.event_date)}</option>
                    ))}
                  </select>
                </div>
              )}

              {campanhas.length > 0 && (
                <div>
                  <label htmlFor="campanha-da-doacao" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                    Campanha (opcional)
                  </label>
                  <select
                    id="campanha-da-doacao"
                    name="campaign_id"
                    value={campanhaId}
                    onChange={(e) => { setCampanhaId(e.target.value); if (e.target.value) setEventoId('') }}
                    className="input-base"
                  >
                    <option value="">Sem campanha</option>
                    {campanhas.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

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
            {eventoId && (
              <>
                <div className="text-[13px] font-body text-muted mb-1">Evento</div>
                <div className="text-sm font-body text-ink font-medium mb-5">
                  {eventos.find((ev) => ev.id === eventoId)?.name}
                </div>
              </>
            )}
            {campanhaId && (
              <>
                <div className="text-[13px] font-body text-muted mb-1">Campanha</div>
                <div className="text-sm font-body text-ink font-medium mb-5">
                  {campanhas.find((c) => c.id === campanhaId)?.name}
                </div>
              </>
            )}
            {banco && (
              <>
                <div className="text-[13px] font-body text-muted mb-1">Líquido estimado</div>
                <div data-testid="liquido-estimado" className="text-sm font-body text-ink font-medium mb-5">
                  {taxa === null
                    ? 'taxa não cadastrada'
                    : `R$ ${formatBRL(Math.round(valorDigitado * (1 - taxa / 100) * 100) / 100)} (taxa ${textoDaTaxa(taxa)})`}
                </div>
              </>
            )}
            <div className="border-t border-rule pt-4 mb-6">
              <div className="text-[11px] text-muted tracking-[1.5px] uppercase font-body mb-1.5">Categoria</div>
              <div className="font-display text-[28px] font-bold tracking-[-1px] leading-none text-emerald">
                Doação · Dinheiro
              </div>
            </div>
                       {valorAConfirmar !== null && (
              <div
                role="alertdialog"
                aria-labelledby="titulo-valor-alto"
                data-testid="confirmacao-valor-alto"
                className="rounded-[10px] px-4 py-3 font-body mb-4 border"
                style={{ backgroundColor: '#FBE3CA', borderColor: '#C97D3E' }}
              >
                <div id="titulo-valor-alto" className="text-[13px] text-ink font-medium">
                  Valor alto: R$ {formatBRL(valorAConfirmar)}
                </div>
                <p className="text-xs text-muted m-0 mt-1">Confira se não sobrou um zero. O valor está certo?</p>
                <div className="flex gap-2 mt-3">
                  <button type="button" onClick={() => enviar(true)} disabled={isPending} className="chip bg-emerald text-white border-emerald disabled:opacity-50">
                    Sim, registrar
                  </button>
                  <button type="button" onClick={corrigirValor} disabled={isPending} className="chip bg-bg">
                    Corrigir o valor
                  </button>
                </div>
              </div>
            )}
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
