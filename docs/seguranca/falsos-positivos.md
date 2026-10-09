# Tratamento de Falsos Positivos e Vulnerabilidades

Este documento orienta o tratamento de alertas gerados pela esteira de CI (`gitleaks` e `npm audit`).

## 1. Varredura de Segredos (Gitleaks)

### Quando é falso positivo
- Senha do banco local descartável ou chaves de teste da máquina (`supabase/seed.sql`, testes de fumaça).
- Chaves anônimas públicas do Supabase (que ficam no frontend).
- Textos ou exemplos de documentação que apenas se parecem com chaves reais.

### Quando NÃO é falso positivo
- Chave de serviço (`service_role`), senhas de bancos hospedados ou tokens do GitHub.
- **O que fazer:** Nunca ignorar. Rotacionar a credencial imediatamente conforme `docs/seguranca/rotacao-de-credenciais.md`.

### Como ignorar um falso positivo do Gitleaks
1. Copie o `Fingerprint` indicado no relatório do Gitleaks.
2. Adicione essa linha ao arquivo `.gitleaksignore` na raiz do projeto com um comentário `#`:
   ```text
   # Senha de teste do banco local
   <FINGERPRINT_AQUI>
   Qualquer alteração no .gitleaksignore exige aprovação por Pull Request.