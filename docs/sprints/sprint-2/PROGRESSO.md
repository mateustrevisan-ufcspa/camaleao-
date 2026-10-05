# Sprint 2 · progresso

**Período:** 03/10 a 09/10/2026 · **Situação:** em andamento · **Atualizado em:** 05/10/2026, 20h (conferido no GitHub e no Trello)

Plano da sprint: [README.md](README.md).

## Resumo

- **Nada foi integrado à `main` ainda.** A fila de merges da Sprint 1, prevista para segunda 05/10, não andou. Todo o resto depende dela.
- **Histórias novas não iniciadas:** não existe branch de SEC-02, US-23 nem SEC-03.
- **Próximo passo de quem:** Mateus (registro de rotação), depois Bibiana (PR #2) e Alissa (PRs #3 e #6).

## Fechamento da Sprint 1 (19 SP)

Guia: [FECHAMENTO-SPRINT-1.md](FECHAMENTO-SPRINT-1.md). Ordem dos merges: #2, #3, #4, #5, #6.

| História | SP | PR | Situação em 05/10 | Falta | Quem |
| --- | --- | --- | --- | --- | --- |
| SEC-01 | 3 | #2 | Pedido de mudança da Bibiana (02/10) ainda aberto. Alissa aprovou em 05/10, o que não resolve o pedido | Datas em `docs/seguranca/rotacao-de-credenciais.md`, aprovação da Bibiana, merge | Mateus, Bibiana |
| US-01 | 2 | #3 | Sem revisão no GitHub | Aprovação, merge | Alissa, Mateus |
| US-02 | 5 | #4 | Aprovado pela Laís (02/10) | Merge | Mateus |
| US-03 | 3 | #5 | Aprovado pela Laís (02/10) e pela Alissa (05/10) | Merge, proteção da `main`, conferência do bloqueio | Mateus, Laís |
| US-26 | 8 | #6 | Esteira verde. Sem revisão no GitHub. Navegação pelos fluxos marcada como feita no Trello em 05/10, sem anotação no cartão | Anotar o resultado da navegação, aprovação, merge | Alissa, Mateus |

Outros itens do fechamento:

- [ ] Proteção da `main` ativa (hoje não existe regra)
- [ ] PRs de teste #7 e #8 fechados
- [ ] Novo PR de teste contra a `main` mostrando o merge bloqueado
- [ ] Cartões SEC-01, US-02, US-03 e US-26 em Concluído, cada um depois do seu merge

## Histórias novas (15 SP)

| História | SP | Implementa | Revisa | Branch | PR | Situação |
| --- | --- | --- | --- | --- | --- | --- |
| [SEC-02](SEC-02.md) · Varredura de segredos e auditoria na esteira | 2 | Bibiana | Mateus | `sec-02-varredura-auditoria` | | Não iniciada. Depende da fila de merges |
| [US-23](US-23.md) · Permissões por perfil | 8 | Mateus e Alissa | Bibiana | `us-23-permissoes-por-perfil` | | Não iniciada. Matriz de permissões prevista para 06/10 |
| [SEC-03](SEC-03.md) · Testes de controle de acesso | 5 | Laís | Alissa | `sec-03-testes-de-acesso` | | Não iniciada. Depende da US-23 |

### US-23 por parte

- [ ] Parte A: matriz de permissões em `docs/seguranca/matriz-de-permissoes.md` (Alissa)
- [ ] Matriz enviada à Flávia; planilha do brechó pedida (Mateus)
- [ ] Parte B: migração, seeds por perfil, login e `proxy.ts` (Mateus)
- [ ] Parte C: menu e painel por perfil (Alissa)
- [ ] Validação de segurança pela API (Bibiana)

## Pontos de atenção

- **Aprovações nos PRs trocados.** Em 05/10 a Alissa aprovou os PRs #2 e #5. As aprovações que faltam dela são nos PRs #3 e #6. O item "Aprovar o PR #3" está marcado no Trello, mas o PR #3 segue sem revisão no GitHub.
- **Um dia de atraso no fechamento.** Sobram quatro dias para as três histórias novas. Se a fila não fechar na terça, a SEC-03 é a primeira candidata a passar para a Sprint 3, porque depende da US-23.
- **Os guias desta pasta ainda não estão na `main`.** Estão na branch `docs/sprint-2-guias`.
- **Decisões que esperam confirmação:** o balcão enxergar só o que foi lançado no dia, e voluntária e caixa terem as mesmas permissões. As duas estão na proposta de matriz da US-23 e dependem da Alissa e da Flávia.
- **Estimativas da sprint** (SEC-02 em 2, US-23 em 8, SEC-03 em 5) foram propostas no planejamento e ainda não foram confirmadas pela equipe.

## Decisões

| Data | Decisão |
| --- | --- |
| 04/10 | Sprint 2 com três histórias novas (SEC-02, US-23, SEC-03), 15 SP. SEC-05 e US-07 ficam para a Sprint 3 |
| 04/10 | Cada integrante implementa uma parte, com revisão cruzada |
| 04/10 | Todo Pull Request tem a `main` como base; cartão só vai para Concluído depois do merge |
| 04/10 | As pendências da Sprint 1 contam na velocity da Sprint 2, salvo orientação diferente da professora |

## Registro

| Data | O que aconteceu |
| --- | --- |
| 04/10 | Planejamento: conferência do Trello e do GitHub, seleção das histórias e divisão do trabalho |
| 04/10 | Trello atualizado: lista da Sprint 2, etiqueta, 36 tarefas com responsável e membros nos cartões novos |
| 04/10 | Guias da sprint escritos e enviados na branch `docs/sprint-2-guias` |
| 05/10 | Alissa aprova os PRs #5 e #2 |
| 05/10 | No Trello, cartão da US-26: itens "Aprovar o PR #3" e "Navegar pelos fluxos" marcados como feitos |
| 05/10 | Criados o índice `docs/sprints/README.md` e os arquivos `PROGRESSO.md` das Sprints 1 e 2 |

## Encerramento (preencher em 09/10)

- **Histórias concluídas e velocity:**
- **O que passa para a Sprint 3:**
- **Desvios entre planejado e realizado:**
- **Lições da retrospectiva:**
