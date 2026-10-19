import { ClientsPageClient } from '@/components/clients/clients-page-client'
import { getClients, getTags } from '@/lib/store'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export default async function ClientesPage() {
  const [clients, tags] = await Promise.all([getClients(), getTags()])
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const perfil = user
    ? (await supabase.from('users').select('role').eq('id', user.id).maybeSingle()).data
    : null

  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1300px]">
      <ClientsPageClient clients={clients} tags={tags} ehCoordenacao={perfil?.role === 'admin'} />
    </div>
  )
}
