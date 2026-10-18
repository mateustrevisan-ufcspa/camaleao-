import Link from 'next/link'
import { GitMerge } from 'lucide-react'
import { getPossiveisRepetidos } from '@/lib/store'
import type { ParRepetido } from '@/types'

export const dynamic = 'force-dynamic'

const dataCurta = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })

// A ficha cadastrada antes fica, por padrão: costuma ser a que tem mais histórico.
// Na tela de mesclagem dá para inverter.
function enderecoDaMesclagem(p: ParRepetido) {
  const aPrimeiro = new Date(p.criada_a) <= new Date(p.criada_b)
  const manter = aPrimeiro ? p.id_a : p.id_b
  const juntar = aPrimeiro ? p.id_b : p.id_a
  return `/clientes/mesclar?manter=${manter}&juntar=${juntar}`
}

function Ficha({ nome, apelido, final, criada }: { nome: string; apelido: string; final: string; criada: string }) {
  return (
    <div>
      <div className="font-body text-sm text-ink font-medium">
        {nome}
        {apelido && <span className="text-muted font-normal"> · {apelido}</span>}
      </div>
      <div className="font-mono text-[11px] text-muted mt-0.5">
        {[final && `tel. final ${final}`, `cadastrada em ${dataCurta(criada)}`].filter(Boolean).join(' · ')}
      </div>
    </div>
  )
}

export default async function PossiveisRepetidosPage() {
  const pares = await getPossiveisRepetidos()

  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1100px]">
      <header className="mb-9">
        <div className="text-xs text-muted font-body tracking-[2px] uppercase mb-2">Clientes · Possíveis repetidos</div>
        <h1 className="font-display text-[28px] md:text-[40px] text-ink font-semibold tracking-[-1px] m-0 leading-[1.1]">
          Possíveis repetidos
        </h1>
        <p className="font-body text-muted text-sm mt-2 max-w-[600px]">
          Pares de fichas com nome parecido ou com o mesmo telefone. Confira antes de mesclar: nome parecido nem sempre é a mesma pessoa.
        </p>
      </header>

      {pares.length === 0 ? (
        <div className="bg-paper border border-rule rounded-[16px] p-10 text-center font-body text-sm text-muted">
          Nenhum par de fichas parecidas.
        </div>
      ) : (
        <ul data-testid="pares-repetidos" className="m-0 p-0 list-none flex flex-col gap-3">
          {pares.map((p) => (
            <li
              key={`${p.id_a}-${p.id_b}`}
              className="bg-paper border border-rule rounded-[16px] p-5 flex flex-wrap items-center justify-between gap-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 min-w-[260px]">
                <Ficha nome={p.nome_a} apelido={p.apelido_a} final={p.telefone_final_a} criada={p.criada_a} />
                <Ficha nome={p.nome_b} apelido={p.apelido_b} final={p.telefone_final_b} criada={p.criada_b} />
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-xs font-body px-2 py-1 rounded-full" style={{ backgroundColor: '#FBE3CA', color: '#C97D3E' }}>
                  {p.motivo}
                </span>
                {p.semelhanca > 0 && (
                  <span className="font-mono text-[11px] text-muted">nomes {Math.round(p.semelhanca * 100)}% parecidos</span>
                )}
                <Link href={enderecoDaMesclagem(p)} className="chip bg-bg no-underline">
                  <GitMerge size={11} /> Comparar e mesclar
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
