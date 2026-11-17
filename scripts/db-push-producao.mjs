// TS-06 · db push de produção com conferência.
// Uso, na branch da story, depois do PR aprovado:
//   npm run db:push:producao             (confere tudo e aplica)
//   npm run db:push:producao -- --ensaio (confere tudo e para antes do Supabase)
import { spawnSync } from 'node:child_process'
import readline from 'node:readline/promises'
import { stdin, stdout, exit, argv, platform } from 'node:process'

const ENSAIO = argv.includes('--ensaio')
const CLI = ['--yes', 'supabase@3.0.0']
const PASTA = 'supabase/migrations'
const NOME_DA_STORY = /^(us|sec|ts|bug)-\d+[a-z]?(-[a-z0-9]+)+$/

function parar(motivo) {
  console.error(`\n✗ ${motivo}\n`)
  exit(1)
}

function ok(texto) {
  console.log(`✓ ${texto}`)
}

// Roda e devolve a saída. Com "mostrar", a saída vai direto para o terminal.
function rodar(cmd, args, { mostrar = false, podeFalhar = false } = {}) {
  const r = spawnSync(cmd, args, {
    encoding: 'utf8',
    shell: platform === 'win32',
    stdio: mostrar ? 'inherit' : 'pipe',
  })
  if (r.status !== 0 && !podeFalhar) {
    parar(`Falhou: ${cmd} ${args.join(' ')}\n${r.stderr ?? ''}`)
  }
  return { status: r.status, saida: (r.stdout ?? '').trim() }
}

const git = (...args) => rodar('git', args).saida
const carimbo = (arquivo) => arquivo.split('/').pop().slice(0, 14)

async function perguntar(rl, texto) {
  return (await rl.question(texto)).trim()
}

const rl = readline.createInterface({ input: stdin, output: stdout })

try {
  // 1. Branch da story, sem arquivo solto.
  const branch = git('rev-parse', '--abbrev-ref', 'HEAD')
  if (branch === 'main' || branch === 'HEAD') parar('Rode na branch da story, e não na main.')
  if (!NOME_DA_STORY.test(branch)) parar(`"${branch}" não parece branch de story (us-, sec-, ts- ou bug-).`)
  if (git('status', '--porcelain') !== '') parar('Há arquivos sem commit. Faça commit ou descarte antes do db push.')
  ok(`branch ${branch}, sem arquivo solto`)

  // 2. Em dia com a main e igual ao que está no GitHub.
  rodar('git', ['fetch', 'origin', 'main', branch])
  if (rodar('git', ['merge-base', '--is-ancestor', 'origin/main', 'HEAD'], { podeFalhar: true }).status !== 0) {
    parar('A branch está atrás da origin/main. Traga a main (git merge origin/main), rode os testes e peça a aprovação de novo.')
  }
  if (git('rev-parse', 'HEAD') !== git('rev-parse', `origin/${branch}`)) {
    parar('O commit local é diferente do que está no GitHub. Faça git push (ou git pull) e confira a aprovação de novo.')
  }
  ok('em dia com a origin/main e igual ao GitHub')

  // 3. As migrações novas da branch.
  const daMain = git('ls-tree', '--name-only', 'origin/main', `${PASTA}/`).split('\n').filter((f) => f.endsWith('.sql'))
  const ultimaDaMain = daMain.map(carimbo).sort().pop() ?? '0'
  const novas = git('diff', '--name-only', '--diff-filter=A', 'origin/main...HEAD', '--', PASTA).split('\n').filter((f) => f.endsWith('.sql'))
  if (novas.length === 0) {
    console.log('\nEsta branch não tem migração nova: não precisa de db push. Pode seguir para o merge.\n')
    exit(0)
  }
  const atrasadas = novas.filter((f) => carimbo(f) <= ultimaDaMain)
  if (atrasadas.length > 0) {
    parar(`Carimbo menor ou igual ao da última migração da main (${ultimaDaMain}):\n  ${atrasadas.join('\n  ')}\nTroque o carimbo antes do push (e peça a aprovação de novo).`)
  }
  ok(`migrações novas da branch:\n    ${novas.join('\n    ')}`)

  // 4. Aprovação do PR.
  let aprovacao
  const gh = rodar('gh', ['pr', 'view', branch, '--json', 'number,reviewDecision,headRefOid,reviews'], { podeFalhar: true })
  if (gh.status === 0 && gh.saida) {
    const pr = JSON.parse(gh.saida)
    const head = git('rev-parse', 'HEAD')
    if (pr.reviewDecision !== 'APPROVED') parar(`O PR #${pr.number} não está aprovado (${pr.reviewDecision || 'sem revisão'}).`)
    if (pr.headRefOid !== head) parar(`O PR #${pr.number} está em outro commit. Faça git push e peça a aprovação de novo.`)
    // O repositório não descarta aprovação antiga quando entra commit novo (US-09, Sprint 7):
    // o reviewDecision pode ser de um commit anterior. Vale a aprovação feita neste commit.
    const aprovacoes = (pr.reviews ?? []).filter((r) => r.state === 'APPROVED' && r.commit?.oid === head)
    if (aprovacoes.length === 0) parar(`O PR #${pr.number} não tem aprovação no commit atual (${head.slice(0, 7)}). Peça a aprovação de novo.`)
    aprovacao = `PR #${pr.number} aprovado por ${aprovacoes.map((r) => r.author?.login).join(', ')} no commit ${head.slice(0, 7)} (conferido pelo gh)`
  } else {
    console.log('\nO gh não está instalado ou não achou o PR. Confira no GitHub e responda:')
    const numero = await perguntar(rl, '  Número do PR: ')
    const quem = await perguntar(rl, '  Quem aprovou, no commit atual: ')
    const palavra = await perguntar(rl, '  Digite "aprovado" se a aprovação é do último commit: ')
    if (!/^\d+$/.test(numero) || quem.length < 2 || palavra !== 'aprovado') parar('Sem aprovação confirmada, nada de db push.')
    aprovacao = `PR #${numero} aprovado por ${quem} (informado à mão)`
  }
  ok(aprovacao)

  if (ENSAIO) {
    console.log('\nEnsaio: todas as conferências passaram. Parando antes do Supabase.\n')
    exit(0)
  }

  // 5. O que o banco de produção tem, confirmação, push e conferência.
  console.log('\nMigrações no banco de produção (antes):\n')
  rodar('npx', [...CLI, 'migration', 'list', '--remote'], { mostrar: true })
  console.log(`\nNa lista acima, as pendentes (só na coluna Local) devem ser só estas:\n    ${novas.map(carimbo).join('\n    ')}`)
  const confirma = await perguntar(rl, `Confere? Digite o nome da branch (${branch}) para aplicar: `)
  if (confirma !== branch) parar('Confirmação diferente do nome da branch. Nada foi aplicado.')

  rl.close()
  rodar('npx', [...CLI, 'db', 'push', '--remote'], { mostrar: true })

  console.log('\nMigrações no banco de produção (depois):\n')
  const depois = rodar('npx', [...CLI, 'migration', 'list', '--remote']).saida
  console.log(depois)
  const linhas = depois.split('\n').filter((l) => /^\s*\d{14}/.test(l))
  console.log('\nPara a tabela "Publicações" do PROGRESSO.md:')
  console.log(`  ${aprovacao}`)
  for (const l of linhas.slice(-novas.length - 1)) console.log(`  ${l.trim()}`)
  console.log('\nAgora o merge, e depois a conferência no publicado.\n')
} finally {
  rl.close()
}