import { FinancialsTable } from '@/components/shop/financials-table'
import { getMonthSales } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default async function FinanceiroPage() {
  const sales = await getMonthSales()

  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1300px]">
      <header className="mb-9">
        <div className="text-xs text-muted font-body tracking-[2px] uppercase mb-2">
          Financeiro · {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </div>
        <h1 className="font-display text-[28px] md:text-[40px] text-ink font-semibold tracking-[-1px] m-0 leading-[1.1]">
          Conferência de{' '}
          <span className="text-emerald">valores recebidos</span>
        </h1>
      </header>
      <FinancialsTable sales={sales} />
    </div>
  )
}
