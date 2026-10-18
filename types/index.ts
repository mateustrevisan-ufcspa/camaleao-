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
  created_at: string
}

export interface DonationItem {
  id: string
  client_id?: string | null
  donated_at: string
  donor_name: string
  donor_phone: string
  category_name: string
  quantity: number
  condition: 'good' | 'needs_review'
  destination: 'stock' | 'direct'
  notes?: string
  created_at: string
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

// Decisão mais recente da pessoa sobre receber mensagens do Instituto (US-07).
export interface MessageConsent {
  authorized: boolean
  term_version: string
  recorded_at: string
}
