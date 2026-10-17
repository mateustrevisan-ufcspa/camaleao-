# Sprint 4 · 17/10 a 23/10/2026

**Objetivo:** o balcão registra uma venda em poucos toques, a coordenação passa a ver tudo o que uma pessoa fez numa lista só e consegue juntar fichas repetidas (pedido N do Instituto), e as doações começam a ser reorganizadas: categorias editáveis, tampinhas como item e doação de evento.

**Compromisso:** 31 Story Points em 6 user stories, na ordem do roadmap (balcão, ficha única, doações). Proposta do planejamento de 16/10, a confirmar pela equipe na abertura.

Quadro: [Trello · Camaleão Admin](https://trello.com/b/2iMIPtF4), lista "Selecionado · Sprint 4 (17/10 a 23/10) · 31 SP".

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

**Fora desta sprint:** US-04 e SEC-04 (aguardam a resposta da Flávia sobre quem corrige um lançamento errado), US-09 (precisa da planilha do brechó, que ainda não chegou) e US-13 (próxima no roadmap, terceira na ordem de corte). Se o soft opening for decidido, a separação dos bancos de desenvolvimento e produção entra como technical story no planejamento da Sprint 5.

## Calendário

| Dia | O que acontece |
| --- | --- |
| Sábado 17/10 e domingo 18/10 | Este PR de documentação revisado e integrado. Quem quiser adiantar lê o guia da sua story |
| Segunda 19/10 | As seis branches abertas, com `push` |
| Terça 20/10 | US-10 e US-05 em Pull Request pronto para revisão |
| Quarta 21/10 | US-10 e US-05 integradas. **Conferência do meio da sprint, com registro escrito no `PROGRESSO.md`.** US-08b e US-11 em Pull Request |
| Quinta 22/10 | US-08b e US-11 integradas. US-08a e US-12 em Pull Request |
| Sexta 23/10 | US-08a e US-12 integradas até o meio-dia. Revisão da sprint, retrospectiva, relatório e vídeos |

Cada pessoa abre o PR da primeira story antes de começar a segunda. A maior story (US-08b) entra na quinta, e não na sexta, para não repetir o aperto do fim da Sprint 3.

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
