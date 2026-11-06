'use client'

// US-16 · A impressão do navegador já oferece "Salvar como PDF".
export function BotaoImprimir() {
  return (
    <button type="button" onClick={() => window.print()} className="btn-dark print:hidden">
      Imprimir ou salvar em PDF
    </button>
  )
}
