import { listEnabledProviders } from '../lib/ai-gateway.js'
import { applyCors, json } from '../lib/http.js'

export default function handler(req, res) {
  if (!applyCors(req, res)) {
    json(res, 403, { error: 'ORIGIN_NOT_ALLOWED' })
    return
  }

  if (req.method === 'OPTIONS') {
    res.statusCode = 204
    res.end()
    return
  }

  if (req.method !== 'GET') {
    json(res, 405, { error: 'METHOD_NOT_ALLOWED' })
    return
  }

  json(res, 200, {
    gatewayVersion: 1,
    providers: listEnabledProviders(),
    requiresAccessToken: Boolean(process.env.AI_GATEWAY_TOKEN),
    privacy: {
      serverKeysOnly: true,
      sendsHistoryByDefault: false,
      sendsAnswersByDefault: false,
    },
  })
}
