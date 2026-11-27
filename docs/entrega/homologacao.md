# Homologação e início do uso (US-25)

A homologação é o aceite do sistema pelo Instituto: a Nílian, a Ana e a Tamara executam os cenários abaixo no sistema publicado, cada uma com a sua conta, e anotam o resultado. Depois do aceite, a coordenação começa o uso real.

- **Formato:** remoto, decisão de 27/11 (pergunta 20). Cada uma executa os seus cenários **no horário que puder**, depois do seu bloco do treinamento, e anota o resultado na aba "Homologação" da planilha de retorno (OK, falhou ou observação, com print quando falhar).
- **Quando:** semana de 30/11/2026, na ordem da tabela "Ordem" abaixo.
- **Retorno da equipe:** o Mateus lê a planilha todo dia e responde em até um dia útil. Cada falha vira cartão no Trello (parte 2).
- **Dados:** os cenários usam o nome **"HOMOLOGAÇÃO"** e R$ 1. No fim, o que foi registrado é cancelado ou excluído com o motivo "homologação" (cenário 16).

## 1. Roteiro de aceite

| Nº | Quem executa | O que fazer | O que deve acontecer | Resultado (OK, falhou, observação) |
| --- | --- | --- | --- | --- |
| 1 | Tamara | Entrar com a própria conta | Abre em Doações · Itens; o menu não tem Brechó nem Dinheiro | |
| 2 | Tamara | Registrar doação de item "HOMOLOGAÇÃO", com ficha, sem a contagem | A doação aparece na lista como triagem pendente | |
| 3 | Tamara | Fazer a triagem da doação do cenário 2 e imprimir ou salvar o recibo | A contagem aparece na lista e no recibo | |
| 4 | Tamara | Abrir o endereço de Brechó digitando na barra | Volta para Doações · Itens | |
| 5 | Ana | Registrar uma venda em dinheiro, de R$ 1, pelo atalho | O painel do brechó mostra a venda e os atendimentos | |
| 6 | Ana | Registrar uma venda de R$ 1 no cartão de crédito, em 2x, na maquininha | O Financeiro mostra forma, parcelas e banco | |
| 7 | Ana | Registrar uma doação em dinheiro de R$ 1 pela maquininha, no débito | O resumo mostra o líquido estimado; o recibo sai com os dados do Instituto | |
| 8 | Ana | Corrigir uma doação em dinheiro de outro dia (a do cenário 7, num dia seguinte) | O valor muda; a correção pede motivo | |
| 9 | Ana | Cancelar a venda do cenário 5, com motivo | A venda some da lista e do total do dia | |
| 10 | Nílian | Registrar a aprovação do termo `2026-11` (Clientes · Agradecimentos) | O aviso de termo não aprovado some. **Este cenário já é o início do uso: a aprovação vale de verdade** | |
| 11 | Ana | Abrir Clientes · Agradecimentos, aba Mensal | A lista aparece; quem autorizou com o termo aprovado tem os botões de WhatsApp e e-mail. **Não clicar**: o clique registra o agradecimento | |
| 12 | Nílian | Ver em Relatórios · Alterações a correção e o cancelamento da Ana | As duas linhas aparecem, com quem fez, quando e o motivo | |
| 13 | Nílian | Ver o relatório do mês e exportar a planilha | A planilha baixa, com uma aba por assunto | |
| 14 | Nílian | Marcar comissão numa doação em dinheiro e numa venda da homologação | A comissão aparece em Relatórios · Comissões | |
| 15 | Nílian | Criar uma conta de teste em Equipe e desativá-la | A conta desativada não entra mais | |
| 16 | Nílian | Cancelar e excluir tudo o que tem "HOMOLOGAÇÃO", com o motivo "homologação" (se quiser, em chamada com alguém da equipe) | Nada de "HOMOLOGAÇÃO" nas listas e nos totais | |

### Ordem

| Ordem | Quem | Cenários | Depende de |
| --- | --- | --- | --- |
| 1 | Tamara | 1 a 4 | o bloco 2 do treinamento |
| 1 | Ana | 5 a 7 | o bloco 3 do treinamento |
| 2 | Ana | 8 e 9 | um dia depois do cenário 7 |
| 3 | Nílian | 10 e 12 a 15 | os cenários 8 e 9 da Ana |
| 4 | Ana | 11 | o cenário 10 |
| 5 | Nílian | 16 | todos os outros com resultado |

## 2. Falhas

- Cada cenário que falhar vira um cartão **"BUG-NN"** no Backlog do Produto, no Trello, com o que a pessoa fez, o que aconteceu e o print.
- Correção em até um dia útil: PR, revisão de outro integrante e merge. Só correção de falha, nada novo.
- Depois do merge, a equipe avisa a pessoa que encontrou a falha; ela executa o cenário de novo, e o resultado entra na planilha.

## 3. Início do uso

Depois do aceite, pela coordenação, no horário que ela puder (cartão "Início do uso pelo Instituto"). **A equipe não digita nada disto:** quem clica é a Nílian. Se ela quiser, alguém da equipe acompanha por chamada de vídeo.

1. Aprovação do termo `2026-11`, se não foi feita no cenário 10.
2. Importação da planilha de apoiadores (Clientes · Importar planilha): a Nílian escolhe o arquivo; ninguém da equipe abre ou manipula a planilha.
3. Quem capta (Relatórios · Comissões): a Ana.
4. Taxas (Relatórios · Taxas): a da Doação Solutions só depois que o Mateus confirmar o valor (pergunta 17); até lá, fica "taxa não cadastrada". O Pix da PagBank fica em 0,19% (pergunta 18).
5. Categorias de doação "Roupas", "Tampinha" e "Diversos" (Doações · Categorias), se ainda não existirem.
6. Desativar as contas de conferência da equipe em Equipe (pode ficar para a passagem das contas, no guia de operação).

## 4. Termo de aceite

Texto para a Nílian imprimir e assinar (ou assinar o PDF digitalmente) e devolver ao Mateus por foto ou PDF:

> **Termo de aceite do sistema Camaleão Admin**
>
> Em ___/___/2026, a equipe do projeto de Engenharia de Software II da UFCSPA (Alissa Gadea, Bibiana Freitas, Laís Stürmer e Mateus Trevisan) entregou o sistema Camaleão Admin ao Instituto Camaleão. O treinamento e os cenários do roteiro de aceite foram feitos de forma remota pela coordenação, pelo caixa e pela voluntária do Instituto, com os resultados registrados na tabela anexa.
>
> O Instituto Camaleão recebe o sistema publicado, o manual de uso e o guia de operação.
>
> Observações: ______________________________________________
>
> ______________________________
> Nílian, pela coordenação do Instituto Camaleão

A foto ou o PDF assinado **não entra no repositório** (tem assinatura): fica com o Mateus e vai para o relatório final. No `PROGRESSO.md`, só a linha "termo de aceite assinado em DD/MM".
