# Sprint 8 · progresso

**Período:** 14/11 a 27/11/2026 · **Situação:** planejada, 0 de 53 SP integrados · **Atualizado em:** 15/11/2026, domingo, no planejamento

Plano da sprint: [README.md](README.md).

## Resumo

- **15/11, planejamento:** 10 itens e 53 SP (TS-06, US-36, US-40, BUG-04, US-04b, US-38, US-39, US-37, US-41 e US-25). Sprint até 27/11, com treinamento, homologação e entrega. Guias escritos nesta pasta a partir da `main` de 15/11 (PR #83), sem execução de código. A US-39 foi proposta com 5 SP e passou para 8 ao escrever o guia.

## Stories (53 SP)

| Story | Tipo | SP | Implementa | Revisa | Branch | PR | Situação |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [TS-06](TS-06.md) · `db push` com conferência | Technical | 2 | Laís | Mateus | `ts-06-db-push-conferido` | | Não iniciada. PR até seg 16/11, 14h |
| [US-36](US-36.md) · Termo 2026-11 | User | 3 | Alissa | Laís | `us-36-termo-2026-11` | | Não iniciada. PR até seg 16/11, 18h |
| [US-40](US-40.md) · Recibo com os dados do Instituto | User | 2 | Mateus | Laís | `us-40-dados-do-instituto-no-recibo` | | Não iniciada. PR até seg 16/11, 18h |
| [BUG-04](BUG-04.md) · Aniversariantes com termo aprovado | Correção | 2 | Bibiana | Alissa | `bug-04-aniversariantes-com-termo-aprovado` | | Não iniciada. PR até ter 17/11, 18h |
| [US-04b](US-04b.md) · Correção e cancelamento (coordenação) | User | 5 | Mateus | Bibiana | `us-04b-corrigir-e-cancelar-dinheiro` | | Não iniciada. PR até ter 17/11, 18h |
| [US-38](US-38.md) · Comissão nas vendas | User | 5 | Bibiana | Mateus | `us-38-comissao-nas-vendas` | | Não iniciada. PR até qua 18/11, 18h |
| [US-39](US-39.md) · Agradecimento pelo caixa | User | 8 | Alissa | Laís | `us-39-agradecimento-pelo-caixa` | | Não iniciada. PR até qui 19/11, 18h |
| [US-37](US-37.md) · Correção pelo balcão | User | 5 | Laís | Bibiana | `us-37-balcao-corrige-dinheiro` | | Não iniciada. PR até sex 20/11, 18h |
| [US-41](US-41.md) · Agradecimento semanal e anual | User | 8 | Mateus | Alissa | `us-41-agradecimento-semanal-e-anual` | | Não iniciada. PR até seg 23/11, 18h |
| [US-25](US-25.md) · Manual, treinamento e homologação | User | 13 | Mateus (todos) | Bibiana | `us-25-manual-e-entrega` | | Não iniciada. Partes do manual até dom 22/11, 20h; PR até ter 24/11, 12h |

## Tarefas sem Story Points

| Tarefa | Quem | Quando | Situação |
| --- | --- | --- | --- |
| Segredo `BACKUP_CHAVE_SECRETA` gravado de novo, sem quebra de linha; "Backup diário" rodado à mão | Mateus | seg 16/11 | Pendente (falhou em 12/11, Sprint 7) |
| Restauração de teste do backup, registrada em `docs/processo/backup.md` | Mateus e Bibiana | seg 16/11 | Pendente |
| Conferências no publicado da Sprint 7: TS-04, US-35, SEC-04 (Mateus), US-31 (Bibiana), US-24a (Laís), US-09 (Mateus, só planilha fictícia) | cada um | até ter 17/11 | Pendente |
| Contar as autorizações pela `2026-10` em produção (só leitura) | Mateus | depois do merge da US-36 | Pendente |
| Perguntas 17 a 21 ao Instituto (README, "Perguntas ao Instituto que seguem") | Mateus | seg 16/11 | Pendente |
| Trello à mão: criar a etiqueta "Sprint 8" e pôr nos dez cartões; membros nos cartões (implementa e revisa). As ferramentas do Claude não criam etiqueta nem põem membro; os checklists, as etiquetas de SP e de épico e os comentários com o guia já estão nos cartões | Mateus | dom 15/11 | Pendente |
| Planilha do burndown: acréscimo de 35 SP na Sprint 8 | Mateus | dom 15/11 | Pendente |

## Conferência do meio da sprint (sexta 20/11)

A preencher pela Bibiana até as 20h de sexta. Para cada story até a US-37: integrada? conferida no publicado? Para a US-41 e as partes do manual: começadas? O que falta?

## Publicações no sistema publicado

Uma linha por merge e por migração, com a saída do `npm run db:push:producao`. "Conferido" diz com qual conta de conferência e o que foi refeito. Quem integra preenche a sua.

| Data | Migração (saída do script) | Merge | O quê | Quem | Conferido |
| --- | --- | --- | --- | --- | --- |

## Backup (US-24b)

| Data | O quê | Quem | Resultado |
| --- | --- | --- | --- |

## Treinamento e homologação (US-25)

| Data | O quê | Quem participou | Resultado |
| --- | --- | --- | --- |

## Respostas do Instituto

| Nº | Pergunta | Para quem | Enviada em | Resposta | Aplicada em |
| --- | --- | --- | --- | --- | --- |
| 17 | Taxa da Doação Solutions | Nílian | 09/11 | | |
| 18 | Pix da PagBank: 0,19% ou sem taxa? | Nílian | 09/11 | | |
| 19 | "Agradecer suas doações" cobre as compras no brechó? | Nílian | | | |
| 20 | Dia do treinamento e da homologação | Nílian, Ana e Tamara | | | |
| 21 | Repositório depois da disciplina | Nílian | | | |

## Pontos de atenção

- **Nenhum código dos guias foi executado no planejamento.** Quem implementa é a primeira pessoa a rodar migração, lint, build e testes. Trecho que não compilar: corrigir e registrar aqui.
- **Depois da TS-06, todo `db push` de produção é `npm run db:push:producao`**, na branch da story, com o PR aprovado no último commit.
- **Funções `security definer` novas (US-37 e US-39):** conferem o perfil no começo e devolvem só o necessário. Revisão confere as duas coisas.
- **`#variable_conflict use_column`** em função `plpgsql` com `returns table` (US-39): sem a diretiva, as colunas com o mesmo nome das saídas dão erro de ambiguidade.
- **Telas que mudam de dono:** Clientes · Agradecimentos passa a ser do caixa e da coordenação (US-39); `/doacoes/corrigir` também (US-37). A voluntária continua de fora das duas.
- **A equipe não lança dados reais:** nada de aprovar o termo, cadastrar quem capta ou importar planilha no banco de produção. Isso é da coordenação no início do uso (quinta 26/11), com a equipe ao lado.
- **Sem chave, senha, token, e-mail real ou URL do banco** neste arquivo, no Trello ou no PR.

## Pendências que seguem

- Planejamento: PR `docs-sprint-8-planejamento` com esta pasta, o encerramento da Sprint 7 e a linha da Sprint 8 no índice (revisão de outra integrante).

## Decisões

| Data | Decisão |
| --- | --- |
| 15/11 | Sprint 8 de 14/11 a 27/11, com o treinamento, a homologação e a entrega dentro dela; a US-25 entra inteira (13 SP) |
| 15/11 | US-41 (agradecimento semanal e anual, resposta 2) entra na sprint, com o Mateus |
| 15/11 | Termo: as autorizações pela `2026-10` não valem para mensagens, sem alterar nenhum registro (US-36) |
| 15/11 | US-04b sem motivo obrigatório na correção (resposta 4); o cancelamento continua pedindo motivo |
| 15/11 | US-39 reestimada de 5 para 8 SP: lista e registro do agradecimento passam a ser funções do banco, para o caixa não ganhar leitura dos lançamentos do mês nem do telefone |
| 15/11 | BUG-04 sem migração: os aniversariantes passam a usar `destinatarios_do_agradecimento` |
| 15/11 | TS-06: `db push` de produção só pelo script, a partir da segunda 16/11 |

## Registro

| Data | O que aconteceu |
| --- | --- |
| 15/11 | Trello: lista "Selecionado · Sprint 8 (14/11 a 27/11) · 53 SP" com os dez cartões em ordem; TS-06, US-40 e US-41 criados; US-36, BUG-04, US-37, US-38 e US-39 numerados e estimados; US-04b sem a marca de extra e sem a etiqueta "Sprint 7"; checklists "Critérios de Aceitação" e "Tarefas da Sprint 8" e comentário com o guia em cada cartão; comentário no cartão "Início do uso pelo Instituto" |
| 15/11 | Planejamento da Sprint 8: proposta de 34 SP com a US-25 dividida; o Mateus decidiu a sprint até 27/11 (US-25 inteira), a US-41 com ele e o termo sem alterar registros. 53 SP em 10 itens. Guias, README e este progresso escritos a partir da `main` de 15/11 (PR #83), sem execução de código. Encerramento breve da Sprint 7 escrito no `PROGRESSO.md` dela |

## Encerramento

A preencher em 27/11.
