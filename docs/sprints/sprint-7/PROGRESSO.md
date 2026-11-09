# Sprint 7 · progresso

**Período:** 07/11 a 13/11/2026 · **Situação:** planejada · **Atualizado em:** 09/11/2026, com as respostas da Nílian (perguntas 4, 7, 8 e 13) e a correção da Flávia (pergunta 10)

Plano da sprint: [README.md](README.md).

## Resumo

- **06/11, planejamento:** 9 itens e 45 SP comprometidos (TS-05, TS-04, US-35, US-24b, SEC-04, US-09, US-24a, US-21a e US-31), mais a US-04b como extra (5 SP). US-21 e US-24 divididas; US-35 estimada em 5 SP; US-31 reestimada de 5 para 8 SP; TS-05 nova (1 SP). Product Backlog de 59 para 68 SP. Guias escritos nesta pasta a partir da `main` de 06/11 (PR #67), sem execução de código.

## Ponto de partida: como a Sprint 6 terminou

- 40 de 40 SP integrados à `main`; último merge: PR #67 (US-32), 06/11 às 10h32. Corte de quinta registrado como desvio no relatório da Sprint 6.
- Sistema publicado no `camaleao-producao` desde 04/11, com 18 migrações (até `20261104090000`).
- Revisão de 06/11 com o Instituto: nada mudou. Perguntas pendentes enviadas no mesmo dia (tabela "Respostas do Instituto").

## Stories (45 SP + 5 extra)

| Story | Tipo | SP | Implementa | Revisa | Branch | PR | Situação |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [TS-05](TS-05.md) · Supabase CLI 3.x no projeto | Technical | 1 | Laís | Alissa | `ts-05-supabase-cli-3` | | Não iniciada. PR até seg 09/11, 14h |
| [TS-04](TS-04.md) · Remover a tabela antiga de tampinhas | Technical | 2 | Laís | Mateus | `ts-04-remover-tampinhas-antigas` | | Não iniciada. PR até seg 09/11, 18h |
| [US-35](US-35.md) · Taxa da maquininha nas doações | User | 5 | Mateus | Bibiana | `us-35-taxa-nas-doacoes` | | Não iniciada. PR até ter 10/11, 18h |
| [US-24b](US-24b.md) · Backup diário cifrado | User | 3 | Bibiana | Laís | `us-24b-backup-diario` | | Não iniciada. PR até ter 10/11, 18h; restauração de teste na quarta |
| [SEC-04](SEC-04.md) · Trilha de auditoria | Segurança | 5 | Mateus | Alissa | `sec-04-trilha-de-auditoria` | | Não iniciada. PR até qua 11/11, 18h |
| [US-09](US-09.md) · Importação de pessoas por planilha | User | 8 | Mateus | Bibiana | `us-09-importacao-de-pessoas` | | Não iniciada. PR até qua 11/11, 18h |
| [US-24a](US-24a.md) · Gestão de usuários | User | 5 | Laís | Alissa | `us-24a-gestao-de-usuarios` | | Não iniciada. PR até qua 11/11, 18h |
| [US-21a](US-21a.md) · Agradecimento com um clique | User | 8 | Alissa | Laís | `us-21a-agradecimento` | | Não iniciada. PR até qui 12/11, 18h |
| [US-31](US-31.md) · Comissão por doação | User | 8 | Bibiana | Mateus | `us-31-comissao-por-doacao` | | Não iniciada. PR até qui 12/11, 18h |
| [US-04b](US-04b.md) · Correção e cancelamento de dinheiro (extra) | User | 5 | Mateus | Bibiana | `us-04b-corrigir-e-cancelar-dinheiro` | | Não iniciada. Começa qua 11/11 à noite; PR até qui 12/11, 18h |

## Respostas do Instituto

| Nº | Pergunta | Para quem | Enviada em | Resposta | Aplicada em |
| --- | --- | --- | --- | --- | --- |
| 1 | Aprovam o termo de mensagens de 15/10? | Flávia | 06/11 | Não aprovou o texto de 15/10: mandou um texto novo (seção "Termo proposto pela Flávia", abaixo) | US-21a: o texto vira a versão `2026-11` em `lib/termo-mensagens.ts`, com linha nova em `docs/privacidade/termo-de-mensagens.md`. A aprovação continua sendo registrada pela coordenação na tela, e não pela equipe |
| 2 | "Uma vez só" vale por mês, ano ou compra? | Flávia | 06/11 | Três agradecimentos: **mensal**, até o dia 10, para quem doou dinheiro ou comprou no brechó no mês anterior, com o número de atendimentos (1 a cada R$ 50); **semanal**, para quem trouxe item na sede (tampinhas, roupas etc.), mensagem padrão sem dizer o quê; **no fim do ano**, com tudo do ano: atendimentos para quem comprou ou doou dinheiro, e texto fixo para quem só doou item | US-21a: o mensal é o provisório, mas sem as peças de item na conta. Semanal e anual são escopo novo (a decidir, seção "Pontos a decidir") |
| 3 | Quem agradece; o que a mensagem traz | Flávia | 06/11 | Ainda sem resposta. A Flávia perguntou de volta se vai ser mensagem de texto; resposta do Mateus pendente no WhatsApp | US-21a: segue o provisório (só a coordenação; texto de `textoDeAgradecimento`) |
| 4 | Quem corrige ou cancela dinheiro; motivo; prazo | Flávia e Nílian | 06/11 | Coordenação e balcão podem corrigir (Flávia, 06/11; Nílian concordou, 09/11); espaço para o motivo, mas sem ser obrigatório; correção em qualquer data | US-04b e SEC-04: muda a regra provisória. Abrir ao balcão pede mais que trocar a condição (seção "Pontos a decidir") |
| 5 | Planilhas do brechó, recorrentes e plataforma | Flávia e Nílian | 06/11 | A Nílian pode enviar, por e-mail ao Mateus | US-09: sem mudança. Importação real no início do uso, pela coordenação |
| 6 | As pessoas das planilhas já autorizaram mensagens? | Flávia | 06/11 | A Nílian vai confirmar uma por uma com a Flávia e a Ana. Na Doação Solutions, o doador marca se quer contato; no brechó e na sede, quem dá o número sabe para que é (combinado de boca); dos recorrentes, alguns interagem e outros não, e cada um precisa ser perguntado | US-09: sem mudança, todos entram como "ainda não perguntada". A autorização de cada pessoa é registrada na ficha, com o termo |
| 7 | Quem capta; percentual ou valor; comissão de venda | Nílian | 06/11 | Comissão de vendas **e** de doações, de **25% sobre o líquido**, com o percentual ajustável para o caso de mudar. Normalmente vai para a Ana, mas está ligada ao trabalho, e não à pessoa: nem sempre é para ela. Pedem para marcar no sistema quando teve comissão e quando não teve. Paga todo mês (09/11) | US-31: muda o desenho (venda também, percentual em vez de valor à mão). Seção "Pontos a decidir" |
| 8 | Recibo e atendimentos: bruto ou líquido? | Nílian | 06/11 | Bruto; só a doação pela maquininha usa o líquido (09/11) | US-35: recibo e atendimentos passam a usar o líquido quando a doação veio pela maquininha. Pix e Doação Solutions a confirmar (seção "Pontos a decidir") |
| 9 | E-mails e perfis de Tamara, Ana e Nílian | Flávia e Nílian | 06/11 | Quatro contas: Nílian e Flávia coordenação, Ana caixa (captação e balcão), Tamara voluntária (é estagiária). E-mails recebidos e guardados fora do repositório | US-24a e início do uso: a Flávia entra como quarta conta |
| 10 | Quem cadastra e desativa usuários | Flávia | 06/11 | Em 06/11, "os três níveis", com um motivo que falava de cadastrar doações; em 09/11, a Flávia corrigiu: **apenas a coordenação** | US-24a: sem mudança, igual ao guia |
| 11 | Data do início do uso; aparelho e internet | Flávia | 06/11 | Data a combinar com a Ana. Notebook no balcão, com internet relativamente estável (às vezes cai) | Início do uso, US-25: sem data |
| 12 | Dados do Instituto no recibo | Flávia ou Nílian | 06/11 | Razão social INSTITUTO CAMALEÃO; CNPJ 25.535.215/0001-38; assina Flávia Maoli Magalhães de Oliveira, presidente; com a logo do Camaleão. Sem dedução de imposto de renda por enquanto. Endereço não informado | US-16 (concluída): ajuste em `lib/instituto.ts` e logo no recibo, a planejar |
| 13 | Datas de treinamento e validação | Flávia | 06/11 | A Nílian, a Ana e a Tamara cuidam disso: a Flávia viaja de 11/11 a 03/12. A Nílian prefere a última semana de novembro (23 a 27/11), de manhã, porque a Tamara sai às 16h; qualquer dia serve para ela (09/11) | US-25: treinamento entre 23 e 27/11, de manhã; falta fechar o dia com a Ana e a Tamara |
| 14 | Onde guardar a cópia de segurança; quem guarda a chave | Flávia e Nílian | 06/11 | No Google Drive da conta institucional do Instituto; a chave fica com a Flávia, que se ofereceu para criar a pasta | US-24b: sem mudança nesta sprint (o guia já deixa a cópia no Drive para a entrega). Combinar a entrega da chave antes da viagem de 11/11 |
| 15 | E-mail institucional dono das contas | Flávia | 06/11 | A conta Gmail institucional do Instituto (endereço guardado fora do repositório) | Entrega (Sprint 8) |
| 16 | E-mail próprio e domínio | Flávia | 06/11 | Existe um endereço próprio no domínio do Instituto, mas hoje ninguém cuida do site nem do domínio; vão procurar alguém | US-21b: sem acesso ao domínio para autenticar o remetente, fica parada. US-24a: segue com a senha provisória |
| 17 | Taxa da Doação Solutions | Nílian | a enviar (09/11) | | US-35 |
| 18 | Pix da PagBank: 0,19% ou sem taxa? | Nílian | a enviar (09/11) | | US-32, US-35 |

### Termo proposto pela Flávia (06/11)

Texto como veio, só com o espaço que faltava depois de "terceiros." e sem o espaço duplo:

> O Instituto Camaleão solicita seus contatos telefônicos (WhatsApp ou SMS) e/ou e-mail apenas com o objetivo de agradecer suas doações; avisar sobre campanhas, eventos e promoções; e fazer a prestação de contas sobre os atendimentos que oferecemos a quem está em tratamento oncológico. Seus dados serão utilizados apenas para este fim e não serão repassados a terceiros. Você pode retirar esta autorização quando quiser, em nossa sede ou pelos canais do Instituto, e deixa de receber mensagens a partir desse momento.

Diferenças em relação à versão `2026-10`: acrescenta "promoções" e a prestação de contas dos atendimentos; troca "no balcão do brechó" por "em nossa sede"; não fala mais em agradecer compras, só doações (o agradecimento mensal inclui compras no brechó, pela resposta 2; vale confirmar com a Flávia se "doações" cobre as compras).

### Pontos a decidir

Atualizado em 09/11, com as respostas da Nílian e a correção da Flávia.

- **Agradecimento semanal e anual (resposta 2):** a tabela `agradecimentos` da US-21a aceita períodos de formatos diferentes na mesma coluna (`AAAA-MM`, `AAAA`), então um agradecimento de cada tipo por pessoa cabe no `unique (client_id, periodo)`. O que muda é a tela e quem aparece em cada lista. Decidir se a US-21a fica só com o mensal (tirando as peças de item da conta) e o semanal e o anual viram story nova para a Sprint 8.
- **Balcão corrige dinheiro (resposta 4, decidida):** o guia da US-04b diz que abrir ao balcão é "um ajuste pequeno", mas a resposta pede três coisas: (a) o balcão só lê os lançamentos do dia (`balcao_le_desde`), então corrigir "em qualquer data" pede uma tela de busca com leitura além do dia, só para corrigir; (b) o motivo opcional derruba o gatilho `exigir_motivo_na_correcao` e a exigência da SEC-04 na exclusão de item; (c) as políticas de alteração passam a incluir o caixa. Decidir se a US-04b (extra) absorve isso ou se é reestimada. Proposta para levar ao Instituto: motivo obrigatório pelo menos no cancelamento, que some das somas e do recibo.
- **Comissão (resposta 7):** o desenho da US-31 (valor à mão, só doações, decisão de 29/10) não atende. A resposta pede: comissão também na venda; marcar em cada registro se teve comissão e para quem; percentual de 25% sobre o líquido, que a coordenação pode alterar (no padrão do valor do atendimento da US-19 e das taxas da US-32, uma linha por alteração). Como a US-31 ainda não começou, decidir antes da Bibiana começar: reestimar a US-31 com venda e percentual, ou manter a US-31 nas doações com percentual e abrir story nova para a venda.
- **Bruto ou líquido (resposta 8):** "líquido só pela maquininha" e "líquido sempre" dão o mesmo número no cartão (sem taxa, o líquido é igual ao valor). A diferença aparece no Pix da PagBank (0,19% nas taxas de 30/10, pergunta 18) e na Doação Solutions (pergunta 17), que não são maquininha. Proposta: usar o líquido quando a doação veio por maquininha de cartão e o bruto nos demais casos, e confirmar com a Nílian junto com as perguntas 17 e 18. Vale também para a conta de atendimentos da US-21a, que hoje usa o bruto.
- **Chave do backup (resposta 14):** a Flávia guarda a chave, mas viaja de 11/11 a 03/12, e a primeira cópia sai na terça 10/11. Combinar a entrega antes da viagem e se a Nílian guarda uma segunda via.

## Publicações no sistema publicado

Uma linha por merge e por migração. "Conferido" diz com qual conta de conferência e o que foi refeito. Quem integra preenche a sua.

| Data | Migração (`migration list --remote` antes e depois) | Merge | O quê | Quem | Conferido |
| --- | --- | --- | --- | --- | --- |

## Backup (US-24b)

| Data | O quê | Quem | Resultado |
| --- | --- | --- | --- |

## Conferência do meio da sprint (quarta 11/11)

A preencher pela Alissa até as 20h de quarta. Para a US-21a, a US-31 e a US-04b: implementação pronta? Testes escritos? O que falta? A que não estiver pronta sai da sprint nesta noite. Para as de quarta (SEC-04, US-09 e US-24a): PRs abertos e aprovados com texto até as 18h?

## Pontos de atenção

- **Nenhum código dos guias foi executado no planejamento.** Quem implementa é a primeira pessoa a rodar migração, lint, build e testes. Trecho que não compilar: corrigir e registrar aqui.
- **Depois da TS-05, o CLI é `npx --yes supabase@3.0.0`, e `db push` sem `--remote` vai para o banco local.** A versão 3 pergunta antes de mudar o banco hospedado; responder `y` só depois de conferir a lista. Antes da TS-05 integrar, continua a 2.119.0.
- **`npm run db:stop` antes de trazer a `main` com a TS-05:** os containers da versão 2 param com a versão 2.
- **Variável nova não começa com `SUPABASE_`** (o CLI 3 lê `SUPABASE_*` dos `.env`) **nem com `NEXT_PUBLIC_` se for segredo** (SEC-06). A da US-24a é `CHAVE_SECRETA_DO_SUPABASE`.
- **Tabela nova com `grant` explícito** para `authenticated`.
- **Ordem dos gatilhos em `donations_cash`:** `exigir_motivo_na_correcao` (US-04b), `liquido_da_doacao` (US-35), `trilha_de_auditoria` (SEC-04), em ordem alfabética.
- **Depois do merge da US-09, todos rodam `npm ci`** (dependência nova, `read-excel-file`).
- **Depois do merge da SEC-04, a exclusão de doação de item pede motivo**, na tela e na função do banco.
- **Depois do merge da US-04b, corrigir valor de doação em dinheiro pela API exige `motivo_da_alteracao`**: testes que corrigem valor (US-35) mudam.
- **O backup só roda depois do merge** (o GitHub só oferece "Run workflow" para rotinas da `main`). O cartão da US-24b vai para Concluído depois da restauração de teste.
- **Nada do Instituto no banco de produção pela equipe:** não aprovar o termo, não cadastrar a Ana, não importar planilha.
- **Sem chave, senha, token, e-mail real ou URL do banco** neste arquivo, no Trello ou no PR.

## Pendências que seguem

- **Antes do primeiro PR da sprint:** integrar o PR #63 e o PR do encerramento da Sprint 6, e só depois este planejamento. No índice `docs/sprints/README.md`, acrescentar a linha da Sprint 7 (texto no `Planejamento_Sprint7.md`, no Projeto).
- **Trello, à mão:** membros nos dez cartões; etiqueta "SPRINT 7" (as ferramentas do Claude não põem membro nem criam etiqueta).
- **Planilha do burndown:** lançar o acréscimo de 9 SP na Sprint 7 (Mateus).
- **Convites do Supabase** para a Alissa e a Laís (Mateus, fim de semana).
- **Bucket `backups` e os quatro segredos da US-24b** (Mateus, antes de terça).
- **`CHAVE_SECRETA_DO_SUPABASE` na Vercel**, só em Production (Mateus, antes do merge da US-24a).
- **Perguntas 17 e 18 à Nílian** (Mateus, segunda).
- **Responder à Flávia** se o agradecimento é mensagem de texto (pergunta 3) e combinar a chave do backup antes de 11/11 (Mateus).
- **Cobrar da Nílian** o envio das planilhas por e-mail (Mateus). As perguntas 4, 7 e 8 foram respondidas em 09/11.
- **Recibo com CNPJ, assinatura e logo** (resposta 12): ajuste em `lib/instituto.ts` e a logo, a planejar; falta o endereço.
- **Da Sprint 6:** SEC-07 (diferença entre as 16 moderadas do registro e as 8 do `npm audit` de 04/11, não investigada); conferências da BUG-01, da BUG-02 e da US-19 e o esquema `backup_us11` no banco antigo, sem registro.

## Decisões

| Data | Decisão |
| --- | --- |
| 06/11 | Sprint 7 com 45 SP comprometidos em 9 itens e a US-04b como extra (5 SP), a pedido do Mateus, com mais stories para ele (18 SP + 5) |
| 06/11 | US-21 dividida: US-21a (agradecimento com um clique pelo WhatsApp ou e-mail da coordenação, 8 SP, nesta sprint) e US-21b (envio automático por e-mail, 5 SP, backlog). O envio fica travado no banco até o Instituto aprovar o termo |
| 06/11 | US-24 dividida: US-24a (gestão de usuários, 5 SP) e US-24b (backup diário, 3 SP) |
| 06/11 | US-35 estimada em 5 SP: o banco de dados calcula o líquido da doação com a taxa em vigor; banco "Doação Solutions" só para doações; recibo e atendimentos continuam em bruto até a resposta 8 |
| 06/11 | US-31 reestimada de 5 para 8 SP: comissão por doação, com quem captou, numa tabela só da coordenação; só doações até a resposta 7 |
| 06/11 | TS-05 nova (1 SP): Supabase CLI 3.0.0 fixado, `[local_smtp]` no `config.toml` |
| 06/11 | SEC-04 e US-09 saem da espera: a resposta do Instituto muda quem pode corrigir e quais planilhas, e não a implementação |
| 06/11 | US-04b com a regra provisória mais segura: só a coordenação corrige e cancela, com motivo. Venda: só cancelar (corrigir é cancelar e registrar de novo) |
| 06/11 | US-24a com senha provisória e troca no primeiro acesso, no lugar do convite por e-mail: sem e-mail próprio configurado, o Supabase só entrega e-mail para a equipe do projeto |
| 06/11 | O `PROGRESSO.md` passa a ser atualizado por quem integra cada item (ação da retrospectiva da Sprint 6) |

## Registro

| Data | O que aconteceu |
| --- | --- |
| 06/11 | Planejamento da Sprint 7: proposta de 32 SP validada, depois ampliada para 45 SP e a extra a pedido do Mateus. Mensagem com 16 perguntas ao grupo da Flávia e da Nílian. Registro completo no `Planejamento_Sprint7.md` do Projeto |
| 06/11 | Guias, README e este progresso escritos em `docs/sprints/sprint-7/` a partir da `main` de 06/11 (PR #67), sem execução de código. Matriz de permissões com as linhas da Sprint 7, marcadas "(Sprint 7, ...)" |
| 06/11 | À noite, a Flávia respondeu 13 das 16 perguntas (1, 2, 4 a 6 e 9 a 16), registradas na tabela "Respostas do Instituto". Sem resposta: 3 (a Flávia perguntou de volta), 7 e 8 (Nílian). Nenhuma story muda nesta sprint antes de decidir os pontos da seção "Pontos a decidir" |
| 09/11 | Respostas atualizadas: a Nílian respondeu as perguntas 4 (concorda com a Flávia: balcão também corrige), 7 (comissão de 25% sobre o líquido, em vendas e doações, ajustável, marcada por registro), 8 (bruto, líquido só na maquininha) e 13 (treinamento de 23 a 27/11, de manhã); a Flávia corrigiu a 10 (só a coordenação cadastra usuários). Continua sem resposta a 3. A 4 e a 7 mudam a US-04b e a US-31 (seção "Pontos a decidir") |

## Encerramento

A preencher em 13/11.
