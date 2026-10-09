# Sprints do Camaleão Admin

Esta pasta é a memória do projeto: o plano e o progresso de cada sprint, em arquivos que ficam junto do código. Serve para a equipe e para o Claude no VS Code, que lê estes arquivos para saber onde o trabalho está antes de sugerir o próximo passo.

O quadro de controle continua sendo o [Trello](https://trello.com/b/2iMIPtF4). Aqui fica o que o quadro não mostra: o que cada Pull Request ainda precisa, as decisões tomadas e o histórico.

## Situação das sprints

| Sprint | Período | Tema | Planejado | Situação | Arquivos |
| --- | --- | --- | --- | --- | --- |
| 1 | 25/09 a 02/10 | Fundação técnica: segredos, README, testes, esteira e Next.js 16 | 21 SP | Encerrada. 2 SP concluídos no quadro, 19 SP passaram para a Sprint 2 | [plano](sprint-1/README.md) · [progresso](sprint-1/PROGRESSO.md) |
| 2 | 03/10 a 09/10 | Controle de acesso por perfil | 15 SP novos + 19 SP pendentes | **Em andamento** | [plano](sprint-2/README.md) · [progresso](sprint-2/PROGRESSO.md) |
| 3 | 10/10 a 16/10 | Dados pessoais e busca de pessoa: TS-01, SEC-05, US-06 e US-07 | 13 SP | Planejada, começa em 10/10 | [plano](sprint-3/README.md) · [progresso](sprint-3/PROGRESSO.md) |

Projeção das seguintes: Sprint 4 de 17/10 a 23/10, Sprint 5 de 24/10 a 30/10, Sprint 6 de 31/10 a 06/11, Sprint 7 de 07/11 a 13/11, Sprint 8 de 14/11 a 20/11, com reserva até 29/11 para homologação.

## O que tem em cada pasta

| Arquivo | Para que serve | Quando muda |
| --- | --- | --- |
| `sprint-N/README.md` | O plano: objetivo, histórias, ordem, calendário e Definição de Pronto | No planejamento da sprint |
| `sprint-N/PROGRESSO.md` | O estado real: situação de cada história, o que falta, quem faz, decisões e registro por data | A cada sessão de trabalho |
| `sprint-N/US-xx.md`, `SEC-xx.md` | O guia de execução de cada história, com comandos e código | Só se o plano da história mudar |

## Como usar com o Claude no VS Code

O `CLAUDE.md` da raiz já manda o Claude ler esta pasta. Pedidos que funcionam bem:

- **Para começar o dia:** "Leia o PROGRESSO.md da sprint atual e me diga o que falta e qual é o meu próximo passo."
- **Para trabalhar em uma história:** "Vamos fazer a US-23, parte B, seguindo docs/sprints/sprint-2/US-23.md."
- **Para fechar o dia:** "Atualize o PROGRESSO.md com o que fizemos hoje."
- **Antes da revisão da sprint:** "Com base no PROGRESSO.md, monte a situação de cada história para o relatório."

O Claude não roda comandos neste projeto: ele escreve o código e diz o comando exato, e quem roda é você.

## Regras do PROGRESSO.md

1. **Só entra como concluído o que tem evidência.** História concluída é Pull Request integrado à `main`. Aprovado e não integrado é "em revisão".
2. **Toda atualização leva a data** no topo do arquivo e uma linha no registro, no fim.
3. **Registro só cresce.** Não apague linhas antigas; se algo mudou, escreva uma linha nova.
4. **Sem segredo.** Nenhuma chave, senha ou token, nem como exemplo.
5. **Nomes reais, fatos reais.** O arquivo serve de base para o relatório e para os vídeos: registre o que cada pessoa fez de fato.
6. **Se o Trello e o GitHub discordarem, registre a diferença** e acerte o quadro.

## Para abrir uma sprint nova

1. Crie a pasta `sprint-N/` com o `README.md` (o plano) e um arquivo por história.
2. Copie o `PROGRESSO.md` da sprint anterior, esvazie as tabelas e o registro e ajuste o cabeçalho.
3. Na sprint que termina, preencha a seção de encerramento do `PROGRESSO.md`: velocity, o que passou para a seguinte e as lições.
4. Atualize a tabela "Situação das sprints" deste arquivo.
