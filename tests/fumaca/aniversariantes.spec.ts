import { expect, test, type Page } from '@playwright/test'
import { entrar } from './apoio'
import { COORDENACAO, entrarNaApi } from '../acesso/apoio'
import { TERMO_MENSAGENS } from '../../lib/termo-mensagens'

// US-22 · Aniversariantes do mês.

// BUG-04: sem versão aprovada, ninguém pode receber. Aprova a versão atual no banco local
// (se já estiver aprovada, não muda nada). Hoje em Brasília: o banco recusa data depois de hoje.
async function aprovarTermoAtual() {
  const { api } = await entrarNaApi(COORDENACAO)
  const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
  await api.from('aprovacoes_do_termo').upsert({ versao: TERMO_MENSAGENS.versao, aprovado_em: hoje }, { ignoreDuplicates: true })
  return api
}

// Cadastra uma pessoa com aniversário em 31/12 e telefone com DDD.
async function cadastrar(page: Page, nome: string, autoriza: boolean) {
  await page.goto('/clientes')
  await page.getByRole('button', { name: 'Novo cliente' }).click()
  await page.locator('input[name="name"]').fill(nome)
  await page.locator('input[name="phone"]').fill('(51) 99700-2233')
  await page.locator('input[name="birthday"]').fill('3112')
  if (autoriza) await page.locator('input[name="autoriza_mensagens"]').check()
  await page.getByRole('button', { name: 'Cadastrar', exact: true }).click()
  await expect(page.getByRole('heading', { name: nome })).toBeVisible()
}

test.describe('Fumaça: aniversariantes do mês', () => {
  test('o mês escolhido vem em ordem de dia', async ({ page }) => {
    await entrar(page)
    await page.goto('/clientes/aniversariantes?mes=6')
    await expect(page.getByRole('heading', { name: 'Aniversariantes de Junho' })).toBeVisible()

    // Do seed: Mariana 02/06, Patrícia 09/06, Antônia 12/06, Roberta 14/06 e Sônia 17/06.
    const nomes = await page.getByTestId('aniversariante').getByTestId('nome').allTextContents()
    const ordem = ['Mariana Fontes', 'Patrícia Nunes', 'Antônia Ferreira', 'Roberta Lima', 'Sônia Maria Reis'].map((n) => nomes.indexOf(n))
    expect(ordem.every((i) => i >= 0), `faltou alguém do seed em ${nomes.join(', ')}`).toBe(true)
    expect(ordem).toEqual([...ordem].sort((a, b) => a - b))
  })

  test('o envio aparece só para quem autorizou', async ({ page }) => {
    const autorizou = `TESTE US-22 sim ${Date.now()}`
    const naoAutorizou = `TESTE US-22 não ${Date.now()}`
    await aprovarTermoAtual()
    await entrar(page)
    await cadastrar(page, autorizou, true)
    await cadastrar(page, naoAutorizou, false)

    await page.goto('/clientes/aniversariantes?mes=12')

    const comEnvio = page.getByTestId('aniversariante').filter({ hasText: autorizou })
    await expect(comEnvio.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('href', /^https:\/\/wa\.me\/5551997002233\?text=Feliz/)

    const semEnvio = page.getByTestId('aniversariante').filter({ hasText: naoAutorizou })
    await expect(semEnvio.getByText('Sem autorização de mensagens')).toBeVisible()
    await expect(semEnvio.getByRole('link')).toHaveCount(0)
  })

  test('quem autorizou um termo que não vale fica sem botão', async ({ page }) => {
    const nome = `TESTE BUG-04 ${Date.now()}`
    const api = await aprovarTermoAtual()
    const { data: p } = await api.from('clients').insert({ name: nome, phone: '(51) 99700-4455', birthday: '30/12' }).select('id').single()
    await api.from('message_consents').insert({ client_id: p!.id, authorized: true, term_version: '2026-10' })

    await entrar(page)
    await page.goto('/clientes/aniversariantes?mes=12')
    const linha = page.getByTestId('aniversariante').filter({ hasText: nome })
    await expect(linha.getByText('Autorizou um termo que não vale')).toBeVisible()
    await expect(linha.getByRole('link')).toHaveCount(0)
  })
})
