import Link from 'next/link'
import { getBanks, getDoacaoEmDinheiro, getTaxasEmVigor } from '@/lib/store'
import { dataDeBrasilia } from '@/lib/utils'
import { voltarSeguro } from '@/lib/voltar'
import { CorrigirDoacao } from '@/components/donations/corrigir-doacao'

export const dynamic = 'force-dynamic'

// US-04b e US-37 · Caixa e coordenação: /doacoes/corrigir está em SO_CAIXA_OU_COORDENACAO, e as funções do banco conferem de novo.
export default async function CorrigirDoacaoPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ voltar?: string }> }) {
  const { id } = await params
  const voltar = voltarSeguro((await searchParams).voltar)
  const [doacao, bancos, taxas] = await Promise.all([getDoacaoEmDinheiro(id).catch(() => null), getBanks('doacoes'), getTaxasEmVigor()])
  if (!doacao) {
    return (
      <div className="px-4 py-6 md:px-14 md:py-10 max-w-[800px]">
        <h1 className="font-display text-[28px] text-ink font-semibold m-0">Doação não encontrada</h1>
        <p className="font-body text-sm text-muted mt-3">Ela pode ter sido cancelada.</p>
        <Link href={voltar} className="chip bg-bg no-underline mt-4 inline-flex">Voltar</Link>
      </div>
    )
  }
  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[900px]">
      <div className="text-xs text-muted font-body tracking-[2px] uppercase mb-2">
        <Link href={voltar} className="text-muted no-underline hover:text-ink">Voltar</Link> · Corrigir
      </div>
      <h1 className="font-display text-[28px] md:text-[36px] text-ink font-semibold tracking-[-1px] m-0 mb-6">Corrigir a doação de {doacao.donor_name}</h1>
      <CorrigirDoacao doacao={doacao} dataInicial={dataDeBrasilia(doacao.donated_at)} bancos={bancos} taxas={taxas} voltar={voltar} />
    </div>
  )
}
