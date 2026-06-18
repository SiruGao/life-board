import { readFile } from 'node:fs/promises'
import assert from 'node:assert/strict'

const ai = await readFile('ai.js', 'utf8')
const styles = await readFile('ai.css', 'utf8')

assert.ok(ai.includes('Model control center'))
assert.ok(ai.includes('三步完成模型接入'))
assert.ok(ai.includes('连接 Gateway'))
assert.ok(ai.includes('选择默认模型'))
assert.ok(ai.includes('启用 AI 追问'))
assert.ok(ai.includes('providerDirectory'))
assert.ok(ai.includes('advanced-settings'))
assert.ok(ai.includes('测试所选模型'))
assert.ok(ai.includes("endpoint('/api/inquiry', next.gatewayUrl)"))
assert.ok(ai.includes('friendlyError'))
assert.ok(ai.includes('Gateway 是浏览器与模型供应商之间的安全中转层'))
assert.ok(ai.includes('供应商 API Key 在哪里配置？'))
assert.ok(ai.includes('打开模型中心'))
assert.ok(!ai.includes('Beta 访问令牌'))

assert.ok(styles.includes('.model-status-grid'))
assert.ok(styles.includes('.model-center-layout'))
assert.ok(styles.includes('.setup-step'))
assert.ok(styles.includes('.provider-list'))
assert.ok(styles.includes('.advanced-settings'))
assert.ok(styles.includes('.gateway-flow'))
assert.ok(styles.includes('.model-test-result'))
assert.ok(styles.includes('@media (max-width: 760px)'))

console.log('Model center checks passed.')
