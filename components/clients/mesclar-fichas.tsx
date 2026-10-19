'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeftRight, GitMerge, Undo2 } from 'lucide-react'
import { ClientPicker } from '@/components/clients/client-picker'
import { desfazerMesclagem, mesclarFichas } from '@/actions/mesclagem'
import { formatBRL } from '@/lib/utils'
import type { Client, Mesclagem, MessageConsent, PessoaEncontrada } from '@/types'

interface DbTag { id: string; name: string; color: string; bg_color: string }

interface MesclarFichasProps {
  fica: Client | null
  sai: Client | null
  autorizacaoFica: MessageConsent | null
  autorizacaoSai: MessageConsent | null
  mesclagens: Mesclagem[]
  tags: DbTag[]
}

const DIA_MS = 24 * 60 * 60 * 1000

const vazio = (v?: string | null) => !v || v.trim() === ''
const valor = (v?: string | null) => (vazio(v) ? '' : (v as string))
const dataCurta = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })

// A ficha já escolhida, no formato que o ClientPicker mostra.
function comoPessoa(c: Client): PessoaEncontrada {
  return {
    id: c.id,
    name: c.name,
    nickname: c.nickname ?? '',
    phone_final: (c.phone ?? '').replace(/\D/g, '').slice(-4),
    tags: c.tags,
    ja_comprou: c.purchase_count > 0,
    ja_doou: c.donation_count > 0,
  }
}

function textoDaAutorizacao(a: MessageConsent | null) {
  if (!a) return 'não foi perguntada'
  return a.authorized ? 'autorizou' : 'retirou a autorização'
}

// Depois da mesclagem vale a decisão mais recente das duas fichas.
function autorizacaoDepois(a: MessageConsent | null, b: MessageConsent | null) {
  if (!a) return b
  if (!b) return a
  return new Date(a.recorded_at) >= new Date(b.recorded_at) ? a : b
}

// Mesma regra da função mesclar_fichas no banco: campo vazio na ficha que fica
// recebe o valor da que sai; o que já está preenchido não muda.
function linhasDaPrevia(fica: Client, sai: Client, aFica: MessageConsent | null, aSai: MessageConsent | null) {
  const campo = (a?: string | null, b?: string | null) => (vazio(a) ? valor(b) : valor(a))
  const anos = [fica.member_since, sai.member_since].filter((n) => Number.isFinite(n) && n > 0)
  const compras = (c: Client) => `${c.purchase_count} · R$ ${formatBRL(Number(c.total_spent))}`
  return [
    { rotulo: 'Nome', fica: fica.name, sai: sai.name, depois: fica.name },
    { rotulo: 'Apelido', fica: valor(fica.nickname), sai: valor(sai.nickname), depois: campo(fica.nickname, sai.nickname) },
    { rotulo: 'Telefone', fica: valor(fica.phone), sai: valor(sai.phone), depois: campo(fica.phone, sai.phone) },
    { rotulo: 'E-mail', fica: valor(fica.email), sai: valor(sai.email), depois: campo(fica.email, sai.email) },
    { rotulo: 'Aniversário', fica: valor(fica.birthday), sai: valor(sai.birthday), depois: campo(fica.birthday, sai.birthday) },
    {
      rotulo: 'Desde',
      fica: fica.member_since ? String(fica.member_since) : '',
      sai: sai.member_since ? String(sai.member_since) : '',
      depois: anos.length > 0 ? String(Math.min(...anos)) : '',
    },
    {
      rotulo: 'Etiquetas',
      fica: fica.tags.join(', '),
      sai: sai.tags.join(', '),
      depois: Array.from(new Set([...fica.tags, ...sai.tags])).join(', '),
    },
    {
      rotulo: 'Compras',
      fica: compras(fica),
      sai: compras(sai),
      depois: `${fica.purchase_count + sai.purchase_count} · R$ ${formatBRL(Number(fica.total_spent) + Number(sai.total_spent))}`,
    },
    { rotulo: 'Doações', fica: String(fica.donation_count), sai: String(sai.donation_count), depois: String(fica.donation_count + sai.donation_count) },
    {
      rotulo: 'Mensagens',
      fica: textoDaAutorizacao(aFica),
      sai: textoDaAutorizacao(aSai),
      depois: textoDaAutorizacao(autorizacaoDepois(aFica, aSai)),
    },
  ]
}

export function MesclarFichas({ fica, sai, autorizacaoFica, autorizacaoSai, mesclagens, tags }: MesclarFichasProps) {
  const router = useRouter()
  const [conferido, setConferido] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function ir(ficaId?: string, saiId?: string) {
    const p = new URLSearchParams()
    if (ficaId) p.set('manter', ficaId)
    if (saiId) p.set('juntar', saiId)
    const q = p.toString()
    setConferido(false)
    router.push(q ? `/clientes/mesclar?${q}` : '/clientes/mesclar')
  }

  function mesclar() {
    if (!fica || !sai) return
    setErro(null)
    startTransition(async () => {
      const res = await mesclarFichas(fica.id, sai.id)
      if ('error' in res) {
        setErro(res.error)
        return
      }
      setAviso(`${sai.name} foi juntada a ${fica.name}. Se foi engano, desfaça na lista abaixo em até 30 dias.`)
      ir()
    })
  }

  function desfazer(id: string) {
    setErro(null)
    startTransition(async () => {
      const res = await desfazerMesclagem(id)
      if ('error' in res) {
        setErro(res.error)
        return
      }
      setAviso('Mesclagem desfeita: as duas fichas voltaram como eram.')
      router.refresh()
    })
  }

  const mesmaFicha = !!fica && !!sai && fica.id === sai.id
  const linhas = fica && sai && !mesmaFicha ? linhasDaPrevia(fica, sai, autorizacaoFica, autorizacaoSai) : []

  return (
    <div className="flex flex-col gap-6">
      {aviso && (
        <div className="rounded-[10px] px-4 py-3 font-body text-[13px]" style={{ backgroundColor: '#DCEBE0', color: '#2E5C3E' }}>
          {aviso}
        </div>
      )}
      {erro && (
        <div className="rounded-[10px] px-4 py-3 font-body text-[13px]" style={{ backgroundColor: '#F8DCD2', color: '#D87560' }}>
          {erro}
        </div>
      )}

      <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
        <div className="bg-paper border border-rule rounded-[16px] p-6">
          <div className="text-[11px] font-body text-muted tracking-[1px] uppercase mb-3">Ficha que fica</div>
          <ClientPicker
            tags={tags}
            allowAnonymous={false}
            selected={fica ? comoPessoa(fica) : null}
            onSelect={(p) => ir(p?.id, sai?.id)}
          />
        </div>
        <div className="bg-paper border border-rule rounded-[16px] p-6">
          <div className="text-[11px] font-body text-muted tracking-[1px] uppercase mb-3">Ficha que sai</div>
          <ClientPicker
            tags={tags}
            allowAnonymous={false}
            selected={sai ? comoPessoa(sai) : null}
            onSelect={(p) => ir(fica?.id, p?.id)}
          />
        </div>
      </div>

      {mesmaFicha && (
        <p className="font-body text-sm text-muted m-0">Escolha duas fichas diferentes.</p>
      )}

      {fica && sai && linhas.length > 0 && (
        <div className="bg-paper border border-rule rounded-[16px] overflow-hidden">
          <div className="px-6 py-5 border-b border-rule flex flex-wrap justify-between items-start gap-3">
            <div className="max-w-[640px]">
              <h3 className="font-display text-xl text-ink font-medium m-0">O que vai acontecer</h3>
              <p className="font-body text-[13px] text-muted mt-1 mb-0">
                A ficha que sai é apagada. Compras, doações, etiquetas e autorização de mensagens passam para a que fica.
                Campo vazio na que fica recebe o valor da outra.
              </p>
            </div>
            <button type="button" onClick={() => ir(sai.id, fica.id)} className="chip bg-bg">
              <ArrowLeftRight size={11} /> Inverter: manter a outra
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse font-body min-w-[640px]">
              <thead>
                <tr className="bg-bg">
                  {['', 'Fica', 'Sai', 'Depois da mesclagem'].map((h) => (
                    <th key={h} className="text-left px-6 py-3.5 text-[11px] text-muted tracking-[1.5px] uppercase font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {linhas.map((l) => (
                  <tr key={l.rotulo} className="border-t border-rule">
                    <td className="px-6 py-3 text-[11px] text-muted tracking-[1px] uppercase">{l.rotulo}</td>
                    <td className="px-6 py-3 text-sm text-ink">{l.fica}</td>
                    <td className="px-6 py-3 text-sm text-muted">{l.sai}</td>
                    <td className="px-6 py-3 text-sm text-ink font-medium">{l.depois}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-5 border-t border-rule flex flex-wrap items-center justify-between gap-4">
            <label className="flex items-center gap-2 font-body text-sm text-ink cursor-pointer">
              <input type="checkbox" checked={conferido} onChange={(e) => setConferido(e.target.checked)} />
              Conferi: as duas fichas são da mesma pessoa.
            </label>
            <button
              type="button"
              onClick={mesclar}
              disabled={!conferido || isPending}
              className="btn-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <GitMerge size={14} /> {isPending ? 'Mesclando...' : 'Mesclar fichas'}
            </button>
          </div>
        </div>
      )}

      <div className="bg-paper border border-rule rounded-[16px] overflow-hidden">
        <div className="px-6 py-5 border-b border-rule">
          <h3 className="font-display text-xl text-ink font-medium m-0">Mesclagens dos últimos 30 dias</h3>
        </div>
        {mesclagens.length === 0 ? (
          <p className="px-6 py-6 font-body text-sm text-muted italic m-0">Nenhuma mesclagem nos últimos 30 dias.</p>
        ) : (
          <ul data-testid="mesclagens-recentes" className="m-0 p-0 list-none">
            {mesclagens.map((m) => (
              <li key={m.id} className="px-6 py-4 border-b border-rule last:border-0 flex flex-wrap justify-between items-center gap-3">
                <div>
                  <div className="font-body text-sm text-ink">{m.removida} foi juntada a {m.mantida}</div>
                  <div className="font-mono text-[11px] text-muted mt-0.5">
                    {dataCurta(m.merged_at)}
                    {m.undone_at
                      ? ` · desfeita em ${dataCurta(m.undone_at)}`
                      : ` · dá para desfazer até ${dataCurta(new Date(new Date(m.merged_at).getTime() + 30 * DIA_MS).toISOString())}`}
                  </div>
                </div>
                {!m.undone_at && (
                  <button type="button" onClick={() => desfazer(m.id)} disabled={isPending} className="chip bg-bg">
                    <Undo2 size={11} /> Desfazer
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
