// US-24b · Envia a cópia cifrada para o bucket privado "backups" e apaga as de
// mais de 30 dias. Roda só na rotina "Backup diário" (.github/workflows/backup.yml).
// Uso: SUPABASE_URL=... CHAVE=... node scripts/backup-guardar.mjs camaleao-AAAA-MM-DD.tar.gz.gpg
import { readFileSync } from 'node:fs'
import { createClient } from '@supabase/supabase-js'

const BUCKET = 'backups'
const DIAS = 30

const [arquivo] = process.argv.slice(2)
const url = process.env.SUPABASE_URL
const chave = process.env.CHAVE
if (!arquivo || !/^camaleao-\d{4}-\d{2}-\d{2}\.tar\.gz\.gpg$/.test(arquivo)) {
  console.error('Informe o arquivo da cópia (camaleao-AAAA-MM-DD.tar.gz.gpg).')
  process.exit(1)
}
if (!url || !chave) {
  console.error('Faltam SUPABASE_URL e CHAVE (segredos BACKUP_SUPABASE_URL e BACKUP_CHAVE_SECRETA).')
  process.exit(1)
}

const supabase = createClient(url, chave, { auth: { persistSession: false, autoRefreshToken: false } })
const bucket = supabase.storage.from(BUCKET)

const { error: erroEnvio } = await bucket.upload(arquivo, readFileSync(arquivo), {
  contentType: 'application/octet-stream',
  upsert: true,
})
if (erroEnvio) {
  console.error(`Não foi possível guardar a cópia: ${erroEnvio.message}`)
  process.exit(1)
}

// Datas no nome, em UTC: a cópia de hoje nunca entra na conta.
const limite = new Date(Date.now() - DIAS * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
const { data: lista, error: erroLista } = await bucket.list('', { limit: 1000 })
if (erroLista) {
  console.error(`Cópia guardada, mas a lista do bucket falhou: ${erroLista.message}`)
  process.exit(1)
}
const antigas = (lista ?? [])
  .map((f) => f.name)
  .filter((nome) => {
    const data = /^camaleao-(\d{4}-\d{2}-\d{2})\.tar\.gz\.gpg$/.exec(nome)?.[1]
    return data !== undefined && data < limite
  })
if (antigas.length > 0) {
  const { error: erroApagar } = await bucket.remove(antigas)
  if (erroApagar) {
    console.error(`Cópia guardada, mas as antigas não foram apagadas: ${erroApagar.message}`)
    process.exit(1)
  }
}

console.log(`Cópia guardada: ${arquivo}. Apagadas por terem mais de ${DIAS} dias: ${antigas.length}.`)
