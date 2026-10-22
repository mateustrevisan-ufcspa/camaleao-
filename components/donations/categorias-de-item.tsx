'use client'

import { useState, useTransition } from 'react'
import { Check, Plus } from 'lucide-react'
import { criarCategoria, salvarCategoria } from '@/actions/categorias'
import type { CategoriaDeItem } from '@/types'

const TIPOS = [
  { valor: 'donation', rotulo: 'Doação' },
  { valor: 'sale', rotulo: 'Venda' },
  { valor: 'both', rotulo: 'Venda e doação' },
] as const

export function CategoriasDeItem({ categorias }: { categorias: CategoriaDeItem[] }) {
  const [erro, setErro] = useState<string | null>(null)
  const [salvo, setSalvo] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function enviar(e: React.FormEvent<HTMLFormElement>, acao: typeof criarCategoria, limpar: boolean) {
    e.preventDefault()
    setErro(null)
    setSalvo(null)
    const form = e.currentTarget
    const fd = new FormData(form)
    startTransition(async () => {
      const res = await acao(fd)
      if (res?.error) {
        setErro(res.error)
        return
      }
      setSalvo(`Categoria "${((fd.get('name') as string) || '').trim().toLowerCase()}" salva.`)
      if (limpar) form.reset()
    })
  }

  return (
    <div className="flex flex-col gap-6">
      {erro && (
        <div className="rounded-[10px] px-4 py-3 font-body text-[13px]" style={{ backgroundColor: '#F8DCD2', color: '#D87560' }}>
          {erro}
        </div>
      )}
      {salvo && (
        <div className="rounded-[10px] px-4 py-3 font-body text-[13px]" style={{ backgroundColor: '#DCEBE0', color: '#2E5C3E' }}>
          {salvo}
        </div>
      )}

      <form onSubmit={(e) => enviar(e, criarCategoria, true)} className="bg-paper border border-rule rounded-[16px] p-6 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="nova-categoria" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
            Nova categoria
          </label>
          <input id="nova-categoria" name="name" required maxLength={40} placeholder="peruca, batom, livro..." className="input-base" />
        </div>
        <div>
          <label htmlFor="tipo-nova-categoria" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
            Usada em
          </label>
          <select id="tipo-nova-categoria" name="type" defaultValue="donation" className="input-base">
            {TIPOS.map((t) => <option key={t.valor} value={t.valor}>{t.rotulo}</option>)}
          </select>
        </div>
        <button type="submit" disabled={isPending} className="btn-dark disabled:opacity-50">
          <Plus size={14} /> Cadastrar
        </button>
      </form>

      <div className="bg-paper border border-rule rounded-[16px] overflow-hidden">
        <div className="px-6 py-5 border-b border-rule">
          <h3 className="font-display text-xl text-ink font-medium m-0">Categorias</h3>
          <p className="font-body text-[13px] text-muted mt-1 mb-0">
            Renomear não muda as doações já registradas. Categoria desativada sai dos formulários e continua nos registros antigos.
          </p>
        </div>
        <ul data-testid="lista-de-categorias" className="m-0 p-0 list-none">
          {categorias.map((c) => (
            <li key={c.id} className="border-b border-rule last:border-0">
              <form onSubmit={(e) => enviar(e, salvarCategoria, false)} className="px-6 py-3 flex flex-wrap items-center gap-3">
                <input type="hidden" name="id" value={c.id} />
                <input
                  name="name"
                  required
                  maxLength={40}
                  defaultValue={c.name}
                  aria-label={`Nome da categoria ${c.name}`}
                  className="input-base flex-1 min-w-[160px]"
                />
                <select name="type" defaultValue={c.type} aria-label={`Uso da categoria ${c.name}`} className="input-base w-auto">
                  {TIPOS.map((t) => <option key={t.valor} value={t.valor}>{t.rotulo}</option>)}
                </select>
                <label className="flex items-center gap-1.5 font-body text-[13px] text-ink">
                  <input type="checkbox" name="active" defaultChecked={c.active} /> ativa
                </label>
                <button type="submit" disabled={isPending} className="chip bg-bg" aria-label={`Salvar a categoria ${c.name}`}>
                  <Check size={11} /> Salvar
                </button>
              </form>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}