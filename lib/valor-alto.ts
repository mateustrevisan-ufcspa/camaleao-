// US-34 · Doação em dinheiro acima deste valor pede confirmação antes de registrar.
// Proposta de 30/10 (R$ 1.000), a confirmar com a coordenação.
export const LIMITE_DO_VALOR_ALTO = 1000

export function pedeConfirmacao(valor: number): boolean {
  return valor > LIMITE_DO_VALOR_ALTO
}

export const AVISO_VALOR_ALTO = 'Confirme o valor da doação antes de registrar.'