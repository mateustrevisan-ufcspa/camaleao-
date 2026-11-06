'use client'

import { useState, useTransition } from 'react'
import { definirTaxaDeCartao } from '@/actions/taxas'
import { BANDEIRAS, pedeBandeira, rotuloDaCombinacao, textoDaTaxa } from '@/lib/taxas'
import type { AlteracaoDeTaxa, TaxaEmVigor } from '@/types'

// US-32 · Taxas das maquininhas, no padrão da tela do valor do atendimento (US-19).

const dataEHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' })

const FORMAS = [
  { valor: 'pix', rotulo: 'Pix' },
  { valor: 'debit', rotulo: 'Débito' },
  { valor: 'credit_avista', rotulo: 'Crédito à vista' },
  { valor: 'credit_parcelado', rotulo: 'Crédito parcelado' },
]

export function TaxasDeCartao({
  bancos,
  vigentes,
  historico,
}: {
  bancos: { id: string; name: string; type: string }[]
  vigentes: TaxaEmVigor[]
  historico: AlteracaoDeTaxa[]
}) {
  const [bancoId, setBancoId] = useState(bancos.find((b) => b.type === 'card')?.id ?? bancos[0]?.id ?? '')
  const [forma, setForma] = useState('credit_avista')
  const [erro, setErro] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const banco = bancos.find((b) => b.id === bancoId)
  const comBandeira = pedeBandeira(banco?.name, forma === 'debit' ? 'debit' : '')

  function definir(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErro(null)
    const form = e.currentTarget
    const fd = new FormData(form)
    startTransition(async () => {
      const res = await definirTaxaDeCartao(fd)
      if (res?.error) {
        setErro(res.error)
        return
      }
      const campo = form.elements.namedItem('taxa')
      if (campo instanceof HTMLInputElement) campo.value = ''
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={definir} className="bg-paper border border-rule rounded-[16px] p-6 grid gap-3 grid-cols-1 md:grid-cols-[1.4fr_1.4fr_1.2fr_0.8fr_auto] items-end">
        <div>
          <label htmlFor="maquininha-da-taxa" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">Maquininha</label>
          <select id="maquininha-da-taxa" name="bank_id" value={bancoId} onChange={(e) => setBancoId(e.target.value)} className="input-base">
            {bancos.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="forma-da-taxa" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">Forma</label>
          <select id="forma-da-taxa" name="forma" value={forma} onChange={(e) => setForma(e.target.value)} className="input-base">
            {FORMAS.map((f) => <option key={f.valor} value={f.valor}>{f.rotulo}</option>)}
          </select>
        </div>
        <div>
          {comBandeira && (
            <>
              <label htmlFor="bandeira-da-taxa" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">Bandeira</label>
              <select id="bandeira-da-taxa" name="bandeira" className="input-base">
                {BANDEIRAS.map((b) => <option key={b.valor} value={b.valor}>{b.rotulo}</option>)}
              </select>
            </>
          )}
        </div>
        <div>
          <label htmlFor="valor-da-taxa" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">Taxa (%)</label>
          <input id="valor-da-taxa" name="taxa" inputMode="decimal" placeholder="1,88" required className="input-base" />
        </div>
        <button type="submit" disabled={isPending} className="btn-dark disabled:opacity-50">Salvar taxa</button>
        {erro && (
          <div className="md:col-span-5 rounded-[10px] px-4 py-3 font-body text-[13px]" style={{ backgroundColor: '#F8DCD2', color: '#D87560' }}>
            {erro}
          </div>
        )}
      </form>

      <div className="bg-paper border border-rule rounded-[16px] overflow-hidden">
        <div className="px-6 py-5 border-b border-rule">
          <h3 className="font-display text-xl text-ink font-medium m-0">Taxas em vigor</h3>
        </div>
        <div className="overflow-x-auto">
          <table data-testid="taxas-em-vigor" className="w-full border-collapse font-body text-[13px] min-w-[560px]">
            <thead>
              <tr className="bg-bg text-left text-[11px] text-muted uppercase tracking-[1px]">
                <th className="px-6 py-3 font-medium">Maquininha</th>
                <th className="px-6 py-3 font-medium">Forma</th>
                <th className="px-6 py-3 font-medium text-right">Taxa</th>
                <th className="px-6 py-3 font-medium">Desde</th>
              </tr>
            </thead>
            <tbody>
              {vigentes.map((t) => (
                <tr key={t.id} className="border-t border-rule">
                  <td className="px-6 py-3 text-ink">{t.bank_name}</td>
                  <td className="px-6 py-3 text-ink">{rotuloDaCombinacao(t)}</td>
                  <td className="px-6 py-3 text-right text-ink font-medium">{textoDaTaxa(t.taxa)}</td>
                  <td className="px-6 py-3 font-mono text-xs text-muted">{dataEHora(t.definido_em)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="px-6 py-4 m-0 border-t border-rule font-body text-[12px] text-muted">
          A taxa vale para as vendas registradas depois da alteração. As vendas já registradas mantêm o valor líquido calculado na hora. Combinação sem taxa: a venda entra e o financeiro mostra &quot;taxa não cadastrada&quot;; se não houver taxa, cadastre 0.
        </p>
      </div>

      <div className="bg-paper border border-rule rounded-[16px] overflow-hidden">
        <div className="px-6 py-5 border-b border-rule">
          <h3 className="font-display text-xl text-ink font-medium m-0">Quem alterou e quando</h3>
        </div>
        <ul data-testid="historico-das-taxas" className="m-0 p-0 list-none">
          {historico.map((h) => (
            <li key={h.id} className="border-t border-rule first:border-t-0 px-6 py-3 font-body text-[13px] text-ink">
              {h.bank_name} · {rotuloDaCombinacao(h)}: {textoDaTaxa(h.taxa)}
              <span className="text-muted"> · {dataEHora(h.definido_em)} · {h.definidoPor ?? 'carga inicial (Nílian, 30/10)'}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
