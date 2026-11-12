// US-21a · A coordenação aprova o termo, agradece pelo WhatsApp e o botão some.
import { test, expect } from '@playwright/test'
import { entrar } from './apoio'
import { COORDENACAO, entrarNaApi } from '../acesso/apoio'

test('agradecer pelo WhatsApp registra e abre a mensagem pronta', async ({ page }) => {
  // Preparo pela API: uma pessoa com doação neste mês e autorização registrada.
  const { api } = await entrarNaApi(COORDENACAO)
  const nome = `Teste Agradecimento ${Date.now()}`
  const telefone = `(51) 9${String(Date.now()).slice(-4)}-${String(Date.now()).slice(-8, -4)}`
  const { data: pessoa } = await api.from('clients').insert({ name: nome, phone: telefone }).select('id').single()
  const { data: origem } = await api.from('cash_origins').select('id').eq('name', 'PIX').single()
  await api.from('donations_cash').insert({ client_id: pessoa!.id, donor_name: nome, amount: 100, origin_id: origem!.id, frequency: 'one_time', donated_at: new Date().toISOString() })
  await api.from('message_consents').insert({ client_id: pessoa!.id, authorized: true, term_version: '2026-10' })

  await entrar(page)
  await page.goto('/clientes/agradecimentos')
  const aprovacao = page.getByTestId('aprovacao-do-termo')
  if (await aprovacao.isVisible()) {
    // Hoje em Brasília: a aprovação recusa data depois de hoje, e à noite o dia em UTC já virou.
    const hoje = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
    await aprovacao.getByLabel('Aprovado em').fill(hoje)
    await aprovacao.getByRole('button', { name: 'Registrar aprovação' }).click()
    await expect(aprovacao).toHaveCount(0)
  }

  const linha = page.getByTestId('pessoa-para-agradecer').filter({ hasText: nome })
  await expect(linha).toContainText('R$ 100,00')
  const janela = page.waitForEvent('popup')
  await linha.getByRole('button', { name: 'WhatsApp' }).click()
  const popup = await janela
    // Basta o endereço mudar: a página do WhatsApp não termina de carregar fora do celular.
  await popup.waitForURL(/wa\.me|whatsapp\.com/, { waitUntil: 'commit' })
  // O WhatsApp troca os espaços por "+"; o searchParams lê o texto já com os espaços.
  expect(new URL(popup.url()).searchParams.get('text')).toContain(`Olá, ${nome.split(' ')[0]}!`)
  await popup.close()

  await page.reload()
  await expect(linha.getByTestId('situacao-do-agradecimento')).toContainText('Agradecida em')
})
