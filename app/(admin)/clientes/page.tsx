import { ClientsPageClient } from '@/components/clients/clients-page-client'
import { getClients, getTags } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default async function ClientesPage() {
  const [clients, tags] = await Promise.all([getClients(), getTags()])

  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1300px]">
      <ClientsPageClient clients={clients} tags={tags} />
    </div>
  )
}
