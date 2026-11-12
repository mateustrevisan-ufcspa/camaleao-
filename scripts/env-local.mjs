// Gera o .env.local apontando para o Supabase local (Docker).
// Uso: npm run env:local   (com `npm run db:start` já rodando)
import { execSync } from 'node:child_process'
import { existsSync, writeFileSync } from 'node:fs'

const force = process.argv.includes('--force')
if (existsSync('.env.local') && !force) {
  console.error('.env.local já existe. Rode com --force para sobrescrever.')
  process.exit(1)
}

let status
try {
  status = JSON.parse(execSync('npx --yes supabase@3.0.0 status -o json', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }))
} catch {
  console.error('Supabase local não está rodando. Rode `npm run db:start` primeiro.')
  process.exit(1)
}

// A 3.0.0 pode trazer os valores dentro de outro objeto e com outro nome.
// Procura nos dois níveis, pelos nomes conhecidos.
function valor(...nomes) {
  for (const fonte of [status, status.stack, status.local, status.data]) {
    if (!fonte || typeof fonte !== 'object') continue
    for (const nome of nomes) if (typeof fonte[nome] === 'string' && fonte[nome] !== '') return fonte[nome]
  }
  console.error(`O status do Supabase não trouxe ${nomes[0]}. Rode npx --yes supabase@3.0.0 status -o json e ajuste este script.`)
  process.exit(1)
}

writeFileSync(
  '.env.local',
  [
    '# Gerado por scripts/env-local.mjs: Supabase local, sem dado real.',
    `NEXT_PUBLIC_SUPABASE_URL=${valor('API_URL', 'api_url', 'apiUrl')}`,
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${valor('ANON_KEY', 'PUBLISHABLE_KEY', 'anon_key', 'publishable_key')}`,
    '',
  ].join('\n'),
)
console.log('.env.local criado para o Supabase local')
