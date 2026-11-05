'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { deleteDonationItem, getDonationCategory, getDonationItem, registrarTriagem, updateDonationItem } from '@/lib/store'
import { camposPelaCategoria, lerCamposDoItem, UUID } from '@/lib/campos-do-item'
import { lerContagens, semTriagem } from '@/lib/triagem'
import { dataDeBrasilia } from '@/lib/utils'

const AVISO_SEM_PERMISSAO =
  'Doação não encontrada. O balcão altera só as doações lançadas hoje; para as outras, fale com a coordenação.'

// US-04a · Corrige uma doação de item. A política do banco decide se pode.
export async function editarDoacaoDeItem(id: string, formData: FormData): Promise<{ error: string } | void> {
  if (!UUID.test(id)) return { error: AVISO_SEM_PERMISSAO }
  const lido = lerCamposDoItem(formData)
  if ('erro' in lido) return { error: lido.erro }
  const { campos } = lido

  try {
    const original = await getDonationItem(id)
    if (!original) return { error: AVISO_SEM_PERMISSAO }

    // A categoria de antes vale mesmo se a coordenação a desativou depois;
    // uma categoria nova vem da lista das ativas, com o nome vindo do banco.
    let categoryName = original.category_name
    if (campos.category_id !== original.category_id) {
      const categoria = await getDonationCategory(campos.category_id)
      if (!categoria) return { error: 'Escolha uma categoria da lista.' }
      categoryName = categoria.name
    }

    // Mesma data: a hora gravada fica. Outra data: a regra do registro.
    const dataInformada = ((formData.get('donated_at') as string) || '').trim()
    const donatedAt = dataInformada === dataDeBrasilia(original.donated_at) ? original.donated_at : campos.donated_at

    // A pessoa da doação com ficha não muda aqui; sem ficha, nome e telefone podem ser corrigidos.
    let doador: { donor_name?: string; donor_phone?: string } = {}
    if (!original.client_id) {
      const nome = ((formData.get('donor_name') as string) || '').trim()
      if (!nome) return { error: 'Informe o nome do doador.' }
      doador = { donor_name: nome, donor_phone: ((formData.get('donor_phone') as string) || '').trim() }
    }

    // US-27: o peso saiu do formulário, então a edição guarda o que já estava gravado.
    // Doação antiga, com quantidade e sem triagem: a edição sem contagem não apaga a quantidade.
    const novos = camposPelaCategoria(campos, categoryName, semTriagem(categoryName))
    const antiga = !semTriagem(categoryName) && original.quantity !== null && campos.contagens === null
    await updateDonationItem(id, {
      ...novos,
      weight_kg: original.weight_kg,
      ...(antiga ? { quantity: original.quantity } : {}),
      donated_at: donatedAt,
      ...doador,
    })
  } catch (e) {
    console.error('editarDoacaoDeItem error:', e)
    return { error: 'Não foi possível salvar a alteração. Tente novamente.' }
  }

  revalidatePath('/doacoes/itens')
  redirect('/doacoes/itens')
}

// US-04a · Exclui uma doação de item. O banco guarda quem excluiu e quando.
export async function excluirDoacaoDeItem(id: string): Promise<{ error: string } | void> {
  if (!UUID.test(id)) return { error: AVISO_SEM_PERMISSAO }
  try {
    await deleteDonationItem(id)
  } catch (e) {
    console.error('excluirDoacaoDeItem error:', e)
    return { error: 'Não foi possível excluir a doação. Tente novamente.' }
  }
  revalidatePath('/doacoes/itens')
}

// US-27 · Registra a triagem de uma doação de qualquer dia. Altera só as três contagens.
export async function registrarTriagemDaDoacao(id: string, formData: FormData): Promise<{ error: string } | void> {
  if (!UUID.test(id)) return { error: 'Doação não encontrada.' }
  const lidas = lerContagens(formData)
  if ('erro' in lidas) return { error: lidas.erro }
  if (lidas.contagens === null) return { error: 'Informe as três contagens da triagem.' }
  try {
    await registrarTriagem(id, lidas.contagens)
  } catch (e) {
    console.error('registrarTriagemDaDoacao error:', e)
    return { error: 'Não foi possível registrar a triagem. Ela pode já ter sido registrada; recarregue a página.' }
  }
  revalidatePath('/doacoes/itens')
}
