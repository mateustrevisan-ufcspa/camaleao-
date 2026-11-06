import Link from 'next/link'
import { TaxasDeCartao } from '@/components/reports/taxas-de-cartao'
import { getBanks, getHistoricoDasTaxas, getTaxasEmVigor } from '@/lib/store'

export const dynamic = 'force-dynamic'

// US-32 · Só a coordenação abre (o prefixo /relatorios está em SO_COORDENACAO),
// e o banco só aceita taxa nova da coordenação.
export default async function TaxasPage() {
  const [bancos, vigentes, historico] = await Promise.all([getBanks(), getTaxasEmVigor(), getHistoricoDasTaxas()])

  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1000px]">
      <header className="mb-9">
        <div className="text-xs text-muted font-body tracking-[2px] uppercase mb-2">
          <Link href="/relatorios" className="text-muted no-underline hover:text-ink">Relatórios</Link> · Taxas das maquininhas
        </div>
        <h1 className="font-display text-[28px] md:text-[40px] text-ink font-semibold tracking-[-1px] m-0 leading-[1.1]">
          Taxas das maquininhas
        </h1>
        <p className="font-body text-muted text-sm mt-2 max-w-[640px]">
          O sistema usa estas taxas para calcular o valor líquido de cada venda. O crédito parcelado tem uma taxa só, para qualquer número de parcelas.
        </p>
      </header>
      <TaxasDeCartao bancos={bancos.filter((b) => b.type !== 'cash')} vigentes={vigentes} historico={historico} />
    </div>
  )
}
