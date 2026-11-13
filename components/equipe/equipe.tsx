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