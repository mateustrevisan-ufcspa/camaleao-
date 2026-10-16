'use server'

import { searchPeople } from '@/lib/store'
import type { PessoaEncontrada } from '@/types'

// Busca de pessoa por nome, apelido ou telefone (US-06). Usada pelo ClientPicker.
export async function buscarPessoas(termo: string): Promise<PessoaEncontrada[]> {
  const limpo = termo.trim().slice(0, 80)
  if (limpo.length < 2) return []
  return searchPeople(limpo)
}
