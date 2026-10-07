# Auditoria de dependências (US-26)

Resultado do `npm audit` antes e depois da migração para o Next.js 16, feita na branch isolada `us-26/next-16` em 01/10/2026.

## Motivo

O Next.js 14 está sem correções de segurança desde 26/10/2025 (última versão 14.2.35), e o 15 sai do suporte em 21/10/2026. As vulnerabilidades alta e crítica do `next` só são corrigidas na linha 16.

## Antes: `next@14.2.29`, `react@18`

`11 vulnerabilities (1 low, 1 moderate, 8 high, 1 critical)`

| Pacote | Severidade | Origem |
|---|---|---|
| `next` | **crítica** | direta. Inclui RCE na otimização de imagens AVIF, SSRF em Server Actions, *cache poisoning* em respostas RSC e *bypass* de middleware |
| `postcss` | alta | via `next` e direta |
| `@next/eslint-plugin-next`, `eslint-config-next` | alta | via `glob` |
| `glob`, `brace-expansion`, `js-yaml`, `nanoid`, `browserslist` | alta | transitivas |
| `baseline-browser-mapping` | moderada | transitiva |
| `postcss-selector-parser` | baixa | transitiva |

## Depois: `next@16.3.8`, `react@19.3.0`

`found 0 vulnerabilities`

## O que mudou no código

| Mudança | Por quê |
|---|---|
| `next` 14.2.29 → 16.3.8, `react`/`react-dom` 18 → 19.3 | Versões com suporte de segurança ativo |
| `@supabase/ssr` 0.5 → 0.12, `@supabase/supabase-js` ^2.49 → ^2.117.2 | Compatibilidade com React 19 / Next 16; a API usada (`getAll`/`setAll`) é a mesma |
| `middleware.ts` → `proxy.ts`, função `middleware` → `proxy` | Convenção `middleware` descontinuada no Next 16 |
| `.eslintrc.json` → `eslint.config.mjs` (flat config), ESLint 8 → 9, `npm run lint` = `eslint .` | `next lint` foi removido no Next 16 |
| `components/clients/client-profile.tsx`: carregamento derivado do id do cliente | Nova regra `react-hooks/set-state-in-effect`; a mudança também descarta a resposta atrasada de outro cliente |
| `next-env.d.ts` deixa de ser versionado | Já estava no `.gitignore`; agora o Next o gera apontando para `.next/` |
| `npm audit fix` | Corrige as transitivas restantes sem mudança de versão maior |

`cookies()` já era usado com `await`, e o código não usa `params`/`searchParams` síncronos, `revalidateTag` nem `next/legacy/image`. Por isso a mudança de APIs assíncronas não exigiu alteração.

## Verificação

- `npm run lint`: sem erros
- `npx tsc --noEmit`: sem erros
- `npm run build` (Turbopack, padrão do Next 16): sem erros nem avisos
- `npm run test:fumaca` no build de produção (`next start`) e no `next dev`: 5/5 passando (login, rota protegida, todas as telas abrem, venda, doação)

## Como repetir

```bash
npm audit                     # resumo
npm audit --audit-level=high  # sai com erro se houver alta ou crítica (será usado na esteira pela SEC-02)
```
