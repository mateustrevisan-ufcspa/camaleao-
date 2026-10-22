# Sprint 4 · progresso

**Período:** 17/10 a 23/10/2026 · **Situação:** em andamento · **Atualizado em:** 22/10/2026, 18h27 (conferido no GitHub)

Plano da sprint: [README.md](README.md).

## Resumo

- **Planejada em 16/10:** 6 user stories, 31 SP, na ordem do roadmap. A US-08 (13 SP) foi quebrada em US-08b (8) e US-08a (5).
- **16/10:** nada começado ainda. Primeira meta: as seis branches com push até segunda 19/10.
- **18/10, à noite:** PR #22 integrado (Alissa, 17/10). Branches no GitHub: US-05 e US-08a (Alissa) e US-08b (Mateus, com o código escrito e ainda sem commit). Faltam as da US-10 (Bibiana) e da US-11 (Laís).
- **19/10, 18h07:** US-08b integrada (#25). US-05 (#23) aprovada e pronta para o merge. US-10 (#26) com esteira verde, esperando a revisão do Mateus. US-08a (#24) com a esteira vermelha até trazer a `main`. A branch da US-11 ainda não existe, e o prazo era hoje.
- **20/10, 10h:** US-05 (#23), US-10 (#26) e US-08a (#24) integradas na noite de 19/10: **21 de 31 SP concluídos.** US-11 (#29) com esteira verde, esperando a revisão da Bibiana. A branch da US-12 ainda não existe; a Laís combinou entregar hoje.
- **Replanejamento de 20/10:** mais 7 user stories, 27 SP (US-22, US-14, US-20, US-17, US-15, US-18 e US-13). A sprint passa a **58 SP**. Plano, calendário e regras de corte no [README](README.md#replanejamento-de-2010).
- **20/10, 10h50:** PR #30 (replanejamento) integrado. Migrações da US-05 e da US-08a conferidas em produção: a da US-05 já estava aplicada, a da US-08a foi aplicada pelo Mateus. US-11 (#29) aprovada pela Bibiana, com a `main` trazida e esteira verde; falta o merge da Laís.
- **20/10, 10h55:** US-11 integrada (#29, 10h49): **26 de 58 SP concluídos** (as cinco primeiras stories de 16/10). Falta a migração da US-11 em produção. Nenhuma branch das stories que faltam (US-12, US-22, US-14 e US-15, previstas para hoje) existe ainda no GitHub.
- **20/10, 11h50:** migração da US-11 aplicada e testada em produção. US-15 com as Partes A a C feitas e verificadas na branch, sem PR aberto ainda. Branches da US-12, da US-22 e da US-14 ainda não existem. No Trello, o cartão da US-11 ainda em Em revisão e o da US-15 ainda em Selecionado.
- **21/10:** US-12 integrada (#33, 10h41) e com a migração aplicada em produção; US-22 integrada (#35, 17h48): **32 de 58 SP concluídos.** A regra de corte da quarta está atendida: a US-13 segue. US-14 (#34) aprovada pela Bibiana, falta trazer a `main` e o merge. US-13 (#36) e US-15 (#31) em rascunho. US-17 com a branch aberta e sem commit; US-20 e US-18 sem branch.
- **21/10 e 22/10 · incidente:** a variável pública `NEXT_PUBLIC_SUPABASE_ANON_KEY` de produção, na Vercel, guardava uma chave **secreta** do Supabase, publicada nos arquivos do site. Contido na madrugada de 22/10: publicável nova, variáveis refeitas e novo deploy sem cache, e o site não leva mais a chave secreta. A chave secreta exposta não existe mais no Supabase, a integração do Supabase com a Vercel foi desligada e as variáveis que ela criava foram apagadas: incidente encerrado em 22/10. Detalhes no registro e nos pontos de atenção.
- **22/10, 9h55:** US-13 (#36) aprovada, esteira verde, esperando a migração em produção para o merge. US-14 (#34) aprovada, falta trazer a `main` e o merge. US-15 (#31) em rascunho, falta a Parte D. US-17 sem commit; US-20 e US-18 sem branch. **A US-18 passa para a Laís**, depois do merge da US-17.
- **22/10, 9h57:** US-13 integrada (#36), com a migração aplicada em produção antes do merge: **37 de 58 SP concluídos.**
- **22/10, 10h20:** US-15 (#31) em revisão, com as Partes D (eventos) e E da US-13 (campanhas); falta a revisão da Alissa. Da US-13 sobra só a Parte F, depois da US-17.
- **22/10, 10h26:** US-14 integrada (#34, 10h23): **40 de 58 SP concluídos.** US-15 (#31) aprovada pela Alissa, com esteira verde; falta trazer a `main` e o merge.
- **22/10, 10h59:** US-15 integrada (#31, 10h37): **48 de 58 SP concluídos.** Faltam US-17 (Alissa, sem commit), US-18 (Laís, depois da US-17) e US-20 (Bibiana, sem branch).
- **22/10, à tarde · vulnerabilidade crítica no Next.js:** saíram alertas para o Next 16.0.0 a 16.4.0 (um crítico, de execução remota de código na otimização de imagens com SVG), e a auditoria da esteira passou a reprovar todo PR. Corrigido com o PR #38 (Next 16.4.2), aberto às 16h15 e integrado às 16h19; a Vercel publicou na hora. Detalhes no registro.
- **22/10, 18h27:** US-20 integrada (#37, 17h13) e US-17 integrada (#40, 18h10): **56 de 58 SP concluídos.** PR #32 (progresso) integrado. Falta só a US-18 (#39, Laís, em rascunho), que conflita com a US-17 em `types/index.ts` e `lib/store.ts` ao trazer a `main`.

## Ponto de partida: como a Sprint 3 terminou

- As quatro stories da Sprint 3 integradas à `main` (13 de 13 SP); detalhes no [progresso da Sprint 3](../sprint-3/PROGRESSO.md).
- PR #16 (guias da Sprint 3) integrado; a `main` de 16/10 é a base destes guias.
- Burndown de 16/10: 121 SP no backlog, 5 sprints pela frente, cerca de 25 SP por sprint para zerar.

## Stories (58 SP)

Planejadas em 16/10 (31 SP):

| Story | Tipo | SP | Implementa | Revisa | Branch | PR | Situação |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [US-10](US-10.md) · Histórico unificado na ficha da pessoa | User | 3 | Bibiana | Mateus | `us-10-historico-unificado` | #26 | **Concluída.** Aprovada pelo Mateus (19/10, 18h18) e integrada pela Bibiana (19/10, 21h38). Sem migração |
| [US-05](US-05.md) · Venda registrada em poucos toques | User | 5 | Alissa | Laís | `us-05-venda-em-poucos-toques` | #23 | **Concluída.** Aprovada pela Laís (19/10, 17h45 e 18h32) e integrada pela Alissa (19/10, 18h35). Migração `20261019090000_atalhos_da_venda` conferida em produção em 20/10: já estava aplicada, sem registro de quem aplicou |
| [US-08b](US-08b.md) · Mesclagem de duas fichas | User | 8 | Mateus | Alissa | `us-08b-mesclagem-de-fichas` | #25 | **Concluída.** Aprovada pela Alissa (19/10, 11h17) e integrada pelo Mateus (19/10, 11h21). Migração aplicada em produção pelo Mateus no mesmo dia |
| [US-11](US-11.md) · Doação de itens com categorias editáveis | User | 5 | Laís | Bibiana | `us-11-categorias-de-doacao` | #29 | **Concluída.** Aprovada pela Bibiana (20/10, 10h38) e integrada pela Laís (20/10, 10h49); esteira da `main` verde. Migração `20261020100000_categorias_de_doacao` aplicada em produção pelo Mateus em 20/10, de manhã: 2 tampinhas (4.600 unidades e 16,5 kg) levadas para as doações de item sem divergência |
| [US-08a](US-08a.md) · Sugestão de possíveis repetidos | User | 5 | Alissa | Mateus | `us-08a-possiveis-repetidos` | #24 | **Concluída.** `main` trazida, aprovada pelo Mateus (19/10, 21h45) e integrada pela Alissa (19/10, 21h53). Migração `20261021090000_possiveis_repetidos` aplicada em produção pelo Mateus em 20/10, de manhã. De 19/10 à noite até a aplicação, a tela `/clientes/repetidos` publicada ficou sem a função do banco |
| [US-12](US-12.md) · Doação vinculada a um evento | User | 5 | Laís | Alissa | `us-12-doacao-de-evento` | #33 | **Concluída.** PR aberto pela Laís em 20/10, 12h09; aprovada pela Alissa (21/10, 10h39) e integrada pelo Mateus (21/10, 10h41). Migração `20261021100000_doacao_de_evento` aplicada em produção pelo Mateus em 21/10 e conferida. Testada na tela publicada em 22/10, depois do incidente da chave |

Acrescentadas no replanejamento de 20/10 (27 SP):

| Story | Tipo | SP | Implementa | Revisa | Branch | PR | Situação |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [US-22](US-22.md) · Aniversariantes do mês | User | 1 | Bibiana | Mateus | `us-22-aniversariantes-do-mes` | #35 | **Concluída.** PR aberto pela Bibiana em 21/10, 17h29; aprovada pelo Mateus (17h32) e integrada pela Bibiana (17h48). Sem migração |
| [US-14](US-14.md) · Toda doação vinculada a uma ficha | User | 3 | Alissa | Bibiana | `us-14-doacao-com-ficha` | #34 | **Concluída.** PR aberto pela Alissa em 21/10, 16h00; aprovada pela Bibiana (21/10, 17h46); `main` trazida e integrada pela Alissa (22/10, 10h23). Sem migração |
| [US-20](US-20.md) · Acompanhamento de doadores recorrentes | User | 3 | Bibiana | Laís | `us-20-doadores-recorrentes` | #37 | **Concluída.** PR aberto pela Bibiana em 22/10, 15h22; aprovada pela Laís (16h02); `main` trazida com a correção do Next (16h54) e esteira verde; integrada pela Bibiana (17h13). Sem migração. Testada pelo Mateus no sistema publicado em 22/10, funcionando. Histórico: liberada pelo merge da US-22 (21/10, 17h48); às 2h05 de 22/10 a branch ainda não existia. Meta: integrada na quinta 22/10 |
| [US-17](US-17.md) · Relatório consolidado do Instituto | User | 5 | Alissa | Mateus | `us-17-relatorio-consolidado` | #40 | **Concluída.** PR aberto pela Alissa em 22/10, 17h26, com a Parte D (eventos); aprovada pelo Mateus (18h09), que rodou a story e conferiu; integrada pela Alissa (18h10); esteira da `main` verde. Sem migração. Testada pelo Mateus no sistema publicado em 22/10, funcionando. Muda também o cartão "Total recebido · mês" das doações em dinheiro, que passa a somar só o mês. Histórico: branch criada em 21/10, ainda sem commit às 2h05 e às 11h30 de 22/10 |
| [US-15](US-15.md) · Contribuição total da pessoa no período | User | 8 | Mateus | Alissa | `us-15-contribuicao-no-periodo` | #31 | **Concluída.** Integrada pelo Mateus em 22/10, 10h37, com a esteira da `main` verde. Sem migração. Testada pelo Mateus na tela publicada em 22/10, funcionando. Histórico: branch criada em 20/10; Partes A a C (dados, cartão na ficha e teste) no commit `ab75f98` (11h47), verificadas pelo Mateus: lint, build, fumaça, acesso e tela. PR #31 em rascunho (20/10, 11h55), esteira verde. Em 22/10, `main` trazida (`e9db673`) e Partes D (parte de cada evento) e E da US-13 (parte de cada campanha) no commit `72179af`, com lint, build, fumaça e acesso passando na máquina do Mateus. Em revisão: PR #31 fora do rascunho em 22/10, 10h20; esteira verde e aprovada pela Alissa (10h25). `main` trazida de novo (`d64e802`, o merge da US-14) e esteira verde antes do merge |
| [US-18](US-18.md) · Exportação dos relatórios em planilha | User | 2 | Laís (era Alissa até 22/10) | Bibiana | `us-18-exportacao-em-planilha` | #39 | Em andamento. Passou para a Laís em 22/10, para aliviar a Alissa. PR #39 em rascunho (22/10, 16h19) com as dependências (`c00c522`), a Parte A já com `campaign_name` (`5c1f791`, Parte G da US-13) e a `main` trazida com a correção do Next (`f238c87`); esteira verde. Com a US-17 na `main`, a Parte B pode entrar inteira (Resumo e botão incluídos). Ao trazer a `main` de novo, conflito em `types/index.ts` e no import de `lib/store.ts`, porque a Parte A ficou nas linhas da US-17: resolver mantendo os dois lados. Proposta à Laís: a Parte F da US-13 (campanha no relatório) no mesmo PR. Meta: fora do rascunho hoje à noite (regra de corte), integrada até o meio-dia de sexta 23/10 |
| [US-13](US-13.md) · Doação vinculada a uma campanha | User | 5 | Laís | Mateus | `us-13-doacao-de-campanha` | #36 | **Concluída.** PR aberto pela Laís em 22/10, 0h08; aprovada pelo Mateus e integrada pela Laís (22/10, 9h57), com as Partes A a D, que cumprem os 4 critérios. Migração `20261022090000_doacao_de_campanha` aplicada em produção pelo Mateus antes do merge. Das partes extras: a E (campanha na contribuição) entrou na US-15 (commit `72179af`); a F (campanha no relatório) fica para um PR curto da Laís depois da US-17; a G (aba da planilha) vai junto com a US-18 |

## Conferência do meio da sprint (quarta 21/10)

Preencher na quarta à noite:

- [x] US-10 integrada à `main` (19/10, 21h38)
- [x] US-05 integrada à `main` (19/10, 18h35)
- [x] US-08b e US-11 em Pull Request (US-08b integrada em 19/10; US-11 com o PR #29)
- [x] Decisão da regra de corte: a US-12 segue na sprint (integrada em 21/10, 10h41)
- [ ] Quem participou e o que ficou combinado para quinta e sexta

Acrescentado no replanejamento de 20/10:

- [x] US-22 e US-12 integradas à `main` (US-12 em 21/10, 10h41; US-22 em 21/10, 17h48)
- [ ] US-14 integrada à `main`, depois da US-12 (às 2h05 de 22/10: aprovada, sem merge)
- [ ] US-20 e US-17 em Pull Request (às 2h05 de 22/10: nenhuma das duas)
- [x] Regra de corte de 20/10: com a US-12 integrada, a US-13 segue

## Conferência de quinta (22/10, à noite)

- [x] US-20 e US-17 integradas à `main` (US-20 às 17h13, US-17 às 18h10)
- [ ] US-15, US-18 e US-13 em Pull Request pronto para revisão (US-13 e US-15 já integradas, às 9h57 e 10h37; às 18h27, a US-18 em rascunho)
- [ ] Regra de corte: story nova sem Pull Request volta ao topo do backlog, registrada aqui
- [ ] Combinado para sexta: merges até o meio-dia. A ordem de 20/10 (US-15, US-18 e US-13) mudou: US-13 e US-15 entraram na quinta, e só a US-18 fica para sexta

## Pontos de atenção

- **Nenhum código dos guias foi executado no planejamento.** Quem implementa é a primeira pessoa a rodar migração, lint, build e testes. Trecho que não compilar: corrigir e registrar aqui.
- **Tipos novos em `lib/store.ts` vão na linha reservada** de cada story (README, "Onde as stories se encostam").
- **US-11 congela a tabela de tampinhas** e leva os registros para as doações de item. Aplicada em produção em 20/10, com as contagens conferidas antes e depois.
- **Apagar a cópia de segurança da US-11 na sexta, 23/10:** o esquema `backup_us11` do projeto hospedado guarda `donations_caps`, `donations_items` e `item_categories` como estavam antes da migração, com nome e telefone de doador. Fechado para `anon` e `authenticated`. Com tudo funcionando, o Mateus roda `drop schema backup_us11 cascade;` e registra aqui.
- **US-08a depende da tela da US-08b** para o link e o teste de fumaça: integra depois dela.
- **US-12 começa depois do PR da US-11** (mesma pessoa, mesmos arquivos).
- **Migrações em produção sem controle automático:** o projeto hospedado não tem a tabela `supabase_migrations.schema_migrations`, porque as migrações entram pelo SQL Editor. A única forma de saber o que está aplicado é conferir objeto por objeto, como em 19/10 e 20/10. A função da US-05 já estava aplicada e ninguém sabe quem aplicou. Quem aplicar uma migração em produção registra aqui no mesmo dia.
- **Chaves do Supabase:** desde 22/10, o projeto tem só a chave publicável; nenhuma secreta, e as legadas desativadas desde 05/10. Na Vercel, só `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`, e a integração do Supabase com a Vercel está desligada. Quem religar a integração ou criar chave secreta registra aqui o motivo.
- **Os guias de 20/10 foram conferidos** (`tsc`, lint, build e SQL) num ambiente de conferência, mas os testes do Playwright não rodaram. Trecho que não passar: corrigir e registrar aqui.
- **US-14 muda o campo de doador:** a doação sem pessoa passa a exigir a marcação "Doação sem ficha". O guia dela traz o ajuste dos testes que já registram doação sem pessoa, inclusive o da US-12.
- **US-18 traz dependências novas** (`write-excel-file` e, em desenvolvimento, `fflate`). Depois do merge, todo mundo roda `npm ci`.
- **Merges de sexta em ordem:** US-15, US-18 e US-13, até o meio-dia. A US-13 integra por último porque acrescenta a campanha nas telas das outras duas e na da US-17.
- **Pendências que seguem:** resposta da Flávia (termo de mensagens, matriz de permissões, US-04 e SEC-04, planilha do brechó para a US-09, soft opening); Product Backlog e Projeto Arquitetural; item das 7 vulnerabilidades altas em dependências de desenvolvimento, sem estimativa.
- **Itens novos para o backlog, achados no planejamento:** data "de amanhã" depois das 21h nos formulários de doação em dinheiro e de item; remover a tabela `donations_caps` e o que sobrou dela depois da US-11; cartões "Receita recorrente / mês" e "Total de doadores" da tela de doações em dinheiro somando todas as doações, e não as do mês (o "Total recebido · mês" é corrigido na US-17); controle das migrações aplicadas em produção (`supabase link` e `supabase db push`, que registra cada migração e mostra o que falta), junto da separação dos bancos de desenvolvimento e produção; passo na esteira que procura `sb_secret_` seguido da chave nos arquivos gerados pelo build (`.next/static`) e reprova se achar; aviso de confirmação para doação com valor muito alto (houve uma de teste com R$ 300 milhões); se a Flávia pedir, telefone da ficha na lista de doações, lido pela `telefone_da_pessoa` (mascarado para o balcão) e nunca copiado para a doação. Achados em 22/10: alertas de segurança do Dependabot ligados no repositório, para a equipe saber de vulnerabilidade nova antes de a esteira reprovar um PR.
- **Merge no GitHub:** o PR precisa estar em dia com a `main` (`gh pr update-branch <n>` resolve sem trocar de branch), e o merge automático (`--auto`) está desligado no repositório. O merge só passa com a esteira terminada e verde.

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
| 21/10 | Doação em dinheiro de pessoa com ficha continua sem telefone na própria doação: é a regra da SEC-05 (o telefone fica só na ficha), e não defeito da US-12. Observação da Laís no PR #33 |
| 21/10 | Doação de teste de R$ 300.000.000,00 (João da Silva, lançada em 27/08) apagada de produção, que só tem dados de teste |
| 22/10 | Na Vercel, só `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (com a chave publicável): são as únicas variáveis que o código lê. Nenhuma chave secreta do Supabase no projeto |
| 22/10 | Vulnerabilidade de dependência em produção é corrigida num PR próprio, integrado antes de qualquer outro, e cada branch aberta traz a `main` depois. A correção não entra misturada com uma story |
| 22/10 | A US-18 passa da Alissa para a Laís, que começa depois do merge da US-17. Motivo: a Alissa estava no caminho crítico da sprint (US-14, US-17 e US-18 em sequência, mais a revisão da US-15), e a US-17 ainda não tinha commit. Revisão continua com a Bibiana. Aprovado pela Alissa, pela Bibiana e pela Laís |

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
| 20/10 | Guias enviados na branch `docs-sprint-4-replanejamento` (PR #30), com o README (seção "Replanejamento de 20/10"), este progresso, o índice das sprints e a matriz de permissões |
| 20/10 | Trello: lista renomeada para "Selecionado · Sprint 4 (17/10 a 23/10) · 58 SP"; os sete cartões novos movidos para ela, com tipo, sprint, responsáveis, branch, guia, meta e regra de corte na descrição e o checklist "Tarefas da Sprint 4" (58 tarefas); descrição da US-12 com a meta nova. Ficam por fazer à mão: etiqueta "Sprint 4" e membros nos cartões novos |
| 20/10 | Guia da US-12 com a meta do replanejamento (merge até quarta 21/10 à noite) |
| 20/10 | Mateus cria a etiqueta "Sprint 4" no Trello; ela é posta nos 13 cartões da sprint (os seis de 16/10 e os sete do replanejamento). Os membros continuam por fazer à mão: a integração com o Trello não atribui membro a cartão |
| 20/10 | Laís aprova o PR #30 (10h23) e o Mateus integra (10h42) |
| 20/10 | Bibiana aprova a US-11 (PR #29, 10h38); Laís traz a `main` para a branch (10h44). Esteira verde |
| 20/10 | Mateus confere as migrações no SQL Editor do projeto hospedado. Antes: `atalhos_da_venda`, `eh_equipe` e `eh_coordenacao` presentes; `unaccent` em `extensions`; sem `pg_trgm` e sem os índices da US-08a |
| 20/10 | US-05 em produção: a `20261019090000_atalhos_da_venda` já estava aplicada, sem registro de quem aplicou. Corpo da função igual ao da `main` (`pg_get_functiondef`); `security definer`; `anon` sem execução e `authenticated` com; sem login, 0 linhas. Não foi reaplicada |
| 20/10 | US-08a em produção: Mateus aplica a `20261021090000_possiveis_repetidos`. Conferido: `pg_trgm` em `extensions`; `nome_para_comparar` imutável, com "José ÁVILA da Conceição" virando "jose avila da conceicao"; os dois índices em `clients`; `security definer`; `anon` sem execução e `authenticated` com; sem login, 0 pares; 12 fichas, como antes |
| 20/10 | O projeto hospedado não tem a tabela `supabase_migrations.schema_migrations`: nenhuma migração aplicada pelo SQL Editor fica registrada. Controle das migrações anotado como item novo do backlog |
| 20/10 | Mateus testa a US-05 e a US-08a no sistema publicado, como coordenação: atalhos na nova venda e Possíveis repetidos com um par de teste levado até a mesclagem. Tudo como esperado |
| 20/10 | Laís integra a US-11 (PR #29, 10h49); esteira da `main` verde. Com isso, 26 de 58 SP integrados. Na conferência das 10h55, o cartão da US-11 ainda estava em Em revisão no Trello e a migração `20261020100000_categorias_de_doacao` ainda não tinha sido aplicada em produção |
| 20/10 | O sistema publicado recebeu o código da US-11 às 10h49 sem a coluna `weight_kg` em `donations_items` no banco: até a migração, a lista de doações de item, o histórico da ficha e o registro de item novo dependiam de uma coluna que não existia |
| 20/10 | Migração da US-11 em produção, antes: 2 tampinhas (4.600 unidades, 16,5 kg, as 2 com ficha), 3 doações de item, nenhuma de categoria tampinha, nenhum id em comum entre as duas tabelas, sem `weight_kg`; colunas de `donations_caps` como no guia. Fichas com tampinha: Patrícia Nunes (1 doação na contagem da ficha) e Antônia Ferreira (2) |
| 20/10 | Mateus faz a cópia de segurança no esquema `backup_us11` (2 tampinhas, 3 itens e 10 categorias), fechado para `anon` e `authenticated` |
| 20/10 | Mateus aplica a `20261020100000_categorias_de_doacao`. Depois: `donations_caps` vazia; 5 doações de item, 2 de tampinha com 4.600 unidades, 16,5 kg e as 2 com ficha; nenhuma divergência com a cópia (id, pessoa, data, quantidade, peso, doador e quem registrou); `authenticated` sem inserir nem alterar em `donations_caps` e ainda lendo; política de inserção removida; categorias tampinha, peruca e batom criadas. Contagem de doações na ficha igual à de antes: Patrícia Nunes 1, Antônia Ferreira 2 |
| 20/10 | Mateus testa a US-11 no sistema publicado, como coordenação: Doações · Itens com as 2 tampinhas migradas; fichas da Patrícia Nunes e da Antônia Ferreira com a tampinha no histórico; `/doacoes/tampinhas` e `/doacoes/tampinhas/nova` redirecionam; tampinha nova só com o peso (2,5 kg) e item sem quantidade nem peso ("só o registro") gravados em `donations_items`, com `donations_caps` ainda vazia; categoria de teste criada, renomeada e desativada; Tampinhas fora do menu. Teste como caixa pulado no sistema publicado (o caso roda na esteira, em `tests/acesso/categorias.spec.ts`) |
| 20/10 | Na primeira abertura, a ficha da Antônia Ferreira ficou em "Carregando..." nas mensagens e no histórico; ao recarregar, carregou normalmente. As duas seções usam Server Actions, que o Next.js executa uma de cada vez: uma chamada lenta segura a outra. Tratado como lentidão passageira; se repetir, conferir bloqueios no banco e os logs da Vercel |
| 20/10 | Registros de teste da US-11 apagados (2 doações de item e a categoria de teste), conferido no SQL Editor: 5 doações de item, como logo depois da migração |
| 20/10 | Mateus cria a branch `us-15-contribuicao-no-periodo` a partir da `main` com a US-11. Guia conferido contra essa `main` (fim de `types/index.ts`, linha reservada do import, `brMidnightUtc`, `DAY_MS`, `round2`, `brTodayStr`, `ehCoordenacao` na tela Clientes e dados do seed) e escrito com o Claude sem ajuste: tipo `ContribuicaoNoPeriodo`, `getContribuicao`, `fetchContribuicao`, cartão "Contribuição no período" só para a coordenação e o teste de fumaça `contribuicao-no-periodo.spec.ts` |
| 20/10 | Mateus roda a US-15 na máquina dele: lint, build, fumaça (os 2 testes novos incluídos) e acesso verdes; passos de B4 na tela, como coordenação e como caixa, como no guia. Commit `ab75f98` (11h47) |
| 20/10 | Conferência às 11h49: nenhum PR aberto no GitHub (nem o rascunho da US-15, nem o da branch `docs-progresso-sprint-4-noite`). No Trello, o cartão da US-11 continua em Em revisão e o da US-15 em Selecionado |
| 20/10 | Mateus abre o PR #31 da US-15 em rascunho (11h55) e o PR #32 deste progresso (11h58). Laís abre a branch da US-12 (11h29) e o PR #33 (12h09) |
| 21/10 | Alissa aprova a US-12 (10h39) e o Mateus integra o PR #33 (10h41); esteira da `main` verde. A regra de corte da quarta fica atendida: a US-13 segue. Com isso, 31 de 58 SP integrados |
| 21/10 | Observação da Laís no PR #33: doação em dinheiro de pessoa com ficha aparece sem telefone na lista. É a regra da SEC-05 em `registerDonation` (o telefone fica só na ficha), anterior à US-12 |
| 21/10 | Migração da US-12 em produção, antes: sem `events` e sem `event_id`; `donations_cash_view` com as 10 colunas da SEC-05 e `security_invoker`; nenhuma view dependente; 5 doações somando R$ 300.000.880,00 |
| 21/10 | Uma das 5 doações era um lançamento de teste de 27/08 (João da Silva, R$ 300.000.000,00, sem observação). O Mateus a apaga de produção, conferindo id, valor e nome: ficam 4 doações, R$ 880,00 |
| 21/10 | Mateus aplica a `20261021100000_doacao_de_evento`. Depois: `events` vazia, com RLS e as 4 políticas, sem leitura para `anon`; `event_id` em `donations_cash`; `donations_cash_view` e `events_totals` com `security_invoker`, lidas só por `authenticated`; a view com as mesmas 4 doações e R$ 880,00 da tabela |
| 21/10 | Alissa abre o PR #34 da US-14 (16h00). Bibiana abre o PR #35 da US-22 (17h29); Mateus aprova (17h32) e a Bibiana integra (17h48): 32 de 58 SP. Bibiana aprova a US-14 (17h46). Branch da US-17 criada, sem commit |
| 21/10 | No teste da US-12 no sistema publicado, o menu não mostra Eventos, Categorias nem os outros itens da coordenação, embora as telas abram pelo endereço. O perfil do Mateus no banco está certo (`admin`, ativo, permissões e política de `users` como esperado). No navegador, a chamada do menu a `/auth/v1/user` recebe 401 com a mensagem "Forbidden use of secret API key in browser" |
| 21/10 | Causa: a variável `NEXT_PUBLIC_SUPABASE_ANON_KEY` de produção na Vercel guardava uma chave secreta (`sb_secret_`), e não a publicável. Variável `NEXT_PUBLIC_` vai para os arquivos que o navegador baixa: a chave secreta, que ignora o RLS, ficou publicada no site. O Supabase recusa a chave secreta só no navegador; o servidor do sistema a usava sem erro, e só o menu (único ponto que consulta o Supabase pelo navegador) quebrou. Local e esteira usam o banco local e nunca viram o erro. Nenhuma chave secreta esteve no repositório (conferido no histórico do git), e nada no código, na esteira ou nos scripts usa chave secreta. Data em que a variável recebeu a secreta: não registrada (a variável foi apagada antes de se anotar o "Updated"); a rotação de 05/10 da SEC-01 previa a publicável nessa variável |
| 22/10 | Contenção, pelo Mateus, na madrugada: publicável antiga apagada no Supabase e publicável nova criada (a exclusão da chave secreta exposta ainda não estava confirmada às 2h05); chaves legadas `anon` e `service_role` conferidas como desativadas desde 05/10; variáveis do Supabase apagadas na Vercel e recriadas só `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` (publicável), em Production e Preview; novo deploy de produção sem cache. Conferido: login, menu da coordenação completo, `/auth/v1/user` com 200 e nenhuma chave secreta nos arquivos do site (a única ocorrência de `sb_secret_` é o texto da biblioteca que confere o prefixo das chaves) |
| 22/10 | A integração do Supabase com a Vercel está ligada: as seis variáveis que ela gerencia (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` e `SUPABASE_JWT_SECRET`, só de servidor e não usadas pelo código) reapareceram depois de apagadas, três delas reescritas na troca das chaves. Desligar a integração fica como pendência |
| 22/10 | Laís abre o PR #36 da US-13 em rascunho (0h08), com esteira verde |
| 22/10 | Mateus confere as chaves no Supabase: só a publicável nova e a secreta `vercel_producao_2026_10_22`, criada junto com ela. A chave secreta exposta não existe mais. A secreta nova não foi para o site; a integração a copiou para `SUPABASE_SECRET_KEY` na Vercel. Será apagada depois de desligar a integração |
| 22/10 | Mateus encerra o incidente: integração do Supabase com a Vercel desligada nos dois lados; secreta `vercel_producao_2026_10_22` apagada (o Supabase fica só com a publicável); as seis variáveis da integração apagadas da Vercel, que fica só com `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Conferido no Supabase, na Vercel e no site publicado |
| 22/10 | Mateus testa a US-12 no sistema publicado, como coordenação: Eventos no menu; lista de doações em dinheiro com as 4 doações; campo "Evento (opcional)" ausente sem evento ativo; evento de teste cadastrado; doação de R$ 1,00 com evento ("Evento: …" na lista e 1 doação e R$ 1,00 no total do evento); doação de R$ 2,00 sem evento, fora do total do evento; desativar tira o evento do formulário e reativar o devolve. Conferido no banco: 1 doação ligada ao evento, `events_totals` com 1 doação e R$ 1,00, evento ativo depois de reativado |
| 22/10 | Limpeza dos testes da US-12: evento e doação com evento apagados pela observação; a doação de R$ 2,00 sem evento tinha outra observação ("testando us-12") e foi apagada pelo id. Produção volta a 4 doações, R$ 880,00, e nenhum evento |
| 22/10 | Auditoria de dependências do PR #36 reprovou duas vezes (3h09 e 3h21 UTC) com "400 Bad Request" no endpoint antigo `audits/quick`. Causa: incidente do npm ("Degraded Package Install and Publishing", aberto às 2h33 UTC); o endpoint novo travou e o npm caiu no antigo, já aposentado. Passou ao rodar de novo depois do incidente, sem mudança no workflow |
| 22/10 | Conferência às 9h55 no GitHub: US-13 (#36) fora do rascunho, aprovada pelo Mateus, esteira verde e em dia com a `main`; US-14 (#34) aprovada, 2 commits atrás da `main` e sem conflito; US-15 (#31) em rascunho, 8 commits atrás e sem conflito; US-17 sem commit; branches da US-20 e da US-18 inexistentes. Sem conflito de texto entre US-13, US-14 e US-15 (simulação de merge) |
| 22/10 | Migração da US-13 em produção, antes: sem `campaigns`, sem `campaigns_totals` e sem `campaign_id` em `donations_cash`. Combinado aplicar a migração antes do merge, porque ela só acrescenta e o código publicado continua funcionando com ela |
| 22/10 | Alissa, Bibiana e Laís aprovam a troca: a Laís assume a US-18 depois do merge da US-17 |
| 22/10 | Mateus aplica a `20261022090000_doacao_de_campanha` em produção, antes do merge. Laís integra a US-13 (PR #36, 9h57), com as Partes A a D: **37 de 58 SP concluídos** |
| 22/10 | Laís pergunta se a US-18 pode ser dividida. Conferido no guia: só a aba Resumo e o botão dependem da US-17, e o teste deixa de depender da US-14 pondo o `=1+1` nas observações de uma doação com ficha. Proposta: uma branch e um PR, com a parte independente (inclusive a aba Campanhas, Parte G da US-13) feita agora em rascunho e o Resumo e o botão depois do merge da US-17 |
| 22/10 | Mateus traz a `main` para a US-15 (`e9db673`) e faz, com o Claude, a Parte D da US-15 (parte de cada evento, lida da `donations_cash_view`) e a Parte E da US-13 (parte de cada campanha), no mesmo trecho de `getContribuicao`. Dois testes de fumaça novos: Mariana Fontes em maio (R$ 170,00, R$ 120,00 no Jantar de outono) e Sônia Maria Reis em julho (R$ 150,00 no Natalenço 2026). Lint, build, fumaça e acesso passando na máquina do Mateus. Commit `72179af` enviado e PR #31 fora do rascunho (10h20); esteira rodando na hora da conferência |
| 22/10 | Alissa traz a `main` para a US-14 e integra o PR #34 (10h23): **40 de 58 SP concluídos.** Sem migração |
| 22/10 | Esteira do PR #31 verde (lint, build e fumaça em 4min26s, auditoria e varredura de segredos). Alissa aprova a US-15 (10h25). O PR fica atrás da `main` pelo merge da US-14, sem conflito (simulação de merge) |
| 22/10 | Mateus traz a `main` para a US-15 (`d64e802`, sem conflito). A primeira tentativa de merge foi recusada porque o job de lint, build e fumaça ainda rodava; com a esteira verde, o Mateus integra o PR #31 (10h37), e a esteira da `main` passa: **48 de 58 SP concluídos.** Sem migração |
| 22/10 | Mateus testa a US-15 no sistema publicado: cartão "Contribuição no período" na ficha funcionando |
| 22/10 | Bibiana abre o PR #37 da US-20 (15h22). A auditoria de dependências reprova: alertas novos para o `next` 16.0.0 a 16.4.0, um crítico (GHSA-2464-fhr4-w9xw, execução remota de código sem login na otimização de imagens com SVG) e dois outros (GHSA-p3m5-59mp-jv5r, negação de serviço com Server Actions; GHSA-673q-mjm6-r5xr, execução remota em `use cache`, que o sistema não usa). A `main` e o site publicado usavam o `next` 16.3.8; o sistema usa `next/image` no login e no menu. Lint, build, fumaça e varredura de segredos do #37 passaram |
| 22/10 | Mateus abre o PR #38 (`sec-next-16-4-2`, 16h15): `next` e `eslint-config-next` para 16.4.2, `npm audit --omit=dev` com 0 vulnerabilidades. Esteira verde às 16h18, Laís aprova às 16h18 e o Mateus integra às 16h19; a Vercel publica o deploy da correção. A esteira da `main` travou no passo "Instalar navegador dos testes" (`apt-get` lento no GitHub, mais de 7 minutos contra uns 20 segundos nas execuções anteriores) e passou ao rodar de novo |
| 22/10 | Depois da correção, cada branch aberta traz a `main` e roda `npm ci`. A US-18 teve conflito no `package.json` e no `package-lock.json` (as dependências dela nas mesmas linhas); resolvido ficando com os arquivos da `main` e instalando de novo `write-excel-file` e `fflate` (`f238c87`) |
| 22/10 | Laís aprova a US-20 (16h02); Bibiana traz a `main` com a correção (16h54) e integra o PR #37 (17h13), esteira verde: **51 de 58 SP concluídos.** Sem migração |
| 22/10 | Laís abre o PR #39 da US-18 em rascunho (16h19), com as dependências e, depois, a Parte A com `campaign_name` (Parte G da US-13, como combinado). A Parte A ficou nas linhas do guia, que são as da US-17, e não nas combinadas de manhã |
| 22/10 | Alissa abre o PR #40 da US-17 (17h26), com a Parte D (eventos). Mateus roda a story, confere e aprova (18h09); Alissa integra (18h10), esteira da `main` verde: **56 de 58 SP concluídos.** Sem migração |
| 22/10 | PR #32 (progresso) atualizado com a `main` pelo GitHub (`gh pr update-branch`) e integrado pelo Mateus com a esteira verde. O `--auto` do merge não funciona: o merge automático está desligado no repositório. O progresso segue na branch `docs-progresso-sprint-4-sexta` |
| 22/10 | Conferência às 18h27: ao trazer a `main`, a US-18 terá conflito com a US-17 em `types/index.ts` (o bloco `RelatorioConsolidado` e o `DadosDaExportacao`, os dois ficam) e no import de `lib/store.ts` (ficam `ItemDoHistorico`, `RelatorioConsolidado` e `DadosDaExportacao`). Mensagem enviada à Laís com a resolução e a proposta de pôr a Parte F da US-13 no mesmo PR |
| 22/10 | Mateus testa a US-17 e a US-20 no sistema publicado, como coordenação: Relatórios com a seção do período (vendas, doações com a parte de cada evento, itens por categoria e ranking) e Clientes › Doadores recorrentes com o filtro de interrompidos. Tudo funcionando |

## Encerramento

A preencher em 23/10.
