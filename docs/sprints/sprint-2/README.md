# Sprint 2 · 03/10 a 09/10/2026

**Objetivo:** cada pessoa passa a ver e alterar só o que o seu perfil permite, com a regra aplicada no banco e conferida por teste automático a cada Pull Request.

**Compromisso:** 15 Story Points novos em 3 histórias, mais o fechamento dos 19 SP que ficaram pendentes da Sprint 1.

Quadro: [Trello · Camaleão Admin](https://trello.com/b/2iMIPtF4), lista "Selecionado · Sprint 2 (03/10 a 09/10) · 15 SP novos + 19 SP pendentes da Sprint 1".

## O que muda em relação à Sprint 1

- **Cada integrante implementa uma parte**, com revisão cruzada. Na Sprint 1 o Mateus implementou tudo e as colegas validaram.
- **Nada começa antes de fechar a Sprint 1.** As três histórias novas dependem da esteira e do Next.js 16 na `main`. Veja [FECHAMENTO-SPRINT-1.md](FECHAMENTO-SPRINT-1.md).

## Histórias, na ordem de execução

| Ordem | Arquivo | História | SP | Implementa | Revisa |
| --- | --- | --- | --- | --- | --- |
| 0 | [FECHAMENTO-SPRINT-1.md](FECHAMENTO-SPRINT-1.md) | Pendências: SEC-01, US-02, US-03, US-26 | 19 | Mateus, com as três aprovando | Bibiana, Alissa, Laís |
| 1 | [SEC-02.md](SEC-02.md) | Varredura de segredos e auditoria de dependências na esteira | 2 | Bibiana | Mateus |
| 2 | [US-23.md](US-23.md) | Permissões por perfil de usuário | 8 | Mateus (banco e servidor) e Alissa (matriz e telas) | Bibiana |
| 3 | [SEC-03.md](SEC-03.md) | Testes automatizados de controle de acesso | 5 | Laís | Alissa |

## Calendário

| Dia | O que acontece |
| --- | --- |
| Segunda 05/10 | Fechar a Sprint 1: registro de rotação, aprovações, merges dos PRs #2 a #6 e proteção da `main` |
| Terça 06/10 | Matriz de permissões pronta (Alissa). SEC-02 em Pull Request (Bibiana) |
| Quarta 07/10 | Banco e servidor da US-23 em Pull Request (Mateus). Laís começa os testes a partir da branch da US-23 |
| Quinta 08/10 | Telas da US-23 (Alissa). SEC-03 em Pull Request (Laís). Revisões cruzadas |
| Sexta 09/10 | Merges, revisão, retrospectiva, relatório e vídeos |

## Por que essa ordem

1. **Fechamento primeiro.** Enquanto os PRs da Sprint 1 não entram na `main`, não existe esteira nem Next.js 16 para as histórias novas usarem.
2. **SEC-02 logo depois**, porque é independente das outras duas e protege os próximos Pull Requests.
3. **A matriz de permissões antes do banco.** As políticas da US-23 são a matriz escrita em SQL. Sem a matriz, o Mateus estaria decidindo sozinho quem pode o quê.
4. **SEC-03 depois da US-23**, porque os testes precisam das políticas e das usuárias de teste por perfil.

## Fluxo de cada história

```bash
git checkout main && git pull
git checkout -b sec-02-varredura-auditoria     # branch com o ID da história
# ... implementa seguindo o arquivo da história ...
git add -A
git commit -m "SEC-02: varredura de segredos na esteira"
git push -u origin sec-02-varredura-auditoria
```

No GitHub, abra o Pull Request **com base na `main`**, com o título no formato `SEC-02 · Varredura de segredos e auditoria de dependências na esteira`. O corpo já vem com o modelo; marque a Definição de Pronto conforme for cumprindo. No Trello, mova o cartão para **Em revisão**. Quem revisa testa e aprova, quem implementou faz o merge, e o cartão vai para **Concluído** só com todos os critérios marcados.

Duas regras para não repetir o que travou a Sprint 1:

- **Todo PR tem a `main` como base.** Na Sprint 1 cada PR foi aberto sobre a branch do anterior, e nenhum entrou na `main`.
- **O cartão só vai para Concluído depois do merge.** Aprovado e não integrado é Em revisão.

## Definição de Pronto

- [ ] Todos os critérios de aceitação marcados no cartão
- [ ] Código revisado e aprovado por outro integrante no GitHub
- [ ] Esteira verde
- [ ] Funcionalidade verificada por quem revisou
- [ ] Pull Request integrado à `main`

## Fim da sprint (09/10)

- [ ] Cada cartão em Concluído ou devolvido ao topo do Backlog do Produto
- [ ] Relatório: situação de cada história, velocity (só histórias concluídas), desvios, revisão e retrospectiva
- [ ] Coluna "Executado" do relatório preenchida com o que cada pessoa fez
- [ ] Vídeos individuais gravados
- [ ] Artefatos da Concepção Inicial atualizados (backlog, Visão do Produto, Projeto Arquitetural e Plano de Projeto)
