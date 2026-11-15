# BUG-04 · Aniversariantes só com termo aprovado (2 SP)

> Como coordenadora do Instituto, eu quero que a lista de aniversariantes só mostre como "pode receber" quem autorizou uma versão aprovada do termo, para que ninguém receba mensagem por um texto que o Instituto ainda não aprovou.

**Tipo:** correção · **Implementa:** Bibiana · **Revisa:** Alissa · **Branch:** `bug-04-aniversariantes-com-termo-aprovado` · **Depende de:** US-36 (integrada na segunda à noite) · **PR pronto:** terça 17/11, 18h · **Merge:** terça 17/11, à noite, antes da US-04b (sem migração)

**Origem:** revisão da US-21a (12/11, `docs/sprints/sprint-7/PROGRESSO.md`, "Pendências que seguem"). Os aniversariantes (US-22, da Bibiana) decidem quem pode receber pela view `message_recipients`, que não olha a aprovação do termo. O agradecimento (US-21a) usa `destinatarios_do_agradecimento`, que exige versão aprovada. Hoje, quem autorizou pela `2026-10` aparece com o botão de WhatsApp nos aniversariantes.

## Critérios de aceitação

- [ ] O botão de WhatsApp ou e-mail só aparece para quem está em `destinatarios_do_agradecimento` (autorizou uma versão aprovada e não retirou)
- [ ] Quem autorizou uma versão não aprovada ou anterior aparece com "Autorizou um termo que não vale (veja a ficha)", sem botão
- [ ] Sem nenhuma versão aprovada, a página avisa no topo: "O termo de mensagens ainda não foi aprovado: ninguém recebe mensagem"
- [ ] Quem não autorizou continua com "Sem autorização de mensagens"
- [ ] Sem migração: a regra já existe na view da US-21a
- [ ] Testes de fumaça e de acesso passam

## Decisões

- **Sem migração.** A view `destinatarios_do_agradecimento` já é "quem pode receber mensagem com termo aprovado". O nome fala de agradecimento, mas a regra é a mesma para aniversário. Renomear a view mexeria na US-21a e na US-39 na mesma semana; fica anotado em "Fora desta story".
- **`message_recipients` não muda.** Ela continua dizendo "autorizou e não retirou" (US-07), e os testes de consentimento do caixa dependem dela. A regra de envio passa a ser: toda tela que monta link de mensagem usa `destinatarios_do_agradecimento`. A seção 5 de `docs/privacidade/termo-de-mensagens.md` passa a dizer isso.
- **Só a coordenação** abre os aniversariantes (`SO_COORDENACAO`), e só ela lê as aprovações: a view, que é `security_invoker`, devolve as linhas certas para quem abre a tela.

## 1. Branch

Depois do merge da US-36 (segunda à noite):

```bash
git checkout main && git pull
git checkout -b bug-04-aniversariantes-com-termo-aprovado
git push -u origin bug-04-aniversariantes-com-termo-aprovado
```

## Parte A · `types/index.ts`

Em `Aniversariante`, troque o campo `autorizou`:

```ts
export interface Aniversariante {
  id: string
  name: string
  dia: number
  phone: string
  email: string
  // BUG-04: pode receber só quem autorizou uma versão aprovada do termo
  // (destinatarios_do_agradecimento). "termo_que_nao_vale": autorizou, mas por
  // uma versão não aprovada ou anterior.
  situacao: 'pode_receber' | 'termo_que_nao_vale' | 'sem_autorizacao'
}
```

## Parte B · `lib/store.ts`, `getAniversariantes`

Troque o trecho a partir de `// A trava de envio da US-07` até o fim da função:

```ts
  // BUG-04: a trava de envio é a lista com termo aprovado (US-21a). A
  // message_recipients diz só quem autorizou, para separar "termo que não vale".
  const ids = doMes.map((c) => c.id)
  const [autorizadas, comTermoAprovado] = await Promise.all([
    supabase.from('message_recipients').select('client_id').in('client_id', ids),
    supabase.from('destinatarios_do_agradecimento').select('client_id').in('client_id', ids),
  ])
  const erro = autorizadas.error ?? comTermoAprovado.error
  if (erro) throw new Error(erro.message)
  const autorizou = new Set((autorizadas.data ?? []).map((a) => a.client_id as string))
  const podem = new Set((comTermoAprovado.data ?? []).map((a) => a.client_id as string))

  return doMes
    .map((c): Aniversariante => ({
      id: c.id,
      name: c.name,
      dia: c.dia,
      phone: c.phone ?? '',
      email: c.email ?? '',
      situacao: podem.has(c.id) ? 'pode_receber' : autorizou.has(c.id) ? 'termo_que_nao_vale' : 'sem_autorizacao',
    }))
    .sort((a, b) => a.dia - b.dia || a.name.localeCompare(b.name, 'pt-BR'))
}

// BUG-04 · Há alguma versão do termo aprovada? Só a coordenação lê as aprovações.
export async function temTermoAprovado(): Promise<boolean> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('aprovacoes_do_termo').select('versao').limit(1)
  if (error) throw new Error(error.message)
  return (data ?? []).length > 0
}
```

## Parte C · `app/(admin)/clientes/aniversariantes/page.tsx`

1. Import: `import { getAniversariantes, temTermoAprovado } from '@/lib/store'`.
2. `const [pessoas, termoAprovado] = await Promise.all([getAniversariantes(mes), temTermoAprovado()])` no lugar de `const pessoas = await getAniversariantes(mes)`.
3. Logo depois do `<nav>` dos meses:

```tsx
      {!termoAprovado && (
        <div data-testid="termo-nao-aprovado" className="rounded-[12px] px-4 py-3 mb-6 font-body text-sm text-ink" style={{ backgroundColor: '#FBE3CA' }}>
          O termo de mensagens ainda não foi aprovado: ninguém recebe mensagem. A coordenação registra a aprovação em Clientes · Agradecimentos.
        </div>
      )}
```

4. Na linha de cada pessoa, troque o bloco `{!p.autorizou ? (...) : ...}` por:

```tsx
                {p.situacao === 'sem_autorizacao' ? (
                  <span className="font-body text-xs text-muted">Sem autorização de mensagens</span>
                ) : p.situacao === 'termo_que_nao_vale' ? (
                  <span className="font-body text-xs text-muted">Autorizou um termo que não vale (veja a ficha)</span>
                ) : !whatsapp && !email ? (
                  <span className="font-body text-xs text-muted">Autorizou, mas não tem contato registrado</span>
                ) : (
```

O resto (os dois links) fica como está.

5. O subtítulo do topo: "Só aparece para quem autorizou receber mensagens do Instituto, por um termo aprovado."

## Parte D · `docs/privacidade/termo-de-mensagens.md`, seção 5

Troque o primeiro parágrafo por:

```markdown
Toda funcionalidade que **envia** mensagem (agradecimento da US-21a, aniversariantes da US-22, campanhas) decide quem pode receber pela view `destinatarios_do_agradecimento`: autorizou, não retirou **e a versão do termo foi aprovada pelo Instituto**. A `message_recipients` continua dizendo só "autorizou e não retirou" e serve para mostrar a situação na ficha (BUG-04, Sprint 8).
```

## Parte E · Testes

### `tests/fumaca/aniversariantes.spec.ts`

No teste "o envio aparece só para quem autorizou", antes do `goto` dos aniversariantes, aprove a versão atual no banco local (sem isso, ninguém pode receber):

```ts
import { COORDENACAO, entrarNaApi } from '../acesso/apoio'
import { TERMO_MENSAGENS } from '../../lib/termo-mensagens'
...
    const { api } = await entrarNaApi(COORDENACAO)
    await api.from('aprovacoes_do_termo').upsert({ versao: TERMO_MENSAGENS.versao, aprovado_em: '2026-11-01' }, { ignoreDuplicates: true })
```

Teste novo, no mesmo `describe`:

```ts
  test('quem autorizou um termo que não vale fica sem botão', async ({ page }) => {
    const nome = `TESTE BUG-04 ${Date.now()}`
    const { api } = await entrarNaApi(COORDENACAO)
    await api.from('aprovacoes_do_termo').upsert({ versao: TERMO_MENSAGENS.versao, aprovado_em: '2026-11-01' }, { ignoreDuplicates: true })
    const { data: p } = await api.from('clients').insert({ name: nome, phone: '(51) 99700-4455', birthday: '30/12' }).select('id').single()
    await api.from('message_consents').insert({ client_id: p!.id, authorized: true, term_version: '2026-10' })

    await entrar(page)
    await page.goto('/clientes/aniversariantes?mes=12')
    const linha = page.getByTestId('aniversariante').filter({ hasText: nome })
    await expect(linha.getByText('Autorizou um termo que não vale')).toBeVisible()
    await expect(linha.getByRole('link')).toHaveCount(0)
  })
```

Confira em `lib/store.ts` o formato do aniversário gravado (`dd/mm`, comentário de `getAniversariantes`); se o cadastro pela API gravar outro formato, use o da tela, como na função `cadastrar` do arquivo.

### Os testes de acesso

Nada novo: a regra é a da view da US-21a, já coberta em `tests/acesso/agradecimentos.spec.ts` (e no teste novo da US-36).

## Conferir

```bash
npm run lint
npm run build
npm run test:fumaca
npm run test:acesso
```

Na tela, com `npm run dev` e `npm run db:reset`: sem aprovação, o aviso no topo e ninguém com botão; aprovando a versão atual em Clientes · Agradecimentos, quem autorizou pela atual ganha o botão; quem autorizou pela `2026-10` (pelo SQL do banco local) fica com o aviso.

## Pull Request

Título: `BUG-04 · Aniversariantes só com termo aprovado`. A Alissa revisa (fez a US-21a, de onde vem a view) e escreve no PR os três casos que conferiu.

**Integração, terça 17/11, à noite, antes da US-04b:** sem migração. Conferência no publicado com a conta de conferência da coordenação: Clientes · Aniversariantes mostra o aviso de termo não aprovado (o Instituto ainda não registrou a aprovação).

## Fora desta story

- Renomear `destinatarios_do_agradecimento` para um nome geral (por exemplo, `destinatarios_de_mensagem`): migração e mudança em três telas, sem ganho para o Instituto na semana da entrega.
