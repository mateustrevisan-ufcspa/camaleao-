export interface Customer {
  id: string
  supporter_id: string | null
  name: string
  phone: string
  tags: string[]
  birthday: string
  member_since: number
  purchase_count: number
  total_spent: number
  last_purchase_at: string
  created_at?: string
}

export interface Sale {
  id: string
  time: string
  customer_id: string | null
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
  donated_at: string
  donor_name: string
  donor_phone: string
  quantity: number | null
  weight_kg: number | null
  notes?: string
  created_at: string
}
