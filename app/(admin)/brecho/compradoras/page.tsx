import { CustomersPageClient } from '@/components/shop/customers-page-client'
import { getCustomers, getTags } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default async function CompradoresPage() {
  const [customers, tags] = await Promise.all([
    getCustomers(),
    getTags(),
  ])

  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1300px]">
      <CustomersPageClient customers={customers} tags={tags} />
    </div>
  )
}
