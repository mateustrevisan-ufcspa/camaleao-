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
| Brechó · Financeiro (inclui confirmar o recebimento de uma venda) | vê e confirma | sem acesso | sem acesso |
| Doações · Dinheiro, Itens e Tampinhas: listas | todas | só as lançadas hoje | só as lançadas hoje |
| Doações · Dinheiro, Itens e Tampinhas: nova doação | registra | registra | registra |
| Clientes: buscar e abrir a ficha | sim | sim | sim |
| Clientes: cadastrar e corrigir pessoa | sim | sim | sim |
| Clientes: histórico de compras e doações na ficha | completo | só o lançado hoje | só o lançado hoje |
| Relatórios | vê | sem acesso | sem acesso |
| Configurações (categorias, formas de pagamento, bancos, origens e etiquetas) | lê e altera | só lê, para preencher os formulários | só lê, para preencher os formulários |

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

## Usuário desativado

Quem tem `active = false` não entra no sistema. O login mostra "Seu acesso está desativado. Fale com a coordenação do Instituto." Se já estiver com a sessão aberta, perde o acesso: o banco deixa de devolver dados e as telas recusam a sessão.

## Mesclagem e cancelamento

A mesclagem de cadastros (US-08) e o cancelamento de vendas (US-04) ainda não existem. Nesta sprint, o critério é atendido porque só a coordenação altera e apaga vendas e doações. As duas histórias herdam essa regra quando forem implementadas.

## Decisões em aberto

Perguntas que só o Instituto responde. Até a resposta, vale o que está na matriz.

1. Voluntária e caixa fazem coisas diferentes no dia a dia? Na matriz, têm as mesmas permissões.
2. O balcão deve enxergar só as vendas e doações do dia, ou da semana? Um balcão que trabalha só aos sábados, por exemplo, não vê o que lançou no sábado anterior.
3. Quem confere os valores recebidos (tela Financeiro) hoje? Na matriz, só a coordenação.
4. O balcão pode corrigir o cadastro de uma pessoa, ou só incluir? Na matriz, pode corrigir.
5. Se alguém do balcão lançar uma venda ou doação com valor errado, como corrige? Na matriz, precisa pedir à coordenação, porque o balcão não altera nem apaga.
