import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { formatBRL } from '@/lib/utils'
import type { RelatorioConsolidado } from '@/types'

// Relatório consolidado do Instituto (US-17). Componente de servidor: o período
// vai na URL (?de=AAAA-MM-DD&ate=AAAA-MM-DD), então os atalhos são links e as
// datas vão por um formulário simples, sem JavaScript.

export interface AtalhoDePeriodo {
  rotulo: string
  de: string
  ate: string
}

// "AAAA-MM-DD" vira "dd/mm/aaaa", sem passar por fuso.
const dataBR = (d: string) => d.split('-').reverse().join('/')

const kg = (n: number) => n.toLocaleString('pt-BR', { maximumFractionDigits: 2 })

export function RelatorioConsolidadoSecao({
  dados,
  atalhos,
}: {
  dados: RelatorioConsolidado
  atalhos: AtalhoDePeriodo[]
}) {
  return (
    <section data-testid="relatorio-consolidado" className="mb-10">
      <h2 className="font-body text-[11px] text-muted tracking-[2px] uppercase mb-4">
        Instituto · arrecadação no período
      </h2>

      <div className="flex flex-wrap items-end gap-3 mb-3">
        <nav aria-label="Período" className="flex flex-wrap gap-2">
          {atalhos.map((a) => {
            const ativo = a.de === dados.inicio && a.ate === dados.fim
            return (
              <Link
                key={a.rotulo}
                href={`/relatorios?de=${a.de}&ate=${a.ate}`}
                aria-current={ativo ? 'page' : undefined}
                className={`chip no-underline ${ativo ? 'bg-ink text-bg border-ink' : 'bg-paper text-muted border-rule'}`}
              >
                {a.rotulo}
              </Link>
            )
          })}
        </nav>
        <form method="get" action="/relatorios" className="flex flex-wrap items-end gap-2">
          <div>
            <label htmlFor="relatorio-de" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1">De</label>
            <input id="relatorio-de" name="de" type="date" defaultValue={dados.inicio} required className="input-base" />
          </div>
          <div>
            <label htmlFor="relatorio-ate" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1">Até</label>
            <input id="relatorio-ate" name="ate" type="date" defaultValue={dados.fim} required className="input-base" />
          </div>
          <button type="submit" className="btn-dark">Ver período</button>
        </form>
                {/* Link comum, e não <Link>: a resposta é um arquivo para baixar (US-18). */}
        <a href={`/relatorios/exportar?de=${dados.inicio}&ate=${dados.fim}`} download className="chip bg-bg no-underline">
          Exportar planilha
        </a>
      </div>
      <p className="font-body text-[13px] text-muted mb-4 mt-0">
        De {dataBR(dados.inicio)} a {dataBR(dados.fim)}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card>
          <div className="text-[13px] text-muted font-body mb-2">Vendas do brechó ({dados.vendas.quantidade})</div>
          <div data-testid="relatorio-vendas" className="text-[30px] font-display font-bold tracking-[-1px] leading-none text-accent">
            R$ {formatBRL(dados.vendas.valor)}
          </div>
        </Card>
        <Card>
          <div className="text-[13px] text-muted font-body mb-2">Doações em dinheiro ({dados.doacoes.quantidade})</div>
          <div data-testid="relatorio-doacoes" className="text-[30px] font-display font-bold tracking-[-1px] leading-none text-emerald">
            R$ {formatBRL(dados.doacoes.valor)}
          </div>
          {dados.eventos.length > 0 && (
            <ul className="m-0 mt-3 p-0 list-none font-body text-[12px] text-muted">
              {dados.eventos.map((ev) => (
                <li key={ev.nome} data-testid="relatorio-evento">
                  das quais no evento {ev.nome}: R$ {formatBRL(ev.valor)}
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <div className="text-[13px] text-muted font-body mb-2">Total arrecadado</div>
          <div data-testid="relatorio-total" className="text-[30px] font-display font-bold tracking-[-1px] leading-none text-ink">
            R$ {formatBRL(dados.total)}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <h4 className="font-body text-[11px] text-muted tracking-[1.5px] uppercase mb-4 m-0">Itens recebidos por categoria</h4>
          {dados.itens.length === 0 ? (
            <p className="font-body text-sm text-muted">Nenhum item recebido no período.</p>
          ) : (
            <table data-testid="relatorio-itens" className="w-full border-collapse font-body text-[13px]">
              <thead>
                <tr className="text-left text-[11px] text-muted uppercase tracking-[1px]">
                  <th className="py-2 font-medium">Categoria</th>
                  <th className="py-2 font-medium text-right">Doações</th>
                  <th className="py-2 font-medium text-right">Peças</th>
                  <th className="py-2 font-medium text-right">Peso</th>
                </tr>
              </thead>
              <tbody>
                {dados.itens.map((i) => (
                  <tr key={i.categoria} className="border-t border-rule">
                    <td className="py-2 text-ink">{i.categoria}</td>
                    <td className="py-2 text-right text-ink">{i.doacoes}</td>
                    <td className="py-2 text-right text-ink">{i.quantidade > 0 ? i.quantidade.toLocaleString('pt-BR') : '·'}</td>
                    <td className="py-2 text-right text-ink">{i.peso > 0 ? `${kg(i.peso)} kg` : '·'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Card>

        <Card>
          <h4 className="font-body text-[11px] text-muted tracking-[1.5px] uppercase mb-4 m-0">Quem mais contribuiu</h4>
          {dados.ranking.length === 0 ? (
            <p className="font-body text-sm text-muted">Nenhuma pessoa com ficha contribuiu no período.</p>
          ) : (
            <ol data-testid="relatorio-ranking" className="m-0 p-0 list-none flex flex-col gap-3">
              {dados.ranking.map((p, i) => (
                <li key={p.id} className="flex items-center gap-3">
                  <span className="font-display text-[13px] text-muted w-5 shrink-0 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-body text-sm text-ink truncate">{p.nome}</div>
                    <div className="font-body text-xs text-muted">
                      compras R$ {formatBRL(p.compras)} · doações R$ {formatBRL(p.doacoes)}
                    </div>
                  </div>
                  <span className="font-display text-sm text-ink">R$ {formatBRL(p.total)}</span>
                </li>
              ))}
            </ol>
          )}
          <p className="font-body text-[11px] text-muted mt-4 mb-0">Doações sem ficha entram nos totais, mas não no ranking.</p>
        </Card>
      </div>
    </section>
  )
}