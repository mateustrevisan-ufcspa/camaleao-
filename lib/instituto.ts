// US-16 e US-40 · Dados do Instituto que vão no recibo (resposta 12 da Flávia, 06/11).
// Campo null não aparece no recibo.
export const INSTITUTO = {
  // Nome de uso, no texto do recibo e no rodapé.
  nome: 'Instituto Camaleão',
  // Como está no CNPJ, no cabeçalho.
  razaoSocial: 'INSTITUTO CAMALEÃO',
  cnpj: '25.535.215/0001-38' as string | null,
  // Não informado pelo Instituto até 15/11.
  endereco: null as string | null,
  logo: '/logo-camaleao.png',
  assinatura: {
    nome: 'Flávia Maoli Magalhães de Oliveira',
    cargo: 'Presidente',
  } as { nome: string; cargo: string } | null,
}
