'use server'

import { addClient, updateClient, updateClientTagsStore, getClientHistory, getRegistroOriginal, setClientNickname } from '@/lib/store'
import { revalidatePath } from 'next/cache'
import type { Client, ItemDoHistorico, RegistroOriginal, TipoDeContribuicao } from '@/types'
import { addMessageConsent } from '@/lib/store'
import { TERMO_MENSAGENS } from '@/lib/termo-mensagens'

export async function saveNewClient(formData: FormData): Promise<Client> {
  const tagsRaw = formData.get('tags') as string
  const tags = tagsRaw ? (JSON.parse(tagsRaw) as string[]) : []

  const client = await addClient({
    name:         (formData.get('name') as string).trim(),
    phone:        (formData.get('phone') as string) || '',
    birthday:     (formData.get('birthday') as string) || '',
    email:        (formData.get('email') as string) || undefined,
    tags,
    member_since: new Date().getFullYear(),
  })
  const apelido = ((formData.get('nickname') as string) || '').trim()
  if (apelido) {
    await setClientNickname(client.id, apelido)
    client.nickname = apelido
  }

  revalidatePath('/clientes')
  revalidatePath('/brecho/nova-venda')

  // Só registra quando a caixa foi marcada. Não marcar não vira "recusou":
  // a pessoa fica como "ainda não foi perguntada".
  if (formData.get('autoriza_mensagens') === 'on') {
    await addMessageConsent(client.id, true, TERMO_MENSAGENS.versao)
  }

  return client
}

export async function saveClient(formData: FormData): Promise<Client> {
  const tagsRaw = formData.get('tags') as string
  const tags = tagsRaw ? (JSON.parse(tagsRaw) as string[]) : []
  const clientId = formData.get('client_id') as string

  // Quem vê o telefone mascarado recebe o campo vazio e só o preenche para
  // trocar o número. Vazio com phone_keep = manter o que está gravado.
  const telefone = ((formData.get('phone') as string) || '').trim()
  const manterTelefone = formData.get('phone_keep') === '1' && telefone === ''
  if (telefone.includes('•')) throw new Error('Telefone mascarado não pode ser gravado.')

  const client = await updateClient(clientId, {
    name:     (formData.get('name') as string).trim(),
    phone:    manterTelefone ? undefined : telefone,
    birthday: (formData.get('birthday') as string) || '',
    email:    (formData.get('email') as string) || undefined,
    tags,
  })
  // Sempre grava, para o apelido poder ser apagado na edição.
  const apelido = ((formData.get('nickname') as string) || '').trim()
  await setClientNickname(clientId, apelido)
  client.nickname = apelido

  revalidatePath('/clientes')
  revalidatePath('/brecho/nova-venda')

  return client
}

export async function updateClientTags(id: string, tags: string[]) {
  await updateClientTagsStore(id, tags)
  revalidatePath('/clientes')
}

// Histórico unificado da ficha (US-10).
export async function fetchClientHistory(clientId: string): Promise<ItemDoHistorico[]> {
  return getClientHistory(clientId)
}

// O registro como foi gravado, para o painel da ficha.
export async function fetchRegistroOriginal(tipo: TipoDeContribuicao, id: string): Promise<RegistroOriginal | null> {
  return getRegistroOriginal(tipo, id)
}
