# Tratamento de Falsos Positivos e Vulnerabilidades

Este documento orienta o tratamento de alertas gerados pela esteira de CI (`gitleaks` e `npm audit`). As duas verificações rodam em todo Pull Request, como `Varredura de segredos` e `Auditoria de dependências`, e bloqueiam o merge quando falham.

## 1. Varredura de Segredos (Gitleaks)

### Quando é falso positivo
O valor não dá acesso a nada real:
- Senha do banco local descartável (`camaleao-local`) e chaves do Supabase **local**, que só existem no Docker da própria máquina (`supabase/seed.sql`, testes, README).
- Textos ou exemplos de documentação que apenas se parecem com chaves reais.

### Quando NÃO é falso positivo
Qualquer valor que funcione em um serviço hospedado:
- Chave secreta ou `service_role`, senhas de bancos hospedados e tokens do GitHub.
- Chave publicável ou `anon` do projeto hospedado. Ela fica no navegador, mas a equipe a trata como vazada quando aparece no repositório, como foi feito na SEC-01.
- **O que fazer:** nunca ignorar. Rotacionar a credencial imediatamente conforme `docs/seguranca/rotacao-de-credenciais.md`.

### Como ignorar um falso positivo do Gitleaks
1. Copie o `Fingerprint` indicado no relatório do Gitleaks (aba Actions, execução da esteira, job `Varredura de segredos`).
2. Adicione essa linha ao arquivo `.gitleaksignore` na raiz do projeto, uma por linha, com um comentário `#` acima dizendo o que é e por que pode ser ignorado:

   ```text
   # Senha do banco local (supabase/seed.sql): só existe no Docker de cada máquina
   <FINGERPRINT_AQUI>
   ```

## 2. Auditoria de Dependências (npm audit)

A esteira roda `npm audit --audit-level=high --omit=dev`: falha com vulnerabilidade alta ou crítica nas dependências que vão para produção. As de desenvolvimento ficam fora do bloqueio; o motivo e a contagem estão em `docs/seguranca/auditoria-de-dependencias.md`.

### Vulnerabilidade sem correção
1. Tentar `npm audit fix`, ou atualizar o pacote, e rodar `npm run lint`, `npm run build` e `npm run test:fumaca` antes de subir.
2. Se a correção exigir `npm audit fix --force` ou uma versão maior de outro pacote, tratar como história própria no backlog, porque pode quebrar o sistema.
3. Se a correção ainda não existir, registrar em `docs/seguranca/auditoria-de-dependencias.md` o pacote, a severidade, por que não afeta o sistema e a data para rever.

## 3. Quem aprova

- Toda linha nova no `.gitleaksignore` e toda vulnerabilidade aceita sem correção passam por Pull Request, com revisão de outro integrante, como qualquer código.
- A decisão de deixar passar é da equipe, registrada no Pull Request, nunca de uma pessoa sozinha.
