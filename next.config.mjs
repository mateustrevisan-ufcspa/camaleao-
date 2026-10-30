// SEC-06 · O build recusa chave secreta do Supabase em variável pública.
// Variável NEXT_PUBLIC_ vai para os arquivos que o navegador baixa. Em 21/10 a
// variável da chave anônima, na Vercel, recebeu uma chave secreta, e ela foi
// publicada no site. Este arquivo é lido em todo build, inclusive na Vercel: com
// chave secreta em variável pública, o build para e o deploy anterior continua no ar.
// Detalhes em docs/seguranca/chave-secreta-no-build.md.
import { Buffer } from 'node:buffer'

function ehChaveSecreta(valor) {
  if (valor.includes('sb_secret_')) return true
  // Chave antiga em formato JWT (desativadas desde 05/10): a de serviço traz role "service_role".
  const partes = valor.split('.')
  if (partes.length !== 3) return false
  try {
    return JSON.parse(Buffer.from(partes[1], 'base64url').toString('utf8')).role === 'service_role'
  } catch {
    return false
  }
}

const publicasComSegredo = Object.entries(process.env)
  .filter(([nome, valor]) => nome.startsWith('NEXT_PUBLIC_') && typeof valor === 'string' && ehChaveSecreta(valor))
  .map(([nome]) => nome)

if (publicasComSegredo.length > 0) {
  // Só o nome da variável aparece no erro; o valor nunca vai para o log.
  throw new Error(
    `Chave secreta do Supabase em variável pública (${publicasComSegredo.join(', ')}). ` +
      'Use a chave publicável (sb_publishable_...). Veja docs/seguranca/chave-secreta-no-build.md.',
  )
}

/** @type {import('next').NextConfig} */
const nextConfig = {}

export default nextConfig