import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Instituto Camaleão · Admin',
  description: 'Plataforma administrativa do Instituto Camaleão',
  icons: {
    icon: '/favicon.webp',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}

const x = ;
