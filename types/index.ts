export interface Client {
  id: string
  name: string
  // Inteiro para a coordenação; "(••) •••••-1234" para o balcão (SEC-05).
  phone: string
  // true quando phone veio mascarado: não pode ser gravado de volta.
  phone_masked: boolean
  email?: string
  tags: string[]
  birthday: string
  member_since: number
  purchase_count: number
  total_spent: number
  last_purchase_at: string
  donation_count: number
  donation_total: number
  last_donation_at: string | null
  created_at?: string
  nickname?: string
}

// Uma linha do resultado da busca (US-06). Só o que a lista mostra: o telefone
// vem reduzido aos quatro últimos dígitos e o histórico, a "sim ou não".
export interface PessoaEncontrada {
  id: string
  name: string
  nickname: string
  phone_final: string
  tags: string[]
  ja_comprou: boolean
  ja_doou: boolean
}

// Doação registrada sem ficha (US-14), à espera de ser ligada a uma pessoa.
export interface DoacaoSemFicha {
  id: string
  tipo: 'dinheiro' | 'itens'
  data: string
  nome: string
  descricao: string
}

// Um par de fichas que parecem ser da mesma pessoa (US-08a). O telefone vem
// reduzido aos quatro últimos dígitos.
export interface ParRepetido {
  id_a: string
  nome_a: string
  apelido_a: string
  telefone_final_a: string
  criada_a: string
  id_b: string
  nome_b: string
  apelido_b: string
  telefone_final_b: string
  criada_b: string
  motivo: 'nome parecido' | 'telefone igual' | 'nome parecido e telefone igual'
  semelhanca: number
}

// Pessoa que doa todo mês (US-20): tem ao menos uma doação em dinheiro mensal.
export interface DoadorRecorrente {
  id: string
  name: string
  // Valor da doação mensal mais recente.
  valorMensal: number
  ultimaDoacao: string
  diasSemDoar: number
  // Mais de 45 dias sem nenhuma doação em dinheiro.
  interrompido: boolean
}

export interface Sale {
  id: string
  time: string
  client_id: string | null
  customer_name: string
  category: string
  amount: number
  payment_method: string
  bank?: string
  installments?: number
  net_amount?: number
  confirmed: boolean
  sold_at: string
  created_at: string
}

export interface SaleItem {
  category: string
  amount: number
}

// Atalho da nova venda (US-05): uma combinação de categoria e valor que se repete.
export interface AtalhoDaVenda {
  categoria: string
  valor: number
  vezes: number
}

// Aniversariante do mês (US-22). O telefone vem inteiro: a tela é só da coordenação.
export interface Aniversariante {
  id: string
  name: string
  dia: number
  phone: string
  email: string
  // Está na lista de envio da US-07 (message_recipients): autorizou e não retirou.
  autorizou: boolean
}

export interface DonationCash {
  id: string
  client_id?: string | null
  donated_at: string
  donor_name: string
  donor_phone: string
  amount: number
  origin: string
  frequency: 'monthly' | 'one_time'
  notes?: string
  event_id?: string | null
  event_name?: string
  campaign_id?: string | null
  campaign_name?: string
  created_at: string
}

// Evento do Instituto (US-12): festa, jantar, com ingresso registrado como doação.
export interface Evento {
  id: string
  name: string
  event_date: string
  active: boolean
}

export interface EventoComTotal extends Evento {
  donation_count: number
  total: number
}

// Campanha do Instituto (US-13): Adapta, Natalenço, com custo estimado.
export interface Campanha {
  id: string
  name: string
  starts_on: string
  ends_on: string | null
  estimated_cost: number
  // Preenchido quando a campanha é encerrada; o histórico continua acessível.
  closed_at: string | null
}

export interface CampanhaComTotal extends Campanha {
  donation_count: number
  raised: number
  // Arrecadado menos o custo estimado: negativo quando ainda não cobriu o custo.
  difference: number
}

export interface DonationItem {
  id: string
  client_id?: string | null
  donated_at: string
  donor_name: string
  donor_phone: string
  category_name: string
  quantity: number | null
  weight_kg: number | null
  condition: 'good' | 'needs_review' | null
  destination: 'stock' | 'direct' | null
  notes?: string
  created_at: string
}

// Categoria de item, editável pela coordenação (US-11).
export interface CategoriaDeItem {
  id: string
  name: string
  type: 'sale' | 'donation' | 'both'
  active: boolean
}

export interface DonationCaps {
  id: string
  client_id?: string | null
  donated_at: string
  donor_name: string
  donor_phone: string
  quantity: number | null
  weight_kg: number | null
  notes?: string
  created_at: string
}

// Histórico unificado na ficha (US-10).
export type TipoDeContribuicao = 'venda' | 'dinheiro' | 'itens' | 'tampinhas'

// Uma linha do histórico: compra ou doação, já no formato da lista.
export interface ItemDoHistorico {
  id: string
  tipo: TipoDeContribuicao
  data: string
  descricao: string
  // Em reais para compra e doação em dinheiro; null para itens e tampinhas.
  valor: number | null
}

// O registro como foi gravado, para o painel "Registro original".
export interface RegistroOriginal {
  tipo: TipoDeContribuicao
  titulo: string
  campos: { rotulo: string; valor: string }[]
}

// Relatório consolidado do Instituto num período (US-17).
export interface RelatorioConsolidado {
  inicio: string
  fim: string
  vendas: { quantidade: number; valor: number }
  // Todas as doações em dinheiro: as avulsas, os ingressos de evento e as de campanha.
  doacoes: { quantidade: number; valor: number }
  // A parte das doações em dinheiro que veio de ingresso de evento (US-12).
  eventos: { nome: string; valor: number }[]
  total: number
  itens: { categoria: string; doacoes: number; quantidade: number; peso: number }[]
  // As pessoas com ficha que mais contribuíram no período (compras e doações em dinheiro).
  ranking: { id: string; nome: string; compras: number; doacoes: number; total: number }[]
}

// Decisão mais recente da pessoa sobre receber mensagens do Instituto (US-07).
export interface MessageConsent {
  authorized: boolean
  term_version: string
  recorded_at: string
}

// Mesclagem de fichas (US-08b): uma linha da lista dos últimos 30 dias.
export interface Mesclagem {
  id: string
  mantida: string
  removida: string
  merged_at: string
  undone_at: string | null
}

// Contribuição da pessoa num período (US-15): o que entra no agradecimento do total.
export interface ContribuicaoNoPeriodo {
  inicio: string
  fim: string
  compras: { quantidade: number; valor: number }
  // Todas as doações em dinheiro: as avulsas, os ingressos de evento e as de campanha.
  doacoes: { quantidade: number; valor: number }
  // A parte das doações em dinheiro que veio de ingresso de evento (US-12).
  eventos: { nome: string; valor: number }[]
  // A parte das doações em dinheiro que foi para cada campanha (US-13).
  campanhas: { nome: string; valor: number }[]
  itens: { data: string; categoria: string; quantidade: number | null; peso: number | null }[]
  total: number
}
