# Sprint 7 · 07/11 a 13/11/2026

**Objetivo:** adiantar tudo o que dá para fazer sem esperar o Instituto, para a Sprint 8 ficar com homologação, treinamento e o que depender das respostas. Entra o agradecimento (item K, a única prioridade da cliente que faltava), a taxa nas doações e a comissão por doação (Nílian), a trilha de auditoria, a importação da planilha, a gestão da equipe e o backup, e duas technical stories de limpeza.

**Compromisso:** 45 Story Points em 9 itens, mais 1 story extra (US-04b, 5 SP), no planejamento de 06/11. Por tipo: 37 SP de user story, 5 SP de segurança (SEC-04) e 3 SP de technical story (TS-04 e TS-05). Com a extra, 50 SP.

Quadro: [Trello · Camaleão Admin](https://trello.com/b/2iMIPtF4), lista "Selecionado · Sprint 7 (07/11 a 13/11) · 45 SP + 5 extra", etiqueta "SPRINT 7" nos dez cartões. Cada cartão tem os checklists "Critérios de Aceitação" e "Tarefas da Sprint 7", com o nome de quem faz cada tarefa. O registro do planejamento está no Projeto do Claude, em `Planejamento_Sprint7.md`.

## De onde a sprint parte

- **Sprint 6 encerrada com 40 de 40 SP** (último merge: PR #67, US-32, 06/11 às 10h32), com o corte de quinta registrado como desvio. Sistema publicado no `camaleao-producao` desde 04/11, com 18 migrações.
- **Product Backlog com 59 SP**, mais a US-35 a estimar e a US-31 a reestimar. Depois dos ajustes deste planejamento, **68 SP** (abaixo).
- **A revisão de 06/11 com o Instituto não mudou nada.** Continuam sem resposta o termo de mensagens, as planilhas, quem corrige lançamento com dinheiro e as datas de treinamento. Em 06/11, o Mateus mandou ao grupo da Flávia e da Nílian uma mensagem com 16 perguntas (tabela "Perguntas ao Instituto").
- **Retrospectiva da Sprint 6:** as ações viraram as regras desta sprint (seção "Regras").

## Ajustes no Product Backlog

| Item | O que mudou | SP |
| --- | --- | --- |
| US-35 · Taxa nas doações | Estimada (resposta da Nílian em 03/11) | 5 |
| US-31 · Comissão | Reestimada: por doação, com quem captou (era por mês) | 5 para 8 |
| US-21 · Agradecimento | Dividida em US-21a (um clique, WhatsApp ou e-mail da coordenação, 8 SP) e US-21b (envio automático por e-mail, 5 SP, backlog) | 13 = 8 + 5 |
| US-24 · Voluntários e backup | Dividida em US-24a (gestão de usuários, 5 SP) e US-24b (backup, 3 SP) | 8 = 5 + 3 |
| TS-05 · Supabase CLI 3.x | Card novo (candidato da retrospectiva da Sprint 6) | 1 |
| SEC-04, US-09, US-04b | Destravadas: a dependência do Instituto muda o conteúdo, e não a implementação (cada guia explica) | 5, 8, 5 |

**Acréscimo ao PB:** 9 SP (US-35 5, US-31 +3, TS-05 1). PB de 59 para 68 SP.

## Stories

| Nº | Arquivo | Story | Tipo | SP | Implementa | Revisa | PR pronto | Merge |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | [TS-05.md](TS-05.md) | Supabase CLI 3.x no projeto | Technical | 1 | Laís | Alissa | seg 09/11, 14h | seg 09/11, logo depois da aprovação (sem migração) |
| 2 | [TS-04.md](TS-04.md) | Remover a tabela antiga de tampinhas | Technical | 2 | Laís | Mateus | seg 09/11, 18h | seg 09/11, à noite |
| 3 | [US-35.md](US-35.md) | Taxa da maquininha nas doações em dinheiro | User | 5 | Mateus | Bibiana | ter 10/11, 18h | ter 10/11, à noite |
| 4 | [US-24b.md](US-24b.md) | Backup diário cifrado do banco de produção | User | 3 | Bibiana | Laís | ter 10/11, 18h | ter 10/11, à noite (sem migração); restauração de teste na quarta |
| 5 | [SEC-04.md](SEC-04.md) | Trilha de auditoria de alterações e cancelamentos | Segurança | 5 | Mateus | Alissa | qua 11/11, 18h | qua 11/11, à noite, o primeiro |
| 6 | [US-09.md](US-09.md) | Importação de pessoas a partir de planilha | User | 8 | Mateus | Bibiana | qua 11/11, 18h | qua 11/11, à noite |
| 7 | [US-24a.md](US-24a.md) | Gestão de usuários pela coordenação | User | 5 | Laís | Alissa | qua 11/11, 18h | qua 11/11, à noite, o último |
| 8 | [US-21a.md](US-21a.md) | Agradecimento com um clique, uma vez por período | User | 8 | Alissa | Laís | qui 12/11, 18h | qui 12/11, à noite, o primeiro |
| 9 | [US-31.md](US-31.md) | Comissão por doação, com quem captou | User | 8 | Bibiana | Mateus | qui 12/11, 18h | qui 12/11, à noite |
| extra | [US-04b.md](US-04b.md) | Correção e cancelamento de venda e de doação em dinheiro | User | 5 | Mateus | Bibiana | qui 12/11, 18h | qui 12/11, à noite, o último |

**Por dia:** segunda 3 SP, terça 8, quarta 18, quinta 16 (mais a extra). A quinta tem 16 SP comprometidos, contra 24 na Sprint 6.

Por que essa seleção:

- **Tudo que não precisa de resposta do Instituto para ser implementado.** O que a resposta muda vira um valor provisório no guia, como na Sprint 6: período do agradecimento (mês), quem corrige dinheiro (só a coordenação), comissão só de doação, recibo e atendimentos em bruto.
- **A US-21a entrega o item K** (agradecimento), com uma trava no banco: ninguém recebe mensagem enquanto o Instituto não aprovar o termo.
- **A SEC-04 e a US-09 saíram da espera** porque a resposta do Instituto decide o conteúdo (quem pode corrigir; quais planilhas), e não o código. A US-04b entra como extra, com a regra mais segura (só a coordenação).
- **Fica para a Sprint 8:** US-21b (e-mail próprio do Instituto), US-25 (datas de treinamento) e, se a extra não entrar, a US-04b.

Por que essa divisão:

- **Mateus** pediu mais stories (18 SP comprometidos, 40%, mais a extra): a taxa nas doações (fez a US-32, de onde ela parte), a trilha e a correção de dinheiro (que usam a trilha) e a importação. Continua com o contato com o Instituto, os convites e os segredos; o `PROGRESSO.md` passa a ser de quem integra cada item.
- **Bibiana** fica com o backup (pequeno, vence na terça, para a fila começar cedo) e a comissão (financeiro, onde ela fez a US-29 e a US-04a). Revisa a US-35, que é a base da US-31.
- **Laís** fica com as duas technical stories da segunda (esteira e banco, que ela conhece da TS-01, SEC-06 e SEC-07) e a gestão de usuários, no padrão de perfis da US-28 que ela fez. Confere os cortes (ação da retrospectiva).
- **Alissa** fica com o agradecimento (8 SP): fez o relatório consolidado (US-17) e a triagem (US-27), e conhece as somas por pessoa. Faz a conferência do meio da sprint (rodízio).

Carga: Mateus 18 SP (+5 extra), Bibiana 11, Laís 8, Alissa 8. Revisões: Alissa 3 (TS-05, SEC-04, US-24a), Bibiana 3 (US-35, US-09, US-04b), Laís 2 (US-24b, US-21a), Mateus 2 (TS-04, US-31).

## Quem faz o quê

O mesmo passo a passo está no cartão de cada item, no checklist "Tarefas da Sprint 7". O código de cada passo está no guia.

**Laís** (TS-05, TS-04, US-24a; revisa US-24b e US-21a; confere os cortes)

1. Sábado 07/11 e domingo 08/11: ler os três guias; branches com push; aceitar o convite do Supabase.
2. Segunda 09/11: TS-05 (PR até 14h, merge logo depois da aprovação da Alissa); TS-04 a partir da `main` com a TS-05 (PR até 18h). À noite, primeiro `db push` dela, com o Mateus acompanhando, e merge da TS-04.
3. Terça 10/11: revisar a US-24b da Bibiana. US-24a Partes A a D.
4. Quarta 11/11: US-24a Partes E a H; PR até 18h. À noite, `db push` e merge, depois da SEC-04 e da US-09.
5. Quinta 12/11: revisar a US-21a. Às 18h, conferir no grupo os cortes (quem não estiver aprovado sai).

**Bibiana** (US-24b, US-31; revisa US-35, US-09 e US-04b)

1. Sábado 07/11 e domingo 08/11: ler os guias da US-24b e da US-31; branches com push.
2. Segunda 09/11: US-24b inteira (workflow, script e documento).
3. Terça 10/11: PR da US-24b até 18h. Revisar a US-35 do Mateus (ela é a base da US-31). À noite, merge da US-24b e primeira cópia com o Mateus.
4. Quarta 11/11: restauração de teste com o Mateus (preenche a tabela do documento). Revisar a US-09. US-31 Partes B a E, com a `main` da noite.
5. Quinta 12/11: US-31 Partes A, F e G (a migração depende da SEC-04, integrada na quarta); PR até 18h. Revisar a US-04b. O Mateus faz o `db push` da US-31 à noite.

**Alissa** (US-21a; revisa TS-05, SEC-04 e US-24a; conferência do meio)

1. Sábado 07/11 e domingo 08/11: ler o guia da US-21a inteiro; branch com push; aceitar o convite do Supabase.
2. Segunda 09/11: revisar a TS-05 da Laís (de manhã). US-21a Partes A a D.
3. Terça 10/11: US-21a Partes E e F.
4. Quarta 11/11: revisar a SEC-04 e a US-24a. **Conferência do meio da sprint**, registrada no `PROGRESSO.md` até as 20h: para a US-21a, a US-31 e a US-04b, a implementação está pronta? O que falta?
5. Quinta 12/11: US-21a Parte G (testes); PR até 18h. À noite, primeiro `db push` dela e merge, o primeiro da noite.

**Mateus** (US-35, SEC-04, US-09 e a extra US-04b; revisa TS-04 e US-31; contato com o Instituto)

1. Sábado 07/11 e domingo 08/11: branches das quatro com push. Convidar a Alissa e a Laís para a organização do Supabase (sem senha por chat). Criar o bucket `backups`, a senha da cópia e os quatro segredos da US-24b. Integrar os PRs de documentação (encerramento da Sprint 6 e este planejamento).
2. Segunda 09/11: cobrar as respostas do Instituto (bloco 1 até hoje) e passar cada uma a quem precisa no mesmo dia. Revisar a TS-04 e acompanhar o primeiro `db push` da Laís. US-35.
3. Terça 10/11: PR da US-35 até 18h; à noite, `db push` e merge. Primeira cópia da US-24b, depois do merge dela.
4. Quarta 11/11: SEC-04 e US-09, PRs até 18h. Variável `CHAVE_SECRETA_DO_SUPABASE` na Vercel (US-24a). Restauração de teste com a Bibiana. À noite, SEC-04 primeiro, depois US-09. Começar a US-04b a partir da `main` com a SEC-04.
5. Quinta 12/11: US-04b, PR até 18h. Revisar a US-31. À noite, `db push` da US-31 e, se aprovada, da US-04b.
6. Sexta 13/11: Trello, planilha do burndown e encerramento.

## Calendário

| Dia | O que acontece |
| --- | --- |
| Sáb 07/11 e dom 08/11 | Equipe confere estimativas, tarefas e guias (TS-04 em 2 ou 3?); branches de todas as stories com push; convites do Supabase; bucket e segredos do backup; merge dos PRs de documentação |
| Seg 09/11 | TS-05 até 14h e merge; TS-04 até 18h, merge à noite (3 SP). Mateus cobra as respostas do bloco 1 |
| Ter 10/11 | PRs da US-35 e da US-24b até 18h; merges à noite (8 SP); primeira cópia do backup |
| Qua 11/11 | PRs da SEC-04, US-09 e US-24a até 18h (18 SP). Restauração de teste do backup. **Conferência do meio** (Alissa, até 20h). Merges à noite: SEC-04, US-09, US-24a |
| Qui 12/11 | PRs da US-21a, US-31 e US-04b até 18h (16 SP + 5 extra). Merges à noite: US-21a, US-31, US-04b |
| Sex 13/11 | Só conferência no publicado, Trello, `PROGRESSO.md`, relatório, retrospectiva e vídeos. **Nenhum merge de story** |

**Risco do calendário:** a quarta concentra 18 SP, três deles do Mateus. A regra da conferência do meio vale para a quinta, e a quarta tem o corte das 18h com nome (abaixo).

## Publicação e migrações

1. **O Instituto ainda não usa o sistema** (resposta de 03/11). Merge pode ser logo depois da aprovação; o horário da noite fica como referência. A ordem, o `db push` antes do merge e a conferência valem sempre.
2. **Ordem numa story com migração:** PR aprovado com texto, `migration list --remote`, `db push --remote` (responder `y`), `migration list --remote` de novo, merge, conferência na tela. Desde a TS-05, o CLI é o `npx --yes supabase@3.0.0`, e sem `--remote` o comando vai para o banco local.
3. **Quem faz o `db push`:** quem integra, se tiver acesso ao `camaleao-producao` (Mateus, e a Alissa e a Laís depois do convite). A Bibiana pede ao Mateus.
4. **As migrações da sprint, em ordem de nome e de merge:**

   | Arquivo | Story | Merge previsto |
   | --- | --- | --- |
   | `20261109090000_remover_tabela_de_tampinhas.sql` | TS-04 | seg 09/11 |
   | `20261109100000_taxa_nas_doacoes.sql` | US-35 | ter 10/11 |
   | `20261110090000_trilha_de_auditoria.sql` | SEC-04 | qua 11/11 |
   | `20261110100000_importacao_de_pessoas.sql` | US-09 | qua 11/11 |
   | `20261110110000_gestao_de_usuarios.sql` | US-24a | qua 11/11 |
   | `20261111090000_agradecimentos.sql` | US-21a | qui 12/11 |
   | `20261111100000_comissao_por_doacao.sql` | US-31 | qui 12/11 |
   | `20261111110000_corrigir_e_cancelar_dinheiro.sql` | US-04b | qui 12/11 |

   Duas dependências entre migrações: a da US-31 usa a função da trilha (SEC-04), e a da US-04b usa as colunas da US-35 e da SEC-04. Se a ordem dos merges mudar, quem aplica confere no `migration list --remote` e usa `--include-all` só se a pendente não depender de outra que ainda não entrou.
5. **Tabela nova sempre com `grant` explícito** para `authenticated` (todos os guias já têm). O Supabase deixou de expor tabela nova sem `grant` (aviso no `config.toml`).
6. **Quem integra confere** no sistema publicado, com a conta de conferência do perfil certo, e registra na tabela de publicações do `PROGRESSO.md`. Sem conferência registrada, o cartão não vai para Concluído.
7. **A equipe não lança dados reais.** Conferência no publicado com nome "CONFERÊNCIA", apagado ou cancelado em seguida. Nada de aprovar o termo, cadastrar a Ana ou importar planilha no banco de produção: isso é do Instituto, no início do uso.

## Regras

Vêm das ações da retrospectiva da Sprint 6 (proposta no relatório, seção 7).

- **Corte com nome.** No horário do PR, quem implementa diz no grupo da equipe se o PR está aprovado. O que não estiver sai e volta ao topo do backlog. Exceção só registrada no `PROGRESSO.md` **antes** do merge. A Laís confere os cortes.
- **Sexta sem merge de story.** O que não entrou até quinta à noite volta ao topo do backlog.
- **Aprovação com texto** obrigatória em PR com migração ou de 5 SP ou mais: a revisora escreve o que rodou e o que testou.
- **PR com migração só integra** depois do `migration list --remote` mostrar a migração aplicada.
- **Conferência no publicado antes de mover o cartão**, registrada por quem integra.
- **Ninguém começa story de 5 SP no último dia.** A US-04b começa na quarta à noite; se na conferência do meio não tiver começado, sai da sprint.
- **Pergunta sem resposta não trava story:** cada guia diz o valor provisório; a resposta que chegar depois vira ajuste pequeno, registrado no `PROGRESSO.md`.

## Perguntas ao Instituto

Mensagem do Mateus ao grupo com a Flávia e a Nílian, em 06/11. O bloco 1 foi pedido até segunda 09/11.

| Nº | Pergunta | Para quem | Story | Enquanto não responde |
| --- | --- | --- | --- | --- |
| 1 | Aprovam o termo de mensagens de 15/10? | Flávia | US-21a | ninguém recebe agradecimento (a trava é do banco) |
| 2 | "Uma vez só" vale por mês, ano ou compra? | Flávia | US-21a | por mês (`PERIODO_DO_AGRADECIMENTO`) |
| 3 | Quem agradece; o que a mensagem traz | Flávia | US-21a | só a coordenação; texto de `textoDeAgradecimento` |
| 4 | Quem corrige ou cancela dinheiro; motivo; prazo | Flávia e Nílian | US-04b, SEC-04 | só a coordenação, com motivo, qualquer data |
| 5 | As planilhas (brechó, recorrentes, plataforma), por e-mail | Flávia e Nílian | US-09 | testes com planilha fictícia; importação real no início do uso |
| 6 | As pessoas das planilhas já autorizaram mensagens? | Flávia | US-09 | entram como "ainda não perguntada" |
| 7 | Quem capta; percentual ou valor; comissão de venda | Nílian | US-31 | valor à mão, só nas doações (respondida em 09/11: guia redesenhado com percentual, ver `PROGRESSO.md`) |
| 8 | Recibo e atendimentos: bruto ou líquido? | Nílian | US-35 | bruto |
| 9 | E-mails e perfis de Tamara, Ana e Nílian | Flávia e Nílian | US-24a, início do uso | nada a fazer até o início do uso |
| 10 | Quem cadastra e desativa usuários | Flávia | US-24a | só a coordenação |
| 11 | Data do início do uso; aparelho e internet do balcão | Flávia | início do uso, US-25 | sem data |
| 12 | Dados do Instituto no recibo | Flávia ou Nílian | US-16 | só o nome (`lib/instituto.ts`) |
| 13 | Datas de treinamento e validação até 29/11 | Flávia | US-25 | sem data |
| 14 | Onde guardar a cópia de segurança; quem guarda a chave | Flávia e Nílian | US-24b | bucket privado no Supabase; chave com o Mateus |
| 15 | E-mail institucional para ser dono das contas | Flávia | entrega (Sprint 8) | contas com a equipe |
| 16 | E-mail próprio e domínio | Flávia | US-21b, US-24a (convite) | senha provisória; sem envio automático |
| 17 | Taxa da Doação Solutions (plataforma do site) | Nílian | US-35 | sem taxa cadastrada ("taxa não cadastrada") |
| 18 | O Pix da PagBank tem 0,19% ou é sem taxa? (em aberto desde 03/11) | Nílian | US-32, US-35 | 0,19% |

As perguntas 17 e 18 não estavam na mensagem de 06/11: o Mateus manda à Nílian na segunda.

## Onde as stories se encostam

| Arquivo | Stories | Como não brigar |
| --- | --- | --- |
| `lib/store.ts` | todas | Cada story escreve uma seção nova no fim do arquivo, com o nome dela; no conflito, fique com todas. A US-35 e a US-31 mexem em `getRelatorioConsolidado` e `getDadosDaExportacao`: a US-31 parte da `main` com a US-35 |
| `types/index.ts` | todas; a TS-04 apaga `DonationCaps` | Um tipo por linha no import de `lib/store.ts`; tipos novos no fim do arquivo |
| `donations_cash` e `donations_cash_view` | US-35 (recria a view), US-31 e US-04b | Ordem das migrações acima; ninguém mais recria a view nesta sprint |
| `components/donations/donations-list.tsx` | US-35 (líquido), US-09 (CSV), US-04b (ações) | Merge na ordem ter, qua, qui; cada uma traz a `main` antes do PR |
| `components/shop/financials-table.tsx` | US-09 (CSV), US-04b (cancelar) | Linhas diferentes |
| `components/donations/donations-items-list.tsx` | SEC-04 (motivo), US-09 (CSV) | SEC-04 integra primeiro na quarta |
| `components/reports/relatorio-consolidado.tsx` e `app/(admin)/relatorios/exportar/route.ts` | US-35, US-31 | A US-31 parte da US-35 |
| `app/(admin)/relatorios/page.tsx` | SEC-04 e US-31 (um link cada) | Linhas separadas; no conflito, fique com as duas |
| `lib/rotas.ts` e `components/layout/sidebar.tsx` | US-09, US-24a, US-21a, US-04b | Uma linha por story, no fim da lista, com o comentário do ID |
| `scripts/env-local.mjs` | TS-05, US-24a | TS-05 na segunda; a Laís faz as duas |
| `package.json`, `package-lock.json` | TS-05 (scripts), US-09 (`read-excel-file`) | Depois do merge da US-09, todas rodam `npm ci` |
| `actions/itens.ts`, `new-donation-item-form.tsx` | SEC-04 | Só ela |
| `actions/auth.ts`, `proxy.ts` | US-24a | Só ela |
| `docs/seguranca/matriz-de-permissoes.md` | todas com tela ou tabela | As linhas já estão no PR do planejamento, marcadas "(Sprint 7, US-xx)"; quem integra tira a marca da sua |
| Testes que já existem | TS-04 (`categorias`), SEC-04 (`editar-e-excluir-item`), US-31 (`exportacao-em-planilha`), US-04b (`taxa-nas-doacoes`, da US-35) | Cada guia lista os que mudam |

**Gatilhos `before` em `donations_cash`, em ordem alfabética, que é a ordem em que rodam:** `exigir_motivo_na_correcao` (US-04b), `liquido_da_doacao` (US-35), `trilha_de_auditoria` (SEC-04). Nome novo de gatilho nessa tabela precisa respeitar essa ordem.

## Fora desta sprint

- **US-21b** (envio automático por e-mail): espera o e-mail próprio do Instituto (pergunta 16).
- **US-25** (manual, treinamento e homologação): Sprint 8; o manual começa quando as telas desta sprint estiverem na `main`.
- **Início do uso pelo Instituto** (cartão sem SP): contas reais pela tela Equipe (US-24a), categorias finais, importação das planilhas (US-09), aprovação do termo e cadastro de quem capta, feitos pela coordenação, com a equipe junto.

## Fluxo de cada story

```bash
git checkout main && git pull
git checkout -b us-35-taxa-nas-doacoes    # branch com o ID da story
git push -u origin us-35-taxa-nas-doacoes
# ... implementa seguindo o guia ...
git add -A
git commit -m "US-35: taxa da maquininha nas doações em dinheiro"
git push
```

No GitHub, abra o Pull Request **com base na `main`**, com o título no formato `US-35 · Taxa da maquininha nas doações em dinheiro` e os critérios de aceitação no corpo. Quando estiver pronto, tire do rascunho, mova o cartão para **Em revisão** e avise quem revisa.

## O que foi e o que não foi conferido nestes guias

Os guias foram escritos em 06/11 a partir da `main` daquele dia (último merge: PR #67, US-32), lendo o código, as migrações, os seeds, os testes e os cartões do Trello.

- **Não conferido:** nenhum comando foi executado, por regra do projeto. Migração, código e testes dos guias não passaram por banco, `tsc`, lint, build nem Playwright. Quem implementa é a primeira pessoa a rodar.
- **Conferido em documentação de terceiros:** a mudança do Supabase CLI 3.0.0 (`[local_smtp]`, `--remote`, confirmação), a API da `read-excel-file` 9.3.14 (`readSheet`) e as opções do `db dump`.
- **Nomes conferidos no código de 06/11:** `eh_coordenacao`, `eh_equipe`, `eh_caixa_ou_coordenacao`, `balcao_le_desde`, as políticas da US-28 e da US-04a, `register_sale` (10 parâmetros), `taxas_em_vigor`, `message_recipients`, `nome_para_comparar`, `telefone_da_pessoa`, a `donations_cash_view` da US-13, a `clients_view` da SEC-05, `buscar_pessoas`, `mesclar_fichas`, `desfazer_mesclagem`, `excluir_doacao_de_item`, as contas do seed e as funções de `lib/taxas.ts`, `lib/mensagens.ts`, `lib/planilha.ts` e `lib/triagem.ts`.

## Definição de Pronto

- [ ] Todos os critérios de aceitação marcados no cartão
- [ ] Código revisado e aprovado por outra integrante no GitHub, com o que rodou e o que testou escrito no PR
- [ ] Esteira verde (lint, build, testes de fumaça e de acesso, varredura de segredos e auditoria de dependências)
- [ ] Migração aplicada em produção antes do merge, com o `migration list --remote` registrado
- [ ] Pull Request integrado à `main`
- [ ] Deploy conferido no sistema publicado, com a conta do perfil certo, e registrado no `PROGRESSO.md` por quem integrou
- [ ] Linha da matriz de permissões sem a marca "(Sprint 7, ...)", quando a story tiver linha

## Fim da sprint (13/11)

- [ ] Cada cartão em Concluído ou devolvido ao topo do Backlog do Produto
- [ ] Relatório: situação de cada item, velocity separada por tipo, desvios e retrospectiva com responsáveis e prazos
- [ ] Burndown: acréscimo de 9 SP lançado na Sprint 7 e a velocity
- [ ] Respostas do Instituto registradas no `PROGRESSO.md` e aplicadas
- [ ] Vídeos individuais gravados
- [ ] Trello, `PROGRESSO.md` e relatório mostrando a mesma situação
