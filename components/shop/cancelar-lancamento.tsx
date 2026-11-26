'use client'

import { CancelarComMotivo } from '@/components/ui/cancelar-com-motivo'
import { cancelarDoacaoEmDinheiro, cancelarVenda } from '@/actions/correcoes'

// US-37 · O CancelarComMotivo recebe uma função; numa página do servidor, a função tem que nascer no cliente.
export function CancelarLancamento({ tipo, id }: { tipo: 'venda' | 'doacao'; id: string }) {
  return (
    <CancelarComMotivo
      rotulo={tipo === 'venda' ? 'Cancelar venda' : 'Cancelar'}
      cancelar={(motivo) => (tipo === 'venda' ? cancelarVenda(id, motivo) : cancelarDoacaoEmDinheiro(id, motivo))}
    />
  )
}
