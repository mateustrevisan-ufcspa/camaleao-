# Sprint 1 · progresso

**Período:** 25/09 a 02/10/2026 · **Situação:** encerrada · **Atualizado em:** 05/10/2026

Plano da sprint: [README.md](README.md).

## Resultado

| | Planejado | Realizado |
| --- | --- | --- |
| Histórias | 5 | 1 em Concluído no quadro (US-01) |
| Story Points | 21 | 2 no quadro |
| Código integrado à `main` | 5 Pull Requests | Nenhum |

As cinco histórias foram implementadas em 01/10, cada uma com seu Pull Request. Nenhuma entrou na `main` até o fim da sprint: faltaram revisões, um registro e os merges. Os 19 SP restantes seguiram para a Sprint 2 como pendência, com pouco esforço por fazer.

## Situação de cada história no encerramento (02/10)

| História | SP | PR | Branch | Situação em 02/10 | Destino |
| --- | --- | --- | --- | --- | --- |
| SEC-01 · Rotação de credenciais e remoção de segredos | 3 | #2 | `sec-01/remover-segredos` | Mudanças solicitadas pela Bibiana: registro de rotação sem datas | Sprint 2 |
| US-01 · Documentação de instalação | 2 | #3 | `us-01/readme` | Validada pela Alissa em 12 min (registro no Trello); sem revisão no GitHub | Concluído no quadro; o PR segue na fila da Sprint 2 |
| US-02 · Testes de fumaça das rotas críticas | 5 | #4 | `us-02/testes-de-fumaca` | Aprovado pela Laís, esteira verde | Sprint 2 |
| US-03 · Esteira de integração contínua | 3 | #5 | `us-03/esteira-ci` | Aprovado pela Laís; `main` sem regra de proteção | Sprint 2 |
| US-26 · Dependências com suporte de segurança ativo | 8 | #6 | `us-26/next-16` | Esteira verde, sem revisão | Sprint 2 |

O acompanhamento dessas pendências continua em [../sprint-2/PROGRESSO.md](../sprint-2/PROGRESSO.md).

## O que a sprint produziu

- **SEC-01:** segredos removidos dos arquivos e do histórico do git. Validação independente da Bibiana em clone novo, com gitleaks sem achados nos 35 commits.
- **US-01:** README com banco local, do zero ao sistema rodando em 12 minutos na validação.
- **US-02:** testes de fumaça com Playwright para login, venda e doação, contra o Supabase local.
- **US-03:** esteira no GitHub Actions com lint, build e testes de fumaça.
- **US-26:** migração do Next.js 14 para o 16 e do React 18 para o 19. O `npm audit` foi de 11 vulnerabilidades (8 altas e 1 crítica) para zero.
- **Documentos:** `docs/seguranca/` (rotação, limpeza do histórico, auditoria de dependências) e `docs/processo/protecao-da-main.md`, todos ainda nas branches.

## Decisões

- **Sprints de uma semana**, de sexta a sexta. A Sprint 1 começou em 25/09, 18 dias depois do previsto no plano.
- **US-03 dividida.** A esteira ficou com 3 SP e a atualização de dependências virou a US-26, com 8 SP, porque o Next.js 14 está sem suporte de segurança desde 26/10/2025 e a correção exigiu migrar para o 16.
- **SEC-02 adiada para a Sprint 2:** a auditoria de dependências só pode bloquear merge depois da US-26.
- **Repositório público com credencial de teste no histórico:** tratado como incidente. Primeiro a rotação, depois a limpeza.

## Lições (leitura dos fatos, a validar com a equipe na retrospectiva)

- **Pull Requests empilhados travaram a fila.** Cada PR foi aberto sobre a branch do anterior, então nenhum podia entrar na `main` antes do primeiro. Na Sprint 2, todo PR tem a `main` como base.
- **Cartão em Concluído antes do merge.** O quadro chegou a mostrar tudo concluído sem que o GitHub confirmasse. Na Sprint 2, o cartão só vai para Concluído depois do merge.
- **Implementação concentrada em uma pessoa.** O Mateus implementou as cinco histórias e as colegas validaram. Na Sprint 2, cada integrante implementa uma parte.
- **Revisão no último dia.** As aprovações ficaram para 02/10 e não houve tempo de responder ao pedido de mudança da SEC-01.

## Registro

| Data | O que aconteceu |
| --- | --- |
| 01/10 | Planejamento registrado no Trello. US-03 dividida, US-26 criada, SEC-02 adiada. Sprint fechada em 21 SP |
| 01/10 | Implementação das cinco histórias, um commit e um PR por história (#2 a #6) |
| 01/10 | Bibiana valida a SEC-01 em clone novo com gitleaks |
| 01/10 | Alissa sobe o projeto só pelo README em 12 minutos |
| 02/10 | Bibiana pede mudanças no PR #2: registro de rotação sem datas |
| 02/10 | Laís aprova os PRs #4 e #5 e testa a esteira com os PRs de teste #7 e #8 |
| 02/10 | Fim da sprint. No quadro, US-01 em Concluído; as outras quatro em Em revisão e Em andamento |
