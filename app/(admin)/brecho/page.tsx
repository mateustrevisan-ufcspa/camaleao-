import { Plus, Sparkles, Cake } from 'lucide-react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { StatNumber } from '@/components/ui/stat-number'
import { SalesToday } from '@/components/shop/sales-today'
import { getTodaySales, getRecentSales, getDashboardStats, getBirthdaysThisMonth, getTopCustomerInsight } from '@/lib/store'
import { createClient } from '@/lib/supabase/server'
import { formatBRL } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function BrechoDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [sales, recentSales, stats, birthdays, topCustomer, profile] = await Promise.all([
    getTodaySales(),
    getRecentSales(8),
    getDashboardStats(),
    getBirthdaysThisMonth(),
    getTopCustomerInsight(),
    user
      ? supabase.from('users').select('name').eq('id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const userName = (profile as { data: { name: string } | null })?.data?.name
    ?? user?.email?.split('@')[0]
    ?? 'você'

  const totalToday = sales.reduce((s, v) => s + v.amount, 0)

  const now = new Date()
  const TZ = 'America/Sao_Paulo'
  const hour = Number(new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: '2-digit', hourCycle: 'h23' }).format(now))
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
  const monthName = now.toLocaleDateString('pt-BR', { month: 'long', timeZone: TZ })
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1)

  const trendPct =
    stats.yesterdayTotal > 0
      ? ((totalToday - stats.yesterdayTotal) / stats.yesterdayTotal) * 100
      : totalToday > 0
        ? 100
        : 0
  const trendLabel =
    stats.yesterdayTotal > 0 || totalToday > 0
      ? `${trendPct > 0 ? '+' : ''}${trendPct.toFixed(0)}% vs ontem`
      : undefined

  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1200px]">
      <header className="mb-8 md:mb-12 flex flex-col gap-4 md:flex-row md:justify-between md:items-end">
        <div>
          <div className="text-xs text-muted font-body tracking-[2px] uppercase mb-2">
            {now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ })}
          </div>
          <h1 className="font-display text-[32px] md:text-[48px] text-ink font-semibold tracking-[-1px] md:tracking-[-1.5px] m-0 leading-[1.05]">
            {greeting},{' '}
            <span className="text-accent-deep">{userName}</span>.
          </h1>
          <p className="font-body text-muted text-[14px] md:text-[15px] mt-3 max-w-[480px]">
            Cada peça que sai daqui vira atendimento, escuta e cuidado. Obrigada por estar aqui hoje.
          </p>
        </div>
        <Link href="/brecho/nova-venda" className="btn-primary self-start md:self-auto">
          <Plus size={16} /> Registrar venda
        </Link>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 md:mb-10">
        <Card>
          <StatNumber
            value={`R$ ${formatBRL(totalToday)}`}
            label="Vendas hoje"
            accentClass="text-accent"
            trend={trendLabel}
          />
        </Card>
        <Card>
          <StatNumber value={String(sales.length)} label="Atendimentos hoje" />
        </Card>
        <Card>
          <StatNumber value={`R$ ${formatBRL(stats.weekTotal)}`} label="Esta semana" />
        </Card>
        <Card>
          <StatNumber
            value={`R$ ${formatBRL(stats.monthTotal)}`}
            label={`Mês de ${monthName}`}
            accentClass="text-emerald"
          />
        </Card>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-[1.4fr_1fr]">
        <SalesToday sales={recentSales} />

        <div className="flex flex-col gap-4">
          {topCustomer && (
            <div
              className="rounded-[16px] p-6"
              style={{ background: 'linear-gradient(135deg, #E89E5C 0%, #D87560 100%)', color: '#FFFFFF' }}
            >
              <Sparkles size={20} className="mb-3" />
              <div className="font-display text-[22px] leading-tight font-semibold mb-2 tracking-[-0.3px]">
                {topCustomer.name} voltou pela {topCustomer.purchase_count}ª vez.
              </div>
              <div className="font-body text-[13px] opacity-95 leading-relaxed">
                Que tal mandar um agradecimento personalizado? Já são R$ {formatBRL(Number(topCustomer.total_spent))} em apoio.
              </div>
              <Link
                href="/clientes"
                className="inline-block mt-4 px-3.5 py-2 rounded-[8px] text-xs font-body font-medium text-white no-underline"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.4)' }}
              >
                Ver cliente →
              </Link>
            </div>
          )}

          {birthdays.length > 0 && (
            <Card>
              <div className="flex items-center gap-2 mb-3.5">
                <Cake size={16} className="text-coral" />
                <h4 className="m-0 font-body text-[11px] text-muted tracking-[1.5px] uppercase">
                  Aniversariantes de {capitalizedMonth}
                </h4>
              </div>
              <div className="flex flex-col gap-2.5">
                {birthdays.map((p, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <span className="font-body text-sm text-ink">{p.name}</span>
                    <span className="font-mono text-xs text-muted">{p.birthday}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
