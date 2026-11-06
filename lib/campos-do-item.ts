import { parseMoney, brTodayStr, dateInputToISO } from '@/lib/utils'
import { lerContagens, type Contagens } from '@/lib/triagem'

// US-04a · Campos do item no formulário de doação, lidos e validados do mesmo
// jeito no registro e na edição. US-27: estado e destino dão lugar às contagens
// da triagem.

export const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export interface CamposDoItem {
  category_id: string
  quantity: number | null
  weight_kg: number | null
  // US-27: null quando a triagem ainda não foi feita.
  contagens: Contagens | null
  notes: string | null
  donated_at: string
}

export function lerCamposDoItem(formData: FormData): { erro: string } | { campos: CamposDoItem } {
  // BUG-01: data depois de hoje (em Brasília) não entra. As duas no formato AAAA-MM-DD.
  const data = ((formData.get('donated_at') as string) || '').trim()
  if (data !== '' && data > brTodayStr()) return { erro: 'A data da doação não pode ser depois de hoje.' }

  const categoryId = ((formData.get('category_id') as string) || '').trim()
  const qRaw = ((formData.get('quantity') as string) || '').trim()
  const wRaw = ((formData.get('weight_kg') as string) || '').trim()
  const quantity = qRaw ? parseInt(qRaw, 10) : null
  const weight_kg = wRaw ? parseMoney(wRaw) : null
  const lidas = lerContagens(formData)
  if ('erro' in lidas) return { erro: lidas.erro }

  if (!UUID.test(categoryId)) return { erro: 'Escolha a categoria do item.' }
  // Quantidade e peso são opcionais (US-11); se vierem, precisam fazer sentido.
  if (quantity !== null && (!Number.isFinite(quantity) || quantity <= 0)) {
    return { erro: 'A quantidade, se informada, precisa ser maior que zero.' }
  }
  if (weight_kg !== null && (!Number.isFinite(weight_kg) || weight_kg <= 0)) {
    return { erro: 'O peso, se informado, precisa ser maior que zero.' }
  }

  return {
    campos: {
      category_id: categoryId,
      quantity,
      weight_kg,
      contagens: lidas.contagens,
      notes: ((formData.get('notes') as string) || '').trim() || null,
      donated_at: dateInputToISO(data),
    },
  }
}

// US-27 · Com triagem: valem as contagens, sem quantidade. Sem triagem (tampinha):
// vale a quantidade, sem contagens. Peso não entra mais em doação nova (Tamara,
// 03/11); as doações antigas guardam o peso que têm.
export function camposPelaCategoria(campos: CamposDoItem, categoria: string, semTriagemDaCategoria: boolean) {
  const contagens = semTriagemDaCategoria ? null : campos.contagens
  return {
    category_id: campos.category_id,
    category_name: categoria,
    quantity: semTriagemDaCategoria ? campos.quantity : null,
    weight_kg: null,
    aproveitadas: contagens?.aproveitadas ?? null,
    redoadas: contagens?.redoadas ?? null,
    descarte: contagens?.descarte ?? null,
    notes: campos.notes,
    donated_at: campos.donated_at,
  }
}
