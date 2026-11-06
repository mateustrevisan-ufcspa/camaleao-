'use server'

import { revalidatePath } from 'next/cache'
import { addTaxaDeCartao, getBanks } from '@/lib/store'
import { pedeBandeira } from '@/lib/taxas'
import { parseMoney } from '@/lib/utils'

const FORMAS = {
  pix: { forma: 'pix', parcelado: false, tipoDoBanco: 'pix' },
  debit: { forma: 'debit', parcelado: false, tipoDoBanco: 'card' },
  credit_avista: { forma: 'credit', parcelado: false, tipoDoBanco: 'card' },
  credit_parcelado: { forma: 'credit', parcelado: true, tipoDoBanco: 'card' },
} as const

// US-32 · Cadastra a taxa de uma combinação. Alterar é cadastrar de novo; a mais recente vale.
export async function definirTaxaDeCartao(fd: FormData): Promise<{ error: string } | void> {
  const bankId = ((fd.get('bank_id') as string) || '').trim()
  const escolha = FORMAS[((fd.get('forma') as string) || '') as keyof typeof FORMAS]
  const bandeiraDigitada = fd.get('bandeira')
  const digitada = ((fd.get('taxa') as string) || '').trim()
  // parseMoney devolve 0 para texto inválido; só aceita número de verdade.
  const taxa = /^\d+([.,]\d{1,2})?$/.test(digitada) ? parseMoney(digitada) : NaN

  if (!escolha) return { error: 'Escolha a forma de pagamento.' }
  if (!Number.isFinite(taxa) || taxa < 0 || taxa > 20) {
    return { error: 'Informe a taxa em porcentagem, de 0 a 20 (por exemplo, 1,88).' }
  }

  try {
    const banco = (await getBanks()).find((b) => b.id === bankId)
    if (!banco) return { error: 'Escolha uma maquininha da lista.' }
    if (banco.type !== escolha.tipoDoBanco) {
      return { error: escolha.forma === 'pix' ? 'Pix só em banco de Pix.' : 'Débito e crédito só em maquininha de cartão.' }
    }
    const comBandeira = pedeBandeira(banco.name, escolha.forma)
    const bandeira = comBandeira && (bandeiraDigitada === 'visa_master' || bandeiraDigitada === 'outras') ? bandeiraDigitada : null
    if (comBandeira && !bandeira) return { error: 'No débito desta maquininha, escolha a bandeira.' }

    await addTaxaDeCartao({ bank_id: banco.id, forma: escolha.forma, parcelado: escolha.parcelado, bandeira, taxa: Math.round(taxa * 100) / 100 })
  } catch (e) {
    console.error('definirTaxaDeCartao error:', e)
    return { error: 'Não foi possível salvar a taxa. Só a coordenação altera.' }
  }
  revalidatePath('/relatorios/taxas')
}
