import { createClient } from '@/lib/supabase/server'
import type { Customer, Sale, DonationCash } from '@/types'

function round2(n: number) {
  return Math.round(n * 100) / 100
}

// ── Tempo no fuso America/Sao_Paulo (BRT, UTC-3 fixo, sem horário de verão) ──
// O servidor roda em UTC; sem isto as fronteiras de "hoje"/semana/mês saltam o dia.
function brNowParts(): { y: number; m: number; d: number; hour: number } {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date())
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value)
  return { y: get('year'), m: get('month'), d: get('day'), hour: get('hour') }
}

// Meia-noite BRT (00:00 -03:00) de uma data, como instante UTC.
function brMidnightUtc(y: number, m: number, d: number): Date {
  return new Date(Date.UTC(y, m - 1, d, 3, 0, 0))
}

const DAY_MS = 24 * 60 * 60 * 1000

const MONTH_NAMES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

export async function getCustomers(): Promise<Customer[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('customers_view')
    .select('*')
    .order('name')

  if (error) throw new Error(error.message)
  return (data ?? []) as Customer[]
}

export async function getTodaySales(): Promise<Sale[]> {
  const supabase = await createClient()
  const { y, m, d } = brNowParts()
  const today = brMidnightUtc(y, m, d)

  const { data, error } = await supabase
    .from('sales_view')
    .select('*')
    .gte('sold_at', today.toISOString())
    .order('sold_at')

  if (error) throw new Error(error.message)
  return (data ?? []) as Sale[]
}

export async function getAllSales(): Promise<Sale[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sales_view')
    .select('*')
    .order('sold_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as Sale[]
}

// Vendas do mês corrente — usado na conferência financeira (rótulos "· mês").
export async function getMonthSales(): Promise<Sale[]> {
  const supabase = await createClient()
  const { y, m } = brNowParts()
  const monthStart = brMidnightUtc(y, m, 1)

  const { data, error } = await supabase
    .from('sales_view')
    .select('*')
    .gte('sold_at', monthStart.toISOString())
    .order('sold_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as Sale[]
}

export async function addCustomer(
  data: Omit<Customer, 'id' | 'supporter_id' | 'purchase_count' | 'total_spent' | 'last_purchase_at' | 'created_at'>
): Promise<Customer> {
  const supabase = await createClient()

  // Cria supporter primeiro
  const { data: supporter, error: supporterError } = await supabase
    .from('supporters')
    .insert({ name: data.name, phone: data.phone, birthday: data.birthday })
    .select('id')
    .single()

  if (supporterError) throw new Error(supporterError.message)

  // Cria customer vinculado ao supporter
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .insert({ supporter_id: supporter.id, member_since: data.member_since })
    .select('id')
    .single()

  if (customerError) throw new Error(customerError.message)

  // Vincula tags
  if (data.tags.length > 0) {
    const { data: tagRows, error: tagsLookupError } = await supabase
      .from('tags')
      .select('id, name')
      .in('name', data.tags)

    if (tagsLookupError) throw new Error(tagsLookupError.message)

    const tagLinks = (tagRows ?? []).map((t) => ({
      customer_id: customer.id,
      tag_id: t.id,
    }))

    if (tagLinks.length > 0) {
      const { error: tagError } = await supabase.from('customer_tags').insert(tagLinks)
      if (tagError) throw new Error(tagError.message)
    }
  }

  // Retorna via view para ter o objeto flat completo
  const { data: full, error: viewError } = await supabase
    .from('customers_view')
    .select('*')
    .eq('id', customer.id)
    .single()

  if (viewError) throw new Error(viewError.message)
  return full as Customer
}

export async function addSale(
  data: Omit<Sale, 'id' | 'created_at' | 'time' | 'category' | 'amount' | 'sold_at'> & {
    sold_at?: string
    items: { category_id?: string | null; category_name: string; amount: number }[]
    payment_method_id?: string
    bank_id?: string
    registered_by?: string | null
  }
): Promise<string> {
  const supabase = await createClient()

  const { data: result, error } = await supabase.rpc('register_sale', {
    p_customer_id:       data.customer_id ?? null,
    p_customer_name:     data.customer_name,
    p_payment_method_id: data.payment_method_id ?? null,
    p_bank_id:           data.bank_id ?? null,
    p_installments:      data.installments ?? null,
    p_net_amount:        data.net_amount ?? null,
    p_registered_by:     data.registered_by ?? null,
    p_sold_at:           data.sold_at ?? new Date().toISOString(),
    p_items:             data.items,
  })

  if (error) throw new Error(error.message)
  return result as string
}

export async function confirmSale(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('sales')
    .update({ confirmed: true })
    .eq('id', id)

  if (error) throw new Error(error.message)
}

export async function updateCustomerTagsStore(id: string, tags: string[]): Promise<void> {
  const supabase = await createClient()

  // Busca IDs das tags pelo nome
  const { data: tagRows, error: lookupError } = await supabase
    .from('tags')
    .select('id, name')
    .in('name', tags)

  if (lookupError) throw new Error(lookupError.message)

  // Substitui todas as tags do customer
  const { error: deleteError } = await supabase
    .from('customer_tags')
    .delete()
    .eq('customer_id', id)

  if (deleteError) throw new Error(deleteError.message)

  if (tagRows && tagRows.length > 0) {
    const { error: insertError } = await supabase
      .from('customer_tags')
      .insert(tagRows.map((t) => ({ customer_id: id, tag_id: t.id })))

    if (insertError) throw new Error(insertError.message)
  }
}

export async function updateCustomer(
  customerId: string,
  supporterId: string | null,
  data: { name: string; phone: string; birthday: string; tags: string[] }
): Promise<Customer> {
  const supabase = await createClient()

  // Dados de identidade (name/phone/birthday) vivem em supporters.
  // Compradora avulsa sem supporter: cria um e vincula.
  let sid = supporterId
  if (sid) {
    const { error } = await supabase
      .from('supporters')
      .update({ name: data.name, phone: data.phone, birthday: data.birthday })
      .eq('id', sid)
    if (error) throw new Error(error.message)
  } else {
    const { data: sup, error } = await supabase
      .from('supporters')
      .insert({ name: data.name, phone: data.phone, birthday: data.birthday })
      .select('id')
      .single()
    if (error) throw new Error(error.message)
    sid = sup.id
    const { error: linkErr } = await supabase
      .from('customers')
      .update({ supporter_id: sid })
      .eq('id', customerId)
    if (linkErr) throw new Error(linkErr.message)
  }

  await updateCustomerTagsStore(customerId, data.tags)

  const { data: full, error: viewError } = await supabase
    .from('customers_view')
    .select('*')
    .eq('id', customerId)
    .single()
  if (viewError) throw new Error(viewError.message)
  return full as Customer
}

export async function getDonations(): Promise<DonationCash[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('donations_cash_view')
    .select('*')
    .order('donated_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as DonationCash[]
}

export async function getPaymentMethods(): Promise<{ id: string; name: string; label: string }[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('payment_methods')
    .select('id, name, label')
    .eq('active', true)
    .order('name')
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getBanks(): Promise<{ id: string; name: string; type: string }[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('banks')
    .select('id, name, type')
    .eq('active', true)
    .order('type, name')
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getItemCategories(): Promise<{ id: string; name: string; type: string }[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('item_categories')
    .select('id, name, type')
    .eq('active', true)
    .in('type', ['sale', 'both'])
    .order('name')
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getTags(): Promise<{ id: string; name: string; color: string; bg_color: string }[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tags')
    .select('id, name, color, bg_color')
    .order('name')
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function getDashboardStats(): Promise<{
  weekTotal: number
  monthTotal: number
  yesterdayTotal: number
}> {
  const supabase = await createClient()
  const { y, m, d } = brNowParts()
  const today = brMidnightUtc(y, m, d)
  const yesterday = new Date(today.getTime() - DAY_MS)
  const monthStart = brMidnightUtc(y, m, 1)
  // dia da semana da data BR (0=domingo); segunda como início
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay()
  const daysSinceMonday = (dow + 6) % 7
  const weekStart = new Date(today.getTime() - daysSinceMonday * DAY_MS)

  const { data } = await supabase
    .from('sales_view')
    .select('amount, sold_at')
    .gte('sold_at', monthStart.toISOString())

  const rows = data ?? []
  return {
    weekTotal: round2(
      rows.filter(r => new Date(r.sold_at) >= weekStart).reduce((s, r) => s + Number(r.amount), 0)
    ),
    monthTotal: round2(rows.reduce((s, r) => s + Number(r.amount), 0)),
    yesterdayTotal: round2(
      rows.filter(r => {
        const d = new Date(r.sold_at)
        return d >= yesterday && d < today
      }).reduce((s, r) => s + Number(r.amount), 0)
    ),
  }
}

export async function getBirthdaysThisMonth(): Promise<{ name: string; birthday: string }[]> {
  const supabase = await createClient()
  const month = String(brNowParts().m).padStart(2, '0')
  const { data } = await supabase
    .from('customers_view')
    .select('name, birthday')
    .not('birthday', 'eq', '')
    .not('birthday', 'is', null)

  return (data ?? []).filter(c => {
    if (!c.birthday) return false
    const parts = c.birthday.split('/')  // format: dd/mm
    return parts.length === 2 && parts[1] === month
  })
}

export async function getTopCustomerInsight(): Promise<{
  id: string
  name: string
  purchase_count: number
  total_spent: number
} | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('customers_view')
    .select('id, name, purchase_count, total_spent')
    .gt('purchase_count', 0)
    .order('purchase_count', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data ?? null
}

export async function getCustomerSalesHistory(customerId: string): Promise<Sale[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sales_view')
    .select('*')
    .eq('customer_id', customerId)
    .order('sold_at', { ascending: false })
    .limit(10)
  if (error) throw new Error(error.message)
  return (data ?? []) as Sale[]
}

export async function getReportData(year: number) {
  const supabase = await createClient()
  const start = `${year}-01-01`
  const end   = `${year + 1}-01-01`

  const [
    { data: salesData },
    { count: totalCustomers },
    { data: newCustData },
  ] = await Promise.all([
    supabase.from('sales_view')
      .select('sold_at, amount, net_amount, payment_method, customer_name, customer_id')
      .gte('sold_at', start)
      .lt('sold_at', end),
    supabase.from('customers_view').select('*', { count: 'exact', head: true }),
    supabase.from('customers_view')
      .select('created_at')
      .gte('created_at', start)
      .lt('created_at', end),
  ])

  const sales = salesData ?? []
  const currentMonth = brNowParts().m

  const monthData: Record<number, { sales: number; gross: number; net: number; newCustomers: number }> = {}
  for (const s of sales) {
    const m = new Date(s.sold_at).getMonth() + 1
    if (!monthData[m]) monthData[m] = { sales: 0, gross: 0, net: 0, newCustomers: 0 }
    monthData[m].sales++
    monthData[m].gross += Number(s.amount)
    monthData[m].net   += Number(s.net_amount ?? s.amount)
  }
  for (const c of newCustData ?? []) {
    const m = new Date(c.created_at).getMonth() + 1
    if (!monthData[m]) monthData[m] = { sales: 0, gross: 0, net: 0, newCustomers: 0 }
    monthData[m].newCustomers++
  }

  const monthlySales = Array.from({ length: currentMonth }, (_, i) => {
    const m = i + 1
    const d = monthData[m] ?? { sales: 0, gross: 0, net: 0, newCustomers: 0 }
    return {
      month: MONTH_NAMES[i],
      sales: d.sales,
      gross: round2(d.gross),
      net:   round2(d.net),
      fees:  round2(d.gross - d.net),
      newCustomers: d.newCustomers,
    }
  })

  const thisMonthSales = sales.filter(s => new Date(s.sold_at).getMonth() + 1 === currentMonth)
  const pmTotals: Record<string, number> = {}
  for (const s of thisMonthSales) {
    const pm = s.payment_method ?? 'outros'
    pmTotals[pm] = (pmTotals[pm] ?? 0) + Number(s.amount)
  }
  const thisMonthTotal = thisMonthSales.reduce((sum, s) => sum + Number(s.amount), 0)
  const paymentBreakdown = Object.entries(pmTotals)
    .map(([method, amount]) => ({
      method,
      amount: round2(amount),
      pct: thisMonthTotal > 0 ? Math.round((amount / thisMonthTotal) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount)

  const custTotals: Record<string, { amount: number; purchases: number }> = {}
  for (const s of thisMonthSales) {
    const name = s.customer_name ?? 'Anônimo'
    if (name === 'Cliente avulso') continue
    if (!custTotals[name]) custTotals[name] = { amount: 0, purchases: 0 }
    custTotals[name].amount   += Number(s.amount)
    custTotals[name].purchases++
  }
  const topCustomers = Object.entries(custTotals)
    .map(([name, d]) => ({ name, amount: round2(d.amount), purchases: d.purchases }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4)

  const totalRevenue = round2(sales.reduce((s, r) => s + Number(r.amount), 0))
  const totalSales = sales.length
  const avgMonthly = round2(totalRevenue / Math.max(currentMonth, 1))

  return {
    monthlySales,
    paymentBreakdown,
    topCustomers,
    yearStats: {
      totalRevenue,
      totalSales,
      totalCustomers: totalCustomers ?? 0,
      avgMonthly,
    },
  }
}

export async function addDonation(
  data: Omit<DonationCash, 'id' | 'created_at'> & { registered_by?: string | null }
): Promise<DonationCash> {
  const supabase = await createClient()

  // Resolve origin_id pelo nome
  const { data: origin, error: originError } = await supabase
    .from('cash_origins')
    .select('id')
    .eq('name', data.origin)
    .single()

  if (originError) throw new Error(originError.message)

  const { data: inserted, error } = await supabase
    .from('donations_cash')
    .insert({
      donor_name:    data.donor_name,
      donor_phone:   data.donor_phone,
      amount:        data.amount,
      origin_id:     origin.id,
      frequency:     data.frequency,
      donated_at:    data.donated_at,
      notes:         data.notes ?? null,
      registered_by: data.registered_by ?? null,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  const { data: full, error: viewError } = await supabase
    .from('donations_cash_view')
    .select('*')
    .eq('id', inserted.id)
    .single()

  if (viewError) throw new Error(viewError.message)
  return full as DonationCash
}
