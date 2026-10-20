import { CategoriasDeItem } from '@/components/donations/categorias-de-item'
import { getAllItemCategories } from '@/lib/store'

export const dynamic = 'force-dynamic'

export default async function CategoriasPage() {
  const categorias = await getAllItemCategories()

  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1000px]">
      <header className="mb-9">
        <div className="text-xs text-muted font-body tracking-[2px] uppercase mb-2">Doações · Categorias</div>
        <h1 className="font-display text-[28px] md:text-[40px] text-ink font-semibold tracking-[-1px] m-0 leading-[1.1]">
          Categorias de item
        </h1>
        <p className="font-body text-muted text-sm mt-2 max-w-[560px]">
          As categorias que aparecem na doação de item e na venda. Só a coordenação altera.
        </p>
      </header>
      <CategoriasDeItem categorias={categorias} />
    </div>
  )
}