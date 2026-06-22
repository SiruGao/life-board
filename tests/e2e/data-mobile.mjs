import assert from 'node:assert/strict'
import { createBrowserPage, reset, expectRoute, assertNoErrors } from './helpers.mjs'

async function assertNoHorizontalOverflow(page, label) {
  const report = await page.evaluate(() => {
    const width = innerWidth
    const offenders = [...document.querySelectorAll('body *')]
      .map((element) => {
        const rect = element.getBoundingClientRect()
        return {
          tag: element.tagName,
          className: typeof element.className === 'string' ? element.className : '',
          id: element.id || '',
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          scrollWidth: element.scrollWidth,
          text: String(element.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 90),
        }
      })
      .filter((item) => item.right > width + 1 || item.left < -1 || item.scrollWidth > item.width + 2)
      .slice(0, 20)
    return {
      viewport: width,
      documentWidth: document.documentElement.scrollWidth,
      offenders,
    }
  })
  if (report.documentWidth > report.viewport + 1) {
    console.error(`MOBILE_OVERFLOW ${label} ${JSON.stringify(report)}`)
  }
  assert.ok(report.documentWidth <= report.viewport + 1, `${label} has horizontal overflow`)
}

const desktop = await createBrowserPage()
try {
  await reset(desktop.page, '#data')
  await expectRoute(desktop.page, '#data', '.data-grid')

  const [download] = await Promise.all([
    desktop.page.waitForEvent('download'),
    desktop.page.getByRole('button', { name: '导出 JSON', exact: true }).click(),
  ])
  assert.match(download.suggestedFilename(), /\.json$/)

  await desktop.page.locator('#file').setInputFiles({
    name: 'archive.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ version: 2, sessions: [] })),
  })
  await desktop.page.getByText('档案已导入', { exact: true }).waitFor()

  desktop.page.once('dialog', (dialog) => dialog.dismiss())
  await desktop.page.getByRole('button', { name: '永久删除', exact: true }).click()
  await expectRoute(desktop.page, '#data', '.data-grid')
  assertNoErrors(desktop.errors)
} finally {
  await desktop.context.close()
  await desktop.browser.close()
}

const mobile = await createBrowserPage({ width: 390, height: 844 })
try {
  await reset(mobile.page)
  await mobile.page.getByRole('button', { name: '开始一次审议', exact: true }).click()
  await expectRoute(mobile.page, '#new', '#new-form')
  await assertNoHorizontalOverflow(mobile.page, 'new')

  await mobile.page.locator('.nav [data-route="models"]').click()
  await expectRoute(mobile.page, '#models', '#ai-settings-form')
  await assertNoHorizontalOverflow(mobile.page, 'models')

  await mobile.page.locator('.nav [data-route="new"]').click()
  await expectRoute(mobile.page, '#new', '#new-form')
  assertNoErrors(mobile.errors)
  console.log('Data controls and mobile navigation passed.')
} finally {
  await mobile.context.close()
  await mobile.browser.close()
}
