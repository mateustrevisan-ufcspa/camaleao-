'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { registerDonationItem } from '@/actions/donations'
import { editarDoacaoDeItem } from '@/actions/itens'
import { DonorField } from '@/components/clients/donor-field'
import { brTodayStr, dataDeBrasilia } from '@/lib/utils'
import { MAXIMO_DA_CONTAGEM, semTriagem } from '@/lib/triagem'
import type { DoacaoDeItemParaEditar } from '@/types'

interface Category { id: string; name: string }
interface DbTag { id: string; name: string; color: string; bg_color: string }

interface NewDonationItemFormProps {
  categories: Category[]
  tags?: DbTag[]
  categoriaInicial?: string
  // US-04a: com a doação, o formulário abre preenchido e salva a alteração.
  doacao?: DoacaoDeItemParaEditar
}

export function NewDonationItemForm({ categories, tags = [], categoriaInicial, doacao }: NewDonationItemFormProps) {
  const [isPending, startTransition] = useTransition()
  // Dia de Brasília, e não de UTC: depois das 21h o UTC já está no dia seguinte (BUG-01).
  const today = brTodayStr()
  const [date, setDate] = useState(doacao ? dataDeBrasilia(doacao.donated_at) : today)
  const [categoryId, setCategoryId] = useState(
    doacao?.category_id ?? categories.find((c) => c.name === categoriaInicial)?.id ?? ''
  )
  const [error, setError] = useState<string | null>(null)

  const categoria = categories.find((c) => c.id === categoryId)
  // US-27: tampinha só registra que chegou, com a quantidade; as outras têm triagem.
  const comTriagem = !categoria || !semTriagem(categoria.name)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    fd.set('donated_at', date)
    fd.set('category_id', categoryId)
    startTransition(async () => {
      const res = doacao ? await editarDoacaoDeItem(doacao.id, fd) : await registerDonationItem(fd)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 grid-cols-1 md:grid-cols-[1.6fr_1fr]">
        <div className="flex flex-col gap-5">

          {doacao ? <DoadorDaDoacao doacao={doacao} /> : <DonorField tags={tags} />}

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

              {comTriagem ? (
                <div>
                  <div className="text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                    Triagem <span className="normal-case tracking-normal">(pode ficar vazia na entrada)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      ['aproveitadas', 'Aproveitadas', doacao?.aproveitadas],
                      ['redoadas', 'Redoadas', doacao?.redoadas],
                      ['descarte', 'Descarte', doacao?.descarte],
                    ] as const).map(([campo, rotulo, valor]) => (
                      <div key={campo}>
                        <label htmlFor={`${campo}-do-item`} className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                          {rotulo}
                        </label>
                        <input
                          id={`${campo}-do-item`}
                          name={campo}
                          type="number"
                          min="0"
                          max={MAXIMO_DA_CONTAGEM}
                          step="1"
                          inputMode="numeric"
                          defaultValue={valor ?? ''}
                          className="input-base"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Tampinha: só a quantidade. O peso saiu do formulário (Tamara, 03/11).
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="quantidade-do-item" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                      Quantidade
                    </label>
                    <input id="quantidade-do-item" name="quantity" type="number" min="1" step="1" placeholder="opcional" defaultValue={doacao?.quantity ?? ''} className="input-base" />
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="observacoes-do-item" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">Observações</label>
                <textarea id="observacoes-do-item" name="notes" rows={3} placeholder="Contexto sobre a doação..." defaultValue={doacao?.notes ?? ''} className="input-base resize-none" />
              </div>

              {/* SEC-04: na correção, o motivo é opcional e vai para a trilha de auditoria. */}
              {doacao && (
                <div>
                  <label htmlFor="motivo-da-correcao" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                    Motivo da correção (opcional)
                  </label>
                  <input id="motivo-da-correcao" name="motivo_da_alteracao" maxLength={300} placeholder="Ex.: quantidade digitada errada" className="input-base" />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:sticky md:top-6 md:self-start">
          <div className="bg-paper border border-rule rounded-[16px] p-6">
            <div className="text-[11px] text-muted tracking-[2px] uppercase font-body mb-4">Resumo</div>
            <div className="text-[13px] font-body text-muted mb-1">Categoria</div>
            <div className="text-sm font-body text-ink font-medium mb-5">{categoria?.name ?? 'escolha na lista'}</div>
            {comTriagem && (
              <>
                <div className="text-[13px] font-body text-muted mb-1">Triagem</div>
                <div className="text-sm font-body text-ink font-medium mb-5">
                  {doacao?.aproveitadas != null ? 'registrada' : 'pendente se ficar vazia'}
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
              {doacao
                ? (isPending ? 'Salvando...' : 'Salvar alteração')
                : (isPending ? 'Registrando...' : 'Registrar doação')}
            </button>
            {doacao && (
              <Link href="/doacoes/itens" className="block text-center mt-3 font-body text-sm text-muted no-underline hover:text-ink">
                Cancelar
              </Link>
            )}
          </div>
        </div>
      </div>
    </form>
  )
}
// US-04a: na edição, a pessoa da doação com ficha não muda. Sem ficha, nome e
// telefone podem ser corrigidos.
function DoadorDaDoacao({ doacao }: { doacao: DoacaoDeItemParaEditar }) {
  return (
    <div className="bg-paper border border-rule rounded-[16px] p-6">
      <div className="text-[11px] font-body text-muted tracking-[1px] uppercase mb-4">Doador</div>
      {doacao.client_id ? (
        <>
          <div className="text-sm font-body text-ink font-medium">{doacao.donor_name}</div>
          <p className="text-xs text-muted font-body mt-1 m-0">
            Doação com ficha. Para trocar a pessoa, exclua esta doação e registre de novo.
          </p>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="nome-do-doador" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
              Nome <span className="text-accent">*</span>
            </label>
            <input id="nome-do-doador" name="donor_name" required defaultValue={doacao.donor_name} className="input-base" />
          </div>
          <div>
            <label htmlFor="telefone-do-doador" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
              Telefone
            </label>
            <input id="telefone-do-doador" name="donor_phone" type="tel" defaultValue={doacao.donor_phone ?? ''} className="input-base" />
          </div>
        </div>
      )}
    </div>
  )
}
