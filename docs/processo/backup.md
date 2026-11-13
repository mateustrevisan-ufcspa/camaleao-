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
