# US-21a · Agradecimento com um clique, uma vez por período (8 SP)

> Como apoiadora do Instituto, eu quero receber um agradecimento pela contribuição que fiz, uma única vez, para que eu me sinta reconhecida sem ser abordada três vezes pelo mesmo apoio.

**Tipo:** user story · **Implementa:** Alissa · **Revisa:** Laís · **Branch:** `us-21a-agradecimento` · **Depende de:** US-07 (autorização de mensagens), US-15 e US-19 (contribuição e atendimentos), todas na `main` · **PR pronto:** quinta 12/11, 18h · **Merge:** quinta 12/11, à noite, o primeiro da noite

**Divisão da US-21 (planejamento de 06/11):** a US-21 tinha 13 SP e dependia de o Instituto aprovar o termo e escolher o canal. Esta parte (8 SP) faz o agradecimento pelo WhatsApp ou e-mail da própria coordenação, com a mensagem pronta e a trava de "uma vez por período", e não depende do canal. A US-21b (5 SP, Backlog do Produto) é o envio automático por e-mail, que depende de um e-mail próprio do Instituto (pergunta 16). Juntas, as duas cobrem os critérios do cartão original.

## Critérios de aceitação

- [ ] A coordenação vê, para o mês escolhido, quem contribuiu (compras, doações em dinheiro e itens), com o total, os atendimentos que ajudou a custear e a situação do agradecimento
- [ ] Para quem autorizou mensagens com uma versão do termo **aprovada pelo Instituto**, o botão abre o WhatsApp (ou o e-mail) com a mensagem pronta, e o agradecimento fica registrado com data, canal, pessoa e quem enviou
- [ ] A mesma pessoa não é agradecida duas vezes no mesmo período (provisório: o mês), nem por duas pessoas da coordenação ao mesmo tempo: a trava é do banco
- [ ] Enquanto nenhuma versão do termo tiver aprovação registrada, ninguém aparece como "pode agradecer"; a coordenação registra a aprovação na própria tela, com a data
- [ ] A mensagem não pede dado nem pagamento e diz como deixar de receber mensagens
- [ ] Só a coordenação abre a tela e registra; testes de fumaça e de acesso passam

## Decisões

- **Um clique, pelo aparelho da coordenação:** o mesmo caminho dos aniversariantes (US-22), com `wa.me` e `mailto:`. O sistema não envia nada sozinho nesta story; registra que a coordenação enviou.
- **A trava do termo é do banco:** tabela `aprovacoes_do_termo` (versão, data da aprovação, quem registrou) e a view `destinatarios_do_agradecimento`, que só traz quem está em `message_recipients` (US-07) **e** autorizou uma versão aprovada. O registro do agradecimento é recusado por gatilho para quem não está nela.
- **Uma vez por período:** `unique (client_id, periodo)` na tabela `agradecimentos`. O período é o mês (`AAAA-MM`) até o Instituto responder a pergunta 2 ("por mês, por ano ou por compra"). A coluna aceita também o ano (`AAAA`), para a troca não precisar de migração.
- **Registrar antes de abrir:** o botão abre uma janela vazia, registra no servidor e só então leva a janela para o WhatsApp. Se o registro falhar (já agradecida, sem autorização), a janela fecha e a tela mostra o motivo. Assim não sai mensagem sem registro.
- **Contribuição do mês:** compras e doações em dinheiro (bruto, como no relatório consolidado) e as peças de item, só de quem tem ficha. Atendimentos pelo valor em vigor (US-19).
- **Só coordenação**, até a pergunta 3 ("o balcão também agradece?").

## 1. Branch

```bash
git checkout main && git pull
git checkout -b us-21a-agradecimento
git push -u origin us-21a-agradecimento
```

## Parte A · Migração `supabase/migrations/20261111090000_agradecimentos.sql`

```sql
-- US-21a · Agradecimento com um clique, uma vez por período
-- Aprovação do termo pelo Instituto, a lista de quem pode receber agradecimento
-- e o registro de cada agradecimento, com a trava de um por período.

-- ─────────────────────────────────────────
-- 1. Aprovação do termo de mensagens pelo Instituto. Uma linha por versão.
--    Ninguém altera nem apaga: é o registro de que o Instituto aprovou.
-- ─────────────────────────────────────────

create table public.aprovacoes_do_termo (
  versao         text primary key check (btrim(versao) <> ''),
  aprovado_em    date not null,
  observacao     text check (observacao is null or length(observacao) <= 300),
  registrado_em  timestamptz not null default now(),
  registrado_por uuid references public.users(id) on delete set null
);

create or replace function public.carimbar_aprovacao_do_termo()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.registrado_em := now();
  new.registrado_por := auth.uid();
  if new.aprovado_em > (now() at time zone 'America/Sao_Paulo')::date then
    raise exception 'A data da aprovação não pode ser depois de hoje.' using errcode = '22023';
  end if;
  return new;
end;
$$;

create trigger carimbo_da_aprovacao_do_termo
  before insert on public.aprovacoes_do_termo
  for each row execute function public.carimbar_aprovacao_do_termo();

alter table public.aprovacoes_do_termo enable row level security;

create policy "coordenacao le" on public.aprovacoes_do_termo
  for select to authenticated using (public.eh_coordenacao());
create policy "coordenacao registra" on public.aprovacoes_do_termo
  for insert to authenticated with check (public.eh_coordenacao());

revoke all on public.aprovacoes_do_termo from anon;
grant select, insert on public.aprovacoes_do_termo to authenticated;

-- ─────────────────────────────────────────
-- 2. Quem pode receber agradecimento: está na lista da US-07 e autorizou uma
--    versão aprovada. security_invoker: só a coordenação lê as aprovações,
--    então só ela recebe linhas.
-- ─────────────────────────────────────────

create view public.destinatarios_do_agradecimento
with (security_invoker = true) as
select r.client_id, r.name, r.term_version, r.authorized_at
from public.message_recipients r
join public.aprovacoes_do_termo a on a.versao = r.term_version;

revoke all on public.destinatarios_do_agradecimento from anon;
grant select on public.destinatarios_do_agradecimento to authenticated;

-- ─────────────────────────────────────────
-- 3. Agradecimentos. Um por pessoa e por período (mês AAAA-MM, ou ano AAAA se
--    o Instituto preferir). Ninguém altera nem apaga.
-- ─────────────────────────────────────────

create table public.agradecimentos (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients(id) on delete cascade,
  periodo      text not null check (periodo ~ '^\d{4}(-(0[1-9]|1[0-2]))?$'),
  canal        text not null check (canal in ('whatsapp', 'email')),
  term_version text not null,
  enviado_em   timestamptz not null default now(),
  enviado_por  uuid references public.users(id) on delete set null,
  unique (client_id, periodo)
);

create index idx_agradecimentos_periodo on public.agradecimentos (periodo);

-- Quem, quando e a versão do termo vêm do banco. Sem autorização com termo
-- aprovado, o registro é recusado.
create or replace function public.registrar_agradecimento_carimbo()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_versao text;
begin
  select d.term_version into v_versao
    from public.destinatarios_do_agradecimento d
   where d.client_id = new.client_id;
  if not found then
    raise exception 'Esta pessoa não autorizou mensagens com um termo aprovado pelo Instituto.' using errcode = '42501';
  end if;
  new.term_version := v_versao;
  new.enviado_em := now();
  new.enviado_por := auth.uid();
  return new;
end;
$$;

create trigger carimbo_do_agradecimento
  before insert on public.agradecimentos
  for each row execute function public.registrar_agradecimento_carimbo();

alter table public.agradecimentos enable row level security;

create policy "coordenacao le" on public.agradecimentos
  for select to authenticated using (public.eh_coordenacao());
create policy "coordenacao registra" on public.agradecimentos
  for insert to authenticated with check (public.eh_coordenacao());

revoke all on public.agradecimentos from anon;
revoke update, delete, truncate on public.agradecimentos from authenticated;
grant select, insert on public.agradecimentos to authenticated;
```

## Parte B · `lib/mensagens.ts`

No fim do arquivo:

```ts
// US-21a · Período do agradecimento. Provisório: o mês (pergunta 2 ao Instituto, 06/11).
// Para "por ano", troque para 'ano': a tela passa a usar AAAA, e a tabela já aceita.
export const PERIODO_DO_AGRADECIMENTO: 'mes' | 'ano' = 'mes'

const MESES_POR_EXTENSO = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

// Texto proposto pela equipe; a coordenação pode trocar (pergunta 3). Sem pedido
// de dado nem de pagamento, com o caminho para deixar de receber.
export function textoDeAgradecimento(p: { nome: string; mes: number; valor: number; atendimentos: string; pecas: number }): string {
  const primeiroNome = p.nome.trim().split(/\s+/)[0] ?? ''
  const reais = `R$ ${p.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const pecas = `${p.pecas} ${p.pecas === 1 ? 'peça' : 'peças'}`
  const oQue =
    p.valor > 0 && p.pecas > 0
      ? `você contribuiu com ${reais} e doou ${pecas} para o Instituto Camaleão`
      : p.valor > 0
        ? `você contribuiu com ${reais} com o Instituto Camaleão`
        : `você doou ${pecas} para o Instituto Camaleão`
  const impacto = p.valor > 0 ? `, o que ajuda a custear ${p.atendimentos} de pessoas em tratamento de câncer` : ''
  return (
    `Olá, ${primeiroNome}! Em ${MESES_POR_EXTENSO[p.mes - 1]}, ${oQue}${impacto}. ` +
    'Nosso muito obrigado por fazer parte desta história. ' +
    'Se não quiser mais receber mensagens do Instituto, é só responder SAIR.'
  )
}
```

## Parte C · `types/index.ts`

No fim do arquivo:

```ts
// US-21a · Quem contribuiu no período, para a tela de agradecimentos.
export interface PessoaParaAgradecer {
  id: string
  name: string
  phone: string
  email: string
  compras: number
  doacoes: number
  pecas: number
  total: number
  // Na lista de quem autorizou mensagens com um termo aprovado.
  podeReceber: boolean
  agradecidaEm: string | null
  canal: 'whatsapp' | 'email' | null
}
```

## Parte D · `lib/store.ts`

No `import type` do topo, `  PessoaParaAgradecer,`. Seção nova no fim:

```ts
// ── AGRADECIMENTOS (US-21a) ──
// Quem contribuiu no mês, só de quem tem ficha, com a situação do agradecimento.
// A tela é só da coordenação, que enxerga todas as vendas e doações e o telefone inteiro.

export async function getAgradecimentosDoMes(ano: number, mes: number): Promise<{
  pessoas: PessoaParaAgradecer[]
  valorDoAtendimento: number
  versoesAprovadas: string[]
}> {
  const desde = brMidnightUtc(ano, mes, 1).toISOString()
  const ate = (mes === 12 ? brMidnightUtc(ano + 1, 1, 1) : brMidnightUtc(ano, mes + 1, 1)).toISOString()
  const periodo = `${ano}-${String(mes).padStart(2, '0')}`

  const supabase = await createClient()
  const [vendas, dinheiro, itens, aprovacoes, valorDoAtendimento] = await Promise.all([
    supabase.from('sales_view').select('client_id, amount').not('client_id', 'is', null).gte('sold_at', desde).lt('sold_at', ate),
    supabase.from('donations_cash_view').select('client_id, amount').not('client_id', 'is', null).gte('donated_at', desde).lt('donated_at', ate),
    supabase.from('donations_items').select('client_id, quantity, aproveitadas, redoadas, descarte').not('client_id', 'is', null).gte('donated_at', desde).lt('donated_at', ate),
    supabase.from('aprovacoes_do_termo').select('versao'),
    getValorDoAtendimento(),
  ])
  const erro = vendas.error ?? dinheiro.error ?? itens.error ?? aprovacoes.error
  if (erro) throw new Error(erro.message)

  const porPessoa = new Map<string, { compras: number; doacoes: number; pecas: number }>()
  const de = (id: string) => porPessoa.get(id) ?? { compras: 0, doacoes: 0, pecas: 0 }
  for (const v of vendas.data ?? []) { const p = de(v.client_id as string); p.compras += Number(v.amount); porPessoa.set(v.client_id as string, p) }
  for (const d of dinheiro.data ?? []) { const p = de(d.client_id as string); p.doacoes += Number(d.amount); porPessoa.set(d.client_id as string, p) }
  for (const i of itens.data ?? []) { const p = de(i.client_id as string); p.pecas += pecasDaDoacao(i); porPessoa.set(i.client_id as string, p) }

  const ids = [...porPessoa.keys()]
  const versoesAprovadas = (aprovacoes.data ?? []).map((a) => a.versao as string)
  if (ids.length === 0) return { pessoas: [], valorDoAtendimento, versoesAprovadas }

  const [fichas, podem, feitos] = await Promise.all([
    supabase.from('clients_view').select('id, name, phone, email').in('id', ids),
    supabase.from('destinatarios_do_agradecimento').select('client_id').in('client_id', ids),
    supabase.from('agradecimentos').select('client_id, enviado_em, canal').eq('periodo', periodo).in('client_id', ids),
  ])
  const erro2 = fichas.error ?? podem.error ?? feitos.error
  if (erro2) throw new Error(erro2.message)

  const autorizadas = new Set((podem.data ?? []).map((p) => p.client_id as string))
  const agradecidas = new Map((feitos.data ?? []).map((f) => [f.client_id as string, f]))

  const pessoas = (fichas.data ?? []).map((c): PessoaParaAgradecer => {
    const p = porPessoa.get(c.id as string)!
    const feito = agradecidas.get(c.id as string)
    return {
      id: c.id as string,
      name: c.name as string,
      phone: (c.phone as string) ?? '',
      email: (c.email as string) ?? '',
      compras: round2(p.compras),
      doacoes: round2(p.doacoes),
      pecas: p.pecas,
      total: round2(p.compras + p.doacoes),
      podeReceber: autorizadas.has(c.id as string),
      agradecidaEm: (feito?.enviado_em as string) ?? null,
      canal: (feito?.canal as PessoaParaAgradecer['canal']) ?? null,
    }
  })
  return {
    pessoas: pessoas.sort((a, b) => b.total - a.total || b.pecas - a.pecas || a.name.localeCompare(b.name, 'pt-BR')),
    valorDoAtendimento,
    versoesAprovadas,
  }
}

export async function addAgradecimento(clientId: string, periodo: string, canal: 'whatsapp' | 'email'): Promise<void> {
  const supabase = await createClient()
  // term_version, enviado_em e enviado_por são preenchidos pelo banco (gatilho).
  const { error } = await supabase.from('agradecimentos').insert({ client_id: clientId, periodo, canal, term_version: '' })
  if (error) throw Object.assign(new Error(error.message), { code: error.code })
}

export async function addAprovacaoDoTermo(versao: string, aprovadoEm: string, observacao: string | null): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase.from('aprovacoes_do_termo').insert({ versao, aprovado_em: aprovadoEm, observacao })
  if (error) throw Object.assign(new Error(error.message), { code: error.code })
}
```

## Parte E · `actions/agradecimentos.ts` (arquivo novo)

```ts
'use server'

import { revalidatePath } from 'next/cache'
import { addAgradecimento, addAprovacaoDoTermo, souCoordenacao } from '@/lib/store'
import { TERMO_MENSAGENS } from '@/lib/termo-mensagens'
import { brTodayStr } from '@/lib/utils'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const PERIODO = /^\d{4}(-(0[1-9]|1[0-2]))?$/

export async function registrarAgradecimento(clientId: string, periodo: string, canal: string): Promise<{ error: string } | void> {
  if (!(await souCoordenacao())) return { error: 'Só a coordenação registra agradecimentos.' }
  if (!UUID.test(clientId) || !PERIODO.test(periodo) || (canal !== 'whatsapp' && canal !== 'email')) {
    return { error: 'Agradecimento inválido.' }
  }
  try {
    await addAgradecimento(clientId, periodo, canal)
  } catch (e) {
    const codigo = (e as { code?: string }).code
    if (codigo === '23505') return { error: 'Esta pessoa já foi agradecida neste período.' }
    if (codigo === '42501') return { error: 'Esta pessoa não autorizou mensagens com um termo aprovado pelo Instituto.' }
    console.error('registrarAgradecimento error:', e)
    return { error: 'Não foi possível registrar o agradecimento. Tente novamente.' }
  }
  revalidatePath('/clientes/agradecimentos')
}

// A coordenação registra que o Instituto aprovou a versão atual do termo.
export async function registrarAprovacaoDoTermo(fd: FormData): Promise<{ error: string } | void> {
  if (!(await souCoordenacao())) return { error: 'Só a coordenação registra a aprovação.' }
  const data = ((fd.get('aprovado_em') as string) || '').trim()
  const observacao = ((fd.get('observacao') as string) || '').trim().slice(0, 300) || null
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || data > brTodayStr()) return { error: 'Informe a data da aprovação, até hoje.' }
  try {
    await addAprovacaoDoTermo(TERMO_MENSAGENS.versao, data, observacao)
  } catch (e) {
    if ((e as { code?: string }).code === '23505') return { error: 'Esta versão do termo já tem aprovação registrada.' }
    console.error('registrarAprovacaoDoTermo error:', e)
    return { error: 'Não foi possível registrar a aprovação.' }
  }
  revalidatePath('/clientes/agradecimentos')
}
```

## Parte F · A tela

### `components/clients/botao-de-agradecer.tsx` (arquivo novo)

```tsx
'use client'

import { useState, useTransition } from 'react'
import { Mail, MessageCircle } from 'lucide-react'
import { registrarAgradecimento } from '@/actions/agradecimentos'

// Registra no servidor antes de abrir o WhatsApp ou o e-mail: sem registro, nada sai.
export function BotaoDeAgradecer({ clientId, periodo, whatsapp, email }: {
  clientId: string; periodo: string; whatsapp: string | null; email: string | null
}) {
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  function agradecer(canal: 'whatsapp' | 'email', link: string) {
    setErro(null)
    // A janela abre já no clique (senão o navegador bloqueia) e só recebe o link depois do registro.
    const janela = canal === 'whatsapp' ? window.open('about:blank', '_blank') : null
    startTransition(async () => {
      const r = await registrarAgradecimento(clientId, periodo, canal)
      if (r?.error) {
        janela?.close()
        setErro(r.error)
        return
      }
      if (janela) janela.location.href = link
      else window.location.href = link
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        {whatsapp && (
          <button type="button" disabled={isPending} onClick={() => agradecer('whatsapp', whatsapp)} className="chip bg-bg disabled:opacity-50">
            <MessageCircle size={11} /> WhatsApp
          </button>
        )}
        {email && (
          <button type="button" disabled={isPending} onClick={() => agradecer('email', email)} className="chip bg-bg disabled:opacity-50">
            <Mail size={11} /> E-mail
          </button>
        )}
      </div>
      {erro && <span role="alert" className="text-xs text-coral">{erro}</span>}
    </div>
  )
}
```

### `components/clients/aprovacao-do-termo.tsx` (arquivo novo)

```tsx
'use client'

import { useState, useTransition } from 'react'
import { registrarAprovacaoDoTermo } from '@/actions/agradecimentos'
import { TERMO_MENSAGENS } from '@/lib/termo-mensagens'
import { brTodayStr } from '@/lib/utils'

export function AprovacaoDoTermo() {
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setErro(null)
    startTransition(async () => {
      const r = await registrarAprovacaoDoTermo(fd)
      if (r?.error) setErro(r.error)
    })
  }

  return (
    <form onSubmit={enviar} data-testid="aprovacao-do-termo" className="rounded-[16px] p-6 border mb-6 font-body" style={{ backgroundColor: '#FBE3CA', borderColor: '#C97D3E' }}>
      <div className="text-sm text-ink font-medium">O Instituto ainda não aprovou o texto de autorização de mensagens (versão {TERMO_MENSAGENS.versao}).</div>
      <p className="text-xs text-muted mt-1 mb-3">
        Enquanto não houver aprovação registrada, ninguém aparece para agradecimento. Quando a coordenação do Instituto aprovar, registre aqui a data.
      </p>
      <blockquote className="text-xs text-ink bg-paper rounded-[10px] p-3 m-0 mb-3">{TERMO_MENSAGENS.texto}</blockquote>
      <div className="flex flex-wrap gap-3 items-end">
        <label className="text-[11px] text-muted tracking-[1px] uppercase">Aprovado em
          <input name="aprovado_em" type="date" max={brTodayStr()} required className="input-base mt-1.5" />
        </label>
        <label className="text-[11px] text-muted tracking-[1px] uppercase flex-1 min-w-[220px]">Observação
          <input name="observacao" maxLength={300} placeholder="Ex.: aprovado pela Flávia no WhatsApp" className="input-base mt-1.5" />
        </label>
        <button type="submit" disabled={isPending} className="chip bg-ink text-bg border-ink disabled:opacity-50">Registrar aprovação</button>
      </div>
      {erro && <div role="alert" className="text-xs text-coral mt-2">{erro}</div>}
    </form>
  )
}
```

### `app/(admin)/clientes/agradecimentos/page.tsx` (arquivo novo)

```tsx
import Link from 'next/link'
import { getAgradecimentosDoMes } from '@/lib/store'
import { atendimentos, textoDeAtendimentos } from '@/lib/atendimentos'
import { PERIODO_DO_AGRADECIMENTO, linkDoEmail, linkDoWhatsApp, textoDeAgradecimento } from '@/lib/mensagens'
import { TERMO_MENSAGENS } from '@/lib/termo-mensagens'
import { brTodayStr, formatBRL } from '@/lib/utils'
import { AprovacaoDoTermo } from '@/components/clients/aprovacao-do-termo'
import { BotaoDeAgradecer } from '@/components/clients/botao-de-agradecer'

export const dynamic = 'force-dynamic'

const MES = /^\d{4}-(0[1-9]|1[0-2])$/
const NOMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']

function outroMes(ano: number, mes: number, passo: number) {
  const d = new Date(Date.UTC(ano, mes - 1 + passo, 1))
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

const dia = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })

// US-21a · Só a coordenação: /clientes/agradecimentos está em SO_COORDENACAO.
export default async function AgradecimentosPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const { mes } = await searchParams
  const escolhido = mes && MES.test(mes) ? mes : brTodayStr().slice(0, 7)
  const [ano, m] = escolhido.split('-').map(Number)
  // Provisório: um agradecimento por mês. Com 'ano', o período vira AAAA.
  const periodo = PERIODO_DO_AGRADECIMENTO === 'ano' ? String(ano) : escolhido
  const { pessoas, valorDoAtendimento, versoesAprovadas } = await getAgradecimentosDoMes(ano, m)
  const termoAprovado = versoesAprovadas.includes(TERMO_MENSAGENS.versao)
  const semAutorizacao = pessoas.filter((p) => !p.podeReceber).length

  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1100px]">
      <header className="mb-8">
        <div className="text-xs text-muted font-body tracking-[2px] uppercase mb-2">Clientes · Agradecimentos</div>
        <h1 className="font-display text-[28px] md:text-[40px] text-ink font-semibold tracking-[-1px] m-0">Agradecimentos de {NOMES[m - 1]} de {ano}</h1>
        <p className="font-body text-muted text-sm mt-2 max-w-[640px]">
          Quem contribuiu no mês, com o total e os atendimentos que ajudou a custear. O botão registra o agradecimento e abre o WhatsApp ou o e-mail com a mensagem pronta. Cada pessoa recebe um agradecimento por mês.
        </p>
      </header>

      <nav aria-label="Mês" className="flex gap-2 mb-6 font-body">
        <Link href={`/clientes/agradecimentos?mes=${outroMes(ano, m, -1)}`} className="chip bg-paper no-underline">Mês anterior</Link>
        <Link href={`/clientes/agradecimentos?mes=${outroMes(ano, m, 1)}`} className="chip bg-paper no-underline">Mês seguinte</Link>
      </nav>

      {!termoAprovado && <AprovacaoDoTermo />}

      {pessoas.length === 0 ? (
        <div className="bg-paper border border-rule rounded-[16px] p-10 text-center font-body text-sm text-muted">Nenhuma contribuição de quem tem ficha neste mês.</div>
      ) : (
        <ul data-testid="agradecimentos" className="m-0 p-0 list-none bg-paper border border-rule rounded-[16px] overflow-hidden font-body">
          {pessoas.map((p) => {
            const texto = textoDeAgradecimento({
              nome: p.name, mes: m, valor: p.total, pecas: p.pecas,
              atendimentos: textoDeAtendimentos(atendimentos(p.total, valorDoAtendimento)),
            })
            const whatsapp = linkDoWhatsApp(p.phone, texto)
            const email = linkDoEmail(p.email, 'Obrigado por apoiar o Instituto Camaleão', texto)
            return (
              <li key={p.id} data-testid="pessoa-para-agradecer" className="px-6 py-4 border-b border-rule last:border-0 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm text-ink font-medium">{p.name}</div>
                  <div className="text-xs text-muted mt-0.5">
                    {p.total > 0 && `R$ ${formatBRL(p.total)} · ${textoDeAtendimentos(atendimentos(p.total, valorDoAtendimento))}`}
                    {p.total > 0 && p.pecas > 0 && ' · '}
                    {p.pecas > 0 && `${p.pecas} ${p.pecas === 1 ? 'peça' : 'peças'}`}
                  </div>
                </div>
                <div data-testid="situacao-do-agradecimento" className="text-xs text-muted">
                  {p.agradecidaEm ? (
                    `Agradecida em ${dia(p.agradecidaEm)} (${p.canal === 'whatsapp' ? 'WhatsApp' : 'e-mail'})`
                  ) : !p.podeReceber ? (
                    'Sem autorização de mensagens'
                  ) : !whatsapp && !email ? (
                    'Autorizou, mas não tem contato registrado'
                  ) : (
                    <BotaoDeAgradecer clientId={p.id} periodo={periodo} whatsapp={whatsapp} email={email} />
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {semAutorizacao > 0 && (
        <p className="font-body text-xs text-muted mt-3">
          {semAutorizacao} {semAutorizacao === 1 ? 'pessoa contribuiu e não pode' : 'pessoas contribuíram e não podem'} receber mensagem: não autorizaram{termoAprovado ? '' : ', ou o termo ainda não foi aprovado'}.
        </p>
      )}
    </div>
  )
}
```

### Rota, menu e o termo

- `lib/rotas.ts`, no fim de `SO_COORDENACAO`: `  '/clientes/agradecimentos', // US-21a`.
- `components/layout/sidebar.tsx`, em `clientesSub`, depois de "Aniversariantes": `  { href: '/clientes/agradecimentos', label: 'Agradecimentos' },`.
- `docs/privacidade/termo-de-mensagens.md`: na coluna "Aprovação do Instituto" da versão `2026-10`, troque o texto por "Pendente. Texto enviado à Flávia em 15/10. Quando aprovado, a coordenação registra a data em Clientes · Agradecimentos (US-21a), e esta tabela é atualizada". Na seção "Regra de envio", acrescente: "O agradecimento (US-21a) usa a view `destinatarios_do_agradecimento`, que exige também a versão do termo aprovada."

## Parte G · Testes

### `tests/acesso/agradecimentos.spec.ts` (arquivo novo)

```ts
// US-21a · Agradecimento: só com termo aprovado, um por período, só a coordenação.
import { test, expect } from '@playwright/test'
import type { SupabaseClient } from '@supabase/supabase-js'
import { CAIXA, COORDENACAO, entrarNaApi, recusado } from './apoio'

let coordenacao: SupabaseClient
let caixa: SupabaseClient
let comAutorizacao: string
let semAutorizacao: string
const periodo = '2026-11'

test.describe.configure({ mode: 'serial' })

test.beforeAll(async () => {
  ;({ api: coordenacao } = await entrarNaApi(COORDENACAO))
  ;({ api: caixa } = await entrarNaApi(CAIXA))
  const a = await coordenacao.from('clients').insert({ name: `TESTE US-21a ${Date.now()}` }).select('id').single()
  const b = await coordenacao.from('clients').insert({ name: `TESTE US-21a sem ${Date.now()}` }).select('id').single()
  comAutorizacao = a.data!.id
  semAutorizacao = b.data!.id
  await coordenacao.from('message_consents').insert({ client_id: comAutorizacao, authorized: true, term_version: '2026-10' })
})

test('sem aprovação do termo, ninguém recebe agradecimento', async () => {
  const { data } = await coordenacao.from('aprovacoes_do_termo').select('versao').eq('versao', '2026-10')
  test.skip((data ?? []).length > 0, 'o termo já foi aprovado neste banco local; rode npm run db:reset')
  const r = await coordenacao.from('agradecimentos').insert({ client_id: comAutorizacao, periodo, canal: 'whatsapp', term_version: '' })
  expect(r.error?.code).toBe('42501')
})

test('o caixa não aprova o termo; a coordenação aprova, e quem e quando vêm do banco', async () => {
  expect((await caixa.from('aprovacoes_do_termo').insert({ versao: '2026-10', aprovado_em: '2026-11-01' })).error).not.toBeNull()
  const r = await coordenacao.from('aprovacoes_do_termo').upsert({ versao: '2026-10', aprovado_em: '2026-11-01' }, { ignoreDuplicates: true })
  expect(r.error).toBeNull()
})

test('com o termo aprovado, um agradecimento por período', async () => {
  const primeiro = await coordenacao.from('agradecimentos').insert({ client_id: comAutorizacao, periodo, canal: 'whatsapp', term_version: 'qualquer' }).select('term_version').single()
  expect(primeiro.error).toBeNull()
  expect(primeiro.data!.term_version).toBe('2026-10')
  const segundo = await coordenacao.from('agradecimentos').insert({ client_id: comAutorizacao, periodo, canal: 'email', term_version: '' })
  expect(segundo.error?.code).toBe('23505')
  // Quem não autorizou continua de fora.
  const sem = await coordenacao.from('agradecimentos').insert({ client_id: semAutorizacao, periodo, canal: 'whatsapp', term_version: '' })
  expect(sem.error?.code).toBe('42501')
})

test('o caixa não registra nem lê, e ninguém altera ou apaga', async () => {
  expect((await caixa.from('agradecimentos').insert({ client_id: comAutorizacao, periodo: '2026-10', canal: 'whatsapp', term_version: '' })).error).not.toBeNull()
  expect(recusado(await caixa.from('agradecimentos').select('id'))).toBe(true)
  expect(recusado(await caixa.from('destinatarios_do_agradecimento').select('client_id'))).toBe(true)
  const { data } = await coordenacao.from('agradecimentos').select('id').eq('client_id', comAutorizacao).single()
  expect(recusado(await coordenacao.from('agradecimentos').update({ canal: 'email' }).eq('id', data!.id).select())).toBe(true)
  expect(recusado(await coordenacao.from('agradecimentos').delete().eq('id', data!.id).select())).toBe(true)
})
```

O primeiro teste depende de o termo ainda não estar aprovado no banco local; ele se pula sozinho se já estiver (em CI o banco é novo a cada rodada).

### `tests/fumaca/agradecimentos.spec.ts` (arquivo novo)

```ts
// US-21a · A coordenação aprova o termo, agradece pelo WhatsApp e o botão some.
import { test, expect } from '@playwright/test'
import { entrar } from './apoio'
import { COORDENACAO, entrarNaApi } from '../acesso/apoio'

test('agradecer pelo WhatsApp registra e abre a mensagem pronta', async ({ page }) => {
  // Preparo pela API: uma pessoa com doação neste mês e autorização registrada.
  const { api } = await entrarNaApi(COORDENACAO)
  const nome = `Teste Agradecimento ${Date.now()}`
  const telefone = `(51) 9${String(Date.now()).slice(-4)}-${String(Date.now()).slice(-8, -4)}`
  const { data: pessoa } = await api.from('clients').insert({ name: nome, phone: telefone }).select('id').single()
  const { data: origem } = await api.from('cash_origins').select('id').eq('name', 'PIX').single()
  await api.from('donations_cash').insert({ client_id: pessoa!.id, donor_name: nome, amount: 100, origin_id: origem!.id, frequency: 'one_time', donated_at: new Date().toISOString() })
  await api.from('message_consents').insert({ client_id: pessoa!.id, authorized: true, term_version: '2026-10' })

  await entrar(page)
  await page.goto('/clientes/agradecimentos')
  const aprovacao = page.getByTestId('aprovacao-do-termo')
  if (await aprovacao.isVisible()) {
    await aprovacao.getByLabel('Aprovado em').fill(new Date().toISOString().slice(0, 10))
    await aprovacao.getByRole('button', { name: 'Registrar aprovação' }).click()
    await expect(aprovacao).toHaveCount(0)
  }

  const linha = page.getByTestId('pessoa-para-agradecer').filter({ hasText: nome })
  await expect(linha).toContainText('R$ 100,00')
  const janela = page.waitForEvent('popup')
  await linha.getByRole('button', { name: 'WhatsApp' }).click()
  const popup = await janela
  await popup.waitForURL(/wa\.me|whatsapp\.com/)
  expect(decodeURIComponent(popup.url())).toContain(`Olá, ${nome.split(' ')[0]}!`)
  await popup.close()

  await page.reload()
  await expect(linha.getByTestId('situacao-do-agradecimento')).toContainText('Agradecida em')
})
```

A data do teste usa o dia em UTC; se rodar entre 21h e meia-noite, troque por `brTodayStr()` de `lib/utils` (a aprovação recusa data depois de hoje em Brasília). O `wa.me` redireciona para `api.whatsapp.com`; o teste aceita os dois.

## Conferir

```bash
npm run db:reset
npm run lint
npm run build
npm run test:fumaca
npm run test:acesso
```

Na tela, com `npm run dev` e a conta da coordenação: Clientes · Agradecimentos, mês de junho de 2026 (`?mes=2026-06`): as pessoas do seed aparecem com "Sem autorização de mensagens" e o aviso do termo no topo. Registre a autorização de uma delas na ficha, registre a aprovação do termo e agradeça: a mensagem abre pronta e a linha passa a "Agradecida em". Com a conta de caixa, a rota volta para o brechó.

## Pull Request

Título: `US-21a · Agradecimento com um clique, uma vez por período`. No corpo: critérios, a divisão da US-21 e os provisórios (período mês; só a coordenação; texto da mensagem). A Laís revisa com a conta da coordenação (aprovar o termo, agradecer, tentar de novo) e com a de caixa, e escreve no PR o que testou.

**Integração, quinta 12/11, à noite, o primeiro da noite:** `migration list --remote` (só a `20261111090000` pendente), `db push --remote`, `migration list --remote`; merge; conferência com a conta de conferência da coordenação: a tela abre com o aviso do termo; **não registre a aprovação no banco de produção** (é o Instituto que aprova; quem registra é a coordenação, depois da resposta à pergunta 1). Registrar no `PROGRESSO.md`.

## Fora desta story

- Envio automático por e-mail, com domínio autenticado, limite e reenvio: US-21b, no Backlog do Produto.
- Agradecimento pelo total do ano: troca de `PERIODO_DO_AGRADECIMENTO` para `'ano'`, depois da resposta à pergunta 2.
- Na mesclagem de fichas (US-08b), os agradecimentos da ficha que sai são apagados com ela; se o Instituto agradecer por ano, vale levar esses registros para a ficha que fica (ajuste pequeno em `mesclar_fichas`).
