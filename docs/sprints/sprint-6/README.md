# Sprint 6 · 31/10 a 06/11/2026

**Objetivo:** entregar o que o Instituto pediu na avaliação de 26/10 a 29/10 e que não depende de resposta deles para ser feito: o pedido principal da Tamara (editar e excluir item, contagem da triagem e um perfil só dela), o financeiro da Nílian (forma de pagamento, somas por dia e por semana, taxas reais das maquininhas e custo do evento) e a virada do sistema publicado para o banco de produção, onde começa o uso real.

**Compromisso:** 40 Story Points em 12 itens, no replanejamento de 30/10 (25 SP às 14h, 40 SP no ajuste das 15h). Por tipo: 34 SP de user story, 5 SP de technical story e segurança (TS-03 e SEC-07) e 1 SP de correção (BUG-03).

Quadro: [Trello · Camaleão Admin](https://trello.com/b/2iMIPtF4), lista "Selecionado · Sprint 6 (31/10 a 06/11) · 40 SP", etiqueta "SPRINT 6" nos doze cartões. Cada cartão tem os checklists "Critérios de Aceitação" e "Tarefas da Sprint 6", com o nome de quem faz cada tarefa. O registro do replanejamento está no Projeto do Claude, em `Planejamento_Sprint6.md`.

## De onde a sprint parte

- **Sprint 5 encerrada com 14 de 14 SP** (último merge: PR #49, TS-02, 30/10 às 10h42). O banco `camaleao-producao` está montado só pelas migrações e ensaiado num preview; o sistema publicado ainda usa o banco antigo.
- **A avaliação do Instituto gerou 13 retornos** (Tamara 8, Nílian 5, Ana nenhum). Todos viraram story ou tarefa; a tabela "Onde cada retorno foi parar" está no `Planejamento_Sprint6.md`.
- **O Product Backlog foi de 58 para 99 SP** com o acréscimo de 41 SP do replanejamento (33 de user story, 7 de technical story e segurança, 1 de correção). Com 40 SP nesta sprint, sobram 59 SP para as Sprints 7 e 8.
- **Segunda 02/11 é feriado (Finados).** Na prática, a sprint vai de terça 03/11 a sexta 06/11.
- **A revisão com o Instituto de 30/10 foi adiada.** O Mateus remarca na terça, junto com a data da virada.

## Stories

| Nº | Arquivo | Story | Tipo | SP | Implementa | Revisa | PR pronto | Merge |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | [BUG-03.md](BUG-03.md) | Botões fora da tela na janela de nova pessoa | Correção | 1 | Laís | Mateus | ter 03/11, 18h | ter 03/11, à noite |
| 2 | [US-29.md](US-29.md) | Forma de pagamento na conferência do recebimento | User | 1 | Bibiana | Alissa | ter 03/11, 18h | ter 03/11, à noite |
| 3 | [TS-03.md](TS-03.md) | Virada do sistema publicado para o banco de produção | Technical | 2 | Mateus | Laís | qua 04/11 | virada qua 04/11, à noite; PR de documentação depois |
| 4 | [US-04a.md](US-04a.md) | Editar e excluir doação de item | User | 5 | Bibiana | Alissa | qua 04/11, 18h | qua 04/11, à noite (antes da US-27) |
| 5 | [US-33.md](US-33.md) | Custo do evento | User | 3 | Mateus | Laís | qua 04/11, 18h | qua 04/11, à noite |
| 6 | [US-34.md](US-34.md) | Confirmação de doação em dinheiro de valor muito alto | User | 1 | Alissa | Bibiana | qua 04/11, 18h | qua 04/11, à noite |
| 7 | [SEC-07.md](SEC-07.md) | Vulnerabilidades altas nas dependências de desenvolvimento | Segurança | 3 | Laís | Alissa | qua 04/11, 18h | qua 04/11, à noite (primeiro da noite) |
| 8 | [US-28.md](US-28.md) | Perfil de voluntária sem dinheiro e sem caixa | User | 5 | Laís | Mateus | qui 05/11, 18h | qui 05/11, à noite |
| 9 | [US-27.md](US-27.md) | Contagem da triagem do item doado | User | 8 | Alissa | Bibiana | qui 05/11, 18h | qui 05/11, à noite |
| 10 | [US-30.md](US-30.md) | Somas de vendas por dia e por semana | User | 3 | Bibiana | Laís | qui 05/11, 18h | qui 05/11, à noite |
| 11 | [US-16.md](US-16.md) | Recibo de doação | User | 3 | Mateus | Laís | qui 05/11, 18h | qui 05/11, à noite |
| 12 | [US-32.md](US-32.md) | Taxas de cartão cadastradas pela coordenação | User | 5 | Bibiana | Mateus | qui 05/11, 18h | qui 05/11, à noite (último da noite) |

**IDs novos:** a US-04 foi dividida em US-04a (doação de item, nesta sprint) e US-04b (venda e doação em dinheiro, no backlog com a SEC-04). As US-28 a US-35, a TS-03, a TS-04, a SEC-07 e a BUG-03 são cartões criados em 30/10. A US-16 é a única que já estava no Product Backlog desde o começo.

Por que essa seleção:

- **Tudo que o Instituto pediu e que a equipe consegue fazer sem esperar resposta.** O que depende de decisão deles ficou fora: US-04b e SEC-04 (quem corrige lançamento com dinheiro), US-31 (a quem a comissão é paga), US-21 (termo de mensagens), US-09 (planilhas reais) e US-25 (datas de treinamento).
- **O pedido principal da Tamara entra inteiro:** editar e excluir (US-04a), a contagem da triagem (US-27) e o perfil dela sem dinheiro e sem caixa (US-28). Ela vai usar só Doações · Itens no começo.
- **O financeiro da Nílian entra quase inteiro:** forma de pagamento (US-29), somas por dia e por semana (US-30), taxas reais (US-32) e custo do evento (US-33). Só a comissão (US-31) espera.
- **A virada (TS-03) entra cedo** porque é a partir dela que o Instituto lança dados reais, e porque decide em quantos bancos cada migração da sprint precisa entrar.
- **Os 15 SP do ajuste** (US-30, US-32, US-16, SEC-07 e US-34) são as stories restantes sem bloqueio. A US-16 já estava no Product Backlog e fecha o critério do recibo que a US-19 deixou para ela.

Por que essa divisão:

- **Bibiana** fica com a maior parte (14 SP, 35%) e com quase todo o financeiro (US-29, US-30 e US-32), que mexe nas mesmas telas e em `actions/sales.ts`, e com a US-04a, que é pedido direto da Tamara. Teve 1 SP na Sprint 5.
- **Alissa** fica com a US-27 (8 SP), a maior da sprint: fez o relatório consolidado (US-17) e conhece as telas por onde a doação de item aparece. Revisa a US-04a da Bibiana, que mexe no mesmo formulário.
- **Laís** fica com a US-28 (políticas do banco, no padrão da US-23 que ela revisou), com a SEC-07 (esteira, que ela conhece desde a TS-01 e a SEC-06) e com a BUG-03. Faz também a conferência do meio da sprint, ação da retrospectiva da Sprint 5.
- **Mateus** fica com a TS-03 (Supabase e Vercel, desde a TS-02), a US-33 e a US-16, e com o contato com o Instituto: data da virada, contas reais e as perguntas à Nílian e à Tamara.

Carga: Bibiana 14 SP, Alissa 9 SP, Laís 9 SP, Mateus 8 SP mais o contato com o Instituto. Revisões: Laís 4 (TS-03, US-33, US-30, US-16), Alissa 3 (US-04a, US-29, SEC-07), Mateus 3 (BUG-03, US-28, US-32), Bibiana 2 (US-27, US-34).

## Quem faz o quê

O mesmo passo a passo está no cartão de cada item no Trello, no checklist "Tarefas da Sprint 6". O código de cada passo está no guia do item.

**Bibiana** (US-29, US-04a, US-30, US-32; revisa US-27 e US-34)

1. Sábado 31/10 e domingo 01/11: ler os guias da US-29 e da US-04a; branch da US-29 com push.
2. Terça 03/11: US-29 (coluna Pagamento no financeiro e teste); PR até as 18h. À noite, merge e conferência com a conta da coordenação. Branch da US-04a com push e a migração (Parte A) rodando no banco local.
3. Quarta 04/11: US-04a (Partes B a G); PR até as 18h. Revisar a US-34 da Alissa. À noite, migração da US-04a no banco de produção e merge, antes das outras da noite. Avisar a Alissa de que a US-04a está na `main`.
4. Quinta 05/11: branches da US-30 e da US-32 a partir da `main` (com a US-29 e a US-04a). US-30 primeiro, PR até as 18h; depois US-32, PR até as 18h. Revisar a US-27 da Alissa. À noite, merges: US-30 e, por último, US-32 com a migração.
5. Sexta 06/11: conferências que faltarem e `PROGRESSO.md`.

**Alissa** (US-34, US-27; revisa US-04a, US-29 e SEC-07)

1. Sábado 31/10 e domingo 01/11: ler o guia da US-27 inteiro (é a maior da sprint) e o da US-04a, que ela revisa; branches da US-34 e da US-27 com push.
2. Terça 03/11: revisar a US-29 da Bibiana. US-34 (confirmação e teste). US-27 Parte A (migração) no banco local, com a branch da US-04a trazida para a da US-27 (a migração usa a coluna `deleted_at` da US-04a).
3. Quarta 04/11: PR da US-34 até as 18h. Revisar a SEC-07 da Laís e a US-04a da Bibiana. US-27 Partes B a E (funções do banco, `lib/store.ts`, triagem pendente). À noite, merge da US-34.
4. Quinta 05/11, de manhã: trazer a `main` com a US-04a e adaptar a edição aos campos novos (Parte F). Partes G e H (relatório, exportação e testes); PR até as 18h. À noite, migração e merge da US-27.

**Laís** (BUG-03, SEC-07, US-28; revisa TS-03, US-33, US-30 e US-16; conferência do meio)

1. Sábado 31/10 e domingo 01/11: branch da BUG-03 com push e o teste em tela baixa (primeiro commit, esteira vermelha).
2. Terça 03/11: correção da BUG-03; PR até as 18h. `npm audit` completo e a lista das 7 vulnerabilidades (SEC-07, passo 2). À noite, merge da BUG-03 e conferência com a conta de voluntária.
3. Quarta 04/11: SEC-07 (um commit por pacote) e PR até as 18h. Conferir o roteiro da virada com o Mateus (TS-03). Revisar a US-33 do Mateus. **Conferência do meio da sprint**, registrada no `PROGRESSO.md` até as 20h. À noite, merge da SEC-07 primeiro, aviso no grupo da equipe para trazer a `main`, e conferência da virada com as três contas de conferência.
4. Quinta 05/11: US-28 (matriz revisada com o ok do Mateus antes do SQL, migração, proxy, menu, testes); PR até as 18h. Revisar a US-30 e a US-16. À noite, migração e merge da US-28.

**Mateus** (TS-03, US-33, US-16; revisa BUG-03, US-28 e US-32; contato com o Instituto)

1. Sábado 31/10 e domingo 01/11: branches da US-33 e da US-16 com push.
2. Terça 03/11: remarcar a revisão com o Instituto e combinar a data da virada; cobrar as respostas da Nílian (perguntas de 30/10) e perguntar à Tamara (peso das tampinhas, cabelos e perucas) e à coordenação (limite do valor alto, dados do Instituto no recibo, perfil de cada pessoa). Passar cada resposta a quem precisa no mesmo dia. Revisar a BUG-03.
3. Quarta 04/11: US-33; PR até as 18h. Contas reais no banco novo. À noite: virada (TS-03), com a Laís conferindo, e depois as migrações e merges da noite.
4. Quinta 05/11: US-16; PR até as 18h. Revisar a US-28 e a US-32. À noite, merge da US-16; PR de documentação da TS-03 para a Laís revisar.
5. Sexta 06/11: alertas do Dependabot ligados (SEC-07), Trello, planilha do burndown e encerramento.

## Calendário

| Dia | O que acontece |
| --- | --- |
| Sáb 31/10 e dom 01/11 | Equipe confere estimativas, tarefas e guias; branches criadas com push. Nenhum merge |
| Seg 02/11 | Feriado (Finados). Nenhum merge |
| Ter 03/11 | Mateus remarca a revisão, combina a data da virada e cobra as respostas (tabela "Perguntas ao Instituto"). PRs da BUG-03 e da US-29 até as 18h; merges à noite |
| Qua 04/11 | PRs da SEC-07, US-04a, US-33 e US-34 até as 18h (12 SP). **Conferência do meio da sprint** (Laís, até as 20h). À noite: virada (TS-03), depois os merges, nesta ordem: SEC-07, US-04a, US-33, US-34 |
| Qui 05/11 | De manhã, a Alissa traz a `main` com a US-04a. PRs da US-28, US-27, US-30, US-16 e US-32 até as 18h (24 SP). À noite, merges nesta ordem: US-27, US-28, US-30, US-16, US-32 |
| Sex 06/11 | Só conferência no sistema publicado, Trello, `PROGRESSO.md`, relatório, retrospectiva e vídeos. **Nenhum merge de story** |

**Risco do calendário:** a quinta concentra 24 dos 40 SP, o mesmo desenho que fez a Sprint 5 integrar tudo em 36 horas. Para não repetir, a conferência de quarta olha cada PR de quinta: o que não estiver com a implementação pronta na quarta à noite já sai da sprint ali, e não na quinta às 18h.

## Publicação e migrações

1. **Merge à noite, com aviso.** Depois da virada o Instituto lança dados reais, então nada é publicado no horário do brechó. Proposta: merges a partir das 21h, com aviso no grupo do Instituto uma hora antes; o Mateus confirma o horário com a coordenação na terça.
2. **Ordem numa story com migração:** PR aprovado, migração em produção, merge, conferência na tela. A migração só acrescenta ou troca políticas, então o sistema publicado antes do merge continua funcionando com ela.
3. **Antes da virada** (terça e, se a virada atrasar, quarta e quinta), a migração entra **nos dois bancos**: no atual pelo SQL Editor e no `camaleao-producao` por `db push`, como na US-19. As duas aplicações vão para o `PROGRESSO.md`.
4. **Depois da virada,** só `db push` no `camaleao-producao`. Antes de todo `db push`: `cat supabase/.temp/project-ref` e `npx --yes supabase@2.119.0 migration list`.
5. **As migrações da sprint, em ordem de nome:**

   | Arquivo | Story | Merge previsto |
   | --- | --- | --- |
   | `20261102090000_editar_e_excluir_item.sql` | US-04a | qua 04/11 |
   | `20261102100000_custo_do_evento.sql` | US-33 | qua 04/11 |
   | `20261103090000_contagem_da_triagem.sql` | US-27 | qui 05/11 |
   | `20261103100000_perfil_da_voluntaria.sql` | US-28 | qui 05/11 |
   | `20261104090000_taxas_de_cartao.sql` | US-32 | qui 05/11 |

   O `db push` recusa uma migração com nome anterior ao da última aplicada. Se a ordem dos merges mudar (por exemplo, a US-28 sair antes da US-27), quem aplica confere no `migration list` que só a sua está pendente e roda `db push --include-all`. Não renomeie migração depois de aplicada.
6. **Quem integra confere** no sistema publicado, com a conta de conferência do perfil certo, e registra no `PROGRESSO.md`. Sem conferência, o cartão não vai para Concluído.
7. **A equipe não lança dados reais no sistema publicado.** Teste é no Supabase local. Lançamento de conferência no publicado é feito com nome "CONFERÊNCIA" e apagado (ou excluído, no caso de item) em seguida.
8. **Se algo quebrar:** Instant Rollback na Vercel para o deploy anterior, aviso no grupo e correção com calma. O rollback não desfaz migração; por isso a regra 2.

## Regras de corte

Vêm das ações da retrospectiva da Sprint 5.

- **PR sem aprovação no horário volta ao topo do backlog.** Exceção só se decidida no grupo da equipe e registrada no `PROGRESSO.md`.
- **Quarta 04/11, conferência do meio:** story de quinta sem a implementação pronta sai da sprint na quarta à noite.
- **US-32 é a última da fila da Bibiana:** sem aprovação na quinta às 18h, volta ao topo do backlog e a sprint fecha com 35 SP.
- **TS-03:** sem data combinada com o Instituto até a quinta 05/11, a story volta ao topo do backlog e as migrações da sprint entram nos dois bancos (regra 3 acima).
- **Pergunta sem resposta não trava story:** cada guia diz o que fazer enquanto a resposta não chega (tabela abaixo). A resposta que chegar depois do merge vira ajuste pequeno, registrado no `PROGRESSO.md`.

## Perguntas ao Instituto

Enviadas ou a enviar pelo Mateus. Quem implementa não espera a resposta para começar.

| Pergunta | Para quem | Story | Enquanto não responde |
| --- | --- | --- | --- |
| Data da virada e da revisão | coordenação | TS-03 | virada fica para quarta à noite; sem data até quinta, a story volta ao backlog |
| Perfil de cada pessoa (Tamara voluntária, Ana caixa, Nílian coordenação) | coordenação | TS-03, US-28 | contas criadas com esses perfis |
| As tampinhas continuam por peso? Cabelos e perucas ficam em Diversos? | Tamara | US-27 | tampinha continua com quantidade e peso, sem triagem |
| Pix na Sicredi tem taxa? | Nílian (enviada em 30/10) | US-32 | sem taxa cadastrada; a venda mostra "taxa não cadastrada" até a coordenação cadastrar (0% se não houver taxa) |
| Stone e PIX TON ainda são usados? | Nílian (enviada em 30/10) | US-32 | continuam ativos; desativar é uma linha na migração se a resposta vier antes do merge |
| Quais são os "outros cartões" do débito na PagBank? | Nílian (enviada em 30/10) | US-32 | rótulo "Outras bandeiras" |
| Em que dia a semana começa na planilha de hoje? | Nílian (enviada em 30/10) | US-30 | segunda-feira (constante `INICIO_DA_SEMANA`) |
| O rótulo do custo da campanha deve ser "Custo" em vez de "Custo estimado"? | Nílian (enviada em 30/10) | US-33 | continua "Custo estimado" (constante no componente) |
| Limite do valor muito alto (proposta: R$ 1.000) | coordenação | US-34 | R$ 1.000 (constante `LIMITE_DO_VALOR_ALTO`) |
| Nome, CNPJ e endereço do Instituto no recibo; alguém assina? | coordenação | US-16 | recibo só com o nome do Instituto, sem CNPJ, sem endereço e sem assinatura (`lib/instituto.ts`) |

## Onde as stories se encostam

| Arquivo | Stories | Como não brigar |
| --- | --- | --- |
| `components/donations/new-donation-item-form.tsx` | US-04a (modo de edição), US-27 (campos novos) | US-04a integra na quarta; a Alissa traz a `main` na quinta de manhã, antes da Parte F |
| `components/donations/donations-items-list.tsx` | US-04a (coluna de ações), US-27 (triagem pendente e contagens), US-16 (link Recibo) | A US-16 põe o link dentro da célula de ações que a US-04a cria; a US-27 mexe nas outras colunas. Merge de quinta: US-27 antes da US-16 |
| `lib/campos-do-item.ts` (novo na US-04a) | US-04a, US-27 | A US-04a cria a leitura dos campos do formulário num lugar só; a US-27 troca os campos ali |
| `actions/donations.ts` | US-04a (usa `lib/campos-do-item.ts`), US-27, US-34 (`registerDonation`) | Funções diferentes do mesmo arquivo |
| `lib/store.ts` | US-04a, US-27, US-33, US-30, US-16, US-32 | Cada story escreve na seção do seu assunto (indicada no guia). US-16 e US-32 acrescentam seções no fim do arquivo: no conflito, fique com as duas |
| `types/index.ts` | US-04a, US-27, US-33, US-30, US-16, US-32 | Um tipo por linha no import de `lib/store.ts`, como na Sprint 4 |
| `components/shop/financials-table.tsx` | US-29, US-32 | A Bibiana começa a US-32 a partir da `main` com a US-29 |
| `app/(admin)/relatorios/page.tsx` | US-30 e US-32 (um link cada no cabeçalho) | Linhas separadas, uma abaixo da outra; no conflito, fique com as duas |
| `docs/seguranca/matriz-de-permissoes.md` | todas com tela ou tabela nova | As linhas da Sprint 6 já entram neste PR, marcadas "(Sprint 6, US-xx)". Quem integra tira a marca da sua linha. A US-28 revisa a coluna da voluntária |
| `proxy.ts`, `lib/rotas.ts`, `components/layout/sidebar.tsx` | US-28 | Só a US-28 mexe; as telas novas de Relatórios já são da coordenação pelo prefixo `/relatorios` |
| `package.json`, `package-lock.json`, `.github/workflows/esteira.yml` | SEC-07 | Integra primeiro na quarta; todas trazem a `main` depois |
| Testes que já existem | US-27 (`doacao-de-itens`), US-28 (`acesso.spec.ts` continua passando), US-32 (vendas no crédito e no débito) | Cada guia lista os testes que mudam |

1. **Antes de pedir revisão, traga a `main`** (`git fetch && git merge origin/main`) e rode de novo lint, build e testes.
2. **A US-04a esconde a doação excluída pela política de leitura do banco.** Por isso as telas não precisam de filtro novo, e toda consulta pela API já deixa de ver a excluída. A exceção são as funções `security definer`, que passam por cima das políticas: a US-27 cria duas e filtra `deleted_at is null` nelas.
3. **A US-28 tira da voluntária a leitura de vendas e de doações em dinheiro.** Toda story nova que lê essas tabelas para o balcão (a US-16, no recibo de dinheiro) já nasce respeitando isso, porque lê pela API.
4. **A US-32 renomeia "PagSeguro" para "PagBank"** e cria o banco "PIX PagBank" na própria migração. Não há tela de Configurações no sistema; a tarefa da TS-03 que falava em fazer isso "em Configurações" foi corrigida no Trello.

## Fora desta sprint

- **US-04b e SEC-04** (correção e cancelamento de venda e de doação em dinheiro, com trilha): esperam o Instituto dizer quem corrige lançamento com dinheiro.
- **US-31** (comissão do mês): espera saber a quem a comissão é paga.
- **US-35** (taxa da maquininha nas doações em dinheiro): a estimar, depois que a Nílian disser como a doação entra pela PagBank e se o relatório conta bruto ou líquido. Provável na Sprint 7, logo depois da US-32.
- **US-09, US-21, US-24, US-25 e TS-04:** projeção das Sprints 7 e 8 no `Planejamento_Sprint6.md`.
- **Tela de Configurações** (bancos, formas de pagamento, origens): não existe e não foi pedida. Acertos de banco desta sprint vão em migração.

## Fluxo de cada story

```bash
git checkout main && git pull
git checkout -b us-29-forma-de-pagamento-no-financeiro    # branch com o ID da story
git push -u origin us-29-forma-de-pagamento-no-financeiro
# ... implementa seguindo o guia ...
git add -A
git commit -m "US-29: forma de pagamento e parcelas na conferência do recebimento"
git push
```

No GitHub, abra o Pull Request **com base na `main`**, com o título no formato `US-29 · Forma de pagamento na conferência do recebimento` e os critérios de aceitação no corpo. Quando estiver pronto, tire do rascunho, mova o cartão para **Em revisão** e avise quem revisa. A revisora escreve no PR o que rodou e o que testou na tela antes do Approve.

## O que foi e o que não foi conferido nestes guias

Os guias foram escritos em 30/10 a partir da `main` daquele dia (último merge: PR #50), lendo o código, as migrações, os seeds, os testes e os cartões do Trello.

- **Não conferido:** nenhum comando foi executado, por regra do projeto. Migração, código e testes dos guias não passaram por banco, `tsc`, lint, build nem Playwright. Quem implementa é a primeira pessoa a rodar.
- **Por isso,** cada guia termina com os comandos e o que conferir na tela. Trecho que não compilar ou não passar: corrija e registre no `PROGRESSO.md`.
- **Nomes conferidos no código de 30/10:** políticas da US-23 (`"coordenacao le tudo, balcao le o dia"`, `"equipe registra em seu nome"`, `"coordenacao altera"`), funções `auth_role`, `eh_equipe`, `eh_coordenacao` e `balcao_le_desde`, a `register_sale` (9 parâmetros), as views `events_totals` e `campaigns_totals`, os bancos do seed (`PIX TON`, `PIX SICREDI`, `SICREDI`, `PagSeguro`, `Stone`) e as contas do seed (`voluntaria@` coordenação, `balcao@` voluntária, `caixa@` caixa).

## Definição de Pronto

- [ ] Todos os critérios de aceitação marcados no cartão
- [ ] Código revisado e aprovado por outra integrante no GitHub, com o que rodou e o que testou escrito no PR
- [ ] Esteira verde (lint, build, testes de fumaça e de acesso, varredura de segredos e auditoria de dependências)
- [ ] Migração aplicada em produção antes do merge, quando a story tiver migração (nos dois bancos, se antes da virada)
- [ ] Pull Request integrado à `main` à noite, com aviso no grupo
- [ ] Deploy conferido no sistema publicado, com a conta do perfil certo, e registrado no `PROGRESSO.md`
- [ ] Linha da matriz de permissões sem a marca "(Sprint 6, US-xx)", quando a story tiver linha

## Fim da sprint (06/11)

- [ ] Cada cartão em Concluído ou devolvido ao topo do Backlog do Produto
- [ ] Relatório: situação de cada item, velocity separada por tipo (correção, segurança, technical e user story), desvios, retrospectiva com responsáveis e prazos
- [ ] Burndown: acréscimo de 41 SP lançado na Sprint 6 e a velocity da sprint
- [ ] Respostas do Instituto registradas no `PROGRESSO.md` e aplicadas (ou viradas em ajuste no backlog)
- [ ] Lista do backlog levada à revisão com o Instituto, para eles dizerem o que vem primeiro na Sprint 7
- [ ] Vídeos individuais gravados
- [ ] Trello, `PROGRESSO.md` e relatório mostrando a mesma situação
