// US-37 · Para onde voltar depois de corrigir uma doação em dinheiro: a lista de
// doações ou o dia aberto em Brechó · Corrigir lançamento. Só esses dois endereços
// são aceitos, para o campo "voltar" (que vem da URL) não virar redirecionamento
// para fora do sistema.
const VOLTAS = /^\/(doacoes\/dinheiro|brecho\/corrigir(\?dia=\d{4}-\d{2}-\d{2})?)$/

export const VOLTAR_PADRAO = '/doacoes/dinheiro'

export function voltarSeguro(valor: string | null | undefined): string {
  const v = String(valor ?? '')
  return VOLTAS.test(v) ? v : VOLTAR_PADRAO
}
