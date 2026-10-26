# Sprint 5 · 24/10 a 30/10/2026

**Objetivo:** atravessar a semana de avaliação do Instituto sem atrapalhar quem está testando, corrigir o que as avaliadoras podem encontrar, preparar o banco de produção para o uso real e entregar a conversão da contribuição em atendimentos, para mostrar na revisão de sexta.

**Compromisso:** 14 Story Points em 5 itens, no planejamento de 26/10. Semana mais leve de propósito: parte do tempo vai para acompanhar a avaliação e montar o replanejamento com o retorno do Instituto.

Quadro: [Trello · Camaleão Admin](https://trello.com/b/2iMIPtF4), lista "Selecionado · Sprint 5 (24/10 a 30/10) · 14 SP". Os retornos das avaliadoras vão para a lista "Retorno da avaliação (26/10 a 29/10)".

## A semana da avaliação

Na reunião de 23/10, o Instituto combinou que três pessoas avaliam o sistema publicado, cada uma num perfil, com o roteiro de avaliação que a equipe mandou:

| Avaliadora | Perfil | Quando |
| --- | --- | --- |
| Tamara | voluntária | segunda 26/10 |
| Ana | balcão (caixa) | durante a semana |
| Nílian | coordenação | durante a semana |

O prazo sugerido para o retorno é **quinta 29/10**, antes da revisão do sistema com o Instituto, prevista para **sexta 30/10** (a confirmar). O retorno provavelmente gera user stories novas, que entram no replanejamento de sexta.

Isso muda a forma de trabalhar desta semana, porque **a Vercel publica a `main` no minuto do merge e o sistema tem um banco só.** Qualquer merge muda a tela que alguém pode estar avaliando, e qualquer migração cai no mesmo banco em que elas lançam. Não sabemos em que horário cada avaliadora testa.

## Publicação durante a avaliação

Valem de segunda 26/10 até quinta 29/10, inclusive:

1. **A `main` só recebe o que está no calendário abaixo:** as duas correções (BUG-01 e BUG-02), a SEC-06 e PRs só de documentação. A US-19 integra na quinta à noite, depois do prazo de retorno.
2. **Merge só depois das 22h, com aviso no grupo das avaliadoras uma hora antes** (o Mateus avisa, às 21h). Se alguém responder que está testando, espera. Segunda 26/10, dia da Tamara, não tem merge nenhum. Vale também para PR só de documentação: todo merge na `main` gera deploy.
3. **Nenhuma migração no banco publicado até quinta à noite.** A única da sprint é a da US-19, e ela só acrescenta uma tabela.
4. **Quem faz o merge confere:** espera o deploy da Vercel terminar e refaz o fluxo mexido com a conta de conferência do perfil certo. Se algo quebrar, **Instant Rollback** na Vercel para o deploy anterior, aviso no grupo e correção com calma. O rollback desfaz o código, mas não desfaz migração: por isso a regra 3.
5. **A equipe não lança dados no sistema publicado.** Testes no Supabase local. O que estiver no sistema publicado é das avaliadoras e serve de insumo.
6. **Aviso para as avaliadoras** (vai junto do primeiro aviso de publicação): quem estiver com o sistema aberto durante uma publicação pode ver um erro na próxima ação, porque o navegador ainda tem a versão anterior. Recarregar a página resolve.

**Contas de conferência:** a equipe usa uma conta própria por perfil no sistema publicado (coordenação, voluntária e caixa), e não as das avaliadoras. O Mateus cria as que faltarem na segunda 26/10.

## Stories

| Nº | Arquivo | Story | Tipo | SP | Implementa | Revisa | PR pronto | Publica |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | [BUG-01.md](BUG-01.md) | Data de amanhã na doação de item depois das 21h | Correção | 1 | Laís | Alissa | ter 27/10, 18h | ter 27/10, depois das 22h |
| 2 | [BUG-02.md](BUG-02.md) | Cartões da tela de doações em dinheiro com os números do mês | Correção | 1 | Bibiana | Laís | ter 27/10, 18h | ter 27/10, depois das 22h |
| 3 | [SEC-06.md](SEC-06.md) | Build recusa chave secreta do Supabase | Segurança | 2 | Laís | Bibiana | qua 28/10 | qua 28/10, depois das 22h |
| 4 | [TS-02.md](TS-02.md) | Banco de produção novo, montado só pelas migrações | Technical | 5 | Mateus | Laís | qui 29/10 | qui 29/10, depois das 22h (só documentação) |
| 5 | [US-19.md](US-19.md) | Contribuição convertida em atendimentos | User | 5 | Alissa | Mateus | qui 29/10, 18h | qui 29/10, depois das 22h |

**IDs novos:** `BUG-` marca correção de falha encontrada no sistema, para separar na velocity o que é correção do que é história nova. As duas correções estavam anotadas como "itens novos para o backlog" no `PROGRESSO.md` da Sprint 4, assim como a SEC-06 e a TS-02. A US-19 é a única que já estava no Product Backlog.

Por que essa seleção:

- **As duas correções são falhas que as avaliadoras podem encontrar,** conferidas no código em 26/10. A doação de item lançada depois das 21h fica com a data de amanhã, e quem avalia à noite cai nisso. Os cartões de doações em dinheiro somam o histórico inteiro, e a Nílian (coordenação) olha essa tela. Nenhuma das duas tem migração ou muda a tela de outro jeito.
- **A SEC-06 não toca no que as avaliadoras veem:** é uma checagem de build e um passo na esteira, vindos do incidente de 21/10.
- **A TS-02 prepara o uso real sem mexer no banco publicado,** que só é lido. A virada (trocar as variáveis de produção na Vercel) fica fora da story: muda o sistema que elas estão usando, e a data sai da revisão de sexta. É também o que destrava importar as planilhas reais (US-09).
- **A US-19 faz o burndown andar.** Os 9 SP acima são itens novos: entram no backlog e saem na mesma sprint, então sozinhos deixariam o Realizado parado nos 63 SP. A US-19 já estava no Product Backlog, usa o valor de R$ 50 que o Instituto informou em 03/09, mexe pouco no que está sendo avaliado e integra depois do prazo de retorno, a tempo de aparecer na revisão.

Por que essa divisão:

- **Laís** fica com as duas que mexem em configuração e esteira (SEC-06) e numa correção pequena antes (BUG-01): fez a TS-01 e conhece a esteira.
- **Bibiana** fica com uma correção pequena e fechada em poucos arquivos (BUG-02) e com a revisão da SEC-06. Se a semana permitir mais, pode ajudar a organizar os retornos da avaliação em cartões.
- **Alissa** fica com a US-19: fez o relatório consolidado (US-17) e revisou a contribuição no período (US-15), que são as duas telas onde a US-19 aparece.
- **Mateus** fica com a TS-02 (é quem cuida do Supabase e da Vercel desde a SEC-01 e o incidente de 21/10), com o acompanhamento da avaliação e o replanejamento, e revisa a US-19.

Carga: Laís 3 SP, Bibiana 1 SP, Alissa 5 SP, Mateus 5 SP mais a avaliação. Revisões: Laís 2, Alissa 1, Bibiana 1, Mateus 1.

## Quem faz o quê

O mesmo passo a passo está no cartão de cada item no Trello, na lista "Tarefas da Sprint 5". O código de cada passo está no guia do item.

**Laís** (BUG-01, SEC-06; revisa BUG-02 e TS-02)

1. Segunda 26/10: branch da BUG-01 com push; ler o guia da SEC-06.
2. Terça 27/10: BUG-01 (formulário com a data de Brasília, servidor recusando data futura e teste com o relógio às 21h30); PR até as 18h. Revisar a BUG-02 da Bibiana. Depois das 22h, merge da BUG-01 e conferência com a conta da voluntária. Branch da SEC-06 com push.
3. Quarta 28/10: SEC-06 (`next.config.mjs`, passo da esteira, documento), prova de bloqueio e PR. Depois das 22h, merge e conferência do build na Vercel.
4. Quinta 29/10: revisar a TS-02 (diff, migração de acerto se houver, roteiro).

**Bibiana** (BUG-02; revisa SEC-06)

1. Segunda 26/10: branch da BUG-02 com push.
2. Terça 27/10: função `resumoDoMes`, cartões da tela de doações e teste; PR até as 18h. Depois das 22h, merge (depois da BUG-01) e conferência com a conta da coordenação.
3. Quarta 28/10: revisar a SEC-06, rodando o build com a chave inventada.

**Alissa** (US-19; revisa BUG-01)

1. Segunda 26/10: branch da US-19 com push; Partes A e B (migração e `lib/atendimentos.ts`).
2. Terça 27/10: revisar a BUG-01 da Laís. Partes C a F (tipos, `lib/store.ts`, Server Action e tela da coordenação).
3. Quarta 28/10: PR em rascunho com as Partes A a F, para a conferência do meio da sprint. Partes G, H e H2 (ficha, aviso da venda e coluna "Atendimentos" na lista de doações, depois de trazer a `main` com a BUG-02).
4. Quinta 29/10: Parte I (testes) e PR pronto até as 18h. Depois das 22h, merge (depois da migração aplicada pelo Mateus) e conferência com as contas da coordenação e da voluntária.

**Mateus** (TS-02, avaliação e replanejamento; revisa US-19)

1. Segunda 26/10: contas de conferência da equipe no sistema publicado; aviso às avaliadoras sobre recarregar a página; branch da TS-02 com push; receber o retorno da Tamara e criar os cartões.
2. Terça 27/10: `db diff` da TS-02, lido com a Laís. Aviso no grupo às 21h; depois das 22h, merge do PR de documentação (#43), antes das correções.
3. Quarta 28/10: projeto novo com `db push`, contagens, Auth e contas de conferência. Aviso no grupo às 21h. Conferência do meio da sprint no `PROGRESSO.md`.
4. Quinta 29/10: ensaio com preview, documento da TS-02 e PR. Revisar a US-19 até as 18h. Aviso no grupo às 21h; depois das 22h, migração da US-19 no banco publicado, merge da TS-02 e `db push` da US-19 no projeto novo.
5. Sexta 30/10: revisão com o Instituto, data da virada, replanejamento com os cartões da avaliação.
6. Todo dia: retornos das avaliadoras viram cartões na lista "Retorno da avaliação" no mesmo dia.

## Calendário

| Dia | O que acontece |
| --- | --- |
| Segunda 26/10 | Planejamento. Tamara avalia como voluntária. **Nenhum merge.** Branches abertas, com push. Mateus confere as contas de conferência da equipe no sistema publicado e manda o aviso sobre recarregar a página para as avaliadoras |
| Terça 27/10 | BUG-01 e BUG-02 em PR até as 18h e revisadas. Depois das 22h, com aviso: este PR de documentação, BUG-01 e BUG-02 integradas, uma de cada vez, cada deploy conferido. TS-02: diferença entre as migrações e o banco publicado |
| Quarta 28/10 | SEC-06 em PR, com o PR de prova. Depois das 22h, com aviso: SEC-06 integrada. TS-02: projeto novo montado com `db push`. **Conferência do meio da sprint, com registro no `PROGRESSO.md`** |
| Quinta 29/10 | Prazo do retorno das avaliadoras. US-19 em PR até as 18h e revisada. TS-02: ensaio com deploy de preview. Depois das 22h, com aviso: migração da US-19 no banco publicado, US-19 integrada e conferida, TS-02 integrada, `db push` da US-19 no projeto novo |
| Sexta 30/10 | Revisão do sistema com o Instituto (a confirmar). Data da virada do banco de produção. Replanejamento com as stories novas da avaliação. Retrospectiva, relatório e vídeos. **Nada é publicado antes da revisão** |

## Regras de corte

- **Terça 27/10, 18h:** correção sem PR pronto não entra na terça. Pode entrar na quarta à noite; se não entrar até quarta, volta ao topo do backlog.
- **Quinta 29/10, 18h:** US-19 sem PR aprovado não integra nesta sprint e volta ao topo do backlog. Não se publica nada na sexta antes da revisão.
- **TS-02:** se o `db diff` da terça mostrar uma diferença grande, o critério do diff e o do projeto novo seguem, e o ensaio com preview pode ficar para a Sprint 6. Registrado no `PROGRESSO.md` como replanejamento.

## Retorno da avaliação

O Mateus recebe os retornos (por WhatsApp, como diz o roteiro) e, no mesmo dia, cria um cartão por observação na lista "Retorno da avaliação (26/10 a 29/10)", com:

- **Quem e em que perfil** (Tamara, voluntária; Ana, caixa; Nílian, coordenação), a tela, o que tentou fazer e o que aconteceu;
- **Tipo:** falha (algo não funciona), melhoria (funciona, mas confuso, demorado ou faltando) ou dúvida.

Regra: **falha que impede a avaliação** vira correção na mesma semana, publicada à noite como as outras, e entra no `PROGRESSO.md` como acréscimo à sprint. **O resto vai para o replanejamento de sexta**, onde vira user story com estimativa ou se junta a uma que já existe (por exemplo, a correção de lançamento errado vai para a US-04).

## Onde as stories se encostam

Pouco, nesta sprint:

| Arquivo | BUG-01 | BUG-02 | SEC-06 | TS-02 | US-19 |
| --- | --- | --- | --- | --- | --- |
| Migração nova | não tem | não tem | não tem | `20261027090000_acerto_com_producao`, só se o diff achar diferença | `20261028090000_valor_do_atendimento` |
| `actions/` | `donations.ts` | não toca | não toca | não toca | `sales.ts` (último redirect), `atendimento.ts` (novo) |
| `lib/` | não toca | `resumo-das-doacoes.ts` (novo) | não toca | não toca | `atendimentos.ts` (novo), `store.ts` |
| Telas | formulários de doação | `donations-list.tsx` (topo e cartões) | não toca | não toca | painel do brechó, Relatórios, `/relatorios/atendimento` (nova), cartão de contribuição da ficha, `donations-list.tsx` (tabela) e a página de Doações · Dinheiro |
| Configuração | não toca | não toca | `next.config.mjs`, `esteira.yml` | não toca | não toca |
| Testes que já existem | não toca | não toca | não toca | não toca | `venda-em-poucos-toques` e `fluxos-criticos` (endereço depois da venda) |

1. **A migração de acerto da TS-02, se existir, vem antes da US-19** na ordem dos arquivos (27/10 antes de 28/10).
2. **A US-19 muda o endereço depois da venda** (`/brecho?venda=...`). Quem escrever teste novo de venda espera esse endereço.
3. **Antes de pedir revisão, traga a `main`** (`git fetch && git merge origin/main`) e rode de novo lint, build e testes.
4. **BUG-02 e US-19 mexem no mesmo `donations-list.tsx`,** em partes diferentes: a BUG-02 no topo e nos cartões, a US-19 na tabela (Parte H2). A BUG-02 integra na terça; a Alissa traz a `main` antes da Parte H2.
5. **O teste da BUG-01 não usa data fixa** e abre o formulário pelo link "Nova doação": com 27/10 fixo, ele passaria no dia 27 e reprovaria a esteira de todo PR a partir do dia 28 (detalhes no guia).

## Fora desta sprint

- **US-04 e SEC-04** (correção e cancelamento de lançamento, com trilha de quem alterou): o Instituto respondeu em 23/10 que a responsável pelas vendas pode corrigir, e o roteiro do balcão pergunta como as avaliadoras querem corrigir. Entram no replanejamento com o retorno.
- **US-09** (importação de planilhas): passou a cobrir a planilha da plataforma de doações e a das doações recorrentes. Espera os arquivos do Instituto e o banco de produção separado.
- **US-27** (condição e destino do item doado, cartão novo de 26/10): espera o retorno da avaliação para ser estimada.
- **US-16, US-21, US-24 e US-25:** entram no replanejamento de sexta.
- **Itens novos ainda sem cartão** (vindos da Sprint 4): remover a tabela `donations_caps`; aviso de confirmação para doação de valor muito alto; telefone da ficha na lista de doações, se o Instituto pedir. Vão para o replanejamento de sexta.

## Fluxo de cada story

```bash
git checkout main && git pull
git checkout -b bug-01-data-da-doacao-de-item     # branch com o ID da story
git push -u origin bug-01-data-da-doacao-de-item
# ... implementa seguindo o guia ...
git add -A
git commit -m "BUG-01: data de Brasília no formulário de doação de item"
git push
```

No GitHub, abra o Pull Request **com base na `main`**, com o título no formato `BUG-01 · Data de amanhã na doação de item depois das 21h`. Quando estiver pronto, tire do rascunho, mova o cartão para **Em revisão** e avise quem revisa. **O merge espera a janela da noite**, mesmo com o PR aprovado.

## O que foi e o que não foi conferido nestes guias

Os guias foram escritos em 26/10 a partir da `main` daquele dia (último merge: PR #42, 23/10 às 0h02), lendo o código, as migrações, os seeds e os testes.

- **Não conferido:** nenhum comando foi executado, por regra do projeto. Migração, código e testes dos guias não passaram por banco, `tsc`, lint, build nem Playwright. Quem implementa é a primeira pessoa a rodar.
- **Por isso,** cada guia termina com os comandos e o que conferir na tela. Trecho que não compilar ou não passar: corrija e registre no `PROGRESSO.md`.

## Definição de Pronto

- [ ] Todos os critérios de aceitação marcados no cartão
- [ ] Código revisado e aprovado por outra integrante no GitHub
- [ ] Esteira verde (lint, build, testes de fumaça e de acesso, varredura de segredos e auditoria de dependências)
- [ ] Funcionalidade verificada por quem revisou
- [ ] Migração aplicada em produção antes do merge, quando a story tiver migração
- [ ] Pull Request integrado à `main` **dentro da janela da noite, com aviso**
- [ ] Deploy conferido no sistema publicado e registrado no `PROGRESSO.md`

## Fim da sprint (30/10)

- [ ] Cada cartão em Concluído ou devolvido ao topo do Backlog do Produto
- [ ] Cartões da lista "Retorno da avaliação" transformados em stories (com estimativa) ou juntados a stories existentes
- [ ] Relatório: situação de cada item, velocity separada por tipo (correção, segurança, technical e user story), desvios, retrospectiva com responsáveis e prazos
- [ ] Burndown atualizado: acréscimo ao Product Backlog dos itens novos (9 SP desta sprint, mais o que vier do replanejamento) e velocity da sprint
- [ ] Vídeos individuais gravados
- [ ] Trello, `PROGRESSO.md` e relatório mostrando a mesma situação
