import { TrendingUp, ShoppingBag, Users, Calendar } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { StatNumber } from '@/components/ui/stat-number'
import { getReportData } from '@/lib/store'
import { formatBRL } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const PM_LABELS: Record<string, string> = {
  pix: 'PIX', credit: 'Crédito', debit: 'Débito', cash: 'Dinheiro',
}
const PM_COLORS: Record<string, string> = {
  pix: '#5C8A6E', credit: '#D87560', debit: '#4B3A9B', cash: '#E89E5C',
}

export default async function RelatoriosPage() {
  const year = new Date().getFullYear()
  const { monthlySales, paymentBreakdown, topCustomers, yearStats } = await getReportData(year)
  const monthName = new Date().toLocaleDateString('pt-BR', { month: 'long', timeZone: 'America/Sao_Paulo' })

  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1200px]">
      <header className="mb-9">
        <div className="text-xs text-muted font-body tracking-[2px] uppercase mb-2">
          Relatórios · {year}
        </div>
        <h1 className="font-display text-[28px] md:text-[40px] text-ink font-semibold tracking-[-1px] m-0">
          Visão consolidada
        </h1>
        <p className="font-body text-muted text-sm mt-2 max-w-[480px]">
          Acompanhe o impacto do Instituto Camaleão por área e período.
        </p>
      </header>

      <section className="mb-10">
        <h2 className="font-body text-[11px] text-muted tracking-[2px] uppercase mb-4">
          Instituto · resumo anual
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <div className="text-accent mb-3"><ShoppingBag size={20} /></div>
            <StatNumber
              value={`R$ ${formatBRL(yearStats.totalRevenue)}`}
              label={`Receita brechó · ${year}`}
              accentClass="text-accent"
            />
          </Card>
          <Card>
            <div className="text-purple mb-3"><Users size={20} /></div>
            <StatNumber value={String(yearStats.totalCustomers)} label="Clientes ativos" />
          </Card>
          <Card>
            <div className="text-coral mb-3"><TrendingUp size={20} /></div>
            <StatNumber value={String(yearStats.totalSales)} label="Vendas realizadas" />
          </Card>
          <Card>
            <div className="text-emerald mb-3"><Calendar size={20} /></div>
            <StatNumber
              value={`R$ ${formatBRL(yearStats.avgMonthly)}`}
              label="Média mensal"
              accentClass="text-emerald"
            />
          </Card>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="font-body text-[11px] text-muted tracking-[2px] uppercase mb-4">
          Brechó · evolução mensal
        </h2>
        {monthlySales.length === 0 ? (
          <Card>
            <p className="font-body text-sm text-muted text-center py-4">Nenhuma venda registrada em {year}.</p>
          </Card>
        ) : (
          <Card className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse font-body">
                <thead>
                  <tr className="bg-bg">
                    {['Mês', 'Vendas', 'Receita bruta', 'Taxas', 'Receita líquida', 'Novos clientes'].map((h) => (
                      <th key={h} className="text-left px-6 py-3.5 text-[11px] text-muted tracking-[1.5px] uppercase font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {monthlySales.map((r, i) => (
                    <tr key={r.month} className={i < monthlySales.length - 1 ? 'border-b border-rule' : ''}>
                      <td className="px-6 py-4 font-body text-sm text-ink font-medium">{r.month}</td>
                      <td className="px-6 py-4 font-body text-sm text-ink">{r.sales}</td>
                      <td className="px-6 py-4 font-display text-sm text-ink">
                        R$ {formatBRL(r.gross)}
                      </td>
                      <td className="px-6 py-4 font-display text-sm text-coral">
                        R$ {formatBRL(r.fees)}
                      </td>
                      <td className="px-6 py-4 font-display text-sm text-emerald font-medium">
                        R$ {formatBRL(r.net)}
                      </td>
                      <td className="px-6 py-4 font-body text-sm text-ink">+{r.newCustomers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </section>

      <section>
        <h2 className="font-body text-[11px] text-muted tracking-[2px] uppercase mb-4">
          Formas de pagamento · {monthName}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <h4 className="font-body text-[11px] text-muted tracking-[1.5px] uppercase mb-5 m-0">
              Distribuição por canal
            </h4>
            {paymentBreakdown.length === 0 ? (
              <p className="font-body text-sm text-muted">Nenhuma venda este mês.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {paymentBreakdown.map((f) => (
                  <div key={f.method}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-body text-sm text-ink">
                        {PM_LABELS[f.method] ?? f.method}
                      </span>
                      <span className="font-display text-sm text-ink">
                        R$ {formatBRL(f.amount)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-rule rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${f.pct}%`, backgroundColor: PM_COLORS[f.method] ?? '#7A6E8A' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h4 className="font-body text-[11px] text-muted tracking-[1.5px] uppercase mb-4 m-0">
              Top clientes · {monthName}
            </h4>
            {topCustomers.length === 0 ? (
              <p className="font-body text-sm text-muted">Nenhum cliente identificado este mês.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {topCustomers.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className="font-display text-[13px] text-muted w-5 shrink-0 text-right">{i + 1}</span>
                    <div className="flex-1">
                      <span className="font-body text-sm text-ink">{c.name}</span>
                      <span className="font-body text-xs text-muted ml-2">{c.purchases} compra{c.purchases !== 1 ? 's' : ''}</span>
                    </div>
                    <span className="font-display text-sm text-ink">
                      R$ {formatBRL(c.amount)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </section>
    </div>
  )
}
