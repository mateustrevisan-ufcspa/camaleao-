import { createClient } from '@/lib/supabase/server'
// Um tipo por linha: na Sprint 4 seis stories acrescentam tipos aqui, cada uma
// numa linha diferente (veja docs/sprints/sprint-4/README.md).
import type {
  AtalhoDaVenda,
  Aniversariante,
  Client,
  Mesclagem,
  DoacaoSemFicha,
  DonationCaps,
  DonationCash,
  Evento,
  EventoComTotal,
  Campanha,
  CampanhaComTotal,
  DonationItem,
  CategoriaDeItem,
  PessoaEncontrada,
  ParRepetido,
  Sale,
  ItemDoHistorico,
  RegistroOriginal,
  TipoDeContribuicao,
} from '@/types'

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

// Colunas que as telas usam de cada view (SEC-05). Nada de select('*'): coluna
// nova na view só chega ao navegador se alguém a pedir aqui.
// Cada lista é um texto só, sem concatenar: o supabase-js lê o texto para
// conferir os tipos, e só consegue fazer isso com um literal.
const COLUNAS_PESSOA = 'id, name, phone, phone_masked, email, birthday, member_since, created_at, tags, purchase_count, total_spent, last_purchase_at, donation_count, donation_total, last_donation_at'
const COLUNAS_VENDA = 'id, time, client_id, customer_name, category, amount, payment_method, bank, installments, net_amount, confirmed, sold_at, created_at'
const COLUNAS_DOACAO_DINHEIRO = 'id, client_id, donated_at, donor_name, donor_phone, amount, origin, frequency, notes, created_at, event_id, event_name, campaign_id, campaign_name'

const MONTH_NAMES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]

// ── BUSCA DE PESSOA E APELIDO (US-06) ──
// A busca roda no banco (função buscar_pessoas) e devolve no máximo 8 linhas.
export async function searchPeople(termo: string): Promise<PessoaEncontrada[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('buscar_pessoas', { p_termo: termo })
  if (error) throw new Error(error.message)
  return (data ?? []) as PessoaEncontrada[]
}

// O apelido fica na tabela clients e não está na clients_view. A ficha busca
// o apelido à parte e junta aqui.
async function comApelidos(clients: Client[]): Promise<Client[]> {
  if (clients.length === 0) return clients
  const supabase = await createClient()
  const { data, error } = await supabase.from('clients').select('id, nickname')
  if (error) throw new Error(error.message)
  const apelidos = new Map((data ?? []).map((c) => [c.id as string, (c.nickname as string | null) ?? '']))
  return clients.map((c) => ({ ...c, nickname: apelidos.get(c.id) ?? '' }))
}

// Apelido vazio apaga o apelido.
export async function setClientNickname(clientId: string, nickname: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('clients').update({ nickname: nickname || null }).eq('id', clientId)
  if (error) throw new Error(error.message)
}

export async function getClients(): Promise<Client[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clients_view')
    .select(COLUNAS_PESSOA)
    .order('name')

  if (error) throw new Error(error.message)
  return comApelidos((data ?? []) as Client[])
}

// ── POSSÍVEIS REPETIDOS (US-08a) ──
// Pares de fichas com nome parecido ou telefone igual. Só a coordenação recebe pares.
export async function getPossiveisRepetidos(): Promise<ParRepetido[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('possiveis_repetidos', { p_limite: 100 })
  if (error) throw new Error(error.message)
  return ((data ?? []) as ParRepetido[]).map((p) => ({ ...p, semelhanca: Number(p.semelhanca) }))
}

export async function getTodaySales(): Promise<Sale[]> {
  const supabase = await createClient()
  const { y, m, d } = brNowParts()
  const today = brMidnightUtc(y, m, d)

  const { data, error } = await supabase
    .from('sales_view')
    .select(COLUNAS_VENDA)
    .gte('sold_at', today.toISOString())
    .order('sold_at')

  if (error) throw new Error(error.message)
  return (data ?? []) as Sale[]
}

// Vendas mais recentes (independe do dia) — usado na visão geral.
export async function getRecentSales(limit = 8): Promise<Sale[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sales_view')
    .select(COLUNAS_VENDA)
    .order('sold_at', { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return (data ?? []) as Sale[]
}

export async function getAllSales(): Promise<Sale[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('sales_view')
    .select(COLUNAS_VENDA)
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
    .select(COLUNAS_VENDA)
    .gte('sold_at', monthStart.toISOString())
    .order('sold_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as Sale[]
}

export async function addClient(
  data: { name: string; phone: string; birthday: string; email?: string; tags: string[]; member_since: number }
): Promise<Client> {
  const supabase = await createClient()

  const { data: client, error: clientError } = await supabase
    .from('clients')
    .insert({
      name: data.name,
      phone: data.phone,
      birthday: data.birthday,
      email: data.email || null,
      member_since: data.member_since,
    })
    .select('id')
    .single()

  if (clientError) throw new Error(clientError.message)

  // Vincula tags
  if (data.tags.length > 0) {
    const { data: tagRows, error: tagsLookupError } = await supabase
      .from('tags')
      .select('id, name')
      .in('name', data.tags)

    if (tagsLookupError) throw new Error(tagsLookupError.message)

    const tagLinks = (tagRows ?? []).map((t) => ({ client_id: client.id, tag_id: t.id }))
    if (tagLinks.length > 0) {
      const { error: tagError } = await supabase.from('client_tags').insert(tagLinks)
      if (tagError) throw new Error(tagError.message)
    }
  }

  // Retorna via view para ter o objeto flat completo
  const { data: full, error: viewError } = await supabase
    .from('clients_view')
    .select(COLUNAS_PESSOA)
    .eq('id', client.id)
    .single()

  if (viewError) throw new Error(viewError.message)
  return full as Client
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
    p_client_id:         data.client_id ?? null,
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

export async function updateClientTagsStore(id: string, tags: string[]): Promise<void> {
  const supabase = await createClient()

  // Busca IDs das tags pelo nome
  const { data: tagRows, error: lookupError } = await supabase
    .from('tags')
    .select('id, name')
    .in('name', tags)

  if (lookupError) throw new Error(lookupError.message)

  // Substitui todas as tags do cliente
  const { error: deleteError } = await supabase
    .from('client_tags')
    .delete()
    .eq('client_id', id)

  if (deleteError) throw new Error(deleteError.message)

  if (tagRows && tagRows.length > 0) {
    const { error: insertError } = await supabase
      .from('client_tags')
      .insert(tagRows.map((t) => ({ client_id: id, tag_id: t.id })))

    if (insertError) throw new Error(insertError.message)
  }
}

export async function updateClient(
  clientId: string,
  // phone ausente = manter o telefone que já está gravado (SEC-05).
  data: { name: string; phone?: string; birthday: string; email?: string; tags: string[] }
): Promise<Client> {
  const supabase = await createClient()

  const campos: { name: string; birthday: string; email: string | null; phone?: string } = {
    name: data.name,
    birthday: data.birthday,
    email: data.email || null,
  }
  if (data.phone !== undefined) campos.phone = data.phone

  const { error } = await supabase
    .from('clients')
    .update(campos)
    .eq('id', clientId)
  if (error) throw new Error(error.message)

  await updateClientTagsStore(clientId, data.tags)

  const { data: full, error: viewError } = await supabase
    .from('clients_view')
    .select(COLUNAS_PESSOA)
    .eq('id', clientId)
    .single()
  if (viewError) throw new Error(viewError.message)
  return full as Client
}

// ── MESCLAGEM DE FICHAS (US-08b) ──
// Só a coordenação mescla e desfaz: as funções do banco conferem o perfil.

export async function getFichasParaMesclar(ids: string[]): Promise<Client[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('clients_view').select(COLUNAS_PESSOA).in('id', ids)
  if (error) throw new Error(error.message)
  return comApelidos((data ?? []) as Client[])
}

export async function mergeClients(manter: string, juntar: string): Promise<string> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('mesclar_fichas', { p_manter: manter, p_juntar: juntar })
  if (error) throw new Error(error.message)
  return data as string
}

export async function undoMerge(mesclagemId: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.rpc('desfazer_mesclagem', { p_mesclagem: mesclagemId })
  if (error) throw new Error(error.message)
}

export async function getMesclagensRecentes(): Promise<Mesclagem[]> {
  const supabase = await createClient()
  const desde = new Date(Date.now() - 30 * DAY_MS).toISOString()
  const { data, error } = await supabase
    .from('client_merges')
    .select('id, kept_id, removed_name, merged_at, undone_at')
    .gte('merged_at', desde)
    .order('merged_at', { ascending: false })
  if (error) throw new Error(error.message)
  const linhas = data ?? []
  if (linhas.length === 0) return []

  const { data: mantidas, error: erroNomes } = await supabase
    .from('clients')
    .select('id, name')
    .in('id', linhas.map((l) => l.kept_id))
  if (erroNomes) throw new Error(erroNomes.message)
  const nomes = new Map((mantidas ?? []).map((c) => [c.id as string, c.name as string]))

  return linhas.map((l) => ({
    id: l.id,
    mantida: nomes.get(l.kept_id) ?? 'ficha apagada',
    removida: l.removed_name,
    merged_at: l.merged_at,
    undone_at: l.undone_at,
  }))
}

export async function getDonations(): Promise<DonationCash[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('donations_cash_view')
    .select(COLUNAS_DOACAO_DINHEIRO)
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

// ── ATALHOS DA VENDA (US-05) ──
// As combinações de categoria e valor mais vendidas, para a venda sair em poucos toques.
export async function getAtalhosDaVenda(): Promise<AtalhoDaVenda[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('atalhos_da_venda', { p_limite: 8 })
  if (error) throw new Error(error.message)
  return ((data ?? []) as AtalhoDaVenda[]).map((a) => ({ ...a, valor: Number(a.valor) }))
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
    .from('clients_view')
    .select('name, birthday')
    .not('birthday', 'eq', '')
    .not('birthday', 'is', null)

  return (data ?? []).filter(c => {
    if (!c.birthday) return false
    const parts = c.birthday.split('/')  // format: dd/mm
    return parts.length === 2 && parts[1] === month
  })
}

// ── ANIVERSARIANTES DO MÊS (US-22) ──
// Quem faz aniversário no mês escolhido, com o contato e a autorização de
// mensagens. A tela é só da coordenação, que recebe o telefone inteiro (SEC-05).
export async function getAniversariantes(mes: number): Promise<Aniversariante[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clients_view')
    .select('id, name, phone, email, birthday')
    .not('birthday', 'is', null)
    .neq('birthday', '')
  if (error) throw new Error(error.message)

  // O aniversário é guardado como "dd/mm", sem o ano.
  const doMes = (data ?? [])
    .map((c) => {
      const [dia, m] = (c.birthday ?? '').split('/').map(Number)
      return { ...c, dia, m }
    })
    .filter((c) => c.m === mes && c.dia >= 1 && c.dia <= 31)
  if (doMes.length === 0) return []

  // A trava de envio da US-07: só quem está em message_recipients pode receber.
  const { data: autorizadas, error: erroAutorizadas } = await supabase
    .from('message_recipients')
    .select('client_id')
    .in('client_id', doMes.map((c) => c.id))
  if (erroAutorizadas) throw new Error(erroAutorizadas.message)
  const podem = new Set((autorizadas ?? []).map((a) => a.client_id as string))

  return doMes
    .map((c) => ({
      id: c.id,
      name: c.name,
      dia: c.dia,
      phone: c.phone ?? '',
      email: c.email ?? '',
      autorizou: podem.has(c.id),
    }))
    .sort((a, b) => a.dia - b.dia || a.name.localeCompare(b.name, 'pt-BR'))
}

export async function getTopCustomerInsight(): Promise<{
  id: string
  name: string
  purchase_count: number
  total_spent: number
} | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('clients_view')
    .select('id, name, purchase_count, total_spent')
    .gt('purchase_count', 0)
    .order('purchase_count', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data ?? null
}

// ── HISTÓRICO UNIFICADO NA FICHA (US-10) ──
// Compras e doações da pessoa numa lista só, da mais recente para a mais antiga.
// Cada consulta passa pelas políticas de quem está logado: a coordenação vê
// tudo; o balcão, só o que foi lançado hoje (matriz de permissões).
const LIMITE_DO_HISTORICO = 500

const reais = (n: number) =>
  'R$ ' + Number(n).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const dataEHora = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' })

const texto = (v: unknown) => (v === null || v === undefined || v === '' ? 'não informado' : String(v))

const ROTULO_PAGAMENTO: Record<string, string> = { pix: 'PIX', credit: 'Crédito', debit: 'Débito', cash: 'Dinheiro' }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function getClientHistory(clientId: string): Promise<ItemDoHistorico[]> {
  const supabase = await createClient()
  const [vendas, dinheiro, itens, tampinhas] = await Promise.all([
    supabase.from('sales_view').select('id, sold_at, category, amount').eq('client_id', clientId).limit(LIMITE_DO_HISTORICO),
    supabase.from('donations_cash_view').select('id, donated_at, amount, event_name, campaign_name').eq('client_id', clientId).limit(LIMITE_DO_HISTORICO),
    supabase.from('donations_items').select('id, donated_at, category_name, quantity, weight_kg').eq('client_id', clientId).limit(LIMITE_DO_HISTORICO),
    supabase.from('donations_caps').select('id, donated_at, quantity, weight_kg').eq('client_id', clientId).limit(LIMITE_DO_HISTORICO),
  ])
  const erro = vendas.error ?? dinheiro.error ?? itens.error ?? tampinhas.error
  if (erro) throw new Error(erro.message)

  const linhas: ItemDoHistorico[] = [
    ...(vendas.data ?? []).map((v) => ({
      id: v.id,
      tipo: 'venda' as const,
      data: v.sold_at,
      descricao: v.category || 'Compra no brechó',
      valor: Number(v.amount),
    })),
    ...(dinheiro.data ?? []).map((d) => ({
      id: d.id,
      tipo: 'dinheiro' as const,
      data: d.donated_at,
      descricao: d.event_name
        ? `Doação em dinheiro · ${d.event_name}`
        : d.campaign_name
          ? `Doação em dinheiro · campanha ${d.campaign_name}`
          : 'Doação em dinheiro',
      valor: Number(d.amount),
    })),
    ...(itens.data ?? []).map((d) => ({
      id: d.id,
      tipo: 'itens' as const,
      data: d.donated_at,
      descricao: d.quantity
        ? `${d.quantity}× ${d.category_name}`
        : d.weight_kg
          ? `${Number(d.weight_kg).toLocaleString('pt-BR')} kg de ${d.category_name}`
          : d.category_name || 'Doação de itens',      
      valor: null,
    })),
    ...(tampinhas.data ?? []).map((d) => ({
      id: d.id,
      tipo: 'tampinhas' as const,
      data: d.donated_at,
      descricao: d.weight_kg ? `${Number(d.weight_kg).toLocaleString('pt-BR')} kg de tampinhas` : `${d.quantity} tampinhas`,
      valor: null,
    })),
  ]
  return linhas.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
}

// O registro como foi gravado, para o painel "Registro original" da ficha.
// Devolve null quando o registro não existe ou o perfil de quem está logado não
// o enxerga (o balcão só lê o que foi lançado hoje).
export async function getRegistroOriginal(tipo: TipoDeContribuicao, id: string): Promise<RegistroOriginal | null> {
  if (!UUID.test(id)) return null
  const supabase = await createClient()

  if (tipo === 'venda') {
    const [venda, pecas] = await Promise.all([
      supabase.from('sales_view').select(COLUNAS_VENDA).eq('id', id).maybeSingle(),
      supabase.from('sale_items').select('category_name, amount').eq('sale_id', id).order('created_at'),
    ])
    if (venda.error) throw new Error(venda.error.message)
    if (pecas.error) throw new Error(pecas.error.message)
    const v = venda.data as Sale | null
    if (!v) return null
    const pagamento = [ROTULO_PAGAMENTO[v.payment_method] ?? v.payment_method, v.bank, v.installments ? `${v.installments}x` : '']
      .filter(Boolean)
      .join(' · ')
    return {
      tipo,
      titulo: 'Compra no brechó',
      campos: [
        { rotulo: 'Data', valor: dataEHora(v.sold_at) },
        { rotulo: 'Nome na venda', valor: texto(v.customer_name) },
        ...(pecas.data ?? []).map((p, i) => ({
          rotulo: `Peça ${i + 1}`,
          valor: `${texto(p.category_name)} · ${reais(p.amount)}`,
        })),
        { rotulo: 'Total', valor: reais(v.amount) },
        { rotulo: 'Pagamento', valor: texto(pagamento) },
        { rotulo: 'Valor líquido', valor: v.net_amount != null ? reais(v.net_amount) : 'não informado' },
        { rotulo: 'Recebimento conferido', valor: v.confirmed ? 'sim' : 'não' },
      ],
    }
  }

  if (tipo === 'dinheiro') {
    const { data, error } = await supabase.from('donations_cash_view').select(COLUNAS_DOACAO_DINHEIRO).eq('id', id).maybeSingle()
    if (error) throw new Error(error.message)
    const d = data as DonationCash | null
    if (!d) return null
    return {
      tipo,
      titulo: 'Doação em dinheiro',
      campos: [
        { rotulo: 'Data', valor: dataEHora(d.donated_at) },
        { rotulo: 'Nome na doação', valor: texto(d.donor_name) },
        { rotulo: 'Valor', valor: reais(d.amount) },
        { rotulo: 'Origem', valor: texto(d.origin) },
        { rotulo: 'Frequência', valor: d.frequency === 'monthly' ? 'mensal' : 'pontual' },
        { rotulo: 'Evento', valor: texto(d.event_name) },
        { rotulo: 'Campanha', valor: texto(d.campaign_name) },
        { rotulo: 'Observações', valor: texto(d.notes) },
      ],
    }
  }

  if (tipo === 'itens') {
    const { data: d, error } = await supabase
      .from('donations_items')
      .select('donated_at, donor_name, category_name, quantity, weight_kg, condition, destination, notes')
      .eq('id', id)
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!d) return null
    return {
      tipo,
      titulo: 'Doação de itens',
      campos: [
        { rotulo: 'Data', valor: dataEHora(d.donated_at) },
        { rotulo: 'Nome na doação', valor: texto(d.donor_name) },
        { rotulo: 'Categoria', valor: texto(d.category_name) },
        { rotulo: 'Quantidade', valor: texto(d.quantity) },
        { rotulo: 'Peso (kg)', valor: d.weight_kg ? Number(d.weight_kg).toLocaleString('pt-BR') : 'não informado' },
        { rotulo: 'Estado', valor: d.condition === 'good' ? 'bom' : d.condition === 'needs_review' ? 'revisar' : 'não informado' },
        { rotulo: 'Destino', valor: d.destination === 'stock' ? 'estoque' : d.destination === 'direct' ? 'direto' : 'não informado' },
        { rotulo: 'Observações', valor: texto(d.notes) },
      ],
    }
  }

  if (tipo === 'tampinhas') {
    const { data: d, error } = await supabase
      .from('donations_caps')
      .select('donated_at, donor_name, quantity, weight_kg, notes')
      .eq('id', id)
      .maybeSingle()
    if (error) throw new Error(error.message)
    if (!d) return null
    return {
      tipo,
      titulo: 'Doação de tampinhas',
      campos: [
        { rotulo: 'Data', valor: dataEHora(d.donated_at) },
        { rotulo: 'Nome na doação', valor: texto(d.donor_name) },
        { rotulo: 'Quantidade', valor: texto(d.quantity) },
        { rotulo: 'Peso (kg)', valor: d.weight_kg ? Number(d.weight_kg).toLocaleString('pt-BR') : 'não informado' },
        { rotulo: 'Observações', valor: texto(d.notes) },
      ],
    }
  }

  // Tipo fora da lista (o valor chega do navegador): nada a mostrar.
  return null
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
      .select('sold_at, amount, net_amount, payment_method, customer_name, client_id')
      .gte('sold_at', start)
      .lt('sold_at', end),
    supabase.from('clients_view').select('id', { count: 'exact', head: true }),
    supabase.from('clients_view')
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
      client_id:     data.client_id ?? null,
      donor_name:    data.donor_name,
      donor_phone:   data.donor_phone,
      amount:        data.amount,
      origin_id:     origin.id,
      frequency:     data.frequency,
      donated_at:    data.donated_at,
      notes:         data.notes ?? null,
      registered_by: data.registered_by ?? null,
      event_id:      data.event_id ?? null,
      campaign_id:   data.campaign_id ?? null,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  const { data: full, error: viewError } = await supabase
    .from('donations_cash_view')
    .select(COLUNAS_DOACAO_DINHEIRO)
    .eq('id', inserted.id)
    .single()

  if (viewError) throw new Error(viewError.message)
  return full as DonationCash
}

// ── EVENTOS (US-12) ──
// A equipe lê os eventos para escolher na doação; só a coordenação cadastra e altera.

export async function getEventosAtivos(): Promise<Evento[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events')
    .select('id, name, event_date, active')
    .eq('active', true)
    .order('event_date', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as Evento[]
}

export async function getEventosComTotal(): Promise<EventoComTotal[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('events_totals')
    .select('id, name, event_date, active, donation_count, total')
    .order('event_date', { ascending: false })
  if (error) throw new Error(error.message)
  return ((data ?? []) as EventoComTotal[]).map((e) => ({ ...e, total: Number(e.total) }))
}

export async function addEvento(name: string, eventDate: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('events').insert({ name, event_date: eventDate })
  if (error) throw new Error(error.message)
}

export async function setEventoAtivo(id: string, active: boolean): Promise<void> {
  const supabase = await createClient()
  // Com a política barrando, o update não dá erro: só não altera nada.
  const { data, error } = await supabase.from('events').update({ active }).eq('id', id).select('id')
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) throw new Error('Evento não encontrado ou sem permissão para alterar.')
}

// ── CAMPANHAS (US-13) ──
// A equipe lê as campanhas abertas para escolher na doação; só a coordenação
// cadastra e encerra.

export async function getCampanhasAbertas(): Promise<Campanha[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('campaigns')
    .select('id, name, starts_on, ends_on, estimated_cost, closed_at')
    .is('closed_at', null)
    .order('starts_on', { ascending: false })
  if (error) throw new Error(error.message)
  return ((data ?? []) as Campanha[]).map((c) => ({ ...c, estimated_cost: Number(c.estimated_cost) }))
}

export async function getCampanhasComTotal(): Promise<CampanhaComTotal[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('campaigns_totals')
    .select('id, name, starts_on, ends_on, estimated_cost, closed_at, donation_count, raised, difference')
    .order('starts_on', { ascending: false })
  if (error) throw new Error(error.message)
  return ((data ?? []) as CampanhaComTotal[]).map((c) => ({
    ...c,
    estimated_cost: Number(c.estimated_cost),
    raised: Number(c.raised),
    difference: Number(c.difference),
  }))
}

export async function addCampanha(campos: { name: string; starts_on: string; ends_on: string | null; estimated_cost: number }): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('campaigns').insert(campos)
  if (error) throw new Error(error.message)
}

// Encerrar marca a data; reabrir limpa. As doações e o total continuam valendo.
export async function setCampanhaEncerrada(id: string, encerrada: boolean): Promise<void> {
  const supabase = await createClient()
  // Com a política barrando, o update não dá erro: só não altera nada.
  const { data, error } = await supabase
    .from('campaigns')
    .update({ closed_at: encerrada ? new Date().toISOString() : null })
    .eq('id', id)
    .select('id')
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) throw new Error('Campanha não encontrada ou sem permissão para alterar.')
}

// ── DOAÇÕES DE ITENS (roupas/acessórios) ──

export async function getDonationItems(): Promise<DonationItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('donations_items')
    .select('id, donated_at, donor_name, donor_phone, category_name, quantity, weight_kg, condition, destination, notes, created_at')
    .order('donated_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as DonationItem[]
}

// Categorias aceitas em doação (type 'donation' ou 'both')
export async function getDonationCategories(): Promise<{ id: string; name: string }[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('item_categories')
    .select('id, name')
    .eq('active', true)
    .in('type', ['donation', 'both'])
    .order('name')
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function addDonationItem(data: {
  client_id?: string | null
  donor_name: string
  donor_phone: string
  category_id: string | null
  category_name: string
   quantity: number | null
  weight_kg: number | null
  condition: 'good' | 'needs_review' | null
  destination: 'stock' | 'direct' | null
  notes?: string
  donated_at: string
  registered_by?: string | null
}): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('donations_items').insert({
    client_id:     data.client_id ?? null,
    donor_name:    data.donor_name,
    donor_phone:   data.donor_phone,
    category_id:   data.category_id,
    category_name: data.category_name,
    quantity:      data.quantity,
    weight_kg:     data.weight_kg,
    condition:     data.condition,
    destination:   data.destination,
    notes:         data.notes ?? null,
    donated_at:    data.donated_at,
    registered_by: data.registered_by ?? null,
  })
  if (error) throw new Error(error.message)
}

// ── CATEGORIAS DE ITEM (US-11) ──
// A coordenação cadastra e altera; para o balcão, o banco recusa (política "admin write").

export async function getAllItemCategories(): Promise<CategoriaDeItem[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('item_categories').select('id, name, type, active').order('name')
  if (error) throw new Error(error.message)
  return (data ?? []) as CategoriaDeItem[]
}

// Uma categoria ativa de doação, para gravar o nome que está no banco.
export async function getDonationCategory(id: string): Promise<{ id: string; name: string } | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('item_categories')
    .select('id, name')
    .eq('id', id)
    .eq('active', true)
    .in('type', ['donation', 'both'])
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

export async function addItemCategory(name: string, type: CategoriaDeItem['type']): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('item_categories').insert({ name, type })
  if (error) throw new Error(error.message)
}

export async function updateItemCategory(
  id: string,
  campos: { name: string; type: CategoriaDeItem['type']; active: boolean }
): Promise<void> {
  const supabase = await createClient()
  // Com a política barrando, o update não dá erro: só não altera nada. Por isso
  // a linha alterada volta e é conferida.
  const { data, error } = await supabase.from('item_categories').update(campos).eq('id', id).select('id')
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) throw new Error('Categoria não encontrada ou sem permissão para alterar.')
}

// ── DOAÇÕES DE TAMPINHAS ──

export async function getDonationCaps(): Promise<DonationCaps[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('donations_caps')
    .select('id, donated_at, donor_name, donor_phone, quantity, weight_kg, notes, created_at')
    .order('donated_at', { ascending: false })
  if (error) throw new Error(error.message)
  return (data ?? []) as DonationCaps[]
}

export async function addDonationCaps(data: {
  client_id?: string | null
  donor_name: string
  donor_phone: string
  quantity: number | null
  weight_kg: number | null
  notes?: string
  donated_at: string
  registered_by?: string | null
}): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('donations_caps').insert({
    client_id:     data.client_id ?? null,
    donor_name:    data.donor_name,
    donor_phone:   data.donor_phone,
    quantity:      data.quantity,
    weight_kg:     data.weight_kg,
    notes:         data.notes ?? null,
    donated_at:    data.donated_at,
    registered_by: data.registered_by ?? null,
  })
  if (error) throw new Error(error.message)
}

// ── AUTORIZAÇÃO DE MENSAGENS (US-07) ──
// Situação atual: a decisão mais recente da pessoa. null = nunca foi perguntada.
export async function getMessageConsent(
  clientId: string
): Promise<{ authorized: boolean; term_version: string; recorded_at: string } | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('message_consent_status')
    .select('authorized, term_version, recorded_at')
    .eq('client_id', clientId)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data
}

// Cada decisão é uma linha nova. Data e autoria são preenchidas pelo banco.
export async function addMessageConsent(clientId: string, authorized: boolean, termVersion: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('message_consents')
    .insert({ client_id: clientId, authorized, term_version: termVersion })
  if (error) throw new Error(error.message)
}

// ── DOAÇÕES SEM FICHA (US-14) ──
// Doações antigas, ou marcadas como sem ficha, que a coordenação pode ligar a uma
// pessoa depois. O balcão só enxerga as doações de hoje e não altera doação (US-23).
const LIMITE_SEM_FICHA = 200

export async function getDoacoesSemFicha(): Promise<DoacaoSemFicha[]> {
  const supabase = await createClient()
  const [dinheiro, itens] = await Promise.all([
    supabase
      .from('donations_cash')
      .select('id, donated_at, donor_name, amount')
      .is('client_id', null)
      .order('donated_at', { ascending: false })
      .limit(LIMITE_SEM_FICHA),
    supabase
      .from('donations_items')
      .select('id, donated_at, donor_name, category_name, quantity, weight_kg')
      .is('client_id', null)
      .order('donated_at', { ascending: false })
      .limit(LIMITE_SEM_FICHA),
  ])
  const erro = dinheiro.error ?? itens.error
  if (erro) throw new Error(erro.message)

  const linhas: DoacaoSemFicha[] = [
    ...(dinheiro.data ?? []).map((d) => ({
      id: d.id,
      tipo: 'dinheiro' as const,
      data: d.donated_at,
      nome: d.donor_name,
      descricao: `R$ ${Number(d.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    })),
    ...(itens.data ?? []).map((d) => ({
      id: d.id,
      tipo: 'itens' as const,
      data: d.donated_at,
      nome: d.donor_name,
      descricao: d.quantity
        ? `${d.quantity}× ${d.category_name}`
        : d.weight_kg
          ? `${Number(d.weight_kg).toLocaleString('pt-BR')} kg de ${d.category_name}`
          : d.category_name || 'Doação de itens',
    })),
  ]
  return linhas.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
}

// Liga a doação à ficha. Só vale para doação ainda sem ficha. Com a política
// barrando (balcão), o update não dá erro: só não altera nada. Por isso a linha
// alterada volta e é conferida.
export async function linkDonationToClient(tipo: DoacaoSemFicha['tipo'], id: string, clientId: string): Promise<void> {
  if (!UUID.test(id) || !UUID.test(clientId)) throw new Error('Doação ou pessoa inválida.')
  const supabase = await createClient()
  const tabela = tipo === 'dinheiro' ? 'donations_cash' : 'donations_items'
  const { data, error } = await supabase
    .from(tabela)
    .update({ client_id: clientId })
    .eq('id', id)
    .is('client_id', null)
    .select('id')
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) throw new Error('A doação não foi encontrada, já tem ficha ou você não tem permissão.')
}
