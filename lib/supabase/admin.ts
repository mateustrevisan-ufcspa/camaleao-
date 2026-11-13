// US-24a · Cliente com a chave secreta do Supabase. Passa por cima de todas as
// políticas do banco: use só em Server Actions, depois de conferir que quem
// pediu é a coordenação (souCoordenacao). Nunca importe em componente do navegador.
import { createClient } from '@supabase/supabase-js'

export function clienteComChaveSecreta() {
  if (typeof window !== 'undefined') throw new Error('A chave secreta não pode ser usada no navegador.')
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const chave = process.env.CHAVE_SECRETA_DO_SUPABASE
  if (!url || !chave) {
    throw new Error('Falta CHAVE_SECRETA_DO_SUPABASE no servidor. No local, rode npm run env:local -- --force.')
  }
  return createClient(url, chave, { auth: { persistSession: false, autoRefreshToken: false } })
}