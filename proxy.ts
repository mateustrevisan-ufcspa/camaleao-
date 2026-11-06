import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { SO_CAIXA_OU_COORDENACAO, SO_COORDENACAO, paginaInicial } from '@/lib/rotas'

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2])
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  // Sem sessão: só o login.
  if (!user) {
    if (pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return response
  }

  // Perfil de quem está logado. A política de users deixa cada pessoa ler a própria linha.
  const { data: perfil } = await supabase
    .from('users')
    .select('role, active')
    .eq('id', user.id)
    .maybeSingle()

  // Sem perfil ou desativada: trata como sem sessão. O banco já não devolve nada para ela.
  if (perfil?.active !== true) {
    if (pathname !== '/login') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    return response
  }

  // Logada e ativa não precisa ver o login.
  if (pathname === '/login') {
    return NextResponse.redirect(new URL(paginaInicial(perfil?.role), request.url))
  }

  // Tela da coordenação aberta pelo balcão: volta para a página inicial do perfil com um aviso.
  if (perfil?.role !== 'admin' && SO_COORDENACAO.some((rota) => pathname.startsWith(rota))) {
    return NextResponse.redirect(new URL(`${paginaInicial(perfil?.role)}?aviso=restrito`, request.url))
  }

  // US-28: a voluntária não abre o brechó nem as doações em dinheiro; vai para as doações de item.
  if (perfil?.role === 'volunteer' && SO_CAIXA_OU_COORDENACAO.some((rota) => pathname.startsWith(rota))) {
    return NextResponse.redirect(new URL(paginaInicial(perfil.role), request.url))

  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon|public|.*\\.(?:png|jpg|ico|webp|svg)).*)'],
}
