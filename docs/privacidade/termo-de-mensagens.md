# Termo de autorização de mensagens

Regra da US-07 · Implementa: Bibiana · Revisa: Mateus

## 1. O que é

É o registro de quem autorizou o Instituto Camaleão a enviar mensagens, e a regra de que **só essas pessoas recebem mensagem**.

## 2. O termo

Texto da versão `2026-10`, igual ao de `lib/termo-mensagens.ts`:

> O Instituto Camaleão pode enviar mensagens para você, por telefone (WhatsApp ou SMS) ou e-mail, para agradecer compras e doações, avisar de campanhas e eventos e contar como a sua contribuição ajudou. Seus dados de contato são usados só para isso e não são repassados a terceiros. Você pode retirar esta autorização quando quiser, no balcão do brechó ou pelos canais do Instituto, e deixa de receber mensagens a partir desse momento.

| Versão | Data | O que mudou | Aprovação do Instituto |
| --- | --- | --- | --- |
| `2026-10` | 15/10/2026 | Primeira versão | Pendente. Texto a ser enviado à Flávia pelo Mateus |

Regra de manutenção: o texto de uma versão que já foi usada nunca é editado. Se o Instituto pedir mudança, cria-se uma versão nova em `lib/termo-mensagens.ts`, com uma nova linha nesta tabela. As autorizações antigas continuam apontando para o texto que a pessoa ouviu.

## 3. Como a autorização é registrada

- **No cadastro da pessoa:** caixa de seleção "Autoriza receber mensagens do Instituto", que nasce desmarcada. Quem cadastra lê o termo para a pessoa antes de marcar.
- **Na ficha da pessoa:** cartão "Mensagens do Instituto", com os botões "Registrar autorização" (mostra o termo para leitura) e "Retirar autorização".

Cada decisão vira uma linha nova na tabela `message_consents`, com:

- a decisão (autorizou ou retirou);
- a data e a autoria, preenchidas pelo servidor (quem registra não escolhe nenhuma das duas);
- a versão do termo lida para a pessoa.

Nenhuma linha é alterada ou apagada, nem pela coordenação. O histórico é a prova do consentimento. A situação atual da pessoa é a linha mais recente (view `message_consent_status`).

## 4. As três situações

| Situação | Recebe mensagem? |
| --- | --- |
| Autorizou | Sim |
| Retirou a autorização | Não |
| Ainda não foi perguntada | Não |

Deixar a caixa desmarcada no cadastro não é recusa: a pessoa fica como "ainda não foi perguntada" e pode ser perguntada depois.

## 5. Regra de envio

Toda funcionalidade que enviar mensagem (agradecimento da US-21, aniversariantes da US-22, campanhas) monta a lista de destinatários a partir da view `message_recipients`, **e de nenhum outro lugar**. Para conferir uma pessoa só na hora de enviar, usa-se a função `pode_receber_mensagem(client_id)`.

Pull Request que busque telefone ou e-mail para envio fora dessa view não é aprovado.

Hoje o sistema ainda não envia mensagens. A trava existe antes do envio para que o envio nasça já obedecendo à regra. Os testes em `tests/acesso/consentimento.spec.ts` provam que quem não autorizou, ou retirou, não aparece na lista.

## 6. Descadastro

- **Como a pessoa pede:** no balcão do brechó ou pelos canais do Instituto.
- **Quem registra:** qualquer integrante da equipe, pelo botão "Retirar autorização" na ficha.
- **Quando vale:** na hora. A pessoa sai de `message_recipients` imediatamente.
- **Ponto em aberto (US-21):** a mensagem enviada precisa trazer um caminho que a própria pessoa use sem depender da equipe (por exemplo, responder pedindo para parar). Fica anotado para a US-21.

## 7. Se a ficha for apagada

O histórico de autorização da pessoa é apagado junto com a ficha (a tabela `message_consents` usa `on delete cascade`). É uma decisão de privacidade: sem ficha, não há dado pessoal guardado.
