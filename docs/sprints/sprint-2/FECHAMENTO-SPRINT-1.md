# Fechamento da Sprint 1 (19 SP pendentes)

Quatro histórias da Sprint 1 estão implementadas e ainda não entraram na `main`: SEC-01 (3), US-02 (5), US-03 (3) e US-26 (8). A US-01 está em Concluído no quadro, mas o PR dela também faz parte da fila.

**Meta:** tudo na `main` e a `main` protegida até segunda, 05/10.

## Situação em 04/10

| PR | História | Situação no GitHub | O que falta | Quem |
| --- | --- | --- | --- | --- |
| #2 | SEC-01 | Mudanças solicitadas pela Bibiana | Datas no registro de rotação, aprovação | Mateus, Bibiana |
| #3 | US-01 | Sem revisão | Aprovação (o README já foi validado em 12 min) | Alissa |
| #4 | US-02 | Aprovado pela Laís | Só o merge | Mateus |
| #5 | US-03 | Aprovado pela Laís | Merge e proteção da `main` | Mateus |
| #6 | US-26 | Esteira verde, sem revisão | Navegação pelos fluxos, aprovação | Alissa |
| #7, #8 | PRs de teste da esteira | Abertos | Fechar | Laís |

Os PRs estão **empilhados**: o #2 aponta para a `main`, o #3 para a branch do #2, o #4 para a do #3, e assim por diante. Por isso a ordem de merge importa.

## 1. Registro de rotação (Mateus)

A Bibiana pediu as datas em `docs/seguranca/rotacao-de-credenciais.md`. Use as datas em que a troca aconteceu de verdade. Se alguma credencial da lista ainda não foi trocada, troque agora, seguindo o checklist do próprio arquivo, e registre a data de hoje.

```bash
git checkout sec-01/remover-segredos
git pull
```

No arquivo, marque as caixas do checklist e preencha a tabela **Registro** (data, projeto, quem rotacionou e como foi verificado). Não escreva o valor de nenhuma chave.

```bash
git add docs/seguranca/rotacao-de-credenciais.md
git commit -m "SEC-01: registra as datas da rotação de credenciais"
git push
```

Avise a Bibiana.

## 2. Aprovações (Bibiana e Alissa)

No GitHub, em **Pull requests**, abra o PR, vá em **Files changed → Review changes**, escolha **Approve** e envie.

- **Bibiana, PR #2:** conferir que o registro tem datas e que a limpeza do histórico aconteceu depois da rotação. Aprovar.
- **Alissa, PR #3:** aprovar. A validação de 01/10 já está registrada no cartão; cole no comentário da aprovação o tempo (12 min) e o sistema operacional.
- **Alissa, PR #6:** antes de aprovar, rodar a versão nova na sua máquina:

```bash
git fetch
git checkout us-26/next-16
npm ci
npm run db:start
npm run dev
```

Entre com a usuária local do README e passe por: registrar uma venda, registrar uma doação em dinheiro, abrir Clientes, abrir Financeiro e abrir Relatórios. Anote no cartão da US-26 qualquer diferença em relação à versão anterior (tela quebrada, texto fora do lugar, erro no terminal). Sem diferenças, escreva isso no comentário e aprove.

## 3. Fila de merges (Mateus)

Sempre nesta ordem: **#2, #3, #4, #5, #6**. Para cada PR:

1. Abra o PR e confira que está aprovado e com as verificações verdes.
2. Confira que a base é a `main` (aparece no topo, em "wants to merge ... into `main`"). O #2 já está assim. Os outros mudam sozinhos no passo 4 do PR anterior.
3. Na seta ao lado do botão verde, escolha **Create a merge commit** e confirme. Não use *Squash* nem *Rebase*: com eles o PR seguinte passa a mostrar conflitos e commits repetidos.
4. Clique em **Delete branch**. É isso que faz o GitHub trocar a base do próximo PR para a `main`.
5. Abra o próximo PR. Se a base ainda não for a `main`, clique em **Edit** ao lado do título e troque.

Depois do #6:

```bash
git checkout main
git pull
git fetch --prune          # remove as referências das branches apagadas
npm ci
npm run build              # confere que a main monta
```

No GitHub, em **Actions**, confira a execução "Esteira" do último push na `main` em verde.

## 4. Proteção da `main` (Mateus)

Siga `docs/processo/protecao-da-main.md` (**Settings → Rules → Rulesets**). Faça isso só depois da fila: com a regra ativa, os PRs empilhados teriam de ser atualizados um a um.

A verificação obrigatória se chama `Lint, build e testes de fumaça`. Ela só aparece na busca depois de ter rodado ao menos uma vez.

## 5. Conferência do bloqueio (Laís)

Os PRs #7 e #8 apontavam para a branch da US-03, e a regra só vale para a `main`. Feche os dois (botão **Close pull request**) e abra um novo:

```bash
git checkout main && git pull
git checkout -b teste-bloqueio-da-main
```

Em `app/layout.tsx`, acrescente no fim do arquivo uma linha que quebra o build:

```ts
const quebrado: number = 'texto'
```

```bash
git add -A
git commit -m "TESTE: erro de build proposital (não fazer merge)"
git push -u origin teste-bloqueio-da-main
```

Abra o PR para a `main` e confira:

- [ ] A verificação `Lint, build e testes de fumaça` falha.
- [ ] O botão de merge fica bloqueado.

Tire um print, cole no cartão da US-03 com uma frase dizendo o que viu, feche o PR sem merge e apague a branch.

## 6. Quadro

Só depois de cada merge, mova o cartão para **Concluído**: SEC-01, US-02, US-03 e US-26. Marque os itens do checklist "Tarefas da Sprint 2 (pendências da Sprint 1)" conforme forem feitos.

Salvo orientação diferente da professora, esses 19 SP entram na velocity da Sprint 2, que é a sprint em que as histórias ficam prontas.
