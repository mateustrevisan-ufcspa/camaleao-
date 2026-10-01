# Camaleão Admin

Sistema de gestão do Brechó Camaleão e das doações do Instituto Camaleão, que apoia pacientes em tratamento de câncer. Registra vendas, doações e apoiadores em uma ficha única e converte a receita em atendimentos custeados (R$ 50 por atendimento).

Projeto de Engenharia de Software II (UFCSPA, 2026/2, Prof.ª Juliana Herbert). Equipe: Alissa Gadea, Bibiana Freitas, Laís Stürmer e Mateus Trevisan.

## Stack

- Next.js com App Router: 14.2.29 hoje, migrando para 16 na US-26 (React 18 para 19)
- TypeScript 5, Tailwind CSS 3.4, `lucide-react`
- Supabase: PostgreSQL, Auth e RLS; migrações em `supabase/migrations`
- Leitura de dados só por `lib/store.ts`; escrita só por Server Actions em `actions/`
- Cliente Supabase do servidor em `lib/supabase/server.ts` (já usa `await cookies()`)

## Onde está o plano

O plano da sprint corrente está em `docs/sprints/sprint-N/`. O `README.md` da pasta traz objetivo, ordem e Definição de Pronto; cada história tem um arquivo próprio (`SEC-01.md`, `US-01.md`...) com critérios de aceitação, tarefas e comandos. O quadro de controle é o Trello; os arquivos são o guia de execução.

## Regras de trabalho

- **Não execute comandos.** O Mateus roda tudo no terminal dele. Escreva o código e indique o comando exato a rodar.
- Uma branch por história, em minúsculas: `sec-01-rotacao-credenciais`, `us-02-testes-fumaca`.
- Commits começam pelo ID da história: `US-02: teste de registro de venda`.
- Um Pull Request por história, com o checklist de critérios de aceitação no corpo.
- Definição de Pronto: critérios marcados, código revisado por outro integrante, esteira verde e funcionalidade verificada.
- Nunca escreva credencial, chave ou senha real em arquivo versionado. Valores reais ficam em `.env.local` (ignorado pelo git) e nos segredos do GitHub.
- Testes rodam contra o Supabase local (`supabase start`), nunca contra o projeto de produção.
- Mudança de esquema entra como migração nova em `supabase/migrations`; nunca edite uma migração já aplicada.
- Textos em português, sem travessão.

## Comandos

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Sobe o sistema em http://localhost:3000 |
| `npm run build` | Build de produção |
| `npm run lint` | Análise estática |
| `npm run test:smoke` | Testes de fumaça (a partir da US-02) |
| `supabase start` | Sobe o banco local com migrations e seed |
| `supabase db reset` | Recria o banco local do zero |
| `supabase status` | Mostra URL e chave anônima do banco local |
