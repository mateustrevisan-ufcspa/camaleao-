# Sprint 3 · 10/10 a 16/10/2026

**Objetivo:** o sistema passa a tratar com cuidado os dados de quem apoia o Instituto (guarda só o que usa, mostra a cada perfil só o que precisa e registra quem autorizou mensagens), e o balcão ganha a primeira melhoria de uso, a busca de pessoa.

**Compromisso:** 13 Story Points em 4 stories, uma por integrante. São 11 SP de user stories e 2 SP de technical story.

Quadro: [Trello · Camaleão Admin](https://trello.com/b/2iMIPtF4), lista "Selecionado · Sprint 3 (10/10 a 16/10) · 13 SP".

## De onde vem o número

A velocity estimada vem do planejamento inicial entregue em 09/10. Na Sprint 2 a equipe concluiu 15 SP de trabalho novo, mas 7 deles só no último dia. Os 13 SP ficam um pouco abaixo disso por quatro motivos: as duas últimas stories da Sprint 2 fecharam sem folga, o gargalo das duas sprints foi revisão e integração, a Bibiana e a Alissa assumem pela primeira vez uma user story inteira, e a semana tem o feriado de 12/10.

## Stories

| Nº | Arquivo | Story | Tipo | SP | Implementa | Revisa |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | [TS-01.md](TS-01.md) | Regras de TypeScript no lint | Technical | 2 | Laís | Bibiana |
| 2 | [SEC-05.md](SEC-05.md) | Minimização de dados pessoais expostos | User | 3 | Mateus | Alissa |
| 3 | [US-06.md](US-06.md) | Busca de pessoa em qualquer tela | User | 3 | Alissa | Laís |
| 4 | [US-07.md](US-07.md) | Contato e consentimento de mensagens | User | 5 | Bibiana | Mateus |

A ordem da tabela é a ordem de integração, da menor para a maior. Para começar, nenhuma depende de outra: as quatro branches abrem no mesmo dia.

## O que muda em relação à Sprint 2

Ações fechadas na retrospectiva de 09/10:

- **Cada integrante é dona de uma story inteira** e revisa a de outra pessoa. O Mateus implementa só a SEC-05.
- **Branch aberta e primeiro `push` até terça 13/10.** Na Sprint 2 a SEC-02 ficou parada até o último dia sem ninguém perceber.
- **Revisão no mesmo dia em que o PR sai do rascunho,** com **Approve** no GitHub. Comentário elogiando não libera o merge.
- **Quem implementou faz o merge e move o cartão** para Concluído no mesmo dia.
- **Migração em produção colada ao merge.** Nesta sprint, as três migrações são compatíveis com o código que já está no ar. A ordem é: aprovação, migração em produção, merge, tudo no mesmo dia. Quem aplica é o Mateus.
- **Conferência no meio da sprint, quarta 14/10:** a equipe olha o `PROGRESSO.md` e o Trello e decide o que volta ao backlog.

## Calendário

| Dia | O que acontece |
| --- | --- |
| Sábado 10/10 e domingo 11/10 | Sem compromisso. Quem quiser adiantar lê o guia da sua story |
| Segunda 12/10 | Feriado |
| Terça 13/10 | As quatro branches abertas, com `push`. TS-01 e SEC-05 em Pull Request pronto para revisão |
| Quarta 14/10 | Conferência do meio da sprint. TS-01 e SEC-05 revisadas e integradas; migração da SEC-05 em produção. US-06 em Pull Request |
| Quinta 15/10 | US-06 revisada e integrada. US-07 em Pull Request e revisada |
| Sexta 16/10 | US-07 integrada até o meio-dia. Revisão da sprint, retrospectiva, relatório e vídeos |

Um merge por dia, e não quatro na sexta. A regra da `main` exige a branch atualizada: cada merge obriga as outras branches a trazerem a `main`, e isso gera um commit novo, que derruba a aprovação já dada. Foi o que apertou o último dia da Sprint 2.

## Onde as stories se encostam

Três das quatro mexem na ficha da pessoa. Os guias foram escritos para as branches se juntarem sem conflito, em qualquer ordem, desde que cada mudança entre no lugar indicado. O que cada uma precisa saber das outras:

| Arquivo | SEC-05 | US-06 | US-07 |
| --- | --- | --- | --- |
| `clients_view` (banco) | recria a view | não toca | não toca |
| Tabela `clients` | remove `cpf`; fecha a leitura de `phone` | acrescenta `nickname` | não toca (tabela própria) |
| `lib/store.ts` | constantes no topo e trocas de `select('*')`; `updateClient` | funções novas antes de `getClients` | funções novas no fim do arquivo |
| `actions/clients.ts` | `saveClient`: linha do telefone | apelido depois de `addClient` e de `updateClient` | `saveNewClient`: bloco antes do `return` |
| `types/index.ts` | campos de `Client` | `nickname` e tipo novo | tipo novo no fim |
| `new-client-modal.tsx` | não toca | campo de apelido | caixa de autorização |
| `client-profile.tsx` | não toca | apelido no cabeçalho | cartão de mensagens |
| `tests/acesso/apoio.ts` | cria | mesmo arquivo, igual | mesmo arquivo, igual |

Três regras que saem daí:

1. **Depois da SEC-05, coluna nova em `clients` não nasce legível.** A migração da US-06 já traz o `grant` necessário. Vale para qualquer coluna futura.
2. **`tests/acesso/apoio.ts` é idêntico nas três stories.** Quem chegar depois e já encontrar o arquivo não mexe nele.
3. **Antes de pedir revisão, traga a `main`** (`git fetch && git merge origin/main`) e rode de novo lint, build e testes. Se aparecer conflito apesar dos cuidados, não resolva no escuro: chame quem escreveu o outro lado.

Sobre a revisão: quem fizer commit na branch de outra pessoa deixa de poder aprovar aquele PR, porque a regra da `main` exige que a aprovação do último push venha de outra pessoa. Revisora que achar um problema comenta, e quem implementou corrige.

## Fluxo de cada story

```bash
git checkout main && git pull
git checkout -b us-06-busca-de-pessoa        # branch com o ID da story
git push -u origin us-06-busca-de-pessoa     # primeiro push até 13/10, mesmo sem código
# ... implementa seguindo o arquivo da story ...
git add -A
git commit -m "US-06: busca no banco nas telas de venda e de doação"
git push
```

No GitHub, abra o Pull Request **com base na `main`**, com o título no formato `US-06 · Busca de pessoa em qualquer tela`. Pode abrir como rascunho desde o primeiro dia. Quando estiver pronto para revisão, tire do rascunho, mova o cartão para **Em revisão** e avise a revisora.

## O que foi e o que não foi conferido nestes guias

O código dos quatro guias foi escrito e conferido em 09/10, antes de virar guia:

- **Conferido no banco:** as três migrações aplicadas em um PostgreSQL 16 com uma imitação mínima do Supabase (papéis `anon` e `authenticated`, `auth.uid()`), em várias ordens, com consultas simulando coordenação, caixa, usuária desativada e visitante sem login.
- **Conferido na API:** as mesmas chamadas que `lib/store.ts` e os testes de acesso fazem, feitas com o `postgrest-js` contra um PostgREST 12 ligado a esse banco. Passaram 37 de 37 conferências, incluindo o cadastro de pessoa pela caixa com a coluna `phone` fechada para leitura.
- **Conferido no código:** as quatro stories juntas, sobre a `main` de 09/10 (com a SEC-02) mais a branch da SEC-03, passaram em `tsc`, em `npm run lint` com as regras da TS-01 e em `next build`, e se juntaram sem conflito em cinco ordens de merge.
- **Não conferido:** o login do Supabase não fez parte da imitação. Por isso os testes do Playwright (`test:fumaca` e `test:acesso`) foram escritos, passam na conferência de tipos e aparecem na listagem do Playwright, mas não foram executados, e nenhuma tela foi aberta no navegador.

Trate os guias como um bom ponto de partida, e não como garantia. Quem implementa roda, vê funcionando e ajusta.

## Definição de Pronto

- [ ] Todos os critérios de aceitação marcados no cartão
- [ ] Código revisado e aprovado por outra integrante no GitHub
- [ ] Esteira verde (lint, build, testes de fumaça e de acesso, varredura de segredos e auditoria de dependências)
- [ ] Funcionalidade verificada por quem revisou
- [ ] Migração aplicada em produção, quando a story tiver migração
- [ ] Pull Request integrado à `main`

## Fim da sprint (16/10)

- [ ] Cada cartão em Concluído ou devolvido ao topo do Backlog do Produto
- [ ] Relatório: situação de cada story no encerramento, velocity (só stories concluídas, separada por tipo), desvios, retrospectiva realizada com responsáveis e prazos
- [ ] Coluna "Executado" do relatório preenchida com o que cada pessoa fez
- [ ] Vídeos individuais gravados
- [ ] Artefatos da Concepção Inicial atualizados (Product Backlog e Projeto Arquitetural)
- [ ] Trello, `PROGRESSO.md` e relatório mostrando a mesma situação
