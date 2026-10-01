# Camaleão Admin

Sistema interno do Instituto Camaleão para registrar vendas do brechó, doações e o cadastro de quem apoia o Instituto.

Feito em Next.js (App Router) sobre Supabase (Postgres + Auth). Em desenvolvimento, o banco roda **localmente em Docker**, criado a partir das migrations, com dados de demonstração e sem nenhum dado real.

## Pré-requisitos

| Ferramenta | Versão | Como conferir |
|---|---|---|
| Node.js | 22 LTS (veja `.nvmrc`) | `node -v` |
| npm | 10 ou mais recente | `npm -v` |
| Docker Desktop | qualquer versão recente, **aberto** | `docker info` |
| Git | qualquer | `git --version` |

Não é preciso instalar o Supabase CLI: os scripts usam `npx` com a versão fixada.

## Subir do zero

```bash
git clone https://github.com/mateustrevisan-ufcspa/camaleao-.git camaleao
cd camaleao
npm ci                 # dependências
npm run db:start       # sobe o Supabase local, aplica as migrations e os seeds
npm run env:local      # gera o .env.local apontando para o Supabase local
npm run dev            # http://localhost:3000
```

Entre com a usuária de desenvolvimento criada pelo seed:

- **E-mail:** `voluntaria@camaleao.local`
- **Senha:** `camaleao-local`

Essa conta só existe no banco local descartável. Ela não dá acesso a nenhum ambiente do Instituto.

> Na primeira vez, `npm run db:start` baixa as imagens Docker do Supabase (cerca de 1,6 GB), o que pode levar alguns minutos dependendo da rede. Das próximas vezes ele sobe em segundos.

## Variáveis de ambiente

Ficam em `.env.local`, que **não é versionado**. O modelo é o `.env.local.example`.

| Variável | Para que serve | Valor local |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Endereço da API do Supabase | `http://127.0.0.1:54321` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Chave pública (anon) usada pelo navegador e pelo servidor | saída de `npx supabase status` |

O `npm run env:local` preenche as duas automaticamente. Nunca coloque chave de projeto hospedado em arquivo versionado; veja [docs/seguranca/rotacao-de-credenciais.md](docs/seguranca/rotacao-de-credenciais.md).

## Banco de dados

- **Migrations:** `supabase/migrations/`, aplicadas em ordem pelo nome. Toda mudança de esquema entra como uma migration nova, nunca editando uma antiga.
- **Seeds:** `supabase/seed.sql` cria a usuária local e `supabase/seed-demo.sql` cria pessoas, vendas e doações de exemplo. A ordem está em `supabase/config.toml` (`[db.seed]`).
- `supabase/schema.sql` é só referência de leitura e não é aplicado por nenhum comando. A fonte da verdade são as migrations.

| Comando | O que faz |
|---|---|
| `npm run db:start` | Sobe o Supabase local só com os serviços que o app usa (banco, auth, API) e aplica migrations e seeds na primeira vez |
| `npm run db:reset` | Apaga o banco local e recria do zero a partir das migrations e seeds |
| `npm run db:stop` | Para os containers |
| `npx supabase status` | Mostra URLs e chaves locais |

Para abrir o painel do banco (Supabase Studio, que baixa imagens adicionais), rode `npx supabase start` sem exclusões e acesse <http://127.0.0.1:54323>. Para inspecionar sem o painel: `psql postgresql://postgres:postgres@127.0.0.1:54322/postgres`.

## Comandos do dia a dia

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run lint` | Lint |
| `npm run test:fumaca` | Testes de fumaça (login, venda e doação) |

## Testes de fumaça

Cobrem os fluxos que não podem quebrar: login, registro de venda e registro de doação em dinheiro, além de conferir que rota interna sem login volta para `/login`. Rodam no navegador (Playwright) contra o Supabase local.

```bash
npx playwright install chromium   # só na primeira vez
npm run db:start                  # se ainda não estiver rodando
npm run test:fumaca
```

Usa o `npm run dev` que já estiver aberto ou sobe um. Cada passo tem nome. Quando algo quebra, a saída diz qual passo falhou e por quê, por exemplo:

```
✘ registro de venda › Venda: registrar
  Error: depois de registrar a venda a aplicação deveria voltar para /brecho
```

Captura de tela e *trace* da falha ficam em `test-results/`; o relatório completo abre com `npx playwright show-report`.

## Problemas comuns

- **`Cannot connect to the Docker daemon`**: abra o Docker Desktop e espere ele terminar de iniciar.
- **Porta 54321/54322 em uso**: outro projeto Supabase está rodando. Pare-o com `npx supabase stop --project-id <nome>` ou pare tudo com `docker stop $(docker ps -q)`.
- **Login falha com "E-mail ou senha incorretos"**: o seed não rodou. Use `npm run db:reset`.
- **`.env.local já existe`**: o `npm run env:local` não sobrescreve sem `--force` (`npm run env:local -- --force`).

## Processo da equipe

- Toda mudança entra por Pull Request, com revisão de outro integrante.
- Documentos de segurança: [docs/seguranca/](docs/seguranca/).
