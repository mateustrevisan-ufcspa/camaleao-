'use client'

import { useMemo, useState, useTransition } from 'react'
import { alterarCaptador, cadastrarCaptador, definirPercentualDeComissao, desmarcarComissao, desmarcarComissaoDaVenda, marcarComissao, marcarComissaoDaVenda } from '@/actions/comissoes'
import { formatBRL } from '@/lib/utils'
import type { AlteracaoDoPercentualDeComissao, Captador, DoacaoComComissao, MarcacaoDeComissao, VendaComComissao } from '@/types'

const dia = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: '2-digit', month: '2-digit' })
const pct = (p: number) => `${p.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}%`
const reais = (v: number) => `R$ ${formatBRL(Math.round(v * 100) / 100)}`

// US-38 · Doação e venda na mesma forma, para somar e mostrar juntas.
type Linha = {
  chave: string
  tipo: 'doacao' | 'venda'
  id: string
  data: string
  nome: string
  amount: number
  net_amount: number | null
  marcacao: MarcacaoDeComissao
  captador_id: string | null
  captador_nome: string | null
  percentual: number | null
  comissao: number | null
}

const daDoacao = (d: DoacaoComComissao): Linha => ({ ...d, chave: `doacao:${d.id}`, tipo: 'doacao', data: d.donated_at, nome: d.donor_name })
const daVenda = (v: VendaComComissao): Linha => ({ ...v, chave: `venda:${v.id}`, tipo: 'venda', data: v.sold_at, nome: v.customer_name })

function textoDaComissao(l: Linha) {
  if (l.marcacao === 'a_marcar') return 'a marcar'
  if (l.marcacao === 'sem') return 'sem comissão'
  if (l.comissao === null) return 'a calcular (taxa não cadastrada)'
  return `${reais(l.comissao)} (${pct(l.percentual ?? 0)})`
}

function TabelaDeComissoes({ titulo, testid, vazio, linhas, captadores, marcadas, alternar, rodar, isPending }: {
  titulo: string; testid: string; vazio: string; linhas: Linha[]; captadores: Captador[]
  marcadas: Set<string>; alternar: (chave: string) => void
  rodar: (acao: () => Promise<{ error: string } | void>) => void; isPending: boolean
}) {
  return (
    <div className="bg-paper border border-rule rounded-[16px] overflow-x-auto">
      <h3 className="font-display text-lg text-ink m-0 px-4 pt-4">{titulo}</h3>
      <table data-testid={testid} className="w-full border-collapse text-[13px] min-w-[960px] mt-2">
        <thead>
          <tr className="bg-bg text-left text-[11px] text-muted uppercase tracking-[1px]">
            <th className="px-4 py-3">Somar</th><th className="px-4 py-3">Data</th><th className="px-4 py-3">{linhas[0]?.tipo === 'venda' ? 'Cliente' : 'Doador'}</th>
            <th className="px-4 py-3 text-right">Valor</th><th className="px-4 py-3 text-right">Líquido</th>
            <th className="px-4 py-3">Quem captou</th><th className="px-4 py-3">Comissão</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((l) => {
            const marcar = l.tipo === 'venda' ? marcarComissaoDaVenda : marcarComissao
            const desmarcar = l.tipo === 'venda' ? desmarcarComissaoDaVenda : desmarcarComissao
            const paraSomar = l.tipo === 'venda' ? `da venda para ${l.nome}` : `da doação de ${l.nome}`
            const paraCaptou = l.tipo === 'venda' ? `da venda para ${l.nome}` : `a doação de ${l.nome}`
            return (
              <tr key={l.chave} data-testid={l.tipo === 'venda' ? 'venda-com-comissao' : 'doacao-com-comissao'} className="border-t border-rule">
                <td className="px-4 py-2">
                  <input type="checkbox" aria-label={`Somar a comissão ${paraSomar}`} checked={marcadas.has(l.chave)} disabled={l.comissao === null} onChange={() => alternar(l.chave)} />
                </td>
                <td className="px-4 py-2 text-muted">{dia(l.data)}</td>
                <td className="px-4 py-2 text-ink">{l.nome}</td>
                <td className="px-4 py-2 text-right text-ink">{reais(l.amount)}</td>
                <td className="px-4 py-2 text-right text-ink">{l.net_amount === null ? 'taxa não cadastrada' : reais(l.net_amount)}</td>
                <td className="px-4 py-2">
                  <form className="flex gap-2 items-center" onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); rodar(() => marcar(l.id, fd)) }}>
                    <select name="captador_id" aria-label={`Quem captou ${paraCaptou}`} defaultValue={l.marcacao === 'sem' ? 'sem' : l.captador_id ?? ''} className="input-base py-1">
                      <option value="" disabled>Escolha</option>
                      <option value="sem">Sem comissão</option>
                      {captadores.filter((c) => c.ativo || c.id === l.captador_id).map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
                    </select>
                    <button type="submit" disabled={isPending} className="chip bg-bg">Salvar</button>
                    {l.marcacao !== 'a_marcar' && (
                      <button type="button" disabled={isPending} onClick={() => rodar(() => desmarcar(l.id))} className="chip bg-bg">Desmarcar</button>
                    )}
                  </form>
                </td>
                <td data-testid={l.tipo === 'venda' ? 'comissao-da-venda' : 'comissao-da-doacao'} className="px-4 py-2 text-ink">{textoDaComissao(l)}</td>
              </tr>
            )
          })}
          {linhas.length === 0 && (
            <tr><td colSpan={7} className="px-4 py-8 text-center text-muted italic">{vazio}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
export function Comissoes({
  doacoes,
  vendas,
  captadores,
  percentuais,
}: {
  doacoes: DoacaoComComissao[]
  vendas: VendaComComissao[]
  captadores: Captador[]
  percentuais: AlteracaoDoPercentualDeComissao[]
}) {
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const [marcadas, setMarcadas] = useState<Set<string>>(new Set())
  const emVigor = percentuais[0] ?? null

  const linhasDasDoacoes = useMemo(() => doacoes.map(daDoacao), [doacoes])
  const linhasDasVendas = useMemo(() => vendas.map(daVenda), [vendas])
  const linhas = useMemo(() => [...linhasDasDoacoes, ...linhasDasVendas], [linhasDasDoacoes, linhasDasVendas])
  const alternar = (chave: string) => setMarcadas((m) => { const n = new Set(m); if (n.has(chave)) n.delete(chave); else n.add(chave); return n })

  const totalDoMes = useMemo(() => linhas.reduce((s, l) => s + (l.comissao ?? 0), 0), [linhas])
  const aMarcar = linhas.filter((l) => l.marcacao === 'a_marcar').length
  const porCaptador = useMemo(() => {
    const m = new Map<string, number>()
    for (const l of linhas) if (l.captador_nome && l.comissao !== null) m.set(l.captador_nome, (m.get(l.captador_nome) ?? 0) + l.comissao)
    return [...m].sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'))
  }, [linhas])
  const totalMarcadas = linhas.filter((l) => marcadas.has(l.chave)).reduce((s, l) => s + (l.comissao ?? 0), 0)

  function rodar(acao: () => Promise<{ error: string } | void>) {
    setErro(null)
    startTransition(async () => {
      const r = await acao()
      if (r?.error) setErro(r.error)
    })
  }

  return (
    <div className="flex flex-col gap-6 font-body">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-paper border border-rule rounded-[16px] p-6">
          <div className="text-[13px] text-muted mb-2">Comissão do mês</div>
          <div data-testid="comissao-do-mes" className="font-display text-[30px] font-bold text-ink">{reais(totalDoMes)}</div>
          <div data-testid="comissao-a-marcar" className="text-[12px] text-muted mt-1">
            {aMarcar === 0 ? 'Todos os lançamentos marcados' : `${aMarcar} ${aMarcar === 1 ? 'lançamento' : 'lançamentos'} a marcar`}
          </div>
        </div>
        <div className="bg-paper border border-rule rounded-[16px] p-6">
          <div className="text-[13px] text-muted mb-2">Por quem captou</div>
          {porCaptador.length === 0 ? <div className="text-sm text-muted">Nenhuma comissão no mês</div> : (
            <ul data-testid="comissao-por-captador" className="m-0 p-0 list-none text-sm text-ink">
              {porCaptador.map(([nome, valor]) => <li key={nome}>{nome}: {reais(valor)}</li>)}
            </ul>
          )}
        </div>
        <div className="rounded-[16px] p-6" style={{ backgroundColor: '#DCEBE0' }}>
          <div className="text-[13px] text-muted mb-2">Marcadas para somar ({marcadas.size})</div>
          <div data-testid="comissao-das-marcadas" className="font-display text-[30px] font-bold text-emerald">{reais(totalMarcadas)}</div>
        </div>
        <div className="bg-paper border border-rule rounded-[16px] p-6">
          <div className="text-[13px] text-muted mb-2">Percentual sobre o líquido</div>
          <div data-testid="percentual-em-vigor" className="font-display text-[30px] font-bold text-ink">{emVigor ? pct(emVigor.percentual) : 'não definido'}</div>
          {emVigor && (
            <div className="text-[12px] text-muted mt-1">
              desde {dia(emVigor.definidoEm)}{emVigor.definidoPor ? `, por ${emVigor.definidoPor}` : ''}
            </div>
          )}
          <form
            className="flex gap-2 mt-3"
            onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); rodar(() => definirPercentualDeComissao(fd)) }}
          >
            <input name="percentual" aria-label="Novo percentual da comissão" inputMode="decimal" placeholder="25" className="input-base py-1 w-[80px]" />
            <button type="submit" disabled={isPending} className="chip bg-bg">Alterar</button>
          </form>
        </div>
      </div>

      <p className="text-[12px] text-muted m-0">
        Alterar o percentual vale para as próximas marcações. Para aplicar o novo a uma doação ou venda já marcada, desmarque e marque de novo.
      </p>

      {erro && <div role="alert" className="rounded-[10px] px-4 py-3 text-[13px]" style={{ backgroundColor: '#F8DCD2', color: '#D87560' }}>{erro}</div>}

      <TabelaDeComissoes titulo="Doações em dinheiro" testid="doacoes-com-comissao" vazio="Nenhuma doação em dinheiro no mês"
        linhas={linhasDasDoacoes} captadores={captadores} marcadas={marcadas} alternar={alternar} rodar={rodar} isPending={isPending} />
      <TabelaDeComissoes titulo="Vendas do brechó" testid="vendas-com-comissao" vazio="Nenhuma venda no mês"
        linhas={linhasDasVendas} captadores={captadores} marcadas={marcadas} alternar={alternar} rodar={rodar} isPending={isPending} />

      <section className="bg-paper border border-rule rounded-[16px] p-6">
        <h3 className="font-display text-lg text-ink m-0 mb-3">Quem capta</h3>
        <ul className="m-0 p-0 list-none text-sm mb-4">
          {captadores.map((c) => (
            <li key={c.id} data-testid="captador" className="flex items-center justify-between py-1.5 border-b border-rule last:border-0">
              <span className={c.ativo ? 'text-ink' : 'text-muted'}>{c.nome}{!c.ativo && ' (desativado)'}</span>
              <button type="button" disabled={isPending} onClick={() => rodar(() => alterarCaptador(c.id, !c.ativo))} className="chip bg-bg">
                {c.ativo ? 'Desativar' : 'Reativar'}
              </button>
            </li>
          ))}
        </ul>
        <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const form = e.currentTarget; const fd = new FormData(form); rodar(async () => { const r = await cadastrarCaptador(fd); if (!r) form.reset(); return r }) }}>
          <input name="nome" aria-label="Nome de quem capta" placeholder="Nome" maxLength={80} className="input-base" />
          <button type="submit" disabled={isPending} className="chip bg-ink text-bg border-ink">Cadastrar</button>
        </form>
      </section>
    </div>
  )
}
