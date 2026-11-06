// US-27 · Contagem da triagem do item doado.

// Categorias sem triagem: só se registra que chegou, com a quantidade. Sem peso
// (Tamara, 03/11). Provisório até a Tamara dizer se a tampinha fica com quantidade;
// se ela passar a ter triagem, tire daqui e da função triagens_pendentes
// (migração 20261103090000).
export const SEM_TRIAGEM = ['tampinha']

export const MAXIMO_DA_CONTAGEM = 300

export interface Contagens {
  aproveitadas: number
  redoadas: number
  descarte: number
}

export function semTriagem(categoria: string | null | undefined): boolean {
  return SEM_TRIAGEM.includes((categoria ?? '').trim().toLowerCase())
}

type ItemParaTriagem = {
  category_name: string
  aproveitadas: number | null
  redoadas: number | null
  descarte: number | null
  quantity: number | null
  weight_kg: number | null
}

// A mesma regra da função triagens_pendentes, para a lista do dia.
export function triagemPendente(d: ItemParaTriagem): boolean {
  return !semTriagem(d.category_name) && d.aproveitadas === null && d.quantity === null && d.weight_kg === null
}

// Peças da doação: as três contagens somadas; sem triagem, a quantidade antiga.
export function pecasDaDoacao(d: ItemParaTriagem): number {
  if (d.aproveitadas !== null) return d.aproveitadas + (d.redoadas ?? 0) + (d.descarte ?? 0)
  return d.quantity ?? 0
}

// "12 aproveitadas · 3 redoadas · 1 descarte"
export function textoDaTriagem(c: { aproveitadas: number | null; redoadas: number | null; descarte: number | null }): string {
  return `${c.aproveitadas ?? 0} aproveitadas · ${c.redoadas ?? 0} redoadas · ${c.descarte ?? 0} descarte`
}

// Lê as três contagens de um formulário. Todas vazias: null (triagem pendente).
// Alguma preenchida: as vazias valem zero.
export function lerContagens(fd: FormData): { erro: string } | { contagens: Contagens | null } {
  const bruto = (['aproveitadas', 'redoadas', 'descarte'] as const).map((campo) => ((fd.get(campo) as string) || '').trim())
  if (bruto.every((v) => v === '')) return { contagens: null }

  const numeros = bruto.map((v) => (v === '' ? 0 : Number(v)))
  if (numeros.some((n) => !Number.isInteger(n) || n < 0 || n > MAXIMO_DA_CONTAGEM)) {
    return { erro: `Cada contagem precisa ser um número inteiro de 0 a ${MAXIMO_DA_CONTAGEM}.` }
  }
  const [aproveitadas, redoadas, descarte] = numeros
  return { contagens: { aproveitadas, redoadas, descarte } }
}
