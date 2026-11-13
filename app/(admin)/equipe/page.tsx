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