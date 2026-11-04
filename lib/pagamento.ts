// US-29 · Rótulo da forma de pagamento, para telas do navegador e do servidor.
// A venda guarda o nome interno (payment_methods.name).
const ROTULO_DA_FORMA: Record<string, string> = {
  pix: 'Pix',
  credit: 'Crédito',
  debit: 'Débito',
  cash: 'Dinheiro',
}

export function rotuloDaForma(forma: string): string {
  return ROTULO_DA_FORMA[forma] ?? forma
}

// "Crédito", "Crédito em 3x", "Débito", "Pix", "Dinheiro". Uma parcela é crédito à vista.
export function textoDoPagamento(venda: { payment_method: string; installments?: number | null }): string {
  const forma = rotuloDaForma(venda.payment_method)
  const parcelas = venda.installments ?? 1
  return venda.payment_method === 'credit' && parcelas > 1 ? `${forma} em ${parcelas}x` : forma
}
