# SEC-06 · Build recusa chave secreta do Supabase (2 SP)

> Como integrante da equipe, eu quero que o build recuse uma chave secreta do Supabase em variável pública ou nos arquivos do site, para que um erro como o de 21/10 pare o deploy, em vez de ir para o ar sem ninguém perceber.

**Tipo:** user story de segurança · **Implementa:** Laís · **Revisa:** Bibiana · **Branch:** `sec-06-build-recusa-chave-secreta` · **Depende de:** nada · **Publica:** quarta 28/10, depois das 22h

## Critérios de aceitação

- [ ] Deve fazer o build falhar, na Vercel e na esteira, quando uma variável `NEXT_PUBLIC_` tiver chave secreta do Supabase
- [ ] Deve reprovar a esteira quando os arquivos gerados pelo build (`.next/static`) tiverem chave secreta, sem imprimir a chave no log
- [ ] Deve provar o bloqueio: build local com chave falsa e Pull Request de prova fechado sem merge
- [ ] Deve documentar em `docs/seguranca` a checagem e o que fazer quando ela falhar

## O problema

Em 21/10, a variável `NEXT_PUBLIC_SUPABASE_ANON_KEY` de produção, na Vercel, guardava uma chave **secreta** (`sb_secret_...`). Toda variável `NEXT_PUBLIC_` vai para os arquivos que o navegador baixa, e a chave secreta passa por cima das regras de acesso do banco. O incidente foi contido na madrugada de 22/10 (registro no `PROGRESSO.md` da Sprint 4).

A ideia anotada na Sprint 4 era um passo na esteira procurando a chave nos arquivos do build. **Sozinho, esse passo não pegaria o incidente:** a esteira faz o build com o `.env.local` do banco local (`npm run env:local`), e nunca vê as variáveis da Vercel. Quem faz o build com as variáveis de produção é a própria Vercel.

Por isso a story tem duas barreiras:

1. **No `next.config.mjs`:** o arquivo é lido em todo `next build`, inclusive na Vercel. Se uma variável `NEXT_PUBLIC_` tiver chave secreta, o build para com erro. Na Vercel, build com erro não publica nada: o deploy anterior continua no ar.
2. **Na esteira:** depois do build, um passo procura o formato de chave secreta em `.next/static`. Pega o caso de alguém escrever uma chave no código de uma tela.

## 1. Branch

```bash
git checkout main && git pull
git checkout -b sec-06-build-recusa-chave-secreta
git push -u origin sec-06-build-recusa-chave-secreta
```

## 2. `next.config.mjs`

Substitua o arquivo inteiro:

```js
// SEC-06 · O build recusa chave secreta do Supabase em variável pública.
// Variável NEXT_PUBLIC_ vai para os arquivos que o navegador baixa. Em 21/10 a
// variável da chave anônima, na Vercel, recebeu uma chave secreta, e ela foi
// publicada no site. Este arquivo é lido em todo build, inclusive na Vercel: com
// chave secreta em variável pública, o build para e o deploy anterior continua no ar.
// Detalhes em docs/seguranca/chave-secreta-no-build.md.
import { Buffer } from 'node:buffer'

function ehChaveSecreta(valor) {
  if (valor.includes('sb_secret_')) return true
  // Chave antiga em formato JWT (desativadas desde 05/10): a de serviço traz role "service_role".
  const partes = valor.split('.')
  if (partes.length !== 3) return false
  try {
    return JSON.parse(Buffer.from(partes[1], 'base64url').toString('utf8')).role === 'service_role'
  } catch {
    return false
  }
}

const publicasComSegredo = Object.entries(process.env)
  .filter(([nome, valor]) => nome.startsWith('NEXT_PUBLIC_') && typeof valor === 'string' && ehChaveSecreta(valor))
  .map(([nome]) => nome)

if (publicasComSegredo.length > 0) {
  // Só o nome da variável aparece no erro; o valor nunca vai para o log.
  throw new Error(
    `Chave secreta do Supabase em variável pública (${publicasComSegredo.join(', ')}). ` +
      'Use a chave publicável (sb_publishable_...). Veja docs/seguranca/chave-secreta-no-build.md.',
  )
}

/** @type {import('next').NextConfig} */
const nextConfig = {}

export default nextConfig
```

A checagem roda também no `npm run dev`, o que é bom: ninguém trabalha com a chave errada no `.env.local` sem perceber.

## 3. `.github/workflows/esteira.yml`

No job `verificacao`, logo depois do passo **Build** e antes de **Instalar navegador dos testes**:

```yaml
      - name: Nenhuma chave secreta nos arquivos do site (SEC-06)
        # -l lista só o nome do arquivo: a chave nunca aparece no log, que é público.
        run: |
          if grep -rlE 'sb_secret_[A-Za-z0-9_-]{20,}' .next/static; then
            echo "::error::Chave secreta do Supabase nos arquivos que o navegador baixa (.next/static). Veja docs/seguranca/chave-secreta-no-build.md."
            exit 1
          fi
          echo "Nenhuma chave secreta em .next/static."
```

Por que `{20,}` depois do prefixo: a biblioteca do Supabase tem o texto `sb_secret_` dentro dela, porque confere o prefixo das chaves (conferido no incidente de 22/10). Exigir pelo menos 20 caracteres de chave depois do prefixo deixa esse texto de fora.

## 4. `docs/seguranca/chave-secreta-no-build.md` (arquivo novo)

```markdown
# Chave secreta no build (SEC-06)

## O que é checado

- **Em todo `next build` e `next dev`** (`next.config.mjs`): nenhuma variável `NEXT_PUBLIC_` pode ter chave secreta do Supabase (`sb_secret_...`, ou chave antiga em formato JWT com o papel `service_role`). Vale na Vercel, na esteira e na máquina de cada pessoa.
- **Na esteira, depois do build:** nenhum arquivo de `.next/static` pode ter o formato de uma chave secreta (`sb_secret_` seguido de 20 ou mais caracteres).

## Por quê

Em 21/10 a variável `NEXT_PUBLIC_SUPABASE_ANON_KEY` de produção, na Vercel, recebeu uma chave secreta, que foi publicada no site. Registro completo no `PROGRESSO.md` da Sprint 4.

## Se o build falhar por isso

1. **Não** tire a checagem para o build passar.
2. Veja qual variável o erro aponta. Na Vercel: Settings, Environment Variables, nos ambientes Production e Preview.
3. Troque o valor pela chave **publicável** do projeto (Supabase, Project Settings, API Keys, `sb_publishable_...`).
4. Se a chave secreta chegou a ser publicada em algum deploy, trate como incidente: apague a chave no Supabase, crie outra se precisar e registre no `PROGRESSO.md` da sprint.
5. Faça um deploy novo e confira o login.

## Se a esteira falhar no passo "Nenhuma chave secreta nos arquivos do site"

O log mostra só o nome do arquivo. Procure no código uma chave escrita à mão (`grep -rn "sb_secret_" app components lib actions`), tire do código e, se a chave for real, apague-a no Supabase.

## Prova de bloqueio

Registrada no `PROGRESSO.md` da Sprint 5 (data, comando e resultado).
```

## 5. Prova de bloqueio

**a) Build local com chave falsa.** A chave abaixo é inventada; não use nenhuma chave real.

```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_secret_prova_de_bloqueio_0000000000000000 npm run build
```

Resultado esperado: o build para com a mensagem "Chave secreta do Supabase em variável pública (NEXT_PUBLIC_SUPABASE_ANON_KEY)", e o valor não aparece na saída. Depois, `npm run build` sem a variável na frente passa normalmente.

> Se o build passar com a chave falsa, a variável da linha de comando não chegou ao `next.config.mjs` antes do `.env.local`. Nesse caso, anote no `PROGRESSO.md` e teste trocando o valor dentro do `.env.local` (e volte o valor depois com `npm run env:local -- --force`).

**b) Pull Request de prova para o passo da esteira.** Numa branch separada, a partir da sua:

```bash
git checkout -b sec-06-prova-de-bloqueio
```

Num componente de tela qualquer (por exemplo, `components/ui/card.tsx`), acrescente uma constante usada, para o build não descartar o texto:

```tsx
// PROVA DA SEC-06: chave inventada, este PR é fechado sem merge.
export const PROVA_SEC06 = 'sb_secret_prova_de_bloqueio_0000000000000000'
```

E use `PROVA_SEC06` em algum lugar da tela (por exemplo, num `data-prova={PROVA_SEC06}` dentro do componente), para ela ir para `.next/static`. Faça commit, push e abra o PR como rascunho com o título `SEC-06 · prova de bloqueio (não integrar)`. A esteira tem de ficar vermelha no passo "Nenhuma chave secreta nos arquivos do site". Se a varredura de segredos (gitleaks) também reclamar, anote: é a outra barreira funcionando.

Feche o PR sem merge e apague a branch:

```bash
git checkout sec-06-build-recusa-chave-secreta
git push origin --delete sec-06-prova-de-bloqueio
git branch -D sec-06-prova-de-bloqueio
```

Registre no `PROGRESSO.md` os dois resultados, com o número do PR de prova.

## 6. Conferir

```bash
npm run lint
npm run build
```

E, na esteira do PR de verdade, o passo novo verde com a mensagem "Nenhuma chave secreta em .next/static."

## 7. Pull Request

Título: `SEC-06 · Build recusa chave secreta do Supabase`, com os critérios no corpo e o link do PR de prova. PR pronto na quarta 28/10; a Bibiana revisa no mesmo dia.

**Merge:** quarta 28/10, depois das 22h, com o aviso no grupo das avaliadoras. Este merge também faz deploy, porque muda o `next.config.mjs`. Depois do deploy, confira na Vercel que o build passou (a produção tem só a chave publicável) e entre no sistema com qualquer conta de conferência.

Sem migração.
