# US-24a · Gestão de usuários pela coordenação (5 SP)

> Como coordenadora do Instituto, eu quero cadastrar e desativar quem usa o sistema por uma tela, para que o Instituto siga operando sem depender da equipe.

**Tipo:** user story · **Implementa:** Laís · **Revisa:** Alissa · **Branch:** `us-24a-gestao-de-usuarios` · **Depende de:** TS-05 integrada (mexe no `scripts/env-local.mjs`); o Mateus cria a variável na Vercel antes do merge · **PR pronto:** quarta 11/11, 18h · **Merge:** quarta 11/11, à noite, depois da US-09

**Divisão da US-24 (planejamento de 06/11):** a US-24 tinha 8 SP e dois assuntos. A gestão de usuários ficou aqui (5 SP); o backup diário virou a US-24b (3 SP, Bibiana), que não mexe em nenhum arquivo desta story.

## Critérios de aceitação

- [ ] A coordenação cadastra uma pessoa com nome, e-mail e perfil (coordenação, voluntária ou caixa); o sistema cria a conta com uma senha provisória, mostrada uma vez só na tela
- [ ] No primeiro acesso, a pessoa é levada a trocar a senha antes de usar o sistema; a coordenação pode gerar uma senha provisória nova para quem esqueceu
- [ ] A coordenação muda o perfil e desativa quem saiu, sem apagar o histórico; quem é desativada perde o acesso na hora e não entra mais, com o aviso "Seu acesso está desativado"; a coordenação pode reativar
- [ ] Ninguém desativa a própria conta, e o sistema não fica sem nenhuma coordenação ativa
- [ ] A chave secreta do Supabase só existe no servidor (variável sem `NEXT_PUBLIC_`), e a esteira continua sem chave secreta nos arquivos do site (SEC-06)
- [ ] Só a coordenação abre a tela Equipe; testes de fumaça e de acesso passam

## Mudança em relação ao cartão

O critério do cartão dizia "enviar convite de primeiro acesso ao e-mail cadastrado". **O envio de e-mail do Supabase sem servidor de e-mail próprio só entrega para os endereços da equipe do projeto** (é um serviço de teste, com limite de poucos e-mails por hora). Para a Tamara receber um convite, o Instituto precisaria de um e-mail próprio configurado (pergunta 16 da mensagem de 06/11). Até lá, o sistema cria a conta com uma **senha provisória**, que a coordenadora manda por mensagem individual, e obriga a troca no primeiro acesso. É o mesmo caminho do cartão "Início do uso pelo Instituto", só que pela tela. O cartão do Trello foi atualizado com este critério.

## Decisões

- **Chave secreta só no servidor:** variável `CHAVE_SECRETA_DO_SUPABASE`, lida só em `lib/supabase/admin.ts`, que só é importado por Server Actions. O nome não começa com `NEXT_PUBLIC_` (iria para o navegador) nem com `SUPABASE_` (o CLI 3.x lê `SUPABASE_*` dos arquivos `.env`, TS-05).
- **Toda ação confere a coordenação primeiro**, com a sessão de quem está logado (`souCoordenacao`), e só depois usa a chave secreta.
- **A lista da equipe vem de uma função do banco** (`usuarios_da_equipe`), que junta `public.users` com o e-mail e o último acesso do `auth.users`. Só a coordenação recebe linhas. Listar não precisa da chave secreta.
- **Desativar:** `users.active = false` (o banco já recusa tudo para quem está desativado desde a US-23) e bloqueio da conta no Auth, para a sessão aberta não se renovar. Reativar desfaz os dois.
- **Última coordenação:** um gatilho em `public.users` recusa desativar ou trocar o perfil da última coordenação ativa. Vale também para a chave secreta, que passa por cima das políticas mas não dos gatilhos.
- **Senha provisória:** 12 caracteres aleatórios, gerados no servidor. Aparecem uma vez na tela e não ficam gravados em lugar nenhum além do Auth.

## 1. Branch

```bash
git checkout main && git pull
git checkout -b us-24a-gestao-de-usuarios
git push -u origin us-24a-gestao-de-usuarios
```

## Parte A · Migração `supabase/migrations/20261110110000_gestao_de_usuarios.sql`

```sql
-- US-24a · Gestão de usuários pela coordenação
-- Troca de senha obrigatória no primeiro acesso, registro de quem cadastrou e
-- desativou, lista da equipe para a coordenação e a trava da última coordenação.

-- ─────────────────────────────────────────
-- 1. Colunas novas em users. Quem grava é o servidor, com a chave secreta,
--    depois de conferir que é a coordenação. Continua sem política de escrita
--    pela API (US-23).
-- ─────────────────────────────────────────

alter table public.users
  add column if not exists trocar_senha   boolean not null default false,
  add column if not exists criado_por     uuid references public.users(id) on delete set null,
  add column if not exists desativado_em  timestamptz,
  add column if not exists desativado_por uuid references public.users(id) on delete set null;

-- ─────────────────────────────────────────
-- 2. Quem trocou a senha marca que trocou. Só a própria linha.
-- ─────────────────────────────────────────

create or replace function public.confirmar_troca_de_senha()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.users set trocar_senha = false where id = auth.uid()
$$;

revoke execute on function public.confirmar_troca_de_senha() from public, anon;
grant execute on function public.confirmar_troca_de_senha() to authenticated;

-- ─────────────────────────────────────────
-- 3. A equipe, com e-mail e último acesso (que ficam em auth.users).
--    security definer para ler auth.users; começa por eh_coordenacao().
-- ─────────────────────────────────────────

create or replace function public.usuarios_da_equipe()
returns table (
  id             uuid,
  name           text,
  role           text,
  active         boolean,
  trocar_senha   boolean,
  email          text,
  ultimo_acesso  timestamptz,
  criado_em      timestamptz,
  desativado_em  timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select u.id, u.name, u.role, coalesce(u.active, false), u.trocar_senha,
         a.email::text, a.last_sign_in_at, u.created_at, u.desativado_em
    from public.users u
    join auth.users a on a.id = u.id
   where public.eh_coordenacao()
   order by coalesce(u.active, false) desc, u.name
$$;

revoke execute on function public.usuarios_da_equipe() from public, anon;
grant execute on function public.usuarios_da_equipe() to authenticated;

-- ─────────────────────────────────────────
-- 4. O sistema nunca fica sem coordenação ativa. Gatilho, e não política:
--    vale também para a chave secreta, que passa por cima das políticas.
-- ─────────────────────────────────────────

create or replace function public.manter_uma_coordenacao()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.role = 'admin' and coalesce(old.active, false)
     and (new.role <> 'admin' or not coalesce(new.active, false))
     and not exists (
       select 1 from public.users u
        where u.id <> old.id and u.role = 'admin' and coalesce(u.active, false)
     ) then
    raise exception 'O sistema precisa de pelo menos uma coordenação ativa.' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger manter_uma_coordenacao
  before update on public.users
  for each row execute function public.manter_uma_coordenacao();
```

## Parte B · A chave secreta no servidor

### `lib/supabase/admin.ts` (arquivo novo)

```ts
// US-24a · Cliente com a chave secreta do Supabase. Passa por cima de todas as
// políticas do banco: use só em Server Actions, depois de conferir que quem
// pediu é a coordenação (souCoordenacao). Nunca importe em componente do navegador.
import { createClient } from '@supabase/supabase-js'

export function clienteComChaveSecreta() {
  if (typeof window !== 'undefined') throw new Error('A chave secreta não pode ser usada no navegador.')
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const chave = process.env.CHAVE_SECRETA_DO_SUPABASE
  if (!url || !chave) {
    throw new Error('Falta CHAVE_SECRETA_DO_SUPABASE no servidor. No local, rode npm run env:local -- --force.')
  }
  return createClient(url, chave, { auth: { persistSession: false, autoRefreshToken: false } })
}
```

### `scripts/env-local.mjs`

Uma linha nova no arquivo gerado, depois da chave anônima (a função `valor` veio da TS-05):

```diff
     `NEXT_PUBLIC_SUPABASE_ANON_KEY=${valor('ANON_KEY', 'PUBLISHABLE_KEY', 'anon_key', 'publishable_key')}`,
+    // US-24a: chave secreta do banco LOCAL (a mesma em todo Supabase local; não dá acesso a dado do Instituto).
+    `CHAVE_SECRETA_DO_SUPABASE=${valor('SECRET_KEY', 'SERVICE_ROLE_KEY', 'secret_key', 'service_role_key')}`,
     '',
```

Na esteira, o `npm run env:local` já roda antes do build, então os testes têm a variável. O passo da SEC-06 continua procurando `sb_secret_` em `.next/static`: se a chave aparecer lá, é porque algum componente do navegador importou `lib/supabase/admin.ts`.

### Na Vercel (Mateus, antes do merge)

Settings, Environment Variables, nova variável `CHAVE_SECRETA_DO_SUPABASE`, **só em Production**, marcada como Sensitive, com a chave secreta (`sb_secret_...`) do `camaleao-producao` (Project Settings, API Keys). **Não** em Preview: o preview aponta para o banco antigo. A chave nunca vai para o Trello, o PR, o grupo ou um arquivo do repositório.

## Parte C · `types/index.ts`

No fim do arquivo:

```ts
// US-24a · Uma pessoa da equipe, para a tela Equipe.
export interface UsuarioDaEquipe {
  id: string
  name: string
  role: 'admin' | 'volunteer' | 'cashier'
  active: boolean
  trocar_senha: boolean
  email: string
  ultimo_acesso: string | null
  criado_em: string
  desativado_em: string | null
}
```

## Parte D · `lib/store.ts`

No `import type` do topo, `  UsuarioDaEquipe,`. Seção nova no fim:

```ts
// ── EQUIPE (US-24a) ──
// A função do banco só devolve linhas para a coordenação.

export async function getEquipe(): Promise<UsuarioDaEquipe[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('usuarios_da_equipe')
  if (error) throw new Error(error.message)
  return (data ?? []) as UsuarioDaEquipe[]
}

export async function getMeuId(): Promise<string | null> {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  return data.user?.id ?? null
}
```

## Parte E · `actions/usuarios.ts` (arquivo novo)

```ts
'use server'

import { randomBytes } from 'node:crypto'
import { revalidatePath } from 'next/cache'
import { clienteComChaveSecreta } from '@/lib/supabase/admin'
import { getMeuId, souCoordenacao } from '@/lib/store'

const PERFIS = ['admin', 'volunteer', 'cashier'] as const
type Perfil = (typeof PERFIS)[number]
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const AVISO_RESTRITO = 'Só a coordenação cadastra e altera usuários.'
// Bloqueio no Auth por cem anos: a sessão aberta não se renova. 'none' desfaz.
const BLOQUEIO = '876000h'

// 12 caracteres sem os que se confundem (0 e O, 1 e l).
function senhaProvisoria(): string {
  const letras = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from(randomBytes(12), (b) => letras[b % letras.length]).join('')
}

function mensagemDoBanco(e: unknown): string {
  const texto = e instanceof Error ? e.message : String(e)
  if (texto.includes('pelo menos uma coordenação ativa')) return 'O sistema precisa de pelo menos uma coordenação ativa.'
  if (/already.*registered|already exists/i.test(texto)) return 'Já existe uma conta com este e-mail.'
  return 'Não foi possível salvar. Tente novamente.'
}

async function conferirCoordenacao(): Promise<string | { error: string }> {
  if (!(await souCoordenacao())) return { error: AVISO_RESTRITO }
  const eu = await getMeuId()
  return eu ?? { error: AVISO_RESTRITO }
}

export async function cadastrarUsuario(fd: FormData): Promise<{ error: string } | { senha: string; nome: string }> {
  const eu = await conferirCoordenacao()
  if (typeof eu !== 'string') return eu
  const nome = ((fd.get('name') as string) || '').replace(/\s+/g, ' ').trim()
  const email = ((fd.get('email') as string) || '').trim().toLowerCase()
  const perfil = (fd.get('role') as string) as Perfil
  if (nome.length < 2) return { error: 'Informe o nome.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Informe um e-mail válido.' }
  if (!PERFIS.includes(perfil)) return { error: 'Escolha o perfil.' }

  const admin = clienteComChaveSecreta()
  const senha = senhaProvisoria()
  const { data, error } = await admin.auth.admin.createUser({ email, password: senha, email_confirm: true })
  if (error || !data.user) return { error: mensagemDoBanco(error) }

  const { error: erroPerfil } = await admin.from('users').insert({
    id: data.user.id, name: nome, role: perfil, active: true, trocar_senha: true, criado_por: eu,
  })
  if (erroPerfil) {
    // Sem perfil, a conta não serve para nada: desfaz a criação no Auth.
    await admin.auth.admin.deleteUser(data.user.id)
    console.error('cadastrarUsuario error:', erroPerfil)
    return { error: 'Não foi possível cadastrar. Tente novamente.' }
  }
  revalidatePath('/equipe')
  return { senha, nome }
}

export async function alterarPerfil(id: string, perfil: string): Promise<{ error: string } | void> {
  const eu = await conferirCoordenacao()
  if (typeof eu !== 'string') return eu
  if (!UUID.test(id) || !PERFIS.includes(perfil as Perfil)) return { error: 'Escolha o perfil.' }
  const { error } = await clienteComChaveSecreta().from('users').update({ role: perfil }).eq('id', id)
  if (error) return { error: mensagemDoBanco(error) }
  revalidatePath('/equipe')
}

export async function desativarUsuario(id: string): Promise<{ error: string } | void> {
  const eu = await conferirCoordenacao()
  if (typeof eu !== 'string') return eu
  if (!UUID.test(id)) return { error: 'Usuário não encontrado.' }
  if (id === eu) return { error: 'Você não pode desativar a sua própria conta.' }
  const admin = clienteComChaveSecreta()
  const { error } = await admin.from('users').update({ active: false, desativado_em: new Date().toISOString(), desativado_por: eu }).eq('id', id)
  if (error) return { error: mensagemDoBanco(error) }
  await admin.auth.admin.updateUserById(id, { ban_duration: BLOQUEIO })
  revalidatePath('/equipe')
}

export async function reativarUsuario(id: string): Promise<{ error: string } | void> {
  const eu = await conferirCoordenacao()
  if (typeof eu !== 'string') return eu
  if (!UUID.test(id)) return { error: 'Usuário não encontrado.' }
  const admin = clienteComChaveSecreta()
  const { error } = await admin.from('users').update({ active: true, desativado_em: null, desativado_por: null }).eq('id', id)
  if (error) return { error: mensagemDoBanco(error) }
  await admin.auth.admin.updateUserById(id, { ban_duration: 'none' })
  revalidatePath('/equipe')
}

export async function gerarSenhaProvisoria(id: string): Promise<{ error: string } | { senha: string }> {
  const eu = await conferirCoordenacao()
  if (typeof eu !== 'string') return eu
  if (!UUID.test(id)) return { error: 'Usuário não encontrado.' }
  const admin = clienteComChaveSecreta()
  const senha = senhaProvisoria()
  const { error } = await admin.auth.admin.updateUserById(id, { password: senha })
  if (error) return { error: mensagemDoBanco(error) }
  await admin.from('users').update({ trocar_senha: true }).eq('id', id)
  revalidatePath('/equipe')
  return { senha }
}
```

## Parte F · Troca de senha no primeiro acesso

### `actions/auth.ts`

Duas mudanças no `login` e uma action nova:

```diff
   if (error) {
+    // US-24a: conta desativada também é bloqueada no Auth.
+    if (error.code === 'user_banned') return { error: 'Seu acesso está desativado. Fale com a coordenação do Instituto.' }
     return { error: 'E-mail ou senha incorretos.' }
   }
...
   const { data: perfil } = await supabase
     .from('users')
-    .select('role, active')
+    .select('role, active, trocar_senha')
     .eq('id', data.user.id)
     .maybeSingle()
...
+  // US-24a: senha provisória troca antes de qualquer tela.
+  if (perfil.trocar_senha) redirect('/trocar-senha')
   // US-28: cada perfil começa na sua página (voluntária em Doações · Itens).
   redirect(paginaInicial(perfil.role))
 }
```

No fim do arquivo:

```ts
// US-24a · A pessoa troca a senha provisória pela dela.
export async function trocarSenha(formData: FormData): Promise<{ error: string } | void> {
  const nova = (formData.get('nova') as string) || ''
  const repetida = (formData.get('repetida') as string) || ''
  if (nova.length < 8) return { error: 'A senha precisa ter pelo menos 8 caracteres.' }
  if (nova !== repetida) return { error: 'As duas senhas estão diferentes.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: nova })
  if (error) return { error: 'Não foi possível trocar a senha. Escolha outra, diferente da provisória.' }
  await supabase.rpc('confirmar_troca_de_senha')

  const { data: { user } } = await supabase.auth.getUser()
  const { data: perfil } = await supabase.from('users').select('role').eq('id', user?.id ?? '').maybeSingle()
  redirect(paginaInicial(perfil?.role))
}
```

### `proxy.ts`

```diff
   const { data: perfil } = await supabase
     .from('users')
-    .select('role, active')
+    .select('role, active, trocar_senha')
     .eq('id', user.id)
     .maybeSingle()
...
   // Logada e ativa não precisa ver o login.
   if (pathname === '/login') {
     return NextResponse.redirect(new URL(paginaInicial(perfil?.role), request.url))
   }
+
+  // US-24a: com senha provisória, só a troca de senha.
+  if (perfil.trocar_senha && pathname !== '/trocar-senha') {
+    return NextResponse.redirect(new URL('/trocar-senha', request.url))
+  }
```

### `app/trocar-senha/page.tsx` (arquivo novo)

Fica fora de `(admin)`, como o login, para abrir sem o menu.

```tsx
'use client'

import { useState, useTransition } from 'react'
import { trocarSenha } from '@/actions/auth'

export default function TrocarSenhaPage() {
  const [erro, setErro] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function enviar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    setErro(null)
    startTransition(async () => {
      const r = await trocarSenha(fd)
      if (r?.error) setErro(r.error)
    })
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-bg">
      <form onSubmit={enviar} className="bg-paper border border-rule rounded-[16px] p-8 w-full max-w-[400px] flex flex-col gap-4 font-body">
        <h1 className="font-display text-[26px] text-ink m-0">Crie a sua senha</h1>
        <p className="text-sm text-muted m-0">Você entrou com uma senha provisória. Escolha uma senha sua, com pelo menos 8 caracteres.</p>
        <label className="text-[11px] text-muted tracking-[1px] uppercase">
          Nova senha
          <input name="nova" type="password" autoComplete="new-password" required minLength={8} className="input-base mt-1.5" />
        </label>
        <label className="text-[11px] text-muted tracking-[1px] uppercase">
          Repita a nova senha
          <input name="repetida" type="password" autoComplete="new-password" required minLength={8} className="input-base mt-1.5" />
        </label>
        {erro && <div role="alert" className="rounded-[10px] px-4 py-3 text-[13px]" style={{ backgroundColor: '#F8DCD2', color: '#D87560' }}>{erro}</div>}
        <button type="submit" disabled={isPending} className="bg-emerald text-white border-none py-3 rounded-[10px] text-sm font-medium disabled:opacity-50">
          {isPending ? 'Salvando...' : 'Salvar e entrar'}
        </button>
      </form>
    </main>
  )
}
```

## Parte G · Tela Equipe

### `components/equipe/equipe.tsx` (arquivo novo)

```tsx
'use client'

import { useState, useTransition } from 'react'
import { alterarPerfil, cadastrarUsuario, desativarUsuario, gerarSenhaProvisoria, reativarUsuario } from '@/actions/usuarios'
import type { UsuarioDaEquipe } from '@/types'

const PERFIS: { valor: UsuarioDaEquipe['role']; rotulo: string }[] = [
  { valor: 'admin', rotulo: 'Coordenação' },
  { valor: 'volunteer', rotulo: 'Voluntária' },
  { valor: 'cashier', rotulo: 'Caixa' },
]

const quando = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'short', timeStyle: 'short' }) : 'nunca entrou'

export function Equipe({ usuarios, meuId }: { usuarios: UsuarioDaEquipe[]; meuId: string | null }) {
  const [isPending, startTransition] = useTransition()
  const [erro, setErro] = useState<string | null>(null)
  const [senha, setSenha] = useState<{ nome: string; senha: string } | null>(null)

  function rodar(acao: () => Promise<{ error: string } | void | { senha: string } | { senha: string; nome: string }>, nome?: string) {
    setErro(null)
    startTransition(async () => {
      const r = await acao()
      if (r && 'error' in r) return setErro(r.error)
      if (r && 'senha' in r) setSenha({ nome: 'nome' in r ? r.nome : nome ?? '', senha: r.senha })
    })
  }

  function cadastrar(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const fd = new FormData(form)
    rodar(async () => {
      const r = await cadastrarUsuario(fd)
      if (!('error' in r)) form.reset()
      return r
    })
  }

  return (
    <div className="flex flex-col gap-6 font-body">
      {senha && (
        <div data-testid="senha-provisoria" role="status" className="rounded-[12px] px-5 py-4 border" style={{ backgroundColor: '#FBE3CA', borderColor: '#C97D3E' }}>
          <div className="text-sm text-ink">Senha provisória de <strong>{senha.nome}</strong>: <code className="text-base">{senha.senha}</code></div>
          <p className="text-xs text-muted m-0 mt-1">
            Mande por mensagem individual, nunca no grupo. Ela troca a senha no primeiro acesso. Esta senha não aparece de novo.
          </p>
          <button type="button" onClick={() => setSenha(null)} className="chip bg-bg mt-3">Já anotei</button>
        </div>
      )}

      <form onSubmit={cadastrar} className="bg-paper border border-rule rounded-[16px] p-6 grid gap-3 md:grid-cols-[1.4fr_1.4fr_1fr_auto] items-end">
        <label className="text-[11px] text-muted tracking-[1px] uppercase">Nome
          <input name="name" required className="input-base mt-1.5" />
        </label>
        <label className="text-[11px] text-muted tracking-[1px] uppercase">E-mail
          <input name="email" type="email" required className="input-base mt-1.5" />
        </label>
        <label className="text-[11px] text-muted tracking-[1px] uppercase">Perfil
          <select name="role" defaultValue="volunteer" className="input-base mt-1.5">
            {PERFIS.map((p) => <option key={p.valor} value={p.valor}>{p.rotulo}</option>)}
          </select>
        </label>
        <button type="submit" disabled={isPending} className="chip bg-emerald text-white border-emerald disabled:opacity-50">Cadastrar</button>
      </form>

      {erro && <div role="alert" className="rounded-[10px] px-4 py-3 text-[13px]" style={{ backgroundColor: '#F8DCD2', color: '#D87560' }}>{erro}</div>}

      <div className="bg-paper border border-rule rounded-[16px] overflow-x-auto">
        <table data-testid="equipe" className="w-full border-collapse text-[13px] min-w-[820px]">
          <thead>
            <tr className="bg-bg text-left text-[11px] text-muted uppercase tracking-[1px]">
              <th className="px-5 py-3 font-medium">Nome</th><th className="px-5 py-3 font-medium">E-mail</th>
              <th className="px-5 py-3 font-medium">Perfil</th><th className="px-5 py-3 font-medium">Último acesso</th><th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} data-testid="usuario" className={`border-t border-rule ${u.active ? '' : 'opacity-60'}`}>
                <td className="px-5 py-3 text-ink">
                  {u.name}
                  {!u.active && <span className="ml-2 text-xs text-muted">desativada</span>}
                  {u.active && u.trocar_senha && <span className="ml-2 text-xs text-muted">senha provisória</span>}
                </td>
                <td className="px-5 py-3 text-muted">{u.email}</td>
                <td className="px-5 py-3">
                  <select
                    aria-label={`Perfil de ${u.name}`}
                    value={u.role}
                    disabled={isPending || !u.active}
                    onChange={(e) => rodar(() => alterarPerfil(u.id, e.target.value))}
                    className="input-base py-1"
                  >
                    {PERFIS.map((p) => <option key={p.valor} value={p.valor}>{p.rotulo}</option>)}
                  </select>
                </td>
                <td className="px-5 py-3 text-muted">{quando(u.ultimo_acesso)}</td>
                <td className="px-5 py-3 text-right whitespace-nowrap">
                  <div className="flex justify-end gap-2">
                    {u.active ? (
                      <>
                        <button type="button" disabled={isPending} onClick={() => rodar(() => gerarSenhaProvisoria(u.id), u.name)} className="chip bg-bg">Nova senha</button>
                        {u.id !== meuId && (
                          <button type="button" disabled={isPending} onClick={() => rodar(() => desativarUsuario(u.id))} className="chip bg-bg">Desativar</button>
                        )}
                      </>
                    ) : (
                      <button type="button" disabled={isPending} onClick={() => rodar(() => reativarUsuario(u.id))} className="chip bg-bg">Reativar</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

### `app/(admin)/equipe/page.tsx` (arquivo novo)

```tsx
import { Equipe } from '@/components/equipe/equipe'
import { getEquipe, getMeuId } from '@/lib/store'

export const dynamic = 'force-dynamic'

// US-24a · Só a coordenação: /equipe está em SO_COORDENACAO, a função do banco
// só devolve a equipe para ela e cada action confere o perfil.
export default async function EquipePage() {
  const [usuarios, meuId] = await Promise.all([getEquipe(), getMeuId()])
  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1100px]">
      <header className="mb-8">
        <div className="text-xs text-muted font-body tracking-[2px] uppercase mb-2">Equipe</div>
        <h1 className="font-display text-[28px] md:text-[40px] text-ink font-semibold tracking-[-1px] m-0">Quem usa o sistema</h1>
        <p className="font-body text-muted text-sm mt-2 max-w-[620px]">
          Cadastre quem entra no balcão ou na coordenação, troque o perfil e desative quem saiu. O histórico de quem saiu continua no sistema.
        </p>
      </header>
      <Equipe usuarios={usuarios} meuId={meuId} />
    </div>
  )
}
```

### Rota e menu

`lib/rotas.ts`, no fim de `SO_COORDENACAO`: `  '/equipe', // US-24a`.

`components/layout/sidebar.tsx`: no import do `lucide-react`, acrescente `UserCog`; em `topNav`, depois de Relatórios: `  { href: '/equipe', label: 'Equipe', icon: UserCog },`. O `podeVer` já esconde do balcão o que está em `SO_COORDENACAO`.

## Parte H · Testes

### `tests/fumaca/gestao-de-usuarios.spec.ts` (arquivo novo)

```ts
// US-24a · Cadastrar, primeiro acesso com troca de senha e desativar.
import { test, expect } from '@playwright/test'
import { entrar } from './apoio'

test.describe.configure({ mode: 'serial' })

const sufixo = Date.now()
const nome = `TESTE US-24a ${sufixo}`
const email = `teste-${sufixo}@camaleao.local`
let senhaProvisoria = ''

test('a coordenação cadastra uma voluntária e vê a senha provisória uma vez', async ({ page }) => {
  await entrar(page)
  await page.goto('/equipe')
  await page.getByLabel('Nome').fill(nome)
  await page.getByLabel('E-mail').fill(email)
  await page.getByLabel('Perfil', { exact: true }).selectOption('volunteer')
  await page.getByRole('button', { name: 'Cadastrar' }).click()
  const aviso = page.getByTestId('senha-provisoria')
  await expect(aviso).toContainText(nome)
  senhaProvisoria = (await aviso.locator('code').textContent()) ?? ''
  expect(senhaProvisoria).toHaveLength(12)
  await expect(page.getByTestId('usuario').filter({ hasText: nome })).toContainText('senha provisória')
})

test('no primeiro acesso ela troca a senha e chega às doações de item', async ({ page }) => {
  await page.goto('/login')
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill(senhaProvisoria)
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL(/\/trocar-senha$/)
  await page.goto('/doacoes/itens')
  await expect(page, 'com senha provisória, nenhuma tela abre').toHaveURL(/\/trocar-senha$/)
  await page.getByLabel('Nova senha').fill('senha-nova-123')
  await page.getByLabel('Repita a nova senha').fill('senha-nova-123')
  await page.getByRole('button', { name: 'Salvar e entrar' }).click()
  await page.waitForURL(/\/doacoes\/itens/)
})

test('desativada, ela não entra mais', async ({ page }) => {
  await entrar(page)
  await page.goto('/equipe')
  await page.getByTestId('usuario').filter({ hasText: nome }).getByRole('button', { name: 'Desativar' }).click()
  await expect(page.getByTestId('usuario').filter({ hasText: nome })).toContainText('desativada')

  await page.context().clearCookies()
  await page.goto('/login')
  await page.locator('input[name="email"]').fill(email)
  await page.locator('input[name="password"]').fill('senha-nova-123')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByText('Seu acesso está desativado.')).toBeVisible()
})

test('a coordenação não vê o botão de desativar a própria conta', async ({ page }) => {
  await entrar(page)
  await page.goto('/equipe')
  const eu = page.getByTestId('usuario').filter({ hasText: 'voluntaria@camaleao.local' })
  await expect(eu.getByRole('button', { name: 'Desativar' })).toHaveCount(0)
})
```

O `getByLabel('Perfil', { exact: true })` acha o seletor do formulário; os da tabela se chamam "Perfil de ...".

### `tests/acesso/gestao-de-usuarios.spec.ts` (arquivo novo)

```ts
// US-24a · A equipe só é listada para a coordenação, e ninguém altera usuários pela API.
import { test, expect } from '@playwright/test'
import { CAIXA, COORDENACAO, VOLUNTARIA, entrarNaApi, recusado } from './apoio'

test('só a coordenação recebe a lista da equipe, com e-mail', async () => {
  const { api: coordenacao } = await entrarNaApi(COORDENACAO)
  const r = await coordenacao.rpc('usuarios_da_equipe')
  expect(r.error).toBeNull()
  expect((r.data ?? []).map((u: { email: string }) => u.email)).toContain(CAIXA)

  for (const email of [CAIXA, VOLUNTARIA]) {
    const { api } = await entrarNaApi(email)
    const b = await api.rpc('usuarios_da_equipe')
    expect(b.error).toBeNull()
    expect(b.data).toEqual([])
  }
})

test('nem a coordenação altera usuários pela API', async () => {
  const { api: coordenacao } = await entrarNaApi(COORDENACAO)
  const { api: caixa, id: caixaId } = await entrarNaApi(CAIXA)
  expect(recusado(await coordenacao.from('users').update({ role: 'admin' }).eq('id', caixaId).select())).toBe(true)
  expect(recusado(await caixa.from('users').update({ role: 'admin' }).eq('id', caixaId).select())).toBe(true)
})

test('confirmar a troca de senha só mexe na própria linha', async () => {
  const { api: caixa } = await entrarNaApi(CAIXA)
  expect((await caixa.rpc('confirmar_troca_de_senha')).error).toBeNull()
})
```

### Teste que já existe e muda

`tests/acesso/acesso.spec.ts`: se algum teste conferir a lista exata de itens do menu da coordenação, ela ganha "Equipe".

## Conferir

```bash
npm run db:reset
npm run env:local -- --force
grep CHAVE_SECRETA_DO_SUPABASE .env.local | cut -c1-30
npm run lint
npm run build
grep -rlE 'sb_secret_[A-Za-z0-9_-]{20,}' .next/static || echo "nenhuma chave secreta em .next/static"
npm run test:fumaca
npm run test:acesso
```

O segundo `grep` precisa terminar em "nenhuma chave secreta em .next/static", como na esteira.

## Pull Request

Título: `US-24a · Gestão de usuários pela coordenação`. No corpo: os critérios e a mudança do convite para senha provisória (com o porquê). A Alissa revisa rodando os testes e cadastrando, entrando, trocando a senha e desativando uma conta de teste, e escreve no PR o que testou.

**Integração, quarta 11/11, à noite:**

1. O Mateus confirma que `CHAVE_SECRETA_DO_SUPABASE` está em Production na Vercel (e não em Preview).
2. `migration list --remote` (só a `20261110110000` pendente), `db push --remote`, `migration list --remote`.
3. Merge e deploy. Conferência com a conta de conferência da coordenação: Equipe lista as contas de conferência com e-mail; cadastrar "CONFERÊNCIA US-24a" com um e-mail da equipe, entrar com a senha provisória numa janela anônima, trocar a senha, voltar e **desativar** a conta. Não use e-mail de ninguém do Instituto.
4. Registrar no `PROGRESSO.md` (sem e-mail e sem senha).
5. No cartão "Início do uso pelo Instituto", trocar o passo das contas reais: agora é pela tela Equipe, com a senha provisória.

## Fora desta story

- Convite por e-mail: depende de um e-mail próprio do Instituto configurado no Supabase (pergunta 16).
- Backup diário: US-24b.
- Apagar conta: não se apaga; desativar mantém o histórico de quem registrou cada venda e doação.
