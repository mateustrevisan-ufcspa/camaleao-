// Apoio dos testes de acesso: login pela API com a chave anônima, nunca com a
// chave de serviço (que ignora todas as políticas e faria qualquer teste passar).
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { USUARIA } from '../fumaca/apoio'

const URL_API = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const CHAVE_ANONIMA = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

export const COORDENACAO = USUARIA.email
export const CAIXA = 'caixa@camaleao.local'

export async function entrarNaApi(email: string): Promise<{ api: SupabaseClient; id: string }> {
  if (!URL_API || !CHAVE_ANONIMA) {
    throw new Error('Faltam as variáveis do Supabase local. Rode npm run env:local com o banco ligado.')
  }
  if (!/127\.0\.0\.1|localhost/.test(URL_API)) {
    throw new Error(`Os testes de acesso só rodam no banco local, e o endereço configurado é ${URL_API}.`)
  }
  const api = createClient(URL_API, CHAVE_ANONIMA, { auth: { persistSession: false } })
  const { data, error } = await api.auth.signInWithPassword({ email, password: USUARIA.senha })
  if (error || !data.user) {
    throw new Error(`Login na API falhou para ${email}: ${error?.message}`)
  }
  return { api, id: data.user.id }
}

// Com as políticas, uma leitura proibida costuma voltar vazia em vez de dar erro.
export const recusado = (r: { error: unknown; data: unknown }) =>
  r.error !== null || (Array.isArray(r.data) && r.data.length === 0)
