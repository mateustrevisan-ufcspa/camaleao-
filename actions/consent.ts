'use server'

import { addMessageConsent, getMessageConsent } from '@/lib/store'
import { TERMO_MENSAGENS } from '@/lib/termo-mensagens'
import type { MessageConsent } from '@/types'

export async function fetchMessageConsent(clientId: string): Promise<MessageConsent | null> {
  return getMessageConsent(clientId)
}

// Autorizar grava a versão do termo que está valendo agora.
export async function authorizeMessages(clientId: string): Promise<MessageConsent | null> {
  await addMessageConsent(clientId, true, TERMO_MENSAGENS.versao)
  return getMessageConsent(clientId)
}

// Retirar a autorização (descadastro) vale na hora e não depende de motivo.
export async function revokeMessages(clientId: string): Promise<MessageConsent | null> {
  await addMessageConsent(clientId, false, TERMO_MENSAGENS.versao)
  return getMessageConsent(clientId)
}
