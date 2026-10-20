'use server'

import { revalidatePath } from 'next/cache'
import { addItemCategory, updateItemCategory } from '@/lib/store'

const TIPOS = ['sale', 'donation', 'both'] as const
type Tipo = (typeof TIPOS)[number]

function lerCampos(fd: FormData): { name: string; type: Tipo } | { error: string } {
  const name = ((fd.get('name') as string) || '').trim().toLowerCase()
  const type = (fd.get('type') as string) || ''
  if (!name) return { error: 'Informe o nome da categoria.' }
  if (name.length > 40) return { error: 'Use um nome de até 40 letras.' }
  if (!TIPOS.includes(type as Tipo)) return { error: 'Escolha onde a categoria é usada.' }
  return { name, type: type as Tipo }
}

function mensagem(e: unknown) {
  const texto = e instanceof Error ? e.message : ''
  if (texto.includes('duplicate key') || texto.includes('unique')) return 'Já existe uma categoria com esse nome.'
  return 'Não foi possível salvar a categoria. Tente novamente.'
}

function revalidarTelas() {
  revalidatePath('/doacoes/categorias')
  revalidatePath('/doacoes/itens/nova')
  revalidatePath('/brecho/nova-venda')
}

export async function criarCategoria(fd: FormData): Promise<{ error: string } | void> {
  const campos = lerCampos(fd)
  if ('error' in campos) return campos
  try {
    await addItemCategory(campos.name, campos.type)
  } catch (e) {
    console.error('criarCategoria error:', e)
    return { error: mensagem(e) }
  }
  revalidarTelas()
}

export async function salvarCategoria(fd: FormData): Promise<{ error: string } | void> {
  const id = ((fd.get('id') as string) || '').trim()
  const campos = lerCampos(fd)
  if ('error' in campos) return campos
  try {
    await updateItemCategory(id, { ...campos, active: fd.get('active') === 'on' })
  } catch (e) {
    console.error('salvarCategoria error:', e)
    return { error: mensagem(e) }
  }
  revalidarTelas()
}