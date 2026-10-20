import { redirect } from 'next/navigation'

// US-11: a nova doação de tampinhas é uma doação de item da categoria tampinha.
export default function NovaDoacaoTampinhasPage() {
  redirect('/doacoes/itens/nova?categoria=tampinha')
}