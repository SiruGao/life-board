import assert from 'node:assert/strict'
import { chromium } from 'playwright'

export const BASE_URL = process.env.E2E_BASE_URL || 'http://127.0.0.1:4173'

export async function createBrowserPage(viewport = { width: 1440, height: 1000 }) {
  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport, serviceWorkers: 'block' })
  const page = await context.newPage()
  const errors = []

  page.setDefaultTimeout(12000)

  page.on('pageerror', (error) => {
    const text = `pageerror: ${error.message}`
    errors.push(text)
    console.error(text)
  })
  page.on('console', (message) => {
    if (message.type() !== 'error') return
    const text = `console: ${message.text()}`
    errors.push(text)
    console.error(text)
  })

  await page.route('**/api/providers', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      gatewayVersion: 1,
      providers: [{ id: 'openai', label: 'OpenAI', model: 'gpt-5-mini' }],
      requiresAccessToken: true,
    }),
  }))

  await page.route('**/api/inquiry', (route) => route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      provider: 'openai',
      providerLabel: 'OpenAI',
      model: 'gpt-5-mini',
      generatedAt: new Date().toISOString(),
      questions: [
        { dimension: 'definition', text: '这里的正确具体指什么？', reason: '澄清标准。' },
        { dimension: 'evidence', text: '哪些证据可以独立核验？', reason: '检查证据。' },
        { dimension: 'opposition', text: '最强反方会怎样质疑？', reason: '检查反例。' },
        { dimension: 'agency', text: '最终由谁承担判断后果？', reason: '保留责任。' },
      ],
    }),
  }))

  return { browser, context, page, errors }
}

export async function reset(page, hash = '#home') {
  await page.goto(`${BASE_URL}/${hash}`, { waitUntil: 'networkidle' })
  await page.evaluate(() => {
    localStorage.clear()
    sessionStorage.clear()
  })
  await page.reload({ waitUntil: 'networkidle' })
}

export async function expectRoute(page, hash, selector) {
  await page.waitForFunction((expected) => location.hash === expected, hash)
  assert.equal(new URL(page.url()).hash, hash)
  await page.locator(selector).waitFor({ state: 'visible' })
}

export async function probeClick(page, locator, label) {
  await page.evaluate(() => {
    window.__socraticClickProbe = []
    if (window.__socraticProbeInstalled) return
    window.__socraticProbeInstalled = true
    for (const type of ['pointerdown', 'mousedown', 'mouseup', 'click']) {
      document.addEventListener(type, (event) => {
        window.__socraticClickProbe.push({
          phase: 'capture',
          type,
          target: event.target?.tagName || '',
          action: event.target?.closest?.('[data-action]')?.dataset?.action || '',
          route: event.target?.closest?.('[data-route]')?.dataset?.route || '',
          defaultPrevented: event.defaultPrevented,
        })
      }, true)
      document.addEventListener(type, (event) => {
        window.__socraticClickProbe.push({
          phase: 'bubble',
          type,
          target: event.target?.tagName || '',
          action: event.target?.closest?.('[data-action]')?.dataset?.action || '',
          route: event.target?.closest?.('[data-route]')?.dataset?.route || '',
          defaultPrevented: event.defaultPrevented,
        })
      })
    }
  })

  const before = await locator.evaluate((element) => {
    const rect = element.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const hit = document.elementFromPoint(centerX, centerY)
    const style = getComputedStyle(element)
    return {
      hash: location.hash,
      tag: element.tagName,
      html: element.outerHTML.slice(0, 500),
      disabled: Boolean(element.disabled),
      pointerEvents: style.pointerEvents,
      transform: style.transform,
      opacity: style.opacity,
      centerHit: hit?.outerHTML?.slice(0, 300) || '',
    }
  })

  await locator.click()
  await page.waitForTimeout(250)
  const afterPointer = await page.evaluate(() => ({
    hash: location.hash,
    events: window.__socraticClickProbe,
  }))

  if (afterPointer.hash === before.hash) {
    await locator.evaluate((element) => element.click())
    await page.waitForTimeout(250)
  }

  const afterSynthetic = await page.evaluate(() => ({
    hash: location.hash,
    events: window.__socraticClickProbe,
  }))

  console.log(`CLICK_PROBE ${label} ${JSON.stringify({ before, afterPointer, afterSynthetic })}`)
  return { before, afterPointer, afterSynthetic }
}

export function assertNoErrors(errors) {
  assert.deepEqual(errors, [], `Browser errors:\n${errors.join('\n')}`)
}
