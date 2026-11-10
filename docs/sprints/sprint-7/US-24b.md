# US-24b · Backup diário cifrado do banco de produção (3 SP)

> Como coordenadora do Instituto, eu quero que os dados do sistema sejam copiados todos os dias, automaticamente, para que o Instituto não perca informação se algo der errado.

**Tipo:** user story · **Implementa:** Bibiana · **Revisa:** Laís · **Branch:** `us-24b-backup-diario` · **Depende de:** TS-05 integrada (o `db dump` é da versão 3); o Mateus cria o bucket e os segredos antes do merge · **PR pronto:** terça 10/11, 18h · **Merge:** terça 10/11, à noite · **Restauração de teste:** quarta 11/11, com o Mateus

**Divisão da US-24 (planejamento de 06/11):** a gestão de usuários ficou na US-24a (Laís). Esta story não mexe em nenhum arquivo do sistema: é uma rotina da esteira, um script e um documento.

## Critérios de aceitação

- [ ] Uma cópia do banco de produção (estrutura, dados e papéis) é feita todo dia às 3h de Brasília, sozinha, e pode ser disparada à mão (Actions, "Backup diário", Run workflow)
- [ ] A cópia é cifrada (AES-256, com senha) antes de sair da máquina da esteira e guardada num bucket privado do Supabase; ficam as dos últimos 30 dias, e as mais antigas são apagadas
- [ ] Nenhuma senha, chave ou endereço do banco no repositório nem no log; o log não mostra o conteúdo da cópia; a rotina não roda em fork nem em Pull Request
- [ ] A restauração foi testada uma vez no banco local, com o passo a passo e o resultado em `docs/processo/backup.md`
- [ ] A primeira cópia aparece no bucket depois do merge, e a falha de uma cópia avisa por e-mail quem está de olho no repositório (o aviso padrão do GitHub Actions)

## Decisões

- **Onde roda:** GitHub Actions, numa rotina separada da esteira (`.github/workflows/backup.yml`). Agendada, sem `pull_request`: segredos não chegam a código de PR.
- **Como copia:** `supabase db dump` da versão 3.0.0 (TS-05), em três arquivos: papéis, estrutura e dados. É o mesmo caminho que a documentação do Supabase indica para levar um banco para outro projeto.
- **Como cifra:** `gpg` com senha, AES-256, já instalado na máquina da esteira. A senha fica num segredo do GitHub e, fora dele, só com o Mateus (e com a coordenação depois da entrega, pergunta 14).
- **Onde guarda:** bucket privado `backups` no Storage do próprio `camaleao-producao`, enviado com a chave secreta por um script Node (`@supabase/supabase-js`, que o projeto já tem). Guardar no mesmo projeto protege contra erro de dado (alguém apagou o que não devia), e não contra a perda do projeto inteiro. A cópia fora do Supabase (um Drive do Instituto) é a pergunta 14 da mensagem de 06/11 e fica para a entrega.
- **Bônus:** no plano gratuito, projeto parado por uma semana é pausado. A cópia diária conecta no banco todo dia.
- **O teste de restauração é agora,** enquanto o banco de produção só tem dados de conferência. Depois do início do uso, a cópia tem dados pessoais e só é aberta com motivo (registrado no `PROGRESSO.md` ou na entrega).

## O que o Mateus faz antes do merge

1. **Bucket:** Supabase, projeto `camaleao-producao`, Storage, New bucket, nome `backups`, **Public desligado**. Nenhuma política: só a chave secreta lê e grava.
2. **Senha da cópia:** gerar uma senha longa (por exemplo `openssl rand -base64 32` no terminal dele) e guardar num gerenciador de senhas. Não mandar por chat.
3. **Segredos do GitHub:** repositório, Settings, Secrets and variables, Actions, New repository secret:

   | Nome | Valor |
   | --- | --- |
   | `BACKUP_DB_URL` | string de conexão do **Session pooler** do `camaleao-producao` (Connect, Session pooler, URI), com a senha do banco, com caracteres especiais em formato de URL (`%40` no lugar de `@`, por exemplo). A conexão direta não funciona na esteira, que não tem IPv6 |
   | `BACKUP_SENHA` | a senha do passo 2 |
   | `BACKUP_SUPABASE_URL` | `https://<ref>.supabase.co` do `camaleao-producao` |
   | `BACKUP_CHAVE_SECRETA` | a chave secreta (`sb_secret_...`) do `camaleao-producao` |

Nenhum desses valores vai para o PR, o Trello, o grupo ou um arquivo.

## 1. Branch

```bash
git checkout main && git pull
git checkout -b us-24b-backup-diario
git push -u origin us-24b-backup-diario
```

## Parte A · `.github/workflows/backup.yml` (arquivo novo)

```yaml
name: Backup diário

# US-24b · Cópia diária do banco de produção, cifrada, num bucket privado.
# Só agenda e disparo manual: nunca em pull_request, para segredo nenhum chegar a código de PR.
on:
  schedule:
    - cron: '0 6 * * *' # 6h UTC = 3h em Brasília
  workflow_dispatch:

permissions:
  contents: read

concurrency:
  group: backup-diario
  cancel-in-progress: false

jobs:
  copia:
    name: Copiar, cifrar e guardar
    # Em fork, os segredos não existem e a rotina não tem o que copiar.
    if: github.repository == 'mateustrevisan-ufcspa/camaleao-'
    runs-on: ubuntu-latest
    timeout-minutes: 20
    env:
      # CLI 3.x: não ler arquivos .env de desenvolvimento (TS-05).
      SUPABASE_ENV: ci
    steps:
      - uses: actions/checkout@v5

      - uses: actions/setup-node@v5
        with:
          node-version-file: .nvmrc
          cache: npm

      - name: Instalar dependências
        run: npm ci

      - name: Copiar papéis, estrutura e dados
        env:
          DB_URL: ${{ secrets.BACKUP_DB_URL }}
        run: |
          set -euo pipefail
          mkdir -p copia
          npx --yes supabase@3.0.0 db dump --role-only -f copia/papeis.sql --remote="$DB_URL"
          npx --yes supabase@3.0.0 db dump -f copia/estrutura.sql --remote="$DB_URL"
          npx --yes supabase@3.0.0 db dump --data-only --use-copy -f copia/dados.sql --remote="$DB_URL"
          # Só o tamanho vai para o log, nunca o conteúdo.
          ls -la copia

      - name: Cifrar
        env:
          SENHA: ${{ secrets.BACKUP_SENHA }}
        run: |
          set -euo pipefail
          NOME="camaleao-$(date -u +%Y-%m-%d).tar.gz.gpg"
          tar czf - -C copia . | gpg --batch --yes --pinentry-mode loopback --passphrase "$SENHA" \
            --symmetric --cipher-algo AES256 -o "$NOME"
          rm -rf copia
          ls -la "$NOME"
          echo "NOME=$NOME" >> "$GITHUB_ENV"

      - name: Guardar no bucket e apagar as de mais de 30 dias
        env:
          SUPABASE_URL: ${{ secrets.BACKUP_SUPABASE_URL }}
          CHAVE: ${{ secrets.BACKUP_CHAVE_SECRETA }}
        run: node scripts/backup-guardar.mjs "$NOME"
```

O GitHub esconde o valor dos segredos no log, mas a rotina também não imprime nada que venha deles. Se o `db dump` da 3.0.0 recusar `--remote=<url>`, a mensagem de erro diz a forma nova (a versão 3 imprime o substituto de toda opção removida): ajuste e escreva no PR.

## Parte B · `scripts/backup-guardar.mjs` (arquivo novo)

```js
// US-24b · Envia a cópia cifrada para o bucket privado "backups" e apaga as de
// mais de 30 dias. Roda só na rotina "Backup diário" (.github/workflows/backup.yml).
// Uso: SUPABASE_URL=... CHAVE=... node scripts/backup-guardar.mjs camaleao-AAAA-MM-DD.tar.gz.gpg
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const BUCKET = 'backups'
const DIAS = 30

const [arquivo] = process.argv.slice(2)
const url = process.env.SUPABASE_URL
const chave = process.env.CHAVE
if (!arquivo || !/^camaleao-\d{4}-\d{2}-\d{2}\.tar\.gz\.gpg$/.test(arquivo)) {
  console.error('Informe o arquivo da cópia (camaleao-AAAA-MM-DD.tar.gz.gpg).')
  process.exit(1)
}
if (!url || !chave) {
  console.error('Faltam SUPABASE_URL e CHAVE (segredos BACKUP_SUPABASE_URL e BACKUP_CHAVE_SECRETA).')
  process.exit(1)
}

const supabase = createClient(url, chave, { auth: { persistSession: false, autoRefreshToken: false } })
const bucket = supabase.storage.from(BUCKET)

const { error: erroEnvio } = await bucket.upload(arquivo, readFileSync(arquivo), {
  contentType: 'application/octet-stream',
  upsert: true,
})
if (erroEnvio) {
  console.error(`Não foi possível guardar a cópia: ${erroEnvio.message}`)
  process.exit(1)
}

// Datas no nome, em UTC: a cópia de hoje nunca entra na conta.
const limite = new Date(Date.now() - DIAS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
const { data: lista, error: erroLista } = await bucket.list('', { limit: 1000 })
if (erroLista) {
  console.error(`Cópia guardada, mas a lista do bucket falhou: ${erroLista.message}`)
  process.exit(1)
}
const antigas = (lista ?? [])
  .map((f) => f.name)
  .filter((nome) => {
    const data = /^camaleao-(\d{4}-\d{2}-\d{2})\.tar\.gz\.gpg$/.exec(nome)?.[1]
    return data !== undefined && data < limite
  })
if (antigas.length > 0) {
  const { error: erroApagar } = await bucket.remove(antigas)
  if (erroApagar) {
    console.error(`Cópia guardada, mas as antigas não foram apagadas: ${erroApagar.message}`)
    process.exit(1)
  }
}

console.log(`Cópia guardada: ${arquivo}. Apagadas por terem mais de ${DIAS} dias: ${antigas.length}.`)
```

## Parte C · `docs/processo/backup.md` (arquivo novo)

Escreva com esta estrutura (o passo 5 é preenchido no teste de quarta):

````markdown
# Backup diário do banco de produção (US-24b)

## O que é copiado

Papéis, estrutura e dados do `camaleao-producao`, todos os dias às 3h de Brasília, pela rotina
"Backup diário" do GitHub Actions (`.github/workflows/backup.yml`). A cópia é um arquivo
`camaleao-AAAA-MM-DD.tar.gz.gpg`, cifrado com AES-256, no bucket privado `backups` do Storage do
`camaleao-producao`. Ficam as dos últimos 30 dias.

## Quem tem acesso

- Senha da cópia: Mateus (gerenciador de senhas) e o segredo `BACKUP_SENHA` do GitHub. Na entrega, passa para a coordenação (pergunta 14 da mensagem de 06/11).
- Bucket: quem tem acesso ao projeto no Supabase.
- A cópia tem os dados pessoais do Instituto. Só se abre para restaurar ou testar, com o motivo registrado.

## 1. Fazer uma cópia agora

GitHub, Actions, "Backup diário", Run workflow, branch `main`. Leva poucos minutos.

## 2. Baixar

Supabase, `camaleao-producao`, Storage, `backups`, o arquivo do dia, Download.

## 3. Abrir

No Mac, uma vez: `brew install gnupg`. Depois:

```bash
mkdir -p ~/copia-camaleao && cd ~/copia-camaleao
gpg --decrypt ~/Downloads/camaleao-AAAA-MM-DD.tar.gz.gpg | tar xzf -
ls
```

O `gpg` pede a senha. Saem `papeis.sql`, `estrutura.sql` e `dados.sql`.

## 4. Restaurar no banco local (teste)

As migrações já montam a estrutura igual à de produção; o teste carrega só os dados, num banco local sem os dados de demonstração:

```bash
cd ~/caminho/do/camaleao-
npx --yes supabase@3.0.0 db reset --no-seed
docker exec -i supabase_db_camaleao-admin psql -U postgres -d postgres -v ON_ERROR_STOP=1 \
  -c "set session_replication_role = replica" -f - < ~/copia-camaleao/dados.sql
```

Se o `psql` parar com "duplicate key" numa tabela de controle (`schema_migrations`, do Supabase ou do Auth), que o `db reset` já preenche, rode o `db reset --no-seed` de novo e depois o `psql` sem `-v ON_ERROR_STOP=1`, confira que os erros foram só nessas tabelas e anote na tabela do passo 5.

Conferir, no banco local e no SQL Editor de produção, as mesmas contagens:

```sql
select 'clients' as tabela, count(*) from public.clients
union all select 'sales', count(*) from public.sales
union all select 'donations_cash', count(*) from public.donations_cash
union all select 'donations_items', count(*) from public.donations_items
union all select 'users', count(*) from public.users
union all select 'auth.users', count(*) from auth.users;
```

Depois do teste: `npm run db:reset` (volta o banco local com os dados de demonstração) e
`rm -rf ~/copia-camaleao ~/Downloads/camaleao-*.gpg`.

## 5. Restauração testada

| Data | Quem | Cópia | Contagens iguais? | Observações |
| --- | --- | --- | --- | --- |
| | | | | |

## Restaurar em produção (desastre)

Num projeto novo do Supabase (o mesmo caminho da TS-02): `psql` com `papeis.sql`, depois `estrutura.sql`,
depois `set session_replication_role = replica` e `dados.sql`, numa transação só, e a troca das variáveis
da Vercel como na virada (TS-03). Antes, avisar o Instituto e registrar o motivo.
````

## Conferir

No PR, a esteira de sempre continua verde (`npm run lint` cobre o script). A rotina nova só roda depois do merge, porque o GitHub só oferece "Run workflow" para rotinas que estão na `main`. Por isso:

- **Na revisão,** a Laís confere o YAML (sem `pull_request`, sem `echo` de segredo, com `set -euo pipefail`) e o script (nome do arquivo validado, apagar só `camaleao-AAAA-MM-DD`), e escreve no PR o que conferiu.
- **Depois do merge (terça à noite):** o Mateus roda "Run workflow" e confere no log os tamanhos dos três arquivos e a linha "Cópia guardada", e no bucket o arquivo do dia.
- **Quarta 11/11:** restauração de teste (passos 2 a 4 do documento) pelo Mateus, com a Bibiana acompanhando por chamada e preenchendo a tabela do passo 5 num PR pequeno de documentação. Só então o cartão vai para Concluído.

## Pull Request

Título: `US-24b · Backup diário cifrado do banco de produção`. No corpo: os critérios e a lista dos quatro segredos (só os nomes). Sem migração: merge depois da aprovação e da confirmação do Mateus de que o bucket e os segredos existem.

## Se a primeira cópia falhar

- **Erro de conexão no `db dump`:** quase sempre é a URL. Confira se é a do Session pooler e se a senha está em formato de URL. Corrija o segredo e rode de novo.
- **Erro no envio (`upload`):** confira o nome do bucket (`backups`) e se a chave é a secreta, e não a publicável.
- Nunca cole o log inteiro no grupo sem conferir que não há endereço do banco nele.

## Fora desta story

- Cópia fora do Supabase (Drive do Instituto): pergunta 14; entra na entrega se o Instituto indicar onde.
- Restaurar uma tabela só, ou um registro: não automatizado; quem precisar abre a cópia e copia os dados à mão, com motivo registrado.
