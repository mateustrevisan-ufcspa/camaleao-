// US-16 · Dados do Instituto que vão no recibo. Preencher com o que a coordenação
// mandar (pedido de 03/11). Campo null não aparece no recibo.
export const INSTITUTO = {
  nome: 'Instituto Camaleão',
  cnpj: null as string | null,
  endereco: null as string | null,
  // Nome e função de quem assina, se o Instituto quiser assinatura no recibo.
  assinatura: null as string | null,
}
