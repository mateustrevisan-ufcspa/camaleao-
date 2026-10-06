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

- [x] Senha do usuário de teste trocada (Authentication → Users → *Send password recovery* ou *Reset password*). O usuário não era usado por ninguém e foi apagado, em vez de ter a senha trocada
- [x] Chaves de API do projeto do plano de 11/06 rotacionadas. Em Project Settings → API Keys, criar novas chaves publicável e secreta e revogar as antigas. Em projeto que ainda usa as chaves legadas `anon`/`service_role`, migrar para as novas e desativar as legadas (*Disable legacy API keys*)
- [x] Chave publicável do projeto do `.env.local.example` revogada (Project Settings → API Keys). Era do mesmo projeto, e foi apagada junto com a publicável antiga
- [x] Novos valores gravados somente fora do repositório. A publicável nova está só nas variáveis de ambiente da Vercel (Production). A esteira não precisa de chave de projeto hospedado, porque usa o Supabase local
- [ ] Teste: login com a senha antiga falha e uma chamada REST com a chave antiga retorna 401. Não executado; a verificação feita está na tabela abaixo
- [x] Histórico do git limpo (veja [limpeza-do-historico.md](limpeza-do-historico.md))

## Registro

Projeto: `ldqybkuvuxzgsgmnmzgs`, o mesmo do plano de 11/06 e do `.env.local.example`. É o projeto usado pelo sistema em produção na Vercel.

| Data | Credencial | Projeto | Quem rotacionou | Como foi verificado |
|---|---|---|---|---|
| 2026-10-05 | usuário de teste do plano de 11/06 (apagado) | `ldqybkuvuxzgsgmnmzgs` | Mateus Trevisan | O usuário não aparece mais em Authentication → Users |
| 2026-10-05 | chave publicável antiga, a mesma do `.env.local.example` (substituída pela `producao_2026_10`) | `ldqybkuvuxzgsgmnmzgs` | Mateus Trevisan | A chave antiga não aparece mais em API Keys. A Vercel recebeu a nova e foi publicada de novo, e o sistema em produção continuou funcionando |
| 2026-10-05 | chave secreta antiga (substituída pela `secreta_2026_10`) | `ldqybkuvuxzgsgmnmzgs` | Mateus Trevisan | A chave antiga não aparece mais em API Keys. O código não usa chave secreta, e a variável foi apagada da Vercel |
| 2026-10-05 | chaves legadas `anon` e `service_role` (desativadas) | `ldqybkuvuxzgsgmnmzgs` | Mateus Trevisan | Desativadas em API Keys → Legacy API Keys. O sistema já usava a publicável, então nada parou |

Observações:

- **Ordem.** A limpeza do histórico aconteceu antes da rotação, o contrário do que este documento recomenda. Quem clonou o repositório antes da limpeza ainda tem os valores antigos, mas eles deixaram de funcionar em 05/10.
- **JWT secret.** O *JWT secret* legado do projeto não aparece no histórico do git e não foi rotacionado. Uma cópia dele estava nas variáveis da Vercel sem uso pelo código, e foi apagada em 05/10.

Não escreva o valor das chaves aqui. Registre só o nome e a data.

## Onde as variáveis ficam agora

- **Máquina de cada pessoa:** `.env.local`, ignorado pelo `.gitignore`. O modelo versionado (`.env.local.example`) aponta para o Supabase local, que roda em Docker e não tem dado real.
- **Esteira (GitHub Actions):** os testes de fumaça sobem um Supabase local descartável, então a esteira não precisa de chave de projeto hospedado.
- **Hospedagem (Vercel):** variáveis de ambiente do projeto na Vercel, só em Production. A chave pública fica em `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Chave secreta e *JWT secret* não ficam lá, porque o código não usa nenhuma das duas.
