'use client'

import { useState, useTransition } from 'react'
import { trocarSenha } from '@/actions/auth'

export default function TrocarSenhaPage() {
  const [erro, setErro] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setErro(null)
    startTransition(async () => {
      const r = await trocarSenha(fd)
      if (r?.error) setErro(r.error)
    })
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-bg">
      <form onSubmit={enviar} className="bg-paper border border-rule rounded-[16px] p-8 w-full max-w-[400px] flex flex-col gap-4 font-body">
        <h1 className="font-display text-[26px] text-ink m-0">Crie a sua senha</h1>
        <p className="text-sm text-muted m-0">Você entrou com uma senha provisória. Escolha uma senha sua, com pelo menos 8 caracteres.</p>
        <label className="text-[11px] text-muted tracking-[1px] uppercase">
          Nova senha
          <input name="nova" type="password" autoComplete="new-password" required minLength={8} className="input-base mt-1.5" />
        </label>
        <label className="text-[11px] text-muted tracking-[1px] uppercase">
          Repita a nova senha
          <input name="repetida" type="password" autoComplete="new-password" required minLength={8} className="input-base mt-1.5" />
        </label>
        {erro && <div role="alert" className="rounded-[10px] px-4 py-3 text-[13px]" style={{ backgroundColor: '#F8DCD2', color: '#D87560' }}>{erro}</div>}
        <button type="submit" disabled={isPending} className="bg-emerald text-white border-none py-3 rounded-[10px] text-sm font-medium disabled:opacity-50">
          {isPending ? 'Salvando...' : 'Salvar e entrar'}
        </button>
      </form>
    </main>
  )
}