# Banco de produção (TS-02)

O sistema passa a ter dois projetos no Supabase: um de produção, montado só pelas migrações do repositório, e um de teste, que é o banco publicado até a virada. Este documento registra como o banco de produção foi montado, a regra das migrações e o roteiro da virada.

## Os dois projetos

| Projeto | Para quê | Quem usa |
| --- | --- | --- |
| `camaleao-producao` | produção, desde a virada de 04/11/2026, 14h (TS-03). Até o início do uso pelo Instituto, também homologação, com dado inventado (seção "Até o início do uso") | Vercel Production |
| projeto antigo | parado nas 13 migrações até `20261028090000`; não recebe as migrações novas e não serve para conferir story com migração | Vercel Preview |

Os testes automatizados (fumaça e acesso) rodam só no banco local, na máquina de cada um e na esteira. Nenhum dos dois projetos hospedados entra nos testes.

## Regra das migrações

Migração em produção só por `supabase db push`, com o CLI ligado ao projeto de produção, depois do PR aprovado. Nunca pelo SQL Editor. Antes e depois, `supabase migration list --remote`; a saída vai para o `PROGRESSO.md` da sprint. O SQL Editor fica para leitura e para o cadastro de perfis até a US-24.

Ordem numa story com migração: PR aprovado, `db push` no banco de produção, merge, conferência na tela.

Antes de qualquer `db push`, confira o projeto ligado e o que falta aplicar:

```bash
cat supabase/.temp/project-ref; echo
npx --yes supabase@3.0.0 migration list --remote
```

Para aplicar:

```bash
npx --yes supabase@3.0.0 db push --remote
```

O CLI pergunta se pode aplicar no projeto hospedado; a resposta padrão é "não". Responda `y` só depois de conferir, na lista que ele mostra, que só a migração da sua story está pendente. Sem `--remote`, o `db push` aplica no banco local.

Depois do `db push`, rode de novo o `migration list --remote` e copie as duas últimas linhas para o `PROGRESSO.md`.

O projeto atual não tem a tabela de migrações (`supabase_migrations.schema_migrations`). Com o CLI ligado a ele, o `db push` tentaria aplicar todas as migrações desde a primeira.

## Diferença conferida em 29/10

Comando, com o CLI ligado ao projeto atual (só leitura):

```bash
npx --yes supabase@2.119.0 db diff --linked --schema public,extensions
```

Resultado: **nenhuma diferença que faça parte do sistema.** As 13 migrações do repositório, até a `20261028090000_valor_do_atendimento`, reconstroem o banco publicado. Não houve migração de acerto.

O diff listou estes trechos, todos conferidos:

| Trecho | O que é | Decisão |
| --- | --- | --- |
| Índices `idx_donations_cash_client`, `idx_donations_caps_client` e `idx_donations_items_client` | Os mesmos índices das migrações (`idx_dcash_client_id`, `idx_dcaps_client_id` e `idx_ditems_client_id`), nas mesmas colunas, com o nome do `supabase/schema.sql` antigo, de onde o banco publicado nasceu | Fica de fora. O banco novo tem os nomes das migrações |
| `drop extension pg_net` | O banco de comparação do CLI liga o `pg_net` sozinho; o publicado não tem a extensão, e nenhuma migração a usa | Fica de fora |
| Função `rls_auto_enable` | Chamada pelo gatilho de evento `ensure_rls`, que liga o RLS em toda tabela nova do `public`. Criada pelo Supabase, e não pela equipe | Fica de fora das migrações. Conferir se o projeto novo tem o mesmo gatilho |
| Views `clients_view`, `sales_view`, `donations_cash_view`, `events_totals` e `campaigns_totals`, e a função `register_sale` | Corpo idêntico ao das migrações. Conferido no banco publicado: as sete views do `public` têm `security_invoker=true`, e a `register_sale` tem dono `postgres`, sem `security definer` e sem configuração extra | Ruído da ferramenta; nada a fazer |

Consulta usada para conferir as views, as funções e os gatilhos de evento (só leitura):

```sql
select c.relname as view, c.reloptions as opcoes
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relkind = 'v'
order by 1;

select p.proname as funcao,
       pg_get_userbyid(p.proowner) as dono,
       p.prosecdef as security_definer,
       p.proconfig as configuracoes
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname in ('register_sale', 'rls_auto_enable');

select evtname as gatilho, evtevent as evento, evtenabled as ligado, evtfoid::regproc as funcao
from pg_event_trigger;
```

## Montagem do projeto novo em 29/10

Projeto `camaleao-producao` (ref `dbjwiyoceguuzvygnceg`), região São Paulo (`sa-east-1`), criado pelo painel. A senha do banco fica no gerenciador de senhas da equipe.

Migrações aplicadas só por `db push`, sem seed, com o CLI ligado ao projeto novo (conferido em `supabase/.temp/linked-project.json` antes do push):

```bash
npx --yes supabase@2.119.0 db push --dry-run   # 13 migrações listadas
npx --yes supabase@2.119.0 db push
npx --yes supabase@2.119.0 migration list
```

```
   Local            | Remote           | Time (UTC)
  ------------------|------------------|-----------------------
   20260611003900   | 20260611003900   | 2026-06-11 00:39:00
   20260611120000   | 20260611120000   | 2026-06-11 12:00:00
   20261006090000   | 20261006090000   | 2026-10-06 09:00:00
   20261010090000   | 20261010090000   | 2026-10-10 09:00:00
   20261012090000   | 20261012090000   | 2026-10-12 09:00:00
   20261013090000   | 20261013090000   | 2026-10-13 09:00:00
   20261019090000   | 20261019090000   | 2026-10-19 09:00:00
   20261020090000   | 20261020090000   | 2026-10-20 09:00:00
   20261020100000   | 20261020100000   | 2026-10-20 10:00:00
   20261021090000   | 20261021090000   | 2026-10-21 09:00:00
   20261021100000   | 20261021100000   | 2026-10-21 10:00:00
   20261022090000   | 20261022090000   | 2026-10-22 09:00:00
   20261028090000   | 20261028090000   | 2026-10-28 09:00:00
```

Conferência no SQL Editor do projeto novo, logo depois do push:

| Formas de pagamento | Bancos | Categorias de item | Valor do atendimento | Pessoas | Vendas | Doações | Contas |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 4 | 5 | 13 | 1 | 0 | 0 | 0 | 0 |

Os dados de referência vieram das migrações; nenhum dado de teste ou de demonstração.

### Auth e contas de conferência

O `db push` não leva as configurações do Auth nem as contas.

Configurações do Auth comparadas tela por tela com o projeto atual (cadastro, Site URL, Redirect URLs e modelos de e-mail): todas iguais, nenhum ajuste.

Contas de conferência, uma por perfil, criadas em Authentication, Users, com o e-mail confirmado. As senhas ficam no gerenciador de senhas da equipe. Os e-mails usam o domínio `example.com`, que não recebe mensagem: servem só para entrar com senha.

| E-mail | Nome | Perfil |
| --- | --- | --- |
| `conferencia.coordenacao@example.com` | Conferência · Coordenação | `admin` |
| `conferencia.voluntaria@example.com` | Conferência · Voluntária | `volunteer` |
| `conferencia.caixa@example.com` | Conferência · Caixa | `cashier` |

O perfil de cada conta foi gravado em `public.users` pelo SQL Editor, como no `supabase/seed-user.sql`. Isso é cadastro de dado, e não mudança de esquema; até a US-24 trazer a tela, é assim.

As contas do Instituto só são criadas na virada, depois de a revisão de 30/10 dizer quem continua usando o sistema.

### Gatilho `ensure_rls`

O projeto atual tem o gatilho de evento `ensure_rls` (função `rls_auto_enable`), criado pelo Supabase, que liga o RLS em toda tabela nova do `public`. O projeto novo não tem. Fica assim: toda tabela entra por migração, e as migrações ligam o RLS explicitamente (`enable row level security`), o que os testes de acesso conferem no banco local.

### Integração do Supabase com o GitHub

No projeto atual, em Project Settings, Integrations, GitHub, "Deploy to production" estava ligado e foi desligado em 29/10. Ele aplicaria as migrações da `main` num banco sem a tabela de migrações. No projeto novo, a integração não foi ligada: migração em produção é só por `db push`, como diz a regra acima.

## Ensaio com deploy de preview em 30/10

Variáveis criadas na Vercel como Config (são públicas: vão para o navegador), presas só à branch `ts-02-banco-de-producao` em Preview Branches. Production e o Preview das outras branches não mudaram.

| Variável | Valor |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://dbjwiyoceguuzvygnceg.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | chave publicável (`sb_publishable_...`) do `camaleao-producao` |

A branch trouxe a `main` com a SEC-06 antes do deploy, então o build conferiu que nenhuma variável pública tem chave secreta.

**O que deu errado na primeira tentativa (10h09):** a `NEXT_PUBLIC_SUPABASE_ANON_KEY` da branch recebeu a chave do projeto atual. Com a URL do banco novo e a chave do atual, o Supabase recusa toda requisição, e nenhuma conta entrou; a tela mostra só "E-mail ou senha incorretos.", porque o login trata qualquer erro do Auth do mesmo jeito. Cada projeto do Supabase tem a sua chave publicável: a URL e a chave têm de vir do mesmo projeto. Corrigido com a chave do `camaleao-producao` e um novo deploy da branch (commit vazio, 10h17).

Conferido no preview, sem gravar nenhum registro:

- [x] Login com as três contas de conferência
- [x] Conta do banco atual não entra (o preview não está no banco atual)
- [x] Menu de cada perfil igual ao da produção atual
- [x] Nova venda e nova doação abrem, com formas de pagamento, bancos e categorias nas listas
- [x] Listas de vendas, doações e fichas vazias
- [x] Variáveis da branch apagadas na Vercel depois do ensaio (30/10); ficaram só as de "Production and Preview", do projeto atual

## Roteiro da virada

1. Aviso no grupo do Instituto, uma hora antes, depois das 22h.
2. `migration list` no projeto novo sem pendência.
3. Contas do Instituto criadas no Auth do projeto novo, com o perfil em `public.users`.
4. Na Vercel, Production: `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` do projeto novo, **as duas do mesmo projeto** (a chave publicável do `camaleao-producao`, e não a do atual; foi o erro da primeira tentativa do ensaio). Tipo Config, para a equipe conseguir conferir o valor. Novo deploy de produção.
5. Conferência: login dos três perfis, uma venda e uma doação de verdade (ou de teste, apagada em seguida pela coordenação), relatório.
6. Volta, se algo der errado: repor as duas variáveis antigas e fazer novo deploy. O banco antigo não muda na virada.
7. Preview passa a apontar para o banco antigo (que já é o que ele usa hoje).
8. Integração do Supabase com o GitHub: desligada no projeto novo; no antigo, "Deploy to production" desligado.
9. Registro no `PROGRESSO.md`: hora, quem fez, o que foi conferido.

## Virada em 04/11/2026 (TS-03)

Feita de dia, sem aviso ao Instituto: em 03/11 a coordenação disse que o Instituto não usa o sistema, nem para teste, até as melhorias ficarem prontas. Por isso a virada foi curta, sem os passos 1 e 3 do roteiro acima. As contas do Instituto e as categorias finais (Roupas, Tampinhas e Diversos) ficam para o início do uso.

| Passo | Hora | Quem | Resultado |
| --- | --- | --- | --- |
| Aviso no grupo do Instituto | | | Não houve: o Instituto não está usando o sistema |
| `migration list` sem pendência | antes das 14h | Mateus | 13 de 13 nas duas colunas, até `20261028090000` |
| Contas do Instituto | | | Para o início do uso |
| Categorias | | | Para o início do uso, com a coordenação |
| Variáveis da Vercel (Production) e deploy | 14h | Mateus | URL e chave publicável do `camaleao-producao`, só em Production, tipo Config; as do projeto antigo ficaram só em Preview. Redeploy da `main` sem cache |
| Conferência com as três contas de conferência | depois das 14h | Mateus | Login dos três perfis; conta do projeto antigo recusada; menus como na matriz; nova venda e nova doação abrem; listas, Relatórios e Financeiro vazios |

**Como voltar:** repor em Production `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` do projeto antigo e fazer novo deploy. O banco antigo não mudou na virada; o que for lançado no banco novo depois da virada fica nele.

**Depois da virada:** migração só por `db push` no `camaleao-producao`, na ordem PR aprovado, `db push`, merge, conferência. O projeto antigo não recebe mais migrações: o Preview pode dar erro em tela nova por falta de tabela, e o teste que vale é o do banco local.

**Para o início do uso:** criar as contas da Tamara (voluntária), da Ana (caixa) e da Nílian (coordenação) no Auth do `camaleao-producao`, com o perfil em `public.users` (consulta na seção 2 do guia da TS-03, `docs/sprints/sprint-6/TS-03.md`); acertar as categorias com a coordenação; avisar no grupo do Instituto. E-mails e senhas não vão para arquivo versionado. Antes de tudo isso, a limpeza (seção "Limpeza no início do uso").

## Até o início do uso (decisão de 05/11/2026)

O Instituto não usa o sistema até as melhorias ficarem prontas. Até lá, o `camaleao-producao` serve também de homologação:

- A conferência no publicado pode gravar dado de teste: venda, doação, pessoa, campanha, evento.
- **Só dado inventado.** Nunca nome, telefone, e-mail ou CPF de pessoa real, nem para testar.
- Pessoa, campanha ou evento de teste com "TESTE" no nome, para achar fácil.
- A regra das migrações não muda: PR aprovado, `db push`, merge, conferência. É ela que deixa o esquema pronto para o dia do início do uso.
- As três contas de conferência são da equipe toda (Laís, Alissa, Bibiana e Mateus). Os logins circulam fora do grupo do Instituto e nunca em arquivo, Trello ou PR.

## Limpeza no início do uso

Primeiro passo do cartão "Início do uso pelo Instituto", antes das contas reais e das categorias. Apaga só as tabelas de movimento. Ficam as tabelas de referência, que vêm das migrações e não voltam sozinhas, e as contas.

| Apaga (movimento) | Fica (referência e contas) |
| --- | --- |
| `clients`, `client_tags`, `client_merges`, `message_consents`, `sales`, `sale_items`, `donations_cash`, `donations_items`, `donations_caps`, `events`, `campaigns` | `payment_methods`, `banks`, `item_categories`, `cash_origins`, `tags`, `valor_do_atendimento`, `users` (e `auth.users`) |

A lista é a das migrações até `20261102100000` (US-33). Stories que entrarem depois podem criar tabelas (a US-32 traz as taxas das maquininhas, que são referência e ficam). No dia, conferir a lista com:

```bash
grep -h -i -E "create table" supabase/migrations/*.sql
```

**Por que não `db reset --linked`:** recriaria o banco a partir das migrações, mas, sem o `--no-seed`, rodaria o `supabase/seed.sql` no projeto hospedado, e ele cria contas com a senha publicada no repositório. Com o CLI ligado ao projeto errado, apagaria outro banco. A limpeza pelo SQL Editor é cadastro de dado, e não mudança de esquema, então cabe na regra das migrações.

### Roteiro

1. No painel do Supabase, abrir o SQL Editor do `camaleao-producao` (ref `dbjwiyoceguuzvygnceg`) e conferir o nome do projeto no topo da tela.
2. Contagem antes. Copiar o resultado para o `PROGRESSO.md` da sprint.

   ```sql
   select 'clients' as tabela, count(*) from public.clients
   union all select 'sales', count(*) from public.sales
   union all select 'sale_items', count(*) from public.sale_items
   union all select 'donations_cash', count(*) from public.donations_cash
   union all select 'donations_items', count(*) from public.donations_items
   union all select 'donations_caps', count(*) from public.donations_caps
   union all select 'events', count(*) from public.events
   union all select 'campaigns', count(*) from public.campaigns
   union all select 'payment_methods', count(*) from public.payment_methods
   union all select 'banks', count(*) from public.banks
   union all select 'item_categories', count(*) from public.item_categories
   union all select 'cash_origins', count(*) from public.cash_origins
   union all select 'tags', count(*) from public.tags
   union all select 'valor_do_atendimento', count(*) from public.valor_do_atendimento
   union all select 'users', count(*) from public.users;
   ```

3. Limpeza, com a lista conferida no dia:

   ```sql
   truncate table
     public.sale_items, public.sales,
     public.donations_cash, public.donations_items, public.donations_caps,
     public.events, public.campaigns,
     public.message_consents, public.client_merges,
     public.client_tags, public.clients
   restart identity cascade;
   ```

   O `cascade` apaga também as tabelas que apontam para as listadas. As de referência ficam de fora, porque são as vendas e as doações que apontam para elas. As mensagens "truncate cascades to table ..." da saída têm de citar só tabelas de movimento; se citarem uma de referência, parar e avisar a equipe.

4. Contagem depois, com a mesma consulta do passo 2: movimento em zero, referência e `users` iguais ao passo 2.
5. Rever com a coordenação os dados de referência alterados nos testes (valor do atendimento, bancos, taxas da US-32, categorias). As categorias finais (Roupas, Tampinhas e Diversos) entram aqui.
6. Desativar as três contas de conferência. A conta da coordenação veria os dados reais. Elas só voltam (`active = true`) para uma conferência, com registro no `PROGRESSO.md`.

   ```sql
   update public.users
   set active = false
   where id in (
     select id from auth.users
     where email in (
       'conferencia.coordenacao@example.com',
       'conferencia.voluntaria@example.com',
       'conferencia.caixa@example.com'
     )
   );
   ```

7. Seguir com as contas reais, o aviso no grupo do Instituto e o registro no `PROGRESSO.md` (hora, quem fez, contagens antes e depois).
