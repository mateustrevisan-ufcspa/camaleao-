# Sprint 3 · progresso

**Período:** 10/10 a 16/10/2026 · **Situação:** em encerramento · **Atualizado em:** 16/10/2026, 10h45 (conferido no GitHub e no Trello)

Plano da sprint: [README.md](README.md).

## Resumo

- **As quatro stories integradas à `main`, 13 de 13 SP.** TS-01 (#17), SEC-05 (#20), US-06 (#19) e US-07 (#21), na ordem planejada, cada uma integrada por quem implementou. A US-07 entrou às 10h21 de 16/10, antes do meio-dia.
- **Esteira verde na `main` depois de cada um dos quatro merges.**
- **O que deu errado no processo:** de 12/10 a 14/10 não houve nenhum commit, revisão ou merge. As quatro revisões ficaram para a noite de 15/10 e os quatro merges entraram em 11h23 (das 22h58 de 15/10 às 10h21 de 16/10), e não um por dia. A branch da US-07 abriu em 15/10, dois dias depois do prazo.
- **Falta para fechar:** mover a US-06 para Concluído no Trello (Alissa), confirmar e registrar as três migrações em produção (Mateus), retrospectiva, relatório e vídeos (equipe), nova aprovação e merge deste PR #16.

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
| [TS-01](TS-01.md) · Regras de TypeScript no lint | Technical | 2 | Laís | Bibiana | `ts-01-lint-typescript` | #17 | **Concluída.** Aprovada pela Bibiana (15/10, 20h52) e integrada pela Laís (15/10, 22h58). Trello em Concluído |
| [SEC-05](SEC-05.md) · Minimização de dados pessoais expostos | User | 3 | Mateus | Alissa | `sec-05-minimizacao-de-dados` | #20 | **Concluída.** Aprovada pela Alissa (15/10, 22h16 e de novo às 23h24) e integrada pelo Mateus (15/10, 23h27). Trello em Concluído. Migração em produção: conferida em 19/10, já estava aplicada |
| [US-06](US-06.md) · Busca de pessoa em qualquer tela | User | 3 | Alissa | Laís | `us-06-busca-de-pessoa` | #19 | **Concluída.** Aprovada pela Laís (15/10, 22h53) e integrada pela Alissa (16/10, 7h22). Trello ainda em Em revisão às 10h28 de 16/10. Migração em produção: conferida em 19/10, já estava aplicada |
| [US-07](US-07.md) · Contato e consentimento de mensagens | User | 5 | Bibiana | Mateus | `us-07-consentimento-de-mensagens` | #21 | **Concluída.** Aprovada pelo Mateus (15/10, 21h48), com 8 testes de fumaça e 19 de acesso na máquina dele, e integrada pela Bibiana (16/10, 10h21). Trello em Concluído. Migração em produção: aplicada pelo Mateus só em 19/10, três dias depois do merge |

## Ações da retrospectiva de 09/10

| Ação | Responsável | Prazo | Situação |
| --- | --- | --- | --- |
| Abrir a branch de cada story e fazer o primeiro push | Laís, Mateus, Alissa e Bibiana | 13/10 | Laís (10/10), Alissa (11/10) e Mateus (11/10) no prazo. Bibiana em 15/10, 20h12, fora do prazo |
| Revisar no GitHub, com Approve, no dia em que o PR sai do rascunho | Bibiana (TS-01), Alissa (SEC-05), Laís (US-06) e Mateus (US-07) | No dia | Cumprida só na US-07 (PR aberto às 20h31 e aprovado às 21h48 de 15/10). TS-01, SEC-05 e US-06 esperaram de 4 a 5 dias |
| Quem implementou faz o merge e move o cartão no mesmo dia | Quem implementa cada story | No dia do merge | Merge cumprido nas quatro. Cartão movido na TS-01, na SEC-05 e na US-07; a US-06 seguia em Em revisão às 10h28 de 16/10 |
| Aplicar em produção a migração de cada PR, colada ao merge | Mateus | No dia do merge | Não cumprida. Conferência de 19/10: SEC-05 e US-06 aplicadas, sem registro da data; US-07 aplicada só em 19/10, três dias depois do merge |
| Conferência do meio da sprint: o que segue e o que volta ao backlog | Mateus, com a equipe | 14/10 | Sem registro |

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
| 12/10 a 14/10 | Nenhum commit, revisão ou merge no GitHub. Sem registro da conferência do meio da sprint (14/10) |
| 15/10 | Bibiana sobe a US-07 (commit `800421e`, 20h10; branch criada às 20h12) e abre o PR #21 (20h31). Esteira verde |
| 15/10 | Bibiana aprova a TS-01 (20h52) |
| 15/10 | Mateus aprova a US-07 (21h48): leitura da migração, das actions e dos testes, 8 testes de fumaça e 19 de acesso na máquina dele, registro e retirada da autorização na ficha como caixa |
| 15/10 | Alissa aprova a SEC-05 (22h16) |
| 15/10 | Laís aprova a US-06 (22h53) |
| 15/10 | Laís integra a TS-01 (PR #17, 22h58) |
| 15/10 | Mateus traz a `main` para a SEC-05 (23h21); Alissa aprova de novo (23h24); Mateus integra o PR #20 (23h27) |
| 15/10 | Alissa traz a `main` para a US-06 (23h35) |
| 15/10 | Texto do termo de mensagens (versão `2026-10`) enviado à Flávia para aprovação |
| 16/10 | Alissa integra a US-06 (PR #19, 7h22) |
| 16/10 | Bibiana traz a `main` para a US-07 (10h16) e integra o PR #21 (10h21), com a aprovação do Mateus mantida |
| 16/10 | Bibiana aprova o PR #16 (10h27) |
| 16/10 | Conferência no Trello às 10h28: TS-01, SEC-05 e US-07 em Concluído; US-06 ainda em Em revisão |
| 16/10 | Mateus traz a `main` para o PR #16 (commit `db53c2e`) e atualiza este progresso e o índice das sprints |
| 19/10 | Mateus confere as migrações no SQL Editor do projeto hospedado: SEC-05 (coluna de CPF removida, `telefone_da_pessoa`) e US-06 (`buscar_pessoas`, apelido) já estavam aplicadas; a US-07 não estava. Aplica a `20261013090000_consentimento_de_mensagens` e confere `message_consents` e `message_recipients`. De 16/10 a 19/10 o sistema publicado ficou sem a tabela de autorização de mensagens |

## Encerramento

Preenchido em 16/10, às 10h45, a partir do GitHub e do Trello. Retrospectiva, relatório e vídeos ainda não tinham acontecido nessa hora.

- **Stories concluídas e velocity (por tipo):** 4 de 4, **13 de 13 SP**. User stories: 11 SP (SEC-05, 3; US-06, 3; US-07, 5). Technical stories: 2 SP (TS-01). Nenhuma story volta ao backlog.
- **O que passa para a Sprint 4:** nenhuma story da Sprint 3. Seguem como pendência:
  - confirmar e registrar a aplicação em produção das migrações `20261010090000_minimizacao_de_dados`, `20261012090000_busca_de_pessoa` e `20261013090000_consentimento_de_mensagens` (Mateus). Resolvido em 19/10: as duas primeiras já estavam aplicadas e a terceira foi aplicada nesse dia;
  - aprovação do termo de mensagens pela Flávia (enviado em 15/10; até a resposta, vale a versão `2026-10`);
  - o caminho para a própria pessoa retirar a autorização sozinha, anotado para a US-21;
  - as que vêm da Sprint 2: resposta da Flávia às cinco decisões da matriz de permissões, conta da coordenação do Instituto em produção, atualização do Product Backlog e do Projeto Arquitetural (Mateus, prazo 13/10 vencido) e o item das 7 vulnerabilidades altas em dependências de desenvolvimento, ainda sem estimativa;
  - a US-05 segue no topo do backlog para a Sprint 4.
- **Desvios entre planejado e realizado:**
  - O escopo foi entregue inteiro e na ordem planejada (TS-01, SEC-05, US-06, US-07), mas o calendário não foi seguido. O plano previa TS-01 e SEC-05 integradas em 14/10 e a US-06 em 15/10; as três entraram entre 22h58 de 15/10 e 7h22 de 16/10.
  - De 12/10 a 14/10 o GitHub não teve atividade. A conferência do meio da sprint não tem registro.
  - As revisões da TS-01 (PR aberto em 10/10), da US-06 e da SEC-05 (PRs abertos em 11/10) só aconteceram na noite de 15/10.
  - A regra de um merge por dia não foi cumprida: os quatro merges entraram em 11h23.
  - A branch da US-07 abriu em 15/10, e não até 13/10. Mesmo assim, a story foi implementada, revisada e integrada dentro do prazo do meio-dia de 16/10.
  - Trazer a `main` sem conflito manteve a aprovação na US-07, como já tinha sido visto no PR #11.
- **Lições da retrospectiva:** a preencher depois da retrospectiva de 16/10.
