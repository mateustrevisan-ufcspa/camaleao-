// US-36 · Quem autorizou pela 2026-10 vê o aviso na ficha e registra pelo termo atual.
import { test, expect } from '@playwright/test'
import { entrar } from './apoio'
import { COORDENACAO, entrarNaApi } from '../acesso/apoio'
import { TERMO_MENSAGENS } from '../../lib/termo-mensagens'

test('autorização antiga: aviso e novo registro pela versão atual', async ({ page }) => {
  const { api } = await entrarNaApi(COORDENACAO)
  const nome = `Teste Termo ${Date.now()}`
  const { data: pessoa } = await api.from('clients').insert({ name: nome }).select('id').single()
  await api.from('message_consents').insert({ client_id: pessoa!.id, authorized: true, term_version: '2026-10' })

  await entrar(page)
  await page.goto('/clientes')
  await page.getByPlaceholder('Buscar cliente...').fill(nome)
  await page.getByText(nome).first().click()
  await expect(page.getByRole('heading', { name: nome })).toBeVisible()

  const cartao = page.getByTestId('autorizacao-de-mensagens')
  await expect(cartao.getByTestId('situacao-da-autorizacao')).toContainText('não vale mais')
  await cartao.getByRole('button', { name: 'Ler o termo atual e registrar' }).click()
  await expect(cartao).toContainText(`termo ${TERMO_MENSAGENS.versao}`)
  await expect(cartao).toContainText('promoções')
  await cartao.getByRole('button', { name: 'A pessoa autorizou' }).click()
  await expect(cartao.getByTestId('situacao-da-autorizacao')).toContainText(`(termo ${TERMO_MENSAGENS.versao})`)
})
