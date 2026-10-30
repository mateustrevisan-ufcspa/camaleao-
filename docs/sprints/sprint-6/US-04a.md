# US-04a · Editar e excluir doação de item (5 SP)

> Como voluntária do brechó, eu quero editar ou excluir uma doação de item que registrei, para que um erro de digitação seja corrigido na hora e não fique no histórico do Instituto.

**Tipo:** user story · **Implementa:** Bibiana · **Revisa:** Alissa · **Branch:** `us-04a-editar-e-excluir-item` · **Depende de:** nada · **Publica:** quarta 04/11, à noite, antes das outras migrações da noite e antes da US-27

## Critérios de aceitação

- [ ] Na lista de Doações · Itens, Editar abre o formulário preenchido e salvar altera a doação
- [ ] Excluir pede confirmação; a doação excluída sai da lista, da ficha da pessoa, do relatório consolidado e da exportação, e o banco guarda quem excluiu e quando
- [ ] Balcão edita e exclui só as doações de item lançadas hoje; coordenação, qualquer uma; a regra está nas políticas do banco
- [ ] Testes de fumaça (editar e excluir) e de acesso (voluntária não altera doação de ontem) passam
- [ ] Matriz de permissões atualizada com as linhas da US-04a

## O que muda para quem usa

Retorno da Tamara em 29/10: "a mudança única seria o botão Editar". Na lista de Doações · Itens, cada linha ganha **Editar** e **Excluir**. Editar abre o mesmo formulário da nova doação, preenchido. Excluir pede confirmação na própria linha.

O balcão (voluntária e caixa) só enxerga as doações lançadas hoje, então tudo que aparece na lista dele pode ser alterado. A coordenação enxerga e altera todas.

## Decisões

- **Excluir não apaga a linha.** A migração acrescenta `deleted_at` e `deleted_by`, e a política de leitura passa a esconder a doação excluída de todo mundo, inclusive da coordenação. Por isso a lista, a ficha, o relatório, a exportação, a busca de doações sem ficha e a contribuição no período deixam de ver a excluída sem nenhum filtro novo em `lib/store.ts`.
- **Quem exclui e quando vêm do banco:** a exclusão é a função `excluir_doacao_de_item`, que confere o perfil, marca a data e quem excluiu. A API não altera `deleted_at` diretamente.
- **A API só altera os campos do formulário.** A permissão de alteração da tabela passa a ser por coluna: `created_at`, `registered_by`, `deleted_at` e `deleted_by` não mudam pela API, nem pela coordenação. Assim o balcão não "traz para hoje" uma doação antiga para poder editá-la.
- **A pessoa da doação não muda na edição.** Doação com ficha mostra o nome fixo; para trocar a pessoa, exclui e registra de novo. Doação sem ficha deixa corrigir o nome e o telefone.
- **Mesma data, mesma hora.** Se a data não mudar, a hora gravada continua a mesma; se mudar, vale a regra do registro (meio-dia de Brasília para dia passado).
- **Categoria desativada continua valendo na edição.** Depois da virada, a coordenação deixa só Roupas, Tampinhas e Diversos; uma doação com categoria antiga pode ser editada sem trocar a categoria.
- **A US-27 troca os campos do item.** Esta story cria `lib/campos-do-item.ts`, que lê os campos do formulário num lugar só, para o registro e a edição. A US-27 muda os campos ali e no formulário.

## 1. Branch

```bash
git checkout main && git pull
git checkout -b us-04a-editar-e-excluir-item
git push -u origin us-04a-editar-e-excluir-item
```

## Parte A · Migração `supabase/migrations/20261102090000_editar_e_excluir_item.sql`

```sql
-- US-04a · Editar e excluir doação de item
-- Balcão corrige e exclui as doações de item lançadas hoje; coordenação, qualquer uma.
-- Excluir guarda quem e quando, e a doação excluída some de toda leitura pela API.

-- ─────────────────────────────────────────
-- 1. Quem excluiu e quando.
-- ─────────────────────────────────────────

alter table public.donations_items
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references public.users(id) on delete set null;

-- ─────────────────────────────────────────
-- 2. Leitura: a mesma regra da US-23, sem as excluídas. Toda tela que lê
--    donations_items pela API (lista, ficha, relatório, exportação, sem ficha,
--    contribuição) deixa de ver a excluída sem mudar código.
-- ─────────────────────────────────────────

drop policy if exists "coordenacao le tudo, balcao le o dia" on public.donations_items;
create policy "coordenacao le tudo, balcao le o dia, sem as excluidas" on public.donations_items
  for select to authenticated
  using (
    deleted_at is null
    and (
      public.eh_coordenacao()
      or (public.eh_equipe() and created_at >= public.balcao_le_desde())
    )
  );

-- ─────────────────────────────────────────
-- 3. Alteração: coordenação em qualquer uma; balcão nas lançadas hoje.
-- ─────────────────────────────────────────

drop policy if exists "coordenacao altera" on public.donations_items;
create policy "coordenacao corrige tudo, balcao corrige o dia" on public.donations_items
  for update to authenticated
  using (
    deleted_at is null
    and (
      public.eh_coordenacao()
      or (public.eh_equipe() and created_at >= public.balcao_le_desde())
    )
  )
  with check (
    deleted_at is null
    and (
      public.eh_coordenacao()
      or (public.eh_equipe() and created_at >= public.balcao_le_desde())
    )
  );

-- ─────────────────────────────────────────
-- 4. A API só altera os campos do formulário (e client_id, que a US-14 usa
--    para ligar doação sem ficha). created_at, registered_by, deleted_at e
--    deleted_by ficam de fora, para todo mundo. As funções security definer
--    (mesclagem, exclusão) rodam como dona da tabela e não são afetadas.
-- ─────────────────────────────────────────

revoke update on public.donations_items from anon, authenticated;
grant update (
  client_id, donor_name, donor_phone, category_id, category_name,
  quantity, weight_kg, condition, destination, notes, donated_at
) on public.donations_items to authenticated;

-- ─────────────────────────────────────────
-- 5. Excluir. security definer: precisa marcar deleted_at, que a API não
--    altera. Confere o perfil na primeira linha, como as outras funções.
-- ─────────────────────────────────────────

create or replace function public.excluir_doacao_de_item(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_criada timestamptz;
begin
  if not public.eh_equipe() then
    raise exception 'sem permissão para excluir doação' using errcode = '42501';
  end if;

  select d.created_at into v_criada
    from public.donations_items d
   where d.id = p_id and d.deleted_at is null
   for update;

  if not found then
    raise exception 'doação não encontrada' using errcode = 'P0002';
  end if;

  if not public.eh_coordenacao() and v_criada < public.balcao_le_desde() then
    raise exception 'o balcão só exclui doação lançada hoje' using errcode = '42501';
  end if;

  update public.donations_items
     set deleted_at = now(), deleted_by = auth.uid()
   where id = p_id;
end;
$$;

revoke execute on function public.excluir_doacao_de_item(uuid) from public, anon;
grant execute on function public.excluir_doacao_de_item(uuid) to authenticated;
```

```bash
npm run db:reset
```

O reset aplica todas as migrações e o seed. Se der erro na política, confira os nomes com `grep -n "donations_items" supabase/migrations/20261006090000_permissoes_por_perfil.sql`.

**A política de apagar ("coordenacao apaga") fica.** O sistema não apaga linha de doação de item; ela continua só para a limpeza dos testes de acesso.

## Parte B · `types/index.ts`

Logo depois de `DonationItem`:

```ts
// Doação de item como está no banco, para o formulário de edição (US-04a).
export interface DoacaoDeItemParaEditar {
  id: string
  client_id: string | null
  donated_at: string
  donor_name: string
  donor_phone: string | null
  category_id: string | null
  category_name: string
  quantity: number | null
  weight_kg: number | null
  condition: 'good' | 'needs_review' | null
  destination: 'stock' | 'direct' | null
  notes: string | null
}
```

No import do topo de `lib/store.ts`, uma linha nova logo depois de `DonationItem,`:

```diff
   DonationItem,
+  DoacaoDeItemParaEditar,
   CategoriaDeItem,
```

## Parte C · `lib/utils.ts`: o dia de Brasília de um instante

Logo depois de `brTodayStr`:

```ts
// Dia (AAAA-MM-DD) de um instante gravado no banco, no horário de Brasília (US-04a).
export function dataDeBrasilia(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BR_TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date(iso))
}
```

A US-30 usa a mesma função para as somas por dia.

## Parte D · `lib/store.ts`

Na seção "DOAÇÕES DE ITENS", logo depois de `addDonationItem`:

```ts
// ── EDITAR E EXCLUIR DOAÇÃO DE ITEM (US-04a) ──
// Quem altera é decidido pela política do banco: coordenação em qualquer uma,
// balcão nas lançadas hoje. A doação excluída some de toda leitura pela API.

export async function getDonationItem(id: string): Promise<DoacaoDeItemParaEditar | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('donations_items')
    .select('id, client_id, donated_at, donor_name, donor_phone, category_id, category_name, quantity, weight_kg, condition, destination, notes')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return (data ?? null) as DoacaoDeItemParaEditar | null
}

export async function updateDonationItem(
  id: string,
  campos: {
    category_id: string
    category_name: string
    quantity: number | null
    weight_kg: number | null
    condition: 'good' | 'needs_review' | null
    destination: 'stock' | 'direct' | null
    notes: string | null
    donated_at: string
    donor_name?: string
    donor_phone?: string
  }
): Promise<void> {
  const supabase = await createClient()
  // Com a política barrando (balcão numa doação de ontem), o update não dá erro: só não altera nada.
  const { data, error } = await supabase.from('donations_items').update(campos).eq('id', id).select('id')
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) throw new Error('Doação não encontrada ou sem permissão para alterar.')
}

// A função do banco confere o perfil e guarda quem excluiu e quando.
export async function deleteDonationItem(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.rpc('excluir_doacao_de_item', { p_id: id })
  if (error) throw new Error(error.message)
}
```

**Nenhuma leitura muda.** `getDonationItems`, `getClientHistory`, `getRegistroOriginal`, `getContribuicao`, `getRelatorioConsolidado`, `getDadosDaExportacao` e `getDoacoesSemFicha` leem pela API e já deixam de ver a excluída pela política da Parte A. Confira com `grep -n "donations_items" lib/store.ts` que nenhuma usa outra coisa.

## Parte E · `lib/campos-do-item.ts` (arquivo novo)

A leitura dos campos do item sai de `registerDonationItem` para cá, para o registro e a edição validarem do mesmo jeito.

```ts
import { parseMoney, brTodayStr, dateInputToISO } from '@/lib/utils'

// US-04a · Campos do item no formulário de doação, lidos e validados do mesmo
// jeito no registro e na edição. A US-27 troca quantidade, estado e destino
// pelas contagens da triagem, aqui.

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface CamposDoItem {
  category_id: string
  quantity: number | null
  weight_kg: number | null
  condition: 'good' | 'needs_review' | null
  destination: 'stock' | 'direct' | null
  notes: string | null
  donated_at: string
}

export function lerCamposDoItem(formData: FormData): { erro: string } | { campos: CamposDoItem } {
  // BUG-01: data depois de hoje (em Brasília) não entra. As duas no formato AAAA-MM-DD.
  const data = ((formData.get('donated_at') as string) || '').trim()
  if (data !== '' && data > brTodayStr()) return { erro: 'A data da doação não pode ser depois de hoje.' }

  const categoryId = ((formData.get('category_id') as string) || '').trim()
  const qRaw = ((formData.get('quantity') as string) || '').trim()
  const wRaw = ((formData.get('weight_kg') as string) || '').trim()
  const quantity = qRaw ? parseInt(qRaw, 10) : null
  const weight_kg = wRaw ? parseMoney(wRaw) : null
  const condition = formData.get('condition')
  const destination = formData.get('destination')

  if (!UUID.test(categoryId)) return { erro: 'Escolha a categoria do item.' }
  // Quantidade e peso são opcionais (US-11); se vierem, precisam fazer sentido.
  if (quantity !== null && (!Number.isFinite(quantity) || quantity <= 0)) {
    return { erro: 'A quantidade, se informada, precisa ser maior que zero.' }
  }
  if (weight_kg !== null && (!Number.isFinite(weight_kg) || weight_kg <= 0)) {
    return { erro: 'O peso, se informado, precisa ser maior que zero.' }
  }

  return {
    campos: {
      category_id: categoryId,
      quantity,
      weight_kg,
      condition: condition === 'good' || condition === 'needs_review' ? condition : null,
      destination: destination === 'stock' || destination === 'direct' ? destination : null,
      notes: ((formData.get('notes') as string) || '').trim() || null,
      donated_at: dateInputToISO(data),
    },
  }
}
```

Em `actions/donations.ts`, `registerDonationItem` passa a usar a função. O resto da action (doador, categoria vinda do banco, `redirect`) fica igual:

```diff
 import { AVISO_ESCOLHER_DOADOR, faltaEscolherDoador } from '@/lib/doador'
+import { lerCamposDoItem } from '@/lib/campos-do-item'
```

```diff
 export async function registerDonationItem(formData: FormData): Promise<{ error: string } | void> {
   if (faltaEscolherDoador(formData)) return { error: AVISO_ESCOLHER_DOADOR }
-  const donated_at = dateInputToISO(formData.get('donated_at') as string)
   const donorName = ((formData.get('donor_name') as string) || '').trim()
-  const categoryId = ((formData.get('category_id') as string) || '').trim()
-  const qRaw = ((formData.get('quantity') as string) || '').trim()
-  ...
-  if (!donorName) return { error: 'Informe o nome do doador.' }
-  if (!categoryId) return { error: 'Escolha a categoria do item.' }
-  ...
+  if (!donorName) return { error: 'Informe o nome do doador.' }
+  const lido = lerCamposDoItem(formData)
+  if ('erro' in lido) return { error: lido.erro }
+  const { campos } = lido

   try {
     const supabase = await createClient()
     const { data: { user } } = await supabase.auth.getUser()

     // O nome da categoria vem do banco, e não do navegador.
-    const categoria = await getDonationCategory(categoryId)
+    const categoria = await getDonationCategory(campos.category_id)
     if (!categoria) return { error: 'Escolha uma categoria da lista.' }

     await addDonationItem({
       client_id:     (formData.get('client_id') as string) || null,
       donor_name:    donorName,
       // Pessoa com ficha: o telefone fica só na ficha, não é copiado para a doação (SEC-05).
       donor_phone:   formData.get('client_id') ? '' : ((formData.get('donor_phone') as string) || ''),
       category_id:   categoria.id,
       category_name: categoria.name,
-      quantity,
-      weight_kg,
-      condition:     condition === 'good' || condition === 'needs_review' ? condition : null,
-      destination:   destination === 'stock' || destination === 'direct' ? destination : null,
-      notes:         (formData.get('notes') as string) || undefined,
-      donated_at,
+      quantity:      campos.quantity,
+      weight_kg:     campos.weight_kg,
+      condition:     campos.condition,
+      destination:   campos.destination,
+      notes:         campos.notes ?? undefined,
+      donated_at:    campos.donated_at,
       registered_by: user?.id ?? null,
     })
```

(As linhas com `...` são as que saem inteiras: a leitura de quantidade, peso, estado e destino e as validações, que agora estão em `lerCamposDoItem`.) A verificação `dataDepoisDeHoje` no começo de `registerDonationItem`, se existir, também sai: a função nova faz a mesma conferência. `registerDonation` (dinheiro) continua com a dela.

## Parte F · `actions/itens.ts` (arquivo novo)

```ts
'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { deleteDonationItem, getDonationCategory, getDonationItem, updateDonationItem } from '@/lib/store'
import { lerCamposDoItem, UUID } from '@/lib/campos-do-item'
import { dataDeBrasilia } from '@/lib/utils'

const AVISO_SEM_PERMISSAO =
  'Doação não encontrada. O balcão altera só as doações lançadas hoje; para as outras, fale com a coordenação.'

// US-04a · Corrige uma doação de item. A política do banco decide se pode.
export async function editarDoacaoDeItem(id: string, formData: FormData): Promise<{ error: string } | void> {
  if (!UUID.test(id)) return { error: AVISO_SEM_PERMISSAO }
  const lido = lerCamposDoItem(formData)
  if ('erro' in lido) return { error: lido.erro }
  const { campos } = lido

  try {
    const original = await getDonationItem(id)
    if (!original) return { error: AVISO_SEM_PERMISSAO }

    // A categoria de antes vale mesmo se a coordenação a desativou depois;
    // uma categoria nova vem da lista das ativas, com o nome vindo do banco.
    let categoryName = original.category_name
    if (campos.category_id !== original.category_id) {
      const categoria = await getDonationCategory(campos.category_id)
      if (!categoria) return { error: 'Escolha uma categoria da lista.' }
      categoryName = categoria.name
    }

    // Mesma data: a hora gravada fica. Outra data: a regra do registro.
    const dataInformada = ((formData.get('donated_at') as string) || '').trim()
    const donatedAt = dataInformada === dataDeBrasilia(original.donated_at) ? original.donated_at : campos.donated_at

    // A pessoa da doação com ficha não muda aqui; sem ficha, nome e telefone podem ser corrigidos.
    let doador: { donor_name?: string; donor_phone?: string } = {}
    if (!original.client_id) {
      const nome = ((formData.get('donor_name') as string) || '').trim()
      if (!nome) return { error: 'Informe o nome do doador.' }
      doador = { donor_name: nome, donor_phone: ((formData.get('donor_phone') as string) || '').trim() }
    }

    await updateDonationItem(id, { ...campos, category_name: categoryName, donated_at: donatedAt, ...doador })
  } catch (e) {
    console.error('editarDoacaoDeItem error:', e)
    return { error: 'Não foi possível salvar a alteração. Tente novamente.' }
  }

  revalidatePath('/doacoes/itens')
  redirect('/doacoes/itens')
}

// US-04a · Exclui uma doação de item. O banco guarda quem excluiu e quando.
export async function excluirDoacaoDeItem(id: string): Promise<{ error: string } | void> {
  if (!UUID.test(id)) return { error: AVISO_SEM_PERMISSAO }
  try {
    await deleteDonationItem(id)
  } catch (e) {
    console.error('excluirDoacaoDeItem error:', e)
    return { error: 'Não foi possível excluir a doação. Tente novamente.' }
  }
  revalidatePath('/doacoes/itens')
}
```

## Parte G · Formulário em modo de edição

### `components/donations/new-donation-item-form.tsx`

O formulário ganha a propriedade opcional `doacao`. Sem ela, nada muda na nova doação.

```diff
 import { useState, useTransition } from 'react'
+import Link from 'next/link'
 import { Check } from 'lucide-react'
 import { registerDonationItem } from '@/actions/donations'
+import { editarDoacaoDeItem } from '@/actions/itens'
 import { DonorField } from '@/components/clients/donor-field'
-import { brTodayStr } from '@/lib/utils'
+import { brTodayStr, dataDeBrasilia } from '@/lib/utils'
+import type { DoacaoDeItemParaEditar } from '@/types'
```

```diff
 interface NewDonationItemFormProps {
   categories: Category[]
-  tags: DbTag[]
+  tags?: DbTag[]
   categoriaInicial?: string
+  // US-04a: com a doação, o formulário abre preenchido e salva a alteração.
+  doacao?: DoacaoDeItemParaEditar
 }
```

```diff
-export function NewDonationItemForm({ categories, tags, categoriaInicial }: NewDonationItemFormProps) {
+export function NewDonationItemForm({ categories, tags = [], categoriaInicial, doacao }: NewDonationItemFormProps) {
   const [isPending, startTransition] = useTransition()
   // Dia de Brasília, e não de UTC: depois das 21h o UTC já está no dia seguinte (BUG-01).
   const today = brTodayStr()
-  const [date, setDate] = useState(today)
-  const [categoryId, setCategoryId] = useState(categories.find((c) => c.name === categoriaInicial)?.id ?? '')
-  const [condition, setCondition] = useState<'good' | 'needs_review'>('good')
-  const [destination, setDestination] = useState<'stock' | 'direct'>('stock')
+  const [date, setDate] = useState(doacao ? dataDeBrasilia(doacao.donated_at) : today)
+  const [categoryId, setCategoryId] = useState(
+    doacao?.category_id ?? categories.find((c) => c.name === categoriaInicial)?.id ?? ''
+  )
+  const [condition, setCondition] = useState<'good' | 'needs_review'>(doacao?.condition ?? 'good')
+  const [destination, setDestination] = useState<'stock' | 'direct'>(doacao?.destination ?? 'stock')
   const [error, setError] = useState<string | null>(null)
```

```diff
     startTransition(async () => {
-      const res = await registerDonationItem(fd)
+      const res = doacao ? await editarDoacaoDeItem(doacao.id, fd) : await registerDonationItem(fd)
       if (res?.error) setError(res.error)
     })
```

O bloco do doador:

```diff
-          <DonorField tags={tags} />
+          {doacao ? <DoadorDaDoacao doacao={doacao} /> : <DonorField tags={tags} />}
```

Os campos que não são controlados ganham o valor da doação:

```diff
-                  <input id="quantidade-do-item" name="quantity" type="number" min="1" step="1" placeholder="opcional" className="input-base" />
+                  <input id="quantidade-do-item" name="quantity" type="number" min="1" step="1" placeholder="opcional" defaultValue={doacao?.quantity ?? ''} className="input-base" />
```

```diff
-                  <input id="peso-do-item" name="weight_kg" inputMode="decimal" placeholder="opcional" className="input-base" />
+                  <input
+                    id="peso-do-item"
+                    name="weight_kg"
+                    inputMode="decimal"
+                    placeholder="opcional"
+                    defaultValue={doacao?.weight_kg != null ? String(doacao.weight_kg).replace('.', ',') : ''}
+                    className="input-base"
+                  />
```

```diff
-                <label className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">Observações</label>
-                <textarea name="notes" rows={3} placeholder="Contexto sobre a doação..." className="input-base resize-none" />
+                <label htmlFor="observacoes-do-item" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">Observações</label>
+                <textarea id="observacoes-do-item" name="notes" rows={3} placeholder="Contexto sobre a doação..." defaultValue={doacao?.notes ?? ''} className="input-base resize-none" />
```

E o botão:

```diff
               <Check size={16} />
-              {isPending ? 'Registrando...' : 'Registrar doação'}
+              {doacao
+                ? (isPending ? 'Salvando...' : 'Salvar alteração')
+                : (isPending ? 'Registrando...' : 'Registrar doação')}
             </button>
+            {doacao && (
+              <Link href="/doacoes/itens" className="block text-center mt-3 font-body text-sm text-muted no-underline hover:text-ink">
+                Cancelar
+              </Link>
+            )}
```

No fim do arquivo, o bloco do doador na edição:

```tsx
// US-04a: na edição, a pessoa da doação com ficha não muda. Sem ficha, nome e
// telefone podem ser corrigidos.
function DoadorDaDoacao({ doacao }: { doacao: DoacaoDeItemParaEditar }) {
  return (
    <div className="bg-paper border border-rule rounded-[16px] p-6">
      <div className="text-[11px] font-body text-muted tracking-[1px] uppercase mb-4">Doador</div>
      {doacao.client_id ? (
        <>
          <div className="text-sm font-body text-ink font-medium">{doacao.donor_name}</div>
          <p className="text-xs text-muted font-body mt-1 m-0">
            Doação com ficha. Para trocar a pessoa, exclua esta doação e registre de novo.
          </p>
        </>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="nome-do-doador" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
              Nome <span className="text-accent">*</span>
            </label>
            <input id="nome-do-doador" name="donor_name" required defaultValue={doacao.donor_name} className="input-base" />
          </div>
          <div>
            <label htmlFor="telefone-do-doador" className="block text-[11px] font-body text-muted tracking-[1px] uppercase mb-1.5">
              Telefone
            </label>
            <input id="telefone-do-doador" name="donor_phone" type="tel" defaultValue={doacao.donor_phone ?? ''} className="input-base" />
          </div>
        </div>
      )}
    </div>
  )
}
```

### `app/(admin)/doacoes/itens/[id]/editar/page.tsx` (arquivo novo)

```tsx
import Link from 'next/link'
import { getDonationCategories, getDonationItem } from '@/lib/store'
import { NewDonationItemForm } from '@/components/donations/new-donation-item-form'

export const dynamic = 'force-dynamic'

// US-04a · Corrigir uma doação de item. O balcão só chega às lançadas hoje,
// porque só enxerga essas; a política do banco barra o resto.
export default async function EditarDoacaoDeItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [doacao, ativas] = await Promise.all([
    // Id inválido faz o banco devolver erro: tratado como "não encontrada".
    getDonationItem(id).catch(() => null),
    getDonationCategories(),
  ])

  if (!doacao) {
    return (
      <div className="px-4 py-6 md:px-14 md:py-10 max-w-[900px]">
        <h1 className="font-display text-[28px] text-ink font-semibold m-0">Doação não encontrada</h1>
        <p className="font-body text-sm text-muted mt-3">
          O balcão altera só as doações lançadas hoje. Para corrigir uma doação de outro dia, fale com a coordenação.
        </p>
        <Link href="/doacoes/itens" className="chip bg-bg no-underline mt-4 inline-flex">Voltar às doações de itens</Link>
      </div>
    )
  }

  // A categoria da doação entra na lista mesmo se foi desativada depois.
  const categorias =
    doacao.category_id && !ativas.some((c) => c.id === doacao.category_id)
      ? [...ativas, { id: doacao.category_id, name: doacao.category_name }]
      : ativas

  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1300px]">
      <header className="mb-9">
        <div className="text-xs text-muted font-body tracking-[2px] uppercase mb-2">
          <Link href="/doacoes/itens" className="text-muted no-underline hover:text-ink">Doações · Itens</Link> · Editar
        </div>
        <h1 className="font-display text-[28px] md:text-[40px] text-ink font-semibold tracking-[-1px] m-0 leading-[1.1]">
          Editar doação de <span className="text-purple">itens</span>
        </h1>
      </header>
      <NewDonationItemForm categories={categorias} doacao={doacao} />
    </div>
  )
}
```

## Parte H · Editar e Excluir na lista (`components/donations/donations-items-list.tsx`)

```diff
 'use client'

+import { useState, useTransition } from 'react'
+import Link from 'next/link'
 import { Download } from 'lucide-react'
 import { Tag } from '@/components/ui/tag'
+import { excluirDoacaoDeItem } from '@/actions/itens'
 import type { DonationItem } from '@/types'
```

```diff
 export function DonationsItemsList({ donations }: { donations: DonationItem[] }) {
+  // US-04a: a exclusão pede confirmação na própria linha.
+  const [confirmando, setConfirmando] = useState<string | null>(null)
+  const [erro, setErro] = useState<string | null>(null)
+  const [isPending, startTransition] = useTransition()
+
+  function excluir(id: string) {
+    setErro(null)
+    startTransition(async () => {
+      const res = await excluirDoacaoDeItem(id)
+      if (res?.error) setErro(res.error)
+      setConfirmando(null)
+    })
+  }
+
   const totalPieces = donations.reduce((s, d) => s + (d.quantity ?? 0), 0)
```

O aviso de erro, logo antes da tabela (dentro do cartão "Itens recebidos", depois do cabeçalho):

```diff
           <button onClick={handleExport} className="chip bg-bg"><Download size={11} /> Exportar CSV</button>
         </div>
+        {erro && (
+          <div className="mx-6 mt-4 rounded-[10px] px-4 py-3 font-body text-[13px]" style={{ backgroundColor: '#F8DCD2', color: '#D87560' }}>
+            {erro}
+          </div>
+        )}
         <div className="overflow-x-auto">
-          <table className="w-full border-collapse font-body min-w-[640px]">
+          <table className="w-full border-collapse font-body min-w-[760px]">
```

Uma coluna nova no fim, sem título:

```diff
-                {['Data', 'Doador', 'Categoria', 'Qtd · peso', 'Estado', 'Destino', 'Obs.'].map((h) => (
-                  <th key={h} className="text-left px-6 py-3.5 text-[11px] text-muted tracking-[1.5px] uppercase font-medium">{h}</th>
+                {['Data', 'Doador', 'Categoria', 'Qtd · peso', 'Estado', 'Destino', 'Obs.', ''].map((h, i) => (
+                  <th key={`${h}-${i}`} className="text-left px-6 py-3.5 text-[11px] text-muted tracking-[1.5px] uppercase font-medium">{h}</th>
                 ))}
```

Depois da célula de observações de cada linha:

```tsx
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    {/* US-04a: tudo que aparece aqui pode ser alterado por quem está vendo
                        (o balcão só enxerga o que foi lançado hoje). A US-16 põe o Recibo nesta célula. */}
                    <div data-testid="acoes-da-doacao" className="flex justify-end gap-2">
                      {confirmando === d.id ? (
                        <>
                          <button type="button" onClick={() => excluir(d.id)} disabled={isPending} className="chip bg-coral text-white border-coral disabled:opacity-50">
                            Confirmar exclusão
                          </button>
                          <button type="button" onClick={() => setConfirmando(null)} disabled={isPending} className="chip bg-bg">
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <>
                          <Link href={`/doacoes/itens/${d.id}/editar`} className="chip bg-bg no-underline">Editar</Link>
                          <button type="button" onClick={() => setConfirmando(d.id)} className="chip bg-bg">Excluir</button>
                        </>
                      )}
                    </div>
                  </td>
```

E a linha de lista vazia passa de 7 para 8 colunas (`colSpan={8}`). Se `bg-coral` não existir no `tailwind.config`, use o mesmo estilo do aviso de erro (`style={{ backgroundColor: '#D87560', color: '#FFFFFF' }}`).

## Parte I · Matriz de permissões

As linhas da US-04a já estão em `docs/seguranca/matriz-de-permissoes.md`, marcadas "(Sprint 6, US-04a)", desde o PR do planejamento. Confira se batem com o que foi feito e, na integração, tire a marca. Na mesma integração, troque a frase "Hoje não há tela de configurações nem botões de apagar no sistema." por "Hoje não há tela de configurações. O único botão de excluir é o da doação de item (US-04a), que não apaga a linha: marca quem excluiu e quando."

## Parte J · Testes

### `tests/acesso/apoio.ts`

A conta de voluntária do seed, que a US-28 também usa:

```diff
 export const COORDENACAO = USUARIA.email
 export const CAIXA = 'caixa@camaleao.local'
+// Voluntária (volunteer) do seed. Até a US-28, tem as mesmas permissões do caixa.
+export const VOLUNTARIA = 'balcao@camaleao.local'
```

### `tests/acesso/editar-e-excluir-item.spec.ts` (arquivo novo)

```ts
// US-04a · Editar e excluir doação de item, conferido pela API.
import { test, expect } from '@playwright/test'
import type { SupabaseClient } from '@supabase/supabase-js'
import { COORDENACAO, VOLUNTARIA, entrarNaApi, recusado } from './apoio'

const MARCA = 'TESTE US-04a'

let coordenacao: SupabaseClient
let voluntaria: SupabaseClient
let voluntariaId: string
let deAnteontemId: string

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  ;({ api: coordenacao } = await entrarNaApi(COORDENACAO))
  ;({ api: voluntaria, id: voluntariaId } = await entrarNaApi(VOLUNTARIA))

  // Lançada dois dias atrás: o balcão não enxerga nem altera.
  const antes = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  const r = await coordenacao
    .from('donations_items')
    .insert({ donor_name: MARCA, category_name: 'roupa', quantity: 2, donated_at: antes, created_at: antes })
    .select('id')
    .single()
  if (r.error) throw new Error(`Não criou a doação antiga: ${r.error.message}`)
  deAnteontemId = r.data.id
})

test.afterAll(async () => {
  // As excluídas ficam no banco local, invisíveis; o db reset da esteira limpa.
  if (coordenacao) await coordenacao.from('donations_items').delete().eq('donor_name', MARCA)
})

test('a voluntária não altera nem exclui doação lançada antes de hoje', async () => {
  expect(recusado(await voluntaria.from('donations_items').update({ quantity: 9 }).eq('id', deAnteontemId).select())).toBe(true)
  expect((await voluntaria.rpc('excluir_doacao_de_item', { p_id: deAnteontemId })).error).not.toBeNull()

  const { data } = await coordenacao.from('donations_items').select('quantity').eq('id', deAnteontemId).single()
  expect(data!.quantity).toBe(2)
})

test('a coordenação corrige a doação antiga', async () => {
  const r = await coordenacao.from('donations_items').update({ quantity: 4 }).eq('id', deAnteontemId).select('quantity').single()
  expect(r.error).toBeNull()
  expect(r.data!.quantity).toBe(4)
})

test('ninguém muda pela API quem lançou nem quando', async () => {
  expect((await coordenacao.from('donations_items').update({ created_at: new Date().toISOString() }).eq('id', deAnteontemId)).error).not.toBeNull()
  expect((await coordenacao.from('donations_items').update({ deleted_at: new Date().toISOString() }).eq('id', deAnteontemId)).error).not.toBeNull()
})

test('a voluntária corrige e exclui a doação que lançou hoje, e a excluída some para todos', async () => {
  const nova = await voluntaria
    .from('donations_items')
    .insert({ donor_name: MARCA, category_name: 'roupa', quantity: 1, donated_at: new Date().toISOString(), registered_by: voluntariaId })
    .select('id')
    .single()
  expect(nova.error).toBeNull()
  const id = nova.data!.id

  const corrigida = await voluntaria.from('donations_items').update({ quantity: 6 }).eq('id', id).select('quantity').single()
  expect(corrigida.error).toBeNull()
  expect(corrigida.data!.quantity).toBe(6)

  expect((await voluntaria.rpc('excluir_doacao_de_item', { p_id: id })).error).toBeNull()

  expect(recusado(await voluntaria.from('donations_items').select('id').eq('id', id))).toBe(true)
  expect(recusado(await coordenacao.from('donations_items').select('id').eq('id', id))).toBe(true)
  // Excluída não se exclui de novo nem se altera.
  expect((await coordenacao.rpc('excluir_doacao_de_item', { p_id: id })).error).not.toBeNull()
  expect(recusado(await coordenacao.from('donations_items').update({ quantity: 3 }).eq('id', id).select())).toBe(true)
})
```

### `tests/fumaca/editar-e-excluir-item.spec.ts` (arquivo novo)

```ts
import { expect, test } from '@playwright/test'
import { doacaoSemFicha, entrar } from './apoio'

// US-04a · Editar e excluir doação de item pela tela.
test.describe('Fumaça: editar e excluir doação de item', () => {
  test('editar muda a linha; excluir pede confirmação e tira da lista', async ({ page }) => {
    const doadora = `TESTE US-04a ${Date.now()}`
    await entrar(page)

    await test.step('registrar uma doação com 3 peças', async () => {
      await page.goto('/doacoes/itens/nova')
      await doacaoSemFicha(page, doadora)
      await page.getByLabel('Categoria').selectOption({ index: 1 })
      await page.getByLabel('Quantidade').fill('3')
      await page.getByRole('button', { name: 'Registrar doação' }).click()
      await expect(page).toHaveURL(/\/doacoes\/itens$/)
      await expect(page.getByRole('row').filter({ hasText: doadora }).getByText('3 un')).toBeVisible()
    })

    await test.step('editar: o formulário abre preenchido e salvar altera', async () => {
      await page.getByRole('row').filter({ hasText: doadora }).getByRole('link', { name: 'Editar' }).click()
      await expect(page).toHaveURL(/\/doacoes\/itens\/[0-9a-f-]+\/editar$/)
      await expect(page.getByLabel('Quantidade')).toHaveValue('3')
      await expect(page.getByLabel('Nome')).toHaveValue(doadora)
      await page.getByLabel('Quantidade').fill('5')
      await page.getByLabel('Observações').fill('corrigido no teste')
      await page.getByRole('button', { name: 'Salvar alteração' }).click()
      await expect(page).toHaveURL(/\/doacoes\/itens$/)
      const linha = page.getByRole('row').filter({ hasText: doadora })
      await expect(linha.getByText('5 un')).toBeVisible()
      await expect(linha.getByText('corrigido no teste')).toBeVisible()
    })

    await test.step('excluir: pede confirmação e a linha some', async () => {
      const linha = page.getByRole('row').filter({ hasText: doadora })
      await linha.getByRole('button', { name: 'Excluir' }).click()
      await linha.getByRole('button', { name: 'Confirmar exclusão' }).click()
      await expect(page.getByRole('row').filter({ hasText: doadora })).toHaveCount(0)
    })
  })
})
```

A ficha, o relatório e a exportação não precisam de teste próprio: leem pela API, e o teste de acesso confere que a excluída some para a coordenação, que é quem vê essas telas.

## Conferir

```bash
npm run db:reset
npm run lint
npm run build
npx playwright test editar-e-excluir-item doacao-de-itens doacao-com-ficha historico-da-pessoa relatorio-consolidado exportacao-em-planilha
npm run test:acesso -- editar-e-excluir-item categorias sem-ficha mesclagem
```

Quem excluiu e quando, no banco local:

```bash
docker exec -it supabase_db_camaleao-admin psql -U postgres -c "select donor_name, deleted_at, deleted_by from public.donations_items where deleted_at is not null order by deleted_at desc limit 5;"
```

Na tela, com `npm run dev`:

- **Voluntária** (`balcao@camaleao.local`): registre uma doação de item, edite a quantidade e a observação, exclua com confirmação.
- **Coordenação:** edite uma doação de outro dia; abra a ficha de uma pessoa com doação de item, exclua a doação e veja que ela some do histórico; o relatório consolidado do mês perde uma doação na categoria.
- **Edição de categoria desativada:** em Doações · Categorias, desative a categoria de uma doação; a edição dessa doação abre com a categoria e salva sem trocar.
- **Endereço direto:** `/doacoes/itens/um-id-qualquer/editar` mostra "Doação não encontrada".

## Pull Request

Título: `US-04a · Editar e excluir doação de item`, com os critérios no corpo. PR pronto até quarta 04/11 às 18h; a Alissa revisa (editar e excluir com a conta de voluntária e de coordenação) e escreve no PR o que testou.

**Integração, quarta 04/11, à noite, logo depois da SEC-07:**

1. Aviso no grupo.
2. **Migração em produção.** Se a virada já aconteceu: `db push` no `camaleao-producao` (conferir `supabase/.temp/project-ref` e `migration list` antes e depois). Se não: também no banco atual, pelo SQL Editor, colando o arquivo da Parte A. Registrar no `PROGRESSO.md`.
3. Merge e espera do deploy.
4. Conferência no sistema publicado com a conta de voluntária: uma doação "CONFERÊNCIA", editada e excluída.
5. Avisar a Alissa de que a US-04a está na `main`, para ela trazer na quinta de manhã (US-27, Parte F).

## Fora desta story

- Venda e doação em dinheiro: US-04b, com a SEC-04, esperando o Instituto dizer quem corrige lançamento com dinheiro.
- Desfazer uma exclusão pela tela: não pedido. A linha continua no banco, e a coordenação pode pedir à equipe.
- A busca de pessoa (`buscar_pessoas`, função `security definer`) continua contando a doação excluída no "já doou". É só a marca na busca, sem valor nem data; se o Instituto estranhar, ajuste pequeno na função.
- Doações em dinheiro e tampinhas antigas (`donations_caps`): não mudam.
