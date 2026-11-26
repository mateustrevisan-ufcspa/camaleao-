// Termo de autorização de mensagens (US-07).
// O texto que a pessoa ouviu fica identificado pela versão gravada junto da
// autorização. Mudou o texto? Crie uma versão nova aqui e registre a mudança em
// docs/privacidade/termo-de-mensagens.md. Nunca edite o texto de uma versão que
// já foi usada.
//
// US-36 · Versão 2026-11: texto enviado pela Flávia em 06/11 (resposta 1). A 2026-10
// não foi aprovada; as autorizações registradas por ela continuam no histórico,
// mas não valem para mensagens (decisão de 15/11).
export const TERMO_MENSAGENS = {
  versao: '2026-11',
  texto:
    'O Instituto Camaleão solicita seus contatos telefônicos (WhatsApp ou SMS) e/ou e-mail apenas com o objetivo de ' +
    'agradecer suas doações; avisar sobre campanhas, eventos e promoções; e fazer a prestação de contas sobre os ' +
    'atendimentos que oferecemos a quem está em tratamento oncológico. Seus dados serão utilizados apenas para este ' +
    'fim e não serão repassados a terceiros. Você pode retirar esta autorização quando quiser, em nossa sede ou pelos ' +
    'canais do Instituto, e deixa de receber mensagens a partir desse momento.',
} as const

// Versões que já foram usadas e não valem mais. Só para mostrar na ficha.
export const VERSOES_ANTERIORES: readonly string[] = ['2026-10']

export function termoVigente(versao: string | null | undefined): boolean {
  return versao === TERMO_MENSAGENS.versao
}
