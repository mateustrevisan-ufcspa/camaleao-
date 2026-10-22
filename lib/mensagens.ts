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
