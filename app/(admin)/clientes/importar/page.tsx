import { ImportarPessoas } from '@/components/clients/importar-pessoas'

export const dynamic = 'force-dynamic'

// US-09 · Só a coordenação: /clientes/importar está em SO_COORDENACAO, e as actions conferem o perfil.
export default function ImportarPage() {
  return (
    <div className="px-4 py-6 md:px-14 md:py-10 max-w-[1100px]">
      <header className="mb-8">
        <div className="text-xs text-muted font-body tracking-[2px] uppercase mb-2">Clientes · Importar planilha</div>
        <h1 className="font-display text-[28px] md:text-[40px] text-ink font-semibold tracking-[-1px] m-0">Importar pessoas de uma planilha</h1>
        <p className="font-body text-muted text-sm mt-2 max-w-[640px]">
          Traz nomes e contatos da planilha do brechó para fichas novas. Nada é gravado antes da sua conferência. Quem for importado ainda não autorizou mensagens do Instituto.
        </p>
      </header>
      <ImportarPessoas />
    </div>
  )
}
