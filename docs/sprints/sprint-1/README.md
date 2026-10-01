# Sprint 1 · 25/09 a 02/10/2026

**Objetivo:** fechar o que a modelagem de ameaças apontou como urgente e poder evoluir o sistema sem quebrar o que funciona.

**Compromisso:** 21 Story Points em 5 histórias, dentro da velocity projetada de cerca de 21 SP por sprint.

Quadro: [Trello · Camaleão Admin](https://trello.com/b/2iMIPtF4), lista "Selecionado · Sprint 1 (25/09 a 02/10) · 21 SP".

## Histórias, na ordem de execução

| Ordem | Arquivo | História | SP | Implementa | Valida e revisa |
| --- | --- | --- | --- | --- | --- |
| 1 | [SEC-01.md](SEC-01.md) | Rotação de credenciais e remoção de segredos | 3 | Mateus | Bibiana |
| 2 | [US-01.md](US-01.md) | Documentação de instalação | 2 | Mateus | Alissa |
| 3 | [US-02.md](US-02.md) | Testes de fumaça das rotas críticas | 5 | Mateus | Laís |
| 4 | [US-03.md](US-03.md) | Esteira de integração contínua | 3 | Mateus | Laís |
| 5 | [US-26.md](US-26.md) | Dependências com suporte de segurança ativo | 8 | Mateus | Alissa |

## Por que essa ordem

1. **SEC-01 primeiro e antes de abrir qualquer outra branch.** A reescrita do histórico muda todos os commits; branch criada antes dela fica presa ao histórico antigo e precisa ser refeita.
2. **US-01 cria o banco local e o usuário de teste**, que a US-02 usa.
3. **US-02 antes da US-03**, porque a esteira roda os testes de fumaça.
4. **US-26 por último**, porque a migração do Next.js só é segura com testes e esteira funcionando.

## Fluxo de cada história

```bash
git checkout main && git pull
git checkout -b us-02-testes-fumaca        # branch com o ID da história
# ... implementa seguindo o arquivo da história ...
git add -A
git commit -m "US-02: configura Playwright e teste de login"
git push -u origin us-02-testes-fumaca
```

No GitHub, abra o Pull Request com o título `US-02 · Testes de fumaça das rotas críticas` e cole no corpo o checklist de critérios do arquivo da história. No Trello, mova o cartão para **Em revisão**. A revisora testa, aprova, e você faz o merge; o cartão vai para **Concluído** só com todos os critérios marcados.

Dica: ative o Power-Up do GitHub no quadro do Trello. Ele anexa o PR ao cartão, o que vira evidência para o relatório e para os vídeos.

## Definição de Pronto

- [ ] Todos os critérios de aceitação marcados no cartão
- [ ] Código revisado e aprovado por outro integrante
- [ ] Esteira verde (a partir da US-03)
- [ ] Funcionalidade verificada por quem revisou

## Fim da sprint (02/10)

- [ ] Cada cartão em Concluído ou devolvido ao topo do Backlog do Produto
- [ ] Relatório: situação de cada história, velocity (só histórias concluídas), desvios, revisão e retrospectiva
- [ ] Coluna "Executado" do relatório preenchida com o que cada pessoa fez
- [ ] Vídeos individuais gravados
