# Sprint 6 · progresso

**Período:** 31/10 a 06/11/2026 · **Situação:** em andamento · **Atualizado em:** 04/11/2026, com a virada para o banco de produção (TS-03), a BUG-03 e a US-29 integradas, a US-34 aprovada e as respostas do Instituto

Plano da sprint: [README.md](README.md).

## Resumo

- **30/10, replanejamento:** 12 itens, 40 SP (BUG-03, US-29, TS-03, US-04a, US-33, US-34, SEC-07, US-28, US-27, US-30, US-16 e US-32), com os 13 retornos da avaliação do Instituto. Começou com 25 SP às 14h e foi a 40 SP no ajuste das 15h, com mais trabalho para a Bibiana. Guias escritos nesta pasta a partir da `main` de 30/10 (PR #50), sem execução de código.
- **01/11, domingo:** plano integrado à `main` (PR #51, aprovado pela Laís). US-33 implementada e verde no local (PR #53, em revisão com a Laís). US-16 adiantada sem esperar a US-04a, a US-27 e a US-28 (PR #52, rascunho): falta trazer essas três na quinta à noite.
- **03/11, terça:** BUG-03 integrada (PR #55, 17h52). US-29 (PR #57) e US-34 (PR #56) abertas e aprovadas à noite. Respostas do Instituto recebidas pelo Mateus: o Instituto não usa o sistema, nem para teste, até as melhorias ficarem prontas, então a virada (TS-03) não depende mais de data.
- **04/11, quarta:** US-29 integrada (PR #57, 8h37). Limite do valor muito alto mantido em R$ 1.000. **2 de 40 SP integrados.** US-34 aprovada e aberta; US-33 esperando a revisão da Laís; US-16 em rascunho. SEC-07, US-04a, US-27, US-28, US-30 e US-32 (29 SP) sem branch no GitHub. **Virada feita às 14h** (TS-03, versão curta): o sistema publicado passou para o `camaleao-producao`; contas reais e categorias finais ficam para o início do uso. US-33 com o rótulo "Custo" aplicado, esperando a Laís.

## Ponto de partida: como a Sprint 5 terminou

- 14 de 14 SP integrados à `main` (BUG-01, BUG-02, SEC-06, TS-02 e US-19); último merge: PR #49 (TS-02), 30/10 às 10h42. Detalhes no [progresso da Sprint 5](../sprint-5/PROGRESSO.md) e no relatório da Sprint 5.
- Banco `camaleao-producao` montado só pelas migrações (13 de 13), com três contas de conferência e ensaio no preview. O sistema publicado continua no banco antigo até a virada (TS-03).
- Avaliação do Instituto: 13 retornos (Tamara 8, Nílian 5, Ana nenhum), todos encaminhados no replanejamento.
- Product Backlog: de 58 para 99 SP com o acréscimo de 41 SP (33 de user story, 7 de technical story e segurança, 1 de correção). Com os 40 SP desta sprint, sobram 59 SP, 29,5 por sprint nas Sprints 7 e 8; 36 SP deles dependem de resposta do Instituto.
- Taxas das maquininhas recebidas da Nílian em 30/10 (Sicredi e PagBank), registradas na US-32. Oito perguntas enviadas a ela no mesmo dia, respondidas até 03/11 (tabela "Respostas do Instituto").

## Stories (40 SP)

| Story | Tipo | SP | Implementa | Revisa | Branch | PR | Situação |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [BUG-03](BUG-03.md) · Botões fora da tela na janela de nova pessoa | Correção | 1 | Laís | Mateus | `bug-03-janela-nova-pessoa` | [#55](https://github.com/mateustrevisan-ufcspa/camaleao-/pull/55) | **Concluída.** Aprovada e integrada em 03/11 às 17h52. A correção foi além do guia: além da altura máxima e da rolagem, a janela saiu de dentro do formulário da doação, e o teste clica em Cadastrar nas duas entradas. Conferência no publicado marcada no Trello pela Laís, com print no cartão |
| [US-29](US-29.md) · Forma de pagamento na conferência do recebimento | User | 1 | Bibiana | Alissa | `us-29-forma-de-pagamento-no-financeiro` | [#57](https://github.com/mateustrevisan-ufcspa/camaleao-/pull/57) | **Integrada** em 04/11 às 8h37, aprovada pela Alissa (03/11, 22h58). Falta a conferência no publicado com a conta da coordenação e o cartão em Concluído (está em Em revisão) |
| [TS-03](TS-03.md) · Virada do sistema publicado para o banco de produção | Technical | 2 | Mateus | Laís | `docs-ts-03-virada` | | **Virada feita** em 04/11 às 14h pelo Mateus, conferida só por ele (o plano previa a Laís na conferência). Versão curta: contas reais e categorias finais saíram para o cartão "Início do uso pelo Instituto", no backlog. Falta o PR de documentação, revisado pela Laís |
| [US-04a](US-04a.md) · Editar e excluir doação de item | User | 5 | Bibiana | Alissa | `us-04a-editar-e-excluir-item` | | Não iniciada. Sem branch no GitHub em 04/11; PR previsto para 04/11, 18h. A US-27 depende dela |
| [US-33](US-33.md) · Custo do evento | User | 3 | Mateus | Laís | `us-33-custo-do-evento` | [#53](https://github.com/mateustrevisan-ufcspa/camaleao-/pull/53) | Em revisão, sem aprovação em 04/11. Em 04/11: rótulo "Custo" na campanha (constante e teste), cadastro de campanha com a mesma leitura do custo da edição (`lerCusto`) e marcas "(Sprint 6, US-33)" tiradas da matriz. Lint, build, fumaça (8 de 8) e acesso (10 de 10) verdes no local, com a `main` de 04/11. Falta a aprovação da Laís, o `db push` da `20261102100000_custo_do_evento.sql` e o merge |
| [US-34](US-34.md) · Confirmação de doação em dinheiro de valor muito alto | User | 1 | Alissa | Bibiana | `us-34-valor-muito-alto` | [#56](https://github.com/mateustrevisan-ufcspa/camaleao-/pull/56) | Em revisão, **aprovada** pela Bibiana (03/11, 22h59). Limite de R$ 1.000 mantido pelo Instituto (04/11), igual ao do PR. Falta o merge e a conferência com a conta de caixa. O cartão está em Em andamento no Trello |
| [SEC-07](SEC-07.md) · Vulnerabilidades altas nas dependências de desenvolvimento | Segurança | 3 | Laís | Alissa | `sec-07-dependencias-de-desenvolvimento` | | Não iniciada. Sem branch no GitHub em 04/11; PR previsto para 04/11, 18h |
| [US-28](US-28.md) · Perfil de voluntária sem dinheiro e sem caixa | User | 5 | Laís | Mateus | `us-28-perfil-da-voluntaria` | | Não iniciada. Sem branch no GitHub em 04/11 |
| [US-27](US-27.md) · Contagem da triagem do item doado | User | 8 | Alissa | Bibiana | `us-27-contagem-da-triagem` | | Não iniciada. Sem branch no GitHub em 04/11. Tampinha sem peso (Tamara, 03/11) |
| [US-30](US-30.md) · Somas de vendas por dia e por semana | User | 3 | Bibiana | Laís | `us-30-somas-de-vendas` | | Não iniciada. Sem branch no GitHub em 04/11. Semana começa na segunda (Nílian), como no guia |
| [US-16](US-16.md) · Recibo de doação | User | 3 | Mateus | Laís | `us-16-recibo-de-doacao` | [#52](https://github.com/mateustrevisan-ufcspa/camaleao-/pull/52) (rascunho) | Em andamento. Recibo de dinheiro e de item, link na lista e na ficha; lint, build, fumaça e acesso verdes no local. Falta, na quinta: trazer a US-04a (link vai para a célula de ações, antes de "Editar"), a US-27 (quantidade da triagem no recibo) e a US-28 (teste da voluntária); tirar a marca "(Sprint 6, US-16)" da matriz. Dados do Instituto "em breve" (coordenação, 03/11): por ora, só o nome |
| [US-32](US-32.md) · Taxas de cartão cadastradas pela coordenação | User | 5 | Bibiana | Mateus | `us-32-taxas-de-cartao` | | Não iniciada. Sem branch no GitHub em 04/11. Respostas da Nílian mudam a migração e um teste (Pontos de atenção) |

## Respostas do Instituto

| Pergunta | Para quem | Enviada em | Resposta | Aplicada em |
| --- | --- | --- | --- | --- |
| Data da virada e da revisão | coordenação | 03/11 | Virada quando a equipe quiser: o Instituto não usa o sistema, nem para teste, até todas as melhorias ficarem prontas. Revisão da sprint: sem resposta | TS-03 (virada antes do primeiro `db push`) |
| Perfil de cada pessoa (Tamara voluntária, Ana caixa, Nílian coordenação) | coordenação | 03/11 | No começo, só as três usam o sistema. Os perfis seguem o plano (o perfil de cada uma não foi confirmado à parte) | TS-03, US-28 |
| Tampinhas continuam por peso? Cabelos e perucas em Diversos? | Tamara | 03/11 | Tampinha sem peso; cabelos e perucas em Diversos | US-27 (Peso sai também da tampinha) |
| Pix na Sicredi tem taxa? | Nílian | 30/10 | Não tem taxa | US-32 (0% na carga da migração) |
| Stone e PIX TON ainda são usados? | Nílian | 30/10 | Pode tirar | US-32 (`active = false` na migração) |
| Quais são os "outros cartões" do débito? | Nílian | 30/10 | Elo, Banri, BaneseCard, Cabal, Afinz, entre outros | US-32 (rótulo da bandeira) |
| Como as doações entram pela PagBank? | Nílian | 30/10 | Por cartão cadastrado no site antigo (hoje o site usa a Doação Solutions) e por Pix na chave da PagBank, sem taxa (exemplo: o Natalenço) | US-35 (backlog) |
| Doação bruta ou líquida nos relatórios? | Nílian | 30/10 | Os dois, de preferência; se não der, o líquido | US-35 (backlog) |
| Em que dia a semana começa na planilha? | Nílian | 30/10 | Segunda-feira, na planilha do brechó | US-30 (igual ao guia) |
| A quem a comissão é paga? | Nílian | 30/10 | Hoje à Ana, mas pode haver outras pessoas na captação. Querem ver o valor por doação e somar o mês todo ou só algumas doações | US-31 (backlog; muda o desenho, reestimar) |
| Rótulo do custo da campanha | Nílian | 30/10 | Só "Custo". Em 04/11, confirmou que o custo só precisa ser preenchido (campo à mão, sem cálculo) | US-33 (aplicado em 04/11) |
| Limite do valor muito alto (proposta: R$ 1.000) | coordenação | 03/11 | Em 03/11, R$ 10.000; em 04/11, o Instituto confirmou que pode manter R$ 1.000 | US-34 (R$ 1.000, como no PR #56) |
| Nome, CNPJ e endereço do Instituto no recibo; alguém assina? | coordenação | 03/11 | Em breve | US-16 (segue só com o nome) |
| O Pix da PagBank tem 0,19% (taxas de 30/10) ou é sem taxa (resposta sobre as doações)? | Nílian | | | US-32, US-35 |
| Sem peso, a tampinha fica com quantidade, ou só o registro de que chegou? | Tamara | | | US-27 |
| A revisão da sprint com o Instituto continua na sexta 06/11? | coordenação | | | Encerramento |

## Publicações no sistema publicado

Uma linha por merge e por migração. "Conferido" diz com qual conta de conferência e o que foi refeito.

| Data | Aviso no grupo | Migração (banco atual / `camaleao-producao`) | Merge | O quê | Quem | Conferido |
| --- | --- | --- | --- | --- | --- | --- |
| 03/11, 17h52 | não registrado | sem migração | PR #55 | BUG-03 | Laís | Marcado no Trello pela Laís, com print no cartão; a conta usada não foi registrada aqui |
| 04/11, 8h37 | não registrado | sem migração | PR #57 | US-29 | a registrar | Pendente |
| 04/11, 14h | sem aviso (o Instituto não usa o sistema) | `camaleao-producao`: 13 de 13, sem pendência | Redeploy da `main` (PR #57), sem cache | Virada (TS-03) | Mateus | Mateus, com as três contas de conferência (seção "Virada (TS-03)") |

## Virada (TS-03)

Feita em 04/11, de dia, sem aviso ao Instituto, que não está usando o sistema. Versão curta: sem contas reais e sem as categorias finais, que ficam para o início do uso.

| Passo | Hora | Quem | Resultado |
| --- | --- | --- | --- |
| CLI ligado ao `camaleao-producao` | antes das 14h | Mateus | `supabase/.temp/project-ref` com a ref do `camaleao-producao` |
| `migration list` | antes das 14h | Mateus | 13 de 13 nas duas colunas, até `20261028090000`, sem pendência. A `20261102100000` (US-33) só na coluna Local, porque o CLI estava na branch da US-33; não foi aplicada |
| Variáveis da Vercel | antes das 14h | Mateus | As duas do projeto antigo ficaram só em Preview; `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` do `camaleao-producao`, as duas do mesmo projeto, criadas só em Production, tipo Config. Valores antigos guardados fora do repositório, para a volta |
| Redeploy de produção | 14h | Mateus | Último deploy da `main` (PR #57), sem cache |
| Conferência no sistema publicado | depois das 14h | Mateus | Login das três contas de conferência; conta do banco antigo recusada; menu de cada perfil como na matriz; nova venda e nova doação abrem com as listas; listas, Relatórios e Financeiro vazios |
| Contas reais e categorias | | | Para o início do uso pelo Instituto (cartão no backlog) |

**Desvio do plano:** a Laís não participou da conferência. Ela revisa o registro no PR de documentação.

**Como voltar:** repor em Production as duas variáveis do projeto antigo e fazer um novo deploy. O banco antigo não mudou na virada.

## Conferência do meio da sprint (quarta 04/11)

A preencher pela Laís até as 20h de quarta. Para cada story de quinta (US-28, US-27, US-30, US-16 e US-32): implementação pronta? Testes escritos? O que falta? A que não estiver pronta sai da sprint nesta noite (regra de corte). Para as de quarta: PRs abertos e aprovados até as 18h?

## Pontos de atenção

- **Nenhum código dos guias foi executado no planejamento.** Quem implementa é a primeira pessoa a rodar migração, lint, build e testes. Trecho que não compilar: corrigir e registrar aqui.
- **Correções nos guias, achadas na execução (01/11):**
  - US-33: o `lerCusto` do guia aceitava texto como "abc" e gravava zero, porque o `parseMoney` devolve 0 para texto inválido; a versão do PR recusa.
  - US-33: `getByLabel('Custo estimado')` passou a casar também com o botão "Alterar custo estimado"; os testes usam `exact: true`.
  - US-33: o teste da US-12 achava o mesmo valor no arrecadado e na diferença (custo zero) e falhava no modo estrito; a célula do arrecadado ganhou `data-testid`.
  - US-16: o link de recibo da lista de itens fica numa coluna própria até a US-04a criar a célula de ações.
- **`node_modules` desatualizado quebra o build** ("Can't resolve 'write-excel-file/node'") e a fumaça ("Cannot find module 'fflate'"). Depois de trazer a `main`, rodar `npm ci`.
- **Desde a virada (04/11, 14h), migração só por `db push` no `camaleao-producao`.** Nada de SQL Editor no banco antigo. Antes de todo `db push`, conferir `supabase/.temp/project-ref` e rodar o `migration list`.
- **Na virada, a URL e a chave publicável vêm do mesmo projeto** (erro da primeira tentativa do ensaio da TS-02).
- **Depois da virada, o preview aponta para o banco antigo,** que não recebe as migrações novas. Tela nova testada no preview pode dar erro por falta de tabela; o teste que vale é o local.
- **US-04a antes da US-27** no mesmo formulário; **US-29 antes da US-32** no mesmo financeiro; **SEC-07 primeiro na quarta,** porque troca o `package-lock.json`.
- **A ordem das migrações importa para o `db push`.** Se uma story com migração de nome anterior integrar depois de outra, usar `--include-all` (README, "Publicação e migrações").
- **Sem chave, senha ou token** neste arquivo, no Trello ou no PR. E-mail das contas reais do Instituto também não vai para arquivo versionado.
- **Seis stories sem branch no GitHub em 04/11** (SEC-07, US-04a, US-27, US-28, US-30 e US-32, 29 SP). O plano pedia branch com push no fim de semana. A SEC-07 e a US-04a têm PR previsto para hoje às 18h, e a US-27 depende da US-04a. Entra na conferência do meio.
- **Proposta para os merges (Mateus, 03/11, a confirmar no grupo da equipe):** enquanto o Instituto não usa o sistema, merge assim que o PR for aprovado, sem esperar a noite e sem aviso no grupo do Instituto. A ordem das migrações, o `db push` antes do merge e a conferência no publicado continuam.
- **Ajustes da US-32 pelas respostas da Nílian:**
  - na carga da migração, `('PIX SICREDI', 'pix', false, null::text, 0.00)`;
  - `update public.banks set active = false where name in ('Stone', 'PIX TON');`;
  - rótulo de "Outras bandeiras" com os exemplos (Elo, Banri, Cabal...), e o teste que escolhe esse rótulo muda junto;
  - o teste "sem taxa cadastrada" usa a Stone, que será desativada, e no seed não sobra combinação sem taxa: o teste precisa de um banco criado só para ele;
  - conferir se o formulário de venda esconde banco inativo.
- **Ajuste da US-27:** tampinha sem peso. Os testes `doacao-de-itens`, `relatorio-consolidado` e `contribuicao-no-periodo` usam tampinha com peso e mudam. Doações antigas de tampinha continuam com o peso gravado.

## Pendências que seguem

- **No Trello, à mão:** pôr os membros nos cartões; apagar o checklist "APAGAR · critérios do backlog original" da US-16 (as ferramentas do Claude não fazem nenhuma das duas coisas).
- **No Trello:** US-33 para revisão (Mateus; a US-16 foi para Em andamento em 01/11). US-34 para Em revisão (está em Em andamento). US-29 para Concluído depois da conferência no publicado.
- **Diferença entre o Trello e este arquivo (04/11):** na BUG-03, o Trello marca "registrar no PROGRESSO.md" como feito em 03/11, mas o registro só entrou nesta atualização. A conta usada na conferência da BUG-03 não foi registrada.
- **Mensagem à equipe com as respostas do Instituto** e os ajustes da US-27, US-32 e US-34 (Mateus, 04/11).
- **Perguntas novas ao Instituto** (Mateus): as três últimas linhas da tabela "Respostas do Instituto".
- **Planilha do burndown:** lançar o acréscimo de 41 SP na Sprint 6 (Mateus).
- **Da Sprint 5:** conferências da BUG-01, da BUG-02 e da US-19 no sistema publicado; conferir se o esquema `backup_us11` foi apagado do banco publicado.
- **Do Instituto:** tabela "Respostas do Instituto" acima; termo de mensagens (US-21); planilhas (US-09); datas de treinamento (US-25); quem corrige lançamento com dinheiro (US-04b e SEC-04).

## Decisões

| Data | Decisão |
| --- | --- |
| 30/10 | Sprint 6 com 40 SP em 12 itens, com a Bibiana em 14 SP; a US-32 é a última da fila dela e, sem aprovação na quinta 18h, volta ao backlog (sprint fecha com 35 SP) |
| 30/10 | US-04 dividida em US-04a (doação de item, 5 SP, nesta sprint) e US-04b (venda e doação em dinheiro, 5 SP, com a SEC-04) |
| 30/10 | US-27 estimada em 8 SP: a doação de item tem dois momentos, entrada e triagem, e a voluntária registra a triagem de dias anteriores alterando só as contagens |
| 30/10 | Comissão e custo do evento: campo preenchido à mão pela coordenação, sem cálculo pelo sistema (decisão de 29/10, mantida) |
| 30/10 | Taxas das maquininhas por maquininha, forma, à vista ou parcelado (taxa única para qualquer parcela) e, só no débito da PagBank, bandeira; uma linha por alteração, no padrão da US-19 |
| 30/10 | Pergunta sem resposta não trava story: cada guia tem o valor provisório, e a resposta que chegar depois vira ajuste pequeno |
| 30/10 | Doação de item excluída (US-04a) fica no banco com quem excluiu e quando, e some de toda leitura pela política do banco, e não por filtro em cada tela |
| 30/10 | Acertos de banco da US-32 (PagSeguro para PagBank e o banco "PIX PagBank") vão na migração da US-32, porque o sistema não tem tela de Configurações. Corrige a tarefa da TS-03 e a descrição da US-32 no Trello |
| 30/10 | Custo da campanha passa a ser editável depois do cadastro, na US-33; hoje ele só é informado ao cadastrar |
| 01/11 | US-16 adiantada antes da US-04a, da US-27 e da US-28, como PR em rascunho; os ajustes que dependem delas entram na quinta à noite, ao trazer a `main` |
| 01/11 | Recibo sai só com o nome do Instituto até a coordenação mandar CNPJ, endereço e quem assina; os dados ficam em `lib/instituto.ts`, e campo vazio não aparece |
| 03/11 | TS-03 sem data com o Instituto: ele não usa o sistema, nem para teste, até as melhorias ficarem prontas. A virada entra antes do primeiro `db push` da sprint (US-04a ou US-33), e nenhuma migração precisa ir para o banco antigo. A regra de corte da TS-03 (sem data até quinta, volta ao backlog) deixa de valer |
| 03/11 | Contas reais só para Tamara, Ana e Nílian. Os e-mails são pedidos à coordenação e digitados só no painel do Supabase; a senha é enviada quando o uso começar |
| 03/11 | US-31 (backlog) muda: comissão por doação, com quem captou, somada no mês ou em doações escolhidas. Reestimar no planejamento da Sprint 7 |
| 04/11 | Limite do valor muito alto (US-34) fica em R$ 1.000. Em 03/11 o Instituto falou em R$ 10.000, e em 04/11 confirmou que pode manter R$ 1.000 |
| 04/11 | Virada curta agora, em vez de adiar: sem ela, cada migração da sprint teria de entrar à mão no banco antigo, ou o sistema publicado quebraria a cada merge. Contas reais (Tamara, Ana e Nílian) e categorias finais (Roupas, Tampinhas e Diversos) saem da TS-03 para o cartão "Início do uso pelo Instituto", no backlog, para a homologação até 29/11. A TS-03 fecha nesta sprint com 2 SP |

## Registro

| Data | O que aconteceu |
| --- | --- |
| 30/10 | Replanejamento da Sprint 6: 13 retornos da avaliação encaminhados; 12 itens e 25 SP às 14h; ajuste para 40 SP às 15h, com US-30, US-32, US-16, SEC-07 e US-34. Registro completo no `Planejamento_Sprint6.md` do Projeto |
| 30/10 | Trello: lista renomeada para "Selecionado · Sprint 6 (31/10 a 06/11) · 40 SP"; cartões novos BUG-03, US-04a, US-28, US-29, US-30, US-31, US-32, US-33, US-34, US-35, TS-03, TS-04 e SEC-07; US-04 renomeada para US-04b; checklists "Critérios de Aceitação" e "Tarefas da Sprint 6" nos doze cartões da sprint; etiqueta "SPRINT 6" nos doze |
| 30/10 | Taxas da Nílian registradas na US-32; mensagem com 8 perguntas enviada a ela pelo Mateus |
| 30/10 | Guias, README e este progresso escritos em `docs/sprints/sprint-6/` a partir da `main` de 30/10 (PR #50), sem execução de código. Matriz de permissões com as linhas da Sprint 6, marcadas "(Sprint 6, US-xx)" |
| 30/10 | Na escrita dos guias, dois desvios dos cartões: o sistema não tem tela de Configurações, então PagBank e o Pix da PagBank entram na migração da US-32; e o custo da campanha não é editável hoje, então a US-33 inclui a edição. Cartões da TS-03, US-32 e US-33 corrigidos no Trello |
| 30/10 | PR #51 (`docs-sprint-6-planejamento`) aberto com este plano, os doze guias, a matriz e o índice das sprints; integra à noite, antes dos PRs de terça. Trello: tarefa de PagBank da TS-03 reescrita, descrições da US-32 e da US-33 com a correção e o caminho do guia, critério novo na US-33 (custo da campanha editável) e um comentário com o guia em cada um dos doze cartões |
| 01/11 | US-33 implementada (`us-33-custo-do-evento`): migração do custo do evento com a view `events_totals` refeita, custo editável em eventos e campanhas, diferença na tela. Lint, build, fumaça e acesso (10 de 10) verdes no local, depois de `npm ci` e da correção do teste da US-12 |
| 01/11 | US-16 implementada (`us-16-recibo-de-doacao`): página `/recibo/[tipo]/[id]` para imprimir ou salvar em PDF, link nas listas de dinheiro e de itens e na ficha. Lint, build, fumaça (13 de 13) e acesso do recibo (3 de 3) verdes no local. PR #52 aberto como rascunho |
| 01/11 | PR #51 (plano da Sprint 6) aprovado pela Laís e integrado às 16h59. PR #53 (US-33) aberto às 16h59, com revisão da Laís |
| 02/11 | PR #54 (progresso de 01/11) integrado às 20h37. PR #55 (BUG-03) aberto pela Laís |
| 03/11 | BUG-03: PR #55 aprovado e integrado às 17h52. Quatro commits: o teste em tela baixa (esteira vermelha), a altura máxima com rolagem e, além do guia, a janela fora do formulário da doação, com o teste clicando em Cadastrar nas duas entradas. No Trello, a Laís marcou critérios, tarefas e conferência e moveu o cartão para Concluído às 17h53 (print no cartão às 18h22) |
| 03/11 | US-34: Alissa implementou a confirmação e o teste e abriu o PR #56 (Trello, 18h02); aprovado pela Bibiana (Trello, 22h59) |
| 03/11 | US-29: Bibiana mostrou a forma de pagamento e as parcelas no financeiro, com teste de fumaça, e abriu o PR #57; aprovado pela Alissa às 22h58 |
| 03/11 | Mateus recebeu as respostas da coordenação, da Tamara e das oito perguntas da Nílian, registradas na tabela "Respostas do Instituto" |
| 04/11 | US-29: PR #57 integrado às 8h37. Limite da US-34 mantido em R$ 1.000. No GitHub: US-34 aprovada e aberta, US-33 sem aprovação, US-16 em rascunho; SEC-07, US-04a, US-27, US-28, US-30 e US-32 sem branch. 2 de 40 SP integrados |
| 04/11 | Este progresso atualizado pelo Mateus a partir do Trello (histórico desde 01/11) e do GitHub (`gh pr list`, `git log origin/main`), na branch `docs-progresso-sprint-6-0411` |
| 04/11 | Nílian confirmou que o custo só precisa ser preenchido. US-33: rótulo "Custo" na campanha, cadastro de campanha com `lerCusto` (texto inválido passa a ser recusado, com o mesmo aviso da edição) e marcas tiradas da matriz; lint, build, fumaça (8 de 8) e acesso (10 de 10) verdes no local; enviado ao PR #53 |
| 04/11 | TS-03: virada do sistema publicado para o `camaleao-producao` às 14h, feita e conferida pelo Mateus (seção "Virada (TS-03)"). A partir daqui, migração só por `db push` no `camaleao-producao` |
| 04/11 | Trello: critérios de contas reais e categorias tirados da TS-03 e levados para o cartão novo "Início do uso pelo Instituto", no backlog |

## Encerramento

A preencher em 06/11.
