
// SEC-03 · Testes automatizados de controle de acesso.
// Entra como caixa (cashier) com a chave anônima, nunca com a chave de serviço,
// e confere o que o banco e a tela permitem ou recusam.
// Regras: docs/seguranca/matriz-de-permissoes.md (US-23).
//
// Com RLS, uma operação proibida quase nunca devolve erro: o select volta vazio e
// update/delete afetam 0 linhas. Por isso a recusa é "erro OU nenhuma linha afetada",
// e os testes de recusa conferem também que o dado continua como estava.
import { test, expect, type Page } from '@playwright/test'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
 
const URL_API = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const CHAVE_ANONIMA = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
const SENHA = process.env.FUMACA_SENHA ?? 'camaleao-local'
 
const CAIXA = 'caixa@camaleao.local'
const DESATIVADA = 'desativada@camaleao.local'
// Coordenação: só prepara e limpa os dados do teste (mesmo usuário dos testes de fumaça).
const COORDENACAO = process.env.FUMACA_EMAIL ?? 'voluntaria@camaleao.local'
 
// Tudo que o teste cria leva esta marca, para a limpeza achar e apagar.
const MARCA = 'TESTE SEC-03'
 
const recusado = (r: { error: unknown; data: unknown }) =>
  r.error !== null || (Array.isArray(r.data) && r.data.length === 0)
 
async function entrarNaApi(email: string): Promise<{ api: SupabaseClient; id: string }> {
  const api = createClient(URL_API, CHAVE_ANONIMA, { auth: { persistSession: false } })
  const { data, error } = await api.auth.signInWithPassword({ email, password: SENHA })
  if (error || !data.user) {
    throw new Error(`Login na API falhou para ${email}: ${error?.message}`)
  }
  return { api, id: data.user.id }
}
 
// Mesmos seletores do login dos testes de fumaça (tests/fumaca/apoio.ts).
async function entrarPelaTela(page: Page, email: string) {
  await page.goto('/login')
  await expect(page.getByRole('heading', { name: 'Bem-vindo de volta' })).toBeVisible()
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill(SENHA)
  await page.getByRole('button', { name: 'Entrar' }).click()
}
 
let coordenacao: SupabaseClient
let vendaAntigaId: string
 
test.beforeAll(async () => {
  if (!URL_API || !CHAVE_ANONIMA) {
    throw new Error(
      'Faltam NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY. Rode npm run env:local com o banco ligado.',
    )
  }
  const { api, id } = await entrarNaApi(COORDENACAO)
  coordenacao = api
 
  // Uma venda de 3 dias atrás: o caixa só pode ver o que foi lançado hoje.
  const tresDiasAtras = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  const venda = await coordenacao
    .from('sales')
    .insert({ customer_name: MARCA, registered_by: id, sold_at: tresDiasAtras, created_at: tresDiasAtras })
    .select('id')
    .single()
  if (venda.error) throw new Error(`Não criou a venda antiga: ${venda.error.message}`)
  vendaAntigaId = venda.data.id
})
 
test.afterAll(async () => {
  if (!coordenacao) return
  await coordenacao.from('sales').delete().eq('customer_name', MARCA) // itens saem em cascata
  await coordenacao.from('donations_cash').delete().eq('donor_name', MARCA)
  await coordenacao.from('payment_methods').delete().eq('name', MARCA)
})
 
test.describe('caixa: operações proibidas', () => {
  test('não lê dados de relatório (vendas de dias anteriores)', async () => {
    // Controle: a coordenação enxerga a venda. Sem isso, o teste não provaria nada.
    const daCoordenacao = await coordenacao.from('sales').select('id').eq('id', vendaAntigaId)
    expect(daCoordenacao.data).toHaveLength(1)
 
    const { api } = await entrarNaApi(CAIXA)
    expect(recusado(await api.from('sales').select('id').eq('id', vendaAntigaId))).toBe(true)
    expect(recusado(await api.from('sales_view').select('id').eq('id', vendaAntigaId))).toBe(true)
  })
 
  test('não abre a tela de relatórios', async ({ page }) => {
    await entrarPelaTela(page, CAIXA)
    await page.waitForURL(/\/brecho$/)
    await page.goto('/relatorios')
    await expect(page).toHaveURL(/\/brecho\?aviso=restrito/)
  })
 
  test('não altera configuração', async () => {
    const { api } = await entrarNaApi(CAIXA)
    const { data: categorias } = await api.from('item_categories').select('id, name').limit(1)
    const categoria = categorias![0]
    expect(categoria).toBeTruthy()
 
    const alteracao = await api
      .from('item_categories')
      .update({ name: `${MARCA} alterada` })
      .eq('id', categoria.id)
      .select()
    expect(recusado(alteracao)).toBe(true)
 
    // O nome continua o mesmo.
    const depois = await api.from('item_categories').select('name').eq('id', categoria.id).single()
    expect(depois.data?.name).toBe(categoria.name)
 
    // Criar forma de pagamento também é configuração.
    const nova = await api.from('payment_methods').insert({ name: MARCA, label: MARCA }).select()
    expect(recusado(nova)).toBe(true)
  })
 
  test('não apaga venda', async () => {
    const { api, id } = await entrarNaApi(CAIXA)
    const venda = await api
      .from('sales')
      .insert({ customer_name: MARCA, registered_by: id })
      .select('id')
      .single()
    expect(venda.error).toBeNull()
 
    const apagar = await api.from('sales').delete().eq('id', venda.data?.id).select()
    expect(recusado(apagar)).toBe(true)
 
    // A venda continua lá.
    const depois = await api.from('sales').select('id').eq('id', venda.data?.id)
    expect(depois.data).toHaveLength(1)
  })
})
 
test.describe('caixa: operações permitidas', () => {
  test('registra venda com item', async () => {
    const { api, id } = await entrarNaApi(CAIXA)
    const { data: categorias } = await api
      .from('item_categories')
      .select('id, name')
      .in('type', ['sale', 'both'])
      .limit(1)
    const categoria = categorias![0]
    expect(categoria).toBeTruthy()
 
    const venda = await api
      .from('sales')
      .insert({ customer_name: MARCA, registered_by: id, net_amount: 12.34 })
      .select('id')
      .single()
    expect(venda.error).toBeNull()
 
    const item = await api
      .from('sale_items')
      .insert({
        sale_id: venda.data?.id,
        category_id: categoria.id,
        category_name: categoria.name,
        amount: 12.34,
      })
      .select('id')
    expect(item.error).toBeNull()
    expect(item.data).toHaveLength(1)
  })
 
  test('registra doação em dinheiro', async () => {
    const { api, id } = await entrarNaApi(CAIXA)
    const doacao = await api
      .from('donations_cash')
      .insert({
        donor_name: MARCA,
        amount: 10,
        frequency: 'one_time',
        donated_at: new Date().toISOString(),
        registered_by: id,
      })
      .select('id')
    expect(doacao.error).toBeNull()
    expect(doacao.data).toHaveLength(1)
  })
})
 
test.describe('usuária desativada', () => {
  test('o login pela tela é recusado', async ({ page }) => {
    await entrarPelaTela(page, DESATIVADA)
    await expect(page.getByText('Seu acesso está desativado')).toBeVisible()
    await expect(page).toHaveURL(/\/login/)
  })
 
  test('mesmo se a sessão abrir, o banco não lê nem grava nada', async () => {
    const api = createClient(URL_API, CHAVE_ANONIMA, { auth: { persistSession: false } })
    const { error } = await api.auth.signInWithPassword({ email: DESATIVADA, password: SENHA })
    if (error) return // recusada já na origem: nada mais a conferir
 
    // Controle: a coordenação lê as categorias, que vêm do seed.
    const daCoordenacao = await coordenacao.from('item_categories').select('id').limit(1)
    expect(daCoordenacao.data).toHaveLength(1)
 
    expect(recusado(await api.from('item_categories').select('id').limit(1))).toBe(true)
    expect(recusado(await api.from('sales').insert({ customer_name: MARCA }).select('id'))).toBe(true)
  })
})
 