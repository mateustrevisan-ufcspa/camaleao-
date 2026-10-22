import { NextResponse, type NextRequest } from 'next/server'
import writeExcelFile, { type Row } from 'write-excel-file/node'
import { getDadosDaExportacao, getRelatorioConsolidado, souCoordenacao } from '@/lib/store'
import { cabecalho, dataHora, numero, reais, texto } from '@/lib/planilha'

// US-18 · Exportação do relatório em planilha. Gera um .xlsx com uma aba por
// assunto: resumo, vendas, doações em dinheiro, doações de itens e eventos.
// O proxy já devolve o balcão para o brechó (rota de /relatorios); a conferência
// abaixo é a segunda trava.

const DATA = /^\d{4}-\d{2}-\d{2}$/
const PAGAMENTO: Record<string, string> = { pix: 'PIX', credit: 'Crédito', debit: 'Débito', cash: 'Dinheiro' }
const ESTADO = { good: 'Bom', needs_review: 'Revisar' } as const
const DESTINO = { stock: 'Estoque', direct: 'Direto' } as const
const dataBR = (d: string) => d.split('-').reverse().join('/')

export async function GET(request: NextRequest) {
  if (!(await souCoordenacao())) {
    return new NextResponse('Essa área é restrita à coordenação do Instituto.', { status: 403 })
  }

  const de = request.nextUrl.searchParams.get('de') ?? ''
  const ate = request.nextUrl.searchParams.get('ate') ?? ''
  if (!DATA.test(de) || !DATA.test(ate) || de > ate) {
    return new NextResponse('Período inválido.', { status: 400 })
  }

  const [resumo, linhas] = await Promise.all([getRelatorioConsolidado(de, ate), getDadosDaExportacao(de, ate)])

  const abaResumo: Row[] = [
    [texto('Relatório consolidado do Instituto Camaleão')],
    [texto('Período'), texto(`${dataBR(de)} a ${dataBR(ate)}`)],
    [],
    cabecalho(['', 'Quantidade', 'Valor']),
    [texto('Vendas do brechó'), numero(resumo.vendas.quantidade), reais(resumo.vendas.valor)],
    [texto('Doações em dinheiro'), numero(resumo.doacoes.quantidade), reais(resumo.doacoes.valor)],
    ...resumo.eventos.map((ev): Row => [texto(`  das quais no evento ${ev.nome}`), texto(''), reais(ev.valor)]),
    [texto('Total arrecadado'), texto(''), reais(resumo.total)],
    [],
    cabecalho(['Itens recebidos por categoria', 'Doações', 'Peças', 'Peso (kg)']),
    ...resumo.itens.map((i): Row => [texto(i.categoria), numero(i.doacoes), numero(i.quantidade), numero(i.peso)]),
    [],
    cabecalho(['Quem mais contribuiu', 'Compras', 'Doações', 'Total']),
    ...resumo.ranking.map((p): Row => [texto(p.nome), reais(p.compras), reais(p.doacoes), reais(p.total)]),
  ]

  const abaVendas: Row[] = [
    cabecalho(['Data', 'Cliente', 'Peças', 'Valor', 'Pagamento', 'Banco', 'Parcelas', 'Valor líquido']),
    ...linhas.vendas.map((v): Row => [
      dataHora(v.sold_at),
      texto(v.customer_name),
      texto(v.category),
      reais(v.amount),
      texto(PAGAMENTO[v.payment_method] ?? v.payment_method),
      texto(v.bank),
      numero(v.installments),
      reais(v.net_amount),
    ]),
  ]

  const abaDinheiro: Row[] = [
    cabecalho(['Data', 'Doador', 'Valor', 'Origem', 'Frequência', 'Evento', 'Observações']),
    ...linhas.dinheiro.map((d): Row => [
      dataHora(d.donated_at),
      texto(d.donor_name),
      reais(d.amount),
      texto(d.origin),
      texto(d.frequency === 'monthly' ? 'mensal' : 'pontual'),
      texto(d.event_name),
      texto(d.notes),
    ]),
  ]

  const abaItens: Row[] = [
    cabecalho(['Data', 'Doador', 'Categoria', 'Quantidade', 'Peso (kg)', 'Estado', 'Destino']),
    ...linhas.itens.map((i): Row => [
      dataHora(i.donated_at),
      texto(i.donor_name),
      texto(i.category_name),
      numero(i.quantity),
      numero(i.weight_kg),
      texto(i.condition ? ESTADO[i.condition] : ''),
      texto(i.destination ? DESTINO[i.destination] : ''),
    ]),
  ]

  // Eventos: o que cada evento arrecadou no período, a partir das doações em dinheiro.
  const porEvento = new Map<string, { doacoes: number; valor: number }>()
  for (const d of linhas.dinheiro) {
    if (!d.event_name) continue
    const ev = porEvento.get(d.event_name) ?? { doacoes: 0, valor: 0 }
    ev.doacoes += 1
    ev.valor += Number(d.amount)
    porEvento.set(d.event_name, ev)
  }
  const abaEventos: Row[] = [
    cabecalho(['Evento', 'Doações no período', 'Arrecadado no período']),
    ...[...porEvento].map(([nome, ev]): Row => [texto(nome), numero(ev.doacoes), reais(Math.round(ev.valor * 100) / 100)]),
  ]

  const planilha = await writeExcelFile([
    { sheet: 'Resumo', data: abaResumo, columns: [{ width: 34 }, { width: 14 }, { width: 14 }, { width: 14 }] },
    { sheet: 'Vendas', data: abaVendas, stickyRowsCount: 1, columns: [{ width: 17 }, { width: 28 }, { width: 24 }, { width: 13 }, { width: 12 }, { width: 14 }, { width: 9 }, { width: 13 }] },
    { sheet: 'Doações em dinheiro', data: abaDinheiro, stickyRowsCount: 1, columns: [{ width: 17 }, { width: 28 }, { width: 13 }, { width: 14 }, { width: 11 }, { width: 22 }, { width: 30 }] },
    { sheet: 'Doações de itens', data: abaItens, stickyRowsCount: 1, columns: [{ width: 17 }, { width: 28 }, { width: 16 }, { width: 11 }, { width: 10 }, { width: 10 }, { width: 10 }] },
    { sheet: 'Eventos', data: abaEventos, stickyRowsCount: 1, columns: [{ width: 28 }, { width: 18 }, { width: 20 }] },
  ]).toBuffer()

  return new NextResponse(new Uint8Array(planilha), {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="relatorio-${de}-a-${ate}.xlsx"`,
      'Cache-Control': 'no-store',
    },
  })
}