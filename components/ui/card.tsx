'use client'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
}

export function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      data-prova={PROVA_SEC06}
      onClick={onClick}
      className={`bg-paper border border-rule rounded-[16px] p-6 ${
        onClick ? 'cursor-pointer transition-shadow hover:shadow-sm' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}

// PROVA DA SEC-06: chave inventada, este PR é fechado sem merge.
export const PROVA_SEC06 = 'sb_secret_prova_de_bloqueio_0000000000000000'