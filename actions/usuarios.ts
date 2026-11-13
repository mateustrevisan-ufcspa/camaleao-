'use server'

import { randomBytes } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { clienteComChaveSecreta } from '@/lib/supabase/admin'
import { getMeuId, souCoordenacao } from '@/lib/store'

const PERFIS = ['admin', 'volunteer', 'cashier'] as const
type Perfil = (typeof PERFIS)[number]
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const AVISO_RESTRITO = 'Só a coordenação cadastra e altera usuários.'
// Bloqueio no Auth por cem anos: a sessão aberta não se renova. 'none' desfaz.
const BLOQUEIO = '876000h'

// 12 caracteres sem os que se confundem (0 e O, 1 e l).
function senhaProvisoria(): string {
  const letras = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from(randomBytes(12), (b) => letras[b % letras.length]).join('')
}

function mensagemDoBanco(e: unknown): string {
  const texto = e instanceof Error ? e.message : String(e)
  if (texto.includes('pelo menos uma coordenação ativa')) return 'O sistema precisa de pelo menos uma coordenação ativa.'
  if (/already.*registered|already exists/i.test(texto)) return 'Já existe uma conta com este e-mail.'
  return 'Não foi possível salvar. Tente novamente.'
}

async function conferirCoordenacao(): Promise<string | { error: string }> {
  if (!(await souCoordenacao())) return { error: AVISO_RESTRITO }
  const eu = await getMeuId()
  return eu ?? { error: AVISO_RESTRITO }
}

export async function cadastrarUsuario(fd: FormData): Promise<{ error: string } | { senha: string; nome: string }> {
  const eu = await conferirCoordenacao()
  if (typeof eu !== 'string') return eu
  const nome = ((fd.get('name') as string) || '').replace(/\s+/g, ' ').trim()
  const email = ((fd.get('email') as string) || '').trim().toLowerCase()
  const perfil = (fd.get('role') as string) as Perfil
  if (nome.length < 2) return { error: 'Informe o nome.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Informe um e-mail válido.' }
  if (!PERFIS.includes(perfil)) return { error: 'Escolha o perfil.' }

  const admin = clienteComChaveSecreta()
  const senha = senhaProvisoria()
  const { data, error } = await admin.auth.admin.createUser({ email, password: senha, email_confirm: true })
  if (error || !data.user) return { error: mensagemDoBanco(error) }

  const { error: erroPerfil } = await admin.from('users').insert({
    id: data.user.id, name: nome, role: perfil, active: true, trocar_senha: true, criado_por: eu,
  })
  if (erroPerfil) {
    // Sem perfil, a conta não serve para nada: desfaz a criação no Auth.
    await admin.auth.admin.deleteUser(data.user.id)
    console.error('cadastrarUsuario error:', erroPerfil)
    return { error: 'Não foi possível cadastrar. Tente novamente.' }
  }
  revalidatePath('/equipe')
  return { senha, nome }
}

export async function alterarPerfil(id: string, perfil: string): Promise<{ error: string } | void> {
  const eu = await conferirCoordenacao()
  if (typeof eu !== 'string') return eu
  if (!UUID.test(id) || !PERFIS.includes(perfil as Perfil)) return { error: 'Escolha o perfil.' }
  const { error } = await clienteComChaveSecreta().from('users').update({ role: perfil }).eq('id', id)
  if (error) return { error: mensagemDoBanco(error) }
  revalidatePath('/equipe')
}

export async function desativarUsuario(id: string): Promise<{ error: string } | void> {
  const eu = await conferirCoordenacao()
  if (typeof eu !== 'string') return eu
  if (!UUID.test(id)) return { error: 'Usuário não encontrado.' }
  if (id === eu) return { error: 'Você não pode desativar a sua própria conta.' }
  const admin = clienteComChaveSecreta()
  const { error } = await admin.from('users').update({ active: false, desativado_em: new Date().toISOString(), desativado_por: eu }).eq('id', id)
  if (error) return { error: mensagemDoBanco(error) }
  await admin.auth.admin.updateUserById(id, { ban_duration: BLOQUEIO })
  revalidatePath('/equipe')
}

export async function reativarUsuario(id: string): Promise<{ error: string } | void> {
  const eu = await conferirCoordenacao()
  if (typeof eu !== 'string') return eu
  if (!UUID.test(id)) return { error: 'Usuário não encontrado.' }
  const admin = clienteComChaveSecreta()
  const { error } = await admin.from('users').update({ active: true, desativado_em: null, desativado_por: null }).eq('id', id)
  if (error) return { error: mensagemDoBanco(error) }
  await admin.auth.admin.updateUserById(id, { ban_duration: 'none' })
  revalidatePath('/equipe')
}

export async function gerarSenhaProvisoria(id: string): Promise<{ error: string } | { senha: string }> {
  const eu = await conferirCoordenacao()
  if (typeof eu !== 'string') return eu
  if (!UUID.test(id)) return { error: 'Usuário não encontrado.' }
  const admin = clienteComChaveSecreta()
  const senha = senhaProvisoria()
  const { error } = await admin.auth.admin.updateUserById(id, { password: senha })
  if (error) return { error: mensagemDoBanco(error) }
  await admin.from('users').update({ trocar_senha: true }).eq('id', id)
  revalidatePath('/equipe')
  return { senha }
}