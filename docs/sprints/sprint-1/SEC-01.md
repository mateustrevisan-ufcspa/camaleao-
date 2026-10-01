# SEC-01 · Rotação de credenciais e remoção de segredos do repositório (3 SP)

> Como integrante da equipe, eu quero que nenhuma credencial do projeto esteja versionada no repositório, para que clonar o código não dê acesso ao banco de dados do Instituto.

**Implementa:** Mateus · **Valida e revisa:** Bibiana · **Branch:** `sec-01-rotacao-credenciais`

## O problema

O repositório é público. A linha 21 de `docs/superpowers/plans/2026-06-11-clients-unification.md` tem e-mail e senha de um usuário de teste em texto claro e o identificador do projeto Supabase, e esse conteúdo existe em todo o histórico do git.

Apagar a linha não resolve: forks, clones antigos e páginas de PR já guardaram o texto. **O que protege de fato é trocar a senha e as chaves.** A limpeza do histórico vem depois, para o segredo não continuar à vista.

## Critérios de aceitação

- [ ] Deve rotacionar a senha do usuário de teste e as chaves do Supabase, anônima e de serviço
- [ ] Deve remover os segredos do histórico do git, e não apenas do último commit
- [ ] Deve manter variáveis sensíveis somente em arquivo não versionado e nos segredos do repositório
- [ ] Deve registrar em documento quais chaves foram rotacionadas e em que data

## Passo a passo

### 0. Ferramentas

```bash
brew install git-filter-repo gitleaks
```

### 1. Contenção no painel do Supabase (antes de mexer no git)

Precisa de acesso de dono ao projeto Supabase. Se ele ainda pertence à equipe anterior, peça a quem tem acesso.

1. **Authentication > Users:** troque a senha do usuário de teste citado no plano. Se ninguém usa mais esse usuário, desative ou remova.
2. **Project Settings > API Keys:** gere chaves novas e desative as antigas. Se o projeto ainda usa as chaves legadas (anon e service_role), a rotação é feita trocando o JWT secret, o que invalida as duas de uma vez.
3. Atualize o seu `.env.local` com as chaves novas e avise a equipe para fazer o mesmo.

### 2. Repositório privado

GitHub > Settings > General > Danger Zone > Change visibility > Private.

Atenção para a US-03: proteção de branch em repositório privado exige GitHub Pro, gratuito para estudante pelo [GitHub Education](https://education.github.com/). Peça antes de chegar lá.

### 3. Limpeza do histórico

Crie, **fora do repositório**, um arquivo com o que deve ser substituído. Você digita os valores antigos; este arquivo nunca vai para o git.

```bash
nano ~/segredos-camaleao.txt
```

Conteúdo, uma linha por segredo (o lado esquerdo é o valor antigo exato):

```
<senha antiga do usuário de teste>==>***REMOVIDO***
usuario-de-teste@example.com==>***REMOVIDO***
<identificador do projeto Supabase>==>***REMOVIDO***
```

Reescreva o histórico a partir de um clone espelho, que traz todas as branches:

```bash
cd ~
git clone --mirror https://github.com/mateustrevisan-ufcspa/camaleao-.git camaleao-limpeza.git
cd camaleao-limpeza.git
git filter-repo --replace-text ~/segredos-camaleao.txt
git remote add origin https://github.com/mateustrevisan-ufcspa/camaleao-.git
git push --force --all origin
git push --force --tags origin
```

Depois disso, **todo mundo apaga a cópia local e clona de novo.** Uma cópia antiga que der push devolve o segredo ao histórico.

```bash
cd ~/onde/fica/o/projeto
rm -rf camaleao-
git clone https://github.com/mateustrevisan-ufcspa/camaleao-.git
rm -rf ~/camaleao-limpeza.git ~/segredos-camaleao.txt
```

### 4. Branch da história

```bash
cd camaleao-
git checkout -b sec-01-rotacao-credenciais
```

Na linha 21 do plano de 11/06, que agora mostra `***REMOVIDO***`, deixe só a orientação:

```
- Credenciais de teste: ver `.env.local` (não versionado) ou o usuário criado por `supabase/seed.sql` no banco local.
```

Confira que o `.gitignore` cobre os arquivos de ambiente. Ele já tem `.env*.local`; acrescente também:

```
.env
```

Crie `docs/seguranca/rotacao-credenciais.md` (sem nenhum valor de chave ou senha):

```markdown
# Rotação de credenciais

| Data | O que foi rotacionado | Por quem | Motivo |
| --- | --- | --- | --- |
| DD/10/2026 | Senha do usuário de teste do plano de 11/06 | Mateus | Exposta em repositório público (STRIDE, 25/09) |
| DD/10/2026 | Chaves do Supabase (anônima e de serviço) | Mateus | Mesmo motivo |
| DD/10/2026 | Histórico do git reescrito com git filter-repo | Mateus | Remover os valores expostos |

Valores novos ficam só em `.env.local` e nos segredos do GitHub.
```

```bash
git add -A
git commit -m "SEC-01: remove credenciais do plano e registra a rotação"
git push -u origin sec-01-rotacao-credenciais
```

## Validação (Bibiana)

Em um clone novo, nada do segredo antigo pode aparecer:

```bash
git clone https://github.com/mateustrevisan-ufcspa/camaleao-.git camaleao-teste
cd camaleao-teste
gitleaks git -v                                     # versões antigas: gitleaks detect -v
git log -p --all | grep -c "<trecho da senha antiga>"   # tem que dar 0
```

Anexe a saída do gitleaks ao PR, revise o `rotacao-credenciais.md` e aprove.

## Tarefas no Trello

1. [Mateus] Trocar a senha do usuário de teste e desativá-lo se não for mais usado
2. [Mateus] Rotacionar as chaves do Supabase e atualizar o `.env.local` de cada integrante
3. [Mateus] Tornar o repositório privado até a limpeza do histórico
4. [Mateus] Remover credenciais e identificador do projeto do plano de 11/06
5. [Mateus] Reescrever o histórico com `git filter-repo --replace-text` e publicar com force push
6. [Mateus] Registrar em `docs/seguranca/rotacao-credenciais.md` o que foi rotacionado e quando
7. [Bibiana] Clonar do zero e confirmar com gitleaks que o segredo não aparece no histórico
8. [Bibiana] Revisar e aprovar o Pull Request
