'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { importarPessoas, lerPlanilha, prepararImportacao } from '@/actions/importacao'
import { ROTULOS, type Campo, type Mapa } from '@/lib/importacao'
import type { LinhaDaPrevia } from '@/types'

const CAMPOS: Campo[] = ['nome', 'telefone', 'email', 'aniversario']
const SITUACAO: Record<LinhaDaPrevia['situacao'], string> = {
  nova: 'Nova',
  repetida: 'Repetida na planilha',
  cadastrada: 'Já tem ficha',
  invalida: 'Sem nome',
}

export function ImportarPessoas() {
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [cabecalho, setCabecalho] = useState<string[] | null>(null)
  const [amostra, setAmostra] = useState<string[][]>([])
  const [total, setTotal] = useState(0)
  const [mapa, setMapa] = useState<Mapa | null>(null)
  const [previa, setPrevia] = useState<LinhaDaPrevia[] | null>(null)
  const [marcadas, setMarcadas] = useState<Set<number>>(new Set())
  const [resultado, setResultado] = useState<{ importadas: number; descartadas: number } | null>(null)

  function comArquivo(extra?: Record<string, string>) {
    const fd = new FormData()
    if (arquivo) fd.set('arquivo', arquivo)
    for (const [k, v] of Object.entries(extra ?? {})) fd.set(k, v)
    return fd
  }

  function ler() {
    setErro(null)
    setPrevia(null)
    setResultado(null)
    startTransition(async () => {
      const r = await lerPlanilha(comArquivo())
      if ('error' in r) return setErro(r.error)
      setCabecalho(r.cabecalho)
      setAmostra(r.amostra)
      setTotal(r.total)
      setMapa(r.mapa)
    })
  }

  function trocarColuna(campo: Campo, valor: string) {
    if (!mapa) return
    setMapa({ ...mapa, [campo]: valor === '' ? null : Number(valor) })
    // Mudou a coluna: a prévia antiga não vale mais.
    setPrevia(null)
  }

  function preparar() {
    if (!mapa) return
    setErro(null)
    const colunas = Object.fromEntries(CAMPOS.map((c) => [`coluna_${c}`, mapa[c] === null ? '' : String(mapa[c])]))
    startTransition(async () => {
      const r = await prepararImportacao(comArquivo(colunas))
      if ('error' in r) return setErro(r.error)
      setPrevia(r.linhas)
      setMarcadas(new Set(r.linhas.filter((l) => l.situacao === 'nova').map((l) => l.linha)))
    })
  }

  function importar() {
    if (!previa || !arquivo) return
    setErro(null)
    const pessoas = previa
      .filter((l) => marcadas.has(l.linha) && l.nome)
      .map((l) => ({ nome: l.nome as string, telefone: l.telefone, email: l.email, aniversario: l.aniversario }))
    startTransition(async () => {
      const r = await importarPessoas({ arquivo: arquivo.name, total: previa.length, pessoas })
      if ('error' in r) return setErro(r.error)
      setResultado(r)
      setPrevia(null)
      setCabecalho(null)
      setMapa(null)
      setArquivo(null)
    })
  }

  function alternar(linha: number) {
    setMarcadas((m) => {
      const nova = new Set(m)
      if (nova.has(linha)) nova.delete(linha)
      else nova.add(linha)
      return nova
    })
  }

  return (
    <div className="flex flex-col gap-6 font-body">
      {resultado && (
        <div data-testid="resultado-da-importacao" className="rounded-[12px] px-5 py-4 text-sm" style={{ backgroundColor: '#DCEBE0', color: '#2E5C3E' }}>
          {resultado.importadas} {resultado.importadas === 1 ? 'pessoa importada' : 'pessoas importadas'} e{' '}
          {resultado.descartadas} {resultado.descartadas === 1 ? 'descartada' : 'descartadas'}.{' '}
          <Link href="/clientes" className="text-emerald">Ver as fichas</Link>
        </div>
      )}

      <section className="bg-paper border border-rule rounded-[16px] p-6">
        <h2 className="font-display text-xl text-ink m-0 mb-2">1. Planilha</h2>
        <p className="text-sm text-muted mt-0">
          Arquivo .xlsx de até 900 KB e 2.000 linhas; a primeira linha precisa ter os títulos das colunas.{' '}
          <a href="/clientes/importar/modelo" download className="text-accent-deep">Baixar a planilha modelo</a>.
        </p>
        <div className="flex flex-wrap gap-3 items-center">
          <input
            aria-label="Planilha"
            type="file"
            accept=".xlsx"
            onChange={(e) => {
              setArquivo(e.target.files?.[0] ?? null)
              setCabecalho(null)
              setMapa(null)
              setPrevia(null)
            }}
          />
          <button type="button" onClick={ler} disabled={!arquivo || isPending} className="chip bg-ink text-bg border-ink disabled:opacity-50">
            Ler planilha
          </button>
        </div>
      </section>

      {cabecalho && mapa && (
        <section className="bg-paper border border-rule rounded-[16px] p-6">
          <h2 className="font-display text-xl text-ink m-0 mb-2">2. Colunas</h2>
          <p className="text-sm text-muted mt-0">{total} linhas. Confira qual coluna é cada informação; só o nome é obrigatório.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {CAMPOS.map((c) => (
              <div key={c}>
                <label htmlFor={`coluna-${c}`} className="block text-[11px] text-muted tracking-[1px] uppercase mb-1.5">{ROTULOS[c]}</label>
                <select
                  id={`coluna-${c}`}
                  value={mapa[c] === null ? '' : String(mapa[c])}
                  onChange={(e) => trocarColuna(c, e.target.value)}
                  className="input-base"
                >
                  <option value="">Não tem</option>
                  {cabecalho.map((titulo, i) => <option key={i} value={i}>{titulo || `Coluna ${i + 1}`}</option>)}
                </select>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse mb-4">
              <thead>
                <tr className="text-left text-[11px] text-muted uppercase tracking-[1px]">
                  {CAMPOS.map((c) => <th key={c} className="py-1.5 pr-3">{ROTULOS[c]}</th>)}
                </tr>
              </thead>
              <tbody>
                {amostra.map((l, i) => (
                  <tr key={i} className="border-t border-rule">
                    {CAMPOS.map((c) => {
                      const coluna = mapa[c]
                      return <td key={c} className="py-1.5 pr-3 text-ink">{coluna === null ? '' : l[coluna]}</td>
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={preparar} disabled={mapa.nome === null || isPending} className="chip bg-ink text-bg border-ink disabled:opacity-50">
            Conferir as linhas
          </button>
        </section>
      )}

      {previa && (
        <section className="bg-paper border border-rule rounded-[16px] p-6">
          <h2 className="font-display text-xl text-ink m-0 mb-2">3. Conferir e importar</h2>
          <p className="text-sm text-muted mt-0">{marcadas.size} de {previa.length} marcadas. Quem já tem ficha não entra.</p>
          <div className="overflow-x-auto">
            <table data-testid="previa" className="w-full text-[13px] border-collapse min-w-[760px]">
              <thead>
                <tr className="text-left text-[11px] text-muted uppercase tracking-[1px]">
                  <th className="py-2 pr-3">Entra</th>
                  <th className="py-2 pr-3">Linha</th>
                  <th className="py-2 pr-3">Nome</th>
                  <th className="py-2 pr-3">Telefone</th>
                  <th className="py-2 pr-3">E-mail</th>
                  <th className="py-2 pr-3">Aniversário</th>
                  <th className="py-2 pr-3">Situação</th>
                </tr>
              </thead>
              <tbody>
                {previa.map((l) => (
                  <tr key={l.linha} data-testid="linha-da-previa" className="border-t border-rule align-top">
                    <td className="py-2 pr-3">
                      <input
                        type="checkbox"
                        aria-label={`Importar a linha ${l.linha}`}
                        checked={marcadas.has(l.linha)}
                        disabled={l.situacao === 'cadastrada' || l.situacao === 'invalida'}
                        onChange={() => alternar(l.linha)}
                      />
                    </td>
                    <td className="py-2 pr-3 text-muted">{l.linha}</td>
                    <td className="py-2 pr-3 text-ink">{l.nome ?? '·'}</td>
                    <td className="py-2 pr-3 text-ink">{l.telefone ?? ''}</td>
                    <td className="py-2 pr-3 text-ink">{l.email ?? ''}</td>
                    <td className="py-2 pr-3 text-ink">{l.aniversario ?? ''}</td>
                    <td className="py-2 pr-3 text-ink">
                      <div data-testid="situacao">{SITUACAO[l.situacao]}{l.referencia ? ` (${l.referencia})` : ''}</div>
                      {l.avisos.filter((a) => a !== 'sem nome').map((a) => <div key={a} className="text-xs text-muted">{a}</div>)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={importar}
            disabled={marcadas.size === 0 || isPending}
            className="chip bg-emerald text-white border-emerald mt-4 disabled:opacity-50"
          >
            {isPending ? 'Importando...' : `Importar ${marcadas.size} ${marcadas.size === 1 ? 'pessoa' : 'pessoas'}`}
          </button>
        </section>
      )}

      {erro && (
        <div role="alert" className="rounded-[10px] px-4 py-3 text-[13px]" style={{ backgroundColor: '#F8DCD2', color: '#D87560' }}>
          {erro}
        </div>
      )}
    </div>
  )
}
