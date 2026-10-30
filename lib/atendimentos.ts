// US-19 · Contribuição convertida em atendimentos.
// O valor de um atendimento fica no banco (tabela valor_do_atendimento), e a
// coordenação altera pela tela Relatórios · Valor do atendimento.

// Valor informado pela coordenação em 03/09/2026. Só é usado se a tabela estiver vazia.
export const VALOR_INICIAL_DO_ATENDIMENTO = 50

// Quantos atendimentos um valor ajuda a custear, com uma casa decimal.
export function atendimentos(valor: number, valorDoAtendimento: number): number {
  if (!(valorDoAtendimento > 0) || !(valor > 0)) return 0
  return Math.round((valor / valorDoAtendimento) * 10) / 10
}

// "0,6 atendimento", "1 atendimento", "1,5 atendimento", "2 atendimentos".
// Em português o plural começa no 2, e o zero vai no plural.
export function textoDeAtendimentos(n: number): string {
  const numero = n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
  return `${numero} ${n === 0 || n >= 2 ? 'atendimentos' : 'atendimento'}`
}
