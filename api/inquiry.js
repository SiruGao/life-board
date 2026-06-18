import { generateInquiry } from '../lib/ai-gateway.js'
import {
  applyCors,
  json,
  parseBody,
  publicError,
  requireGatewayToken,
} from '../lib/http.js'

export default async function handler(req, res) {
  if (!applyCors(req, res)) {
    json(res, 403, { error: 'ORIGIN_NOT_ALLOWED' })
    return
  }

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  if (req.method !== 'POST') {
    json(res, 405, { error: 'METHOD_NOT_ALLOWED' })
    return
  }

  if (!requireGatewayToken(req)) {
    json(res, 401, { error: 'INVALID_ACCESS_TOKEN' })
    return
  }

  try {
    const body = parseBody(req)
    const bodySize = Buffer.byteLength(JSON.stringify(body), 'utf8')
    if (bodySize > 16000) {
      json(res, 413, { error: 'REQUEST_TOO_LARGE' })
      return
    }

    const result = await generateInquiry({
      providerId: String(body.provider || ''),
      input: body.input,
    })

    json(res, 200, {
      ...result,
      generatedAt: new Date().toISOString(),
    })
  } catch (error) {
    const code = publicError(error)
    const status =
      code === 'PROVIDER_NOT_CONFIGURED' || code === 'UNKNOWN_PROVIDER'
        ? 400
        : code === 'QUESTION_TOO_SHORT' || code === 'POSITION_TOO_SHORT'
          ? 422
          : code === 'PROVIDER_TIMEOUT'
            ? 504
            : 502

    json(res, status, {
      error: code,
      message:
        code === 'PROVIDER_REQUEST_FAILED'
          ? '模型供应商暂时拒绝或无法完成请求。'
          : 'AI 追问生成失败，本地追问仍然可用。',
    })
  }
}
