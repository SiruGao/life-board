import assert from 'node:assert/strict'
import { createBrowserPage, reset, expectRoute, assertNoErrors } from './helpers.mjs'

const { browser, context, page, errors } = await createBrowserPage()

try {
  await reset(page, '#models')
  await expectRoute(page, '#models', '#ai-settings-form')

  await page.locator('[data-ai-action="check"]').click()
  await expectRoute(page, '#models', '#ai-settings-form')

  const provider = page.locator('input[name="provider"][value="openai"]')
  await provider.waitFor()
  assert.equal(await provider.isChecked(), true)

  await page.locator('.advanced-settings summary').click()
  await page.locator('#ai-access-token').fill('browser-test-token')

  await page.locator('[data-ai-action="test"]').click()
  await page.getByText('模型调用通过', { exact: true }).waitFor()
  await expectRoute(page, '#models', '#ai-settings-form')

  const enabled = page.locator('input[name="enabled"]')
  if (!(await enabled.isChecked())) await enabled.check()
  await page.locator('.model-step-actions .primary').click()
  await expectRoute(page, '#models', '#ai-settings-form')

  await page.locator('[data-route="new"]').click()
  await expectRoute(page, '#new', '#new-form')

  await page.locator('[data-route="models"]').click()
  await expectRoute(page, '#models', '#ai-settings-form')
  await page.getByRole('link', { name: '返回首页' }).click()
  await expectRoute(page, '#home', '.hero')

  assertNoErrors(errors)
  console.log('Model center interaction flow passed.')
} finally {
  await context.close()
  await browser.close()
}
