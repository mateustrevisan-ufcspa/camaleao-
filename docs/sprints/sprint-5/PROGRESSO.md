# Sprint 5 · progresso

**Período:** 24/10 a 30/10/2026 · **Situação:** em andamento · **Atualizado em:** 26/10/2026, planejamento (conferido no GitHub e no Trello)

Plano da sprint: [README.md](README.md).

## Resumo

- **26/10, planejamento:** 5 itens, 14 SP (BUG-01, BUG-02, SEC-06, TS-02 e US-19). Semana da avaliação do Instituto: merges só depois das 22h, com aviso no grupo das avaliadoras, e nenhuma migração no banco publicado até quinta à noite. Nada começado ainda; primeira meta: branches com push até o fim do dia.

## Ponto de partida: como a Sprint 4 terminou

- 58 de 58 SP integrados à `main` (13 user stories); último merge: PR #42 (campanha na ficha, no relatório e na planilha, parte da US-13), 23/10 às 0h02. Detalhes no [progresso da Sprint 4](../sprint-4/PROGRESSO.md) e no relatório de fechamento.
- Product Backlog com 63 SP em 8 stories (US-04, SEC-04, US-09, US-16, US-19, US-21, US-24 e US-25), cerca de 16 SP por sprint nas quatro que faltam, sem contar o que vier do retorno do Instituto.
- A branch `docs-progresso-sprint-4-sexta` (PROGRESSO da Sprint 4 até 22/10, 18h27) não foi integrada; o índice das sprints é atualizado neste PR com a Sprint 4 encerrada.
- Reunião com o Instituto em 23/10: avaliação por três pessoas, cada uma num perfil, com retorno até quinta 29/10 e revisão do sistema prevista para sexta 30/10.

## Stories (14 SP)

| Story | Tipo | SP | Implementa | Revisa | Branch | PR | Situação |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [BUG-01](BUG-01.md) · Data de amanhã na doação de item depois das 21h | Correção | 1 | Laís | Alissa | `bug-01-data-da-doacao-de-item` | | Não iniciada. Meta: PR até terça 27/10, 18h; merge na terça, depois das 22h |
| [BUG-02](BUG-02.md) · Cartões da tela de doações em dinheiro com os números do mês | Correção | 1 | Bibiana | Laís | `bug-02-cartoes-de-doacoes` | | Não iniciada. Meta: PR até terça 27/10, 18h; merge na terça, depois das 22h |
| [SEC-06](SEC-06.md) · Build recusa chave secreta do Supabase | Segurança | 2 | Laís | Bibiana | `sec-06-build-recusa-chave-secreta` | | Não iniciada. Meta: PR e PR de prova na quarta 28/10; merge na quarta, depois das 22h |
| [TS-02](TS-02.md) · Banco de produção novo, montado só pelas migrações | Technical | 5 | Mateus | Laís | `ts-02-banco-de-producao` | | Não iniciada. Meta: diff na terça, projeto novo na quarta, ensaio e merge na quinta |
| [US-19](US-19.md) · Contribuição convertida em atendimentos | User | 5 | Alissa | Mateus | `us-19-atendimentos` | | Não iniciada. Meta: PR aprovado até quinta 29/10, 18h; migração e merge na quinta, depois das 22h |

## Avaliação do Instituto

| Avaliadora | Perfil | Conta criada | Avaliou em | Retorno recebido | Cartões criados |
| --- | --- | --- | --- | --- | --- |
| Tamara | voluntária | | segunda 26/10 (previsto) | | |
| Ana | balcão (caixa) | | | | |
| Nílian | coordenação | | | | |

Retornos viram cartões na lista "Retorno da avaliação (26/10 a 29/10)" do Trello no mesmo dia (regra no [README](README.md#retorno-da-avaliação)).

## Publicações no sistema publicado

Uma linha por merge desta semana. "Conferido" diz com qual conta de conferência e o que foi refeito.

| Data | Aviso no grupo | Merge | O quê | Quem | Conferido |
| --- | --- | --- | --- | --- | --- |
| | | | | | |

## Conferência do meio da sprint (quarta 28/10)

A preencher na quarta à noite: BUG-01 e BUG-02 integradas e conferidas? Resultado do diff da TS-02? US-19 no caminho para o PR de quinta? Quantos retornos chegaram e quantos são falha?

## Pontos de atenção

- **Nenhum código dos guias foi executado no planejamento.** Quem implementa é a primeira pessoa a rodar migração, lint, build e testes. Trecho que não compilar: corrigir e registrar aqui.
- **Merge espera a janela da noite,** mesmo com o PR aprovado. Segunda 26/10 sem merge.
- **A US-19 muda o endereço depois da venda** para `/brecho?venda=...`; ela mesma ajusta os dois testes que conferiam `/brecho`.
- **A migração da US-19 é a última aplicada pelo SQL Editor** no banco atual. No projeto novo da TS-02, entra por `db push`.
- **Nunca rodar `db push` com o CLI ligado ao banco atual** (ele não tem a tabela de migrações). Conferir `supabase/.temp/project-ref` antes.
- **Sem chave, senha ou token** neste arquivo, no Trello ou no PR, inclusive na prova da SEC-06 (a chave da prova é inventada).

## Pendências que seguem

- **Do Instituto:** aprovação do texto do termo de mensagens (trava a US-21); planilha das doações recorrentes e a exportada pela plataforma de doações (US-09); datas de treinamento (US-25); confirmação da revisão de sexta 30/10.
- **Da Sprint 4:** conferir se o esquema `backup_us11` foi apagado do banco publicado (estava previsto para 23/10); registrar no burndown a velocity de 58 SP.
- **No Trello, à mão:** criar a etiqueta "Sprint 5" e aplicar nos cinco cartões; pôr os membros em cada cartão (as ferramentas do Claude não fazem nenhuma das duas coisas).
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

## Registro

| Data | O que aconteceu |
| --- | --- |
| 26/10 | Planejamento da Sprint 5: 5 itens, 14 SP; guias escritos em `docs/sprints/sprint-5/` a partir da `main` de 26/10 (PR #42), sem execução de código |
| 26/10 | Trello: lista renomeada para "Selecionado · Sprint 5 (24/10 a 30/10) · 14 SP"; cartões novos da BUG-01, BUG-02, SEC-06 e TS-02; US-19 movida do Backlog do Produto; descrição e checklist "Critérios de aceitação" nos cinco; lista nova "Retorno da avaliação (26/10 a 29/10)"; cartão novo da US-27 · Condição e destino do item doado, sem estimativa, no Backlog do Produto |
| 26/10 | Matriz de permissões com as linhas da US-19, marcadas "(Sprint 5, US-19)" |
| 26/10 | Guias, README e este progresso enviados na branch `docs-sprint-5-planejamento` (PR #43), para integrar na terça 27/10 depois das 22h |
| 26/10 | Trello: checklist "Tarefas da Sprint 5" nos cinco cartões (48 tarefas, cada uma com o nome de quem faz, inclusive revisão, aviso no grupo, merge e conferência), como na Sprint 4; seção "Quem faz o quê" no README. Na US-19, o checklist de critérios duplicado virou o de tarefas, e o critério do recibo ganhou a nota "(o recibo entra com a US-16)" |

## Encerramento

A preencher em 30/10.
