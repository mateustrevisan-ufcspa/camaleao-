export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

// Valor monetário no padrão BR sem prefixo: 1234.5 -> "1.234,50".
// Use com o literal "R$ " já presente no template.
export function formatBRL(value: number): string {
  return Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function parseMoney(input: string | number): number {
  if (typeof input === 'number') return input
  const s = String(input).trim().replace(/\s/g, '').replace(/R\$/i, '')
  if (!s) return 0
  const decPos = Math.max(s.lastIndexOf(','), s.lastIndexOf('.'))
  if (decPos === -1) return parseFloat(s.replace(/[^\d-]/g, '')) || 0
  const intPart = s.slice(0, decPos).replace(/[^\d-]/g, '')
  const fracPart = s.slice(decPos + 1).replace(/[^\d]/g, '')
  return parseFloat(`${intPart}.${fracPart}`) || 0
}

const BR_TZ = 'America/Sao_Paulo'

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR', { timeZone: BR_TZ })
}

// Data atual no fuso BRT como 'YYYY-MM-DD' (mesmo formato de <input type="date">).
function brTodayStr(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: BR_TZ, year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

// Converte valor de <input type="date"> (data sem hora) em ISO UTC.
// Hoje (BRT) -> agora, preservando hora real. Dia passado -> meio-dia BRT
// (15:00 UTC) para nunca cruzar fronteira de dia ao exibir em qualquer fuso.
export function dateInputToISO(dateStr: string | null | undefined): string {
  if (!dateStr) return new Date().toISOString()
  if (dateStr === brTodayStr()) return new Date().toISOString()
  return new Date(`${dateStr}T15:00:00.000Z`).toISOString()
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}
