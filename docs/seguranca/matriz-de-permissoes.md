# Matriz de permissões por perfil

**História:** US-23 · Permissões por perfil de usuário
**Revisão:** Alissa Gadea, 06/10/2026
**Confirmação do Instituto:** pendente (enviada à Flávia pelo Mateus)

Esta matriz é a entrada das políticas do banco. O que está aqui vira SQL na migração `supabase/migrations/20261006090000_permissoes_por_perfil.sql`. Se uma linha mudar, a política correspondente muda junto.

## Perfis

| Perfil no sistema | Nome no banco (`users.role`) | Quem é |
| --- | --- | --- |
| Coordenação | `admin` | Coordenação do Instituto |
| Voluntária | `volunteer` | Quem atende no balcão |
| Caixa | `cashier` | Quem recebe os pagamentos no balcão |

Voluntária e caixa formam o **balcão** e, nesta sprint, têm as mesmas permissões.

Regras gerais:

- **Negar por padrão.** Quem não tem perfil em `public.users`, ou está com `active = false`, não lê nem altera nada.
- **A regra vale no banco.** Esconder um item do menu só evita que a pessoa caia numa tela vazia. Quem barra o acesso são as políticas do banco.
- **"Lançado hoje"** quer dizer registrado no sistema a partir das 00:00 de hoje, no horário de São Paulo (campo `created_at`), e não a data informada no formulário.

## Por tela

| Tela | Coordenação | Voluntária | Caixa |
| --- | --- | --- | --- |
| Login | entra | entra | entra |
| Brechó · Visão geral: total de hoje e vendas do dia | vê | vê | vê |
| Brechó · Visão geral: cartões "Esta semana", "Mês" e cliente que mais voltou | vê | não vê | não vê |
| Brechó · Nova venda | registra | registra | registra |
| Brechó · Nova venda: atalhos dos mais vendidos, só categoria e valor (Sprint 4, US-05) | vê | vê | vê |
| Brechó · Financeiro (inclui confirmar o recebimento de uma venda) | vê e confirma | sem acesso | sem acesso |
| Doações · Dinheiro, Itens e Tampinhas: listas | todas | só as lançadas hoje | só as lançadas hoje |
| Doações · Dinheiro, Itens e Tampinhas: nova doação | registra | registra | registra |
| Doações · Categorias de item: cadastrar, renomear e desativar (Sprint 4, US-11) | sim | sem acesso; escolhe a categoria no formulário | sem acesso; escolhe a categoria no formulário |
| Doações · Eventos: cadastrar e ver o total arrecadado (Sprint 4, US-12) | sim | sem acesso; escolhe o evento na doação em dinheiro | sem acesso; escolhe o evento na doação em dinheiro |
| Doações · Campanhas: cadastrar, encerrar e reabrir, e ver arrecadado, custo e diferença (Sprint 4, US-13) | sim | sem acesso; escolhe a campanha na doação em dinheiro | sem acesso; escolhe a campanha na doação em dinheiro |
| Doações · Dinheiro e Itens: escolher a pessoa na busca ou marcar "Doação sem ficha" (Sprint 4, US-14) | sim | sim | sim |
| Doações · Sem ficha: ligar uma doação antiga a uma pessoa (Sprint 4, US-14) | sim | sem acesso | sem acesso |
| Clientes: buscar e abrir a ficha | sim | sim | sim |
| Busca de pessoa na venda e na doação: nome, apelido, final do telefone e se já comprou ou já doou | sim | sim | sim |
| Clientes: cadastrar e corrigir pessoa | sim | sim | sim |
| Clientes: histórico de compras e doações na ficha | completo | só o lançado hoje | só o lançado hoje |
| Clientes: registro original aberto a partir do histórico (Sprint 4, US-10) | completo | só o lançado hoje | só o lançado hoje |
| Clientes: contribuição da pessoa no período, na ficha (Sprint 4, US-15) | vê | não vê | não vê |
| Clientes · Possíveis repetidos: pares com nome parecido ou telefone igual, só o final do telefone (Sprint 4, US-08a) | vê | sem acesso | sem acesso |
| Clientes · Mesclar fichas e desfazer em até 30 dias (Sprint 4, US-08b) | sim | sem acesso | sem acesso |
| Clientes · Aniversariantes do mês, com mensagem por WhatsApp ou e-mail só para quem autorizou (Sprint 4, US-22) | vê | sem acesso | sem acesso |
| Clientes · Doadores recorrentes: última doação e interrompidos (Sprint 4, US-20) | vê | sem acesso | sem acesso |
| Relatórios | vê | sem acesso | sem acesso |
| Relatórios · Instituto: arrecadação no período e exportação em planilha (Sprint 4, US-17 e US-18) | vê e baixa | sem acesso | sem acesso |
| Relatórios · Valor do atendimento: alterar o valor e ver quem alterou e quando (Sprint 5, US-19) | sim | sem acesso | sem acesso |
| Brechó · Visão geral: aviso de venda registrada, com os atendimentos que ela ajuda a custear (Sprint 5, US-19) | vê | vê | vê |
| Clientes: atendimentos no cartão de contribuição da ficha (Sprint 5, US-19) | vê | não vê | não vê |
| Configurações (categorias, formas de pagamento, bancos, origens e etiquetas) | lê e altera | só lê, para preencher os formulários | só lê, para preencher os formulários |

A busca informa se a pessoa já comprou ou já doou em qualquer data, sem valor e sem data. O histórico detalhado do balcão continua limitado ao que foi lançado hoje.

As linhas marcadas "(Sprint 4, US-xx)" entraram no planejamento de 16/10 ou no replanejamento de 20/10 e valem a partir da integração da story. Quem integra a story tira a marca da sua linha. As marcadas "(Sprint 5, US-19)" entraram no planejamento de 26/10 e seguem a mesma regra.

Quem não tem acesso a uma tela não vê o item no menu. Se digitar o endereço direto (por exemplo, `/relatorios`), volta para o brechó com o aviso "Essa área é restrita à coordenação do Instituto."

Hoje não há tela de configurações nem botões de apagar no sistema. As linhas abaixo valem para o banco e para as telas que vierem depois.

## Por tabela

| Tabela | Coordenação | Balcão (voluntária e caixa) |
| --- | --- | --- |
| `users` | lê todas as linhas; ninguém altera pela API | lê só a própria linha |
| `tags`, `payment_methods`, `banks`, `item_categories`, `cash_origins` | lê e altera | só lê |
| `clients` | lê, cadastra, corrige e apaga | lê, cadastra e corrige; não apaga |
| `client_tags` | lê, marca e desmarca | lê, marca e desmarca |
| `sales` | lê todas, registra, altera e apaga | lê só as lançadas hoje e registra em seu nome; não altera nem apaga |
| `sale_items` | segue a venda | lê os itens das vendas que enxerga e registra; não altera nem apaga |
| `donations_cash`, `donations_items`, `donations_caps` | lê todas, registra, altera e apaga | lê só as lançadas hoje e registra em seu nome; não altera nem apaga |
| `clients_view`, `sales_view`, `donations_cash_view` | respeitam as políticas das tabelas de quem consulta (`security_invoker`) | idem |
| `donations_caps` (Sprint 4, US-11) | lê; ninguém grava: as tampinhas passam a ser doações de item | lê só as lançadas hoje; não grava |
| `events` (Sprint 4, US-12) | lê, cadastra, altera e apaga (evento com doação não é apagado) | só lê |
| `events_totals` (Sprint 4, US-12) | respeita as políticas de quem consulta (`security_invoker`) | idem (soma só as doações de hoje) |
| `campaigns` (Sprint 4, US-13) | lê, cadastra, altera e apaga (campanha com doação não é apagada; encerrar só marca a data) | só lê |
| `campaigns_totals` (Sprint 4, US-13) | respeita as políticas de quem consulta (`security_invoker`) | idem (soma só as doações de hoje) |
| `client_merges` (Sprint 4, US-08b) | lê as colunas de identificação; a cópia da ficha que saiu não sai pela API; grava só pelas funções de mesclar e desfazer | sem acesso |
| `valor_do_atendimento` (Sprint 5, US-19) | lê e grava um valor novo; cada alteração é uma linha nova, com quem e quando preenchidos pelo banco; ninguém altera nem apaga | só lê (para mostrar os atendimentos da venda) |

Funções que passam por cima das políticas (`security definer`) e conferem o perfil na primeira linha:

| Função | Quem recebe resultado |
| --- | --- |
| `buscar_pessoas` (US-06) | equipe |
| `telefone_da_pessoa` (SEC-05) | equipe; inteiro só para a coordenação |
| `atalhos_da_venda` (Sprint 4, US-05) | equipe; só categoria, valor e quantas vezes |
| `possiveis_repetidos` (Sprint 4, US-08a) | coordenação; só o final do telefone |
| `mesclar_fichas` e `desfazer_mesclagem` (Sprint 4, US-08b) | coordenação |

A exportação em planilha (`/relatorios/exportar`, Sprint 4, US-18) não usa função própria: o proxy devolve o balcão para o brechó, e a rota confere o perfil com a mesma função das políticas (`eh_coordenacao`) e responde 403 para quem não é coordenação. A planilha não leva telefone nem e-mail, e todo texto que começa com sinal de fórmula sai como texto.

Ligar uma doação antiga a uma pessoa (Sprint 4, US-14) é uma alteração de doação, que só a coordenação faz; a alteração só vale para doação que ainda está sem ficha.

## Usuário desativado

Quem tem `active = false` não entra no sistema. O login mostra "Seu acesso está desativado. Fale com a coordenação do Instituto." Se já estiver com a sessão aberta, perde o acesso: o banco deixa de devolver dados e as telas recusam a sessão.

## Mesclagem e cancelamento

A mesclagem de cadastros (US-08) e o cancelamento de vendas (US-04) ainda não existem. Nesta sprint, o critério é atendido porque só a coordenação altera e apaga vendas e doações. As duas histórias herdam essa regra quando forem implementadas.

Planejamento da Sprint 4 (16/10): a US-08 foi quebrada em US-08a (possíveis repetidos) e US-08b (mesclagem). As duas são só da coordenação, na tela e no banco: as funções `possiveis_repetidos`, `mesclar_fichas` e `desfazer_mesclagem` começam por `eh_coordenacao()`. O cancelamento (US-04) continua aguardando a resposta do Instituto.

## Decisões em aberto

Perguntas que só o Instituto responde. Até a resposta, vale o que está na matriz.

1. Voluntária e caixa fazem coisas diferentes no dia a dia? Na matriz, têm as mesmas permissões.
2. O balcão deve enxergar só as vendas e doações do dia, ou da semana? Um balcão que trabalha só aos sábados, por exemplo, não vê o que lançou no sábado anterior.
3. Quem confere os valores recebidos (tela Financeiro) hoje? Na matriz, só a coordenação.
4. O balcão pode corrigir o cadastro de uma pessoa, ou só incluir? Na matriz, pode corrigir.
5. Se alguém do balcão lançar uma venda ou doação com valor errado, como corrige? Na matriz, precisa pedir à coordenação, porque o balcão não altera nem apaga.
