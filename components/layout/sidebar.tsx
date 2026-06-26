'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'
import { ShoppingBag, TrendingUp, LogOut, X, Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { logout } from '@/actions/auth'

const topNav = [
  { href: '/brecho', label: 'Brechó', icon: ShoppingBag },
  { href: '/doacoes', label: 'Doações', icon: Heart },
  { href: '/relatorios', label: 'Relatórios', icon: TrendingUp },
]

const brechoSub = [
  { href: '/brecho', label: 'Visão geral' },
  { href: '/brecho/nova-venda', label: 'Nova venda' },
  { href: '/brecho/compradoras', label: 'Compradoras' },
  { href: '/brecho/financeiro', label: 'Financeiro' },
]

const doacoesSub = [
  { href: '/doacoes/dinheiro', label: 'Dinheiro' },
  { href: '/doacoes/itens', label: 'Itens' },
  { href: '/doacoes/tampinhas', label: 'Tampinhas' },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

interface UserInfo {
  name: string
  role: string
  initial: string
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const pathname = usePathname()
  const inBrecho = pathname.startsWith('/brecho')
  const inDoacoes = pathname.startsWith('/doacoes')
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [isLoggingOut, startLogout] = useTransition()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return
      const { data: profile } = await supabase
        .from('users')
        .select('name, role')
        .eq('id', data.user.id)
        .maybeSingle()

      const name = profile?.name ?? data.user.email?.split('@')[0] ?? 'Usuário'
      const role = profile?.role === 'admin' ? 'administradora' : profile?.role === 'volunteer' ? 'voluntária' : 'caixa'
      setUserInfo({ name, role, initial: name[0].toUpperCase() })
    })
  }, [])

  function handleLogout() {
    startLogout(async () => { await logout() })
  }

  return (
    <aside
      className={`
        fixed left-0 top-0 h-screen z-50 transition-transform duration-200
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:sticky md:translate-x-0 md:z-auto
        w-[240px] bg-paper border-r border-rule px-5 py-8 flex flex-col shrink-0
      `}
    >
      {/* Fechar (mobile) */}
      <button
        onClick={onClose}
        className="md:hidden absolute top-4 right-4 text-muted hover:text-ink transition-colors"
      >
        <X size={18} />
      </button>

      {/* Logo */}
      <div className="mb-12 flex justify-center">
        <Image
          src="/logo-camaleao.png"
          alt="Instituto Camaleão"
          width={120}
          height={45}
          className="object-contain"
          priority
        />
      </div>

      {/* Seção Instituto */}
      <nav className="flex-1">
        <div className="text-[10px] font-body text-muted tracking-[2px] uppercase mb-2 px-3">
          Instituto
        </div>
        <div className="flex flex-col gap-0.5">
          {topNav.map(({ href, label, icon: Icon }) => {
            const active =
              href === '/brecho'
                ? pathname.startsWith('/brecho')
                : href === '/doacoes'
                ? pathname.startsWith('/doacoes')
                : pathname.startsWith(href)
            const sub = href === '/brecho' && inBrecho
              ? brechoSub
              : href === '/doacoes' && inDoacoes
              ? doacoesSub
              : null
            return (
              <div key={href}>
                <Link
                  href={href === '/doacoes' ? '/doacoes/dinheiro' : href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-[10px] font-body text-sm no-underline transition-colors ${
                    active
                      ? 'bg-bg text-ink font-medium'
                      : 'text-muted hover:text-ink hover:bg-bg/60'
                  }`}
                >
                  <Icon size={17} strokeWidth={active ? 2 : 1.5} />
                  {label}
                </Link>

                {sub && (
                  <div className="ml-8 mt-0.5 mb-1 flex flex-col gap-0.5 border-l border-rule pl-3">
                    {sub.map(({ href: subHref, label: subLabel }) => {
                      const subActive =
                        subHref === '/brecho'
                          ? pathname === '/brecho'
                          : pathname.startsWith(subHref)
                      return (
                        <Link
                          key={subHref}
                          href={subHref}
                          className={`text-[13px] font-body py-1.5 px-2 rounded-[6px] no-underline transition-colors ${
                            subActive
                              ? 'text-ink font-medium bg-bg'
                              : 'text-muted hover:text-ink'
                          }`}
                        >
                          {subLabel}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </nav>

      {/* Usuário */}
      <div className="border-t border-rule pt-4 flex items-center gap-2.5 px-2">
        <div className="w-8 h-8 rounded-full bg-accent-soft text-accent-deep flex items-center justify-center font-display text-sm font-semibold shrink-0">
          {userInfo?.initial ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-body text-ink font-medium truncate">{userInfo?.name ?? '—'}</div>
          <div className="text-[11px] font-body text-muted">{userInfo?.role ?? ''}</div>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          title="Sair"
          className="text-muted hover:text-ink transition-colors disabled:opacity-50"
        >
          <LogOut size={14} />
        </button>
      </div>
    </aside>
  )
}
