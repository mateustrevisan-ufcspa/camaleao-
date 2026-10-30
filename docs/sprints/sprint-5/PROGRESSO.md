# Sprint 5 · progresso

**Período:** 24/10 a 30/10/2026 · **Situação:** em andamento · **Atualizado em:** 29/10/2026, noite: BUG-01, BUG-02 e US-19 integradas; SEC-06 aprovada, esperando o merge; TS-02 não iniciada

Plano da sprint: [README.md](README.md).

## Resumo

- **26/10, planejamento:** 5 itens, 14 SP (BUG-01, BUG-02, SEC-06, TS-02 e US-19). Semana da avaliação do Instituto: merges só depois das 22h, com aviso no grupo das avaliadoras, e nenhuma migração no banco publicado até quinta à noite. Nada começado ainda; primeira meta: branches com push até o fim do dia.
- **26/10, conferência do plano:** guias conferidos contra a `main` (PR #42). Três correções nos guias: teste da BUG-01 sem data fixa, que reprovaria a esteira a partir de 28/10; coluna "Atendimentos" na lista de doações (Parte H2 da US-19), para cumprir o "por doação"; passo 6b da TS-02, sobre a integração do Supabase com o GitHub. A Sprint 4 foi encerrada no PR #41.
- **29/10, noite:** 7 de 14 SP integrados à `main`: BUG-01 (PR #44, 28/10), BUG-02 (PR #47, 29/10) e US-19 (PR #46, 29/10, com a migração aplicada no banco publicado pelo SQL Editor). A SEC-06 (2 SP) está aprovada, com a prova de bloqueio feita, e espera o merge. A TS-02 (5 SP) não foi iniciada. Faltam as conferências no sistema publicado. Avaliação do Instituto: a Tamara mandou 8 observações (1 falha com contorno e 7 melhorias), a Nílian mandou 5 sobre o financeiro (3 melhorias e 2 dúvidas), e a Ana achou o sistema fácil e enxuto, sem observações.

## Ponto de partida: como a Sprint 4 terminou

- 58 de 58 SP integrados à `main` (13 user stories); último merge: PR #42 (campanha na ficha, no relatório e na planilha, parte da US-13), 23/10 às 0h02. Detalhes no [progresso da Sprint 4](../sprint-4/PROGRESSO.md) e no relatório de fechamento.
- Product Backlog com 63 SP em 8 stories (US-04, SEC-04, US-09, US-16, US-19, US-21, US-24 e US-25), cerca de 16 SP por sprint nas quatro que faltam, sem contar o que vier do retorno do Instituto.
- A branch `docs-progresso-sprint-4-sexta` (PROGRESSO da Sprint 4 até 22/10, 18h27) não foi integrada; o índice das sprints é atualizado neste PR com a Sprint 4 encerrada. Em 26/10, o PR #41 dessa branch recebeu o encerramento da Sprint 4 e deixou de mexer no índice, para não conflitar com este PR; integra na mesma janela, depois deste.
- Reunião com o Instituto em 23/10: avaliação por três pessoas, cada uma num perfil, com retorno até quinta 29/10 e revisão do sistema prevista para sexta 30/10.

## Stories (14 SP)

| Story | Tipo | SP | Implementa | Revisa | Branch | PR | Situação |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [BUG-01](BUG-01.md) · Data de amanhã na doação de item depois das 21h | Correção | 1 | Laís | Alissa | `bug-01-data-da-doacao-de-item` | [#44](https://github.com/mateustrevisan-ufcspa/camaleao-/pull/44) | Integrada em 28/10, 23h04, um dia depois da meta. Falta: conferência no sistema publicado |
| [BUG-02](BUG-02.md) · Cartões da tela de doações em dinheiro com os números do mês | Correção | 1 | Bibiana | Laís | `bug-02-cartoes-de-doacoes` | [#47](https://github.com/mateustrevisan-ufcspa/camaleao-/pull/47) | Integrada em 29/10, 21h32, dois dias depois da meta. Falta: conferência no sistema publicado |
| [SEC-06](SEC-06.md) · Build recusa chave secreta do Supabase | Segurança | 2 | Laís | Bibiana | `sec-06-build-recusa-chave-secreta` | [#45](https://github.com/mateustrevisan-ufcspa/camaleao-/pull/45) | Em revisão: aprovada pela Bibiana em 29/10, 22h34, com a prova de bloqueio feita (PR #48, fechado sem merge). Falta: merge |
| [TS-02](TS-02.md) · Banco de produção novo, montado só pelas migrações | Technical | 5 | Mateus | Laís | `ts-02-banco-de-producao` | | Não iniciada em 29/10: sem diff, sem projeto novo e sem branch. A meta (ensaio e merge na quinta) não foi cumprida |
| [US-19](US-19.md) · Contribuição convertida em atendimentos | User | 5 | Alissa | Mateus | `us-19-atendimentos` | [#46](https://github.com/mateustrevisan-ufcspa/camaleao-/pull/46) | Integrada em 29/10, 22h36. Migração aplicada no banco publicado pelo SQL Editor. Falta: conferência no sistema publicado (coordenação e voluntária) e `db push` no banco novo da TS-02 |

## Avaliação do Instituto

| Avaliadora | Perfil | Conta criada | Avaliou em | Retorno recebido | Cartões criados |
| --- | --- | --- | --- | --- | --- |
| Tamara | voluntária | sim | segunda 26/10 (previsto) | 29/10, 9h34 a 10h58, por WhatsApp (data a confirmar): 8 observações, 1 falha e 7 melhorias, mais a descrição do recebimento de doações | 8 (#45 a #52) |
| Ana | balcão (caixa) | sim | | 16h22, por WhatsApp (data a confirmar): "achei muito bom, fácil de mexer e bem enxuto, tem as informações básicas". Sem observações | nenhum |
| Nílian | coordenação | sim | | 29/10, 10h33, por WhatsApp (data a confirmar): elogiou o sistema e mandou 5 observações sobre o financeiro, 3 melhorias e 2 dúvidas | 5 (#53 a #57) |

Retornos viram cartões na lista "Retorno da avaliação (26/10 a 29/10)" do Trello no mesmo dia (regra no [README](README.md#retorno-da-avaliação)).

### Retornos da Tamara (voluntária)

| # | Tela | Observação | Tipo | Encaminhamento |
| --- | --- | --- | --- | --- |
| 1 | Doações · Itens · Nova doação, campo "Categoria" | As categorias cadastradas não são as que ela usa. Pede só Roupas, Tampinhas e Diversos, como as três planilhas de hoje | Melhoria | Sem código: a coordenação cria "Roupas" e "Diversos" e desativa as outras em Doações · Categorias (US-11); "Tampinha" já existe. Confirmar com a Tamara se cabelos e perucas ficam em Diversos |
| 2 | Doações · Itens · Nova doação, campo "Quantidade" | Pede três contagens no lugar da quantidade: Aproveitadas (vão para a venda), Redoadas (outras entidades) e Descarte, até 300 peças cada | Melhoria | Junta-se à US-27 · Condição e destino do item doado (Backlog do Produto) |
| 3 | Doações · Itens · Nova doação, campo "Peso" | Não usa | Melhoria | Remover, na US-27 |
| 4 | Doações · Itens · Nova doação, campo "Estado" | Não usa | Melhoria | Remover, na US-27, junto com "Destino", que as três contagens substituem |
| 5 | Doações · Itens · Nova doação, "Cadastrar novo" | Os botões "Cancelar" e "Cadastrar" ficam fora da tela, e ela precisou reduzir o zoom para vê-los | Falha, com contorno | A janela (`components/clients/new-client-modal.tsx`) não tem altura máxima nem rolagem. É a mesma janela da nova venda, então afeta também o balcão. Proposta: BUG-03 no topo da Sprint 6 |
| 6 | Doações · Itens | Editar e excluir item registrado, para corrigir erros. Foi a "uma coisa só" que ela mudaria | Melhoria | Junta-se à US-04 (correção e cancelamento de lançamento) |
| 7 | Doações · Dinheiro | A voluntária vê as doações em dinheiro e não deveria | Melhoria | Story nova: perfil de voluntária separado do de caixa |
| 8 | Brechó (caixa) | A voluntária não deveria ter acesso ao caixa: ela não lida com a parte financeira | Melhoria | Mesma story nova da observação 7 |

Como o recebimento funciona hoje, pelo relato dela: a voluntária não abre as sacolas; pergunta ao doador o que é e anota numa planilha impressa a data, o nome e o telefone. Grampeia na sacola um papel com a data e o nome, e a triagem devolve o papel com a contagem de Aproveitadas, Redoadas e Descarte, que vai para uma das três planilhas do Google (roupas, tampinhas e diversas: livros, utensílios, cabelos, perucas e outros). Por isso a doação tem dois momentos, a entrada e a triagem, e a contagem só chega depois, o que reforça o pedido de editar (observação 6). No começo, ela vai usar só Doações · Itens.

### Retornos da Nílian (coordenação)

Ela trabalha no financeiro e testou o roteiro inteiro. Sobre doações, cadastro de pessoas e mercadorias, disse que as colegas da área dão um retorno melhor. Achou o sistema muito bom.

| # | Tela | Observação | Tipo | Encaminhamento |
| --- | --- | --- | --- | --- |
| 1 | Brechó · Financeiro, conferência do recebimento | Mostrar na tela se o pagamento foi crédito ou débito; hoje só aparece no CSV | Melhoria | Confirmado no código: a coluna "Banco" (`components/shop/financials-table.tsx`) mostra o banco e só mostra a forma de pagamento quando não há banco. Ajuste pequeno, para o replanejamento |
| 2 | Relatórios e Financeiro | Somas de vendas por dia, por semana e por mês, como na planilha de hoje; o sistema só tem a mensal | Melhoria | Story nova para o replanejamento |
| 3 | Financeiro | Cálculo da comissão de vendas no fim de cada mês, editável; o mesmo para doações. A ideia veio da Flávia, que explica melhor | Melhoria | Sem cálculo pelo sistema: um campo de valor que a coordenação preenche à mão no cadastro (decisão do Mateus). Story nova; o replanejamento define em qual cadastro o campo entra |
| 4 | Vendas com cartão | "As taxas dos cartões já estarão cadastradas?" | Dúvida | Resposta: hoje não há cadastro. As taxas estão fixas no código (`calcNetAmount` em `actions/sales.ts`): 2% no crédito e 1,8% no débito, iguais para todo banco e sem considerar parcelas. Pedir ao Instituto as taxas reais de cada maquininha; story nova para a coordenação cadastrar as taxas, no padrão do valor do atendimento da US-19 |
| 5 | Eventos e campanhas | "O custo de evento ou campanha normalmente é reconhecido no fim do mesmo" | Dúvida | O sistema não registra custo de evento nem de campanha (US-12 e US-13 só somam o que entrou). Encaminhado como a comissão: um campo de custo preenchido à mão pela coordenação no cadastro do evento ou da campanha (decisão do Mateus) |

## Publicações no sistema publicado

Uma linha por merge desta semana. "Conferido" diz com qual conta de conferência e o que foi refeito.

| Data | Aviso no grupo | Merge | O quê | Quem | Conferido |
| --- | --- | --- | --- | --- | --- |
| 28/10 | a confirmar | 23h04, PR #44 | BUG-01 · data de Brasília na doação de item e recusa de data futura | Laís | a confirmar |
| 29/10 | a confirmar (previsto para as 21h no PR) | 21h32, PR #47 | BUG-02 · cartões de doações em dinheiro com os números do mês | Bibiana | a confirmar |
| 29/10 | a confirmar | 22h36, PR #46 | US-19 · atendimentos, com a migração `valor_do_atendimento` aplicada antes pelo SQL Editor | Alissa (merge), Mateus (migração) | a fazer: coordenação (tela do valor e ficha) e voluntária (venda e aviso) |

## Conferência do meio da sprint (quarta 28/10)

A preencher na quarta à noite: BUG-01 e BUG-02 integradas e conferidas? Resultado do diff da TS-02? US-19 no caminho para o PR de quinta? Quantos retornos chegaram e quantos são falha?

Preenchida em 29/10, com os fatos do GitHub sobre a noite de quarta 28/10:

- **BUG-01:** integrada às 23h04 (PR #44, aprovado pela Alissa às 11h54). Conferência no publicado não registrada.
- **BUG-02:** PR #47 aberto às 14h35 e aprovado pela Laís às 22h48, sem merge na quarta.
- **SEC-06:** PR #45 aberto às 11h12; a prova de bloqueio ainda não tinha sido feita.
- **TS-02:** sem diff e sem projeto novo.
- **US-19:** PR #46 aberto às 11h47, no caminho para a quinta.
- **Retornos do Instituto:** a registrar.

## Pontos de atenção

- **Nenhum código dos guias foi executado no planejamento.** Quem implementa é a primeira pessoa a rodar migração, lint, build e testes. Trecho que não compilar: corrigir e registrar aqui.
- **Merge espera a janela da noite,** mesmo com o PR aprovado. Segunda 26/10 sem merge.
- **A US-19 muda o endereço depois da venda** para `/brecho?venda=...`; ela mesma ajusta os dois testes que conferiam `/brecho`.
- **A migração da US-19 é a última aplicada pelo SQL Editor** no banco atual. No projeto novo da TS-02, entra por `db push`.
- **Nunca rodar `db push` com o CLI ligado ao banco atual** (ele não tem a tabela de migrações). Conferir `supabase/.temp/project-ref` antes.
- **Sem chave, senha ou token** neste arquivo, no Trello ou no PR, inclusive na prova da SEC-06 (a chave da prova é inventada).
- **A varredura da SEC-06 só olha `.next/static`.** Na primeira tentativa da prova, a chave estava num componente sem `'use client'`, foi parar em `.next/server` e a esteira passou. Chave em código só de servidor não chega ao navegador, mas a prova só vale com o `'use client'`. O gitleaks também não reconhece a chave inventada da prova.
- **A TS-02 não começou,** e a US-19 depende dela para o `db push` no banco novo. Se a TS-02 passar para a Sprint 6, a migração da US-19 entra no banco novo pelo `db push` da própria TS-02, junto com as outras.

## Pendências que seguem

- **Do Instituto:** aprovação do texto do termo de mensagens (trava a US-21); planilha das doações recorrentes e a exportada pela plataforma de doações (US-09); datas de treinamento (US-25); confirmação da revisão de sexta 30/10.
- **Da Sprint 4:** conferir se o esquema `backup_us11` foi apagado do banco publicado (estava previsto para 23/10); registrar no burndown a velocity de 58 SP.
- **No Trello, à mão:** criar a etiqueta "Sprint 5" e aplicar nos cinco cartões; pôr os membros em cada cartão (as ferramentas do Claude não fazem nenhuma das duas coisas). No cartão da US-19, acrescentar a tarefa "Parte H2: coluna Atendimentos na lista de doações (Alissa, quarta 28/10)"; no da TS-02, "Passo 6b: situação da integração do Supabase com o GitHub (Mateus)".
- **Avisar no grupo da equipe:** a Laís, que o teste da BUG-01 mudou no guia (sem data fixa, pelo link "Nova doação"); a Alissa, da Parte H2 da US-19.
- **Retornos no Trello:** cartões criados em 29/10. Falta pôr os membros e as etiquetas à mão e, antes da revisão de sexta, a coordenação acertar as categorias (observação 1 da Tamara).
- **Responder à Nílian:** as taxas de cartão estão fixas no código (2% no crédito e 1,8% no débito); pedir as taxas reais de cada maquininha, inclusive no parcelado, e contar que comissão e custo de evento entram como campo preenchido por elas no cadastro.
- **Para o replanejamento de sexta, vindo da avaliação:** BUG-03 (janela "Cadastrar novo" sem rolagem); US-27 com as três contagens e sem peso, estado e destino; US-04 com editar e excluir item; story nova de perfil de voluntária sem doações em dinheiro e sem caixa; forma de pagamento na tela do financeiro; somas por dia e por semana; taxas de cartão cadastradas pela coordenação; campos de comissão e de custo de evento ou campanha, preenchidos à mão no cadastro.
- **Itens novos sem cartão**, para o replanejamento de sexta: remover a tabela `donations_caps`; aviso de confirmação para doação de valor muito alto; telefone da ficha na lista de doações, se o Instituto pedir.

## Decisões

| Data | Decisão |
| --- | --- |
| 26/10 | Sprint mais leve: parte do tempo vai para acompanhar a avaliação do Instituto e montar o replanejamento com o retorno |
| 26/10 | Até quinta 29/10, merge só depois das 22h, com aviso no grupo das avaliadoras uma hora antes; segunda sem merge; nenhuma migração no banco publicado até quinta à noite |
| 26/10 | Sprint 5 com BUG-01 (1), BUG-02 (1), SEC-06 (2), TS-02 (5) e US-19 (5): 14 SP |
| 26/10 | US-19 puxada para o burndown andar, com a Alissa; integra na quinta à noite, depois do prazo de retorno |
| 26/10 | Prefixo `BUG-` para correção de falha, separada na velocity |
| 26/10 | O banco novo da TS-02 vira a produção e o atual vira o banco de teste; a virada fica fora da story, com data na revisão de sexta |
| 26/10 | SEC-06 com a checagem principal no `next.config.mjs` (roda na Vercel) e a varredura de `.next/static` na esteira como segunda barreira |
| 26/10 | US-19 converte sempre pelo valor em vigor; cada alteração do valor é uma linha nova, com quem e quando preenchidos pelo banco |
| 26/10 | "Por doação" da US-19 cumprido com a coluna "Atendimentos" em cada linha da lista de doações em dinheiro (Parte H2), e não com um aviso depois da doação: o aviso mudaria o endereço depois da doação, conferido por 6 testes de fumaça. Mesma estimativa (5 SP) |
| 26/10 | A integração do Supabase com o GitHub não é ligada no projeto novo nesta sprint: migração em produção continua manual, por `db push` |
| 29/10 | Comissão de vendas e de doações e custo de evento ou campanha (retorno da Nílian): o sistema não calcula; entra um campo de valor que a coordenação preenche à mão no cadastro. Mais simples que modelar a regra da comissão, e segue o que elas já fazem na planilha |

## Registro

| Data | O que aconteceu |
| --- | --- |
| 26/10 | Planejamento da Sprint 5: 5 itens, 14 SP; guias escritos em `docs/sprints/sprint-5/` a partir da `main` de 26/10 (PR #42), sem execução de código |
| 26/10 | Trello: lista renomeada para "Selecionado · Sprint 5 (24/10 a 30/10) · 14 SP"; cartões novos da BUG-01, BUG-02, SEC-06 e TS-02; US-19 movida do Backlog do Produto; descrição e checklist "Critérios de aceitação" nos cinco; lista nova "Retorno da avaliação (26/10 a 29/10)"; cartão novo da US-27 · Condição e destino do item doado, sem estimativa, no Backlog do Produto |
| 26/10 | Matriz de permissões com as linhas da US-19, marcadas "(Sprint 5, US-19)" |
| 26/10 | Guias, README e este progresso enviados na branch `docs-sprint-5-planejamento` (PR #43), para integrar na terça 27/10 depois das 22h |
| 26/10 | Trello: checklist "Tarefas da Sprint 5" nos cinco cartões (48 tarefas, cada uma com o nome de quem faz, inclusive revisão, aviso no grupo, merge e conferência), como na Sprint 4; seção "Quem faz o quê" no README. Na US-19, o checklist de critérios duplicado virou o de tarefas, e o critério do recibo ganhou a nota "(o recibo entra com a US-16)" |
| 26/10 | Conferência do plano contra a `main` (PR #42), lendo código, migrações, seeds e testes, sem executar nada. Conferem: os 14 SP, a carga e as revisões, o calendário, as 12 migrações, `eh_equipe` e `eh_coordenacao`, as contas do seed, os nomes de arquivos, variáveis e imports citados nos guias, os dados da Roberta Lima (2,8, 2 e 4,8 atendimentos) e os dois testes que esperam `/brecho` depois da venda |
| 26/10 | BUG-01: o teste fixava 27/10 às 21h30 só no navegador; a página vem do servidor com a data real, e o React não garante corrigir o `max` na hidratação. Passaria em 27/10 e reprovaria a esteira de todo PR a partir de 28/10. Guia corrigido: dia de hoje em Brasília às 21h30, formulário aberto pelo link "Nova doação" (montado no navegador) e prova de que o teste reprova com o código antigo |
| 26/10 | US-19: Parte H2 nova (coluna "Atendimentos" na lista de doações em dinheiro, com teste e linha na matriz de permissões); aviso de que `lib/store.ts` tem três `Promise.all` iguais e a mudança vai só no de `getContribuicao`; nota de que recarregar o painel mostra o aviso da venda de novo |
| 26/10 | TS-02: passo 6b sobre a integração do Supabase com o GitHub (a verificação "Supabase Preview" aparece nos PRs, ligada ao projeto atual) e aviso de que o ensaio só confere a chave com a `main` trazida depois da SEC-06. README: os itens 4 e 5 em "Onde as stories se encostam" e a tarefa da Parte H2 da Alissa |
| 28/10 | BUG-01: PR #44 aberto pela Laís às 10h01. O primeiro commit trouxe só o teste novo e a esteira reprovou; o segundo trouxe a correção e a esteira passou, como pedia o guia. Aprovado pela Alissa às 11h54 e integrado pela Laís às 23h04 |
| 28/10 | SEC-06: PR #45 aberto pela Laís às 11h12, com a checagem no `next.config.mjs`, a varredura de `.next/static` na esteira e a documentação em `docs/seguranca/chave-secreta-no-build.md`. Uma revisão da Alissa, das 11h21, aparece como descartada no GitHub (a revisora da story é a Bibiana) |
| 28/10 | BUG-02: PR #47 aberto pela Bibiana às 14h35. O cálculo dos três cartões saiu do componente para `lib/resumo-das-doacoes.ts` (`resumoDoMes`), com 3 testes novos; fumaça 36 e acesso 42, sem migração. Aprovado pela Laís às 22h48 |
| 28/10 | US-19: PR #46 aberto pela Alissa às 11h47, com a implementação seguindo o guia (migração, tela do valor, ficha, aviso da venda, coluna na lista de doações e testes novos de fumaça e de acesso) |
| 29/10 | SEC-06: prova de bloqueio no PR #48 (`sec-06-prova-de-bloqueio`), aberto pela Laís às 13h53. A esteira reprovou no passo "Nenhuma chave secreta nos arquivos do site", e o PR foi fechado sem merge às 14h30. Build local com chave falsa também recusado (print no PR #45) |
| 29/10 | BUG-02: integrada pela Bibiana às 21h32, antes da janela das 22h combinada para a semana da avaliação |
| 29/10 | US-19: revisão do Mateus às 21h14 com pedido de ajustes: comentário da US-17 apagado sem querer em `donations-list.tsx`, indentação em 8 arquivos, quebra de linha no fim dos arquivos novos e corpo do PR ainda como rascunho, sem a bateria completa. Lógica, migração e testes conferidos sem ressalva |
| 29/10 | US-19: ajustes da Alissa às 21h28; às 22h08 ela trouxe a `main` com a BUG-01 e a BUG-02 e resolveu o conflito em `donations-list.tsx` (cartões da BUG-02 com `resumoDoMes`, coluna da US-19). Bateria completa no PR: fumaça 38, acesso 45, `npm audit --omit=dev` sem achados |
| 29/10 | US-19: PR aprovado pelo Mateus às 22h33, depois do prazo de 18h do guia; integrado pela Alissa às 22h36 |
| 29/10 | US-19: migração `20261028090000_valor_do_atendimento.sql` aplicada pelo Mateus no banco publicado, pelo SQL Editor, conferida com o `select` (uma linha, R$ 50,00, sem autor) |
| 29/10 | SEC-06: PR #45 aprovado pela Bibiana às 22h34; falta o merge |
| 29/10 | Avaliação do Instituto: retorno da Tamara (voluntária) por WhatsApp, das 9h34 às 10h58, com uma tabela de observações, um print e respostas às perguntas do roteiro: 8 observações (1 falha com contorno e 7 melhorias), registradas acima. A Ana (caixa) disse que gostou do sistema, sem observações. A Nílian (coordenação), por WhatsApp às 10h33, elogiou o sistema e mandou 5 observações sobre o financeiro (3 melhorias e 2 dúvidas), também registradas acima. Nenhuma falha impede a avaliação, então nada entra como correção nesta semana; tudo vai para o replanejamento de sexta |
| 29/10 | Avaliação do Instituto: a Ana (caixa) respondeu às 16h22 que achou o sistema "muito bom, fácil de mexer e bem enxuto", com as informações básicas, sem observações. As três avaliadoras responderam |
| 29/10 | Decisão do Mateus sobre o retorno da Nílian: comissão e custo de evento ou campanha entram como campo preenchido à mão pela coordenação no cadastro, sem cálculo pelo sistema (registrada em "Decisões") |
| 29/10 | Trello: 13 cartões na lista "Retorno da avaliação (26/10 a 29/10)", um por observação, com quem, perfil, tela, o que aconteceu, tipo e encaminhamento: 8 da Tamara (#45 a #52) e 5 da Nílian (#53 a #57). Sem membros e sem etiquetas |
| 29/10 | TS-02: não iniciada. A meta era o diff na terça, o projeto novo na quarta e o ensaio e o merge na quinta |
| 29/10 | Pontos da revisão da US-19 que ficam como estão, por virem do desenho do guia: o total de atendimentos na ficha pode diferir em 0,1 da soma das partes; o aviso da venda reaparece ao recarregar o painel; o erro ao alterar o valor sempre cita a coordenação |

## Encerramento

A preencher em 30/10.
