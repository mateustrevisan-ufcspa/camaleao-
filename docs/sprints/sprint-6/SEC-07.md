# SEC-07 · Vulnerabilidades altas nas dependências de desenvolvimento (3 SP)

> Como equipe, queremos zerar as vulnerabilidades altas das dependências de desenvolvimento, para que a auditoria da esteira possa reprovar também essas, e não só as de produção.

**Tipo:** segurança (persona: a equipe; soma com as technical stories na velocity) · **Implementa:** Laís · **Revisa:** Alissa · **Branch:** `sec-07-dependencias-de-desenvolvimento` · **Depende de:** nada · **Publica:** quarta 04/11, à noite, **primeiro merge da noite**

## Critérios de aceitação

- [ ] `npm audit` sem vulnerabilidade alta ou crítica, também nas dependências de desenvolvimento
- [ ] A esteira passa a auditar também as dependências de desenvolvimento (sem o `--omit=dev`)
- [ ] Lint, build e testes de fumaça e de acesso verdes depois das atualizações
- [ ] Alertas do Dependabot ligados no repositório e `docs/seguranca/auditoria-de-dependencias.md` atualizado

## O que já existe

Desde a SEC-02 (09/10), a esteira roda:

```yaml
      # Só as dependências que vão para produção. As de desenvolvimento ficam fora
      # do bloqueio; motivo em docs/seguranca/auditoria-de-dependencias.md (SEC-02).
      - name: npm audit (falha com vulnerabilidade alta ou crítica em produção)
        run: npm audit --audit-level=high --omit=dev
```

O documento registra 9 vulnerabilidades em 09/10 (2 moderadas e 7 altas), todas em ferramentas de desenvolvimento, e diz que parte delas "só se corrige com `npm audit fix --force`, que, por exemplo, troca o Tailwind CSS para a versão 4". O relatório da Sprint 5 cita as 7 altas, sem cartão até 30/10.

As dependências de desenvolvimento de hoje (`package.json`): `@playwright/test`, `@types/*`, `autoprefixer`, `eslint` 9, `eslint-config-next` 16, `fflate`, `postcss` 8, `tailwindcss` 3 e `typescript` 5. **A lista de 30/10 não foi conferida com `npm audit`** (nenhum comando foi rodado no planejamento); a contagem pode ter mudado desde 09/10.

## Por que entra cedo na semana

Atualizar dependência troca o `package-lock.json` e pode quebrar lint, build ou testes. Integrada na quarta, antes dos 24 SP de quinta, qualquer quebra aparece cedo, e os PRs de quinta já rodam com as dependências novas.

## 1. Branch

```bash
git checkout main && git pull
git checkout -b sec-07-dependencias-de-desenvolvimento
git push -u origin sec-07-dependencias-de-desenvolvimento
```

## 2. Levantamento (terça 03/11)

```bash
npm ci
npm audit
npm audit --omit=dev
```

Para cada vulnerabilidade alta ou crítica da primeira saída, descubra quem a traz e qual versão corrige:

```bash
npm ls NOME-DO-PACOTE
npm view NOME-DO-PACOTE versions --json | tail -20
```

Monte a tabela no PR (e depois no documento, Parte 5):

| Pacote | Severidade | Trazido por | Versão instalada | Versão que corrige | Caminho |
| --- | --- | --- | --- | --- | --- |
| | | | | | `audit fix`, atualização da direta, `overrides` ou versão maior |

## 3. Correção, um commit por pacote

Na ordem, do mais seguro para o mais arriscado. **Depois de cada passo, rode `npm run lint`, `npm run build`, `npm run test:fumaca` e `npm run test:acesso`** (com o banco local ligado e `npm run env:local` feito), e só então faça o commit.

**3.1 · `npm audit fix`, sem `--force`.** Atualiza dentro das faixas do `package.json`.

```bash
npm audit fix
git add package-lock.json package.json
git commit -m "SEC-07: npm audit fix sem mudança de versão maior"
```

**3.2 · Dependência direta de desenvolvimento, dentro da mesma versão maior.** Se a vulnerabilidade vem de uma direta (por exemplo, `eslint-config-next` ou `@playwright/test`) e há versão nova na mesma linha:

```bash
npm install -D NOME-DA-DIRETA@^VERSAO-MAIOR-ATUAL
git add package-lock.json package.json
git commit -m "SEC-07: NOME-DA-DIRETA na versão X.Y.Z"
```

Para `eslint-config-next`, mantenha a mesma versão do `next` (16.x); para `@playwright/test`, a versão nova pode pedir `npx playwright install` na esteira (confira o passo da esteira).

**3.3 · Transitiva sem atualização da direta: `overrides`.** Quando a direta ainda não saiu com a correção, mas a transitiva tem versão corrigida compatível, fixe a transitiva no `package.json`:

```json
{
  "overrides": {
    "NOME-DA-TRANSITIVA": "^VERSAO-QUE-CORRIGE"
  }
}
```

```bash
npm install
npm ls NOME-DA-TRANSITIVA      # todas as cópias na versão nova
git add package-lock.json package.json
git commit -m "SEC-07: override de NOME-DA-TRANSITIVA para VERSAO"
```

Explique cada `override` no documento (Parte 5): quem traz, por que não deu para atualizar a direta e quando dá para tirar.

**3.4 · Versão maior.** Só se for pequena e os testes passarem. **O Tailwind CSS 4 não entra nesta story:** muda a configuração e as classes de todas as telas. Se a única correção de uma vulnerabilidade for uma versão maior grande, pare e leve à conferência do meio da sprint (quarta, com a Laís e o Mateus). As saídas são: a story volta ao backlog com o que já foi corrigido integrado e a esteira como está; ou a equipe registra a exceção no documento, com a justificativa, e o critério 1 fica marcado como não cumprido no relatório.

## 4. Esteira: auditar também as de desenvolvimento

Só depois de `npm audit` sem alta nem crítica. Em `.github/workflows/esteira.yml`:

```diff
-      # Só as dependências que vão para produção. As de desenvolvimento ficam fora
-      # do bloqueio; motivo em docs/seguranca/auditoria-de-dependencias.md (SEC-02).
-      - name: npm audit (falha com vulnerabilidade alta ou crítica em produção)
-        run: npm audit --audit-level=high --omit=dev
+      # Todas as dependências, de produção e de desenvolvimento (SEC-07). Histórico
+      # em docs/seguranca/auditoria-de-dependencias.md.
+      - name: npm audit (falha com vulnerabilidade alta ou crítica)
+        run: npm audit --audit-level=high
```

```bash
git add .github/workflows/esteira.yml
git commit -m "SEC-07: esteira audita também as dependências de desenvolvimento"
```

## 5. Documento: `docs/seguranca/auditoria-de-dependencias.md`

Seção nova no fim:

```markdown
## SEC-07: dependências de desenvolvimento (Sprint 6)

| Momento | Tudo (`npm audit`) | Só produção (`--omit=dev`) |
|---|---|---|
| DATA, antes | N (... altas) | 0 |
| DATA, depois | 0 altas e 0 críticas | 0 |

| Pacote | Severidade | Trazido por | Antes | Depois | Como |
|---|---|---|---|---|---|
| | | | | | |

**Overrides em `package.json`:** (um por linha: pacote, motivo, quando tirar; ou "nenhum").

**Decisão:** a esteira passa a bloquear vulnerabilidade alta ou crítica em todas as dependências (`npm audit --audit-level=high`). Vulnerabilidade nova numa ferramenta de desenvolvimento passa a travar os PRs até ser corrigida; quem encontrar abre um cartão SEC no Trello no mesmo dia.

**Dependabot:** alertas ligados em DATA pelo Mateus (Settings, Security, "Dependabot alerts"). Os alertas chegam ao dono do repositório e aparecem na aba Security.
```

E no parágrafo de decisão da SEC-02, uma frase no fim: "Substituída pela SEC-07 em DATA: a esteira passou a auditar todas as dependências."

```bash
git add docs/seguranca/auditoria-de-dependencias.md
git commit -m "SEC-07: registro da auditoria das dependências de desenvolvimento"
git push
```

## 6. Dependabot (Mateus)

Só o dono do repositório consegue. No GitHub, no repositório `camaleao-`: Settings, "Code security" (ou "Security"), **Dependabot alerts: Enable**. "Dependabot security updates" (PRs automáticos de correção) fica desligado nesta story: abriria PRs fora da janela de merge da noite. Registre a data no documento e no `PROGRESSO.md`.

## Conferir

```bash
npm ci
npm audit
npm run lint
npm run build
npm run db:reset
npm run test:fumaca
npm run test:acesso
```

A Alissa, na revisão, roda `npm ci` e `npm audit` na branch dela, e o build local, e escreve no PR o resultado do `npm audit` (só as contagens).

Na tela, depois do merge: o deploy da Vercel termina sem erro e as telas abrem (login, brechó, doações, relatórios) com a conta da coordenação.

## Pull Request

Título: `SEC-07 · Vulnerabilidades altas nas dependências de desenvolvimento`, com os critérios no corpo e a tabela da Parte 2. PR pronto até quarta 04/11 às 18h.

**Integração, quarta 04/11, à noite, antes de todos os outros merges:** merge, espera do deploy e conferência das telas. Aviso no grupo da equipe: "SEC-07 na `main`: tragam a `main` (`git fetch && git merge origin/main`) e rodem `npm ci` antes de continuar". Registrar no `PROGRESSO.md`.

## Fora desta story

- Tailwind CSS 4 e outras mudanças de versão maior grandes: cartão próprio, se for preciso.
- PRs automáticos do Dependabot ("security updates" e "version updates"): podem entrar depois, combinando a janela de merge.
- Vulnerabilidade moderada ou baixa: a esteira continua só com alta e crítica.
