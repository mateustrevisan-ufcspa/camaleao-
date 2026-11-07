// Mensagens que a equipe envia pelo próprio WhatsApp ou e-mail, com o texto pronto
// (US-22). Quem decide se a pessoa pode receber é a trava da US-07: a lista
// message_recipients. Estas funções só montam o link.

// O WhatsApp quer só dígitos, com o código do país. Telefone brasileiro com DDD
// tem 10 ou 11 dígitos; sem DDD não dá para montar o link.
export function numeroParaWhatsApp(telefone: string): string | null {
  const digitos = (telefone ?? '').replace(/\D/g, '')
  if (digitos.length === 10 || digitos.length === 11) return `55${digitos}`
  if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith('55')) return digitos
  return null
}

export function linkDoWhatsApp(telefone: string, texto: string): string | null {
  const numero = numeroParaWhatsApp(telefone)
  return numero ? `https://wa.me/${numero}?text=${encodeURIComponent(texto)}` : null
}

export function linkDoEmail(email: string, assunto: string, texto: string): string | null {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email ?? '')) return null
  return `mailto:${email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(texto)}`
}

// Texto proposto pela equipe; a coordenação do Instituto pode trocar.
export function textoDeAniversario(nome: string): string {
  const primeiroNome = nome.trim().split(/\s+/)[0] ?? ''
  return `Feliz aniversário, ${primeiroNome}! O Instituto Camaleão agradece por você fazer parte da nossa história. Um abraço de toda a equipe.`
}

// US-21a · Período do agradecimento. Provisório: o mês (pergunta 2 ao Instituto, 06/11).
// Para "por ano", troque para 'ano': a tela passa a usar AAAA, e a tabela já aceita.
export const PERIODO_DO_AGRADECIMENTO: 'mes' | 'ano' = 'mes'

const MESES_POR_EXTENSO = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

// Texto proposto pela equipe; a coordenação pode trocar (pergunta 3). Sem pedido
// de dado nem de pagamento, com o caminho para deixar de receber.
export function textoDeAgradecimento(p: { nome: string; mes: number; valor: number; atendimentos: string; pecas: number }): string {
  const primeiroNome = p.nome.trim().split(/\s+/)[0] ?? ''
  const reais = `R$ ${p.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const pecas = `${p.pecas} ${p.pecas === 1 ? 'peça' : 'peças'}`
  const oQue =
    p.valor > 0 && p.pecas > 0
      ? `você contribuiu com ${reais} e doou ${pecas} para o Instituto Camaleão`
      : p.valor > 0
        ? `você contribuiu com ${reais} com o Instituto Camaleão`
        : `você doou ${pecas} para o Instituto Camaleão`
  const impacto = p.valor > 0 ? `, o que ajuda a custear ${p.atendimentos} de pessoas em tratamento de câncer` : ''
  return (
    `Olá, ${primeiroNome}! Em ${MESES_POR_EXTENSO[p.mes - 1]}, ${oQue}${impacto}. ` +
    'Nosso muito obrigado por fazer parte desta história. ' +
    'Se não quiser mais receber mensagens do Instituto, é só responder SAIR.'
  )
}
