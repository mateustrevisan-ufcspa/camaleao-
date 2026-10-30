# BUG-03 · Botões fora da tela na janela de nova pessoa (1 SP)

> Como voluntária ou caixa do brechó, eu quero ver os botões Cancelar e Cadastrar na janela de nova pessoa sem precisar reduzir o zoom, para que eu consiga cadastrar quem chega ao balcão em qualquer tela.

**Tipo:** correção · **Implementa:** Laís · **Revisa:** Mateus · **Branch:** `bug-03-janela-nova-pessoa` · **Depende de:** nada · **Publica:** terça 03/11, à noite

## Critérios de aceitação

- [ ] Com zoom em 100%, numa tela de 1366x768 e num celular de 390x844, os botões Cancelar e Cadastrar ficam visíveis ou alcançáveis rolando a janela
- [ ] A janela tem altura máxima da tela e rolagem interna; o título continua visível
- [ ] Vale nas duas entradas: Doações · Itens · Nova doação e Brechó · Nova venda
- [ ] Teste de fumaça com tela baixa abre a janela e clica em Cadastrar; o primeiro commit, só com o teste, reprova a esteira

## O problema

Retorno da Tamara (voluntária) em 29/10, com print: em Doações · Itens · Nova doação, "Cadastrar novo" abre a janela, e os botões ficam abaixo da borda da tela. Ela precisou reduzir o zoom.

Em `components/clients/new-client-modal.tsx`, o fundo escuro é `fixed inset-0` e centraliza a janela (`flex items-center`). A janela não tem altura máxima nem rolagem. Desde a US-22, ela tem o aviso do termo de mensagens, que é longo, e passou da altura de um notebook com a barra do navegador. Elemento `fixed` não entra na rolagem da página: o que passa da tela some, em cima (o título) e embaixo (os botões).

A mesma janela abre pelo "Cadastrar novo" da nova doação (dinheiro e itens) e da nova venda, então o caixa também é afetado.

## 1. Branch

```bash
git checkout main && git pull
git checkout -b bug-03-janela-nova-pessoa
git push -u origin bug-03-janela-nova-pessoa
```

## 2. Primeiro commit: só o teste (`tests/fumaca/janela-nova-pessoa.spec.ts`, arquivo novo)

As alturas são de tela útil, já sem a barra do navegador: 600 px num notebook de 1366x768 e 664 px num celular de 390x844.

```ts
import { expect, test } from '@playwright/test'
import { entrar } from './apoio'

// BUG-03 · A janela de nova pessoa cabe em tela baixa: título e botões ao alcance.
// Alturas de tela útil, sem a barra do navegador: notebook de 1366x768 e celular de 390x844.
const TELAS = [
  { nome: 'notebook 1366x768', viewport: { width: 1366, height: 600 } },
  { nome: 'celular 390x844', viewport: { width: 390, height: 664 } },
]

const ENTRADAS = [
  { nome: 'Doações · Itens · Nova doação', endereco: '/doacoes/itens/nova' },
  { nome: 'Brechó · Nova venda', endereco: '/brecho/nova-venda' },
]

for (const tela of TELAS) {
  test.describe(`Fumaça: janela de nova pessoa, ${tela.nome}`, () => {
    test.use({ viewport: tela.viewport })

    for (const entrada of ENTRADAS) {
      test(`${entrada.nome}: título visível e Cadastrar ao alcance`, async ({ page }) => {
        const nome = `TESTE BUG-03 ${Date.now()}`
        await entrar(page)
        await page.goto(entrada.endereco)

        await page.getByRole('button', { name: 'Cadastrar novo' }).click()
        await expect(page.getByRole('heading', { name: 'Novo cliente' })).toBeInViewport()

        await page.getByPlaceholder('Ex.: Roberta Lima').fill(nome)
        const cadastrar = page.getByRole('button', { name: 'Cadastrar', exact: true })
        // Sem rolagem na janela, o botão fica fora da tela e o clique não acontece.
        await cadastrar.click({ timeout: 5_000 })

        await expect(page.getByRole('heading', { name: 'Novo cliente' })).toHaveCount(0)
        await expect(page.getByText(nome).first()).toBeVisible()
      })
    }
  })
}
```

```bash
git add tests/fumaca/janela-nova-pessoa.spec.ts
git commit -m "BUG-03: teste da janela de nova pessoa em tela baixa"
git push
```

Abra o PR em rascunho já com este commit. **A esteira tem de reprovar** nos quatro testes novos, com o clique em "Cadastrar" fora da tela (ou o título fora da tela). Se passar, a tela do teste não está baixa o bastante para mostrar o problema: reduza a altura até reprovar e anote no PR a altura usada.

## 3. Segundo commit: a janela com altura máxima e rolagem (`components/clients/new-client-modal.tsx`)

A janela passa a ter três partes: o cabeçalho, que fica parado; os campos, que rolam; e o rodapé com o aviso de erro e os botões, que fica sempre à vista. O `max-h-full` mede a altura do fundo escuro menos o `p-4`, ou seja, a tela menos 2 rem.

```diff
     <div
       className="fixed inset-0 z-50 flex items-center justify-center p-4"
       style={{ backgroundColor: 'rgba(31,22,56,0.4)', backdropFilter: 'blur(2px)' }}
       onClick={(e) => e.target === e.currentTarget && onClose()}
     >
-      <div className="bg-paper rounded-[20px] w-full max-w-[440px] shadow-xl">
-        <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-rule">
+      <div
+        role="dialog"
+        aria-modal="true"
+        aria-labelledby="titulo-novo-cliente"
+        className="bg-paper rounded-[20px] w-full max-w-[440px] max-h-full shadow-xl flex flex-col overflow-hidden"
+      >
+        <div className="shrink-0 flex items-center justify-between px-7 pt-7 pb-5 border-b border-rule">
           <div>
-            <h2 className="font-display text-[22px] text-ink font-semibold tracking-[-0.4px] m-0">
+            <h2 id="titulo-novo-cliente" className="font-display text-[22px] text-ink font-semibold tracking-[-0.4px] m-0">
               Novo cliente
             </h2>
```

```diff
-        <form onSubmit={handleSubmit} className="px-7 py-6 flex flex-col gap-5">
+        <form onSubmit={handleSubmit} className="min-h-0 flex-1 flex flex-col">
+          {/* BUG-03: só os campos rolam; cabeçalho e botões ficam à vista em tela baixa. */}
+          <div className="min-h-0 flex-1 overflow-y-auto px-7 py-6 flex flex-col gap-5">
           <div>
             <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
               Nome completo <span className="text-accent">*</span>
```

Os campos (nome, apelido, telefone, aniversário, e-mail, autorização e etiquetas) ficam como estão, dentro do `div` novo. Depois das etiquetas, feche o `div` dos campos e leve o aviso de erro para o rodapé, junto dos botões:

```diff
             </div>
           </div>
-          {error && (
-            <div className="rounded-[10px] px-4 py-3 font-body text-[13px]" style={{ backgroundColor: '#F8DCD2', color: '#D87560' }}>
-              {error}
-            </div>
-          )}
-          <div className="flex gap-3 pt-1">
+          </div>
+
+          <div className="shrink-0 px-7 py-4 border-t border-rule flex flex-col gap-3">
+            {error && (
+              <div className="rounded-[10px] px-4 py-3 font-body text-[13px]" style={{ backgroundColor: '#F8DCD2', color: '#D87560' }}>
+                {error}
+              </div>
+            )}
+            <div className="flex gap-3">
             <button
               type="button"
               onClick={onClose}
```

E feche os dois `div` do rodapé depois do botão "Cadastrar":

```diff
               {isPending ? 'Salvando...' : 'Cadastrar'}
             </button>
-          </div>
+            </div>
+          </div>
         </form>
```

Rode o Prettier ou ajuste a indentação dos campos que entraram no `div` novo, para o diff da revisão ficar legível.

```bash
git add components/clients/new-client-modal.tsx
git commit -m "BUG-03: janela de nova pessoa com altura máxima e rolagem nos campos"
git push
```

A esteira tem de passar.

## Conferir

```bash
npm run db:reset
npm run lint
npm run build
npx playwright test janela-nova-pessoa fluxos-criticos doacao-com-ficha
```

Na tela, com `npm run dev`:

- **Notebook:** janela do navegador com a altura reduzida (ou as ferramentas do desenvolvedor com 1366x600). Em Doações · Itens · Nova doação e em Brechó · Nova venda, "Cadastrar novo": título no topo, campos rolam, botões sempre embaixo.
- **Celular:** ferramentas do desenvolvedor no modo celular (390x844). Mesma coisa nas duas entradas.
- **Erro:** com o banco local parado (`npm run db:stop`) e o servidor ligado, "Cadastrar" mostra o aviso logo acima dos botões. Ligue o banco de novo depois.
- **Tela grande:** num monitor comum, a janela continua do mesmo tamanho de antes, sem barra de rolagem.

## Pull Request

Título: `BUG-03 · Botões fora da tela na janela de nova pessoa`, com os critérios no corpo e o link da esteira vermelha do primeiro commit. PR pronto até terça 03/11 às 18h; o Mateus revisa e escreve no PR o que rodou e o que testou na tela.

**Integração, terça 03/11, à noite:** aviso no grupo uma hora antes, merge, espera do deploy e conferência no sistema publicado com a conta de voluntária (Doações · Itens · Nova doação, "Cadastrar novo", numa janela baixa). Registrar no `PROGRESSO.md`, marcar os critérios e mover o cartão para Concluído.

## Fora desta story

- Outras janelas do sistema: a de nova pessoa é a única com esse tamanho. Se aparecer outra, cartão novo.
- Fechar a janela tocando fora dela no celular: já funciona (`onClick` no fundo escuro).
