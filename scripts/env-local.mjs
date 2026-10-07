// Gera o .env.local apontando para o Supabase local (Docker).
// Uso: npm run env:local   (com `npx supabase start` já rodando)
import { execSync } from 'node:child_process'
import { existsSync, writeFileSync } from 'node:fs'

const force = process.argv.includes('--force')
if (existsSync('.env.local') && !force) {
  console.error('.env.local já existe. Rode com --force para sobrescrever.')
  process.exit(1)
}

let status
try {
  status = JSON.parse(execSync('npx --yes supabase@2.119.0 status -o json', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }))
} catch {
  console.error('Supabase local não está rodando. Rode `npm run db:start` primeiro.')
  process.exit(1)
}

writeFileSync(
  '.env.local',
  [
    '# Gerado por scripts/env-local.mjs: Supabase local, sem dado real.',
    `NEXT_PUBLIC_SUPABASE_URL=${status.API_URL}`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${status.ANON_KEY}`,
    '',
  ].join('\n'),
)
console.log(`.env.local criado para ${status.API_URL}`)
