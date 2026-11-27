'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cancelDoacaoEmDinheiro, cancelVenda, getBanks, getDoacaoEmDinheiro, souCaixaOuCoordenacao, updateDoacaoEmDinheiro } from '@/lib/store'
import { FORMAS_DA_DOACAO, pedeBandeira, type FormaDaDoacao } from '@/lib/taxas'
import { dataDeBrasilia, dateInputToISO, brTodayStr, parseMoney } from '@/lib/utils'
import { voltarSeguro } from '@/lib/voltar'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const ORIGENS = ['PIX', 'Dinheiro', 'Site', 'Transferência', 'Outro']
const AVISO_RESTRITO = 'Só a coordenação corrige e cancela lançamentos com dinheiro. Peça à coordenação.'

const motivoDe = (v: FormDataEntryValue | string | null) => String(v ?? '').trim().slice(0, 300)

export async function corrigirDoacaoEmDinheiro(id: string, fd: FormData): Promise<{ error: string } | void> {
  if (!(await souCaixaOuCoordenacao())) return { error: AVISO_RESTRITO }
  if (!UUID.test(id)) return { error: 'Doação não encontrada.' }
  // Resposta 4: o motivo da correção é opcional. Quando vier, vai para a trilha.
  const motivo = motivoDe(fd.get('motivo_da_alteracao')) || null

  const valor = parseMoney((fd.get('amount') as string) || '0')
  if (!(valor > 0)) return { error: 'Informe um valor maior que zero.' }
  const data = ((fd.get('donated_at') as string) || '').trim()
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data) || data > brTodayStr()) return { error: 'A data da doação não pode ser depois de hoje.' }
  const origem = (fd.get('origin') as string) || ''
  if (!ORIGENS.includes(origem)) return { error: 'Escolha a origem.' }
  const frequencia = fd.get('frequency') === 'monthly' ? 'monthly' : 'one_time'

  // Maquininha: as mesmas regras do registro (US-35).
  let recebimento: { bank_id: string | null; forma: 'pix' | 'debit' | 'credit' | null; parcelado: boolean; bandeira: 'visa_master' | 'outras' | null } =
    { bank_id: null, forma: null, parcelado: false, bandeira: null }
  const bancoEscolhido = ((fd.get('bank_id') as string) || '').trim()
  if (bancoEscolhido) {
    const escolha = FORMAS_DA_DOACAO[((fd.get('forma') as string) || '') as FormaDaDoacao]
    const banco = (await getBanks('doacoes')).find((b) => b.id === bancoEscolhido)
    if (!escolha || !banco || banco.type !== escolha.tipoDoBanco) return { error: 'Escolha a maquininha e a forma da lista.' }
    const b = fd.get('bandeira')
    const comBandeira = pedeBandeira(banco.name, escolha.forma)
    const bandeira = comBandeira && (b === 'visa_master' || b === 'outras') ? b : null
    if (comBandeira && !bandeira) return { error: 'No débito desta maquininha, escolha a bandeira.' }
    recebimento = { bank_id: banco.id, forma: escolha.forma, parcelado: escolha.parcelado, bandeira }
  }

  try {
    const original = await getDoacaoEmDinheiro(id)
    if (!original) return { error: 'Doação não encontrada.' }
    // Mesma data: a hora gravada fica (como na US-04a).
    const donatedAt = data === dataDeBrasilia(original.donated_at) ? original.donated_at : dateInputToISO(data)
    await updateDoacaoEmDinheiro(id, {
      amount: valor, donated_at: donatedAt, origin: origem, frequency: frequencia,
      notes: ((fd.get('notes') as string) || '').trim() || null,
      ...recebimento,
      motivo_da_alteracao: motivo,
    })
  } catch (e) {
    console.error('corrigirDoacaoEmDinheiro error:', e)
    return { error: 'Não foi possível salvar a correção. Tente novamente.' }
  }
  revalidatePath('/doacoes/dinheiro')
  revalidatePath('/brecho/corrigir')
  // US-37: volta para a lista de doações ou para o dia aberto em Corrigir lançamento.
  redirect(voltarSeguro(String(fd.get('voltar') ?? '')))
}

export async function cancelarDoacaoEmDinheiro(id: string, motivo: string): Promise<{ error: string } | void> {
  if (!(await souCaixaOuCoordenacao())) return { error: AVISO_RESTRITO }
  if (!UUID.test(id)) return { error: 'Doação não encontrada.' }
  if (motivoDe(motivo).length < 5) return { error: 'Escreva o motivo do cancelamento.' }
  try {
    await cancelDoacaoEmDinheiro(id, motivoDe(motivo))
  } catch (e) {
    console.error('cancelarDoacaoEmDinheiro error:', e)
    return { error: 'Não foi possível cancelar a doação.' }
  }
  revalidatePath('/doacoes/dinheiro')
  revalidatePath('/brecho/corrigir')
}

export async function cancelarVenda(id: string, motivo: string): Promise<{ error: string } | void> {
  if (!(await souCaixaOuCoordenacao())) return { error: AVISO_RESTRITO }
  if (!UUID.test(id)) return { error: 'Venda não encontrada.' }
  if (motivoDe(motivo).length < 5) return { error: 'Escreva o motivo do cancelamento.' }
  try {
    await cancelVenda(id, motivoDe(motivo))
  } catch (e) {
    console.error('cancelarVenda error:', e)
    return { error: 'Não foi possível cancelar a venda.' }
  }
  revalidatePath('/brecho/financeiro')
  revalidatePath('/brecho')
  revalidatePath('/brecho/corrigir')
}