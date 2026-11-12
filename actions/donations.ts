'use server'

import { redirect } from 'next/navigation'
import { addDonation, addDonationItem, getBanks, getDonationCategory } from '@/lib/store'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { parseMoney, dateInputToISO, brTodayStr } from '@/lib/utils'
import { AVISO_ESCOLHER_DOADOR, faltaEscolherDoador } from '@/lib/doador'
import { camposPelaCategoria, lerCamposDoItem } from '@/lib/campos-do-item'
import { semTriagem } from '@/lib/triagem'
import { AVISO_VALOR_ALTO, pedeConfirmacao } from '@/lib/valor-alto'
import { FORMAS_DA_DOACAO, pedeBandeira, type FormaDaDoacao } from '@/lib/taxas'

// Id de evento vindo do formulário.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// BUG-01: data depois de hoje (em Brasília) não entra, venha do formulário ou não.
// As duas datas estão no formato AAAA-MM-DD, então a comparação de texto basta.
function dataDepoisDeHoje(formData: FormData): boolean {
  const informada = ((formData.get('donated_at') as string) || '').trim()
  return informada !== '' && informada > brTodayStr()
}

const AVISO_DATA_FUTURA = 'A data da doação não pode ser depois de hoje.'

export async function registerDonation(formData: FormData): Promise<{ error: string } | void> {
  if (faltaEscolherDoador(formData)) return { error: AVISO_ESCOLHER_DOADOR }
  if (dataDepoisDeHoje(formData)) return { error: AVISO_DATA_FUTURA }
  const donated_at = dateInputToISO(formData.get('donated_at') as string)
  const amount = parseMoney((formData.get('amount') as string) || '0')
  const donorName = ((formData.get('donor_name') as string) || '').trim()
  // Evento é opcional (US-12): sem ele, a doação segue como antes.
  const eventId = ((formData.get('event_id') as string) || '').trim()
  // Campanha também é opcional (US-13), e a doação é de um evento ou de uma campanha.
  const campaignId = ((formData.get('campaign_id') as string) || '').trim()

  if (!donorName) return { error: 'Informe o nome do doador.' }
  if (amount <= 0) return { error: 'Informe um valor maior que zero.' }
    // US-34: valor muito alto só entra com a confirmação do formulário.
  if (pedeConfirmacao(amount) && formData.get('confirmar_valor_alto') !== 'sim') return { error: AVISO_VALOR_ALTO }
  if (eventId && !UUID.test(eventId)) return { error: 'Escolha um evento da lista.' }
  if (campaignId && !UUID.test(campaignId)) return { error: 'Escolha uma campanha da lista.' }
  if (eventId && campaignId) return { error: 'A doação é de um evento ou de uma campanha, não dos dois.' }

  // US-35: por onde o dinheiro entrou. Vazio = sem maquininha.
  const bancoEscolhido = ((formData.get('bank_id') as string) || '').trim()
  let recebimento: {
    bank_id: string | null
    forma: 'pix' | 'debit' | 'credit' | null
    parcelado: boolean
    bandeira: 'visa_master' | 'outras' | null
  } = { bank_id: null, forma: null, parcelado: false, bandeira: null }
  if (bancoEscolhido) {
    if (!UUID.test(bancoEscolhido)) return { error: 'Escolha a maquininha da lista.' }
    const formaDigitada = ((formData.get('forma') as string) || '') as FormaDaDoacao
    const escolha = Object.hasOwn(FORMAS_DA_DOACAO, formaDigitada) ? FORMAS_DA_DOACAO[formaDigitada] : null
    if (!escolha) return { error: 'Escolha a forma de pagamento da maquininha.' }
    let banco: { id: string; name: string; type: string } | undefined
    try {
      banco = (await getBanks('doacoes')).find((b) => b.id === bancoEscolhido)
    } catch (e) {
      console.error('registerDonation getBanks error:', e)
      return { error: 'Não foi possível registrar a doação. Tente novamente.' }
    }
    if (!banco) return { error: 'Escolha a maquininha da lista.' }
    if (banco.type !== escolha.tipoDoBanco) {
      return { error: escolha.forma === 'pix' ? 'Pix só em banco de Pix.' : 'Débito e crédito só em maquininha de cartão.' }
    }
    const bandeiraDigitada = formData.get('bandeira')
    const comBandeira = pedeBandeira(banco.name, escolha.forma)
    const bandeira = comBandeira && (bandeiraDigitada === 'visa_master' || bandeiraDigitada === 'outras') ? bandeiraDigitada : null
    if (comBandeira && !bandeira) return { error: 'No débito desta maquininha, escolha a bandeira.' }
    recebimento = { bank_id: banco.id, forma: escolha.forma, parcelado: escolha.parcelado, bandeira }
  }

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    await addDonation({
      client_id:     (formData.get('client_id') as string) || null,
      donated_at,
      donor_name:    donorName,
      // Pessoa com ficha: o telefone fica só na ficha, não é copiado para a doação (SEC-05).
      donor_phone:   formData.get('client_id') ? '' : ((formData.get('donor_phone') as string) || ''),
      amount,
      origin:        (formData.get('origin') as string) || 'PIX',
      frequency:     (formData.get('frequency') as 'monthly' | 'one_time') || 'one_time',
      notes:         (formData.get('notes') as string) || undefined,
      registered_by: user?.id ?? null,
      event_id:      eventId || null,
      campaign_id:   campaignId || null,
      ...recebimento,
    })
  } catch (e) {
    console.error('registerDonation error:', e)
    return { error: 'Não foi possível registrar a doação. Tente novamente.' }
  }

  revalidatePath('/doacoes/dinheiro')
  redirect('/doacoes/dinheiro')
}

export async function registerDonationItem(formData: FormData): Promise<{ error: string } | void> {
  if (faltaEscolherDoador(formData)) return { error: AVISO_ESCOLHER_DOADOR }
  const donorName = ((formData.get('donor_name') as string) || '').trim()
  if (!donorName) return { error: 'Informe o nome do doador.' }
  const lido = lerCamposDoItem(formData)
  if ('erro' in lido) return { error: lido.erro }
  const { campos } = lido

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // O nome da categoria vem do banco, e não do navegador.
    const categoria = await getDonationCategory(campos.category_id)
    if (!categoria) return { error: 'Escolha uma categoria da lista.' }

    await addDonationItem({
      client_id:     (formData.get('client_id') as string) || null,
      donor_name:    donorName,
      // Pessoa com ficha: o telefone fica só na ficha, não é copiado para a doação (SEC-05).
      donor_phone:   formData.get('client_id') ? '' : ((formData.get('donor_phone') as string) || ''),
      // US-27: contagens da triagem, ou a quantidade da tampinha.
      ...camposPelaCategoria(campos, categoria.name, semTriagem(categoria.name)),
      category_id:   categoria.id,
      notes:         campos.notes ?? undefined,
      registered_by: user?.id ?? null,
    })
  } catch (e) {
    console.error('registerDonationItem error:', e)
    return { error: 'Não foi possível registrar a doação. Tente novamente.' }
  }

  revalidatePath('/doacoes/itens')
  redirect('/doacoes/itens')
}
