// US-09 · Importação de pessoas: regras de normalização e o fluxo na tela.
import { test, expect } from '@playwright/test'
import writeExcelFile from 'write-excel-file/node'
import { lerPessoas, normalizarAniversario, normalizarTelefone, repetidasNaPlanilha, sugerirMapa } from '../../lib/importacao'
import { entrar } from './apoio'

test('normaliza telefone e aniversário e acha as colunas pelo título', () => {
  expect(normalizarTelefone('+55 (51) 99812-3344')).toBe('(51) 99812-3344')
  expect(normalizarTelefone('5132223344')).toBe('(51) 3222-3344')
  expect(normalizarTelefone('99812-3344')).toBeNull()
  expect(normalizarAniversario('1980-06-14')).toBe('14/06')
  expect(normalizarAniversario('5/3/1990')).toBe('05/03')
  expect(normalizarAniversario('31/13')).toBeNull()
  expect(sugerirMapa(['Nome completo', 'Celular (WhatsApp)', 'E-mail', 'Data de nascimento'])).toEqual({ nome: 0, telefone: 1, email: 2, aniversario: 3 })
})

test('repetida na planilha aponta a primeira linha igual, e linha sem nome não conta', () => {
  const pessoas = lerPessoas(
    [['', '(51) 99000-1111'], ['Ana', '(51) 99000-1111'], ['Ana Souza', '51 99000-1111'], ['Bia', '']],
    { nome: 0, telefone: 1, email: null, aniversario: null },
  )
  expect(repetidasNaPlanilha(pessoas)).toEqual([null, null, 3, null])
})

test('a coordenação importa uma planilha e vê o que entrou e o que ficou de fora', async ({ page }) => {
  const sufixo = Date.now()
  const nova = `TESTE US-09 ${sufixo}`
  const arquivo = await writeExcelFile([
    {
      sheet: 'Clientes',
      data: [
        [{ value: 'Nome' }, { value: 'Telefone' }, { value: 'Aniversário' }],
        [{ value: nova }, { value: `51 9${String(sufixo).slice(-8)}` }, { value: '14/06' }],
        [{ value: 'Roberta L.' }, { value: '(51) 99812-3344' }, { value: '' }], // seed: Roberta Lima tem este telefone
        [{ value: '=HYPERLINK("http://exemplo.com")' }, { value: '' }, { value: '' }],
        [{ value: '' }, { value: '(51) 90000-0000' }, { value: '' }],
      ],
    },
  ]).toBuffer()

  await entrar(page)
  await page.goto('/clientes/importar')
  await page.getByLabel('Planilha').setInputFiles({
    name: 'teste-us-09.xlsx',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    buffer: arquivo,
  })
  await page.getByRole('button', { name: 'Ler planilha' }).click()
  await expect(page.getByLabel('Nome', { exact: true })).toHaveValue('0')
  await page.getByRole('button', { name: 'Conferir as linhas' }).click()

  const linhas = page.getByTestId('linha-da-previa')
  await expect(linhas).toHaveCount(4)
  await expect(linhas.nth(0).getByTestId('situacao')).toHaveText('Nova')
  await expect(linhas.nth(1).getByTestId('situacao')).toHaveText('Já tem ficha (Roberta Lima)')
  // O texto com "=" é só um nome: entra como texto, sem ser executado.
  await expect(linhas.nth(2).getByTestId('situacao')).toHaveText('Nova')
  await expect(linhas.nth(3).getByTestId('situacao')).toHaveText('Sem nome')

  await page.getByRole('checkbox', { name: 'Importar a linha 4' }).uncheck()
  await page.getByRole('button', { name: /Importar 1 pessoa/ }).click()
  await expect(page.getByTestId('resultado-da-importacao')).toContainText('1 pessoa importada e 3 descartadas')
})
