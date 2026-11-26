# Homologação e início do uso (US-25)

A homologação é o aceite do sistema pelo Instituto: a Nílian, a Ana e a Tamara executam os cenários abaixo no sistema publicado, cada uma com a sua conta, e anotam o resultado. Logo depois, a coordenação começa o uso real, com a equipe ao lado.

- **Quando:** semana de 30/11/2026, de manhã, depois do treinamento (dia a confirmar, pergunta 20).
- **Onde:** na sede, no notebook do balcão.
- **Quem anota:** um integrante da equipe por cenário preenche a coluna "Resultado"; quem executa é sempre a pessoa do Instituto.
- **Dados:** os cenários usam o nome **"HOMOLOGAÇÃO"** e R$ 1. No fim, o que foi registrado é cancelado ou excluído com o motivo "homologação" (cenário 16).

## 1. Roteiro de aceite

| Nº | Quem executa | O que fazer | O que deve acontecer | Resultado (OK, falhou, observação) |
| --- | --- | --- | --- | --- |
| 1 | Tamara | Entrar com a própria conta | Abre em Doações · Itens; o menu não tem Brechó nem Dinheiro | |
| 2 | Tamara | Registrar doação de item "HOMOLOGAÇÃO", com ficha, sem a contagem | A doação aparece na lista como triagem pendente | |
| 3 | Tamara | Fazer a triagem da doação do cenário 2 e imprimir o recibo | A contagem aparece na lista e no recibo | |
| 4 | Tamara | Abrir o endereço de Brechó digitando na barra | Volta para Doações · Itens | |
| 5 | Ana | Registrar uma venda em dinheiro, de R$ 1, pelo atalho | O painel do brechó mostra a venda e os atendimentos | |
| 6 | Ana | Registrar uma venda de R$ 1 no cartão de crédito, em 2x, na maquininha | O Financeiro mostra forma, parcelas e banco | |
| 7 | Ana | Registrar uma doação em dinheiro de R$ 1 pela maquininha, no débito | O resumo mostra o líquido estimado; o recibo sai com os dados do Instituto | |
| 8 | Ana | Corrigir uma doação em dinheiro de outro dia (a do cenário 7, se for de outro dia, ou uma registrada no treinamento) | O valor muda; a correção pede motivo | |
| 9 | Ana | Cancelar a venda do cenário 5, com motivo | A venda some da lista e do total do dia | |
| 10 | Nílian | Registrar a aprovação do termo `2026-11` (Clientes · Agradecimentos) | O aviso de termo não aprovado some. **Este cenário já é o início do uso: a aprovação vale de verdade** | |
| 11 | Ana | Abrir Clientes · Agradecimentos, aba Mensal, mês atual | A lista aparece; quem autorizou com o termo aprovado tem os botões de WhatsApp e e-mail. **Não clicar**: o clique registra o agradecimento | |
| 12 | Nílian | Ver em Relatórios · Alterações a correção e o cancelamento da Ana | As duas linhas aparecem, com quem fez, quando e o motivo | |
| 13 | Nílian | Ver o relatório do mês e exportar a planilha | A planilha baixa, com uma aba por assunto | |
| 14 | Nílian | Marcar comissão numa doação em dinheiro e numa venda da homologação | A comissão aparece em Relatórios · Comissões | |
| 15 | Nílian | Criar uma conta de teste em Equipe e desativá-la | A conta desativada não entra mais | |
| 16 | equipe, com a Nílian | Cancelar e excluir tudo o que tem "HOMOLOGAÇÃO", com o motivo "homologação" | Nada de "HOMOLOGAÇÃO" nas listas e nos totais | |

## 2. Falhas

- Cada cenário que falhar vira um cartão **"BUG-NN"** no Backlog do Produto, no Trello, com o que a pessoa fez, o que aconteceu e o print.
- Correção no mesmo dia: PR até 18h, revisão de outro integrante, merge à noite. Só correção de falha, nada novo.
- A pessoa que encontrou a falha executa o cenário de novo depois do merge, e o resultado entra na tabela.

## 3. Início do uso

Logo depois do aceite, pela coordenação, com a equipe ao lado (cartão "Início do uso pelo Instituto"). **A equipe não digita nada disto:** quem clica é a Nílian.

1. Aprovação do termo `2026-11`, se não foi feita no cenário 10.
2. Importação da planilha de apoiadores (Clientes · Importar planilha): a Nílian escolhe o arquivo; ninguém da equipe abre ou manipula a planilha.
3. Quem capta (Relatórios · Comissões): a Ana.
4. Taxas das perguntas 17 (Doação Solutions) e 18 (Pix da PagBank), se já respondidas (Relatórios · Taxas).
5. Categorias de doação "Roupas", "Tampinha" e "Diversos" (Doações · Categorias), se ainda não existirem.
6. Desativar as contas de conferência da equipe em Equipe (pode ficar para a passagem das contas, no guia de operação).

## 4. Termo de aceite

Texto para imprimir e assinar:

> **Termo de aceite do sistema Camaleão Admin**
>
> Em ___/___/2026, a equipe do projeto de Engenharia de Software II da UFCSPA (Alissa Gadea, Bibiana Freitas, Laís Stürmer e Mateus Trevisan) apresentou o sistema Camaleão Admin ao Instituto Camaleão. Os cenários do roteiro de aceite foram executados pela coordenação, pelo caixa e pela voluntária do Instituto, com os resultados registrados na tabela anexa.
>
> O Instituto Camaleão recebe o sistema publicado, o manual de uso e o guia de operação.
>
> Observações: ______________________________________________
>
> ______________________________
> Nílian, pela coordenação do Instituto Camaleão

A foto ou o PDF assinado **não entra no repositório** (tem assinatura): fica com o Mateus e vai para o relatório final. No `PROGRESSO.md`, só a linha "termo de aceite assinado em DD/MM".
