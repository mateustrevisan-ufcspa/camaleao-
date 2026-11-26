# Termo de autorização de mensagens

Regra da US-07 · Implementa: Bibiana · Revisa: Mateus

## 1. O que é

É o registro de quem autorizou o Instituto Camaleão a enviar mensagens, e a regra de que **só essas pessoas recebem mensagem**.

## 2. O termo

Texto da versão `2026-11`, igual ao de `lib/termo-mensagens.ts`:

> O Instituto Camaleão solicita seus contatos telefônicos (WhatsApp ou SMS) e/ou e-mail apenas com o objetivo de agradecer suas doações; avisar sobre campanhas, eventos e promoções; e fazer a prestação de contas sobre os atendimentos que oferecemos a quem está em tratamento oncológico. Seus dados serão utilizados apenas para este fim e não serão repassados a terceiros. Você pode retirar esta autorização quando quiser, em nossa sede ou pelos canais do Instituto, e deixa de receber mensagens a partir desse momento.

| Versão | Data | O que mudou | Aprovação do Instituto |
| --- | --- | --- | --- |
| `2026-10` | 15/10/2026 | Primeira versão | **Não aprovada.** A Flávia mandou outro texto em 06/11 (versão `2026-11`). As autorizações registradas por ela ficam no histórico e não valem para mensagens (decisão de 15/11/2026); a pessoa autoriza de novo quando ouvir o texto novo |
| `2026-11` | 06/11/2026 | Texto da Flávia: acrescenta promoções e a prestação de contas dos atendimentos; "em nossa sede" no lugar de "no balcão do brechó"; fala em agradecer doações, e não compras | Texto enviado pela Flávia (resposta 1 de 06/11). A coordenação registra a aprovação em Clientes · Agradecimentos no início do uso |

Regra de manutenção: o texto de uma versão que já foi usada nunca é editado. Se o Instituto pedir mudança, cria-se uma versão nova em `lib/termo-mensagens.ts`, com uma nova linha nesta tabela. As autorizações antigas continuam apontando para o texto que a pessoa ouviu.

## 3. Como a autorização é registrada

- **No cadastro da pessoa:** caixa de seleção "Autoriza receber mensagens do Instituto", que nasce desmarcada. Quem cadastra lê o termo para a pessoa antes de marcar.
- **Na ficha da pessoa:** cartão "Mensagens do Instituto", com os botões "Registrar autorização" (mostra o termo para leitura) e "Retirar autorização".

Cada decisão vira uma linha nova na tabela `message_consents`, com:

- a decisão (autorizou ou retirou);
- a data e a autoria, preenchidas pelo servidor (quem registra não escolhe nenhuma das duas);
- a versão do termo lida para a pessoa.

**Quem autorizou por uma versão anterior:** a ficha mostra o aviso e o botão "Ler o termo atual e registrar". Registrar grava uma linha nova; a antiga fica.

Nenhuma linha é alterada ou apagada, nem pela coordenação. O histórico é a prova do consentimento. A situação atual da pessoa é a linha mais recente (view `message_consent_status`).

## 4. As três situações

| Situação | Recebe mensagem? |
| --- | --- |
| Autorizou | Sim |
| Retirou a autorização | Não |
| Ainda não foi perguntada | Não |

Deixar a caixa desmarcada no cadastro não é recusa: a pessoa fica como "ainda não foi perguntada" e pode ser perguntada depois.

## 5. Regra de envio

Toda funcionalidade que **envia** mensagem (agradecimento da US-21a, aniversariantes da US-22, campanhas) decide quem pode receber pela view `destinatarios_do_agradecimento`: autorizou, não retirou **e a versão do termo foi aprovada pelo Instituto**. A `message_recipients` continua dizendo só "autorizou e não retirou" e serve para mostrar a situação na ficha (BUG-04, Sprint 8).

O contato (telefone e e-mail) pode vir da ficha (`clients_view`), desde que a trava seja a view `destinatarios_do_agradecimento`: o link de envio só é montado para quem está nela, e o banco recusa o registro de quem não está. É o padrão dos aniversariantes (US-22) e do agradecimento (US-21a).

Pull Request que monte link ou lista de envio para quem não está na view não é aprovado.

O agradecimento (US-21a) usa a view `destinatarios_do_agradecimento`, que é a `message_recipients` com a exigência da versão do termo aprovada.

Hoje o sistema ainda não envia mensagens. A trava existe antes do envio para que o envio nasça já obedecendo à regra. Os testes em `tests/acesso/consentimento.spec.ts` provam que quem não autorizou, ou retirou, não aparece na lista.

## 6. Descadastro

- **Como a pessoa pede:** no balcão do brechó ou pelos canais do Instituto.
- **Quem registra:** qualquer integrante da equipe, pelo botão "Retirar autorização" na ficha.
- **Quando vale:** na hora. A pessoa sai de `message_recipients` imediatamente.
- **Ponto em aberto (US-21):** a mensagem enviada precisa trazer um caminho que a própria pessoa use sem depender da equipe (por exemplo, responder pedindo para parar). Fica anotado para a US-21.

## 7. Se a ficha for apagada

O histórico de autorização da pessoa é apagado junto com a ficha (a tabela `message_consents` usa `on delete cascade`). É uma decisão de privacidade: sem ficha, não há dado pessoal guardado.
