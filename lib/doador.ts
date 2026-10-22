// US-14 · Toda doação vinculada a uma ficha.
// Sem pessoa escolhida, a doação só é aceita se quem registra marcou "doação sem
// ficha". Assim a doação anônima é uma escolha, e não um esquecimento.
export function faltaEscolherDoador(formData: FormData): boolean {
  return !formData.get('client_id') && formData.get('sem_ficha') !== '1'
}

export const AVISO_ESCOLHER_DOADOR = 'Escolha a pessoa ou marque doação sem ficha.'
