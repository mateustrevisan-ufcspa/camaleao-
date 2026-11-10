// SEC-04 · Nome de cada tabela da trilha de auditoria, como a tela mostra.
// Fica fora de lib/store.ts para a página e a leitura usarem a mesma lista.
export const TABELAS_DA_TRILHA: Record<string, string> = {
  donations_items: 'Doação de item',
  donations_cash: 'Doação em dinheiro',
  sales: 'Venda',
  clients: 'Ficha',
  events: 'Evento',
  campaigns: 'Campanha',
  item_categories: 'Categoria de item',
}

export const tabelaDaTrilha = (t: string | null | undefined): string | null =>
  t && Object.hasOwn(TABELAS_DA_TRILHA, t) ? t : null
