# Sprint 7 · progresso

**Período:** 07/11 a 13/11/2026 · **Situação:** planejada · **Atualizado em:** 06/11/2026, no planejamento

Plano da sprint: [README.md](README.md).

## Resumo

- **06/11, planejamento:** 9 itens e 45 SP comprometidos (TS-05, TS-04, US-35, US-24b, SEC-04, US-09, US-24a, US-21a e US-31), mais a US-04b como extra (5 SP). US-21 e US-24 divididas; US-35 estimada em 5 SP; US-31 reestimada de 5 para 8 SP; TS-05 nova (1 SP). Product Backlog de 59 para 68 SP. Guias escritos nesta pasta a partir da `main` de 06/11 (PR #67), sem execução de código.

## Ponto de partida: como a Sprint 6 terminou

- 40 de 40 SP integrados à `main`; último merge: PR #67 (US-32), 06/11 às 10h32. Corte de quinta registrado como desvio no relatório da Sprint 6.
- Sistema publicado no `camaleao-producao` desde 04/11, com 18 migrações (até `20261104090000`).
- Revisão de 06/11 com o Instituto: nada mudou. Perguntas pendentes enviadas no mesmo dia (tabela "Respostas do Instituto").

## Stories (45 SP + 5 extra)

| Story | Tipo | SP | Implementa | Revisa | Branch | PR | Situação |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [TS-05](TS-05.md) · Supabase CLI 3.x no projeto | Technical | 1 | Laís | Alissa | `ts-05-supabase-cli-3` | | Não iniciada. PR até seg 09/11, 14h |
| [TS-04](TS-04.md) · Remover a tabela antiga de tampinhas | Technical | 2 | Laís | Mateus | `ts-04-remover-tampinhas-antigas` | | Não iniciada. PR até seg 09/11, 18h |
| [US-35](US-35.md) · Taxa da maquininha nas doações | User | 5 | Mateus | Bibiana | `us-35-taxa-nas-doacoes` | | Não iniciada. PR até ter 10/11, 18h |
| [US-24b](US-24b.md) · Backup diário cifrado | User | 3 | Bibiana | Laís | `us-24b-backup-diario` | | Não iniciada. PR até ter 10/11, 18h; restauração de teste na quarta |
| [SEC-04](SEC-04.md) · Trilha de auditoria | Segurança | 5 | Mateus | Alissa | `sec-04-trilha-de-auditoria` | | Não iniciada. PR até qua 11/11, 18h |
| [US-09](US-09.md) · Importação de pessoas por planilha | User | 8 | Mateus | Bibiana | `us-09-importacao-de-pessoas` | | Não iniciada. PR até qua 11/11, 18h |
| [US-24a](US-24a.md) · Gestão de usuários | User | 5 | Laís | Alissa | `us-24a-gestao-de-usuarios` | | Não iniciada. PR até qua 11/11, 18h |
| [US-21a](US-21a.md) · Agradecimento com um clique | User | 8 | Alissa | Laís | `us-21a-agradecimento` | | Não iniciada. PR até qui 12/11, 18h |
| [US-31](US-31.md) · Comissão por doação | User | 8 | Bibiana | Mateus | `us-31-comissao-por-doacao` | | Não iniciada. PR até qui 12/11, 18h |
| [US-04b](US-04b.md) · Correção e cancelamento de dinheiro (extra) | User | 5 | Mateus | Bibiana | `us-04b-corrigir-e-cancelar-dinheiro` | | Não iniciada. Começa qua 11/11 à noite; PR até qui 12/11, 18h |

## Respostas do Instituto

| Nº | Pergunta | Para quem | Enviada em | Resposta | Aplicada em |
| --- | --- | --- | --- | --- | --- |
| 1 | Aprovam o termo de mensagens de 15/10? | Flávia | 06/11 | | US-21a |
| 2 | "Uma vez só" vale por mês, ano ou compra? | Flávia | 06/11 | | US-21a |
| 3 | Quem agradece; o que a mensagem traz | Flávia | 06/11 | | US-21a |
| 4 | Quem corrige ou cancela dinheiro; motivo; prazo | Flávia e Nílian | 06/11 | | US-04b, SEC-04 |
| 5 | Planilhas do brechó, recorrentes e plataforma | Flávia e Nílian | 06/11 | | US-09 (importação no início do uso) |
| 6 | As pessoas das planilhas já autorizaram mensagens? | Flávia | 06/11 | | US-09 |
| 7 | Quem capta; percentual ou valor; comissão de venda | Nílian | 06/11 | | US-31 |
| 8 | Recibo e atendimentos: bruto ou líquido? | Nílian | 06/11 | | US-35 |
| 9 | E-mails e perfis de Tamara, Ana e Nílian | Flávia e Nílian | 06/11 | | US-24a, início do uso |
| 10 | Quem cadastra e desativa usuários | Flávia | 06/11 | | US-24a |
| 11 | Data do início do uso; aparelho e internet | Flávia | 06/11 | | início do uso, US-25 |
| 12 | Dados do Instituto no recibo | Flávia ou Nílian | 06/11 | | US-16 |
| 13 | Datas de treinamento e validação | Flávia | 06/11 | | US-25 |
| 14 | Onde guardar a cópia de segurança; quem guarda a chave | Flávia e Nílian | 06/11 | | US-24b |
| 15 | E-mail institucional dono das contas | Flávia | 06/11 | | entrega |
| 16 | E-mail próprio e domínio | Flávia | 06/11 | | US-21b, US-24a |
| 17 | Taxa da Doação Solutions | Nílian | a enviar (09/11) | | US-35 |
| 18 | Pix da PagBank: 0,19% ou sem taxa? | Nílian | a enviar (09/11) | | US-32, US-35 |

## Publicações no sistema publicado

Uma linha por merge e por migração. "Conferido" diz com qual conta de conferência e o que foi refeito. Quem integra preenche a sua.

| Data | Migração (`migration list --remote` antes e depois) | Merge | O quê | Quem | Conferido |
| --- | --- | --- | --- | --- | --- |

## Backup (US-24b)

| Data | O quê | Quem | Resultado |
| --- | --- | --- | --- |

## Conferência do meio da sprint (quarta 11/11)

A preencher pela Alissa até as 20h de quarta. Para a US-21a, a US-31 e a US-04b: implementação pronta? Testes escritos? O que falta? A que não estiver pronta sai da sprint nesta noite. Para as de quarta (SEC-04, US-09 e US-24a): PRs abertos e aprovados com texto até as 18h?

## Pontos de atenção

- **Nenhum código dos guias foi executado no planejamento.** Quem implementa é a primeira pessoa a rodar migração, lint, build e testes. Trecho que não compilar: corrigir e registrar aqui.
- **Depois da TS-05, o CLI é `npx --yes supabase@3.0.0`, e `db push` sem `--remote` vai para o banco local.** A versão 3 pergunta antes de mudar o banco hospedado; responder `y` só depois de conferir a lista. Antes da TS-05 integrar, continua a 2.119.0.
- **`npm run db:stop` antes de trazer a `main` com a TS-05:** os containers da versão 2 param com a versão 2.
- **Variável nova não começa com `SUPABASE_`** (o CLI 3 lê `SUPABASE_*` dos `.env`) **nem com `NEXT_PUBLIC_` se for segredo** (SEC-06). A da US-24a é `CHAVE_SECRETA_DO_SUPABASE`.
- **Tabela nova com `grant` explícito** para `authenticated`.
- **Ordem dos gatilhos em `donations_cash`:** `exigir_motivo_na_correcao` (US-04b), `liquido_da_doacao` (US-35), `trilha_de_auditoria` (SEC-04), em ordem alfabética.
- **Depois do merge da US-09, todos rodam `npm ci`** (dependência nova, `read-excel-file`).
- **Depois do merge da SEC-04, a exclusão de doação de item pede motivo**, na tela e na função do banco.
- **Depois do merge da US-04b, corrigir valor de doação em dinheiro pela API exige `motivo_da_alteracao`**: testes que corrigem valor (US-35) mudam.
- **O backup só roda depois do merge** (o GitHub só oferece "Run workflow" para rotinas da `main`). O cartão da US-24b vai para Concluído depois da restauração de teste.
- **Nada do Instituto no banco de produção pela equipe:** não aprovar o termo, não cadastrar a Ana, não importar planilha.
- **Sem chave, senha, token, e-mail real ou URL do banco** neste arquivo, no Trello ou no PR.

## Pendências que seguem

- **Antes do primeiro PR da sprint:** integrar o PR #63 e o PR do encerramento da Sprint 6, e só depois este planejamento. No índice `docs/sprints/README.md`, acrescentar a linha da Sprint 7 (texto no `Planejamento_Sprint7.md`, no Projeto).
- **Trello, à mão:** membros nos dez cartões; etiqueta "SPRINT 7" (as ferramentas do Claude não põem membro nem criam etiqueta).
- **Planilha do burndown:** lançar o acréscimo de 9 SP na Sprint 7 (Mateus).
- **Convites do Supabase** para a Alissa e a Laís (Mateus, fim de semana).
- **Bucket `backups` e os quatro segredos da US-24b** (Mateus, antes de terça).
- **`CHAVE_SECRETA_DO_SUPABASE` na Vercel**, só em Production (Mateus, antes do merge da US-24a).
- **Perguntas 17 e 18 à Nílian** (Mateus, segunda).
- **Da Sprint 6:** SEC-07 (diferença entre as 16 moderadas do registro e as 8 do `npm audit` de 04/11, não investigada); conferências da BUG-01, da BUG-02 e da US-19 e o esquema `backup_us11` no banco antigo, sem registro.

## Decisões

| Data | Decisão |
| --- | --- |
| 06/11 | Sprint 7 com 45 SP comprometidos em 9 itens e a US-04b como extra (5 SP), a pedido do Mateus, com mais stories para ele (18 SP + 5) |
| 06/11 | US-21 dividida: US-21a (agradecimento com um clique pelo WhatsApp ou e-mail da coordenação, 8 SP, nesta sprint) e US-21b (envio automático por e-mail, 5 SP, backlog). O envio fica travado no banco até o Instituto aprovar o termo |
| 06/11 | US-24 dividida: US-24a (gestão de usuários, 5 SP) e US-24b (backup diário, 3 SP) |
| 06/11 | US-35 estimada em 5 SP: o banco de dados calcula o líquido da doação com a taxa em vigor; banco "Doação Solutions" só para doações; recibo e atendimentos continuam em bruto até a resposta 8 |
| 06/11 | US-31 reestimada de 5 para 8 SP: comissão por doação, com quem captou, numa tabela só da coordenação; só doações até a resposta 7 |
| 06/11 | TS-05 nova (1 SP): Supabase CLI 3.0.0 fixado, `[local_smtp]` no `config.toml` |
| 06/11 | SEC-04 e US-09 saem da espera: a resposta do Instituto muda quem pode corrigir e quais planilhas, e não a implementação |
| 06/11 | US-04b com a regra provisória mais segura: só a coordenação corrige e cancela, com motivo. Venda: só cancelar (corrigir é cancelar e registrar de novo) |
| 06/11 | US-24a com senha provisória e troca no primeiro acesso, no lugar do convite por e-mail: sem e-mail próprio configurado, o Supabase só entrega e-mail para a equipe do projeto |
| 06/11 | O `PROGRESSO.md` passa a ser atualizado por quem integra cada item (ação da retrospectiva da Sprint 6) |

## Registro

| Data | O que aconteceu |
| --- | --- |
| 06/11 | Planejamento da Sprint 7: proposta de 32 SP validada, depois ampliada para 45 SP e a extra a pedido do Mateus. Mensagem com 16 perguntas ao grupo da Flávia e da Nílian. Registro completo no `Planejamento_Sprint7.md` do Projeto |
| 06/11 | Guias, README e este progresso escritos em `docs/sprints/sprint-7/` a partir da `main` de 06/11 (PR #67), sem execução de código. Matriz de permissões com as linhas da Sprint 7, marcadas "(Sprint 7, ...)" |

## Encerramento

A preencher em 13/11.
