# Sprint 6 · progresso

**Período:** 31/10 a 06/11/2026 · **Situação:** em andamento · **Atualizado em:** 05/11/2026, com o uso do `camaleao-producao` até o início do uso pelo Instituto (homologação, limpeza no fim e contas de conferência para a equipe); antes, em 04/11 às 21h55, a BUG-03, a US-29, a SEC-07, a TS-03, a US-33 e a US-34 integradas (11 de 40 SP), a migração da US-33 no `camaleao-producao`, a US-30 e a US-04a em revisão e as respostas do Instituto

Plano da sprint: [README.md](README.md).

## Resumo

- **30/10, replanejamento:** 12 itens, 40 SP (BUG-03, US-29, TS-03, US-04a, US-33, US-34, SEC-07, US-28, US-27, US-30, US-16 e US-32), com os 13 retornos da avaliação do Instituto. Começou com 25 SP às 14h e foi a 40 SP no ajuste das 15h, com mais trabalho para a Bibiana. Guias escritos nesta pasta a partir da `main` de 30/10 (PR #50), sem execução de código.
- **01/11, domingo:** plano integrado à `main` (PR #51, aprovado pela Laís). US-33 implementada e verde no local (PR #53, em revisão com a Laís). US-16 adiantada sem esperar a US-04a, a US-27 e a US-28 (PR #52, rascunho): falta trazer essas três na quinta à noite.
- **03/11, terça:** BUG-03 integrada (PR #55, 17h52). US-29 (PR #57) e US-34 (PR #56) abertas e aprovadas à noite. Respostas do Instituto recebidas pelo Mateus: o Instituto não usa o sistema, nem para teste, até as melhorias ficarem prontas, então a virada (TS-03) não depende mais de data.
- **04/11, quarta:** US-29 integrada (PR #57, 8h37). Limite do valor muito alto mantido em R$ 1.000. **2 de 40 SP integrados.** US-34 aprovada e aberta; US-33 esperando a revisão da Laís; US-16 em rascunho. SEC-07, US-04a, US-27, US-28, US-30 e US-32 (29 SP) sem branch no GitHub. **Virada feita às 14h** (TS-03, versão curta): o sistema publicado passou para o `camaleao-producao`; contas reais e categorias finais ficam para o início do uso. US-33 com o rótulo "Custo" aplicado, esperando a Laís. **À tarde:** US-33 aprovada pela Laís (14h36); registro da TS-03 aberto (PR #59, 14h38) e aprovado pela Laís (15h44); SEC-07 aberta pela Laís (PR #61, 15h38), com o `zod` corrigido e a esteira auditando também as dependências de desenvolvimento; alertas do Dependabot ligados pelo Mateus; US-30 assumida pelo Mateus no lugar da Bibiana e aberta (PR #62, 15h45). **SEC-07 integrada às 16h16** (PR #61, merge da Laís, aprovada pelo Mateus): **5 de 40 SP integrados.** Sem branch, US-04a, US-27, US-28 e US-32 (23 SP). **TS-03 integrada às 16h29** (PR #59, junto com o PR #58, merge da Laís). Laís avisou a equipe para trazer a `main` e rodar `npm ci`; Mateus fez nas quatro branches dele, verde na US-16 (fumaça 51 de 51), e respondeu às 17h30. **US-33 integrada às 17h54** (PR #53, merge do Mateus), com o `db push` da migração no `camaleao-producao` antes e a conferência no publicado depois: **10 de 40 SP integrados.** **À noite:** US-34 integrada às 18h55 (PR #56, merge da Alissa): **11 de 40 SP integrados.** US-04a aberta pela Bibiana às 21h31 (PR #64, esteira verde, revisão da Alissa), com migração renomeada para `20261102110000`. A Bibiana confirmou a troca da US-30 e concordou com o merge logo após a aprovação. Sem branch, US-27, US-28 e US-32 (18 SP).

## Ponto de partida: como a Sprint 5 terminou

- 14 de 14 SP integrados à `main` (BUG-01, BUG-02, SEC-06, TS-02 e US-19); último merge: PR #49 (TS-02), 30/10 às 10h42. Detalhes no [progresso da Sprint 5](../sprint-5/PROGRESSO.md) e no relatório da Sprint 5.
- Banco `camaleao-producao` montado só pelas migrações (13 de 13), com três contas de conferência e ensaio no preview. O sistema publicado continua no banco antigo até a virada (TS-03).
- Avaliação do Instituto: 13 retornos (Tamara 8, Nílian 5, Ana nenhum), todos encaminhados no replanejamento.
- Product Backlog: de 58 para 99 SP com o acréscimo de 41 SP (33 de user story, 7 de technical story e segurança, 1 de correção). Com os 40 SP desta sprint, sobram 59 SP, 29,5 por sprint nas Sprints 7 e 8; 36 SP deles dependem de resposta do Instituto.
- Taxas das maquininhas recebidas da Nílian em 30/10 (Sicredi e PagBank), registradas na US-32. Oito perguntas enviadas a ela no mesmo dia, respondidas até 03/11 (tabela "Respostas do Instituto").

## Stories (40 SP)

| Story | Tipo | SP | Implementa | Revisa | Branch | PR | Situação |
| --- | --- | --- | --- | --- | --- | --- | --- |
| [BUG-03](BUG-03.md) · Botões fora da tela na janela de nova pessoa | Correção | 1 | Laís | Mateus | `bug-03-janela-nova-pessoa` | [#55](https://github.com/mateustrevisan-ufcspa/camaleao-/pull/55) | **Concluída.** Aprovada e integrada em 03/11 às 17h52. A correção foi além do guia: além da altura máxima e da rolagem, a janela saiu de dentro do formulário da doação, e o teste clica em Cadastrar nas duas entradas. Conferência no publicado marcada no Trello pela Laís, com print no cartão |
| [US-29](US-29.md) · Forma de pagamento na conferência do recebimento | User | 1 | Bibiana | Alissa | `us-29-forma-de-pagamento-no-financeiro` | [#57](https://github.com/mateustrevisan-ufcspa/camaleao-/pull/57) | **Integrada** em 04/11 às 8h37, aprovada pela Alissa (03/11, 22h58). Falta a conferência no publicado com a conta da coordenação e o cartão em Concluído (está em Em revisão) |
| [TS-03](TS-03.md) · Virada do sistema publicado para o banco de produção | Technical | 2 | Mateus | Laís | `docs-ts-03-virada` | [#59](https://github.com/mateustrevisan-ufcspa/camaleao-/pull/59) | **Integrada** em 04/11 às 16h29, junto com o PR #58 (merge da Laís), aprovada pela Laís (15h44). **Virada feita** em 04/11 às 14h pelo Mateus, conferida só por ele (o plano previa a Laís na conferência). Versão curta: contas reais e categorias finais saíram para o cartão "Início do uso pelo Instituto", no backlog. Falta, se a Laís puder, refazer o login das três contas de conferência no publicado, e o cartão em Concluído |
| [US-04a](US-04a.md) · Editar e excluir doação de item | User | 5 | Bibiana | Alissa | `us-04a-editar-e-excluir-item` | [#64](https://github.com/mateustrevisan-ufcspa/camaleao-/pull/64) | Em revisão, aberta pela Bibiana em 04/11 às 21h31 (previsto: 18h), esteira verde, revisão pedida à Alissa. Edição em Doações › Itens › Editar, exclusão lógica com confirmação, voluntária só no que lançou hoje, permissão por coluna. Migração `20261102110000_editar_e_excluir_item.sql`, renomeada do guia (`20261102090000`) para ficar depois da US-33: `db push` sem `--include-all`, depois da aprovação e antes do merge. No local, pela Bibiana: lint, build, fumaça (54) e acesso (51, 4 novos). `dataDeBrasilia` igual à do PR #62. A US-27 depende dela. Falta a revisão, o `db push` e o merge |
| [US-33](US-33.md) · Custo do evento | User | 3 | Mateus | Laís | `us-33-custo-do-evento` | [#53](https://github.com/mateustrevisan-ufcspa/camaleao-/pull/53) | **Integrada** em 04/11 às 17h54 (merge do Mateus), aprovada pela Laís (14h36), esteira verde depois de trazer a `main` com a SEC-07. Rótulo "Custo" na campanha, cadastro de campanha com a mesma leitura do custo da edição (`lerCusto`) e marcas "(Sprint 6, US-33)" tiradas da matriz. `db push` da `20261102100000_custo_do_evento.sql` no `camaleao-producao` antes do merge (14 de 14). Conferida no publicado pelo Mateus com a conta da coordenação: campanha de teste criada, custo alterado e diferença acompanhando. Eventos não foi aberto no publicado (mesmo componente de custo). Falta o cartão em Concluído e apagar a campanha de teste antes do início do uso |
| [US-34](US-34.md) · Confirmação de doação em dinheiro de valor muito alto | User | 1 | Alissa | Bibiana | `us-34-valor-muito-alto` | [#56](https://github.com/mateustrevisan-ufcspa/camaleao-/pull/56) | **Integrada** em 04/11 às 18h55 (merge da Alissa), aprovada pela Bibiana (03/11, 22h59) e pelo Mateus (04/11, 13h20). Limite de R$ 1.000 mantido pelo Instituto (04/11), igual ao do PR. Sem migração. Falta a conferência no publicado com a conta de caixa e o cartão em Concluído (está em Em revisão) |
| [SEC-07](SEC-07.md) · Vulnerabilidades altas nas dependências de desenvolvimento | Segurança | 3 | Laís | Alissa | `sec-07-dependencias-de-desenvolvimento` | [#61](https://github.com/mateustrevisan-ufcspa/camaleao-/pull/61) | **Integrada** em 04/11 às 16h16 (merge da Laís), de tarde e não à noite. Aprovada pelo Mateus às 16h15, no lugar da Alissa, que não chegou a revisar. Uma alta (`zod` 4.6.5, GHSA-mrhx-c7xc-m3w5, trazido pelo `eslint-plugin-react-hooks`) corrigida para 4.6.7 com `npm audit fix`, sem `--force` e sem `overrides`; o mesmo `audit fix` corrigiu uma moderada (`postcss-selector-parser` 6.1.4 para 6.1.5). `npm audit` de 18 (17 moderadas e 1 alta) para 16 moderadas do `minimatch`, que ficam fora. Esteira sem o `--omit=dev`, verde. Dependabot ligado pelo Mateus em 04/11. Aviso no grupo da equipe feito pela Laís (`git merge origin/main` e `npm ci`). Conferida no publicado pelo Mateus com a conta da coordenação, no deploy da US-33 (17h54), que já leva as dependências da SEC-07. Os acertos de texto no documento não entraram no PR #58; vão no PR deste progresso. Cartão em Concluído |
| [US-28](US-28.md) · Perfil de voluntária sem dinheiro e sem caixa | User | 5 | Laís | Mateus | `us-28-perfil-da-voluntaria` | | Não iniciada. Sem branch no GitHub em 04/11. Pela regra de corte, sai da sprint se não estiver com a implementação pronta na conferência do meio; a Laís perguntou em 04/11 se já pode começar (decisão na conferência) |
| [US-27](US-27.md) · Contagem da triagem do item doado | User | 8 | Alissa | Bibiana | `us-27-contagem-da-triagem` | | Não iniciada. Sem branch no GitHub em 04/11. Tampinha sem peso (Tamara, 03/11) |
| [US-30](US-30.md) · Somas de vendas por dia e por semana | User | 3 | Mateus (era Bibiana) | Laís | `us-30-somas-de-vendas` | [#62](https://github.com/mateustrevisan-ufcspa/camaleao-/pull/62) | Em revisão, aberta pelo Mateus em 04/11 às 15h45, esteira verde. Assumida pelo Mateus no lugar da Bibiana. Tela `/relatorios/vendas` com seletor de mês, somas por dia e por semana (bruto e líquido, horário de Brasília, semana começando na segunda, como respondeu a Nílian) e total igual ao do consolidado; só a coordenação vê. Sem migração. No local: lint, build, fumaça e consolidado (12 de 12) e acesso (46 de 46). `main` com a SEC-07 trazida em 04/11. Revisão pedida à Laís no GitHub. Falta a revisão e o merge |
| [US-16](US-16.md) · Recibo de doação | User | 3 | Mateus | Laís | `us-16-recibo-de-doacao` | [#52](https://github.com/mateustrevisan-ufcspa/camaleao-/pull/52) (rascunho) | Em andamento. Recibo de dinheiro e de item, link na lista e na ficha; lint, build, fumaça e acesso verdes no local. Falta, na quinta: trazer a US-04a (link vai para a célula de ações, antes de "Editar"), a US-27 (quantidade da triagem no recibo) e a US-28 (teste da voluntária); tirar a marca "(Sprint 6, US-16)" da matriz. Dados do Instituto "em breve" (coordenação, 03/11): por ora, só o nome |
| [US-32](US-32.md) · Taxas de cartão cadastradas pela coordenação | User | 5 | Bibiana | Mateus | `us-32-taxas-de-cartao` | | Não iniciada. Sem branch no GitHub em 04/11. Respostas da Nílian mudam a migração e um teste (Pontos de atenção) |

## Respostas do Instituto

| Pergunta | Para quem | Enviada em | Resposta | Aplicada em |
| --- | --- | --- | --- | --- |
| Data da virada e da revisão | coordenação | 03/11 | Virada quando a equipe quiser: o Instituto não usa o sistema, nem para teste, até todas as melhorias ficarem prontas. Revisão da sprint: sem resposta | TS-03 (virada antes do primeiro `db push`) |
| Perfil de cada pessoa (Tamara voluntária, Ana caixa, Nílian coordenação) | coordenação | 03/11 | No começo, só as três usam o sistema. Os perfis seguem o plano (o perfil de cada uma não foi confirmado à parte) | TS-03, US-28 |
| Tampinhas continuam por peso? Cabelos e perucas em Diversos? | Tamara | 03/11 | Tampinha sem peso; cabelos e perucas em Diversos | US-27 (Peso sai também da tampinha) |
| Pix na Sicredi tem taxa? | Nílian | 30/10 | Não tem taxa | US-32 (0% na carga da migração) |
| Stone e PIX TON ainda são usados? | Nílian | 30/10 | Pode tirar | US-32 (`active = false` na migração) |
| Quais são os "outros cartões" do débito? | Nílian | 30/10 | Elo, Banri, BaneseCard, Cabal, Afinz, entre outros | US-32 (rótulo da bandeira) |
| Como as doações entram pela PagBank? | Nílian | 30/10 | Por cartão cadastrado no site antigo (hoje o site usa a Doação Solutions) e por Pix na chave da PagBank, sem taxa (exemplo: o Natalenço) | US-35 (backlog) |
| Doação bruta ou líquida nos relatórios? | Nílian | 30/10 | Os dois, de preferência; se não der, o líquido | US-35 (backlog) |
| Em que dia a semana começa na planilha? | Nílian | 30/10 | Segunda-feira, na planilha do brechó | US-30 (igual ao guia) |
| A quem a comissão é paga? | Nílian | 30/10 | Hoje à Ana, mas pode haver outras pessoas na captação. Querem ver o valor por doação e somar o mês todo ou só algumas doações | US-31 (backlog; muda o desenho, reestimar) |
| Rótulo do custo da campanha | Nílian | 30/10 | Só "Custo". Em 04/11, confirmou que o custo só precisa ser preenchido (campo à mão, sem cálculo) | US-33 (aplicado em 04/11) |
| Limite do valor muito alto (proposta: R$ 1.000) | coordenação | 03/11 | Em 03/11, R$ 10.000; em 04/11, o Instituto confirmou que pode manter R$ 1.000 | US-34 (R$ 1.000, como no PR #56) |
| Nome, CNPJ e endereço do Instituto no recibo; alguém assina? | coordenação | 03/11 | Em breve | US-16 (segue só com o nome) |
| O Pix da PagBank tem 0,19% (taxas de 30/10) ou é sem taxa (resposta sobre as doações)? | Nílian | | | US-32, US-35 |
| Sem peso, a tampinha fica com quantidade, ou só o registro de que chegou? | Tamara | | | US-27 |
| A revisão da sprint com o Instituto continua na sexta 06/11? | coordenação | | | Encerramento |

## Publicações no sistema publicado

Uma linha por merge e por migração. "Conferido" diz com qual conta de conferência e o que foi refeito.

| Data | Aviso no grupo | Migração (banco atual / `camaleao-producao`) | Merge | O quê | Quem | Conferido |
| --- | --- | --- | --- | --- | --- | --- |
| 03/11, 17h52 | não registrado | sem migração | PR #55 | BUG-03 | Laís | Marcado no Trello pela Laís, com print no cartão; a conta usada não foi registrada aqui |
| 04/11, 8h37 | não registrado | sem migração | PR #57 | US-29 | a registrar | Pendente |
| 04/11, 14h | sem aviso (o Instituto não usa o sistema) | `camaleao-producao`: 13 de 13, sem pendência | Redeploy da `main` (PR #57), sem cache | Virada (TS-03) | Mateus | Mateus, com as três contas de conferência (seção "Virada (TS-03)") |
| 04/11, 16h16 | sem aviso no grupo do Instituto; na equipe, aviso da Laís para `npm ci` | sem migração | PR #61 | SEC-07 | Laís | Mateus, com a conta da coordenação, no deploy da US-33 (linha abaixo), que já leva as dependências da SEC-07 |
| 04/11, 16h29 | sem aviso (só documentação) | sem migração | PR #58 e PR #59 | Progresso e registro da TS-03 | Laís | Não se aplica |
| 04/11, 17h54 | sem aviso (o Instituto não usa o sistema) | `camaleao-producao`: `20261102100000` por `db push` antes do merge, 14 de 14 nas duas colunas depois | PR #53 | US-33 | Mateus | Mateus, com a conta da coordenação: login, campanha de teste criada, custo alterado e diferença acompanhando. Eventos não foi aberto. A campanha de teste ficou no `camaleao-producao` |
| 04/11, 18h55 | não registrado | sem migração | PR #56 | US-34 | Alissa | Pendente (conta de caixa) |

## Virada (TS-03)

Feita em 04/11, de dia, sem aviso ao Instituto, que não está usando o sistema. Versão curta: sem contas reais e sem as categorias finais, que ficam para o início do uso.

| Passo | Hora | Quem | Resultado |
| --- | --- | --- | --- |
| CLI ligado ao `camaleao-producao` | antes das 14h | Mateus | `supabase/.temp/project-ref` com a ref do `camaleao-producao` |
| `migration list` | antes das 14h | Mateus | 13 de 13 nas duas colunas, até `20261028090000`, sem pendência. A `20261102100000` (US-33) só na coluna Local, porque o CLI estava na branch da US-33; não foi aplicada |
| Variáveis da Vercel | antes das 14h | Mateus | As duas do projeto antigo ficaram só em Preview; `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` do `camaleao-producao`, as duas do mesmo projeto, criadas só em Production, tipo Config. Valores antigos guardados fora do repositório, para a volta |
| Redeploy de produção | 14h | Mateus | Último deploy da `main` (PR #57), sem cache |
| Conferência no sistema publicado | depois das 14h | Mateus | Login das três contas de conferência; conta do banco antigo recusada; menu de cada perfil como na matriz; nova venda e nova doação abrem com as listas; listas, Relatórios e Financeiro vazios |
| Contas reais e categorias | | | Para o início do uso pelo Instituto (cartão no backlog) |

**Desvio do plano:** a Laís não participou da conferência. Ela revisa o registro no PR de documentação.

**Como voltar:** repor em Production as duas variáveis do projeto antigo e fazer um novo deploy. O banco antigo não mudou na virada.

## Conferência do meio da sprint (quarta 04/11)

A preencher pela Laís até as 20h de quarta. Para cada story de quinta (US-28, US-27, US-30, US-16 e US-32): implementação pronta? Testes escritos? O que falta? A que não estiver pronta sai da sprint nesta noite (regra de corte). Para as de quarta: PRs abertos e aprovados até as 18h?

## Pontos de atenção

- **Nenhum código dos guias foi executado no planejamento.** Quem implementa é a primeira pessoa a rodar migração, lint, build e testes. Trecho que não compilar: corrigir e registrar aqui.
- **Correções nos guias, achadas na execução (01/11):**
  - US-33: o `lerCusto` do guia aceitava texto como "abc" e gravava zero, porque o `parseMoney` devolve 0 para texto inválido; a versão do PR recusa.
  - US-33: `getByLabel('Custo estimado')` passou a casar também com o botão "Alterar custo estimado"; os testes usam `exact: true`.
  - US-33: o teste da US-12 achava o mesmo valor no arrecadado e na diferença (custo zero) e falhava no modo estrito; a célula do arrecadado ganhou `data-testid`.
  - US-16: o link de recibo da lista de itens fica numa coluna própria até a US-04a criar a célula de ações.
- **`node_modules` desatualizado quebra o build** ("Can't resolve 'write-excel-file/node'") e a fumaça ("Cannot find module 'fflate'"). Depois de trazer a `main`, rodar `npm ci`.
- **`.next` antiga quebra o build depois de trocar de branch** ("Cannot find module '../../../app/(admin)/relatorios/vendas/page.js'" em `.next/dev/types/validator.ts`). O `npm run dev` gera tipos das rotas da branch em que rodou, e o `tsconfig.json` inclui `.next/dev/types`. Ao trocar para uma branch com outras rotas, rodar `rm -rf .next` antes do build (04/11, da US-30 para a US-16).
- **Desde a virada (04/11, 14h), migração só por `db push` no `camaleao-producao`.** Nada de SQL Editor no banco antigo. Antes de todo `db push`, conferir `supabase/.temp/project-ref` e rodar o `migration list`.
- **Supabase CLI sempre com a versão: `npx --yes supabase@2.119.0`.** O CLI não está no `node_modules`; sem a versão, o `npx` baixa a 3.0.0, que recusa o `[inbucket]` do `supabase/config.toml` e para antes de conectar (04/11, no primeiro `migration list` da US-33; nada foi aplicado). Atualizar para a 3.x pede trocar `[inbucket]` por `[local_smtp]`: candidato a story técnica, fora desta sprint. O `project-ref` não termina com quebra de linha, então o `cat` pode sumir atrás da mensagem do `npx`; o nome do projeto ligado está em `supabase/.temp/linked-project.json`.
- **Na virada, a URL e a chave publicável vêm do mesmo projeto** (erro da primeira tentativa do ensaio da TS-02).
- **Depois da virada, o preview aponta para o banco antigo,** que não recebe as migrações novas. Tela nova testada no preview pode dar erro por falta de tabela; o teste que vale é o local.
  - Em 05/11: o preview fica assim. Story com migração é conferida no publicado (`camaleao-producao`), depois do `db push` e do merge.
- **Dado de teste no `camaleao-producao` (desde 05/11):** só dado inventado, nunca nome, telefone, e-mail ou CPF de pessoa real. Pessoa, campanha ou evento de teste com "TESTE" no nome, para achar fácil. Tudo some na limpeza do início do uso (roteiro em `docs/processo/banco-de-producao.md`).
- **US-04a antes da US-27** no mesmo formulário; **US-29 antes da US-32** no mesmo financeiro; **SEC-07 primeiro na quarta,** porque troca o `package-lock.json`.
- **A ordem das migrações importa para o `db push`.** Se uma story com migração de nome anterior integrar depois de outra, usar `--include-all` (README, "Publicação e migrações").
- **Sem chave, senha ou token** neste arquivo, no Trello ou no PR. E-mail das contas reais do Instituto também não vai para arquivo versionado.
- **Seis stories sem branch no GitHub em 04/11** (SEC-07, US-04a, US-27, US-28, US-30 e US-32, 29 SP). O plano pedia branch com push no fim de semana. A SEC-07 e a US-04a têm PR previsto para hoje às 18h, e a US-27 depende da US-04a. Entra na conferência do meio.
  - Às 16h de 04/11, a SEC-07 (PR #61) e a US-30 (PR #62) já estavam abertas; seguem sem branch a US-04a, a US-27, a US-28 e a US-32 (23 SP).
  - Às 21h55 de 04/11, a US-04a também está aberta (PR #64); seguem sem branch a US-27, a US-28 e a US-32 (18 SP).
- **Depois do merge da SEC-07, todos trazem a `main` e rodam `npm ci`,** porque o `package-lock.json` muda. Vale também para as branches abertas (US-16, US-30, US-33 e US-34). A SEC-07 entrou às 16h16 de 04/11.
- **Dependabot dispensa sozinho os alertas de dependências de desenvolvimento** (fez isso com o do `zod`). Quem trava vulnerabilidade alta em desenvolvimento é o `npm audit --audit-level=high` da esteira.
- **`npm audit` às 18h de 04/11: 8 moderadas, todas do `minimatch`,** e não as 16 do registro da SEC-07. A US-33 não mexeu no `package-lock.json`; a diferença não foi investigada. Não rodar `npm audit fix --force` (instalaria o `eslint-config-next` 15.5.29).
- **US-30 e US-04a com a mesma função `dataDeBrasilia`** em `lib/utils.ts` (Parte C da US-04a). O PR #62 escreveu igual ao guia da US-04a, para as duas juntarem sem conflito; quem integrar por último confere que ficou uma só.
  - Às 21h55 de 04/11: o trecho em `lib/utils.ts` é idêntico no PR #62 e no PR #64 (mesmo diff contra a `main`).
- **Proposta para os merges (Mateus, 03/11, a confirmar no grupo da equipe):** enquanto o Instituto não usa o sistema, merge assim que o PR for aprovado, sem esperar a noite e sem aviso no grupo do Instituto. A ordem das migrações, o `db push` antes do merge e a conferência no publicado continuam.
  - Em 04/11 à noite, a Bibiana concordou. Faltam a Laís e a Alissa confirmarem no grupo. Na prática, SEC-07, US-33 e US-34 já entraram assim.
- **Ajustes da US-32 pelas respostas da Nílian:**
  - na carga da migração, `('PIX SICREDI', 'pix', false, null::text, 0.00)`;
  - `update public.banks set active = false where name in ('Stone', 'PIX TON');`;
  - rótulo de "Outras bandeiras" com os exemplos (Elo, Banri, Cabal...), e o teste que escolhe esse rótulo muda junto;
  - o teste "sem taxa cadastrada" usa a Stone, que será desativada, e no seed não sobra combinação sem taxa: o teste precisa de um banco criado só para ele;
  - conferir se o formulário de venda esconde banco inativo.
- **Ajuste da US-27:** tampinha sem peso. Os testes `doacao-de-itens`, `relatorio-consolidado` e `contribuicao-no-periodo` usam tampinha com peso e mudam. Doações antigas de tampinha continuam com o peso gravado.

## Pendências que seguem

- **No Trello, à mão:** pôr os membros nos cartões; apagar o checklist "APAGAR · critérios do backlog original" da US-16 (as ferramentas do Claude não fazem nenhuma das duas coisas).
- **No Trello:** US-33 para revisão (Mateus; a US-16 foi para Em andamento em 01/11). US-34 para Em revisão (está em Em andamento). US-29 para Concluído depois da conferência no publicado. SEC-07 e US-30 para Em revisão; na US-30, o Mateus no lugar da Bibiana. Critérios da SEC-07 marcados pela Laís.
  - Às 16h20 de 04/11: TS-03 e US-34 movidas para Em revisão e comentário com a situação em SEC-07, TS-03, US-34, US-30 e US-33 (Mateus, pelo Claude). Seguem: US-29 para Concluído depois da conferência da Bibiana; tirar a Bibiana dos membros do cartão da US-30 (à mão); pedir a revisão da Laís no PR #62, que está sem revisor.
  - Às 18h05 de 04/11: revisão da Laís pedida no PR #62. No Trello, seguem: US-33 e TS-03 para Concluído; tirar a Bibiana dos membros do cartão da US-30 (à mão); registrar no cartão da SEC-07 a conferência do deploy (Mateus, 17h54).
  - Às 21h55 de 04/11: US-04a para Em revisão, com o PR #64; US-34 para Concluído depois da conferência com a conta de caixa.
- **TS-03:** a Laís refaz, se puder, o login das três contas de conferência no publicado (pedido no PR #59).
  - Em 05/11: o Mateus envia os logins das três contas de conferência à Laís, à Alissa e à Bibiana, fora do grupo do Instituto e fora de arquivo, Trello e PR. Com eles, cada uma confere no publicado as próprias stories.
- **Campanha de teste da US-33 no `camaleao-producao`:** criada pelo Mateus na conferência de 04/11. Apagar antes do início do uso pelo Instituto (cartão "Início do uso pelo Instituto").
  - Em 05/11: sai na limpeza das tabelas de movimento, no início do uso; não precisa ser apagada antes.
- **Cartão "Início do uso pelo Instituto" (Trello):** pôr a limpeza como primeiro passo, antes das contas reais e das categorias, e a desativação das contas de conferência (decisões de 05/11).
- **Diferença entre o Trello e este arquivo (04/11):** na BUG-03, o Trello marca "registrar no PROGRESSO.md" como feito em 03/11, mas o registro só entrou nesta atualização. A conta usada na conferência da BUG-03 não foi registrada.
- **Diferença entre o Trello e o GitHub (04/11, SEC-07):** o cartão foi para Concluído com tudo marcado, inclusive "Alissa: revisar" e "integrar na quarta à noite, conferir o deploy". No GitHub, quem aprovou foi o Mateus, e o merge foi às 16h16. A tarefa da revisão foi reescrita no cartão com o que aconteceu; a conferência do deploy não tem registro.
- **Mensagem à equipe com as respostas do Instituto** e os ajustes da US-27, US-32 e US-34 (Mateus, 04/11).
- **Perguntas novas ao Instituto** (Mateus): as três últimas linhas da tabela "Respostas do Instituto".
- **Planilha do burndown:** lançar o acréscimo de 41 SP na Sprint 6 (Mateus).
- **Da Sprint 5:** conferências da BUG-01, da BUG-02 e da US-19 no sistema publicado; conferir se o esquema `backup_us11` foi apagado do banco publicado.
- **Do Instituto:** tabela "Respostas do Instituto" acima; termo de mensagens (US-21); planilhas (US-09); datas de treinamento (US-25); quem corrige lançamento com dinheiro (US-04b e SEC-04).

## Decisões

| Data | Decisão |
| --- | --- |
| 30/10 | Sprint 6 com 40 SP em 12 itens, com a Bibiana em 14 SP; a US-32 é a última da fila dela e, sem aprovação na quinta 18h, volta ao backlog (sprint fecha com 35 SP) |
| 30/10 | US-04 dividida em US-04a (doação de item, 5 SP, nesta sprint) e US-04b (venda e doação em dinheiro, 5 SP, com a SEC-04) |
| 30/10 | US-27 estimada em 8 SP: a doação de item tem dois momentos, entrada e triagem, e a voluntária registra a triagem de dias anteriores alterando só as contagens |
| 30/10 | Comissão e custo do evento: campo preenchido à mão pela coordenação, sem cálculo pelo sistema (decisão de 29/10, mantida) |
| 30/10 | Taxas das maquininhas por maquininha, forma, à vista ou parcelado (taxa única para qualquer parcela) e, só no débito da PagBank, bandeira; uma linha por alteração, no padrão da US-19 |
| 30/10 | Pergunta sem resposta não trava story: cada guia tem o valor provisório, e a resposta que chegar depois vira ajuste pequeno |
| 30/10 | Doação de item excluída (US-04a) fica no banco com quem excluiu e quando, e some de toda leitura pela política do banco, e não por filtro em cada tela |
| 30/10 | Acertos de banco da US-32 (PagSeguro para PagBank e o banco "PIX PagBank") vão na migração da US-32, porque o sistema não tem tela de Configurações. Corrige a tarefa da TS-03 e a descrição da US-32 no Trello |
| 30/10 | Custo da campanha passa a ser editável depois do cadastro, na US-33; hoje ele só é informado ao cadastrar |
| 01/11 | US-16 adiantada antes da US-04a, da US-27 e da US-28, como PR em rascunho; os ajustes que dependem delas entram na quinta à noite, ao trazer a `main` |
| 01/11 | Recibo sai só com o nome do Instituto até a coordenação mandar CNPJ, endereço e quem assina; os dados ficam em `lib/instituto.ts`, e campo vazio não aparece |
| 03/11 | TS-03 sem data com o Instituto: ele não usa o sistema, nem para teste, até as melhorias ficarem prontas. A virada entra antes do primeiro `db push` da sprint (US-04a ou US-33), e nenhuma migração precisa ir para o banco antigo. A regra de corte da TS-03 (sem data até quinta, volta ao backlog) deixa de valer |
| 03/11 | Contas reais só para Tamara, Ana e Nílian. Os e-mails são pedidos à coordenação e digitados só no painel do Supabase; a senha é enviada quando o uso começar |
| 03/11 | US-31 (backlog) muda: comissão por doação, com quem captou, somada no mês ou em doações escolhidas. Reestimar no planejamento da Sprint 7 |
| 04/11 | Limite do valor muito alto (US-34) fica em R$ 1.000. Em 03/11 o Instituto falou em R$ 10.000, e em 04/11 confirmou que pode manter R$ 1.000 |
| 04/11 | Virada curta agora, em vez de adiar: sem ela, cada migração da sprint teria de entrar à mão no banco antigo, ou o sistema publicado quebraria a cada merge. Contas reais (Tamara, Ana e Nílian) e categorias finais (Roupas, Tampinhas e Diversos) saem da TS-03 para o cartão "Início do uso pelo Instituto", no backlog, para a homologação até 29/11. A TS-03 fecha nesta sprint com 2 SP |
| 04/11 | US-30 passa da Bibiana para o Mateus. A Bibiana fica com a US-04a e a US-32 (de 14 para 11 SP); o Mateus, com TS-03, US-33, US-16 e US-30 (de 8 para 11 SP). A Laís continua revisando a US-30 |
| 04/11 | O commit do registro da TS-03 (PR #59) entra também na branch deste progresso (PR #58), porque os dois mexem nas mesmas linhas deste arquivo. Integrar o #58 integra o #59 junto, sem conflito |
| 05/11 | Até o início do uso pelo Instituto, o `camaleao-producao` serve também de homologação: a conferência no publicado pode gravar dado de teste, só inventado, sem dado pessoal real. Os testes automatizados continuam só no banco local, e a regra das migrações continua (PR aprovado, `db push`, merge, conferência). O preview segue no banco antigo, sem migração nova, e não serve para conferir story com migração (Mateus) |
| 05/11 | No início do uso, limpeza só das tabelas de movimento (vendas, doações, fichas, eventos, campanhas e o que delas depende), pelo SQL Editor, com contagem antes e depois. Tabelas de referência que vêm das migrações (formas de pagamento, bancos, categorias, origens do caixa, etiquetas, valor do atendimento e, com a US-32, as taxas) e as contas ficam; o que foi alterado nelas nos testes é revisto com a coordenação. Sem `db reset --linked`: sem o `--no-seed`, ele rodaria o `seed.sql`, com senha publicada no repositório, no projeto hospedado. Roteiro em `docs/processo/banco-de-producao.md` (Mateus) |
| 05/11 | As três contas de conferência passam a ser da equipe toda: a Laís, a Alissa e a Bibiana recebem os mesmos logins do Mateus. No início do uso, as três ficam desativadas (`active = false`) e só voltam para uma conferência, porque a conta da coordenação vê os dados reais (Mateus) |

## Registro

| Data | O que aconteceu |
| --- | --- |
| 30/10 | Replanejamento da Sprint 6: 13 retornos da avaliação encaminhados; 12 itens e 25 SP às 14h; ajuste para 40 SP às 15h, com US-30, US-32, US-16, SEC-07 e US-34. Registro completo no `Planejamento_Sprint6.md` do Projeto |
| 30/10 | Trello: lista renomeada para "Selecionado · Sprint 6 (31/10 a 06/11) · 40 SP"; cartões novos BUG-03, US-04a, US-28, US-29, US-30, US-31, US-32, US-33, US-34, US-35, TS-03, TS-04 e SEC-07; US-04 renomeada para US-04b; checklists "Critérios de Aceitação" e "Tarefas da Sprint 6" nos doze cartões da sprint; etiqueta "SPRINT 6" nos doze |
| 30/10 | Taxas da Nílian registradas na US-32; mensagem com 8 perguntas enviada a ela pelo Mateus |
| 30/10 | Guias, README e este progresso escritos em `docs/sprints/sprint-6/` a partir da `main` de 30/10 (PR #50), sem execução de código. Matriz de permissões com as linhas da Sprint 6, marcadas "(Sprint 6, US-xx)" |
| 30/10 | Na escrita dos guias, dois desvios dos cartões: o sistema não tem tela de Configurações, então PagBank e o Pix da PagBank entram na migração da US-32; e o custo da campanha não é editável hoje, então a US-33 inclui a edição. Cartões da TS-03, US-32 e US-33 corrigidos no Trello |
| 30/10 | PR #51 (`docs-sprint-6-planejamento`) aberto com este plano, os doze guias, a matriz e o índice das sprints; integra à noite, antes dos PRs de terça. Trello: tarefa de PagBank da TS-03 reescrita, descrições da US-32 e da US-33 com a correção e o caminho do guia, critério novo na US-33 (custo da campanha editável) e um comentário com o guia em cada um dos doze cartões |
| 01/11 | US-33 implementada (`us-33-custo-do-evento`): migração do custo do evento com a view `events_totals` refeita, custo editável em eventos e campanhas, diferença na tela. Lint, build, fumaça e acesso (10 de 10) verdes no local, depois de `npm ci` e da correção do teste da US-12 |
| 01/11 | US-16 implementada (`us-16-recibo-de-doacao`): página `/recibo/[tipo]/[id]` para imprimir ou salvar em PDF, link nas listas de dinheiro e de itens e na ficha. Lint, build, fumaça (13 de 13) e acesso do recibo (3 de 3) verdes no local. PR #52 aberto como rascunho |
| 01/11 | PR #51 (plano da Sprint 6) aprovado pela Laís e integrado às 16h59. PR #53 (US-33) aberto às 16h59, com revisão da Laís |
| 02/11 | PR #54 (progresso de 01/11) integrado às 20h37. PR #55 (BUG-03) aberto pela Laís |
| 03/11 | BUG-03: PR #55 aprovado e integrado às 17h52. Quatro commits: o teste em tela baixa (esteira vermelha), a altura máxima com rolagem e, além do guia, a janela fora do formulário da doação, com o teste clicando em Cadastrar nas duas entradas. No Trello, a Laís marcou critérios, tarefas e conferência e moveu o cartão para Concluído às 17h53 (print no cartão às 18h22) |
| 03/11 | US-34: Alissa implementou a confirmação e o teste e abriu o PR #56 (Trello, 18h02); aprovado pela Bibiana (Trello, 22h59) |
| 03/11 | US-29: Bibiana mostrou a forma de pagamento e as parcelas no financeiro, com teste de fumaça, e abriu o PR #57; aprovado pela Alissa às 22h58 |
| 03/11 | Mateus recebeu as respostas da coordenação, da Tamara e das oito perguntas da Nílian, registradas na tabela "Respostas do Instituto" |
| 04/11 | US-29: PR #57 integrado às 8h37. Limite da US-34 mantido em R$ 1.000. No GitHub: US-34 aprovada e aberta, US-33 sem aprovação, US-16 em rascunho; SEC-07, US-04a, US-27, US-28, US-30 e US-32 sem branch. 2 de 40 SP integrados |
| 04/11 | Este progresso atualizado pelo Mateus a partir do Trello (histórico desde 01/11) e do GitHub (`gh pr list`, `git log origin/main`), na branch `docs-progresso-sprint-6-0411` |
| 04/11 | Nílian confirmou que o custo só precisa ser preenchido. US-33: rótulo "Custo" na campanha, cadastro de campanha com `lerCusto` (texto inválido passa a ser recusado, com o mesmo aviso da edição) e marcas tiradas da matriz; lint, build, fumaça (8 de 8) e acesso (10 de 10) verdes no local; enviado ao PR #53 |
| 04/11 | TS-03: virada do sistema publicado para o `camaleao-producao` às 14h, feita e conferida pelo Mateus (seção "Virada (TS-03)"). A partir daqui, migração só por `db push` no `camaleao-producao` |
| 04/11 | Trello: critérios de contas reais e categorias tirados da TS-03 e levados para o cartão novo "Início do uso pelo Instituto", no backlog |
| 04/11 | US-34: PR #56 aprovado também pelo Mateus às 13h20. US-33: PR #53 aprovado pela Laís às 14h36 |
| 04/11 | TS-03: PR #59 (registro da virada) aberto pelo Mateus às 14h38, a partir da branch deste progresso; aprovado pela Laís às 15h44 |
| 04/11 | SEC-07: a Laís abriu o PR #60 às 15h11, pelo editor do GitHub, preenchendo a tabela do guia `SEC-07.md` com o `zod`; o lugar da tabela é o PR. PR #61 aberto às 15h38 com três commits (`npm audit fix`, esteira e documento). Na revisão do #60, o Mateus conferiu o alerta (GHSA-mrhx-c7xc-m3w5, alto, corrigido na 4.6.6), fechou o #60 às 15h54 com comentário, levou a tabela para o corpo do #61 (com "Trazido por" corrigido para `eslint-config-next → eslint-plugin-react-hooks`), acertou o título e pediu três ajustes no documento |
| 04/11 | Dependabot: alertas ligados pelo Mateus (Settings, Code security); "Dependabot security updates" desligado, como no guia da SEC-07 |
| 04/11 | US-30: assumida pelo Mateus no lugar da Bibiana. PR #62 aberto às 15h45, sem migração; lint, build, fumaça e consolidado (12 de 12) e acesso (46 de 46) verdes no local; revisão da Laís |
| 04/11 | Mensagens à Laís (o que falta na SEC-07) e à Alissa (revisão do #61) preparadas pelo Mateus. A Laís perguntou se pode começar a US-28: dependência do perfil respondida em 03/11; a regra de corte fica para a conferência das 20h |
| 04/11 | Este progresso atualizado às 16h pelo Mateus a partir do GitHub (`gh pr view`, `git log origin/main`), na branch `docs-progresso-sprint-6-0411`, que passou a incluir o commit da TS-03 |
| 04/11 | PR #58 (este progresso) aprovado pela Laís às 16h12 |
| 04/11 | SEC-07: PR #61 aprovado pelo Mateus às 16h15 e integrado pela Laís às 16h16, sem a revisão da Alissa e antes dos acertos de texto pedidos na revisão. Na `main`, o Dependabot fechou os alertas do `zod` e do `postcss-selector-parser`; segue aberto o do `minimatch` (moderado). 5 de 40 SP integrados |
| 04/11 | SEC-07: acertos em `docs/seguranca/auditoria-de-dependencias.md` (zod na 4.6.7, linha do `postcss-selector-parser`, "Como repetir" sem o `--omit=dev`, frase sobre o Dependabot), no PR #58 |
| 04/11 | Trello conferido com o GitHub às 16h20 (Mateus, pelo Claude): TS-03 e US-34 para Em revisão; tarefas marcadas com a evidência (PR #59 aprovado, PR #62 aberto, pedido de dados do recibo em 03/11); tarefa de revisão da SEC-07 reescrita (Mateus no lugar da Alissa); comentários com a situação em SEC-07, TS-03, US-34, US-30 e US-33 |
| 04/11 | PR #58 (progresso) integrado pela Laís às 16h29, levando junto o PR #59 (registro da TS-03): TS-03 integrada. O commit das 17h43 na branch deste progresso (SEC-07 integrada) ficou fora do #58 e vai no PR novo |
| 04/11 | Correção do registro acima: os acertos em `docs/seguranca/auditoria-de-dependencias.md` não entraram no PR #58 (a `main` seguia com o `zod` na 4.6.6, sem o `postcss-selector-parser` e com o `--omit=dev` em "Como repetir"). Feitos às 18h05 no PR novo deste progresso, com a contagem de 8 moderadas do `npm audit` daquela hora |
| 04/11 | SEC-07: a Laís avisou a equipe para trazer a `main` e rodar `npm ci`. Mateus trouxe a `main` na branch deste progresso, na US-33, na US-30 e na US-16 e rodou `npm ci`; na US-16, lint, build e fumaça (51 de 51) verdes depois de `rm -rf .next` (tipos de rota da US-30 na `.next`). Respondeu à Laís às 17h30 |
| 04/11 | US-33: esteira do PR #53 verde depois da `main` com a SEC-07, aprovação mantida. `npx supabase` sem versão baixou o CLI 3.0.0, que parou no `[inbucket]` do `config.toml`, sem aplicar nada; refeito com `supabase@2.119.0`. `migration list` com 13 de 13 e a `20261102100000` só em Local; `db push` dela no `camaleao-producao`; 14 de 14 nas duas colunas depois |
| 04/11 | US-33: PR #53 integrado pelo Mateus às 17h54. Conferida no publicado com a conta da coordenação (campanha de teste, custo alterado, diferença acompanhando), o que confere também a SEC-07. 10 de 40 SP integrados (BUG-03, US-29, SEC-07, TS-03 e US-33) |
| 04/11 | `CLAUDE.md`: comando do Supabase na tabela de comandos com a versão fixa (`npx --yes supabase@2.119.0 status`) |
| 04/11 | US-34: PR #56 integrado pela Alissa às 18h55, sem migração. 11 de 40 SP integrados |
| 04/11 | US-04a: Bibiana abriu o PR #64 às 21h31 (commit das 21h28), esteira verde, revisão da Alissa. Migração renomeada para `20261102110000`, depois da `20261102100000` da US-33, sem `--include-all`. No grupo, avisou a Alissa (Parte F da US-27 depende da US-04a) e o Mateus (migração) |
| 04/11 | Bibiana confirmou no grupo a troca da US-30 para o Mateus e ficou com a US-04a e a US-32 (quinta). Concordou com o merge logo após a aprovação, sem janela noturna; pediu que todos confirmem no grupo |
| 04/11 | Este progresso atualizado às 21h55 pelo Mateus a partir da mensagem da Bibiana e do GitHub (`gh pr list`, `gh pr checks 64`, `git log origin/main`), no PR #63 |
| 05/11 | Decisões sobre o `camaleao-producao` até o início do uso registradas pelo Mateus (tabela "Decisões"): homologação com dado inventado, limpeza das tabelas de movimento no fim e contas de conferência para a equipe. Roteiro da limpeza escrito em `docs/processo/banco-de-producao.md`, sem execução |

## Encerramento

A preencher em 06/11.
