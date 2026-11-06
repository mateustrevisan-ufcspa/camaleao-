// US-32 · Taxas das maquininhas, conferidas pela API e, para a venda sem taxa, pela tela.
import { test, expect } from '@playwright/test'
import type { SupabaseClient } from '@supabase/supabase-js'
import { valorUnico } from '../fumaca/apoio'
import { CAIXA, COORDENACAO, entrarNaApi, entrarPelaTela, recusado } from './apoio'

let coordenacao: SupabaseClient
let coordenacaoId: string
let caixa: SupabaseClient
let sicrediId: string
// Maquininha criada só para o teste da venda sem taxa: no seed, toda maquininha ativa tem taxa.
const MAQUININHA_SEM_TAXA = `TESTE US-32 ${Date.now()}`
let maquininhaSemTaxaId: string | null = null

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  ;({ api: coordenacao, id: coordenacaoId } = await entrarNaApi(COORDENACAO))
  ;({ api: caixa } = await entrarNaApi(CAIXA))
  const { data } = await coordenacao.from('banks').select('id').eq('name', 'SICREDI').single()
  sicrediId = data!.id
})

test.afterAll(async () => {
  if (!coordenacao) return
  // Ninguém apaga linha de taxa: a do débito na Sicredi volta a 1,05 com uma linha nova.
  await coordenacao.from('taxas_de_cartao').insert({ bank_id: sicrediId, forma: 'debit', parcelado: false, taxa: 1.05 })
  // A maquininha do teste sai dos formulários; a venda dela fica, como qualquer venda.
  if (maquininhaSemTaxaId) await coordenacao.from('banks').update({ active: false }).eq('id', maquininhaSemTaxaId)
})

test('a tabela começa com as taxas da Nílian, e o caixa lê', async () => {
  const r = await caixa.from('taxas_em_vigor').select('bank_name, forma, parcelado, bandeira, taxa')
  expect(r.error).toBeNull()
  const taxa = (banco: string, forma: string, parcelado: boolean, bandeira: string | null = null) =>
    Number(r.data!.find((t) => t.bank_name === banco && t.forma === forma && t.parcelado === parcelado && t.bandeira === bandeira)?.taxa)
  expect(taxa('SICREDI', 'credit', true)).toBe(2.07)
  expect(taxa('PagBank', 'debit', false, 'outras')).toBe(2.98)
  expect(taxa('PIX PagBank', 'pix', false)).toBe(0.19)
  // Nílian, 03/11: o Pix na Sicredi não tem taxa.
  expect(taxa('PIX SICREDI', 'pix', false)).toBe(0)
})

test('o caixa não cadastra taxa; a coordenação cadastra, e quem e quando vêm do banco', async () => {
  expect((await caixa.from('taxas_de_cartao').insert({ bank_id: sicrediId, forma: 'debit', taxa: 0.5 })).error).not.toBeNull()

  const r = await coordenacao
    .from('taxas_de_cartao')
    .insert({ bank_id: sicrediId, forma: 'debit', taxa: 1.2, definido_em: '2000-01-01T00:00:00Z' })
    .select('taxa, definido_por, definido_em')
    .single()
  expect(r.error).toBeNull()
  expect(r.data!.definido_por).toBe(coordenacaoId)
  expect(new Date(r.data!.definido_em).getFullYear()).toBeGreaterThan(2000)

  const vigente = await caixa.from('taxas_em_vigor').select('taxa').eq('bank_id', sicrediId).eq('forma', 'debit').single()
  expect(Number(vigente.data!.taxa)).toBe(1.2)
})

test('ninguém altera nem apaga uma linha, e combinação inválida é recusada', async () => {
  const { data } = await coordenacao.from('taxas_de_cartao').select('id').limit(1).single()
  expect(recusado(await coordenacao.from('taxas_de_cartao').update({ taxa: 9 }).eq('id', data!.id).select())).toBe(true)
  expect(recusado(await coordenacao.from('taxas_de_cartao').delete().eq('id', data!.id).select())).toBe(true)

  expect((await coordenacao.from('taxas_de_cartao').insert({ bank_id: sicrediId, forma: 'credit', bandeira: 'outras', taxa: 1 })).error).not.toBeNull()
  expect((await coordenacao.from('taxas_de_cartao').insert({ bank_id: sicrediId, forma: 'debit', parcelado: true, taxa: 1 })).error).not.toBeNull()
  expect((await coordenacao.from('taxas_de_cartao').insert({ bank_id: sicrediId, forma: 'debit', taxa: 25 })).error).not.toBeNull()
})

test('sem taxa cadastrada, a venda entra e o financeiro avisa', async ({ page }) => {
  const nova = await coordenacao.from('banks').insert({ name: MAQUININHA_SEM_TAXA, type: 'card' }).select('id').single()
  expect(nova.error).toBeNull()
  maquininhaSemTaxaId = nova.data!.id

  const valor = valorUnico(70)
  await entrarPelaTela(page, COORDENACAO)
  await page.waitForURL(/\/brecho$/)
  await page.goto('/brecho/nova-venda')
  await page.getByPlaceholder('Categoria (saia, blusa, vestido...)').first().fill('vestido')
  await page.getByPlaceholder('0,00').first().fill(valor.digitado)
  await page.getByRole('button', { name: 'Crédito', exact: true }).click()
  await page.getByLabel('Banco / maquininha').selectOption(MAQUININHA_SEM_TAXA)
  await page.getByRole('button', { name: 'Registrar venda' }).click()
  await expect(page).toHaveURL(/\/brecho\?venda=/)

  await page.goto('/brecho/financeiro')
  const linha = page.getByRole('row').filter({ hasText: valor.exibido })
  await expect(linha.getByTestId('liquido-da-venda')).toHaveText('taxa não cadastrada')
  await expect(page.getByText(/sem taxa cadastrada: o líquido/)).toBeVisible()
})

test('o caixa não abre a tela de taxas', async ({ page }) => {
  await entrarPelaTela(page, CAIXA)
  await page.waitForURL(/\/brecho$/)
  await page.goto('/relatorios/taxas')
  await expect(page).toHaveURL(/\/brecho\?aviso=restrito$/)
})
