// Telas que só a coordenação abre. O proxy usa esta lista para mandar o balcão de
// volta ao brechó, e o menu, para esconder o item. Quem protege os dados é o banco
// (RLS); isto só evita que alguém do balcão caia numa tela vazia.
//
// As quatro últimas chegam na Sprint 4 e entram aqui antes, no planejamento, para
// as stories não disputarem a mesma linha. Rota que ainda não tem tela continua
// dando 404 para todo mundo.
export const SO_COORDENACAO = [
  '/relatorios',
  '/brecho/financeiro',
  '/clientes/repetidos', // US-08a
  '/clientes/aniversariantes', // US-22
  '/clientes/mesclar', // US-08b
  '/clientes/recorrentes', // US-20
  '/doacoes/categorias', // US-11
  '/doacoes/sem-ficha', // US-14
  '/doacoes/eventos', // US-12
  '/doacoes/campanhas', // US-13
]
