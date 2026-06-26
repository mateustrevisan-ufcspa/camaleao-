export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
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

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
}
