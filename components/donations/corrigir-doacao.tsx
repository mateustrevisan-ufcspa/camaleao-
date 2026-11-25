'use client'

import { useState, useTransition } from 'react'
import { corrigirDoacaoEmDinheiro } from '@/actions/correcoes'
import { BANDEIRAS, FORMAS_DA_DOACAO, pedeBandeira, type Bandeira, type FormaDaDoacao } from '@/lib/taxas'
import { brTodayStr } from '@/lib/utils'
import type { DoacaoEmDinheiroParaCorrigir, TaxaEmVigor } from '@/types'

const ORIGENS = ['PIX', 'Dinheiro', 'Site', 'Transferência', 'Outro']

function formaInicial(d: DoacaoEmDinheiroParaCorrigir): FormaDaDoacao {
  if (d.forma === 'credit') return d.parcelado ? 'credit_parcelado' : 'credit_avista'
  return d.forma ?? 'pix'
}

export function CorrigirDoacao({ doacao, dataInicial, bancos }: {
  doacao: DoacaoEmDinheiroParaCorrigir; dataInicial: string
  bancos: { id: string; name: string; type: string }[]; taxas: TaxaEmVigor[]
}) {
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const [bancoId, setBancoId] = useState(doacao.bank_id ?? '')
  const [forma, setForma] = useState<FormaDaDoacao>(formaInicial(doacao))
  const [bandeira, setBandeira] = useState<Bandeira>(doacao.bandeira ?? 'visa_master')
  const banco = bancos.find((b) => b.id === bancoId)
  const formas = (Object.keys(FORMAS_DA_DOACAO) as FormaDaDoacao[]).filter((f) => FORMAS_DA_DOACAO[f].tipoDoBanco === banco?.type)
  const comBandeira = !!banco && pedeBandeira(banco.name, FORMAS_DA_DOACAO[forma].forma)

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    if (bancoId) { fd.set('bank_id', bancoId); fd.set('forma', forma); if (comBandeira) fd.set('bandeira', bandeira) }
    setErro(null)
    startTransition(async () => {
      const r = await corrigirDoacaoEmDinheiro(doacao.id, fd)
      if (r?.error) setErro(r.error)
    })
  }

  return (
    <form onSubmit={enviar} className="bg-paper border border-rule rounded-[16px] p-6 grid gap-4 font-body">
      <div className="grid grid-cols-2 gap-3">
        <label className="text-[11px] text-muted tracking-[1px] uppercase">Valor (R$)
          <input name="amount" type="number" min="0.01" step="0.01" required defaultValue={doacao.amount.toFixed(2)} className="input-base mt-1.5" />
        </label>
        <label className="text-[11px] text-muted tracking-[1px] uppercase">Data
          <input name="donated_at" type="date" max={brTodayStr()} required defaultValue={dataInicial} className="input-base mt-1.5" />
        </label>
        <label className="text-[11px] text-muted tracking-[1px] uppercase">Origem
          <select name="origin" defaultValue={doacao.origin} className="input-base mt-1.5">{ORIGENS.map((o) => <option key={o}>{o}</option>)}</select>
        </label>
        <label className="text-[11px] text-muted tracking-[1px] uppercase">Frequência
          <select name="frequency" defaultValue={doacao.frequency} className="input-base mt-1.5">
            <option value="one_time">Pontual</option><option value="monthly">Mensal</option>
          </select>
        </label>
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: banco ? (comBandeira ? '1fr 1fr 1fr' : '1fr 1fr') : '1fr' }}>
        <label className="text-[11px] text-muted tracking-[1px] uppercase">Recebido por
          <select value={bancoId} onChange={(e) => { setBancoId(e.target.value); setForma(bancos.find((b) => b.id === e.target.value)?.type === 'pix' ? 'pix' : 'debit') }} className="input-base mt-1.5">
            <option value="">Sem maquininha (espécie ou transferência)</option>
            {bancos.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </label>
        {banco && (
          <label className="text-[11px] text-muted tracking-[1px] uppercase">Forma
            <select value={forma} onChange={(e) => setForma(e.target.value as FormaDaDoacao)} className="input-base mt-1.5">
              {formas.map((f) => <option key={f} value={f}>{FORMAS_DA_DOACAO[f].rotulo}</option>)}
            </select>
          </label>
        )}
        {comBandeira && (
          <label className="text-[11px] text-muted tracking-[1px] uppercase">Bandeira
            <select value={bandeira} onChange={(e) => setBandeira(e.target.value as Bandeira)} className="input-base mt-1.5">
              {BANDEIRAS.map((b) => <option key={b.valor} value={b.valor}>{b.rotulo}</option>)}
            </select>
          </label>
        )}
      </div>
      <label className="text-[11px] text-muted tracking-[1px] uppercase">Observações
        <textarea name="notes" rows={2} defaultValue={doacao.notes ?? ''} className="input-base resize-none mt-1.5" />
      </label>
      <label className="text-[11px] text-muted tracking-[1px] uppercase">Motivo da correção (opcional)
        <input name="motivo_da_alteracao" maxLength={300} placeholder="Ex.: valor digitado com um zero a mais" className="input-base mt-1.5" />
      </label>
      {erro && <div role="alert" className="rounded-[10px] px-4 py-3 text-[13px]" style={{ backgroundColor: '#F8DCD2', color: '#D87560' }}>{erro}</div>}
      <button type="submit" disabled={isPending} className="bg-emerald text-white border-none py-3 rounded-[10px] text-sm font-medium disabled:opacity-50">
        {isPending ? 'Salvando...' : 'Salvar correção'}
      </button>
    </form>
  )
}
