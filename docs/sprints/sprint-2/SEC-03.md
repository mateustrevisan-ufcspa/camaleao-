# SEC-03 · Testes automatizados de controle de acesso (5 SP)

> Como integrante da equipe, eu quero um teste que tente uma operação proibida com perfil de balcão e falhe se ela for permitida, para que a permissão seja verificada a cada alteração, e não presumida.

**Implementa:** Laís · **Revisa:** Alissa · **Branch:** `sec-03-testes-de-acesso` · **Depende de:** US-23 (políticas do banco e usuárias de teste por perfil)

## Critérios de aceitação

- [ ] Deve autenticar com usuário de perfil de balcão, sem usar chave de serviço
- [ ] Deve tentar ler relatório, alterar configuração e apagar registro, esperando recusa
- [ ] Deve tentar as operações permitidas ao perfil, esperando sucesso
- [ ] Deve rodar na esteira a cada Pull Request

## Decisões

- **Dois tipos de teste.** Pela **API**, falando direto com o banco como a caixa: é o que prova que a regra está no banco. Pela **tela**, para conferir o que a pessoa vê.
- **Sempre com um controle.** "A caixa recebeu zero vendas" só prova alguma coisa se a coordenação, com a mesma consulta, receber várias. Sem o controle, um banco vazio faria o teste passar.
- **Só a chave pública.** A chave de serviço ignora todas as políticas; um teste com ela passaria sempre.
- **Só no banco local.** O arquivo de apoio se recusa a rodar se o endereço não for da sua máquina.

Uma coisa que confunde no começo: quando o banco recusa um `update` ou um `delete` por causa das políticas, ele **não devolve erro**. Devolve "zero linhas afetadas", como se o registro não existisse. Por isso os testes de recusa conferem que a lista voltou vazia e que o registro continua lá.

## 1. Branch

A branch nasce da branch da US-23, porque você precisa do que o Mateus fez. Espere o aviso dele (quarta 07/10).

```bash
git fetch
git checkout us-23-permissoes-por-perfil
git pull
git checkout -b sec-03-testes-de-acesso
npm ci
npm run db:reset                  # banco local com as políticas e as quatro usuárias
npm run env:local -- --force      # .env.local apontando para o banco local
```

## 2. Um comando para cada conjunto de testes

Em `playwright.config.ts`, troque a pasta dos testes para a pasta mãe:

```ts
  testDir: './tests',
```

Em `package.json`, em `scripts`, troque a linha do `test:fumaca` e acrescente a do `test:acesso`:

```json
    "test:fumaca": "playwright test tests/fumaca",
    "test:acesso": "playwright test tests/acesso"
```

Confira que nada quebrou: `npm run test:fumaca` continua rodando os mesmos testes de antes.

## 3. `tests/acesso/apoio.ts`

Arquivo novo. Copie inteiro.

```ts
import { readFileSync } from 'node:fs'
import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { expect, test, type Page } from '@playwright/test'

// Usuárias criadas por supabase/seed.sql (só existem no Supabase local).
const SENHA = 'camaleao-local'
export const PERFIS = {
  coordenacao: { email: 'voluntaria@camaleao.local', senha: SENHA },
  voluntaria:  { email: 'balcao@camaleao.local',     senha: SENHA },
  caixa:       { email: 'caixa@camaleao.local',      senha: SENHA },
  desativada:  { email: 'desativada@camaleao.local', senha: SENHA },
}
export type Perfil = (typeof PERFIS)[keyof typeof PERFIS]

// Endereço e chave pública do banco local, lidos do .env.local.
function bancoLocal() {
  const texto = readFileSync('.env.local', 'utf8')
  const valor = (nome: string) => texto.match(new RegExp(`^${nome}=(.*)$`, 'm'))?.[1]?.trim()
  const url = valor('NEXT_PUBLIC_SUPABASE_URL')
  const chave = valor('NEXT_PUBLIC_SUPABASE_ANON_KEY')
  if (!url || !chave) throw new Error('.env.local sem URL ou chave. Rode npm run env:local.')
  if (!/^http:\/\/(127\.0\.0\.1|localhost)[:/]/.test(url)) {
    throw new Error(`Os testes de acesso só rodam no banco local, e o .env.local aponta para ${url}.`)
  }
  return { url, chave }
}

// Cliente da API já logado como o perfil pedido. Usa só a chave pública.
export async function apiComo(perfil: Perfil): Promise<SupabaseClient> {
  const { url, chave } = bancoLocal()
  const api = createClient(url, chave, { auth: { persistSession: false, autoRefreshToken: false } })
  const { error } = await api.auth.signInWithPassword({ email: perfil.email, password: perfil.senha })
  if (error) throw new Error(`Login de ${perfil.email} falhou: ${error.message}. O seed rodou? Use npm run db:reset.`)
  return api
}

// Registra uma venda pela API, do jeito que a tela faz, e devolve o id.
export async function registrarVenda(api: SupabaseClient, valor: number): Promise<string> {
  const { data: sessao } = await api.auth.getUser()
  const { data: formas } = await api.from('payment_methods').select('id').eq('name', 'cash').single()
  const { data: id, error } = await api.rpc('register_sale', {
    p_client_id:         null,
    p_customer_name:     'Teste de acesso',
    p_payment_method_id: formas?.id ?? null,
    p_bank_id:           null,
    p_installments:      null,
    p_net_amount:        valor,
    p_registered_by:     sessao.user?.id ?? null,
    p_sold_at:           new Date().toISOString(),
    p_items:             [{ category_name: 'blusa', amount: valor }],
  })
  if (error) throw new Error(`register_sale falhou: ${error.message}`)
  return id as string
}

// Login pela tela.
export async function entrarComo(page: Page, perfil: Perfil) {
  await test.step(`Login pela tela como ${perfil.email}`, async () => {
    await page.goto('/login')
    await page.locator('input[name="email"]').fill(perfil.email)
    await page.locator('input[name="password"]').fill(perfil.senha)
    await page.getByRole('button', { name: 'Entrar' }).click()
    await expect(page, `o login de ${perfil.email} deveria abrir /brecho`).toHaveURL(/\/brecho/)
  })
}
```

## 4. `tests/acesso/controle-de-acesso.spec.ts`

Arquivo novo. Os testes pela API vão prontos, para você ter o padrão. Os três da tela, no fim, são seus.

```ts
import { expect, test } from '@playwright/test'
import { PERFIS, apiComo, entrarComo, registrarVenda } from './apoio'

// As vendas de demonstração (supabase/seed-demo.sql) vão de março a junho de 2026.
const ANTES_DE = '2026-07-01'

test.describe('Acesso pela API: perfil de caixa', () => {
  test('recusa: não lê vendas de outros dias, que são a base do relatório', async () => {
    const coordenacao = await apiComo(PERFIS.coordenacao)
    const caixa = await apiComo(PERFIS.caixa)

    await test.step('Controle: a coordenação enxerga as vendas antigas', async () => {
      const { data, error } = await coordenacao.from('sales').select('id').lt('sold_at', ANTES_DE)
      expect(error, 'a consulta da coordenação deu erro').toBeNull()
      expect(data?.length ?? 0, 'sem vendas antigas no banco o teste não prova nada: rode npm run db:reset').toBeGreaterThan(0)
    })

    await test.step('A caixa faz a mesma consulta e não recebe nada', async () => {
      const { data } = await caixa.from('sales').select('id').lt('sold_at', ANTES_DE)
      expect(data ?? [], 'a caixa leu vendas de outros dias').toHaveLength(0)
    })

    await test.step('A view usada pelo relatório também não devolve nada', async () => {
      const { data } = await caixa.from('sales_view').select('id').lt('sold_at', ANTES_DE)
      expect(data ?? [], 'a caixa leu vendas antigas pela sales_view').toHaveLength(0)
    })
  })

  test('recusa: não altera configuração', async () => {
    const coordenacao = await apiComo(PERFIS.coordenacao)
    const caixa = await apiComo(PERFIS.caixa)

    await test.step('A caixa tenta desativar a categoria "blusa"', async () => {
      const { data } = await caixa.from('item_categories').update({ active: false }).eq('name', 'blusa').select()
      expect(data ?? [], 'a caixa alterou uma categoria').toHaveLength(0)
    })

    await test.step('Controle: a categoria continua ativa', async () => {
      const { data } = await coordenacao.from('item_categories').select('active').eq('name', 'blusa').single()
      expect(data?.active, 'a categoria "blusa" foi desativada').toBe(true)
    })
  })

  test('recusa: não apaga venda, nem a que ela mesma registrou', async () => {
    const caixa = await apiComo(PERFIS.caixa)
    const id = await registrarVenda(caixa, 11.11)

    await test.step('A caixa tenta apagar a venda', async () => {
      const { data } = await caixa.from('sales').delete().eq('id', id).select()
      expect(data ?? [], 'a caixa apagou uma venda').toHaveLength(0)
    })

    await test.step('A venda continua lá', async () => {
      const { data } = await caixa.from('sales').select('id').eq('id', id)
      expect(data ?? [], 'a venda sumiu').toHaveLength(1)
    })
  })

  test('sucesso: registra venda e doação', async () => {
    const caixa = await apiComo(PERFIS.caixa)

    await test.step('Registrar uma venda', async () => {
      const id = await registrarVenda(caixa, 22.22)
      expect(id, 'register_sale não devolveu o id da venda').toBeTruthy()
    })

    await test.step('Registrar uma doação em dinheiro', async () => {
      const { data: sessao } = await caixa.auth.getUser()
      const { data: origem } = await caixa.from('cash_origins').select('id').eq('name', 'PIX').single()
      const { error } = await caixa.from('donations_cash').insert({
        donor_name:    'Teste de acesso',
        amount:        33.33,
        origin_id:     origem?.id ?? null,
        frequency:     'one_time',
        donated_at:    new Date().toISOString(),
        registered_by: sessao.user?.id ?? null,
      })
      expect(error, 'a caixa não conseguiu registrar a doação').toBeNull()
    })
  })

  test('recusa: usuária desativada não lê nada', async () => {
    const desativada = await apiComo(PERFIS.desativada)
    const { data } = await desativada.from('clients').select('id')
    expect(data ?? [], 'a usuária desativada leu cadastros').toHaveLength(0)
  })
})

test.describe('Acesso pela tela', () => {
  // SUA VEZ. Três testes, no mesmo estilo de tests/fumaca/fluxos-criticos.spec.ts:
  // um test.step por passo e uma mensagem em cada expect dizendo o que deu errado.

  test('caixa: o menu não mostra Relatórios nem Financeiro', async ({ page }) => {
    await entrarComo(page, PERFIS.caixa)
    // 1. Espere o menu carregar: o link "Nova venda" tem de estar visível.
    // 2. Confira que não existe link "Relatórios" nem link "Financeiro".
    //    Dica: page.getByRole('link', { name: 'Relatórios' }) e .toHaveCount(0)
  })

  test('caixa: abrir /relatorios pelo endereço volta para o brechó com o aviso', async ({ page }) => {
    await entrarComo(page, PERFIS.caixa)
    // 1. page.goto('/relatorios')
    // 2. A URL tem de terminar em /brecho?aviso=restrito
    // 3. O texto "Essa área é restrita à coordenação do Instituto." tem de estar visível.
    // 4. Repita para /brecho/financeiro.
  })

  test('desativada: o login é recusado com mensagem clara', async ({ page }) => {
    // Aqui não dá para usar entrarComo, porque ele espera chegar em /brecho.
    // 1. Abra /login e preencha e-mail e senha de PERFIS.desativada.
    // 2. Clique em "Entrar".
    // 3. O texto "Seu acesso está desativado. Fale com a coordenação do Instituto." tem de aparecer.
    // 4. A URL tem de continuar em /login.
  })
})
```

Os três textos entre aspas vêm da US-23 (partes B5 e C2). Se o teste não achar o texto, confira primeiro se ele mudou lá.

## 5. Rodar

```bash
npm run db:start          # se o banco ainda não estiver de pé
npm run test:acesso
```

O primeiro `npm run test:acesso` sobe o `npm run dev` sozinho, se ele não estiver aberto. Para ver o passo a passo de uma falha: `npx playwright show-report`.

Se você rodar os testes muitas vezes e quiser limpar as vendas "Teste de acesso": `npm run db:reset`.

## 6. Na esteira

Em `.github/workflows/esteira.yml`, no job `verificacao`, acrescente um passo logo depois de "Testes de fumaça" e antes de "Guardar relatório dos testes":

```yaml
      - name: Testes de controle de acesso
        run: npm run test:acesso
```

No README, na tabela de comandos do dia a dia, acrescente a linha do `npm run test:acesso` (testes de controle de acesso por perfil).

## 7. Provar que o teste pega o erro

Um teste que nunca falhou pode estar testando nada. Afrouxe uma regra de propósito, só no seu banco local:

```bash
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -c 'create policy "teste: tudo liberado" on public.sales for select to authenticated using (true);'
# sem o psql instalado:
# docker exec -i $(docker ps -qf name=supabase_db) psql -U postgres -c 'create policy "teste: tudo liberado" on public.sales for select to authenticated using (true);'

npm run test:acesso
```

O teste "não lê vendas de outros dias" tem de **falhar**, com a mensagem "a caixa leu vendas de outros dias". Copie a saída. Depois desfaça:

```bash
npm run db:reset
npm run test:acesso       # tudo verde de novo
```

## 8. Pull Request

```bash
git add -A
git commit -m "SEC-03: testes de controle de acesso por perfil"
git push -u origin sec-03-testes-de-acesso
```

Abra o PR **para a `main`**, como rascunho (*Create draft pull request*), com o título `SEC-03 · Testes automatizados de controle de acesso`. Enquanto a US-23 não entrar na `main`, o seu PR mostra também os commits dela; isso some sozinho depois do merge da US-23. Quando ela entrar:

```bash
git fetch
git merge origin/main
git push
```

No PR, clique em **Ready for review**, cole a saída do passo 7 (o teste falhando e depois passando) e avise a Alissa.

Se a SEC-02 entrar antes e o GitHub acusar conflito em `esteira.yml`, o `git merge origin/main` acima resolve: os dois trechos ficam, um depois do outro.

## Revisão (Alissa)

```bash
git fetch
git checkout sec-03-testes-de-acesso
npm ci
npm run db:reset
npm run test:acesso
```

1. Conferir os testes verdes na sua máquina.
2. Ler os nomes dos testes e comparar com a matriz de permissões: cada "não" importante da coluna Caixa tem um teste? Se faltar algum, peça no PR.
3. Conferir no PR a saída do teste falhando com a regra afrouxada.
4. Aprovar.

## Tarefas no Trello

1. [Laís] Criar a branch `sec-03-testes-de-acesso` a partir da branch da US-23
2. [Laís] Criar `tests/acesso/` com login por perfil, sem chave de serviço
3. [Laís] Testes de recusa com perfil de caixa: ler relatório, alterar configuração e apagar venda
4. [Laís] Testes de sucesso com perfil de caixa: registrar venda e doação
5. [Laís] Teste da usuária desativada: o login é recusado
6. [Laís] Script `npm run test:acesso` e passo na esteira
7. [Laís] Provar que o teste pega regressão
8. [Alissa] Rodar `npm run test:acesso` na própria máquina, revisar e aprovar
