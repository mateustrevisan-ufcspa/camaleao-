# Proteção da `main` (US-03)

A esteira (`.github/workflows/esteira.yml`) roda lint, build e testes de fumaça a cada Pull Request e a cada push na `main`. Para que ela **bloqueie** o merge, e para exigir a aprovação de outro integrante, quem é dono do repositório precisa ativar uma regra nas configurações do GitHub. O arquivo de workflow sozinho não faz isso.

Como o repositório é público, as regras de proteção são gratuitas. Se ele passar a ser privado, é preciso GitHub Pro, gratuito pelo [GitHub Education](https://education.github.com/).

## Passo a passo

1. Abra **Settings → Rules → Rulesets → New ruleset → New branch ruleset**.
2. **Ruleset name:** `Proteção da main`. **Enforcement status:** *Active*.
3. **Target branches → Add target → Include default branch.**
4. Marque:
   - **Restrict deletions**
   - **Require a pull request before merging**
     - *Required approvals:* **1**
     - **Dismiss stale pull request approvals when new commits are pushed**
     - **Require approval of the most recent reviewable push** (quem fez o último push não aprova o próprio PR)
   - **Require status checks to pass**
     - **Require branches to be up to date before merging**
     - *Add checks* → `Lint, build e testes de fumaça`. A verificação só aparece na busca depois de ter rodado ao menos uma vez, em qualquer PR.
   - **Block force pushes**
5. Deixe **Bypass list** vazia. Na limpeza do histórico da SEC-01, desative a regra só durante o push forçado.
6. **Create**.

## Como validar (Laís)

1. Crie uma branch com um erro proposital, por exemplo uma variável não usada que quebre o lint, ou um texto trocado que quebre um teste de fumaça.
2. Abra o PR. A verificação **Lint, build e testes de fumaça** deve falhar e o botão de merge deve ficar bloqueado.
3. Corrija e faça push. Com a verificação verde, o merge ainda deve exigir a aprovação de outra pessoa.
4. Quando um teste de fumaça falha, o relatório fica em **Actions → execução → Artifacts → relatorio-testes-de-fumaca**.
