'use server'

import { addCustomer, updateCustomer, updateCustomerTagsStore, getCustomerSalesHistory } from '@/lib/store'
import { revalidatePath } from 'next/cache'
import type { Customer, Sale } from '@/types'

export async function createCustomer(formData: FormData): Promise<Customer> {
  const tagsRaw = formData.get('tags') as string
  const tags = tagsRaw ? JSON.parse(tagsRaw) as string[] : []

  const customer = await addCustomer({
    name:         formData.get('name') as string,
    phone:        (formData.get('phone') as string) || '',
    birthday:     (formData.get('birthday') as string) || '',
    tags,
    member_since: new Date().getFullYear(),
  })

  revalidatePath('/brecho/compradoras')
  revalidatePath('/brecho/nova-venda')

  return customer
}

export async function editCustomer(formData: FormData): Promise<Customer> {
  const tagsRaw = formData.get('tags') as string
  const tags = tagsRaw ? JSON.parse(tagsRaw) as string[] : []
  const customerId = formData.get('customer_id') as string
  const supporterId = (formData.get('supporter_id') as string) || null

  const customer = await updateCustomer(customerId, supporterId, {
    name:     (formData.get('name') as string).trim(),
    phone:    (formData.get('phone') as string) || '',
    birthday: (formData.get('birthday') as string) || '',
    tags,
  })

  revalidatePath('/brecho/compradoras')
  revalidatePath('/brecho/nova-venda')

  return customer
}

export async function updateCustomerTags(id: string, tags: string[]) {
  await updateCustomerTagsStore(id, tags)
  revalidatePath('/brecho/compradoras')
}

export async function fetchCustomerSales(customerId: string): Promise<Sale[]> {
  return getCustomerSalesHistory(customerId)
}
