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

  const client = await updateClient(clientId, {
    name:     (formData.get('name') as string).trim(),
    phone:    (formData.get('phone') as string) || '',
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
