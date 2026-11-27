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

// US-39 · Assunto do e-mail de agradecimento (antes, escrito na página).
export const ASSUNTO_DO_AGRADECIMENTO = 'Obrigado por apoiar o Instituto Camaleão'

const MESES_POR_EXTENSO = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]

// Textos propostos pela equipe; a coordenação pode trocar (pergunta 3). Sem pedido
// de dado nem de pagamento, com o caminho para deixar de receber.

const emReais = (valor: number) => `R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
const primeiroNomeDe = (nome: string) => nome.trim().split(/\s+/)[0] ?? ''

// US-41 · Mensal (resposta 2): compras no brechó e doações em dinheiro do mês, com os atendimentos.
// As peças saíram do mensal e foram para o semanal.
export function textoDeAgradecimento(p: { nome: string; mes: number; valor: number; atendimentos: string }): string {
  return (
    `Olá, ${primeiroNomeDe(p.nome)}! Em ${MESES_POR_EXTENSO[p.mes - 1]}, você contribuiu com ${emReais(p.valor)} com o Instituto Camaleão, ` +
    `o que ajuda a custear ${p.atendimentos} de pessoas em tratamento de câncer. ` +
    'Nosso muito obrigado por fazer parte desta história. ' +
    'Se não quiser mais receber mensagens do Instituto, é só responder SAIR.'
  )
}

// US-41 · Semanal (resposta 2): mensagem padrão para quem trouxe item na sede, sem dizer o quê.
export function textoDeAgradecimentoSemanal(nome: string): string {
  return (
    `Olá, ${primeiroNomeDe(nome)}! Obrigado pela doação que você trouxe ao Instituto Camaleão nesta semana. ` +
    'Cada doação que chega à nossa sede ajuda a manter os atendimentos de quem está em tratamento de câncer. ' +
    'Se não quiser mais receber mensagens do Instituto, é só responder SAIR.'
  )
}

// US-41 · Anual (resposta 2): o total do ano com os atendimentos; quem só doou item, texto fixo.
export function textoDeAgradecimentoAnual(p: { nome: string; ano: number; valor: number; atendimentos: string }): string {
  const fim = 'Obrigado por estar com a gente. Se não quiser mais receber mensagens do Instituto, é só responder SAIR.'
  if (p.valor > 0) {
    return `Olá, ${primeiroNomeDe(p.nome)}! Em ${p.ano}, você contribuiu com ${emReais(p.valor)} com o Instituto Camaleão, o que ajudou a custear ${p.atendimentos} de pessoas em tratamento de câncer. ${fim}`
  }
  return `Olá, ${primeiroNomeDe(p.nome)}! Em ${p.ano}, suas doações à sede do Instituto Camaleão fizeram diferença para quem está em tratamento de câncer. ${fim}`
}
