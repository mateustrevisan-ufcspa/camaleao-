import { redirect } from 'next/navigation'

// US-11: tampinhas viraram uma categoria de doação de item.
export default function DoacoesTampinhasPage() {
  redirect('/doacoes/itens')
}