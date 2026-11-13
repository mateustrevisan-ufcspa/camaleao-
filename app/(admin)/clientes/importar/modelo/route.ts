import { NextResponse } from 'next/server'
import writeExcelFile from 'write-excel-file/node'
import { souCoordenacao } from '@/lib/store'
import { cabecalho, texto } from '@/lib/planilha'

// US-09 · Planilha modelo, com os títulos que a importação reconhece e uma linha de exemplo.
export async function GET() {
  if (!(await souCoordenacao())) {
    return new NextResponse('Essa área é restrita à coordenação do Instituto.', { status: 403 })
  }
  const planilha = await writeExcelFile([
    {
      sheet: 'Pessoas',
      data: [
        cabecalho(['Nome', 'Telefone', 'E-mail', 'Aniversário']),
        [texto('Maria Exemplo'), texto('(51) 99999-0000'), texto('maria@exemplo.com'), texto('14/06')],
      ],
      columns: [{ width: 32 }, { width: 18 }, { width: 28 }, { width: 14 }],
    },
  ]).toBuffer()
  return new NextResponse(new Uint8Array(planilha), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="modelo-importacao-de-pessoas.xlsx"',
      'Cache-Control': 'no-store',
    },
  })
}
