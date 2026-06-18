const PROVIDERS = {
  openai: {
    label: 'OpenAI',
    keyEnv: 'OPENAI_API_KEY',
    modelEnv: 'OPENAI_MODEL',
    defaultModel: 'gpt-5-mini',
    kind: 'openai-responses',
    endpoint: 'https://api.openai.com/v1/responses',
  },
  anthropic: {
    label: 'Anthropic Claude',
    keyEnv: 'ANTHROPIC_API_KEY',
    modelEnv: 'ANTHROPIC_MODEL',
    defaultModel: 'claude-sonnet-4-20250514',
    kind: 'anthropic-messages',
    endpoint: 'https://api.anthropic.com/v1/messages',
  },
  gemini: {
    label: 'Google Gemini',
    keyEnv: 'GEMINI_API_KEY',
    modelEnv: 'GEMINI_MODEL',
    defaultModel: 'gemini-3-flash',
    kind: 'gemini-content',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models',
  },
  deepseek: {
    label: 'DeepSeek',
    keyEnv: 'DEEPSEEK_API_KEY',
    modelEnv: 'DEEPSEEK_MODEL',
    defaultModel: 'deepseek-v4-flash',
    kind: 'openai-compatible',
    endpoint: 'https://api.deepseek.com/chat/completions',
  },
  qwen: {
    label: 'Qwen · 阿里云百炼',
    keyEnv: 'DASHSCOPE_API_KEY',
    modelEnv: 'QWEN_MODEL',
    defaultModel: 'qwen3.5-flash',
    kind: 'openai-compatible',
    endpoint: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
  },
  kimi: {
    label: 'Kimi · Moonshot',
    keyEnv: 'MOONSHOT_API_KEY',
    modelEnv: 'KIMI_MODEL',
    defaultModel: 'kimi-k2.5',
    kind: 'openai-compatible',
    endpoint: 'https://api.moonshot.cn/v1/chat/completions',
  },
  xai: {
    label: 'xAI Grok',
    keyEnv: 'XAI_API_KEY',
    modelEnv: 'XAI_MODEL',
    defaultModel: 'grok-4.20-reasoning',
    kind: 'openai-compatible',
    endpoint: 'https://api.x.ai/v1/chat/completions',
  },
}

const ALLOWED_DIMENSIONS = new Set([
  'definition',
  'evidence',
  'falsification',
  'opposition',
  'values',
  'consequence',
  'agency',
  'experiment',
])

const SYSTEM_PROMPT = `You generate questions for Socratic Kernel, a cognitive-autonomy practice tool.

Rules:
- Never decide for the user and never provide a final life conclusion.
- Challenge reasoning without diagnosing personality or mental health.
- Ask concrete, non-repetitive questions that test definitions, evidence, falsifiability, the strongest opposing view, values, consequences, agency, and reversible experiments.
- Preserve the user's language.
- Do not flatter, moralize, imitate a philosopher, or claim certainty.
- Return valid JSON only, with no markdown fences or prose outside JSON.

Required JSON shape:
{
  "questions": [
    {
      "dimension": "definition|evidence|falsification|opposition|values|consequence|agency|experiment",
      "text": "question text",
      "reason": "one short sentence explaining what this question checks"
    }
  ],
  "summary": "one short neutral description of the reasoning tension",
  "warnings": ["optional short caution"]
}`

function cleanText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength)
}

export function normalizeInput(raw = {}) {
  const challenge = Number(raw.challenge)
  const normalized = {
    mode: cleanText(raw.mode, 30),
    question: cleanText(raw.question, 1600),
    position: cleanText(raw.position, 2400),
    evidence: cleanText(raw.evidence, 3200),
    confidence: Math.max(0, Math.min(100, Number(raw.confidence) || 0)),
    challenge: [1, 2, 3].includes(challenge) ? challenge : 2,
  }

  if (normalized.question.length < 8) throw new Error('QUESTION_TOO_SHORT')
  if (normalized.position.length < 8) throw new Error('POSITION_TOO_SHORT')
  return normalized
}

export function listEnabledProviders(env = process.env) {
  return Object.entries(PROVIDERS)
    .filter(([, config]) => Boolean(env[config.keyEnv]))
    .map(([id, config]) => ({
      id,
      label: config.label,
      model: env[config.modelEnv] || config.defaultModel,
    }))
}

function getProvider(providerId, env = process.env) {
  const config = PROVIDERS[providerId]
  if (!config) throw new Error('UNKNOWN_PROVIDER')
  const apiKey = env[config.keyEnv]
  if (!apiKey) throw new Error('PROVIDER_NOT_CONFIGURED')
  return {
    ...config,
    id: providerId,
    apiKey,
    model: env[config.modelEnv] || config.defaultModel,
    endpoint: env[`${providerId.toUpperCase()}_BASE_URL`] || config.endpoint,
  }
}

function buildUserPrompt(input) {
  const targetCount = input.challenge === 1 ? 4 : input.challenge === 3 ? 7 : 6
  return JSON.stringify(
    {
      task: `Generate exactly ${targetCount} Socratic questions.`,
      inquiry: input,
      constraints: {
        targetCount,
        preserveLanguage: true,
        noFinalAnswer: true,
        noDiagnosis: true,
      },
    },
    null,
    2,
  )
}

async function requestJson(url, options, timeoutMs = 45000) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    const raw = await response.text()
    let data
    try {
      data = raw ? JSON.parse(raw) : {}
    } catch {
      data = { raw }
    }
    if (!response.ok) {
      const error = new Error('PROVIDER_REQUEST_FAILED')
      error.status = response.status
      error.providerMessage = cleanText(
        data?.error?.message || data?.message || data?.raw || response.statusText,
        300,
      )
      throw error
    }
    return data
  } finally {
    clearTimeout(timer)
  }
}

function extractOpenAIText(data) {
  if (typeof data.output_text === 'string') return data.output_text
  return (data.output || [])
    .flatMap((item) => item.content || [])
    .filter((part) => part.type === 'output_text' || typeof part.text === 'string')
    .map((part) => part.text || '')
    .join('')
}

function extractAnthropicText(data) {
  return (data.content || [])
    .filter((part) => part.type === 'text')
    .map((part) => part.text || '')
    .join('')
}

function extractGeminiText(data) {
  return (data.candidates?.[0]?.content?.parts || [])
    .map((part) => part.text || '')
    .join('')
}

function extractCompatibleText(data) {
  const content = data.choices?.[0]?.message?.content
  if (typeof content === 'string') return content
  if (Array.isArray(content)) return content.map((part) => part.text || '').join('')
  return ''
}

async function callProvider(provider, input) {
  const prompt = buildUserPrompt(input)

  if (provider.kind === 'openai-responses') {
    const data = await requestJson(provider.endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${provider.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: provider.model,
        instructions: SYSTEM_PROMPT,
        input: prompt,
        max_output_tokens: 1800,
      }),
    })
    return extractOpenAIText(data)
  }

  if (provider.kind === 'anthropic-messages') {
    const data = await requestJson(provider.endpoint, {
      method: 'POST',
      headers: {
        'x-api-key': provider.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: provider.model,
        max_tokens: 1800,
        temperature: 0.2,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    return extractAnthropicText(data)
  }

  if (provider.kind === 'gemini-content') {
    const endpoint = `${provider.endpoint}/${encodeURIComponent(provider.model)}:generateContent?key=${encodeURIComponent(provider.apiKey)}`
    const data = await requestJson(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 1800,
          responseMimeType: 'application/json',
        },
      }),
    })
    return extractGeminiText(data)
  }

  const data = await requestJson(provider.endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${provider.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: provider.model,
      temperature: 0.2,
      max_tokens: 1800,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt },
      ],
    }),
  })
  return extractCompatibleText(data)
}

function parseModelJson(text) {
  const trimmed = String(text || '').trim()
  const withoutFence = trimmed.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '')
  try {
    return JSON.parse(withoutFence)
  } catch {
    const start = withoutFence.indexOf('{')
    const end = withoutFence.lastIndexOf('}')
    if (start >= 0 && end > start) return JSON.parse(withoutFence.slice(start, end + 1))
    throw new Error('INVALID_MODEL_JSON')
  }
}

function normalizeOutput(raw, targetCount) {
  const questions = Array.isArray(raw?.questions) ? raw.questions : []
  const normalized = questions
    .map((question) => ({
      dimension: ALLOWED_DIMENSIONS.has(question?.dimension) ? question.dimension : 'evidence',
      text: cleanText(question?.text, 900),
      reason: cleanText(question?.reason, 240),
    }))
    .filter((question) => question.text.length >= 8)
    .slice(0, targetCount)

  if (normalized.length < Math.min(4, targetCount)) throw new Error('INSUFFICIENT_MODEL_QUESTIONS')

  return {
    questions: normalized,
    summary: cleanText(raw?.summary, 500),
    warnings: Array.isArray(raw?.warnings)
      ? raw.warnings.map((warning) => cleanText(warning, 240)).filter(Boolean).slice(0, 4)
      : [],
  }
}

export async function generateInquiry({ providerId, input, env = process.env }) {
  const normalizedInput = normalizeInput(input)
  const provider = getProvider(providerId, env)
  const rawText = await callProvider(provider, normalizedInput)
  const targetCount = normalizedInput.challenge === 1 ? 4 : normalizedInput.challenge === 3 ? 7 : 6
  const output = normalizeOutput(parseModelJson(rawText), targetCount)
  return {
    ...output,
    provider: provider.id,
    providerLabel: provider.label,
    model: provider.model,
  }
}
