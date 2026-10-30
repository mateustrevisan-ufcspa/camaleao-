# Sprint 6 · progresso

**Período:** 31/10 a 06/11/2026 · **Situação:** planejada, nada começado · **Atualizado em:** 30/10/2026, no replanejamento

Plano da sprint: [README.md](README.md).

## Resumo

- **30/10, replanejamento:** 12 itens, 40 SP (BUG-03, US-29, TS-03, US-04a, US-33, US-34, SEC-07, US-28, US-27, US-30, US-16 e US-32), com os 13 retornos da avaliação do Instituto. Começou com 25 SP às 14h e foi a 40 SP no ajuste das 15h, com mais trabalho para a Bibiana. Guias escritos nesta pasta a partir da `main` de 30/10 (PR #50), sem execução de código.

## Ponto de partida: como a Sprint 5 terminou

- 14 de 14 SP integrados à `main` (BUG-01, BUG-02, SEC-06, TS-02 e US-19); último merge: PR #49 (TS-02), 30/10 às 10h42. Detalhes no [progresso da Sprint 5](../sprint-5/PROGRESSO.md) e no relatório da Sprint 5.
- Banco `camaleao-producao` montado só pelas migrações (13 de 13), com três contas de conferência e ensaio no preview. O sistema publicado continua no banco antigo até a virada (TS-03).
- Avaliação do Instituto: 13 retornos (Tamara 8, Nílian 5, Ana nenhum), todos encaminhados no replanejamento.
- Product Backlog: de 58 para 99 SP com o acréscimo de 41 SP (33 de user story, 7 de technical story e segurança, 1 de correção). Com os 40 SP desta sprint, sobram 59 SP, 29,5 por sprint nas Sprints 7 e 8; 36 SP deles dependem de resposta do Instituto.
- Taxas das maquininhas recebidas da Nílian em 30/10 (Sicredi e PagBank), registradas na US-32. Oito perguntas enviadas a ela no mesmo dia, sem resposta até o fechamento deste arquivo.

## Stories (40 SP)

| Story | Tipo | SP | Implementa | Revisa | Branch | PR | Situação |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [BUG-03](BUG-03.md) · Botões fora da tela na janela de nova pessoa | Correção | 1 | Laís | Mateus | `bug-03-janela-nova-pessoa` | | Não iniciada |
| [US-29](US-29.md) · Forma de pagamento na conferência do recebimento | User | 1 | Bibiana | Alissa | `us-29-forma-de-pagamento-no-financeiro` | | Não iniciada |
| [TS-03](TS-03.md) · Virada do sistema publicado para o banco de produção | Technical | 2 | Mateus | Laís | `docs-ts-03-virada` | | Não iniciada. Depende da data com o Instituto |
| [US-04a](US-04a.md) · Editar e excluir doação de item | User | 5 | Bibiana | Alissa | `us-04a-editar-e-excluir-item` | | Não iniciada |
| [US-33](US-33.md) · Custo do evento | User | 3 | Mateus | Laís | `us-33-custo-do-evento` | | Não iniciada |
| [US-34](US-34.md) · Confirmação de doação em dinheiro de valor muito alto | User | 1 | Alissa | Bibiana | `us-34-valor-muito-alto` | | Não iniciada |
| [SEC-07](SEC-07.md) · Vulnerabilidades altas nas dependências de desenvolvimento | Segurança | 3 | Laís | Alissa | `sec-07-dependencias-de-desenvolvimento` | | Não iniciada |
| [US-28](US-28.md) · Perfil de voluntária sem dinheiro e sem caixa | User | 5 | Laís | Mateus | `us-28-perfil-da-voluntaria` | | Não iniciada |
| [US-27](US-27.md) · Contagem da triagem do item doado | User | 8 | Alissa | Bibiana | `us-27-contagem-da-triagem` | | Não iniciada |
| [US-30](US-30.md) · Somas de vendas por dia e por semana | User | 3 | Bibiana | Laís | `us-30-somas-de-vendas` | | Não iniciada |
| [US-16](US-16.md) · Recibo de doação | User | 3 | Mateus | Laís | `us-16-recibo-de-doacao` | | Não iniciada |
| [US-32](US-32.md) · Taxas de cartão cadastradas pela coordenação | User | 5 | Bibiana | Mateus | `us-32-taxas-de-cartao` | | Não iniciada |

## Respostas do Instituto

| Pergunta | Para quem | Enviada em | Resposta | Aplicada em |
| --- | --- | --- | --- | --- |
| Data da virada e da revisão | coordenação | | | TS-03 |
| Perfil de cada pessoa (Tamara voluntária, Ana caixa, Nílian coordenação) | coordenação | | | TS-03, US-28 |
| Tampinhas continuam por peso? Cabelos e perucas em Diversos? | Tamara | | | US-27 |
| Pix na Sicredi tem taxa? | Nílian | 30/10 | | US-32 |
| Stone e PIX TON ainda são usados? | Nílian | 30/10 | | US-32 |
| Quais são os "outros cartões" do débito? | Nílian | 30/10 | | US-32 |
| Como as doações entram pela PagBank? | Nílian | 30/10 | | US-35 (backlog) |
| Doação bruta ou líquida nos relatórios? | Nílian | 30/10 | | US-35 (backlog) |
| Em que dia a semana começa na planilha? | Nílian | 30/10 | | US-30 |
| A quem a comissão é paga? | Nílian | 30/10 | | US-31 (backlog) |
| Rótulo do custo da campanha | Nílian | 30/10 | | US-33 |
| Limite do valor muito alto (proposta: R$ 1.000) | coordenação | | | US-34 |
| Nome, CNPJ e endereço do Instituto no recibo; alguém assina? | coordenação | | | US-16 |

## Publicações no sistema publicado

Uma linha por merge e por migração. "Conferido" diz com qual conta de conferência e o que foi refeito.

| Data | Aviso no grupo | Migração (banco atual / `camaleao-producao`) | Merge | O quê | Quem | Conferido |
| --- | --- | --- | --- | --- | --- | --- |
| | | | | | | |

## Virada (TS-03)

A preencher na noite da virada: hora do aviso, `migration list` antes, contas reais criadas, variáveis da Vercel trocadas (as duas do mesmo projeto), deploy, conferência com as três contas, quem fez.

## Conferência do meio da sprint (quarta 04/11)

A preencher pela Laís até as 20h de quarta. Para cada story de quinta (US-28, US-27, US-30, US-16 e US-32): implementação pronta? Testes escritos? O que falta? A que não estiver pronta sai da sprint nesta noite (regra de corte). Para as de quarta: PRs abertos e aprovados até as 18h?

## Pontos de atenção

- **Nenhum código dos guias foi executado no planejamento.** Quem implementa é a primeira pessoa a rodar migração, lint, build e testes. Trecho que não compilar: corrigir e registrar aqui.
- **Antes da virada, migração nos dois bancos;** depois, só `db push` no `camaleao-producao`. Antes de todo `db push`, conferir `supabase/.temp/project-ref`.
- **Na virada, a URL e a chave publicável vêm do mesmo projeto** (erro da primeira tentativa do ensaio da TS-02).
- **Depois da virada, o preview aponta para o banco antigo,** que não recebe as migrações novas. Tela nova testada no preview pode dar erro por falta de tabela; o teste que vale é o local.
- **US-04a antes da US-27** no mesmo formulário; **US-29 antes da US-32** no mesmo financeiro; **SEC-07 primeiro na quarta,** porque troca o `package-lock.json`.
- **A ordem das migrações importa para o `db push`.** Se uma story com migração de nome anterior integrar depois de outra, usar `--include-all` (README, "Publicação e migrações").
- **Sem chave, senha ou token** neste arquivo, no Trello ou no PR. E-mail das contas reais do Instituto também não vai para arquivo versionado.

## Pendências que seguem

- **No Trello, à mão:** pôr os membros nos cartões; apagar o checklist "APAGAR · critérios do backlog original" da US-16 (as ferramentas do Claude não fazem nenhuma das duas coisas).
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

## Registro

| Data | O que aconteceu |
| --- | --- |
| 30/10 | Replanejamento da Sprint 6: 13 retornos da avaliação encaminhados; 12 itens e 25 SP às 14h; ajuste para 40 SP às 15h, com US-30, US-32, US-16, SEC-07 e US-34. Registro completo no `Planejamento_Sprint6.md` do Projeto |
| 30/10 | Trello: lista renomeada para "Selecionado · Sprint 6 (31/10 a 06/11) · 40 SP"; cartões novos BUG-03, US-04a, US-28, US-29, US-30, US-31, US-32, US-33, US-34, US-35, TS-03, TS-04 e SEC-07; US-04 renomeada para US-04b; checklists "Critérios de Aceitação" e "Tarefas da Sprint 6" nos doze cartões da sprint; etiqueta "SPRINT 6" nos doze |
| 30/10 | Taxas da Nílian registradas na US-32; mensagem com 8 perguntas enviada a ela pelo Mateus |
| 30/10 | Guias, README e este progresso escritos em `docs/sprints/sprint-6/` a partir da `main` de 30/10 (PR #50), sem execução de código. Matriz de permissões com as linhas da Sprint 6, marcadas "(Sprint 6, US-xx)" |
| 30/10 | Na escrita dos guias, dois desvios dos cartões: o sistema não tem tela de Configurações, então PagBank e o Pix da PagBank entram na migração da US-32; e o custo da campanha não é editável hoje, então a US-33 inclui a edição. Cartões da TS-03, US-32 e US-33 corrigidos no Trello |
| 30/10 | PR #51 (`docs-sprint-6-planejamento`) aberto com este plano, os doze guias, a matriz e o índice das sprints; integra à noite, antes dos PRs de terça. Trello: tarefa de PagBank da TS-03 reescrita, descrições da US-32 e da US-33 com a correção e o caminho do guia, critério novo na US-33 (custo da campanha editável) e um comentário com o guia em cada um dos doze cartões |

## Encerramento

A preencher em 06/11.
