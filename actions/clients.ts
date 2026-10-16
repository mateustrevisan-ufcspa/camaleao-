'use server'

import { addClient, updateClient, updateClientTagsStore, getClientSalesHistory, getClientDonationsHistory } from '@/lib/store'
import { revalidatePath } from 'next/cache'
import type { Client, Sale } from '@/types'

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

  revalidatePath('/clientes')
  revalidatePath('/brecho/nova-venda')

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

  revalidatePath('/clientes')
  revalidatePath('/brecho/nova-venda')

  return client
}

export async function updateClientTags(id: string, tags: string[]) {
  await updateClientTagsStore(id, tags)
  revalidatePath('/clientes')
}

export async function fetchClientSales(clientId: string): Promise<Sale[]> {
  return getClientSalesHistory(clientId)
}

export async function fetchClientDonations(clientId: string) {
  return getClientDonationsHistory(clientId)
}
