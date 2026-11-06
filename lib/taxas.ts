// US-32 · Taxas das maquininhas. Regras sem banco, para o servidor e o navegador.

export type FormaComTaxa = 'pix' | 'debit' | 'credit'
export type Bandeira = 'visa_master' | 'outras'

// "Outros cartões" do débito, com os exemplos que a Nílian deu em 03/11.
export const BANDEIRAS: { valor: Bandeira; rotulo: string }[] = [
  { valor: 'visa_master', rotulo: 'Visa ou Master' },
  { valor: 'outras', rotulo: 'Outras (Elo, Banri, BaneseCard, Cabal, Afinz...)' },
]

// Maquininhas em que a taxa do débito depende da bandeira (Nílian, 30/10).
export const BANCOS_COM_BANDEIRA_NO_DEBITO = ['PagBank']

export function pedeBandeira(banco: string | null | undefined, forma: string): boolean {
  return forma === 'debit' && !!banco && BANCOS_COM_BANDEIRA_NO_DEBITO.includes(banco)
}

// Líquido da venda: dinheiro não tem taxa; sem taxa cadastrada, null
// (o financeiro mostra "taxa não cadastrada").
export function valorLiquido(bruto: number, forma: string, taxa: number | null): number | null {
  if (forma === 'cash') return bruto
  if (taxa === null) return null
  return Math.round(bruto * (1 - taxa / 100) * 100) / 100
}

export function rotuloDaCombinacao(t: { forma: string; parcelado: boolean; bandeira: string | null }): string {
  if (t.forma === 'pix') return 'Pix'
  if (t.forma === 'debit') {
    const bandeira = BANDEIRAS.find((b) => b.valor === t.bandeira)?.rotulo
    return bandeira ? `Débito, ${bandeira}` : 'Débito'
  }
  return t.parcelado ? 'Crédito parcelado' : 'Crédito à vista'
}

// "1,88%"
export const textoDaTaxa = (taxa: number) =>
  `${taxa.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`
