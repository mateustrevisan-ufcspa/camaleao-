# Sprint 8 · 14/11 a 27/11/2026

**Objetivo:** entregar o sistema ao Instituto. Primeiro, o que o Instituto pediu nas respostas de 06/11 e 09/11 e que ainda falta (termo `2026-11`, correção de dinheiro pela coordenação e pelo balcão, comissão nas vendas, agradecimento pelo caixa, semanal e anual, recibo oficial). Depois, manual, treinamento, homologação e passagem das contas. É a última sprint do projeto.

**Compromisso:** 53 Story Points em 10 itens, no planejamento de 15/11 (validado pelo Mateus). Por tipo: 49 SP de user story, 2 SP de technical story (TS-06) e 2 SP de correção (BUG-04). A sprint tem duas semanas: a primeira para as stories de código, a segunda para a US-41, o treinamento, a homologação e a entrega.

Quadro: [Trello · Camaleão Admin](https://trello.com/b/2iMIPtF4), lista "Selecionado · Sprint 8 (14/11 a 27/11) · 53 SP". Cada cartão tem os checklists "Critérios de Aceitação" e "Tarefas da Sprint 8", com o nome de quem faz cada tarefa. O registro do planejamento está no Projeto do Claude, em `Planejamento_Sprint8.md`.

## De onde a sprint parte

- **Sprint 7 encerrada com 45 de 45 SP** (último merge: PR #70, US-09, à 0h14 de 13/11). A US-04b (extra) não começou e voltou ao topo do backlog. Encerramento em `../sprint-7/PROGRESSO.md`.
- **Sistema publicado** no `camaleao-producao`, com as migrações até `20261112100000`.
- **Product Backlog com 23 SP** (US-25 13, US-21b 5, US-04b 5) e cinco cartões a estimar, criados na Sprint 7 a partir das respostas do Instituto.
- **Pendências da Sprint 7** que entram como tarefa (sem SP): backup (segredo, cópia e restauração de teste), conferências no publicado sem registro (TS-04, US-35, SEC-04, US-31, US-24a e US-09).

## Ajustes no Product Backlog

| Item | O que mudou | SP |
| --- | --- | --- |
| US-36 · Termo de mensagens 2026-11 | Numerada e estimada | 3 |
| BUG-04 · Aniversariantes só com termo aprovado | Numerado e estimado | 2 |
| US-37 · Correção e cancelamento pelo balcão, em qualquer data | Numerada e estimada | 5 |
| US-38 · Comissão nas vendas | Numerada e estimada | 5 |
| US-39 · Agradecimento enviado também pelo caixa | Numerada e estimada: proposta com 5 SP, passou para 8 ao escrever o guia (a lista e o registro viram funções do banco) | 8 |
| US-40 · Recibo com razão social, CNPJ, assinatura e logo | Cartão novo (resposta 12) | 2 |
| US-41 · Agradecimento semanal e anual | Cartão novo (resposta 2) | 8 |
| TS-06 · `db push` de produção com conferência | Cartão novo (retrospectiva da Sprint 7) | 2 |
| US-25 · Manual, treinamento e homologação | Sem mudança: cabe inteira, porque a sprint vai até 27/11 | 13 |

**Acréscimo ao PB:** 35 SP. PB de 23 para **58 SP**. Com os 53 SP desta sprint, fica a US-21b (5 SP), parada até o Instituto ter quem cuide do domínio (pergunta 16).

## Decisões do planejamento (Mateus, 15/11)

- **A sprint termina em 27/11**, com o treinamento, a homologação e a entrega dentro dela.
- **US-41 entra, com o Mateus.**
- **Termo:** as autorizações registradas pela versão `2026-10` não valem para mensagens, e nenhum registro é alterado (US-36).
- **Encerramento da Sprint 7** escrito de forma breve.

## Stories

| Nº | Arquivo | Story | Tipo | SP | Implementa | Revisa | PR pronto | Merge | Migração |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | [TS-06.md](TS-06.md) | `db push` de produção com conferência | Technical | 2 | Laís | Mateus | seg 16/11, 14h | seg 16/11, logo depois da aprovação | não |
| 2 | [US-36.md](US-36.md) | Termo de mensagens na versão 2026-11 | User | 3 | Alissa | Laís | seg 16/11, 18h | seg 16/11, à noite | não |
| 3 | [US-40.md](US-40.md) | Recibo com razão social, CNPJ, assinatura e logo | User | 2 | Mateus | Laís | seg 16/11, 18h | seg 16/11, à noite | não |
| 4 | [BUG-04.md](BUG-04.md) | Aniversariantes só com termo aprovado | Correção | 2 | Bibiana | Alissa | ter 17/11, 18h | ter 17/11, à noite, o primeiro | não |
| 5 | [US-04b.md](US-04b.md) | Correção e cancelamento de venda e de doação em dinheiro (coordenação) | User | 5 | Mateus | Bibiana | ter 17/11, 18h | ter 17/11, à noite | `20261117090000` |
| 6 | [US-38.md](US-38.md) | Comissão nas vendas, com quem captou | User | 5 | Bibiana | Mateus | qua 18/11, 18h | qua 18/11, à noite | `20261118090000` |
| 7 | [US-39.md](US-39.md) | Agradecimento enviado também pelo caixa | User | 8 | Alissa | Laís | qui 19/11, 18h | qui 19/11, à noite | `20261119090000` |
| 8 | [US-37.md](US-37.md) | Correção e cancelamento de dinheiro pelo balcão, em qualquer data | User | 5 | Laís | Bibiana | sex 20/11, 18h | sex 20/11, à noite | `20261120090000` |
| 9 | [US-41.md](US-41.md) | Agradecimento semanal e anual | User | 8 | Mateus | Alissa | seg 23/11, 18h | seg 23/11, à noite (último de story nova) | `20261123090000` |
| 10 | [US-25.md](US-25.md) | Manual, treinamento e homologação | User | 13 | Mateus, com uma parte de cada | Bibiana | ter 24/11, 12h (manual) | ter 24/11, à noite; aceite qui 26/11 | não |

**Ordem que importa:**

- TS-06 primeiro: daqui para frente, `db push` só por `npm run db:push:producao`.
- US-36 antes da BUG-04 (o teste usa a versão atual) e antes da US-39.
- US-04b antes da US-38, US-39 e US-37 (colunas `deleted_at` em `sales` e `donations_cash`).
- US-39 antes da US-37 (`souCaixaOuCoordenacao`) e da US-41 (funções `pessoas_para_agradecer`, `registrar_agradecimento` e `intervalo_do_periodo`).
- Migrações com carimbo em ordem de merge: `20261117090000` (US-04b), `20261118090000` (US-38), `20261119090000` (US-39), `20261120090000` (US-37), `20261123090000` (US-41). Se a ordem de merge mudar, troque o carimbo antes do push (o script recusa carimbo menor que o da `main`).

## Quem faz o quê

| Integrante | Implementa | SP | Revisa | Fora da implementação |
| --- | --- | --- | --- | --- |
| Mateus | US-40, US-04b, US-41, US-25 | 28 | TS-06, US-38 | Contato com o Instituto (datas, perguntas 17 e 18, "doações" e compras), segredo do backup e cópia à mão, contagem das autorizações `2026-10`, conferência da US-09, partes 3, 5 e 7 do manual, PDF, passagem das contas, chave do backup |
| Alissa | US-36, US-39 | 11 | BUG-04, US-41 | Partes 4 e 6 do manual; conduz blocos do treinamento |
| Bibiana | BUG-04, US-38 | 7 | US-04b, US-37, US-25 | Restauração de teste do backup com o Mateus; conferência do meio (sexta 20/11); partes 2 e 7 do manual |
| Laís | TS-06, US-37 | 7 | US-36, US-40, US-39 | Confere os cortes; partes 1, 4 e 7 do manual; conduz o bloco das contas no treinamento |

Por que essa divisão: cada pessoa fica com o que já conhece. Alissa fez o agradecimento (US-21a); Bibiana fez os aniversariantes (US-22) e a comissão (US-31); Laís fez os perfis e a gestão de usuários (US-28, US-24a) e conhece a esteira e o banco (TS-05); Mateus fez o recibo (US-16), escreveu o guia da US-04b e pediu a US-41. A US-25 é de todos: cada um escreve as telas que fez e conduz o bloco correspondente no treinamento.

## Calendário

> **Replanejada em 23/11.** Os prazos valem pela tabela de stories do [PROGRESSO.md](PROGRESSO.md): stories de seg 23/11 a qui 26/11, corte em sex 27/11, 12h. O treinamento, a homologação e o aceite passam para a semana de 30/11, fora da Sprint 8. A tabela abaixo é o plano de 15/11.

| Dia | O que acontece |
| --- | --- |
| Dom 15/11 | Planejamento validado; guias, Trello e PR do planejamento com o encerramento da Sprint 7 (revisão de outra integrante) |
| Seg 16/11 | TS-06 até 14h e merge. US-36 e US-40 até 18h, merges à noite. Backup: segredo regravado, cópia à mão e restauração de teste (Mateus e Bibiana). Mateus confirma com o Instituto o dia do treinamento e da homologação |
| Ter 17/11 | BUG-04 e US-04b até 18h; merges à noite, nessa ordem |
| Qua 18/11 | US-38 até 18h; merge à noite. Laís começa a US-37 (a partir da `main` com a US-04b) |
| Qui 19/11 | US-39 até 18h; merge à noite. Mateus começa a US-41 |
| Sex 20/11 | US-37 até 18h; merge à noite. **Conferência do meio** (Bibiana, até 20h) |
| Sáb 21/11 e dom 22/11 | Partes do manual com prints do publicado, até domingo 20h |
| Seg 23/11 | US-41 até 18h; merge à noite. **Último merge de story nova** |
| Ter 24/11 | PR da US-25 até 12h; ensaio do treinamento no publicado à tarde; merge à noite |
| Qua 25/11, manhã | **Treinamento** na sede (proposta, a confirmar com a Nílian, a Ana e a Tamara) |
| Qui 26/11, manhã | **Homologação** e início do uso. Falhas: correção até 18h e merge à noite (só correção) |
| Sex 27/11 | Sem merge. Termo de aceite, passagem das contas e da chave do backup, desativação das contas de conferência, relatório final, retrospectiva e vídeos |

## Regras da Sprint 8

As da Sprint 7 continuam (corte com nome, aprovação com texto em PR com migração ou de 5 SP ou mais, conferência no publicado antes de mover o cartão, pergunta sem resposta não trava story, a equipe não lança dados reais). Mudam ou entram:

- **`db push` de produção só por `npm run db:push:producao`** (TS-06), na branch da story, com o PR aprovado no último commit. Fora disso, só com desvio registrado **antes**.
- **PR pequeno no começo da semana:** segunda e terça têm cinco itens pequenos para a fila não ficar para quinta.
- **Do treinamento em diante (quarta 25/11), só correção:** nada novo entra; falha na homologação vira BUG com correção no mesmo dia.
- **Sexta 27/11 sem merge.**
- **Corte com nome:** no horário do PR, quem implementa diz no grupo se está aprovado. O que não estiver aprovado sai e volta ao backlog, exceto a US-36, que entra antes do treinamento de qualquer jeito (se atrasar, vira o primeiro item do dia seguinte). A Laís confere.

## Definição de Pronto

Critérios de aceitação marcados; código revisado por outra integrante, com o texto do que testou; esteira verde; migração aplicada pelo script; merge; conferência no publicado registrada no `PROGRESSO.md` por quem integrou; cartão movido. Na US-25, o termo de aceite assinado.

## Perguntas ao Instituto que seguem

| Nº | Pergunta | Para quem | Story | Enquanto não responde |
| --- | --- | --- | --- | --- |
| 17 | Taxa da Doação Solutions | Nílian | US-35, US-31, US-38 | "taxa não cadastrada"; comissão "a calcular" |
| 18 | Pix da PagBank: 0,19% ou sem taxa? | Nílian | US-32, US-35 | 0,19% |
| 19 | "Agradecer suas doações", no termo, cobre as compras no brechó? | Nílian | US-36, US-41 | o texto fica como a Flávia mandou |
| 20 | Dia do treinamento (proposta: quarta 25/11, 9h às 12h) e da homologação (quinta 26/11, de manhã) | Nílian, Ana e Tamara | US-25 | a proposta |
| 21 | Repositório do GitHub depois da disciplina: transferir para o Instituto ou dar acesso de leitura? | Nílian | US-25 | fica com a equipe |
