# Sprint 4 · progresso

**Período:** 17/10 a 23/10/2026 · **Situação:** planejada · **Atualizado em:** 16/10/2026 (planejamento)

Plano da sprint: [README.md](README.md).

## Resumo

- **Planejada em 16/10:** 6 user stories, 31 SP, na ordem do roadmap. A US-08 (13 SP) foi quebrada em US-08b (8) e US-08a (5).
- **Ainda nada começou.** Primeira meta: as seis branches com push até segunda 19/10.

## Ponto de partida: como a Sprint 3 terminou

- As quatro stories da Sprint 3 integradas à `main` (13 de 13 SP); detalhes no [progresso da Sprint 3](../sprint-3/PROGRESSO.md).
- PR #16 (guias da Sprint 3) integrado; a `main` de 16/10 é a base destes guias.
- Burndown de 16/10: 121 SP no backlog, 5 sprints pela frente, cerca de 25 SP por sprint para zerar.

## Stories (31 SP)

| Story | Tipo | SP | Implementa | Revisa | Branch | PR | Situação |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [US-10](US-10.md) · Histórico unificado na ficha da pessoa | User | 3 | Bibiana | Mateus | `us-10-historico-unificado` | | Não iniciada |
| [US-05](US-05.md) · Venda registrada em poucos toques | User | 5 | Alissa | Laís | `us-05-venda-em-poucos-toques` | | Não iniciada |
| [US-08b](US-08b.md) · Mesclagem de duas fichas | User | 8 | Mateus | Alissa | `us-08b-mesclagem-de-fichas` | | Não iniciada |
| [US-11](US-11.md) · Doação de itens com categorias editáveis | User | 5 | Laís | Bibiana | `us-11-categorias-de-doacao` | | Não iniciada |
| [US-08a](US-08a.md) · Sugestão de possíveis repetidos | User | 5 | Alissa | Mateus | `us-08a-possiveis-repetidos` | | Não iniciada |
| [US-12](US-12.md) · Doação vinculada a um evento | User | 5 | Laís | Alissa | `us-12-doacao-de-evento` | | Não iniciada |

## Conferência do meio da sprint (quarta 21/10)

Preencher na quarta à noite:

- [ ] US-10 integrada à `main`
- [ ] US-05 integrada à `main`
- [ ] US-08b e US-11 em Pull Request
- [ ] Decisão da regra de corte: a US-12 segue na sprint ou volta ao topo do backlog
- [ ] Quem participou e o que ficou combinado para quinta e sexta

## Pontos de atenção

- **Nenhum código dos guias foi executado no planejamento.** Quem implementa é a primeira pessoa a rodar migração, lint, build e testes. Trecho que não compilar: corrigir e registrar aqui.
- **Tipos novos em `lib/store.ts` vão na linha reservada** de cada story (README, "Onde as stories se encostam").
- **US-11 congela a tabela de tampinhas** e leva os registros para as doações de item. Antes de aplicar em produção, contar as linhas de `donations_caps`.
- **US-08a depende da tela da US-08b** para o link e o teste de fumaça: integra depois dela.
- **US-12 começa depois do PR da US-11** (mesma pessoa, mesmos arquivos).
- **Pendências que seguem:** resposta da Flávia (termo de mensagens, matriz de permissões, US-04 e SEC-04, planilha do brechó para a US-09, soft opening); registro das migrações da Sprint 3 em produção; Product Backlog e Projeto Arquitetural; item das 7 vulnerabilidades altas em dependências de desenvolvimento, sem estimativa.
- **Itens novos para o backlog, achados no planejamento:** data "de amanhã" depois das 21h nos formulários de doação em dinheiro e de item; remover a tabela `donations_caps` e o que sobrou dela depois da US-11.

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

As decisões de desenho de cada story estão no guia dela. São propostas do planejamento: a equipe confirma ou muda na abertura, e o que mudar entra como linha nova aqui.

## Registro

| Data | O que aconteceu |
| --- | --- |
| 16/10 | Planejamento da Sprint 4: 6 stories, 31 SP; guias escritos em `docs/sprints/sprint-4/` a partir da `main` de 16/10, sem execução de código |
| 16/10 | Trello: lista "Selecionado · Sprint 4 (17/10 a 23/10) · 31 SP" com os seis cartões; US-08 renomeada para US-08b (8 SP) e cartão novo da US-08a (5 SP), com os dois critérios dela; descrições com tipo, sprint, responsáveis, branch, guia e meta; checklist "Tarefas da Sprint 4" em cada cartão (56 tarefas) |
| 16/10 | Guias enviados na branch `docs-sprint-4-guias` (PR #22), com a preparação de código num commit separado |
| 16/10 | Ficou por fazer à mão no Trello: apagar o item do critério que passou da US-08b para a US-08a, etiqueta "Sprint 4" e membros nos cartões (a ferramenta não cria etiqueta nem atribui membro) |

## Encerramento

A preencher em 23/10.
