# SEC-02 · Varredura de segredos e auditoria de dependências na esteira (2 SP)

> Como integrante da equipe, eu quero que a esteira recuse um commit com segredo exposto ou dependência vulnerável, para que um erro humano não se transforme em incidente de segurança.

**Implementa:** Bibiana · **Revisa:** Mateus · **Branch:** `sec-02-varredura-auditoria` · **Depende de:** fila de merges da Sprint 1 concluída (a esteira e o Next.js 16 precisam estar na `main`)

## Critérios de aceitação

- [ ] Deve rodar varredura de segredos em todo Pull Request
- [ ] Deve rodar auditoria de dependências e falhar diante de vulnerabilidade alta
- [ ] Deve bloquear o merge quando qualquer das duas verificações falhar
- [ ] Deve documentar como tratar um falso positivo

## Decisões

- **gitleaks pela ação oficial** (`gitleaks/gitleaks-action`). É a mesma ferramenta que você usou na validação da SEC-01, agora rodando sozinha. O repositório é de conta pessoal, então a ação não pede licença.
- **`npm audit --audit-level=high`.** Falha com vulnerabilidade alta ou crítica e deixa passar as baixas e moderadas, que ficam para acompanhamento.
- **Dois jobs separados do job que já existe.** Cada um vira uma verificação com nome próprio no Pull Request, e dá para ver de longe qual falhou.

## 1. Branch

```bash
git checkout main && git pull
git checkout -b sec-02-varredura-auditoria
```

## 2. Dois jobs novos em `.github/workflows/esteira.yml`

Abra o arquivo. Ele termina no job `verificacao`. Acrescente os dois jobs abaixo **no fim do arquivo**, alinhados com `verificacao:` (dois espaços de recuo). YAML é sensível a recuo: use espaços, nunca tab.

```yaml
  segredos:
    name: Varredura de segredos
    runs-on: ubuntu-latest
    timeout-minutes: 10
    permissions:
      contents: read
      pull-requests: read
    steps:
      - uses: actions/checkout@v5
        with:
          fetch-depth: 0   # histórico completo: o segredo pode estar em um commit antigo

      - name: gitleaks
        uses: gitleaks/gitleaks-action@v3
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GITLEAKS_ENABLE_COMMENTS: false

  dependencias:
    name: Auditoria de dependências
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v5

      - uses: actions/setup-node@v5
        with:
          node-version-file: .nvmrc

      - name: npm audit (falha com vulnerabilidade alta ou crítica)
        run: npm audit --audit-level=high
```

O `GITHUB_TOKEN` é criado pelo próprio GitHub a cada execução. Não é preciso cadastrar nenhum segredo.

## 3. Conferir na sua máquina antes de subir

```bash
npm audit --audit-level=high
```

Tem que terminar com `found 0 vulnerabilities` ou só com vulnerabilidades baixas e moderadas. Se aparecer alta, pare e avise o Mateus antes de abrir o PR.

Para o gitleaks, o mesmo comando da SEC-01:

```bash
docker run --rm -v "$PWD:/repo" zricethezav/gitleaks:latest git /repo --redact
```

Se ele acusar a senha do banco local (`supabase/seed.sql`, `tests/fumaca/apoio.ts` ou o README), isso é um falso positivo de verdade: é uma senha que só existe no banco descartável da sua máquina. Trate como descrito no documento do passo 4 e registre lá.

## 4. `docs/seguranca/falsos-positivos.md`

Arquivo novo, escrito por você. Estrutura sugerida:

1. **Quando é falso positivo.** O valor não dá acesso a nada real: senha do banco local, chave de exemplo de documentação, texto que só parece chave.
2. **Quando não é.** Qualquer valor que funcione em um serviço hospedado. Nesse caso não se ignora: rotaciona-se a credencial, como em `rotacao-de-credenciais.md`.
3. **Como ignorar um achado do gitleaks.** O relatório mostra um `Fingerprint` para cada achado. Cole essa linha no arquivo `.gitleaksignore`, na raiz do projeto, uma por linha, com um comentário `#` acima dizendo o que é e por que pode ser ignorado.
4. **Vulnerabilidade de dependência sem correção.** Primeiro tentar `npm audit fix` ou atualizar o pacote. Se a correção ainda não existe, registrar em `docs/seguranca/auditoria-de-dependencias.md` o pacote, a severidade, por que não afeta o sistema e a data para rever. Quem decide deixar passar é a equipe, no Pull Request, nunca uma pessoa sozinha.
5. **Quem aprova.** Toda linha nova no `.gitleaksignore` passa por revisão como qualquer código.

Escreva com as suas palavras e com o que você viu ao rodar as ferramentas. Se o passo 3 acusou alguma coisa, use como exemplo real.

## 5. Pull Request

```bash
git add -A
git commit -m "SEC-02: varredura de segredos e auditoria de dependências na esteira"
git push -u origin sec-02-varredura-auditoria
```

Abra o PR para a `main` com o título `SEC-02 · Varredura de segredos e auditoria de dependências na esteira`. Devem aparecer três verificações: `Lint, build e testes de fumaça`, `Varredura de segredos` e `Auditoria de dependências`. As três precisam ficar verdes.

## 6. Provar que bloqueia

Uma verificação que nunca falhou não prova nada. Abra um segundo PR, de teste, com um segredo falso.

```bash
git checkout sec-02-varredura-auditoria
git checkout -b teste-segredo-falso
node -e "console.log('ghp_' + require('crypto').randomBytes(18).toString('hex'))"
```

O último comando imprime um texto com o formato de um token do GitHub, gerado na hora, que não dá acesso a nada. Crie o arquivo `teste-segredo.txt` na raiz com esta linha, trocando `COLE_AQUI` pelo texto impresso:

```
token = "COLE_AQUI"
```

```bash
git add teste-segredo.txt
git commit -m "TESTE: segredo falso proposital (não fazer merge)"
git push -u origin teste-segredo-falso
```

Abra o PR **com base em `sec-02-varredura-auditoria`** e confira que `Varredura de segredos` falha. Tire um print, cole no PR da SEC-02 e no cartão, feche o PR de teste sem merge e apague a branch `teste-segredo-falso`.

Não escreva o token falso neste guia nem em nenhum outro arquivo versionado: a varredura passaria a falhar em todos os Pull Requests.

## Revisão (Mateus)

1. Ler o diff de `esteira.yml` e o `falsos-positivos.md`.
2. Conferir o print da verificação vermelha no PR de teste.
3. Aprovar. Depois do merge, em **Settings → Rules → Rulesets → Proteção da main → Require status checks**, acrescentar `Varredura de segredos` e `Auditoria de dependências` como obrigatórias. É isso que cumpre o terceiro critério.

## Tarefas no Trello

1. [Bibiana] Criar a branch `sec-02-varredura-auditoria` a partir da `main` atualizada
2. [Bibiana] Adicionar na esteira a varredura de segredos com gitleaks em todo Pull Request
3. [Bibiana] Adicionar na esteira o passo `npm audit --audit-level=high`
4. [Bibiana] Escrever `docs/seguranca/falsos-positivos.md`
5. [Bibiana] Abrir o Pull Request e provar o bloqueio com um PR de teste com segredo falso
6. [Mateus] Incluir as duas verificações novas como obrigatórias na regra de proteção da `main`
7. [Mateus] Revisar e aprovar o Pull Request
