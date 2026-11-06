import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { paginaInicial } from '@/lib/rotas'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // US-28: cada perfil começa na sua página (voluntária em Doações · Itens).
  const { data: perfil } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()

  redirect(paginaInicial(perfil?.role))
}