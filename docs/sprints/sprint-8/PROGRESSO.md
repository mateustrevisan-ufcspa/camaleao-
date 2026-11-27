# Sprint 8 · progresso

**Período:** 14/11 a 27/11/2026 · **Situação:** em andamento, replanejada em 23/11; 7 de 53 SP integrados · **Atualizado em:** 25/11/2026, quarta, 21h30

Plano da sprint: [README.md](README.md).

## Resumo

- **15/11, planejamento:** 10 itens e 53 SP (TS-06, US-36, US-40, BUG-04, US-04b, US-38, US-39, US-37, US-41 e US-25). Sprint até 27/11, com treinamento, homologação e entrega. Guias escritos nesta pasta a partir da `main` de 15/11 (PR #83), sem execução de código. A US-39 foi proposta com 5 SP e passou para 8 ao escrever o guia.

## Stories (53 SP)

| Story | Tipo | SP | Implementa | Revisa | Branch | PR | Situação |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [TS-06](TS-06.md) · `db push` com conferência | Technical | 2 | Laís | Mateus | `ts-06-db-push-conferido` | #85 | **Integrada em 23/11.** Esteira verde depois de rodar a auditoria de novo (o aviso alto do `picomatch` saiu da base). Revisão do Mateus com o `--ensaio` na branch: parou em "sem migração nova" |
| [US-36](US-36.md) · Termo 2026-11 | User | 3 | Alissa | Laís | `us-36-termo-2026-11` | #89 | Em revisão. PR aberto em 23/11, à noite; sem revisão da Laís em 25/11, 21h30. A BUG-04 (#91), a US-39 (#90) e a US-41 (#92) saem desta branch: o #89 é integrado antes dos três. Revisão até qui 26/11, 10h |
| [US-40](US-40.md) · Recibo com os dados do Instituto | User | 2 | Mateus | Alissa (era Laís) | `us-40-dados-do-instituto-no-recibo` | #87 | Em revisão. PR aberto em 23/11; lint, build, 83 de 83 testes de fumaça e 100 de 101 de acesso (o pulado é o do termo já aprovado no banco local). Impressão conferida pelo Mateus: logo, cabeçalho e lugar da assinatura. Sem revisão em 25/11; revisão passou para a Alissa em 25/11, até qui 26/11, 12h. Entra antes do #90, porque traz este arquivo |
| [BUG-04](BUG-04.md) · Aniversariantes com termo aprovado | Correção | 2 | Bibiana | Alissa | `bug-04-aniversariantes-com-termo-aprovado` | #91 | Em revisão, aprovada pela Alissa em 25/11 no último commit. Sem migração. A branch sai da US-36, então o PR traz o commit dela: merge só depois do #89 |
| [US-04b](US-04b.md) · Correção e cancelamento (coordenação) | User | 5 | Mateus | Bibiana | `us-04b-corrigir-e-cancelar-dinheiro` | #88 | **Integrada em 25/11.** Aprovada pela Bibiana no commit `286c720`; migração `20261117090000` aplicada pelo `npm run db:push:producao` antes do merge; conferida no publicado (tabela "Publicações") |
| [US-38](US-38.md) · Comissão nas vendas | User | 5 | Bibiana | Mateus | `us-38-comissao-nas-vendas` | | Atrasada: sem branch no GitHub em 25/11, 21h30 (o PR era até qua 25/11, 12h). Não depende de nenhum PR aberto. **Migração com carimbo novo `20261126090000`** (o `20261118090000` do guia é recusado pelo script, porque a US-39 e a US-41 entram antes). PR até qui 26/11, 18h; merge qui 26/11, noite, depois do #92 |
| [US-39](US-39.md) · Agradecimento pelo caixa | User | 8 | Alissa | Mateus (era Laís) | `us-39-agradecimento-pelo-caixa` | #90 | Em revisão, **aprovada pelo Mateus em 25/11** no último commit. PR aberto em rascunho em 24/11, 0h45, e pronto para revisão em 25/11, 19h30; a branch sai da US-36 e da US-04b. Merge qui 26/11, tarde, depois do #89 e do #87, com a `20261119090000` |
| [US-37](US-37.md) · Correção pelo balcão | User | 5 | Laís | Bibiana | `us-37-balcao-corrige-dinheiro` | | Não iniciada: sem branch no GitHub em 25/11, 21h30. A base (US-04b) já está na `main`; o `souCaixaOuCoordenacao` vem com o #90 (trazer a `main` depois do merge dele). **Migração com carimbo novo `20261126100000`** (o `20261120090000` do guia é recusado pelo script). PR até qui 26/11, 18h; merge sex 27/11, até 12h, a última story |
| [US-41](US-41.md) · Agradecimento semanal e anual | User | 8 | Mateus | Alissa | `us-41-agradecimento-semanal-e-anual` | #92 | Em revisão, em rascunho até o merge do #90. Branch saída da US-39. Lint, build, 87 de 87 testes de fumaça e 111 de 112 de acesso no banco local em 25/11 (o pulado é o do termo). Commit `820f99f`: antes da aprovação do termo, a linha diz "falta a coordenação aprovar o termo" (achado da revisão do #90). Merge qui 26/11, noite, com a `20261123090000` |
| [US-25](US-25.md) · Manual, treinamento e homologação | User | 13 | Mateus (todos) | Bibiana | `us-25-manual-e-entrega` | | Começada em 25/11, à noite: roteiro de treinamento, roteiro de homologação, guia de operação e partes 3 e 5 do manual (Mateus), sem prints. Partes das outras até sex 27/11, 12h; PR do manual sex 27/11, 18h. Treinamento, homologação e aceite na semana de 30/11, fora da Sprint 8 |

## Tarefas sem Story Points

| Tarefa | Quem | Quando | Situação |
| --- | --- | --- | --- |
| Segredo `BACKUP_CHAVE_SECRETA` gravado de novo, sem quebra de linha; "Backup diário" rodado à mão | Mateus | seg 23/11 | Feito em 23/11: o backup à mão passou. Tinha falhado todos os dias de 14/11 a 23/11 com o mesmo erro (quebra de linha na chave) |
| Restauração de teste do backup, registrada em `docs/processo/backup.md` | Mateus e Bibiana | ter 24/11 | Pendente |
| Conferências no publicado da Sprint 7: TS-04, US-35, SEC-04 (Mateus), US-31 (Bibiana), US-24a (Laís), US-09 (Mateus, só planilha fictícia) | cada um | até qua 25/11 | Pendente |
| Contar as autorizações pela `2026-10` em produção (só leitura) | Mateus | depois do merge da US-36 | Pendente |
| Perguntas 17 a 21 ao Instituto (README, "Perguntas ao Instituto que seguem") | Mateus | seg 23/11 | Pendente |
| Trello à mão: criar a etiqueta "Sprint 8" e pôr nos dez cartões; membros nos cartões (implementa e revisa). As ferramentas do Claude não criam etiqueta nem põem membro; os checklists, as etiquetas de SP e de épico e os comentários com o guia já estão nos cartões | Mateus | dom 15/11 | Pendente |
| Planilha do burndown: acréscimo de 35 SP na Sprint 8 | Mateus | dom 15/11 | Pendente |
| SEC-05 · Next 16.4.2 para 16.4.6 (avisos de segurança moderados, corrigidos a partir da 16.4.5); `experimental.agentUpgrade: 'security'` no `next.config.mjs`. Sem SP. Branch `sec-05-next-16-4-6`; revisa a Bibiana | Mateus | seg 23/11 | Lint, tsc, build e 83 testes de fumaça passaram no banco local em 23/11. PR #86 aberto em 23/11; sem revisão da Bibiana em 25/11, 21h30 (até qui 26/11, 10h). Fecha os alertas 4 a 10 do Dependabot, abertos de 17/11 a 21/11 (`next` até 16.4.4, gravidade moderada, corrigidos na 16.4.5). Depois do merge, cada uma roda `npm ci` na sua cópia |

## Conferência do meio da sprint (quarta 25/11, depois do replanejamento)

A preencher pela Bibiana até as 20h de quarta. Para cada story até a US-37: integrada? conferida no publicado? Para a US-41 e as partes do manual: começadas? O que falta?

## Publicações no sistema publicado

Uma linha por merge e por migração, com a saída do `npm run db:push:producao`. "Conferido" diz com qual conta de conferência e o que foi refeito. Quem integra preenche a sua.

| Data | Migração (saída do script) | Merge | O quê | Quem | Conferido |
| --- | --- | --- | --- | --- | --- |
| 23/11 | Sem migração (o script parou em "sem migração nova") | #85 | TS-06 · `npm run db:push:producao` | Laís (story), Mateus (revisão) | Não se aplica: só script e documentação |
| 25/11 | `20261117090000_corrigir_e_cancelar_dinheiro.sql`: o script conferiu a branch, a `origin/main` e a aprovação da Bibiana no commit `286c720`, mostrou só a `20261117090000` pendente e aplicou; na lista de depois, a `20261117090000` aparece em Local e em Remote | #88 (`8f05fc1`), às 10h28 | US-04b · correção e cancelamento de dinheiro pela coordenação | Mateus (story), Bibiana (revisão) | Conta de conferência da coordenação, depois da esteira verde e do deploy: doação "CONFERÊNCIA" de R$ 1 corrigida para R$ 2 e cancelada com motivo; as duas linhas em Relatórios · Alterações |

## Backup (US-24b)

| Data | O quê | Quem | Resultado |
| --- | --- | --- | --- |
| 23/11 | `BACKUP_CHAVE_SECRETA` gravada de novo sem quebra de linha (`tr -d '\r\n'`); "Backup diário" rodado à mão (execução 45275897896) | Mateus | Sucesso: "Copiar, cifrar e guardar" verde. De 14/11 a 23/11 a rotina falhou todo dia no envio, com o mesmo erro (`Headers.set`) |

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

- **`sales` não tem coluna `amount`:** o valor da venda é a soma de `sale_items.amount` (é o que a `sales_view` faz). Toda função ou view nova que leia `public.sales` direto soma os itens (corrigido nos guias da US-37, US-38 e US-39 em 15/11).
- **Nenhum código dos guias foi executado no planejamento.** Quem implementa é a primeira pessoa a rodar migração, lint, build e testes. Trecho que não compilar: corrigir e registrar aqui.
- **Depois da TS-06, todo `db push` de produção é `npm run db:push:producao`**, na branch da story, com o PR aprovado no último commit.
- **Funções `security definer` novas (US-37 e US-39):** conferem o perfil no começo e devolvem só o necessário. Revisão confere as duas coisas.
- **`#variable_conflict use_column`** em função `plpgsql` com `returns table` (US-39): sem a diretiva, as colunas com o mesmo nome das saídas dão erro de ambiguidade.
- **Telas que mudam de dono:** Clientes · Agradecimentos passa a ser do caixa e da coordenação (US-39); `/doacoes/corrigir` também (US-37). A voluntária continua de fora das duas.
- **A equipe não lança dados reais:** nada de aprovar o termo, cadastrar quem capta ou importar planilha no banco de produção. Isso é da coordenação no início do uso (quinta 26/11), com a equipe ao lado.
- **Sem chave, senha, token, e-mail real ou URL do banco** neste arquivo, no Trello ou no PR.
- **Guia da US-39, teste de fumaça do caixa (corrigido em 23/11, PR #90):** (1) depois de `entrarPelaTela`, falta `await page.waitForURL(/\/brecho$/)`, como em `tests/acesso/acesso.spec.ts`: sem isso, a página abre antes da sessão existir e o botão não aparece; (2) o `wa.me` redireciona para `api.whatsapp.com/send/?phone=...`, então o número fica nos parâmetros, e não no caminho: o teste confere `popup.url()` inteiro. Vale para a US-41, que reaproveita esse teste.
- **Esteira, 23/11:** uma execução falhou ao subir o Supabase local ("address already in use" na porta 54324, do inbucket), sem relação com o código. Rodar o job de novo resolveu.
- **PRs empilhados (25/11):** o #91 (BUG-04) e o #90 (US-39) saem da branch da US-36 (#89) e trazem o commit dela. Integrar um deles antes do #89 põe a US-36 na `main` sem revisão. Ordem: #89, depois #91 e #90.
- **Ordem de integração (25/11):** #89 (US-36) → #91 (BUG-04); #86 (SEC-05) independente; #87 (US-40) antes do #90, porque traz este arquivo; #90 (US-39) → #92 (US-41) e a US-37 (`souCaixaOuCoordenacao`); a US-38 não depende de nenhum PR aberto.
- **Fila das migrações (25/11):** o `db-push-producao.mjs` recusa carimbo menor ou igual ao último da `main`. Ordem de merge dos PRs com migração: #90 `20261119090000` → #92 `20261123090000` → US-38 `20261126090000` → US-37 `20261126100000`. Se alguém da fila atrasar, quem vem depois troca o carimbo para um maior que o da `main`, avisa no grupo e segue.
- **Este arquivo, replanejado em 23/11, entra na `main` pelo PR #87 (US-40).** A branch da US-39 (#90) mexe na versão de 15/11 e vai dar conflito aqui: ao atualizar o #90 depois do merge do #87, fique com a versão da `main` (os dois pontos de atenção da US-39 já estão acima).

## Pendências que seguem

- Alerta 3 do Dependabot: `minimatch` entre 7.0.0 e 11.0.1, gravidade moderada, só em desenvolvimento (lint e testes), aberto desde 04/11. Não reprova a esteira (`npm audit --audit-level=high`). Tratar depois da entrega, sem mexer em dependências no meio da sprint.

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
| 23/11 | Replanejamento: em 23/11 só a TS-06 tinha PR (#85, de 17/11) e nenhum cartão tinha andado no Trello desde 15/11. O Mateus manteve os 53 SP, com prazos novos de seg 23/11 a sex 27/11 (tabela de stories). O treinamento, a homologação e o aceite passam para a semana de 30/11, fora da Sprint 8: a US-25 fecha na sprint o manual, e o aceite fica para depois |
| 23/11 | Corte novo: o que não tiver aprovação até sex 27/11, 12h, volta ao backlog. A regra "sexta sem merge" sai, porque o treinamento não é mais na quarta |
| 25/11 | A Sprint 8 é a última: nenhuma story volta ao backlog. Sex 27/11, 12h, continua como prazo de aprovação de todas, e o merge de todas é na sexta. Substitui o "volta ao backlog" de 23/11 |
| 25/11 | Revisões trocadas para tirar carga da Laís, que fica com o #89 e a US-37: a US-40 (#87) passa para a Alissa e a US-39 (#90) para o Mateus |
| 25/11 | Carimbos novos: US-38 `20261126090000` e US-37 `20261126100000`, porque a US-39 e a US-41 entram antes e o script recusa carimbo menor que o da `main` |
| 25/11 | Antes da aprovação do termo, a lista de agradecimentos diz "falta a coordenação aprovar o termo", e não "autorizou um termo que não vale" (achado da revisão do #90, corrigido na US-41) |

## Registro

| Data | O que aconteceu |
| --- | --- |
| 15/11 | Trello: lista "Selecionado · Sprint 8 (14/11 a 27/11) · 53 SP" com os dez cartões em ordem; TS-06, US-40 e US-41 criados; US-36, BUG-04, US-37, US-38 e US-39 numerados e estimados; US-04b sem a marca de extra e sem a etiqueta "Sprint 7"; checklists "Critérios de Aceitação" e "Tarefas da Sprint 8" e comentário com o guia em cada cartão; comentário no cartão "Início do uso pelo Instituto" |
| 15/11 | Planejamento da Sprint 8: proposta de 34 SP com a US-25 dividida; o Mateus decidiu a sprint até 27/11 (US-25 inteira), a US-41 com ele e o termo sem alterar registros. 53 SP em 10 itens. Guias, README e este progresso escritos a partir da `main` de 15/11 (PR #83), sem execução de código. Encerramento breve da Sprint 7 escrito no `PROGRESSO.md` dela |
| 15/11 | Guias conferidos contra a `main` (leitura de código e migrações, sem rodar nada). Corrigidos: US-37, US-38 e US-39 liam `sales.amount`, coluna que não existe (agora somam `sale_items`); US-39 ganha `doacoes_de_item` em `pessoas_para_agradecer`, para a lista semanal da US-41 incluir doação com triagem pendente sem trocar o tipo de retorno depois; US-41 filtra a semanal por `doacoesDeItem` e ajusta também o teste de fumaça do caixa (US-39); US-37 explica que os testes de cancelamento da US-04b mudam de forma, e não só de sinal; TS-06 confere a aprovação no commit atual pelas revisões (o repositório não descarta aprovação antiga) e testa o caso "na main" com o arquivo da branch; US-36 pede `db:reset` antes dos testes. Conferidos sem mudança: US-40, BUG-04, US-04b e US-25; somas de SP, ordem das migrações e calendário |
| 15/11 | Correções da conferência na branch (`e67a7da`) e PR #84 do planejamento aberto. Registrado o alerta 3 do Dependabot (`minimatch`, moderado, só em desenvolvimento) para depois da entrega |
| 23/11 | Situação levantada: PR #84 (planejamento) integrado em 17/11; PR #85 (TS-06) aberto em 17/11, sem revisão, com a "Auditoria de dependências" reprovada por um aviso alto do `picomatch` que não aparece mais no `npm audit` de 23/11; nenhuma branch das outras stories; cartões sem movimento desde 15/11; "Backup diário" falhando todo dia desde 14/11 (`Headers.set`: quebra de linha em `BACKUP_CHAVE_SECRETA`). Replanejamento com o Mateus (decisões de 23/11). Código da US-40 escrito a partir do guia, sem rodar. TS-06 revisada pelo código: correta; observação de que o script não mostra o projeto ligado |
| 23/11 | Backup diário de volta (execução à mão verde). TS-06 integrada (#85). PR #86 (SEC-05, Next 16.4.6) e PR #87 (US-40) abertos; impressão do recibo da US-40 conferida pelo Mateus (logo, cabeçalho e lugar da assinatura) |
| 25/11 | Situação levantada pelo GitHub (o Trello não foi lido: o quadro é privado e a sessão não tinha a ferramenta). PRs abertos desde 23/11 e 24/11: #89 (US-36, Alissa), #90 (US-39, Alissa) e #91 (BUG-04, Bibiana, aprovado pela Alissa); #86, #87 e #89 sem revisão; #90 sem revisora pedida. Sem branch: US-38 (PR vencido às 12h de hoje), US-37, US-41 e US-25. Backup diário verde desde 23/11 |
| 25/11 | US-04b integrada (#88): `npm run db:push:producao` aplicou a `20261117090000` em produção, merge às 10h28 e conferência no publicado com a conta da coordenação. `gh pr update-branch` no #86, #87, #89, #90 e #91. 7 de 53 SP integrados. Pontos de atenção da US-39 (PR #90) trazidos para esta versão do arquivo |
| 25/11 | À noite, situação conferida pelo GitHub e pelo Trello (agora lido pela ferramenta): os cartões batem com os PRs; US-38 e US-37 sem movimento no Trello desde 15/11; #90 saiu do rascunho às 19h30. Mateus abriu o #92 (US-41) em rascunho, depois de lint, build, fumaça e acesso no banco local; a primeira rodada de fumaça quebrou a busca de pessoa porque uma pessoa de teste da US-41 tinha "3344" no telefone (trocado). Mateus revisou e aprovou o #90 (perfil conferido nas funções, contato só depois do insert, regras do líquido e das peças iguais às do TypeScript). 7 alertas novos do Dependabot no `next`, fechados pelo #86. Mensagem ao grupo com as decisões de 25/11, a ordem de integração, a fila das migrações e o cronograma até sexta. Cartão da US-41 para "Em revisão". US-25 começada pelo Mateus |

## Encerramento

A preencher em 27/11.
