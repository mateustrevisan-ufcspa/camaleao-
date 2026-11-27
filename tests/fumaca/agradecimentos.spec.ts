// US-21a · A coordenação aprova o termo, agradece pelo WhatsApp e o botão some.
import { test, expect } from '@playwright/test'
import { entrar } from './apoio'
import { CAIXA, COORDENACAO, entrarNaApi, entrarPelaTela } from '../acesso/apoio'
import { TERMO_MENSAGENS } from '../../lib/termo-mensagens'
import { semanaDe } from '../../lib/periodos'

// US-41 · A aba mensal abre no mês anterior e a semanal na semana anterior; as
// pessoas de teste contribuem hoje, então os testes abrem o período atual.
const hoje = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date())
const mensalDeAgora = () => `/clientes/agradecimentos?tipo=mensal&periodo=${hoje().slice(0, 7)}`
const semanalDeAgora = () => `/clientes/agradecimentos?tipo=semanal&periodo=${semanaDe(hoje())}`

test('agradecer pelo WhatsApp registra e abre a mensagem pronta', async ({ page }) => {
  // Preparo pela API: uma pessoa com doação neste mês e autorização registrada.
  const { api } = await entrarNaApi(COORDENACAO)
  const nome = `Teste Agradecimento ${Date.now()}`
  const telefone = `(51) 9${String(Date.now()).slice(-4)}-${String(Date.now()).slice(-8, -4)}`
  const { data: pessoa } = await api.from('clients').insert({ name: nome, phone: telefone }).select('id').single()
  const { data: origem } = await api.from('cash_origins').select('id').eq('name', 'PIX').single()
  await api.from('donations_cash').insert({ client_id: pessoa!.id, donor_name: nome, amount: 100, origin_id: origem!.id, frequency: 'one_time', donated_at: new Date().toISOString() })
  await api.from('message_consents').insert({ client_id: pessoa!.id, authorized: true, term_version: TERMO_MENSAGENS.versao })

  await entrar(page)
  await page.goto(mensalDeAgora())
  const aprovacao = page.getByTestId('aprovacao-do-termo')
  if (await aprovacao.isVisible()) {
    // Hoje em Brasília: a aprovação recusa data depois de hoje, e à noite o dia em UTC já virou.
    await aprovacao.getByLabel('Aprovado em').fill(hoje())
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

// US-39 · O caixa agradece: a lista vem sem contato, e o número sai do banco no clique.
test('o caixa agradece pelo WhatsApp', async ({ page }) => {
  const { api } = await entrarNaApi(COORDENACAO)
  await api.from('aprovacoes_do_termo').upsert({ versao: TERMO_MENSAGENS.versao, aprovado_em: '2026-11-01' }, { ignoreDuplicates: true })
  const nome = `Teste Caixa Agradece ${Date.now()}`
  const { data: pessoa } = await api.from('clients').insert({ name: nome, phone: '(51) 99811-2233' }).select('id').single()
  const { data: origem } = await api.from('cash_origins').select('id').eq('name', 'PIX').single()
  await api.from('donations_cash').insert({ client_id: pessoa!.id, donor_name: nome, amount: 60, origin_id: origem!.id, frequency: 'one_time', donated_at: new Date().toISOString() })
  await api.from('message_consents').insert({ client_id: pessoa!.id, authorized: true, term_version: TERMO_MENSAGENS.versao })

  await entrarPelaTela(page, CAIXA)
  // Espera o login terminar (o caixa começa no brechó), como nos testes de acesso.
  await page.waitForURL(/\/brecho$/)
  await page.goto(mensalDeAgora())
  await expect(page.getByTestId('aprovacao-do-termo')).toHaveCount(0)
  const linha = page.getByTestId('pessoa-para-agradecer').filter({ hasText: nome })
  const janela = page.waitForEvent('popup')
  await linha.getByRole('button', { name: 'WhatsApp' }).click()
  const popup = await janela
  await popup.waitForURL(/wa\.me|whatsapp\.com/, { waitUntil: 'commit' })
  // O wa.me redireciona para api.whatsapp.com/send/?phone=...: o número pode estar no caminho ou nos parâmetros.
  expect(popup.url()).toContain('5551998112233')
  await popup.close()
  await page.reload()
  await expect(linha.getByTestId('situacao-do-agradecimento')).toContainText('Agradecida em')
})

// US-41 · Semanal: quem trouxe item na semana, mesmo com a triagem pendente; o mensal não mostra quem só doou item.
test('agradecimento semanal para quem trouxe item', async ({ page }) => {
  const { api } = await entrarNaApi(COORDENACAO)
  await api.from('aprovacoes_do_termo').upsert({ versao: TERMO_MENSAGENS.versao, aprovado_em: '2026-11-01' }, { ignoreDuplicates: true })
  const marca = Date.now()
  const comPecas = `Teste Semanal ${marca}`
  const pendente = `Teste Semanal Pendente ${marca}`
  const telefone = `(51) 9${String(marca).slice(-4)}-${String(marca).slice(-8, -4)}`
  const { data: a } = await api.from('clients').insert({ name: comPecas, phone: telefone }).select('id').single()
  // Telefone sem "3344": a busca da Roberta Lima (busca-de-pessoa e venda-em-poucos-toques) procura por esses dígitos.
  const { data: b } = await api.from('clients').insert({ name: pendente, phone: '(51) 99761-2058' }).select('id').single()
  for (const id of [a!.id, b!.id]) {
    await api.from('message_consents').insert({ client_id: id, authorized: true, term_version: TERMO_MENSAGENS.versao })
  }
  const agora = new Date().toISOString()
  await api.from('donations_items').insert({ client_id: a!.id, donor_name: comPecas, category_name: 'roupa', quantity: 3, donated_at: agora })
  // Sem contagem: triagem pendente, pecas 0, e a pessoa entra do mesmo jeito.
  await api.from('donations_items').insert({ client_id: b!.id, donor_name: pendente, category_name: 'roupa', donated_at: agora })

  await entrar(page)
  await page.goto(semanalDeAgora())
  const linha = page.getByTestId('pessoa-para-agradecer').filter({ hasText: comPecas })
  await expect(linha).toContainText('3 peças')
  await expect(page.getByTestId('pessoa-para-agradecer').filter({ hasText: pendente })).toHaveCount(1)

  const janela = page.waitForEvent('popup')
  await linha.getByRole('button', { name: 'WhatsApp' }).click()
  const popup = await janela
  await popup.waitForURL(/wa\.me|whatsapp\.com/, { waitUntil: 'commit' })
  expect(new URL(popup.url()).searchParams.get('text')).toContain('nesta semana')
  await popup.close()
  await page.reload()
  await expect(linha.getByTestId('situacao-do-agradecimento')).toContainText('Agradecida em')

  // Na aba mensal do mês atual, quem só doou item não aparece.
  await page.goto(mensalDeAgora())
  await expect(page.getByTestId('pessoa-para-agradecer').filter({ hasText: comPecas })).toHaveCount(0)
})
