# US-04b · Correção e cancelamento de venda e de doação em dinheiro (5 SP, extra)

> Como voluntária do brechó, eu quero corrigir ou cancelar uma venda ou doação em dinheiro registrada errada, para que um erro de digitação não fique permanente no histórico do Instituto.

**Tipo:** user story · **Implementa:** Mateus · **Revisa:** Bibiana · **Branch:** `us-04b-corrigir-e-cancelar-dinheiro` · **Depende de:** SEC-04 (trilha e motivo) e US-35 (líquido refeito pelo banco), as duas na `main` na quarta · **PR pronto:** quinta 12/11, 18h · **Merge:** quinta 12/11, à noite, o último da noite

**Story extra da sprint:** entrou no planejamento de 06/11 por decisão do Mateus, fora dos 45 SP comprometidos. Se não estiver aprovada na quinta às 18h, volta ao topo do Backlog do Produto e a sprint fecha com 45 SP, sem desvio.

## A regra provisória

A pergunta "quem pode corrigir ou cancelar lançamento com dinheiro?" está sem resposta desde a Sprint 3 (pergunta 4 da mensagem de 06/11). Até a resposta, vale a regra **mais segura**, que já é a da matriz desde a US-23: **só a coordenação corrige e cancela, sempre com motivo**. O balcão continua pedindo à coordenação. Se o Instituto disser que o balcão também pode (no mesmo dia, como na US-04a), muda uma condição nas duas funções e nas políticas de alteração, num ajuste pequeno.

## Critérios de aceitação

- [ ] A coordenação corrige uma doação em dinheiro (valor, data, origem, frequência, maquininha e forma, observações), com motivo obrigatório; o líquido é refeito pelo banco (US-35)
- [ ] A coordenação cancela uma venda ou uma doação em dinheiro, com motivo obrigatório; o registro fica no banco com quem cancelou e quando, e some de toda lista, soma, relatório, recibo e exportação
- [ ] Correções e cancelamentos aparecem em Relatórios · Alterações (SEC-04), com o motivo
- [ ] O balcão não corrige nem cancela, nem pela tela nem pela API
- [ ] Venda não é corrigida campo a campo: o financeiro diz "para corrigir, cancele e registre de novo"
- [ ] Testes de acesso e de fumaça passam

## Decisões

- **Cancelar marca, não apaga:** colunas `deleted_at` e `deleted_by` em `sales` e `donations_cash`, como na doação de item (US-04a). Mesmo nome de coluna de propósito: a trilha (SEC-04) registra a marca como "exclusão".
- **Some pela política do banco**, como na US-04a: as políticas de leitura passam a exigir `deleted_at is null`. Toda leitura pela API (listas, relatório, exportação, recibo, ficha, contribuição, comissões, totais de evento e campanha) deixa de ver o cancelado sem mudar código.
- **Venda:** só cancelar. Corrigir uma venda mexe nas peças, na forma, na maquininha e na taxa; cancelar e registrar de novo deixa a trilha mais clara e não precisa de tela nova.
- **Doação em dinheiro:** corrigir pela API, só nas colunas do formulário (permissão por coluna, como a US-04a). Taxa e líquido não podem ser alterados à mão: o gatilho da US-35 refaz os dois.
- **Motivo obrigatório** no cancelamento (função do banco) e na correção (action e conferência no banco por gatilho).

## 1. Branch

```bash
git checkout main && git pull
git checkout -b us-04b-corrigir-e-cancelar-dinheiro
git push -u origin us-04b-corrigir-e-cancelar-dinheiro
```

## Parte A · Migração `supabase/migrations/20261111110000_corrigir_e_cancelar_dinheiro.sql`

```sql
-- US-04b · Correção e cancelamento de venda e de doação em dinheiro
-- Regra provisória (Sprint 7): só a coordenação corrige e cancela, com motivo.
-- Cancelado fica no banco com quem e quando, e some de toda leitura pela API.

-- ─────────────────────────────────────────
-- 1. Quem cancelou e quando. Mesmo nome da US-04a: a trilha (SEC-04) registra
--    a marca como "exclusão".
-- ─────────────────────────────────────────

alter table public.sales
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references public.users(id) on delete set null;

alter table public.donations_cash
  add column if not exists deleted_at timestamptz,
  add column if not exists deleted_by uuid references public.users(id) on delete set null;

-- ─────────────────────────────────────────
-- 2. Leitura: as regras da US-28, sem as canceladas.
-- ─────────────────────────────────────────

drop policy if exists "coordenacao le tudo, caixa le o dia" on public.sales;
create policy "coordenacao le tudo, caixa le o dia, sem as canceladas" on public.sales
  for select to authenticated
  using (
    deleted_at is null
    and (
      public.eh_coordenacao()
      or (public.eh_caixa_ou_coordenacao() and created_at >= public.balcao_le_desde())
    )
  );

drop policy if exists "coordenacao le tudo, caixa le o dia" on public.donations_cash;
create policy "coordenacao le tudo, caixa le o dia, sem as canceladas" on public.donations_cash
  for select to authenticated
  using (
    deleted_at is null
    and (
      public.eh_coordenacao()
      or (public.eh_caixa_ou_coordenacao() and created_at >= public.balcao_le_desde())
    )
  );

-- ─────────────────────────────────────────
-- 3. Alteração: continua só da coordenação (US-23), e não em cancelada.
-- ─────────────────────────────────────────

drop policy if exists "coordenacao altera" on public.sales;
create policy "coordenacao altera, sem as canceladas" on public.sales
  for update to authenticated
  using (deleted_at is null and public.eh_coordenacao())
  with check (deleted_at is null and public.eh_coordenacao());

drop policy if exists "coordenacao altera" on public.donations_cash;
create policy "coordenacao altera, sem as canceladas" on public.donations_cash
  for update to authenticated
  using (deleted_at is null and public.eh_coordenacao())
  with check (deleted_at is null and public.eh_coordenacao());

-- ─────────────────────────────────────────
-- 4. A API altera só os campos dos formulários. Fora: created_at, registered_by,
--    deleted_at, deleted_by, e na doação a taxa e o líquido (gatilho da US-35).
--    Na venda: conferir o recebimento (financeiro) e ligar a ficha.
-- ─────────────────────────────────────────

revoke update on public.donations_cash from anon, authenticated;
grant update (
  client_id, donor_name, donor_phone, amount, origin_id, frequency, donated_at, notes,
  event_id, campaign_id, bank_id, forma, parcelado, bandeira, motivo_da_alteracao
) on public.donations_cash to authenticated;

revoke update on public.sales from anon, authenticated;
grant update (confirmed, client_id, motivo_da_alteracao) on public.sales to authenticated;

-- ─────────────────────────────────────────
-- 5. Correção de valor de doação pede motivo. Gatilho antes da trilha
--    (ordem alfabética: "exigir..." vem antes de "liquido..." e de "trilha...").
-- ─────────────────────────────────────────

create or replace function public.exigir_motivo_na_correcao()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (new.amount is distinct from old.amount
      or new.donated_at is distinct from old.donated_at
      or new.bank_id is distinct from old.bank_id
      or new.forma is distinct from old.forma)
     and length(btrim(coalesce(new.motivo_da_alteracao, ''))) < 5 then
    raise exception 'informe o motivo da correção' using errcode = '22023';
  end if;
  return new;
end;
$$;

create trigger exigir_motivo_na_correcao
  before update on public.donations_cash
  for each row execute function public.exigir_motivo_na_correcao();

-- ─────────────────────────────────────────
-- 6. Cancelar. security definer: marca deleted_at, que a API não altera.
--    Regra provisória: só a coordenação.
-- ─────────────────────────────────────────

create or replace function public.cancelar_venda(p_id uuid, p_motivo text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.eh_coordenacao() then
    raise exception 'só a coordenação cancela venda' using errcode = '42501';
  end if;
  if length(btrim(coalesce(p_motivo, ''))) < 5 then
    raise exception 'informe o motivo do cancelamento' using errcode = '22023';
  end if;
  update public.sales
     set deleted_at = now(), deleted_by = auth.uid(), motivo_da_alteracao = btrim(p_motivo)
   where id = p_id and deleted_at is null;
  if not found then
    raise exception 'venda não encontrada' using errcode = 'P0002';
  end if;
end;
$$;

create or replace function public.cancelar_doacao_em_dinheiro(p_id uuid, p_motivo text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.eh_coordenacao() then
    raise exception 'só a coordenação cancela doação em dinheiro' using errcode = '42501';
  end if;
  if length(btrim(coalesce(p_motivo, ''))) < 5 then
    raise exception 'informe o motivo do cancelamento' using errcode = '22023';
  end if;
  update public.donations_cash
     set deleted_at = now(), deleted_by = auth.uid(), motivo_da_alteracao = btrim(p_motivo)
   where id = p_id and deleted_at is null;
  if not found then
    raise exception 'doação não encontrada' using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function public.cancelar_venda(uuid, text) from public, anon;
grant execute on function public.cancelar_venda(uuid, text) to authenticated;
revoke execute on function public.cancelar_doacao_em_dinheiro(uuid, text) from public, anon;
grant execute on function public.cancelar_doacao_em_dinheiro(uuid, text) to authenticated;
```

**Atenção:** o cancelamento não passa pelo gatilho `exigir_motivo_na_correcao` com erro, porque a função grava o motivo no mesmo `update`. E o gatilho da trilha apaga o motivo da linha depois de copiar, como em toda alteração.

## Parte B · `types/index.ts`

No fim do arquivo:

```ts
// US-04b · A doação em dinheiro como o formulário de correção precisa.
export interface DoacaoEmDinheiroParaCorrigir {
  id: string
  donor_name: string
  amount: number
  donated_at: string
  origin: string
  frequency: 'monthly' | 'one_time'
  notes: string | null
  bank_id: string | null
  forma: 'pix' | 'debit' | 'credit' | null
  parcelado: boolean
  bandeira: 'visa_master' | 'outras' | null
}
```

## Parte C · `lib/store.ts`

No `import type` do topo, `  DoacaoEmDinheiroParaCorrigir,`. Seção nova no fim:

```ts
// ── CORRIGIR E CANCELAR DINHEIRO (US-04b) ──
// Regra provisória: só a coordenação (políticas e funções do banco).

export async function getDoacaoEmDinheiro(id: string): Promise<DoacaoEmDinheiroParaCorrigir | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('donations_cash_view')
    .select('id, donor_name, amount, donated_at, origin, frequency, notes, bank_id, forma, parcelado, bandeira')
    .eq('id', id)
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data ? ({ ...data, amount: Number(data.amount) } as DoacaoEmDinheiroParaCorrigir) : null
}

export async function updateDoacaoEmDinheiro(
  id: string,
  campos: {
    amount: number; donated_at: string; origin: string; frequency: 'monthly' | 'one_time'; notes: string | null
    bank_id: string | null; forma: 'pix' | 'debit' | 'credit' | null; parcelado: boolean; bandeira: 'visa_master' | 'outras' | null
    motivo_da_alteracao: string
  }
): Promise<void> {
  const supabase = await createClient()
  const { data: origem, error: erroOrigem } = await supabase.from('cash_origins').select('id').eq('name', campos.origin).single()
  if (erroOrigem) throw new Error(erroOrigem.message)
  const { origin: _origin, ...resto } = campos
  const { data, error } = await supabase.from('donations_cash').update({ ...resto, origin_id: origem.id }).eq('id', id).select('id')
  if (error) throw new Error(error.message)
  if (!data || data.length === 0) throw new Error('Doação não encontrada ou sem permissão para alterar.')
}

export async function cancelDoacaoEmDinheiro(id: string, motivo: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.rpc('cancelar_doacao_em_dinheiro', { p_id: id, p_motivo: motivo })
  if (error) throw new Error(error.message)
}

export async function cancelVenda(id: string, motivo: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.rpc('cancelar_venda', { p_id: id, p_motivo: motivo })
  if (error) throw new Error(error.message)
}
```

A view `donations_cash_view` da US-35 já traz `bank_id`, `forma`, `parcelado` e `bandeira`.

## Parte D · `actions/correcoes.ts` (arquivo novo)

```ts
'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cancelDoacaoEmDinheiro, cancelVenda, getBanks, getDoacaoEmDinheiro, souCoordenacao, updateDoacaoEmDinheiro } from '@/lib/store'
import { FORMAS_DA_DOACAO, pedeBandeira, type FormaDaDoacao } from '@/lib/taxas'
import { dataDeBrasilia, dateInputToISO, brTodayStr, parseMoney } from '@/lib/utils'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ORIGENS = ['PIX', 'Dinheiro', 'Site', 'Transferência', 'Outro']
const AVISO_RESTRITO = 'Só a coordenação corrige e cancela lançamentos com dinheiro. Peça à coordenação.'

const motivoDe = (v: FormDataEntryValue | string | null) => String(v ?? '').trim().slice(0, 300)

export async function corrigirDoacaoEmDinheiro(id: string, fd: FormData): Promise<{ error: string } | void> {
  if (!(await souCoordenacao())) return { error: AVISO_RESTRITO }
  if (!UUID.test(id)) return { error: 'Doação não encontrada.' }
  const motivo = motivoDe(fd.get('motivo_da_alteracao'))
  if (motivo.length < 5) return { error: 'Escreva o motivo da correção.' }

  const valor = parseMoney((fd.get('amount') as string) || '0')
  if (!(valor > 0)) return { error: 'Informe um valor maior que zero.' }
  const data = ((fd.get('donated_at') as string) || '').trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || data > brTodayStr()) return { error: 'A data da doação não pode ser depois de hoje.' }
  const origem = (fd.get('origin') as string) || ''
  if (!ORIGENS.includes(origem)) return { error: 'Escolha a origem.' }
  const frequencia = fd.get('frequency') === 'monthly' ? 'monthly' : 'one_time'

  // Maquininha: as mesmas regras do registro (US-35).
  let recebimento: { bank_id: string | null; forma: 'pix' | 'debit' | 'credit' | null; parcelado: boolean; bandeira: 'visa_master' | 'outras' | null } =
    { bank_id: null, forma: null, parcelado: false, bandeira: null }
  const bancoEscolhido = ((fd.get('bank_id') as string) || '').trim()
  if (bancoEscolhido) {
    const escolha = FORMAS_DA_DOACAO[((fd.get('forma') as string) || '') as FormaDaDoacao]
    const banco = (await getBanks('doacoes')).find((b) => b.id === bancoEscolhido)
    if (!escolha || !banco || banco.type !== escolha.tipoDoBanco) return { error: 'Escolha a maquininha e a forma da lista.' }
    const b = fd.get('bandeira')
    const comBandeira = pedeBandeira(banco.name, escolha.forma)
    const bandeira = comBandeira && (b === 'visa_master' || b === 'outras') ? b : null
    if (comBandeira && !bandeira) return { error: 'No débito desta maquininha, escolha a bandeira.' }
    recebimento = { bank_id: banco.id, forma: escolha.forma, parcelado: escolha.parcelado, bandeira }
  }

  try {
    const original = await getDoacaoEmDinheiro(id)
    if (!original) return { error: 'Doação não encontrada.' }
    // Mesma data: a hora gravada fica (como na US-04a).
    const donatedAt = data === dataDeBrasilia(original.donated_at) ? original.donated_at : dateInputToISO(data)
    await updateDoacaoEmDinheiro(id, {
      amount: valor, donated_at: donatedAt, origin: origem, frequency: frequencia,
      notes: ((fd.get('notes') as string) || '').trim() || null,
      ...recebimento,
      motivo_da_alteracao: motivo,
    })
  } catch (e) {
    console.error('corrigirDoacaoEmDinheiro error:', e)
    return { error: 'Não foi possível salvar a correção. Tente novamente.' }
  }
  revalidatePath('/doacoes/dinheiro')
  redirect('/doacoes/dinheiro')
}

export async function cancelarDoacaoEmDinheiro(id: string, motivo: string): Promise<{ error: string } | void> {
  if (!(await souCoordenacao())) return { error: AVISO_RESTRITO }
  if (!UUID.test(id)) return { error: 'Doação não encontrada.' }
  if (motivoDe(motivo).length < 5) return { error: 'Escreva o motivo do cancelamento.' }
  try {
    await cancelDoacaoEmDinheiro(id, motivoDe(motivo))
  } catch (e) {
    console.error('cancelarDoacaoEmDinheiro error:', e)
    return { error: 'Não foi possível cancelar a doação.' }
  }
  revalidatePath('/doacoes/dinheiro')
}

export async function cancelarVenda(id: string, motivo: string): Promise<{ error: string } | void> {
  if (!(await souCoordenacao())) return { error: AVISO_RESTRITO }
  if (!UUID.test(id)) return { error: 'Venda não encontrada.' }
  if (motivoDe(motivo).length < 5) return { error: 'Escreva o motivo do cancelamento.' }
  try {
    await cancelVenda(id, motivoDe(motivo))
  } catch (e) {
    console.error('cancelarVenda error:', e)
    return { error: 'Não foi possível cancelar a venda.' }
  }
  revalidatePath('/brecho/financeiro')
  revalidatePath('/brecho')
}
```

## Parte E · Telas

### Cancelar com motivo: `components/ui/cancelar-com-motivo.tsx` (arquivo novo)

O mesmo jeito da exclusão da doação de item (US-04a e SEC-04), para venda e doação em dinheiro.

```tsx
'use client'

import { useState, useTransition } from 'react'

export function CancelarComMotivo({ rotulo, cancelar }: { rotulo: string; cancelar: (motivo: string) => Promise<{ error: string } | void> }) {
  const [aberto, setAberto] = useState(false)
  const [motivo, setMotivo] = useState('')
  const [erro, setErro] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!aberto) return <button type="button" onClick={() => setAberto(true)} className="chip bg-bg">{rotulo}</button>

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <input aria-label="Motivo do cancelamento" value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Motivo (obrigatório)" maxLength={300} className="input-base py-1 text-xs w-[200px]" />
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(async () => {
            setErro(null)
            const r = await cancelar(motivo)
            if (r?.error) setErro(r.error)
            else { setAberto(false); setMotivo('') }
          })}
          className="chip bg-coral text-white border-coral disabled:opacity-50"
        >
          Confirmar cancelamento
        </button>
        <button type="button" disabled={isPending} onClick={() => { setAberto(false); setMotivo(''); setErro(null) }} className="chip bg-bg">Voltar</button>
      </div>
      {erro && <span role="alert" className="text-xs text-coral">{erro}</span>}
    </div>
  )
}
```

### Lista de doações em dinheiro

`app/(admin)/doacoes/dinheiro/page.tsx`: a página descobre se quem está vendo é a coordenação e passa para a lista.

```diff
-import { getDonations, getValorDoAtendimento } from '@/lib/store'
+import { getDonations, getValorDoAtendimento, souCoordenacao } from '@/lib/store'
...
-  const [donations, valorDoAtendimento] = await Promise.all([getDonations(), getValorDoAtendimento()])
+  const [donations, valorDoAtendimento, coordenacao] = await Promise.all([getDonations(), getValorDoAtendimento(), souCoordenacao()])
...
-      <DonationsList donations={donations} valorDoAtendimento={valorDoAtendimento} />
+      <DonationsList donations={donations} valorDoAtendimento={valorDoAtendimento} podeCorrigir={coordenacao} />
```

`components/donations/donations-list.tsx`:

```diff
+import { CancelarComMotivo } from '@/components/ui/cancelar-com-motivo'
+import { cancelarDoacaoEmDinheiro } from '@/actions/correcoes'
...
 interface DonationsListProps {
   donations: DonationCash[]
   valorDoAtendimento: number
+  // US-04b: só a coordenação corrige e cancela (regra provisória). O banco confere de novo.
+  podeCorrigir?: boolean
 }
 
-export function DonationsList({ donations, valorDoAtendimento }: DonationsListProps) {
+export function DonationsList({ donations, valorDoAtendimento, podeCorrigir = false }: DonationsListProps) {
...
                   <td className="px-6 py-4 text-right">
-                    <Link href={`/recibo/dinheiro/${d.id}`} target="_blank" className="chip bg-bg no-underline">
-                      Recibo
-                    </Link>
+                    <div data-testid="acoes-da-doacao-em-dinheiro" className="flex justify-end gap-2">
+                      <Link href={`/recibo/dinheiro/${d.id}`} target="_blank" className="chip bg-bg no-underline">Recibo</Link>
+                      {podeCorrigir && (
+                        <>
+                          <Link href={`/doacoes/corrigir/${d.id}`} className="chip bg-bg no-underline">Corrigir</Link>
+                          <CancelarComMotivo rotulo="Cancelar" cancelar={(motivo) => cancelarDoacaoEmDinheiro(d.id, motivo)} />
+                        </>
+                      )}
+                    </div>
                   </td>
```

### Financeiro: cancelar venda (`components/shop/financials-table.tsx`)

1. Imports: `import { CancelarComMotivo } from '@/components/ui/cancelar-com-motivo'` e `import { cancelarVenda } from '@/actions/correcoes'`.
2. Cabeçalho: `['Data', 'Cliente', 'Bruto', 'Líquido', 'Pagamento', 'Status', '']`.
3. Depois da célula de Status:

```tsx
                  <td className="px-6 py-4 text-right">
                    <CancelarComMotivo rotulo="Cancelar venda" cancelar={(motivo) => cancelarVenda(v.id, motivo)} />
                  </td>
```

4. Acima da tabela, abaixo do título "Vendas do mês" (ou do bloco que já existe ali), o aviso:

```tsx
          <p className="font-body text-xs text-muted m-0 px-6 pt-3">
            Venda registrada errada: cancele, com o motivo, e registre de novo em Nova venda.
          </p>
```

O financeiro já é só da coordenação (US-23), então o botão não precisa de condição.

### `app/(admin)/doacoes/corrigir/[id]/page.tsx` (arquivo novo)

```tsx
import Link from 'next/link'
import { getBanks, getDoacaoEmDinheiro, getTaxasEmVigor } from '@/lib/store'
import { dataDeBrasilia } from '@/lib/utils'
import { CorrigirDoacao } from '@/components/donations/corrigir-doacao'

export const dynamic = 'force-dynamic'

// US-04b · Só a coordenação: /doacoes/corrigir está em SO_COORDENACAO, e a política do banco confere de novo.
export default async function CorrigirDoacaoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [doacao, bancos, taxas] = await Promise.all([getDoacaoEmDinheiro(id).catch(() => null), getBanks('doacoes'), getTaxasEmVigor()])
  if (!doacao) {
    return (
      <div className="px-4 py-6 md:px-14 md:py-10 max-w-[800px]">
        <h1 className="font-display text-[28px] text-ink font-semibold m-0">Doação não encontrada</h1>
        <p className="font-body text-sm text-muted mt-3">Ela pode ter sido cancelada.</p>
        <Link href="/doacoes/dinheiro" className="chip bg-bg no-underline mt-4 inline-flex">Voltar às doações em dinheiro</Link>
      </div>
    )
  }
  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[900px]">
      <div className="text-xs text-muted font-body tracking-[2px] uppercase mb-2">
        <Link href="/doacoes/dinheiro" className="text-muted no-underline hover:text-ink">Doações · Dinheiro</Link> · Corrigir
      </div>
      <h1 className="font-display text-[28px] md:text-[36px] text-ink font-semibold tracking-[-1px] m-0 mb-6">Corrigir a doação de {doacao.donor_name}</h1>
      <CorrigirDoacao doacao={doacao} dataInicial={dataDeBrasilia(doacao.donated_at)} bancos={bancos} taxas={taxas} />
    </div>
  )
}
```

### `components/donations/corrigir-doacao.tsx` (arquivo novo)

```tsx
'use client'

import { useState, useTransition } from 'react'
import { corrigirDoacaoEmDinheiro } from '@/actions/correcoes'
import { BANDEIRAS, FORMAS_DA_DOACAO, pedeBandeira, type Bandeira, type FormaDaDoacao } from '@/lib/taxas'
import { brTodayStr } from '@/lib/utils'
import type { DoacaoEmDinheiroParaCorrigir, TaxaEmVigor } from '@/types'

const ORIGENS = ['PIX', 'Dinheiro', 'Site', 'Transferência', 'Outro']

function formaInicial(d: DoacaoEmDinheiroParaCorrigir): FormaDaDoacao {
  if (d.forma === 'credit') return d.parcelado ? 'credit_parcelado' : 'credit_avista'
  return d.forma ?? 'pix'
}

export function CorrigirDoacao({ doacao, dataInicial, bancos }: {
  doacao: DoacaoEmDinheiroParaCorrigir; dataInicial: string
  bancos: { id: string; name: string; type: string }[]; taxas: TaxaEmVigor[]
}) {
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const [bancoId, setBancoId] = useState(doacao.bank_id ?? '')
  const [forma, setForma] = useState<FormaDaDoacao>(formaInicial(doacao))
  const [bandeira, setBandeira] = useState<Bandeira>(doacao.bandeira ?? 'visa_master')
  const banco = bancos.find((b) => b.id === bancoId)
  const formas = (Object.keys(FORMAS_DA_DOACAO) as FormaDaDoacao[]).filter((f) => FORMAS_DA_DOACAO[f].tipoDoBanco === banco?.type)
  const comBandeira = !!banco && pedeBandeira(banco.name, FORMAS_DA_DOACAO[forma].forma)

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    if (bancoId) { fd.set('bank_id', bancoId); fd.set('forma', forma); if (comBandeira) fd.set('bandeira', bandeira) }
    setErro(null)
    startTransition(async () => {
      const r = await corrigirDoacaoEmDinheiro(doacao.id, fd)
      if (r?.error) setErro(r.error)
    })
  }

  return (
    <form onSubmit={enviar} className="bg-paper border border-rule rounded-[16px] p-6 grid gap-4 font-body">
      <div className="grid grid-cols-2 gap-3">
        <label className="text-[11px] text-muted tracking-[1px] uppercase">Valor (R$)
          <input name="amount" type="number" min="0.01" step="0.01" required defaultValue={doacao.amount.toFixed(2)} className="input-base mt-1.5" />
        </label>
        <label className="text-[11px] text-muted tracking-[1px] uppercase">Data
          <input name="donated_at" type="date" max={brTodayStr()} required defaultValue={dataInicial} className="input-base mt-1.5" />
        </label>
        <label className="text-[11px] text-muted tracking-[1px] uppercase">Origem
          <select name="origin" defaultValue={doacao.origin} className="input-base mt-1.5">{ORIGENS.map((o) => <option key={o}>{o}</option>)}</select>
        </label>
        <label className="text-[11px] text-muted tracking-[1px] uppercase">Frequência
          <select name="frequency" defaultValue={doacao.frequency} className="input-base mt-1.5">
            <option value="one_time">Pontual</option><option value="monthly">Mensal</option>
          </select>
        </label>
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: banco ? (comBandeira ? '1fr 1fr 1fr' : '1fr 1fr') : '1fr' }}>
        <label className="text-[11px] text-muted tracking-[1px] uppercase">Recebido por
          <select value={bancoId} onChange={(e) => { setBancoId(e.target.value); setForma(bancos.find((b) => b.id === e.target.value)?.type === 'pix' ? 'pix' : 'debit') }} className="input-base mt-1.5">
            <option value="">Sem maquininha (espécie ou transferência)</option>
            {bancos.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </label>
        {banco && (
          <label className="text-[11px] text-muted tracking-[1px] uppercase">Forma
            <select value={forma} onChange={(e) => setForma(e.target.value as FormaDaDoacao)} className="input-base mt-1.5">
              {formas.map((f) => <option key={f} value={f}>{FORMAS_DA_DOACAO[f].rotulo}</option>)}
            </select>
          </label>
        )}
        {comBandeira && (
          <label className="text-[11px] text-muted tracking-[1px] uppercase">Bandeira
            <select value={bandeira} onChange={(e) => setBandeira(e.target.value as Bandeira)} className="input-base mt-1.5">
              {BANDEIRAS.map((b) => <option key={b.valor} value={b.valor}>{b.rotulo}</option>)}
            </select>
          </label>
        )}
      </div>
      <label className="text-[11px] text-muted tracking-[1px] uppercase">Observações
        <textarea name="notes" rows={2} defaultValue={doacao.notes ?? ''} className="input-base resize-none mt-1.5" />
      </label>
      <label className="text-[11px] text-muted tracking-[1px] uppercase">Motivo da correção
        <input name="motivo_da_alteracao" required minLength={5} maxLength={300} placeholder="Ex.: valor digitado com um zero a mais" className="input-base mt-1.5" />
      </label>
      {erro && <div role="alert" className="rounded-[10px] px-4 py-3 text-[13px]" style={{ backgroundColor: '#F8DCD2', color: '#D87560' }}>{erro}</div>}
      <button type="submit" disabled={isPending} className="bg-emerald text-white border-none py-3 rounded-[10px] text-sm font-medium disabled:opacity-50">
        {isPending ? 'Salvando...' : 'Salvar correção'}
      </button>
    </form>
  )
}
```

A prop `taxas` fica disponível para mostrar o líquido estimado, como no formulário da US-35; o líquido de verdade é sempre o do banco.

### Rota

`lib/rotas.ts`, no fim de `SO_COORDENACAO`: `  '/doacoes/corrigir', // US-04b`.

### Matriz de permissões

Em `docs/seguranca/matriz-de-permissoes.md`, além de tirar as marcas "(Sprint 7, US-04b)", reescreva a resposta da "Decisão em aberto" 5: "Regra provisória da Sprint 7 (US-04b): só a coordenação corrige e cancela, com motivo, e a trilha (SEC-04) registra. Aguardando o Instituto (pergunta 4 de 06/11)". Na seção "Mesclagem e cancelamento", troque o parágrafo do cancelamento por um resumo desta story.

## Parte F · Testes

### `tests/acesso/corrigir-e-cancelar-dinheiro.spec.ts` (arquivo novo)

```ts
// US-04b · Correção e cancelamento de dinheiro: só a coordenação, com motivo, e o cancelado some.
import { test, expect } from '@playwright/test'
import type { SupabaseClient } from '@supabase/supabase-js'
import { CAIXA, COORDENACAO, entrarNaApi, recusado } from './apoio'

let coordenacao: SupabaseClient
let caixa: SupabaseClient
let caixaId: string
let origemId: string

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  ;({ api: coordenacao } = await entrarNaApi(COORDENACAO))
  ;({ api: caixa, id: caixaId } = await entrarNaApi(CAIXA))
  const { data } = await caixa.from('cash_origins').select('id').eq('name', 'PIX').single()
  origemId = data!.id
})

async function doacaoDoCaixa(valor = 100) {
  const r = await caixa.from('donations_cash')
    .insert({ donor_name: 'TESTE US-04b', amount: valor, origin_id: origemId, frequency: 'one_time', donated_at: new Date().toISOString(), registered_by: caixaId })
    .select('id').single()
  return r.data!.id as string
}

test('o caixa não corrige nem cancela; a coordenação corrige com motivo e o líquido é refeito', async () => {
  const id = await doacaoDoCaixa()
  expect(recusado(await caixa.from('donations_cash').update({ amount: 10, motivo_da_alteracao: 'tentativa do caixa' }).eq('id', id).select())).toBe(true)
  expect((await caixa.rpc('cancelar_doacao_em_dinheiro', { p_id: id, p_motivo: 'tentativa do caixa' })).error).not.toBeNull()

  // Sem motivo, a correção de valor é recusada pelo banco.
  expect((await coordenacao.from('donations_cash').update({ amount: 150 }).eq('id', id)).error).not.toBeNull()
  const ok = await coordenacao.from('donations_cash').update({ amount: 150, motivo_da_alteracao: 'valor digitado errado' }).eq('id', id).select('amount, net_amount').single()
  expect(ok.error).toBeNull()
  expect(Number(ok.data!.net_amount)).toBe(150)

  // Taxa e líquido não são alterados à mão.
  expect((await coordenacao.from('donations_cash').update({ net_amount: 1 }).eq('id', id)).error).not.toBeNull()
})

test('a doação cancelada some para todos e fica na trilha com o motivo', async () => {
  const id = await doacaoDoCaixa()
  expect((await coordenacao.rpc('cancelar_doacao_em_dinheiro', { p_id: id, p_motivo: 'x' })).error).not.toBeNull()
  expect((await coordenacao.rpc('cancelar_doacao_em_dinheiro', { p_id: id, p_motivo: 'lançada em dobro' })).error).toBeNull()

  expect((await coordenacao.from('donations_cash_view').select('id').eq('id', id)).data).toEqual([])
  expect((await caixa.from('donations_cash_view').select('id').eq('id', id)).data).toEqual([])
  const { data: trilha } = await coordenacao.from('trilha_de_auditoria').select('acao, motivo').eq('registro_id', id)
  expect(trilha).toContainEqual({ acao: 'exclusao', motivo: 'lançada em dobro' })
})

test('a venda cancelada some, e o caixa não cancela', async () => {
  const { data: forma } = await caixa.from('payment_methods').select('id').eq('name', 'cash').single()
  const { data: vendaId } = await caixa.rpc('register_sale', {
    p_client_id: null, p_customer_name: 'TESTE US-04b', p_payment_method_id: forma!.id, p_bank_id: null,
    p_installments: null, p_net_amount: 20, p_registered_by: caixaId, p_sold_at: new Date().toISOString(),
    p_items: [{ category_name: 'blusa', amount: 20 }],
  })
  expect((await caixa.rpc('cancelar_venda', { p_id: vendaId, p_motivo: 'tentativa do caixa' })).error).not.toBeNull()
  expect((await coordenacao.rpc('cancelar_venda', { p_id: vendaId, p_motivo: 'registrada no cliente errado' })).error).toBeNull()
  expect((await coordenacao.from('sales_view').select('id').eq('id', vendaId)).data).toEqual([])
  expect((await coordenacao.from('sale_items').select('id').eq('sale_id', vendaId)).data).toEqual([])
})
```

### `tests/fumaca/corrigir-e-cancelar-dinheiro.spec.ts` (arquivo novo)

```ts
// US-04b · A coordenação corrige e cancela uma doação em dinheiro pela tela.
import { test, expect } from '@playwright/test'
import { doacaoSemFicha, entrar, valorUnico } from './apoio'

test('corrigir o valor com motivo e depois cancelar', async ({ page }) => {
  await entrar(page)
  const valor = valorUnico(40)
  const nome = `TESTE US-04b ${Date.now()}`
  await page.goto('/doacoes/dinheiro/nova')
  await doacaoSemFicha(page, nome)
  await page.locator('input[name="amount"]').fill(valor.numero.toFixed(2))
  await page.getByRole('button', { name: 'Registrar doação' }).click()
  await page.waitForURL(/\/doacoes\/dinheiro$/)

  const linha = page.getByRole('row').filter({ hasText: nome })
  await linha.getByRole('link', { name: 'Corrigir' }).click()
  await page.getByLabel('Valor (R$)').fill('45.00')
  await page.getByLabel('Motivo da correção').fill('valor conferido no extrato')
  await page.getByRole('button', { name: 'Salvar correção' }).click()
  await page.waitForURL(/\/doacoes\/dinheiro$/)
  await expect(linha).toContainText('R$ 45,00')

  await linha.getByRole('button', { name: 'Cancelar' }).click()
  await linha.getByLabel('Motivo do cancelamento').fill('doação de teste')
  await linha.getByRole('button', { name: 'Confirmar cancelamento' }).click()
  await expect(page.getByRole('row').filter({ hasText: nome })).toHaveCount(0)

  await page.goto('/relatorios/alteracoes?tabela=donations_cash')
  await expect(page.getByTestId('motivo').filter({ hasText: 'doação de teste' }).first()).toBeVisible()
})
```

### Testes que já existem e mudam

- `tests/acesso/taxa-nas-doacoes.spec.ts` (US-35, terça): o teste "corrigir o valor refaz o líquido" passa a mandar o motivo: `.update({ amount: 200, motivo_da_alteracao: 'teste da US-35' })`.
- Testes que atualizam `sales` ou `donations_cash` por API em colunas fora da lista nova (por exemplo, `created_at` em algum preparo): procure com `grep -rn "from('sales').update\|from('donations_cash').update" tests` e ajuste.
- `tests/fumaca/forma-de-pagamento.spec.ts` e outros que leem o cabeçalho do financeiro pela posição: a coluna nova (vazia) fica no fim.

## Conferir

```bash
npm run db:reset
npm run lint
npm run build
npm run test:fumaca
npm run test:acesso
```

Na tela, com `npm run dev`: coordenação corrige e cancela uma doação em dinheiro, cancela uma venda no financeiro, e vê as três em Relatórios · Alterações; caixa não vê "Corrigir" nem "Cancelar", e `/doacoes/corrigir/<id>` volta para o brechó.

## Pull Request

Título: `US-04b · Correção e cancelamento de venda e de doação em dinheiro`, com os critérios e a regra provisória em destaque. A Bibiana revisa (ela fez a US-04a, que esta story segue) com as contas de coordenação e de caixa e escreve no PR o que testou.

**Integração, quinta 12/11, à noite, o último da noite:** `migration list --remote` (só a `20261111110000` pendente), `db push --remote`, `migration list --remote`; merge; conferência com a conta de conferência da coordenação: uma doação "CONFERÊNCIA" de R$ 1, corrigida para R$ 2 e cancelada, com as duas linhas em Relatórios · Alterações. Registrar no `PROGRESSO.md`.

## Fora desta story

- Balcão corrigindo no mesmo dia: depende da resposta à pergunta 4.
- Desfazer um cancelamento: não pedido; o registro fica no banco, e a coordenação registra de novo se precisar.
- Os atalhos da nova venda (US-05) continuam contando peças de venda cancelada: a função é `security definer` e lê a tabela direto. Ajuste de uma linha numa story futura, se fizer diferença.
