# Sprint 4 · 17/10 a 23/10/2026

**Objetivo:** o balcão registra uma venda em poucos toques, a coordenação passa a ver tudo o que uma pessoa fez numa lista só e consegue juntar fichas repetidas (pedido N do Instituto), e as doações começam a ser reorganizadas: categorias editáveis, tampinhas como item e doação de evento. No replanejamento de 20/10 entraram também a contribuição de cada pessoa no período e o relatório consolidado do Instituto, com exportação em planilha (pedido A), aniversariantes e doadores recorrentes (pedidos L e M), a doação ligada sempre a uma ficha e a doação de campanha.

**Compromisso:** 31 Story Points em 6 user stories, na ordem do roadmap (balcão, ficha única, doações), no planejamento de 16/10. **No replanejamento de 20/10, mais 27 SP em 7 user stories: 58 SP no total** (seção [Replanejamento de 20/10](#replanejamento-de-2010)).

Quadro: [Trello · Camaleão Admin](https://trello.com/b/2iMIPtF4), lista "Selecionado · Sprint 4 (17/10 a 23/10) · 58 SP".

## De onde vem o número

O burndown de 16/10 mostra 121 SP no backlog para 5 sprints, ou cerca de 25 SP por sprint para zerar. O trabalho novo entregue foi 15 SP na Sprint 2 e 13 SP na Sprint 3. A equipe decidiu não renegociar o escopo com o Instituto e puxar mais stories nesta semana, que está mais leve na faculdade, para abrir folga no burndown.

31 SP é o dobro do ritmo medido. Por isso esta sprint tem duas regras que as anteriores não tinham: **duas stories por pessoa, escalonadas**, e uma **regra de corte na quarta** (abaixo).

## Stories

| Nº | Arquivo | Story | Tipo | SP | Implementa | Revisa | Integra |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | [US-10.md](US-10.md) | Histórico unificado na ficha da pessoa | User | 3 | Bibiana | Mateus | qua 21/10 |
| 2 | [US-05.md](US-05.md) | Venda registrada em poucos toques | User | 5 | Alissa | Laís | qua 21/10 |
| 3 | [US-08b.md](US-08b.md) | Mesclagem de duas fichas | User | 8 | Mateus | Alissa | qui 22/10 |
| 4 | [US-11.md](US-11.md) | Doação de itens com categorias editáveis | User | 5 | Laís | Bibiana | qui 22/10 |
| 5 | [US-08a.md](US-08a.md) | Sugestão de possíveis repetidos | User | 5 | Alissa | Mateus | sex 23/10 |
| 6 | [US-12.md](US-12.md) | Doação vinculada a um evento | User | 5 | Laís | Alissa | sex 23/10 |

Por que essa divisão:

- **A US-08 (13 SP) foi quebrada em duas,** mantendo os 13 SP, como a régua pede para histórias de 13. A US-08b (mesclagem) funciona sozinha: escolhe duas fichas pela busca e junta. A US-08a (sugestão de repetidos) aponta os pares e leva para a mesclagem. A divisão dos critérios entre as duas está nos guias.
- **Alissa** fica com venda e repetidos porque fez a busca sem acento da US-06, base das duas.
- **Laís** fica com as duas de doação, em sequência, porque mexem no mesmo formulário e na mesma lista do menu.
- **Mateus** fica com a mesclagem, a mais arriscada (mexe em todas as tabelas ligadas à pessoa), e com 8 SP, porque também escreveu os guias.
- **Bibiana** fica com uma story pequena e fechada em poucos arquivos, e com uma revisão.

**Fora desta sprint:** US-04 e SEC-04 (aguardam a resposta da Flávia sobre quem corrige um lançamento errado), US-09 (precisa da planilha do brechó, que ainda não chegou) e US-13 (próxima no roadmap, terceira na ordem de corte; entrou no replanejamento de 20/10). Se o soft opening for decidido, a separação dos bancos de desenvolvimento e produção entra como technical story no planejamento da Sprint 5.

## Calendário

Calendário do planejamento de 16/10. O de terça 20/10 em diante está no [replanejamento](#replanejamento-de-2010).

| Dia | O que acontece |
| --- | --- |
| Sábado 17/10 e domingo 18/10 | Este PR de documentação revisado e integrado. Quem quiser adiantar lê o guia da sua story |
| Segunda 19/10 | As seis branches abertas, com `push` |
| Terça 20/10 | US-10 e US-05 em Pull Request pronto para revisão |
| Quarta 21/10 | US-10 e US-05 integradas. **Conferência do meio da sprint, com registro escrito no `PROGRESSO.md`.** US-08b e US-11 em Pull Request |
| Quinta 22/10 | US-08b e US-11 integradas. US-08a e US-12 em Pull Request |
| Sexta 23/10 | US-08a e US-12 integradas até o meio-dia. Revisão da sprint, retrospectiva, relatório e vídeos |

Cada pessoa abre o PR da primeira story antes de começar a segunda. A maior story (US-08b) entra na quinta, e não na sexta, para não repetir o aperto do fim da Sprint 3.

## Replanejamento de 20/10

Na terça 20/10 de manhã, 21 dos 31 SP estavam integrados (US-08b, US-05, US-10 e US-08a), a US-11 estava em revisão (PR #29, esteira verde) e a Laís tinha combinado de entregar a US-12 no mesmo dia. Com a semana ainda livre na faculdade, a equipe decidiu puxar mais 27 SP do backlog, seguindo a ordem do roadmap (contribuição por pessoa, relatório e reconhecimento). Se as 13 stories forem integradas, o backlog cai de 121 SP (burndown de 16/10) para 63 SP, cerca de 16 SP por sprint nas quatro que faltam.

### Stories acrescentadas (27 SP)

| Nº | Arquivo | Story | Tipo | SP | Implementa | Revisa | PR pronto | Integra |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 7 | [US-22.md](US-22.md) | Aniversariantes do mês | User | 1 | Bibiana | Mateus | ter 20/10 | qua 21/10 |
| 8 | [US-14.md](US-14.md) | Toda doação vinculada a uma ficha | User | 3 | Alissa | Bibiana | qua 21/10 | qua 21/10, à noite, depois da US-12 |
| 9 | [US-20.md](US-20.md) | Acompanhamento de doadores recorrentes | User | 3 | Bibiana | Laís | qua 21/10 | qui 22/10 |
| 10 | [US-17.md](US-17.md) | Relatório consolidado do Instituto | User | 5 | Alissa | Mateus | qua 21/10, à noite | qui 22/10 |
| 11 | [US-15.md](US-15.md) | Contribuição total da pessoa no período | User | 8 | Mateus | Alissa | qui 22/10 | sex 23/10, primeiro merge |
| 12 | [US-18.md](US-18.md) | Exportação dos relatórios em planilha | User | 2 | Alissa | Bibiana | qui 22/10 | sex 23/10, depois da US-15 |
| 13 | [US-13.md](US-13.md) | Doação vinculada a uma campanha | User | 5 | Laís | Mateus | qui 22/10 | sex 23/10, último merge, até o meio-dia |

Por que essa divisão:

- **Alissa** fica com três stories em sequência (US-14, US-17 e US-18, 10 SP): integrou duas stories até segunda e tem a semana livre. A US-18 continua a tela da US-17.
- **Bibiana** fica com as duas menores do reconhecimento (US-22 e US-20, 4 SP), em sequência, porque as duas mexem no submenu de Clientes.
- **Mateus** fica com a US-15 (8 SP), a maior, e com três revisões, porque também escreveu os guias.
- **Laís** fica com a US-13 (5 SP) depois da US-12: é a mesma estrutura (tabela, view com total, campo no formulário), nos mesmos arquivos.

Carga da semana com o replanejamento: Alissa 20 SP (US-05, US-08a, US-14, US-17 e US-18), Laís 15 SP (US-11, US-12 e US-13), Mateus 16 SP (US-08b e US-15) e Bibiana 7 SP (US-10, US-22 e US-20). Revisões: Mateus 5, Bibiana 3, Alissa 3, Laís 2.

### Calendário de 20/10 a 23/10

| Dia | O que acontece |
| --- | --- |
| Terça 20/10 | Este PR de documentação revisado e integrado. US-11 revisada pela Bibiana e integrada. US-12 em Pull Request. Branches abertas: US-22 (Bibiana), US-15 (Mateus) e US-14 (Alissa, depois do merge da US-11). US-22 em Pull Request |
| Quarta 21/10 | US-22 e US-12 integradas. US-14 integrada à noite, depois da US-12. US-20 e US-17 em Pull Request. A Laís abre a US-13 depois do merge da US-12. **Conferência do meio da sprint, com registro no `PROGRESSO.md`, e regra de corte da quarta** |
| Quinta 22/10 | US-20 e US-17 integradas. US-15, US-18 e US-13 (Partes A a D) em Pull Request. **Regra de corte da quinta** |
| Sexta 23/10 | Até o meio-dia, nesta ordem: US-15, US-18 e US-13 (esta com as Partes E, F e G, que mostram a campanha na ficha, no relatório e na planilha). Revisão da sprint, retrospectiva, relatório e vídeos |

A ordem de sexta existe porque a US-13 acrescenta a campanha nas telas da US-15, da US-17 e da US-18: integrando por último, ela faz esses passos uma vez só, sobre o código que já está na `main`.

### Regras de corte

- **Quarta 21/10, à noite:** se a US-12 não estiver integrada, a US-13 volta para o topo do backlog (ela depende da migração e do formulário da US-12). As Partes D da US-15 e da US-17 (eventos) também ficam para depois.
- **Quinta 22/10, à noite:** story nova sem Pull Request pronto para revisão volta para o topo do backlog, registrada no `PROGRESSO.md` como replanejamento.
- As regras de 16/10 continuam: a da US-12 já está atendida (US-10 e US-05 integradas em 19/10), e a da US-08a também (integrada em 19/10).

### Onde as stories novas se encostam

As linhas reservadas seguem o mesmo esquema da seção [Onde as stories se encostam](#onde-as-stories-se-encostam): cada story acrescenta numa linha diferente.

O `import type` de `lib/store.ts`:

```ts
import type {
  AtalhoDaVenda,
  Aniversariante,         // US-22: depois de AtalhoDaVenda
  Client,
  Mesclagem,
  DoacaoSemFicha,         // US-14: depois de Mesclagem
  DonationCaps,
  DonationCash,
  Evento,
  EventoComTotal,
  Campanha,               // US-13: depois de EventoComTotal
  CampanhaComTotal,
  DonationItem,
  CategoriaDeItem,
  PessoaEncontrada,
  ParRepetido,
  DoadorRecorrente,       // US-20: depois de ParRepetido
  Sale,
  ItemDoHistorico,
  RelatorioConsolidado,   // US-17: depois de ItemDoHistorico
  DadosDaExportacao,      // US-18: depois de RelatorioConsolidado
  RegistroOriginal,
  TipoDeContribuicao,
  ContribuicaoNoPeriodo,  // US-15: depois de TipoDeContribuicao
} from '@/types'
```

O que cada story toca:

| Arquivo | US-22 | US-14 | US-20 | US-17 | US-15 | US-18 | US-13 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Migração nova | não tem | não tem | não tem | não tem | não tem | não tem | `doacao_de_campanha` |
| `types/index.ts` | depois de `AtalhoDaVenda` | depois de `PessoaEncontrada` | depois de `ParRepetido` | depois de `RegistroOriginal` | no fim do arquivo | depois de `RelatorioConsolidado` | dentro de `DonationCash` e depois de `EventoComTotal` |
| `lib/store.ts` | depois de `getBirthdaysThisMonth` | no fim do arquivo | depois de `getDonations` | depois de `getReportData` | depois de `getRegistroOriginal` | depois de `getRelatorioConsolidado` | colunas, histórico, `addDonation` e depois de `setEventoAtivo` |
| `lib/rotas.ts` | depois de `/clientes/repetidos` | depois de `/doacoes/categorias` | depois de `/clientes/mesclar` | não toca | não toca | não toca | depois de `/doacoes/eventos` |
| `sidebar.tsx` | "Aniversariantes" depois de Possíveis repetidos | "Sem ficha" depois de Categorias | "Doadores recorrentes" depois de Aniversariantes | não toca | não toca | não toca | "Campanhas" depois de Eventos |
| `actions/` | não toca | `donations.ts` (primeira linha das duas funções), `vinculo.ts` (novo) | não toca | não toca | `clients.ts` | não toca | `donations.ts`, `campanhas.ts` (novo) |
| Outros arquivos que já existem | `brecho/page.tsx` | `donor-field.tsx` (troca inteira) | nenhum | `utils.ts`, `donations-list.tsx`, `relatorios/page.tsx` | `client-profile.tsx`, `clients-page-client.tsx` | `relatorio-consolidado.tsx` (US-17), `package.json` | formulário e lista de doação em dinheiro, seed |
| Testes que já existem | não toca | `apoio.ts`, `fluxos-criticos`, `doacao-de-itens` e `eventos` | não toca | não toca | não toca | não toca | os da US-15, da US-17 e da US-18 (Partes E, F e G) |

Regras que saem daí:

1. **Bibiana faz a US-20 depois do merge da US-22,** e a Laís faz a US-13 depois do merge da US-12: são pares que mexem nas mesmas linhas.
2. **A US-14 troca o campo de doador** usado na doação em dinheiro e de item, e passa a exigir a escolha de "Doação sem ficha". Por isso ela atualiza os testes que já registram doação sem pessoa, e quem escreve teste novo de doação escolhe uma pessoa ou usa o ajudante `doacaoSemFicha` de `tests/fumaca/apoio.ts`.
3. **A US-18 traz uma dependência nova** (`write-excel-file`) e uma de desenvolvimento (`fflate`). Quem integra depois dela roda `npm ci`.
4. **A US-13 recria a `donations_cash_view` de novo** (a US-12 recriou antes). A definição dela tem de partir da que estiver na `main`.
5. **O seed da US-13 põe a doação de campanha em julho,** fora de maio e junho, que os testes da US-15 e da US-17 conferem.

### O que foi conferido nestes guias

Diferente dos guias de 16/10, os sete guias novos foram conferidos em 20/10, num ambiente de conferência (fora da máquina da equipe), com a `main` de 20/10, a branch da US-11 (PR #29) e o código do guia da US-12 aplicados, e as sete stories em cima, na ordem do calendário:

- **Conferido:** `tsc` sem erro, `npm run lint` sem aviso e `next build` com todas as rotas novas; a migração da US-13 e os seeds aplicados num PostgreSQL 16 com os papéis do Supabase; as regras de acesso das tabelas novas, como caixa e como coordenação; os números do seed que os testes esperam; e uma planilha gerada pela biblioteca da US-18, com as mesmas verificações do teste.
- **Não conferido:** os testes do Playwright não foram executados, nem nada contra o Supabase local de verdade. Quem implementa roda tudo de novo, e trecho que não passar é corrigido e registrado no `PROGRESSO.md`.

### Achados do replanejamento

- **Cartão "Total recebido · mês" da tela de doações em dinheiro somava todas as doações,** e não as do mês. A US-17 corrige, porque o quarto critério dela pede que o relatório bata com essa tela. Os cartões "Receita recorrente / mês" e "Total de doadores" da mesma tela também somam tudo: ficam como item novo do backlog.
- **Doação sem pessoa saía por esquecimento:** sem ninguém escolhido na busca, o formulário aceitava a doação solta, e não dava para saber se foi anônima de propósito. A US-14 passa a exigir a escolha explícita de "Doação sem ficha".
- **Doações sem ficha antigas:** a US-14 cria a tela Doações · Sem ficha para ligá-las a uma pessoa. A doação mensal da "Empresa Helmuth Ltda" do seed fica fora da lista de recorrentes da US-20 até ser ligada a uma ficha.

## Regra de corte na quarta

Na conferência de quarta, 21/10, à noite: **se a US-10 e a US-05 não estiverem integradas, a US-12 volta para o topo do backlog ali mesmo**, registrada no `PROGRESSO.md` como replanejamento. Se na quinta à noite a US-08b ainda não estiver integrada, a US-08a volta também. Assim o relatório mostra uma decisão tomada no meio da sprint, e não uma story que ficou pela metade.

## O que muda em relação à Sprint 3

Ações vindas do que aconteceu na Sprint 3 (de 12/10 a 14/10 não houve nenhum commit, e os quatro merges entraram em 11 horas):

- **Duas stories por pessoa, escalonadas.** A primeira pequena, para integrar até quarta; a segunda maior, até sexta.
- **Revisão em até 24 horas** depois de o PR sair do rascunho, com **Approve** no GitHub.
- **Quem implementou faz o merge e move o cartão** para Concluído no mesmo dia.
- **Migração em produção logo depois do merge,** aplicada pelo Mateus no mesmo dia. Produção ainda só tem dados de teste, então a janela entre o merge e a migração não afeta ninguém.
- **Conferência do meio da sprint com registro.** Na Sprint 3 ela não teve registro.

## Onde as stories se encostam

Seis stories em uma semana mexem em alguns arquivos em comum. Os guias dizem o lugar exato de cada mudança para as branches se juntarem sem conflito. Este PR já deixou três coisas prontas para isso:

1. **`lib/rotas.ts`** concentra a lista de telas só da coordenação, usada pelo `proxy.ts` e pelo menu, e já traz as quatro telas novas da sprint. Nenhuma story mexe nessa lista.
2. **O `import type` do topo de `lib/store.ts` tem um tipo por linha.** Cada story acrescenta os seus tipos numa linha diferente:

   ```ts
   import type {
     AtalhoDaVenda,          // US-05: logo depois de "import type {"
     Client,
     Mesclagem,              // US-08b: depois de Client
     DonationCaps,
     DonationCash,
     Evento,                 // US-12: depois de DonationCash
     EventoComTotal,
     DonationItem,
     CategoriaDeItem,        // US-11: depois de DonationItem
     PessoaEncontrada,
     ParRepetido,            // US-08a: depois de PessoaEncontrada
     Sale,
     ItemDoHistorico,        // US-10: depois de Sale
     RegistroOriginal,
     TipoDeContribuicao,
   } from '@/types'
   ```

3. **A matriz de permissões** já tem as linhas das telas e tabelas novas, marcadas "(Sprint 4)". Ninguém precisa editar a matriz; quem integra a story só tira a marca da sua linha.

O que cada story toca:

| Arquivo | US-10 | US-05 | US-08b | US-11 | US-08a | US-12 |
| --- | --- | --- | --- | --- | --- | --- |
| Migração nova | não tem | `atalhos_da_venda` | `mesclagem_de_fichas` | `categorias_de_doacao` | `possiveis_repetidos` | `doacao_de_evento` |
| `types/index.ts` | depois de `DonationCaps` | depois de `SaleItem` | no fim do arquivo | dentro e depois de `DonationItem` | depois de `PessoaEncontrada` | dentro e depois de `DonationCash` |
| `lib/store.ts` | troca as duas funções de histórico | depois de `getItemCategories` | depois de `updateClient` | seção de itens | depois de `getClients` | constante de colunas, `addDonation` e depois dela |
| `actions/` | `clients.ts` (fim) | não toca | `mesclagem.ts` (novo) | `donations.ts`, `categorias.ts` (novo) | não toca | `donations.ts`, `eventos.ts` (novo) |
| Telas | ficha da pessoa | nova venda | tela Clientes, `/clientes/mesclar` | itens, tampinhas, `/doacoes/categorias` | `/clientes/repetidos` | dinheiro, `/doacoes/eventos` |
| `sidebar.tsx` | não toca | não toca | não toca | troca Tampinhas por Categorias | submenu de Clientes | acrescenta Eventos |
| `supabase/seed-demo.sql` | não toca | não toca | não toca | categorias e tampinhas | duas fichas repetidas | um evento |
| Testes | arquivo novo | arquivos novos | arquivos novos | edita a lista de telas e cria arquivos | arquivos novos | arquivos novos |

Regras que saem daí:

1. **Cada story cria os seus arquivos de teste.** Só a US-11 edita testes que já existem (tira as telas de tampinhas da lista de telas e da busca na doação).
2. **Tipo novo vai na linha indicada** do `import type` de `lib/store.ts`. Se mesmo assim aparecer conflito nas linhas de import, fique com as linhas dos dois lados.
3. **Antes de pedir revisão, traga a `main`** (`git fetch && git merge origin/main`) e rode de novo lint, build e testes. Conflito fora das linhas de import: chame quem escreveu o outro lado.
4. **Depois da SEC-05, coluna nova em `clients` não nasce legível.** Nenhuma story desta sprint cria coluna em `clients`; vale para as próximas.

## Fluxo de cada story

```bash
git checkout main && git pull
git checkout -b us-10-historico-unificado        # branch com o ID da story
git push -u origin us-10-historico-unificado     # primeiro push até segunda 19/10
# ... implementa seguindo o guia da story ...
git add -A
git commit -m "US-10: histórico unificado na ficha"
git push
```

No GitHub, abra o Pull Request **com base na `main`**, com o título no formato `US-10 · Histórico unificado na ficha da pessoa`. Pode abrir como rascunho desde o primeiro dia. Quando estiver pronto, tire do rascunho, mova o cartão para **Em revisão** e avise a revisora.

## O que foi e o que não foi conferido nestes guias

Os guias foram escritos em 16/10 a partir da `main` daquele dia (depois do merge do PR #16), lendo o código, as migrações, os seeds e os testes que existem.

- **Não conferido:** nenhum comando foi executado. Migrações, código e testes dos guias não passaram por banco, `tsc`, lint, build nem Playwright. Na Sprint 3 os guias foram conferidos numa imitação do Supabase; nesta sprint, quem implementa é a primeira pessoa a rodar.
- **Por isso,** cada guia termina com a lista do que conferir na tela e no banco, e a revisão roda tudo de novo. Trate o código como um bom ponto de partida: quem implementa roda, vê funcionando e ajusta. Se um trecho do guia não compilar ou não passar no lint, corrija e registre no `PROGRESSO.md`.

## Achados do planejamento, fora da sprint

- **Data da venda depois das 21h.** Os formulários de venda, de doação em dinheiro e de doação de item calculam "hoje" em UTC (`new Date().toISOString()`). Depois das 21h de Brasília, o campo vem com a data de amanhã e a venda é gravada no dia seguinte. A US-05 corrige o formulário de venda; os dois de doação ficam anotados como item novo do backlog.
- **Forma de pagamento padrão com banco errado.** A nova venda abre com Dinheiro escolhido e o banco do PIX guardado por baixo, e a venda em dinheiro é gravada com esse banco. A US-05 corrige.
- **Tabela de tampinhas congelada.** A US-11 leva as tampinhas para as doações de item e deixa a tabela `donations_caps` vazia e sem escrita. Apagar a tabela, as duas funções dela em `lib/store.ts` e o tipo `DonationCaps` fica para uma technical story futura.

## Definição de Pronto

- [ ] Todos os critérios de aceitação marcados no cartão
- [ ] Código revisado e aprovado por outra integrante no GitHub
- [ ] Esteira verde (lint, build, testes de fumaça e de acesso, varredura de segredos e auditoria de dependências)
- [ ] Funcionalidade verificada por quem revisou
- [ ] Migração aplicada em produção, quando a story tiver migração
- [ ] Pull Request integrado à `main`

## Fim da sprint (23/10)

- [ ] Cada cartão em Concluído ou devolvido ao topo do Backlog do Produto
- [ ] Relatório: situação de cada story no encerramento, velocity (só stories concluídas, separada por tipo), desvios, retrospectiva com responsáveis e prazos
- [ ] Coluna "Executado" do relatório preenchida com o que cada pessoa fez
- [ ] Vídeos individuais gravados
- [ ] Burndown atualizado com a velocity da sprint
- [ ] Trello, `PROGRESSO.md` e relatório mostrando a mesma situação
