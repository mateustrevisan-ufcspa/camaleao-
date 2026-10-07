# Sprint 2 · progresso

**Período:** 03/10 a 09/10/2026 · **Situação:** em andamento · **Atualizado em:** 07/10/2026 (conferido no GitHub e no Trello)

Plano da sprint: [README.md](README.md).

## Resumo

- **Fechamento da Sprint 1 concluído.** Os PRs #2 a #6 entraram na `main` em 06/10, a `main` está protegida desde 06/10 às 22h06 e o bloqueio foi provado pela Laís em 07/10 (PR #10). Os 19 SP pendentes estão em Concluído no Trello.
- **US-23 em andamento.** Parte A (matriz) e Parte B (banco e servidor) prontas no PR #9, em rascunho e com a esteira verde. Falta a Parte C (telas), a validação de segurança e o merge.
- **SEC-02 não iniciada**, com um dia de atraso em relação ao calendário (PR previsto para 06/10). Vai começar com a auditoria de dependências vermelha (veja Pontos de atenção).
- **SEC-03 não iniciada.** Já pode começar, a partir da branch da US-23.
- **Próximo passo de quem:** Bibiana (SEC-02), Alissa (Parte C da US-23), Laís (SEC-03), Mateus (envio da matriz à Flávia).

## Fechamento da Sprint 1 (19 SP)

Guia: [FECHAMENTO-SPRINT-1.md](FECHAMENTO-SPRINT-1.md). Ordem dos merges: #2, #3, #4, #5, #6.

| História | SP | PR | Situação em 07/10 | Falta | Quem |
| --- | --- | --- | --- | --- | --- |
| SEC-01 | 3 | #2 | Integrado em 06/10, 09h36. Registro de rotação com datas; aprovado por Alissa (05/10) e Bibiana (05/10, 22h39) | Nada | Mateus, Bibiana |
| US-01 | 2 | #3 | Integrado em 06/10, 21h42. Aprovado pela Alissa (06/10) | Nada | Alissa, Mateus |
| US-02 | 5 | #4 | Integrado em 06/10, 21h42. Aprovado pela Laís (02/10) | Nada | Mateus |
| US-03 | 3 | #5 | Integrado em 06/10, 21h42. Aprovado por Laís (02/10) e Alissa (05/10). Proteção da `main` ativa e bloqueio provado | Nada | Mateus, Laís |
| US-26 | 8 | #6 | Integrado em 06/10, 22h01. Aprovado pela Alissa (06/10, 22h00), depois de duas revisões enviadas como comentário | Nada | Alissa, Mateus |

Outros itens do fechamento:

- [x] Proteção da `main` ativa (regra "Proteção da main", 06/10 às 22h06)
- [x] PRs de teste #7 e #8 fechados (07/10)
- [x] Novo PR de teste contra a `main` mostrando o merge bloqueado (PR #10, 07/10, print no cartão da US-03)
- [x] Cartões SEC-01, US-02, US-03 e US-26 em Concluído, cada um depois do seu merge

A regra de proteção da `main` exige: 1 aprovação, aprovação derrubada quando entra commit novo, aprovação do último push por outra pessoa, verificação `Lint, build e testes de fumaça` verde com a branch atualizada, sem exclusão da `main` e sem push forçado. Lista de exceções vazia.

## Histórias novas (15 SP)

| História | SP | Implementa | Revisa | Branch | PR | Situação |
| --- | --- | --- | --- | --- | --- | --- |
| [SEC-02](SEC-02.md) · Varredura de segredos e auditoria na esteira | 2 | Bibiana | Mateus | `sec-02-varredura-auditoria` | | Não iniciada. Desbloqueada desde 06/10 |
| [US-23](US-23.md) · Permissões por perfil | 8 | Mateus e Alissa | Bibiana | `us-23-permissoes-por-perfil` | #9 (rascunho) | Em andamento. Partes A e B prontas, esteira verde |
| [SEC-03](SEC-03.md) · Testes de controle de acesso | 5 | Laís | Alissa | `sec-03-testes-de-acesso` | | Não iniciada. Já pode começar a partir da branch da US-23 |

### US-23 por parte

- [x] Parte A: matriz de permissões em `docs/seguranca/matriz-de-permissoes.md` (Alissa, 06/10). Igual à proposta do guia, mais uma decisão em aberto (como o balcão corrige um lançamento errado)
- [ ] Matriz enviada à Flávia; planilha do brechó pedida (Mateus). Mensagem escrita em 07/10, envio a confirmar
- [x] Parte B: migração, seeds por perfil, login e `proxy.ts` (Mateus, 06/10, commit `d216f47`)
- [ ] Parte C: menu e painel por perfil (Alissa)
- [ ] Teste à mão dos três perfis, linha por linha da matriz (Alissa)
- [ ] Validação de segurança pela API (Bibiana)
- [ ] Migração aplicada no Supabase de produção, depois do merge e da consulta de quem ficaria sem acesso (Mateus)

Verificação da Parte B na máquina do Mateus (06/10): `db:reset` com a migração nova, lint, build e 5 de 5 testes de fumaça verdes. Conferência no banco simulando cada perfil:

| Perfil | `auth_role()` | Vendas | Clientes | Usuários |
| --- | --- | --- | --- | --- |
| Caixa | `cashier` | 1 (a lançada no dia pelos testes) | 8 | 1 |
| Coordenação | `admin` | 13 | 8 | 4 |
| Desativada | nulo | 0 | 0 | 1 (a própria linha) |

A caixa tentando desativar a categoria "blusa": `UPDATE 0`.

## Pontos de atenção

- **`npm audit` com 8 vulnerabilidades altas.** Em 06/10, `npm ci` acusou 10 (2 moderadas e 8 altas), contra 0 quando a US-26 foi feita (01/10). No que vai para produção há 1 alta (`source-map-js`), com correção por `npm audit fix`. A SEC-02 coloca `npm audit --audit-level=high` na esteira, que vai falhar enquanto isso não for corrigido. Proposta: corrigir no próprio PR da SEC-02 e registrar em `docs/seguranca/auditoria-de-dependencias.md`.
- **O lint não pega variável não usada.** A Laís registrou em 02/10 que o PR #7 (variável não usada de propósito) passou na esteira. Em 07/10 confirmou-se a causa: `eslint.config.mjs` usa só as regras `core-web-vitals` do Next, sem as de TypeScript. Corrigir exige acrescentar `eslint-config-next/typescript` e tratar o que ele acusar no código atual. Proposta: item novo no backlog, fora desta sprint.
- **Calendário apertado.** SEC-02 e SEC-03 ainda não começaram e a sprint termina em 09/10. Se a US-23 não entrar na `main` até quinta, a SEC-03 é a primeira candidata a passar para a Sprint 3.
- **Produção.** A migração da US-23 não pode ir para o Supabase hospedado antes da aprovação do PR #9. Antes de aplicar, rodar a consulta da seção B8 do guia: quem não tiver linha ativa em `public.users` perde o acesso.
- **Decisões que esperam a Flávia:** balcão enxergar só o dia, voluntária e caixa com as mesmas permissões, Financeiro só da coordenação, balcão corrigir cadastro, correção de lançamento errado. Até a resposta, vale a matriz.
- **Divergência entre documento e fato:** a matriz diz "enviada à Flávia pelo Mateus", mas em 07/10 o envio ainda não estava confirmado.
- **Estimativas da sprint** (SEC-02 em 2, US-23 em 8, SEC-03 em 5) foram propostas no planejamento e ainda não foram confirmadas pela equipe.

## Decisões

| Data | Decisão |
| --- | --- |
| 04/10 | Sprint 2 com três histórias novas (SEC-02, US-23, SEC-03), 15 SP. SEC-05 e US-07 ficam para a Sprint 3 |
| 04/10 | Cada integrante implementa uma parte, com revisão cruzada |
| 04/10 | Todo Pull Request tem a `main` como base; cartão só vai para Concluído depois do merge |
| 04/10 | As pendências da Sprint 1 contam na velocity da Sprint 2, salvo orientação diferente da professora |
| 05/10 | O usuário de teste do plano de 11/06 foi apagado, em vez de ter a senha trocada, porque ninguém o usava |
| 05/10 | O teste de 401 com as chaves antigas não foi executado; a verificação registrada é pelo painel do Supabase e pelo sistema em produção funcionando com a chave nova |
| 05/10 | Chave secreta e *JWT secret* deixam de ficar nas variáveis da Vercel, porque o código não usa nenhuma das duas |
| 06/10 | A Parte B da US-23 segue o guia sem alteração, porque a matriz da Alissa não mudou nenhuma linha da proposta |
| 06/10 | O PR da US-23 fica em rascunho até a Parte C, para ninguém aprovar antes das telas |
| 07/10 | A branch `docs/sprint-2-guias` deixa de ser usada: os guias já estão na `main` desde o merge do PR #2 |

## Registro

| Data | O que aconteceu |
| --- | --- |
| 04/10 | Planejamento: conferência do Trello e do GitHub, seleção das histórias e divisão do trabalho |
| 04/10 | Trello atualizado: lista da Sprint 2, etiqueta, 36 tarefas com responsável e membros nos cartões novos |
| 04/10 | Guias da sprint escritos e enviados na branch `docs/sprint-2-guias` |
| 05/10 | Alissa aprova os PRs #5 e #2 |
| 05/10 | No Trello, cartão da US-26: itens "Aprovar o PR #3" e "Navegar pelos fluxos" marcados como feitos |
| 05/10 | Criados o índice `docs/sprints/README.md` e os arquivos `PROGRESSO.md` das Sprints 1 e 2 |
| 05/10 | Mateus rotaciona as credenciais do projeto `ldqybkuvuxzgsgmnmzgs`: usuário de teste apagado; publicável e secreta novas criadas e as antigas apagadas; chaves legadas `anon` e `service_role` desativadas; publicável nova na Vercel com novo deploy em produção; variáveis da chave secreta e do *JWT secret* apagadas da Vercel |
| 05/10 | Mateus registra a rotação em `docs/seguranca/rotacao-de-credenciais.md` (commit `28622d6`, 21h47), incluindo que a limpeza do histórico foi feita antes da rotação |
| 05/10 | Bibiana aprova o PR #2 (22h39), retirando o pedido de mudança de 02/10 |
| 06/10 | Mateus integra o PR #2 à `main` (09h36). SEC-01 concluída |
| 06/10 | Alissa revisa o PR #6 como comentário, sem aprovação (11h03), e aprova o PR #3 (11h04) |
| 06/10 | Alissa cria a branch `us-23-permissoes-por-perfil` e sobe a matriz de permissões (commit `f9d61d4`, 20h50) |
| 06/10 | Mateus integra os PRs #3, #4 e #5 à `main` (21h42). US-01, US-02 e US-03 concluídas |
| 06/10 | Alissa aprova o PR #6 (22h00), depois de uma segunda revisão enviada como comentário. Mateus integra o PR #6 (22h01). US-26 concluída. Esteira da `main` verde em `4fdf2da` |
| 06/10 | Mateus cria a regra "Proteção da main" (22h06) |
| 06/10 | Mateus traz a `main` para a branch da US-23 e sobe a Parte B (commit `d216f47`, 22h46): lint, build e 5 de 5 testes de fumaça verdes; conferência das políticas no banco com caixa, coordenação e desativada |
| 06/10 | `npm ci` acusa 10 vulnerabilidades (2 moderadas, 8 altas). Em produção, 1 alta (`source-map-js`) |
| 06/10 | Mateus abre o PR #9 da US-23 (23h01), depois convertido em rascunho. Esteira verde |
| 07/10 | Laís fecha os PRs de teste #7 e #8 (10h50) |
| 07/10 | Laís abre o PR #10 com erro de build proposital (11h12): esteira reprovada e merge bloqueado na `main`. Print no cartão da US-03 (11h18); PR fechado sem merge (11h20) |
| 07/10 | No Trello, SEC-01, US-01, US-02, US-03 e US-26 em Concluído |
| 07/10 | Mensagem à Flávia escrita (matriz em linguagem simples, cinco perguntas e pedido da planilha do brechó). Envio a confirmar |
| 07/10 | Constatado que os guias da Sprint 2 já estão na `main` desde o merge do PR #2 |

## Encerramento (preencher em 09/10)

- **Histórias concluídas e velocity:**
- **O que passa para a Sprint 3:**
- **Desvios entre planejado e realizado:**
- **Lições da retrospectiva:**
