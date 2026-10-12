# Sprint 3 · progresso

**Período:** 10/10 a 16/10/2026 · **Situação:** em andamento · **Atualizado em:** 11/10/2026, 22h (conferido no GitHub)

Plano da sprint: [README.md](README.md).

## Resumo

- **Três das quatro stories em Pull Request, com esteira verde, antes do feriado:** TS-01 (#17), US-06 (#19) e SEC-05 (#20). **Nenhuma revisão ainda.**
- **US-07 sem branch.** O prazo do primeiro push é terça 13/10.
- **As branches se juntam sem conflito.** Em 11/10 os merges foram simulados em pares e com TS-01, SEC-05 e US-06 juntas sobre a `main`: nenhum conflito.
- **Próximo passo de quem:** Bibiana (revisar o #17 e abrir a US-07), Alissa (revisar o #20), Laís (revisar o #19), qualquer integrante (aprovar o #16, só documentação).

## Ponto de partida: como a Sprint 2 terminou

Conferido em 09/10 às 16h30, antes do encerramento das 17h.

- **SEC-02:** PR #13 integrado à `main` em 09/10 às 16h18.
- **SEC-03:** PR #11 aberto, com a `main` trazida para a branch às 16h22. Esse commit derruba a aprovação anterior; falta nova aprovação e o merge.
- **PR #12** (progresso da Sprint 2) e **PR #15** (teste de segredo falso da SEC-02) abertos.
- No Trello, SEC-02 e SEC-03 já estão em Concluído.

A Sprint 3 parte da situação registrada no relatório da Sprint 2: SEC-02 e SEC-03 concluídas. **Se o PR #11 não for integrado no encerramento, a SEC-03 (5 SP) volta ao topo desta sprint** e a seleção precisa ser refeita na abertura, porque 13 + 5 passa da velocity estimada.

Preencher na abertura da sprint:

- [x] PR #11 integrado à `main` (Laís, 10/10, 0h05). A SEC-03 não volta para esta sprint
- [x] PR #15 fechado sem merge (09/10, 16h20) e branch `teste-segredo-bloqueio` apagada
- [x] Encerramento da Sprint 2 no `PROGRESSO.md` dela: o PR #12 foi incorporado ao PR #16 em 11/10

## Stories (13 SP)

| Story | Tipo | SP | Implementa | Revisa | Branch | PR | Situação |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [TS-01](TS-01.md) · Regras de TypeScript no lint | Technical | 2 | Laís | Bibiana | `ts-01-lint-typescript` | #17 | Em PR desde 10/10, esteira verde, bloqueio provado no PR #18. Aguarda revisão |
| [SEC-05](SEC-05.md) · Minimização de dados pessoais expostos | User | 3 | Mateus | Alissa | `sec-05-minimizacao-de-dados` | #20 | Em PR desde 11/10, esteira verde, 12 de 12 testes de acesso na máquina do Mateus. Aguarda revisão |
| [US-06](US-06.md) · Busca de pessoa em qualquer tela | User | 3 | Alissa | Laís | `us-06-busca-de-pessoa` | #19 | Em PR desde 11/10, esteira verde. Aguarda revisão |
| [US-07](US-07.md) · Contato e consentimento de mensagens | User | 5 | Bibiana | Mateus | `us-07-consentimento-de-mensagens` | | Não iniciada. Sem branch em 11/10 |

## Ações da retrospectiva de 09/10

| Ação | Responsável | Prazo | Situação |
| --- | --- | --- | --- |
| Abrir a branch de cada story e fazer o primeiro push | Laís, Mateus, Alissa e Bibiana | 13/10 | Laís (10/10), Alissa (11/10) e Mateus (11/10) feitos; falta Bibiana |
| Revisar no GitHub, com Approve, no dia em que o PR sai do rascunho | Bibiana (TS-01), Alissa (SEC-05), Laís (US-06) e Mateus (US-07) | No dia | |
| Quem implementou faz o merge e move o cartão no mesmo dia | Quem implementa cada story | No dia do merge | |
| Aplicar em produção a migração de cada PR, colada ao merge | Mateus | No dia do merge | |
| Conferência do meio da sprint: o que segue e o que volta ao backlog | Mateus, com a equipe | 14/10 | |

## Pontos de atenção

- **Três stories mexem na ficha da pessoa.** O README tem a tabela de quem toca em quê. Os guias foram montados para as branches se juntarem sem conflito; isso depende de cada mudança entrar no lugar indicado.
- **SEC-05 apaga a coluna de CPF, sem volta.** Antes, conferir em produção se há CPF gravado (guia, passo 2). Se houver, a decisão é do Instituto.
- **O texto do termo de mensagens (US-07) é uma proposta da equipe.** Precisa da aprovação do Instituto. Até a resposta, vale a versão `2026-10`.
- **TS-01 ainda não tem critérios confirmados pela equipe.** O guia traz uma proposta. A estimativa de 2 SP pode estar alta: na conferência de 09/10 o código da `main` não tinha nada a corrigir com as regras novas.
- **Os testes de acesso das três stories dependem da pasta `tests/acesso`,** que chega à `main` com o PR #11.
- **Um merge por dia.** A regra da `main` exige a branch atualizada.
- **Trazer a `main` sem conflito não derruba a aprovação.** Visto no PR #11: aprovado pela Alissa às 13h35 de 09/10, atualizado pelo botão do GitHub às 16h22 e integrado à 0h05 com a mesma aprovação. A aprovação cai quando o push muda o que o PR altera (correção, conflito resolvido à mão). Quem atualiza a branch não pode ser a revisora, porque a aprovação precisa ser de alguém que não fez o último push.
- **SEC-05: conferência em produção feita em 11/10.** Nenhum registro com CPF e nenhum com `notes`. A remoção da coluna segue sem depender do Instituto.
- **Pendências que seguem da Sprint 2:** resposta da Flávia às cinco decisões da matriz de permissões; conta da coordenação do Instituto em produção; atualização do Product Backlog e do Projeto Arquitetural (Mateus, até 13/10); item do backlog para as 7 vulnerabilidades altas das dependências de desenvolvimento, ainda sem estimativa.
- **Fora desta sprint por dependerem do Instituto:** US-04 (correção e cancelamento) e SEC-04 (trilha de auditoria). A US-05 fica no topo para a Sprint 4.

## Decisões

| Data | Decisão |
| --- | --- |
| 09/10 | Sprint 3 com SEC-05, US-07, US-06 e TS-01, 13 SP, uma story por integrante, cada uma revisando a de outra |
| 09/10 | Ordem de integração da menor para a maior: TS-01, SEC-05, US-06, US-07, um merge por dia |
| 09/10 | SEC-05: a máscara do telefone vale no banco (leitura da coluna fechada e função única de leitura), e não só na tela |
| 09/10 | US-06: a busca roda no banco e devolve só o final do telefone; o apelido não entra na `clients_view` nesta sprint |
| 09/10 | US-07: a autorização é um histórico que só cresce, com data e autoria preenchidas pelo servidor; a trava de envio é a view `message_recipients` |
| 09/10 | TS-01: variável não usada vira erro e o lint deixa de aceitar aviso, porque só acrescentar as regras não reprovaria a esteira |
| 09/10 | Nesta sprint, a migração entra em produção depois da aprovação e antes do merge, porque as três são compatíveis com o código que está no ar |

| 11/10 | O PR #12 (progresso da Sprint 2) é incorporado ao PR #16, para a documentação entrar em um merge só, antes de qualquer PR de código ser aprovado |
| 11/10 | A ordem de integração continua TS-01, SEC-05, US-06 e US-07 |

As decisões de desenho das quatro stories são propostas do planejamento. A equipe confirma ou muda na abertura da sprint, e o que mudar entra como linha nova aqui.

## Registro

| Data | O que aconteceu |
| --- | --- |
| 09/10 | Planejamento inicial da Sprint 3 entregue à disciplina (4 stories, 13 SP) |
| 09/10 | Conferência do GitHub às 16h30: PR #13 integrado às 16h18; PR #11 aberto, com a `main` trazida às 16h22 |
| 09/10 | Guias das quatro stories escritos em `docs/sprints/sprint-3/`, com o código conferido em banco, API, tipos, lint e build |
| 09/10 | Trello: lista "Selecionado · Sprint 3 (10/10 a 16/10) · 13 SP" com os quatro cartões, cartão novo da TS-01 com critérios propostos, descrições atualizadas e 40 tarefas com responsável. Ficaram por fazer à mão: etiqueta Sprint 3, etiquetas de tipo e membros nos cartões |
| 09/10 | Guias enviados na branch `docs-sprint-3-guias` (PR #16) |
| 10/10 | Laís integra o PR #11 (0h05) e aprova o PR #16 (0h18) |
| 10/10 | Laís sobe a TS-01 (commits `8cbfa4e`, 1h43, e `6fe41d5`, 2h05) e abre o PR #17 (1h58). Esteira verde |
| 10/10 | Laís prova o bloqueio da TS-01: PR #18 com variável não usada de propósito, esteira reprovada no lint, fechado sem merge (2h58 a 3h02). Registro no PR #17 (3h04) |
| 11/10 | Alissa sobe a US-06 (commit `4d161a8`, 17h32) e abre o PR #19 (17h49). Esteira verde |
| 11/10 | Mateus confere em produção: 0 registros com CPF e 0 com `notes` |
| 11/10 | Mateus sobe a SEC-05 (commits `3af7101`, 21h18, e `7a75814`, 21h22) e abre o PR #20 (21h22), com a Alissa de revisora. Na máquina dele: lint, build, testes de fumaça e 12 de 12 testes de acesso verdes; máscara e edição conferidas na tela como caixa e como coordenação |
| 11/10 | Simulação dos merges de TS-01, SEC-05, US-06 e dos PRs de documentação, em pares e juntos: nenhum conflito |
| 11/10 | PR #12 incorporado ao PR #16, com o encerramento da Sprint 2 e este progresso atualizados |

## Encerramento (preencher em 16/10)

- **Stories concluídas e velocity (por tipo):**
- **O que passa para a Sprint 4:**
- **Desvios entre planejado e realizado:**
- **Lições da retrospectiva:**
