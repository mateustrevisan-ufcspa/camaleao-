# Guia de operação (US-25)

Para quem cuida do Camaleão Admin depois da entrega: a coordenação do Instituto e quem ela chamar para ajudar. Nenhuma senha, chave, e-mail ou endereço de banco fica neste arquivo; onde for preciso, ele diz **com quem** a informação está.

## 1. O que é cada peça

| Peça | Para quê | Dono depois da passagem | Situação |
| --- | --- | --- | --- |
| **Vercel** | O site do sistema (o endereço que a equipe usa) | Conta do Gmail institucional | A transferir na passagem (parte 8) |
| **Supabase, projeto `camaleao-producao`** | Banco de dados, contas de acesso e cópias de segurança (bucket `backups`) | Gmail institucional, como Owner da organização | A transferir na passagem (parte 8) |
| **GitHub, repositório do projeto** | Código, histórico de mudanças e a rotina "Backup diário" | Fica com a equipe até a avaliação da disciplina; depois, a decidir com a Nílian (pergunta 21) | Com a equipe |
| **Google Drive institucional** | Pasta com as cópias de segurança mensais e o PDF do manual | Instituto | A criar a pasta na entrega |

Quando cada passo da passagem for feito, ele vira uma linha na tabela da parte 8.

## 2. Contas de acesso

- Só a **coordenação** cria, muda de perfil e desativa contas, em **Equipe**.
- Perfis: **coordenação** (tudo), **caixa** (brechó, doações em dinheiro e de item, fichas, correção e agradecimento) e **voluntária** (doações de item e fichas).
- A senha provisória aparece **uma vez**, na hora do cadastro ou de "Nova senha". Passe para a pessoa em pessoa, nunca por mensagem escrita. No primeiro acesso, ela troca a senha.
- **Nunca apague uma conta:** desative. A conta desativada não entra mais, e o histórico (quem registrou o quê) continua.
- Sempre fica pelo menos uma coordenação ativa: o sistema não deixa desativar a última.
- Alguém saiu do Instituto? Desative a conta no mesmo dia.

## 3. Backup

- **O que é:** uma cópia do banco inteiro, todos os dias às 3h, cifrada, guardada no bucket `backups` do `camaleao-producao`. Ficam as dos últimos 30 dias.
- **Como saber que rodou:** no GitHub, aba Actions, rotina "Backup diário": o círculo verde do dia. Se estiver vermelho dois dias seguidos, chame quem cuida do sistema.
- **Fazer uma cópia agora** (antes de uma mudança grande, por exemplo): Actions, "Backup diário", "Run workflow".
- **Cópia mensal no Drive:** no primeiro dia útil de cada mês, a coordenação baixa a cópia mais recente (Supabase, `camaleao-producao`, Storage, `backups`, o arquivo do dia, Download) e guarda na pasta do Drive institucional. A cópia está cifrada: sem a senha, ninguém abre.
- **Senha da cópia:** com a Nílian e, depois de 03/12, com a Flávia (resposta 14). Entregue em pessoa, nunca por mensagem. Sem ela, a cópia não serve para nada: guarde no gerenciador de senhas da coordenação.

## 4. Restaurar

- **Quando:** só se dados se perderam de verdade (apagados por engano em massa, banco corrompido). Lançamento errado se resolve com a correção ou o cancelamento, e não com restauração.
- **Quem decide:** a coordenação, com o motivo registrado.
- **Como:** o passo a passo técnico está em `docs/processo/backup.md` ("Restaurar em produção"). Precisa de alguém que saiba usar o terminal e da senha da cópia.
- A restauração foi testada no banco local; o registro do teste está em `docs/processo/backup.md`, parte 5.

## 5. Mudanças no sistema

- Toda mudança no código entra por **Pull Request**, revisada por outra pessoa, com a esteira verde (lint, build e testes).
- Mudança no banco entra como migração nova em `supabase/migrations`, aplicada em produção **só** pelo `npm run db:push:producao`, na branch da mudança, com o PR aprovado (`docs/processo/banco-de-producao.md`).
- Nunca mexer no banco pelo SQL Editor do Supabase, a não ser para ler.
- Textos que o Instituto pode querer trocar sem mexer na lógica: mensagens de agradecimento e de aniversário em `lib/mensagens.ts`; termo de mensagens em `lib/termo-mensagens.ts` (versão nova, nunca editar a antiga; veja `docs/privacidade/termo-de-mensagens.md`).
- Quem pode fazer mudanças depois da entrega: a combinar entre a equipe e o Instituto (fora do projeto da disciplina).

## 6. Quando algo dá errado

| O que aconteceu | O que fazer |
| --- | --- |
| O site não abre | Teste em outro aparelho e em outra rede. Se não abrir em nenhum, veja o status na Vercel e chame quem cuida do sistema |
| "Não foi possível registrar" | Quase sempre é a internet. Confira a lista (Últimas vendas, ou a lista de doações) **antes** de registrar de novo, para não lançar duas vezes |
| Lancei errado | Doação em dinheiro: Corrigir. Venda: cancelar com motivo e registrar de novo. Doação de item: editar ou excluir. Tudo fica em Relatórios · Alterações |
| Alguém esqueceu a senha | A coordenação gera uma nova em Equipe ("Nova senha") |
| Alguém viu o que não devia, ou o celular com o sistema aberto foi perdido | Desative a conta em Equipe na hora, gere uma senha nova depois e avise a coordenação |
| A pessoa não quer mais receber mensagens | Na ficha dela, retirar a autorização. Ela sai das listas de agradecimento e de aniversário na hora |
| O "Backup diário" ficou vermelho | Rodar de novo pelo "Run workflow". Se falhar de novo, chamar quem cuida do sistema |

**Contato da equipe até o fim da disciplina:** pelo grupo do projeto com o Instituto.

## 7. O que fica de fora da entrega

- **US-21b:** envio automático de e-mail. Espera o Instituto ter um domínio próprio e quem cuide dele (pergunta 16).
- O que ficou no Backlog do Produto, no Trello, ao fim da Sprint 8.
- As decisões em aberto da matriz de permissões (`docs/seguranca/matriz-de-permissoes.md`).
- Suporte depois do fim da disciplina: a combinar, fora do projeto.

## 8. Passagem das contas

Feita na entrega, com a Nílian. Cada linha é preenchida quando o passo for feito, sem senha nem e-mail.

| Passo | Como | Feito em | Por quem |
| --- | --- | --- | --- |
| Supabase: Gmail institucional como Owner da organização do `camaleao-producao` | Convite pela equipe, aceite pela Nílian; depois, os integrantes passam a Developer até o fim da disciplina e saem | | |
| Vercel: projeto transferido para o Gmail institucional | Project Settings, Transfer, com as variáveis de ambiente; conferir que o site continua no mesmo endereço | | |
| GitHub: decisão sobre o repositório | Transferir ou dar acesso de leitura (pergunta 21). Os segredos do "Backup diário" vão junto ou são recriados | | |
| Senha da cópia de segurança entregue | Em pessoa, do Mateus para a Nílian | | |
| Pasta do Drive institucional criada, com a primeira cópia e o PDF do manual | Pela Nílian, com a equipe ao lado | | |
| Contas de conferência da equipe desativadas | Pela Nílian, em Equipe | | |
