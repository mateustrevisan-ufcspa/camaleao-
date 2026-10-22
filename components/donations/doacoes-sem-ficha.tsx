'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Link2 } from 'lucide-react'
import { ClientPicker } from '@/components/clients/client-picker'
import { ligarDoacao } from '@/actions/vinculo'
import type { DoacaoSemFicha, PessoaEncontrada } from '@/types'

interface DbTag { id: string; name: string; color: string; bg_color: string }

const TIPO = { dinheiro: 'Dinheiro', itens: 'Itens' } as const

export function DoacoesSemFicha({ doacoes, tags }: { doacoes: DoacaoSemFicha[]; tags: DbTag[] }) {
  const router = useRouter()
  // Uma linha aberta por vez, com a pessoa escolhida para ela.
  const [aberta, setAberta] = useState<{ id: string; pessoa: PessoaEncontrada | null } | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function ligar(d: DoacaoSemFicha, pessoa: PessoaEncontrada) {
    setErro(null)
    startTransition(async () => {
      const res = await ligarDoacao(d.tipo, d.id, pessoa.id)
      if ('error' in res) {
        setErro(res.error)
        return
      }
      setAviso(`Doação de ${d.nome} ligada à ficha de ${pessoa.name}.`)
      setAberta(null)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {aviso && (
        <div className="rounded-[10px] px-4 py-3 font-body text-[13px]" style={{ backgroundColor: '#DCEBE0', color: '#2E5C3E' }}>
          {aviso}
        </div>
      )}
      {erro && (
        <div className="rounded-[10px] px-4 py-3 font-body text-[13px]" style={{ backgroundColor: '#F8DCD2', color: '#D87560' }}>
          {erro}
        </div>
      )}

      {doacoes.length === 0 ? (
        <div className="bg-paper border border-rule rounded-[16px] p-10 text-center font-body text-sm text-muted">
          Todas as doações estão ligadas a uma ficha.
        </div>
      ) : (
        <ul data-testid="doacoes-sem-ficha" className="m-0 p-0 list-none bg-paper border border-rule rounded-[16px] overflow-hidden">
          {doacoes.map((d) => {
            const estaAberta = aberta?.id === d.id
            return (
              <li key={`${d.tipo}-${d.id}`} className="px-6 py-4 border-b border-rule last:border-0">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-body text-sm text-ink font-medium">{d.nome}</div>
                    <div className="font-body text-xs text-muted mt-0.5">
                      {TIPO[d.tipo]} · {d.descricao} ·{' '}
                      {new Date(d.data).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                    </div>
                  </div>
                  {!estaAberta && (
                    <button type="button" onClick={() => setAberta({ id: d.id, pessoa: null })} className="chip bg-bg">
                      <Link2 size={11} /> Ligar a uma ficha
                    </button>
                  )}
                </div>
                {estaAberta && (
                  <div className="mt-4 flex flex-col gap-3">
                    <ClientPicker
                      tags={tags}
                      allowAnonymous={false}
                      selected={aberta.pessoa}
                      onSelect={(p) => setAberta({ id: d.id, pessoa: p })}
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={!aberta.pessoa || isPending}
                        onClick={() => aberta.pessoa && ligar(d, aberta.pessoa)}
                        className="btn-dark disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isPending ? 'Ligando...' : aberta.pessoa ? `Ligar a ${aberta.pessoa.name}` : 'Escolha a pessoa'}
                      </button>
                      <button type="button" onClick={() => setAberta(null)} className="chip bg-bg">
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
