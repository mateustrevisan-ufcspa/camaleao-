'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { paginaInicial } from '@/lib/rotas'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email:    (formData.get('email')    as string).trim(),
    password: (formData.get('password') as string),
  })

  if (error) {
    // US-24a: conta desativada também é bloqueada no Auth.
    if (error.code === 'user_banned') return { error: 'Seu acesso está desativado. Fale com a coordenação do Instituto.' }
    return { error: 'E-mail ou senha incorretos.' }
  }

  // A senha está certa. Falta conferir se a pessoa tem perfil e está ativa.
  const { data: perfil } = await supabase
    .from('users')
    .select('role, active, trocar_senha')
    .eq('id', data.user.id)
    .maybeSingle()

  if (perfil?.active !== true) {
    await supabase.auth.signOut()
    return { error: 'Seu acesso está desativado. Fale com a coordenação do Instituto.' }
  }

  // US-24a: senha provisória troca antes de qualquer tela.
  if (perfil.trocar_senha) redirect('/trocar-senha')
  // US-28: cada perfil começa na sua página (voluntária em Doações · Itens).
  redirect(paginaInicial(perfil.role))
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

// US-24a · A pessoa troca a senha provisória pela dela.
export async function trocarSenha(formData: FormData): Promise<{ error: string } | void> {
  const nova = (formData.get('nova') as string) || ''
  const repetida = (formData.get('repetida') as string) || ''
  if (nova.length < 8) return { error: 'A senha precisa ter pelo menos 8 caracteres.' }
  if (nova !== repetida) return { error: 'As duas senhas estão diferentes.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: nova })
  if (error) return { error: 'Não foi possível trocar a senha. Escolha outra, diferente da provisória.' }
  await supabase.rpc('confirmar_troca_de_senha')

  const { data: { user } } = await supabase.auth.getUser()
  const { data: perfil } = await supabase.from('users').select('role').eq('id', user?.id ?? '').maybeSingle()
  redirect(paginaInicial(perfil?.role))
}