import assert from 'node:assert/strict'
import { createBrowserPage, reset, expectRoute, assertNoErrors } from './helpers.mjs'

const { browser, context, page, errors } = await createBrowserPage()

try {
  await reset(page, '#new')
  await expectRoute(page, '#new', '#new-form')

  const localEngine = page.locator('input[name="inquiry-engine"][value="local"]')
  if (await localEngine.count()) await localEngine.check()

  await page.locator('textarea[name="question"]').fill('我应该同时推进多个项目，还是先完成一个核心项目？')
  await page.locator('textarea[name="position"]').fill('我倾向先完成一个核心项目，因为持续切换降低了交付效率。')
  await page.locator('textarea[name="evidence"]').fill('过去三周并行任务很多，但没有形成稳定交付；集中处理时完成得更快。')
  await page.locator('select[name="challenge"]').selectOption('1')
  await page.getByRole('button', { name: /保存立场并进入追问/ }).click()
  await expectRoute(page, '#session', '.inquiry')

  await page.locator('#answer').fill('第一个回答用于检验我所使用的概念和判断标准。')
  await page.locator('[data-action="next"]').click()
  await page.locator('#answer').waitFor()
  await page.locator('[data-action="previous"]').click()
  await page.locator('#answer').waitFor()

  for (let index = 0; index < 8; index += 1) {
    if (await page.locator('#final').count()) break
    await page.locator('#answer').fill(`这是第 ${index + 1} 个回答，包含事实、反方和责任。`)
    await page.locator('[data-action="next"]').click()
  }

  await page.locator('#final').waitFor()
  await page.locator('#final').fill('我会集中完成一个核心项目，并用一周的交付结果检验这个判断。')
  await page.locator('#action').fill('今天确定唯一核心项目并安排第一段专注工作。')
  await page.locator('#responsibility').fill('我接受暂停其他项目的机会成本，并为结果负责。')
  await page.locator('[data-action="complete"]').click()

  await page.locator('.recap').waitFor()
  await page.locator('.judgment-artifact').waitFor()

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: '下载 Markdown', exact: true }).click(),
  ])
  assert.match(download.suggestedFilename(), /\.md$/)

  await page.locator('.privacy-share summary').click()
  const preview = page.locator('[data-share-preview]')
  assert.ok(!(await preview.textContent()).includes('集中完成一个核心项目'))
  await page.locator('[data-share-field="judgment"]').check()
  assert.match(await preview.textContent(), /集中完成一个核心项目/)

  await page.locator('[data-route="history"]').last().click()
  await expectRoute(page, '#history', '.grid')
  await page.getByRole('button', { name: '查看复盘', exact: true }).first().click()
  await expectRoute(page, '#session', '.recap')

  page.once('dialog', (dialog) => dialog.dismiss())
  await page.locator('[data-action="delete-current"]').click()
  await expectRoute(page, '#session', '.recap')

  await page.locator('[data-action="start"]').click()
  await expectRoute(page, '#new', '#new-form')

  assertNoErrors(errors)
  console.log('Complete inquiry and result flow passed.')
} finally {
  await context.close()
  await browser.close()
}
