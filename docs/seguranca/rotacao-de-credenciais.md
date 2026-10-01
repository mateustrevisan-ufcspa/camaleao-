# Rotação de credenciais (SEC-01)

O repositório `mateustrevisan-ufcspa/camaleao-` é público. Até a Sprint 1, o histórico do git continha:

| Onde | O que | Commit de entrada |
|---|---|---|
| `docs/superpowers/plans/2026-06-11-clients-unification.md` | e-mail e senha do usuário de teste, *project ref* do Supabase | `10ec2ec` (23/06/2026) |
| `.env.local.example` | URL e chave publicável (`sb_publishable_…`) de outro projeto Supabase | `37d0997` (21/08/2026) |

O plano de 11/06 também afirma que a chave anônima e a de serviço "já são conhecidas no histórico". Por isso as duas são tratadas como vazadas, junto com a senha.

Remover os segredos do código não basta. Qualquer pessoa que clonou o repositório antes da limpeza continua com eles. **Primeiro rotaciona, depois limpa o histórico.**

## Checklist de rotação

Feito por quem tem acesso de dono aos projetos no painel do Supabase.

- [ ] Senha do usuário de teste trocada (Authentication → Users → *Send password recovery* ou *Reset password*)
- [ ] Chaves de API do projeto do plano de 11/06 rotacionadas. Em Project Settings → API Keys, criar novas chaves publicável e secreta e revogar as antigas. Em projeto que ainda usa as chaves legadas `anon`/`service_role`, migrar para as novas e desativar as legadas (*Disable legacy API keys*)
- [ ] Chave publicável do projeto do `.env.local.example` revogada (Project Settings → API Keys)
- [ ] Novos valores gravados somente no `.env.local` de cada pessoa e nos segredos do repositório no GitHub (Settings → Secrets and variables → Actions), nunca em arquivo versionado
- [ ] Teste: login com a senha antiga falha e uma chamada REST com a chave antiga retorna 401
- [ ] Histórico do git limpo (veja [limpeza-do-historico.md](limpeza-do-historico.md))

## Registro

| Data | Credencial | Projeto | Quem rotacionou | Como foi verificado |
|---|---|---|---|---|
| _aaaa-mm-dd_ | senha do usuário de teste | _ref_ | | |
| _aaaa-mm-dd_ | chave publicável / anon | _ref_ | | |
| _aaaa-mm-dd_ | chave secreta / service_role | _ref_ | | |
| _aaaa-mm-dd_ | chave publicável do `.env.local.example` | _ref_ | | |

Não escreva o valor das chaves aqui. Registre só o nome e a data.

## Onde as variáveis ficam agora

- **Máquina de cada pessoa:** `.env.local`, ignorado pelo `.gitignore`. O modelo versionado (`.env.local.example`) aponta para o Supabase local, que roda em Docker e não tem dado real.
- **Esteira (GitHub Actions):** os testes de fumaça sobem um Supabase local descartável, então a esteira não precisa de chave de projeto hospedado.
- **Hospedagem (Vercel, quando houver):** variáveis de ambiente do projeto na Vercel.
