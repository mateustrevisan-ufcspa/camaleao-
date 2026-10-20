'use client'

import { Fragment, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { fetchClientHistory, fetchRegistroOriginal } from '@/actions/clients'
import { formatBRL } from '@/lib/utils'
import type { ItemDoHistorico, RegistroOriginal, TipoDeContribuicao } from '@/types'

const POR_VEZ = 10

const TIPOS: Record<TipoDeContribuicao, { rotulo: string; bg: string; color: string }> = {
  venda:     { rotulo: 'Compra',             bg: '#FBE3CA', color: '#C97D3E' },
  dinheiro:  { rotulo: 'Doação · dinheiro',  bg: '#DCEBE0', color: '#2E5C3E' },
  itens:     { rotulo: 'Doação · itens',     bg: '#E2DCF3', color: '#4B3A9B' },
  tampinhas: { rotulo: 'Doação · tampinhas', bg: '#FDE7E7', color: '#E25A8F' },
}

type Painel = { item: ItemDoHistorico; registro: RegistroOriginal | null | 'carregando' }

// A ficha monta este componente com key={client.id}: trocar de pessoa recomeça
// do zero, e null quer dizer "carregando".
export function HistoricoDaPessoa({ clientId }: { clientId: string }) {
  const [historico, setHistorico] = useState<{ linhas: ItemDoHistorico[]; erro: boolean } | null>(null)
  const [mostrando, setMostrando] = useState(POR_VEZ)
  const [painel, setPainel] = useState<Painel | null>(null)

  useEffect(() => {
    let ativo = true
    fetchClientHistory(clientId)
      .then((linhas) => { if (ativo) setHistorico({ linhas, erro: false }) })
      .catch((e) => {
        console.error(e)
        if (ativo) setHistorico({ linhas: [], erro: true })
      })
    return () => { ativo = false }
  }, [clientId])

  function abrir(item: ItemDoHistorico) {
    setPainel({ item, registro: 'carregando' })
    fetchRegistroOriginal(item.tipo, item.id)
      .then((registro) => setPainel((atual) => (atual?.item.id === item.id ? { item, registro } : atual)))
      .catch((e) => {
        console.error(e)
        setPainel((atual) => (atual?.item.id === item.id ? { item, registro: null } : atual))
      })
  }

  const linhas = historico?.linhas ?? []

  return (
    <div className="p-6">
      <h4 className="text-[11px] text-muted tracking-[1.5px] uppercase font-body mb-3.5">Histórico de compras e doações</h4>

      {historico === null ? (
        <div className="text-sm text-muted font-body py-2">Carregando...</div>
      ) : historico.erro ? (
        <div className="text-sm text-muted font-body py-2">Não foi possível carregar o histórico.</div>
      ) : linhas.length === 0 ? (
        <div className="text-sm text-muted font-body italic py-2">Nenhuma compra ou doação registrada.</div>
      ) : (
        <>
          <ul data-testid="historico-da-pessoa" className="m-0 p-0 list-none">
            {linhas.slice(0, mostrando).map((l) => (
              <li key={`${l.tipo}-${l.id}`} className="border-b border-rule last:border-0">
                <button
                  type="button"
                  onClick={() => abrir(l)}
                  className="w-full text-left flex justify-between items-center gap-3 py-3 px-1 rounded-[8px] hover:bg-bg/60 transition-colors"
                >
                  <span className="min-w-0">
                    <span
                      className="inline-flex items-center px-2.5 h-[20px] rounded-full text-[11px] font-medium font-body whitespace-nowrap"
                      style={{ backgroundColor: TIPOS[l.tipo].bg, color: TIPOS[l.tipo].color }}
                    >
                      {TIPOS[l.tipo].rotulo}
                    </span>
                    <span className="block font-body text-[13px] text-ink mt-1 truncate">{l.descricao}</span>
                    <span data-testid="data-do-registro" className="block font-mono text-[11px] text-muted mt-0.5">
                      {new Date(l.data).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                    </span>
                  </span>
                  {l.valor !== null && (
                    <span className="font-display text-[16px] text-ink shrink-0">R$ {formatBRL(l.valor)}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
          {linhas.length > mostrando && (
            <button type="button" onClick={() => setMostrando((n) => n + POR_VEZ)} className="chip bg-bg mt-4">
              Mostrar mais ({linhas.length - mostrando})
            </button>
          )}
        </>
      )}

      {painel && (
        <PainelDoRegistro
          titulo={TIPOS[painel.item.tipo].rotulo}
          registro={painel.registro}
          onClose={() => setPainel(null)}
        />
      )}
    </div>
  )
}

function PainelDoRegistro({
  titulo,
  registro,
  onClose,
}: {
  titulo: string
  registro: RegistroOriginal | null | 'carregando'
  onClose: () => void
}) {
  useEffect(() => {
    function tecla(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Registro original"
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(31,22,56,0.4)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-paper rounded-[20px] w-full max-w-[440px] shadow-xl">
        <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-rule">
          <div>
            <h2 className="font-display text-[22px] text-ink font-semibold tracking-[-0.4px] m-0">
              {registro && registro !== 'carregando' ? registro.titulo : titulo}
            </h2>
            <p className="font-body text-xs text-muted mt-1 m-0">Registro original, como foi gravado.</p>
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-muted hover:text-ink hover:bg-bg transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-7 py-6">
          {registro === 'carregando' ? (
            <p className="font-body text-sm text-muted m-0">Carregando...</p>
          ) : registro === null ? (
            <p className="font-body text-sm text-muted m-0">Este registro não está disponível para o seu perfil.</p>
          ) : (
            <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5">
              {registro.campos.map((c, i) => (
                <Fragment key={i}>
                  <dt className="font-body text-[12px] text-muted">{c.rotulo}</dt>
                  <dd className="m-0 font-body text-[13px] text-ink">{c.valor}</dd>
                </Fragment>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  )
}
