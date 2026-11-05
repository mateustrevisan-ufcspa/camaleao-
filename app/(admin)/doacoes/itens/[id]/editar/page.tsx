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
