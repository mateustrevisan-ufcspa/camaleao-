'use client'

import { useEffect, useState } from 'react'
import { fetchContribuicao } from '@/actions/clients'
import { atendimentos, textoDeAtendimentos } from '@/lib/atendimentos'
import { brTodayStr, formatBRL } from '@/lib/utils'
import type { ContribuicaoNoPeriodo } from '@/types'

type Periodo = 'ano' | '12meses' | 'anoPassado' | 'datas'

const PERIODOS: { valor: Periodo; rotulo: string }[] = [
  { valor: 'ano', rotulo: 'Este ano' },
  { valor: '12meses', rotulo: 'Últimos 12 meses' },
  { valor: 'anoPassado', rotulo: 'Ano passado' },
  { valor: 'datas', rotulo: 'Escolher datas' },
]

const ITENS_POR_VEZ = 10

// "AAAA-MM-DD" de n dias antes de uma data, sem passar por fuso.
function diasAntes(data: string, n: number): string {
  const [y, m, d] = data.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d) - n * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
}

function intervalo(periodo: Periodo, datas: { inicio: string; fim: string }): { inicio: string; fim: string } {
  const hoje = brTodayStr()
  const ano = Number(hoje.slice(0, 4))
  if (periodo === 'ano') return { inicio: `${ano}-01-01`, fim: hoje }
  if (periodo === '12meses') return { inicio: diasAntes(hoje, 364), fim: hoje }
  if (periodo === 'anoPassado') return { inicio: `${ano - 1}-01-01`, fim: `${ano - 1}-12-31` }
  return datas
}

const dataCurta = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })

function quanto(i: ContribuicaoNoPeriodo['itens'][number]) {
  const partes = [
    i.quantidade ? `${i.quantidade} un` : '',
    i.peso ? `${i.peso.toLocaleString('pt-BR')} kg` : '',
  ].filter(Boolean)
  return partes.length > 0 ? partes.join(' · ') : 'só o registro'
}

// A ficha monta este cartão com uma key feita do id da pessoa: trocar de pessoa
// recomeça do zero (US-10).
export function ContribuicaoNaFicha({ clientId }: { clientId: string }) {
  const [periodo, setPeriodo] = useState<Periodo>('ano')
  const [datas, setDatas] = useState(() => intervalo('ano', { inicio: '', fim: '' }))
  const [mostrando, setMostrando] = useState(ITENS_POR_VEZ)
  // O resultado guarda o período que o gerou: resposta atrasada de outro período é ignorada.
  const [resultado, setResultado] = useState<{ chave: string; dados: ContribuicaoNoPeriodo | null } | null>(null)

  const { inicio, fim } = intervalo(periodo, datas)
  const valido = /^\d{4}-\d{2}-\d{2}$/.test(inicio) && /^\d{4}-\d{2}-\d{2}$/.test(fim) && inicio <= fim
  const chave = `${inicio}|${fim}`

  useEffect(() => {
    if (!valido) return
    let ativo = true
    fetchContribuicao(clientId, inicio, fim)
      .then((dados) => { if (ativo) setResultado({ chave, dados }) })
      .catch((e) => {
        console.error(e)
        if (ativo) setResultado({ chave, dados: null })
      })
    return () => { ativo = false }
  }, [clientId, inicio, fim, chave, valido])

  const carregando = valido && resultado?.chave !== chave
  const dados = !carregando && resultado?.chave === chave ? resultado.dados : null

  return (
    <div data-testid="contribuicao-no-periodo" className="p-6 border-b border-rule">
      <h4 className="text-[11px] text-muted tracking-[1.5px] uppercase font-body mb-3.5">Contribuição no período</h4>

      <div className="flex flex-wrap gap-2 mb-4">
        {PERIODOS.map((p) => (
          <button
            key={p.valor}
            type="button"
            aria-pressed={periodo === p.valor}
            onClick={() => { setPeriodo(p.valor); setMostrando(ITENS_POR_VEZ) }}
            className={`chip transition-colors ${periodo === p.valor ? 'bg-ink text-bg border-ink' : 'bg-paper text-muted border-rule'}`}
          >
            {p.rotulo}
          </button>
        ))}
      </div>

      {periodo === 'datas' && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label htmlFor="contribuicao-de" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">De</label>
            <input
              id="contribuicao-de"
              type="date"
              value={datas.inicio}
              max={datas.fim || undefined}
              onChange={(e) => setDatas((d) => ({ ...d, inicio: e.target.value }))}
              className="input-base"
            />
          </div>
          <div>
            <label htmlFor="contribuicao-ate" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">Até</label>
            <input
              id="contribuicao-ate"
              type="date"
              value={datas.fim}
              min={datas.inicio || undefined}
              onChange={(e) => setDatas((d) => ({ ...d, fim: e.target.value }))}
              className="input-base"
            />
          </div>
        </div>
      )}

      {!valido ? (
        <div className="text-sm text-muted font-body py-2">Escolha a data inicial e a final.</div>
      ) : carregando ? (
        <div className="text-sm text-muted font-body py-2">Carregando...</div>
      ) : !dados ? (
        <div className="text-sm text-muted font-body py-2">Não foi possível calcular a contribuição.</div>
      ) : (
        <>
          <div className="mb-4">
            <div className="text-[11px] text-muted tracking-[1.5px] uppercase font-body mb-1">
              Total de {dataCurta(`${dados.inicio}T12:00:00-03:00`)} a {dataCurta(`${dados.fim}T12:00:00-03:00`)}
            </div>
            <div data-testid="contribuicao-total" className="font-display text-[32px] text-ink font-semibold tracking-[-0.8px] leading-none">
              R$ {formatBRL(dados.total)}
            </div>
          </div>

          <dl className="m-0 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 font-body text-[13px]">
            <dt className="text-muted">
              Compras no brechó ({dados.compras.quantidade})
            </dt>
            <dd data-testid="contribuicao-compras" className="m-0 text-ink text-right">R$ {formatBRL(dados.compras.valor)}</dd>
            <dt className="text-muted">
              Doações em dinheiro ({dados.doacoes.quantidade})
            </dt>
            <dd data-testid="contribuicao-doacoes" className="m-0 text-ink text-right">R$ {formatBRL(dados.doacoes.valor)}</dd>
            {dados.eventos.map((ev) => (
              <div key={ev.nome} className="contents">
                <dt className="text-muted pl-4">das quais no evento {ev.nome}</dt>
                <dd data-testid="contribuicao-evento" className="m-0 text-muted text-right">R$ {formatBRL(ev.valor)}</dd>
              </div>
            ))}
            {dados.campanhas.map((c) => (
              <div key={c.nome} className="contents">
                <dt className="text-muted pl-4">das quais na campanha {c.nome}</dt>
                <dd data-testid="contribuicao-campanha" className="m-0 text-muted text-right">R$ {formatBRL(c.valor)}</dd>
              </div>
            ))}
          </dl>

                    <div className="mt-5">
            <div className="text-[11px] text-muted tracking-[1.5px] uppercase font-body mb-2">
              Em atendimentos custeados (R$ {formatBRL(dados.valorDoAtendimento)} cada)
            </div>
            <dl className="m-0 grid grid-cols-[1fr_auto] gap-x-4 gap-y-2 font-body text-[13px]">
              <dt className="text-muted">Compras no brechó</dt>
              <dd data-testid="atendimentos-compras" className="m-0 text-ink text-right">
                {textoDeAtendimentos(atendimentos(dados.compras.valor, dados.valorDoAtendimento))}
              </dd>
              <dt className="text-muted">Doações em dinheiro</dt>
              <dd data-testid="atendimentos-doacoes" className="m-0 text-ink text-right">
                {textoDeAtendimentos(atendimentos(dados.doacoes.valor, dados.valorDoAtendimento))}
              </dd>
              <dt className="text-ink font-medium">Total</dt>
              <dd data-testid="atendimentos-total" className="m-0 text-ink font-medium text-right">
                {textoDeAtendimentos(atendimentos(dados.total, dados.valorDoAtendimento))}
              </dd>
            </dl>
          </div>

          <div className="mt-5">
            <div className="text-[11px] text-muted tracking-[1.5px] uppercase font-body mb-2">
              Itens doados ({dados.itens.length})
            </div>
            {dados.itens.length === 0 ? (
              <div className="text-sm text-muted font-body italic">Nenhum item doado no período.</div>
            ) : (
              <>
                <ul data-testid="contribuicao-itens" className="m-0 p-0 list-none">
                  {dados.itens.slice(0, mostrando).map((i, n) => (
                    <li key={n} className="flex justify-between gap-3 py-2 border-b border-rule last:border-0 font-body text-[13px]">
                      <span className="text-ink">{i.categoria} · {quanto(i)}</span>
                      <span className="font-mono text-[11px] text-muted">{dataCurta(i.data)}</span>
                    </li>
                  ))}
                </ul>
                {dados.itens.length > mostrando && (
                  <button type="button" onClick={() => setMostrando((m) => m + ITENS_POR_VEZ)} className="chip bg-bg mt-3">
                    Mostrar mais ({dados.itens.length - mostrando})
                  </button>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}
