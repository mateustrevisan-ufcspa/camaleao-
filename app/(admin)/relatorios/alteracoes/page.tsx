import Link from 'next/link'
import { getTrilha } from '@/lib/store'
import { TABELAS_DA_TRILHA, tabelaDaTrilha } from '@/lib/trilha'
import type { AlteracaoNaTrilha } from '@/types'

export const dynamic = 'force-dynamic'

const quando = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' })

function valor(v: unknown): string {
  if (v === null || v === undefined || v === '') return 'vazio'
  if (typeof v === 'boolean') return v ? 'sim' : 'não'
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) return quando(v)
  if (typeof v === 'object') return JSON.stringify(v)
  return String(v)
}

function Mudancas({ a }: { a: AlteracaoNaTrilha }) {
  if (a.acao === 'exclusao' && !a.depois) return <span>registro apagado</span>
  return (
    <ul className="m-0 p-0 list-none">
      {a.campos.map((c) => (
        <li key={c}>
          <span className="text-muted">{c}:</span> {valor(a.antes?.[c])} → {valor(a.depois?.[c])}
        </li>
      ))}
    </ul>
  )
}

// SEC-04 · Só a coordenação abre: a rota começa com /relatorios (SO_COORDENACAO),
// e a política do banco só devolve a trilha para ela.
export default async function AlteracoesPage({ searchParams }: { searchParams: Promise<{ tabela?: string }> }) {
  const { tabela } = await searchParams
  const escolhida = tabelaDaTrilha(tabela)
  const linhas = await getTrilha(escolhida)

  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1200px]">
      <header className="mb-8">
        <div className="text-xs text-muted font-body tracking-[2px] uppercase mb-2">
          <Link href="/relatorios" className="text-muted no-underline hover:text-ink">Relatórios</Link> · Alterações
        </div>
        <h1 className="font-display text-[28px] md:text-[40px] text-ink font-semibold tracking-[-1px] m-0">Alterações e exclusões</h1>
        <p className="font-body text-muted text-sm mt-2 max-w-[640px]">
          Quem alterou ou excluiu cada registro, quando, o que mudou e por quê. O sistema grava sozinho; ninguém altera esta lista.
        </p>
      </header>

      <nav aria-label="Tipo de registro" className="flex flex-wrap gap-2 mb-6">
        <Link href="/relatorios/alteracoes" className={`chip no-underline ${!escolhida ? 'bg-ink text-bg border-ink' : 'bg-paper text-muted'}`}>Todos</Link>
        {Object.entries(TABELAS_DA_TRILHA).map(([chave, rotulo]) => (
          <Link key={chave} href={`/relatorios/alteracoes?tabela=${chave}`} className={`chip no-underline ${escolhida === chave ? 'bg-ink text-bg border-ink' : 'bg-paper text-muted'}`}>
            {rotulo}
          </Link>
        ))}
      </nav>

      <div className="bg-paper border border-rule rounded-[16px] overflow-x-auto">
        <table data-testid="trilha" className="w-full border-collapse font-body text-[13px] min-w-[860px]">
          <thead>
            <tr className="bg-bg text-left text-[11px] text-muted uppercase tracking-[1px]">
              <th className="px-5 py-3 font-medium">Quando</th>
              <th className="px-5 py-3 font-medium">Quem</th>
              <th className="px-5 py-3 font-medium">O quê</th>
              <th className="px-5 py-3 font-medium">Mudou</th>
              <th className="px-5 py-3 font-medium">Motivo</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((a) => (
              <tr key={a.id} data-testid="alteracao" className="border-t border-rule align-top">
                <td className="px-5 py-3 text-muted whitespace-nowrap">{quando(a.feito_em)}</td>
                <td className="px-5 py-3 text-ink">{a.feitoPor ?? 'sistema'}</td>
                <td className="px-5 py-3 text-ink">
                  {TABELAS_DA_TRILHA[a.tabela] ?? a.tabela} · {a.acao === 'exclusao' ? 'exclusão' : 'alteração'}
                </td>
                <td className="px-5 py-3 text-ink"><Mudancas a={a} /></td>
                <td data-testid="motivo" className="px-5 py-3 text-ink">{a.motivo ?? <span className="text-muted">não informado</span>}</td>
              </tr>
            ))}
            {linhas.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-muted italic">Nenhuma alteração registrada</td></tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="font-body text-xs text-muted mt-3">Mostra as 200 mais recentes. Telefones e e-mails aparecem só como &quot;(alterado)&quot;.</p>
    </div>
  )
}
