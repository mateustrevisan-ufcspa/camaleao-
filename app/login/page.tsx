'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { Eye, EyeOff } from 'lucide-react'
import { login } from '@/actions/auth'

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const fd = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await login(fd)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#FAF7F2' }}
    >
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Image
            src="/logo-camaleao.png"
            alt="Instituto Camaleão"
            width={140}
            height={52}
            className="object-contain"
            priority
          />
        </div>

        {/* Card */}
        <div className="bg-paper border border-rule rounded-[20px] px-8 py-9 shadow-sm">
          <h1 className="font-display text-[26px] text-ink font-semibold tracking-[-0.5px] mb-1.5">
            Bem-vindo de volta
          </h1>
          <p className="font-body text-muted text-sm mb-8">
            Acesse o painel do Instituto Camaleão.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                E-mail
              </label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="seu@email.com"
                className="input-base"
              />
            </div>

            <div>
              <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
                Senha
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input-base pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-[10px] px-4 py-3 font-body text-[13px]" style={{ backgroundColor: '#F8DCD2', color: '#D87560' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="w-full btn-primary mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        </div>

        <p className="text-center font-body text-[12px] text-muted mt-6">
          Instituto Camaleão · Sistema interno
        </p>
      </div>
    </div>
  )
}
