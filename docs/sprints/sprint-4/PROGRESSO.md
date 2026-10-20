# Sprint 4 · progresso

**Período:** 17/10 a 23/10/2026 · **Situação:** em andamento · **Atualizado em:** 20/10/2026, 10h (conferido no GitHub)

Plano da sprint: [README.md](README.md).

## Resumo

- **Planejada em 16/10:** 6 user stories, 31 SP, na ordem do roadmap. A US-08 (13 SP) foi quebrada em US-08b (8) e US-08a (5).
- **16/10:** nada começado ainda. Primeira meta: as seis branches com push até segunda 19/10.
- **18/10, à noite:** PR #22 integrado (Alissa, 17/10). Branches no GitHub: US-05 e US-08a (Alissa) e US-08b (Mateus, com o código escrito e ainda sem commit). Faltam as da US-10 (Bibiana) e da US-11 (Laís).
- **19/10, 18h07:** US-08b integrada (#25). US-05 (#23) aprovada e pronta para o merge. US-10 (#26) com esteira verde, esperando a revisão do Mateus. US-08a (#24) com a esteira vermelha até trazer a `main`. A branch da US-11 ainda não existe, e o prazo era hoje.
- **20/10, 10h:** US-05 (#23), US-10 (#26) e US-08a (#24) integradas na noite de 19/10: **21 de 31 SP concluídos.** US-11 (#29) com esteira verde, esperando a revisão da Bibiana. A branch da US-12 ainda não existe; a Laís combinou entregar hoje.
- **Replanejamento de 20/10:** mais 7 user stories, 27 SP (US-22, US-14, US-20, US-17, US-15, US-18 e US-13). A sprint passa a **58 SP**. Plano, calendário e regras de corte no [README](README.md#replanejamento-de-2010).

## Ponto de partida: como a Sprint 3 terminou

- As quatro stories da Sprint 3 integradas à `main` (13 de 13 SP); detalhes no [progresso da Sprint 3](../sprint-3/PROGRESSO.md).
- PR #16 (guias da Sprint 3) integrado; a `main` de 16/10 é a base destes guias.
- Burndown de 16/10: 121 SP no backlog, 5 sprints pela frente, cerca de 25 SP por sprint para zerar.

## Stories (58 SP)

Planejadas em 16/10 (31 SP):

| Story | Tipo | SP | Implementa | Revisa | Branch | PR | Situação |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [US-10](US-10.md) · Histórico unificado na ficha da pessoa | User | 3 | Bibiana | Mateus | `us-10-historico-unificado` | #26 | **Concluída.** Aprovada pelo Mateus (19/10, 18h18) e integrada pela Bibiana (19/10, 21h38). Sem migração |
| [US-05](US-05.md) · Venda registrada em poucos toques | User | 5 | Alissa | Laís | `us-05-venda-em-poucos-toques` | #23 | **Concluída.** Aprovada pela Laís (19/10, 17h45 e 18h32) e integrada pela Alissa (19/10, 18h35). Aplicação da migração `20261019090000_atalhos_da_venda` em produção ainda não registrada |
| [US-08b](US-08b.md) · Mesclagem de duas fichas | User | 8 | Mateus | Alissa | `us-08b-mesclagem-de-fichas` | #25 | **Concluída.** Aprovada pela Alissa (19/10, 11h17) e integrada pelo Mateus (19/10, 11h21). Migração aplicada em produção pelo Mateus no mesmo dia |
| [US-11](US-11.md) · Doação de itens com categorias editáveis | User | 5 | Laís | Bibiana | `us-11-categorias-de-doacao` | #29 | Em revisão. PR aberto pela Laís em 19/10, 23h47; esteira verde; falta a revisão da Bibiana |
| [US-08a](US-08a.md) · Sugestão de possíveis repetidos | User | 5 | Alissa | Mateus | `us-08a-possiveis-repetidos` | #24 | **Concluída.** `main` trazida, aprovada pelo Mateus (19/10, 21h45) e integrada pela Alissa (19/10, 21h53). Aplicação da migração `20261021090000_possiveis_repetidos` em produção ainda não registrada |
| [US-12](US-12.md) · Doação vinculada a um evento | User | 5 | Laís | Alissa | `us-12-doacao-de-evento` | | Não iniciada. A Laís combinou entregar hoje (20/10). Pelo replanejamento, integra até quarta 21/10 à noite, ou a US-13 volta ao backlog |

Acrescentadas no replanejamento de 20/10 (27 SP):

| Story | Tipo | SP | Implementa | Revisa | Branch | PR | Situação |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [US-22](US-22.md) · Aniversariantes do mês | User | 1 | Bibiana | Mateus | `us-22-aniversariantes-do-mes` | | Não iniciada. Meta: PR hoje (20/10), integrada na quarta 21/10 |
| [US-14](US-14.md) · Toda doação vinculada a uma ficha | User | 3 | Alissa | Bibiana | `us-14-doacao-com-ficha` | | Não iniciada. Começa depois do merge da US-11. Meta: PR na quarta 21/10, integrada à noite, depois da US-12 |
| [US-20](US-20.md) · Acompanhamento de doadores recorrentes | User | 3 | Bibiana | Laís | `us-20-doadores-recorrentes` | | Não iniciada. Começa depois do merge da US-22. Meta: PR na quarta 21/10, integrada na quinta 22/10 |
| [US-17](US-17.md) · Relatório consolidado do Instituto | User | 5 | Alissa | Mateus | `us-17-relatorio-consolidado` | | Não iniciada. Começa depois do PR da US-14. Meta: PR na quarta 21/10 à noite, integrada na quinta 22/10 |
| [US-15](US-15.md) · Contribuição total da pessoa no período | User | 8 | Mateus | Alissa | `us-15-contribuicao-no-periodo` | | Não iniciada. Meta: PR na quinta 22/10, integrada na sexta 23/10 (primeiro merge) |
| [US-18](US-18.md) · Exportação dos relatórios em planilha | User | 2 | Alissa | Bibiana | `us-18-exportacao-em-planilha` | | Não iniciada. Começa depois do merge da US-17. Meta: PR na quinta 22/10, integrada na sexta 23/10, depois da US-15 |
| [US-13](US-13.md) · Doação vinculada a uma campanha | User | 5 | Laís | Mateus | `us-13-doacao-de-campanha` | | Não iniciada. Começa depois do merge da US-12. Meta: PR na quinta 22/10, integrada até o meio-dia de sexta 23/10 (último merge) |

## Conferência do meio da sprint (quarta 21/10)

Preencher na quarta à noite:

- [x] US-10 integrada à `main` (19/10, 21h38)
- [x] US-05 integrada à `main` (19/10, 18h35)
- [x] US-08b e US-11 em Pull Request (US-08b integrada em 19/10; US-11 com o PR #29)
- [ ] Decisão da regra de corte: a US-12 segue na sprint ou volta ao topo do backlog
- [ ] Quem participou e o que ficou combinado para quinta e sexta

Acrescentado no replanejamento de 20/10:

- [ ] US-22 e US-12 integradas à `main`
- [ ] US-14 integrada à `main`, depois da US-12
- [ ] US-20 e US-17 em Pull Request
- [ ] Regra de corte de 20/10: com a US-12 integrada, a US-13 segue; sem ela, a US-13 volta ao topo do backlog

## Conferência de quinta (22/10, à noite)

- [ ] US-20 e US-17 integradas à `main`
- [ ] US-15, US-18 e US-13 em Pull Request pronto para revisão
- [ ] Regra de corte: story nova sem Pull Request volta ao topo do backlog, registrada aqui
- [ ] Combinado para sexta: merges até o meio-dia, na ordem US-15, US-18 e US-13

## Pontos de atenção

- **Nenhum código dos guias foi executado no planejamento.** Quem implementa é a primeira pessoa a rodar migração, lint, build e testes. Trecho que não compilar: corrigir e registrar aqui.
- **Tipos novos em `lib/store.ts` vão na linha reservada** de cada story (README, "Onde as stories se encostam").
- **US-11 congela a tabela de tampinhas** e leva os registros para as doações de item. Antes de aplicar em produção, contar as linhas de `donations_caps`.
- **US-08a depende da tela da US-08b** para o link e o teste de fumaça: integra depois dela.
- **US-12 começa depois do PR da US-11** (mesma pessoa, mesmos arquivos).
- **Migrações da US-05 e da US-08a em produção:** as duas stories foram integradas em 19/10 e não há registro da aplicação no projeto hospedado. Conferir e aplicar `20261019090000_atalhos_da_venda` e `20261021090000_possiveis_repetidos`.
- **Os guias de 20/10 foram conferidos** (`tsc`, lint, build e SQL) num ambiente de conferência, mas os testes do Playwright não rodaram. Trecho que não passar: corrigir e registrar aqui.
- **US-14 muda o campo de doador:** a doação sem pessoa passa a exigir a marcação "Doação sem ficha". O guia dela traz o ajuste dos testes que já registram doação sem pessoa, inclusive o da US-12.
- **US-18 traz dependências novas** (`write-excel-file` e, em desenvolvimento, `fflate`). Depois do merge, todo mundo roda `npm ci`.
- **Merges de sexta em ordem:** US-15, US-18 e US-13, até o meio-dia. A US-13 integra por último porque acrescenta a campanha nas telas das outras duas e na da US-17.
- **Pendências que seguem:** resposta da Flávia (termo de mensagens, matriz de permissões, US-04 e SEC-04, planilha do brechó para a US-09, soft opening); Product Backlog e Projeto Arquitetural; item das 7 vulnerabilidades altas em dependências de desenvolvimento, sem estimativa.
- **Itens novos para o backlog, achados no planejamento:** data "de amanhã" depois das 21h nos formulários de doação em dinheiro e de item; remover a tabela `donations_caps` e o que sobrou dela depois da US-11; cartões "Receita recorrente / mês" e "Total de doadores" da tela de doações em dinheiro somando todas as doações, e não as do mês (o "Total recebido · mês" é corrigido na US-17).

## Decisões

| Data | Decisão |
| --- | --- |
| 16/10 | A equipe não renegocia o escopo com o Instituto e puxa mais stories nesta sprint para abrir folga no burndown |
| 16/10 | Sprint 4 com US-10, US-05, US-08b, US-11, US-08a e US-12, 31 SP, na ordem do roadmap (balcão, ficha única, doações) |
| 16/10 | US-08 (13 SP) quebrada em US-08b · Mesclagem de duas fichas (8) e US-08a · Sugestão de possíveis repetidos (5), mantendo os 13 SP |
| 16/10 | Fora: US-04 e SEC-04 (aguardam a Flávia), US-09 (sem a planilha), US-13 (terceira na ordem de corte) |
| 16/10 | Duas stories por pessoa, escalonadas; Bibiana com uma story menor e uma revisão |
| 16/10 | Regra de corte: sem US-10 e US-05 integradas na quarta à noite, a US-12 volta ao backlog; sem a US-08b na quinta à noite, a US-08a volta também |
| 16/10 | O Mateus escreve os guias. Preparação no PR de documentação: `lib/rotas.ts` com as telas da coordenação, um tipo por linha no import de `lib/store.ts` e as linhas da Sprint 4 na matriz de permissões |

| 20/10 | Replanejamento: com 21 de 31 SP integrados e a semana livre, a equipe puxa mais 27 SP em 7 user stories (US-22, US-14, US-20, US-17, US-15, US-18 e US-13). A sprint passa a 58 SP |
| 20/10 | Responsáveis: Alissa faz US-14, US-17 e US-18 em sequência; Bibiana faz US-22 e depois US-20; Mateus faz a US-15; Laís faz a US-13 depois da US-12 |
| 20/10 | Regras de corte: sem a US-12 integrada na quarta à noite, a US-13 volta ao backlog; story nova sem Pull Request na quinta à noite volta ao backlog |
| 20/10 | Merges de sexta, até o meio-dia, na ordem US-15, US-18 e US-13. A US-13 traz o passo que mostra a campanha na ficha (US-15), no relatório (US-17) e na planilha (US-18) |
| 20/10 | US-18 com a biblioteca `write-excel-file` (só escreve planilha, sem vulnerabilidade conhecida); a `exceljs` foi descartada (484 pacotes e um alerta moderado) |
| 20/10 | Seed da US-13 com a doação de campanha em julho, para não mudar os números de maio e junho conferidos pelos testes da US-15 e da US-17 |

As decisões de desenho de cada story estão no guia dela. São propostas do planejamento: a equipe confirma ou muda na abertura, e o que mudar entra como linha nova aqui.

## Registro

| Data | O que aconteceu |
| --- | --- |
| 16/10 | Planejamento da Sprint 4: 6 stories, 31 SP; guias escritos em `docs/sprints/sprint-4/` a partir da `main` de 16/10, sem execução de código |
| 16/10 | Trello: lista "Selecionado · Sprint 4 (17/10 a 23/10) · 31 SP" com os seis cartões; US-08 renomeada para US-08b (8 SP) e cartão novo da US-08a (5 SP), com os dois critérios dela; descrições com tipo, sprint, responsáveis, branch, guia e meta; checklist "Tarefas da Sprint 4" em cada cartão (56 tarefas) |
| 16/10 | Guias enviados na branch `docs-sprint-4-guias` (PR #22), com a preparação de código num commit separado |
| 16/10 | Ficou por fazer à mão no Trello: apagar o item do critério que passou da US-08b para a US-08a, etiqueta "Sprint 4" e membros nos cartões (a ferramenta não cria etiqueta nem atribui membro) |
| 17/10 | Alissa integra o PR #22 (20h29), abre a branch da US-05 (20h13) e sobe o commit `73beca5` (21h25) |
| 18/10 | Alissa sobe a US-08a (commit `722faaa`, 15h59), antes da US-08b, da qual depende para integrar |
| 18/10 | Mateus cria e envia a branch `us-08b-mesclagem-de-fichas`. Código do guia conferido contra a `main` (esquema, políticas, `lib/store.ts`, `ClientPicker`, seed e branches da US-05 e da US-08a) e escrito; único ajuste: `.last()` na segunda busca do teste de fumaça. Ainda sem migração aplicada nem testes rodados |
| 18/10 | Mateus roda a US-08b na máquina dele: `db:reset` aplica a migração `20261020090000_mesclagem_de_fichas` sem erro; lint sem aviso; build verde com a rota `/clientes/mesclar`; 9 de 9 testes de fumaça e 24 de 24 de acesso, os 5 novos da mesclagem incluídos. O código do guia rodou sem correção |
| 18/10 | Mateus sobe a US-08b (commit `d3b2a59`, 20h54) e abre o PR #25 |
| 19/10 | Mateus integra o PR #25 (11h21). A branch `us-08b-mesclagem-de-fichas` foi apagada no GitHub. A US-08a fica livre para trazer a `main` e ir para revisão |
| 17/10 | Alissa abre o PR #23 da US-05 (21h34) |
| 18/10 | Alissa abre o PR #24 da US-08a (16h05). A esteira reprova no teste de fumaça `repetidos.spec.ts`, que espera a tela da US-08b |
| 19/10 | Alissa aprova a US-08b (11h17), antes do merge do Mateus (11h21) |
| 19/10 | Bibiana sobe a US-10 (commits `ec6e9e4`, 15h16, e `9f99934`, 15h34) e abre o PR #26 (16h27), com o Mateus de revisor. Esteira verde |
| 19/10 | Laís aprova a US-05 (17h45); Alissa traz a `main` para a branch (18h01). Esteira verde |
| 19/10 | Conferência às 18h07: a branch da US-11 ainda não existe (prazo do primeiro push: hoje) |
| 19/10 | Leitura do PR #26 (US-10) para a revisão do Mateus: segue o guia, `getRegistroOriginal` valida o id e devolve `null` para tipo fora da lista. Guia da US-10 corrigido com a chave própria do histórico, achado da Bibiana |
| 19/10 | Mateus abre o PR #27 (este progresso e a correção do guia da US-10) |
| 19/10 | Mateus revisa a US-10 na máquina dele: lint, build, 10 de 10 testes de fumaça e 24 de 24 de acesso, passos de B3 como coordenação e como caixa. Aprova o PR #26 (18h18), com a sugestão de ordenar antes do `limit` em `getClientHistory` |
| 19/10 | Mateus confere as migrações no projeto hospedado e aplica a da US-07 (atrasada desde 16/10) e a `20261020090000_mesclagem_de_fichas` da US-08b. Conferência final: SEC-05, US-06, US-07 e US-08b em produção |
| 19/10 | Laís aprova de novo a US-05 (18h32) e a Alissa integra o PR #23 (18h35) |
| 19/10 | Mateus abre o PR #28 (ajuste do aviso do logo no Next, 18h33); Laís aprova (18h43) e o Mateus integra (18h50) |
| 19/10 | Alissa aprova o PR #27 (18h41) e o Mateus integra (19h06) |
| 19/10 | Bibiana integra a US-10 (PR #26, 21h38) |
| 19/10 | Mateus aprova a US-08a (21h45) e a Alissa integra o PR #24 (21h53). Com isso, 21 de 31 SP integrados |
| 19/10 | Laís abre o PR #29 da US-11 (23h47). Esteira verde (lint, build, fumaça, auditoria e varredura de segredos) |
| 20/10 | Conferência às 10h no GitHub: US-11 sem revisão ainda; branch da US-12 não existe. Aplicação em produção das migrações da US-05 e da US-08a sem registro |
| 20/10 | Replanejamento: mais 27 SP em 7 user stories, sprint com 58 SP. Guias escritos pelo Mateus com o Claude e conferidos num ambiente de conferência sobre a `main` de 20/10, a branch da US-11 e o código do guia da US-12: `tsc`, lint e `next build` verdes com as sete stories; migração e seed da US-13 aplicados num PostgreSQL com os papéis do Supabase; regras de acesso de campanha conferidas como caixa e coordenação; planilha da US-18 gerada e conferida. Testes do Playwright não executados |
| 20/10 | Guias enviados na branch `docs-sprint-4-replanejamento`, com o README (seção "Replanejamento de 20/10"), este progresso, o índice das sprints e a matriz de permissões |

## Encerramento

A preencher em 23/10.
