# Dados pessoais no Camaleão Admin

**Story:** SEC-05 · Minimização de dados pessoais expostos
**Revisão:** Mateus Trevisan, 11/10/2026
**Regra:** o sistema guarda só o dado que alguma funcionalidade usa, e cada perfil recebe só o que precisa para a sua tarefa.

## De quem o sistema guarda dados

| Quem | Onde | Para quê |
| --- | --- | --- |
| Apoiadoras do Instituto (quem compra no brechó ou doa) | `clients` e os registros de venda e doação | Reconhecer a pessoa no balcão, somar a contribuição dela e, com autorização, agradecer |
| Equipe (coordenação, voluntárias e caixa) | `auth.users` e `users` | Login e controle de acesso por perfil |

## Dados das apoiadoras

| Dado | Onde fica | Finalidade | Coordenação | Balcão |
| --- | --- | --- | --- | --- |
| Nome | `clients.name` | Identificar a pessoa na busca e nos registros | vê | vê |
| Telefone | `clients.phone` | Diferenciar pessoas de mesmo nome e contato, quando autorizado | vê inteiro | vê os 4 últimos dígitos; grava, mas não lê de volta |
| E-mail | `clients.email` | Contato, quando autorizado | vê | vê (decisão em aberto) |
| Aniversário (dia e mês, sem o ano) | `clients.birthday` | Lista de aniversariantes do mês | vê | vê |
| Ano de entrada | `clients.member_since` | Mostrar desde quando a pessoa apoia o Instituto | vê | vê |
| Etiquetas | `client_tags` | Classificar o vínculo (familiar, voluntário, brechó, tampinha) | vê | vê |
| Nome e telefone de quem doa sem ter ficha | `donor_name` e `donor_phone` nas tabelas de doação | Registrar a origem da doação | vê | só nas doações lançadas hoje |
| Nome na venda | `sales.customer_name` | Manter o histórico se a ficha for apagada | vê | só nas vendas lançadas hoje |

O sistema não guarda CPF, endereço, data de nascimento completa, dado de saúde nem dado de pagamento além da forma de pagamento da venda.

## O que saiu na SEC-05

- **CPF.** A coluna `clients.cpf` existia e nenhuma tela lia nem gravava. Sai com a migração `20261010090000_minimizacao_de_dados.sql`. Conferência em produção antes de remover, em 11/10/2026: 0 registros com CPF.
- **Leitura direta do telefone.** A coluna `clients.phone` não pode mais ser lida pela API. O telefone sai só pela função `telefone_da_pessoa`, inteiro para a coordenação e mascarado para o balcão.
- **Colunas das views.** `clients_view` deixou de devolver `notes`; `sales_view` e `donations_cash_view` deixaram de devolver `registered_by`. As telas pedem colunas pelo nome, e não `select('*')`.
- **Telefone copiado para a doação.** Quando a doação é de alguém com ficha, o telefone fica só na ficha.

## Pontos em aberto

1. **`clients.notes`.** A coluna continua na tabela e nenhuma tela usa. Conferência em produção em 11/10/2026: 0 registros com observação. A proposta é removê-la em uma story futura.
2. **E-mail para o balcão.** Hoje o balcão vê o e-mail inteiro. Mascarar segue o mesmo desenho do telefone.
3. **`donor_phone` nas doações.** É uma cópia do telefone de quem doa sem ficha. O balcão só enxerga as doações do dia. Avaliar na reorganização das doações (US-11 a US-13).
4. **Prazo de guarda.** Por quanto tempo o Instituto quer manter a ficha de quem deixou de apoiar. Pergunta para a coordenação.

## Autorização de mensagens

O registro de quem autorizou mensagens do Instituto, com data e versão do termo, é da US-07: `docs/privacidade/termo-de-mensagens.md`.
