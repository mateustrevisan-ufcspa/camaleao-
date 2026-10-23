import { readFile } from 'node:fs/promises'
import { expect, test } from '@playwright/test'
import { strFromU8, unzipSync } from 'fflate'
import { doacaoSemFicha, entrar, valorUnico } from './apoio'

// US-18 · Exportação dos relatórios em planilha. O .xlsx é um zip de arquivos
// XML: o teste abre o zip e confere as abas e o texto das células.
test.describe('Fumaça: exportação em planilha', () => {
  test('a planilha do período tem uma aba por assunto e neutraliza fórmula', async ({ page }) => {
    const doador = `=1+1 TESTE US-18 ${Date.now()}`
    const valor = valorUnico(18)
    await entrar(page)

    await test.step('registrar uma doação com nome que parece fórmula', async () => {
      await page.goto('/doacoes/dinheiro/nova')
      await doacaoSemFicha(page, doador)
      await page.locator('input[name="amount"]').fill(valor.numero.toFixed(2))
      await page.getByRole('button', { name: 'Registrar doação' }).click()
      await expect(page).toHaveURL(/\/doacoes\/dinheiro$/)
    })

    const arquivo = await test.step('exportar o mês corrente', async () => {
      await page.goto('/relatorios')
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.getByRole('link', { name: 'Exportar planilha' }).click(),
      ])
      expect(download.suggestedFilename()).toMatch(/^relatorio-\d{4}-\d{2}-\d{2}-a-\d{4}-\d{2}-\d{2}\.xlsx$/)
      return unzipSync(new Uint8Array(await readFile(await download.path())))
    })

    await test.step('uma aba por assunto', async () => {
      const pasta = strFromU8(arquivo['xl/workbook.xml'])
      for (const aba of ['Resumo', 'Vendas', 'Doações em dinheiro', 'Doações de itens', 'Eventos', 'Campanhas']) {
        expect(pasta, `faltou a aba ${aba}`).toContain(`name="${aba}"`)
      }
    })

    await test.step('o nome que parecia fórmula vira texto, e não há fórmula na planilha', async () => {
      const xml = Object.entries(arquivo)
        .filter(([nome]) => nome.startsWith('xl/'))
        .map(([, conteudo]) => strFromU8(conteudo))
        .join('\n')
      expect(xml).toContain(`'${doador}`)
      expect(xml).not.toContain('<f>')
    })

    await test.step('datas e valores no padrão brasileiro', async () => {
      const estilos = strFromU8(arquivo['xl/styles.xml'])
      expect(estilos).toContain('formatCode="dd/mm/yyyy hh:mm"')
      expect(estilos).toContain('formatCode="&quot;R$&quot; #,##0.00"')
    })
  })
})