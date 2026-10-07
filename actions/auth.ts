'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email:    (formData.get('email')    as string).trim(),
    password: (formData.get('password') as string),
  })

  if (error) {
    return { error: 'E-mail ou senha incorretos.' }
  }

  // A senha está certa. Falta conferir se a pessoa tem perfil e está ativa.
  const { data: perfil } = await supabase
    .from('users')
    .select('active')
    .eq('id', data.user.id)
    .maybeSingle()

  if (perfil?.active !== true) {
    await supabase.auth.signOut()
    return { error: 'Seu acesso está desativado. Fale com a coordenação do Instituto.' }
  }

  redirect('/brecho')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
