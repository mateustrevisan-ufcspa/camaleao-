const tagStyles: Record<string, { bg: string; color: string }> = {
  familiar: { bg: '#E2DCF3', color: '#4B3A9B' },
  voluntário: { bg: '#DCEBE0', color: '#5C8A6E' },
  brechó: { bg: '#FBE3CA', color: '#C97D3E' },
  tampinha: { bg: '#FDE7E7', color: '#E25A8F' },
  // pagamento (nomes DB e labels)
  pix:      { bg: '#DCEBE0', color: '#5C8A6E' },
  PIX:      { bg: '#DCEBE0', color: '#5C8A6E' },
  cash:     { bg: '#FBE3CA', color: '#C97D3E' },
  dinheiro: { bg: '#FBE3CA', color: '#C97D3E' },
  Dinheiro: { bg: '#FBE3CA', color: '#C97D3E' },
  debit:    { bg: '#E2DCF3', color: '#4B3A9B' },
  debito:   { bg: '#E2DCF3', color: '#4B3A9B' },
  Débito:   { bg: '#E2DCF3', color: '#4B3A9B' },
  credit:   { bg: '#F8DCD2', color: '#D87560' },
  credito:  { bg: '#F8DCD2', color: '#D87560' },
  Crédito:  { bg: '#F8DCD2', color: '#D87560' },
}

const fallback = { bg: '#F0E8DC', color: '#7A6E8A' }

interface TagProps {
  children: string
}

export function Tag({ children }: TagProps) {
  const style = tagStyles[children] ?? fallback
  return (
    <span
      className="inline-flex items-center px-2.5 h-[20px] rounded-full text-[11px] font-medium font-body whitespace-nowrap tracking-wide leading-none"
      style={{ backgroundColor: style.bg, color: style.color }}
    >
      {children}
    </span>
  )
}
