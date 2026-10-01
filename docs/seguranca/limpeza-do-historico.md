# Limpeza do histórico do git (SEC-01)

Faça isso **só depois** de concluir a rotação ([rotacao-de-credenciais.md](rotacao-de-credenciais.md)). O procedimento reescreve todos os commits a partir de 23/06/2026: os hashes mudam e cada integrante precisa clonar o repositório de novo.

## 1. Combinar com a equipe

- Avise no grupo o horário da reescrita.
- Peça que todos façam push do que têm pendente antes e não façam push durante.
- Depois da reescrita, ninguém faz push de clone antigo, porque isso traria os segredos de volta. Quem tiver trabalho local em clone antigo usa `git format-patch` e aplica no clone novo.

## 2. Reescrever

Requer [git-filter-repo](https://github.com/newren/git-filter-repo) (`brew install git-filter-repo`).

Crie **fora do repositório**, em `~/substituicoes.txt`, um arquivo com um segredo por linha, no formato `valor==>***REMOVIDO***`:

```
***REMOVIDO***==>***REMOVIDO***
usuario-de-teste@example.com==>usuario-de-teste@example.com
<project ref do plano de 11/06>==><project-ref>
<chave sb_publishable_ do .env.local.example>==>***REMOVIDO***
<URL do projeto do .env.local.example>==>http://127.0.0.1:54321
```

Rode **um bloco por vez** e só passe para o seguinte se o anterior terminar sem erro. Colar tudo de uma vez faz os comandos seguintes rodarem mesmo quando um falha.

```bash
grep -c . ~/substituicoes.txt     # número de segredos no arquivo; se der 0 ou erro, pare aqui
cd ~
git clone --bare https://github.com/mateustrevisan-ufcspa/camaleao-.git camaleao-limpeza.git
cd camaleao-limpeza.git
git filter-repo --replace-text ~/substituicoes.txt
```

A última linha da saída do `filter-repo` deve ser `Completely finished after ...`. Use `--bare`, e não `--mirror`: o clone espelho traz as referências de Pull Request (`refs/pull/*`), que o GitHub recusa, e deixa o remoto marcado como espelho, o que faz um `git push --tags` apagar no GitHub todas as branches que não existem no clone.

## 3. Verificar antes de publicar

```bash
# Nenhum dos valores deve aparecer em nenhum commit: o resultado tem que ser 0
git log --all -p | grep -c -F -f <(sed -e 's/==>.*//' -e '/^$/d' ~/substituicoes.txt)

# Varredura independente (Docker; não precisa instalar o gitleaks): tem que dar "no leaks found".
# Ela não reconhece senha escrita em Markdown, então não substitui o 0 da linha anterior.
docker run --rm -v "$PWD:/repo" zricethezav/gitleaks:latest git /repo --redact
```

## 4. Publicar

O `filter-repo` remove o `origin`. Recrie o remoto do zero, o que também descarta qualquer configuração de espelho, e publique só as branches e as tags:

```bash
git remote remove origin 2>/dev/null
git remote add origin https://github.com/mateustrevisan-ufcspa/camaleao-.git
git config --get remote.origin.mirror      # não pode imprimir nada
git push --force --all origin
git push --force --tags origin
```

Se a proteção da `main` estiver ativa, desative-a durante o push e reative logo em seguida.

Depois apague o `substituicoes.txt`.

## 5. O que o push não alcança

- **Referências de Pull Request** (`refs/pull/*`) e páginas de commit em cache continuam acessíveis no GitHub. Peça a remoção em <https://support.github.com/contact> ("Remove sensitive data"), informando os hashes antigos `10ec2ec` e `37d0997`.
- **Outros repositórios com o mesmo histórico**, como o `victor-octavio/camaleao-admin`, de onde vieram os PRs, precisam passar pelo mesmo procedimento ou ser apagados pelo dono.
- **Clones e forks de terceiros** não podem ser limpos. É por isso que a rotação vem antes.

## 6. Validação (Bibiana)

Em um clone **novo**, feito depois do push:

```bash
git clone https://github.com/mateustrevisan-ufcspa/camaleao-.git validacao && cd validacao
docker run --rm -v "$PWD:/repo" zricethezav/gitleaks:latest git /repo --redact
```

O resultado esperado é `no leaks found`.
