/**
 * LLM API 封装
 *
 * 支持 DeepSeek / Gemini / OpenAI / 通义千问 / 智谱GLM / Kimi / 豆包 / Claude / Groq / 硅基流动
 * 等 provider 的 chat 和 streaming chat。
 *
 * 大部分国内模型兼容 OpenAI API 格式，只需改 base URL。
 * Claude (Anthropic) 使用自己的 API 格式。
 */

export type LLMProvider =
  | 'deepseek'
  | 'gemini'
  | 'openai'
  | 'qwen'        // 通义千问 (阿里)
  | 'glm'         // 智谱 GLM
  | 'moonshot'    // 月之暗面 Kimi
  | 'doubao'      // 豆包 (字节跳动)
  | 'claude'      // Anthropic Claude
  | 'groq'        // Groq (超快推理)
  | 'siliconflow' // 硅基流动

export interface LLMConfig {
  provider: LLMProvider
  apiKey: string
  model?: string
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// ---------------------------------------------------------------------------
// Default models per provider
// ---------------------------------------------------------------------------

export const DEFAULT_MODELS: Record<LLMProvider, string> = {
  deepseek:    'deepseek-chat',
  gemini:      'gemini-2.0-flash',
  openai:      'gpt-4o-mini',
  qwen:        'qwen-turbo',
  glm:         'glm-4-flash',
  moonshot:    'moonshot-v1-8k',
  doubao:      'doubao-pro-32k',
  claude:      'claude-sonnet-4-20250514',
  groq:        'llama-3.3-70b-versatile',
  siliconflow: 'deepseek-ai/DeepSeek-V3',
}

// ---------------------------------------------------------------------------
// OpenAI-compatible providers config
// ---------------------------------------------------------------------------

export const OPENAI_COMPATIBLE: Record<string, { baseUrl: string; defaultModel: string; corsSupported: boolean }> = {
  deepseek:    { baseUrl: 'https://api.deepseek.com',                             defaultModel: 'deepseek-chat',           corsSupported: true },
  openai:      { baseUrl: 'https://api.openai.com/v1',                            defaultModel: 'gpt-4o-mini',              corsSupported: false },
  qwen:        { baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',   defaultModel: 'qwen-turbo',              corsSupported: true },
  glm:         { baseUrl: 'https://open.bigmodel.cn/api/paas/v4',                defaultModel: 'glm-4-flash',             corsSupported: true },
  moonshot:    { baseUrl: 'https://api.moonshot.cn/v1',                           defaultModel: 'moonshot-v1-8k',          corsSupported: true },
  doubao:      { baseUrl: 'https://ark.cn-beijing.volces.com/api/v3',            defaultModel: 'doubao-pro-32k',          corsSupported: true },
  groq:        { baseUrl: 'https://api.groq.com/openai/v1',                      defaultModel: 'llama-3.3-70b-versatile', corsSupported: true },
  siliconflow: { baseUrl: 'https://api.siliconflow.cn/v1',                       defaultModel: 'deepseek-ai/DeepSeek-V3', corsSupported: true },
}

// ---------------------------------------------------------------------------
// OpenAI-compatible chat
// ---------------------------------------------------------------------------

interface OpenAIChatChoice {
  message: { content: string }
}

interface OpenAIChatResponse {
  choices: OpenAIChatChoice[]
}

async function openaiChat(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: LLMMessage[],
): Promise<string> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`API error ${response.status}: ${text}`)
  }

  const data: OpenAIChatResponse = await response.json()
  return data.choices[0]?.message?.content ?? ''
}

// ---------------------------------------------------------------------------
// Claude (Anthropic) chat
// ---------------------------------------------------------------------------

interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ClaudeResponse {
  content?: Array<{ type: string; text: string }>
}

async function claudeChat(
  apiKey: string,
  model: string,
  messages: LLMMessage[],
): Promise<string> {
  // Separate system message from conversation messages
  let systemPrompt: string | undefined
  const claudeMessages: ClaudeMessage[] = []

  for (const msg of messages) {
    if (msg.role === 'system') {
      systemPrompt = msg.content
    } else {
      claudeMessages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      })
    }
  }

  const body: Record<string, unknown> = {
    model,
    messages: claudeMessages,
    max_tokens: 4096,
  }

  if (systemPrompt) {
    body.system = systemPrompt
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Claude API error ${response.status}: ${text}`)
  }

  const data: ClaudeResponse = await response.json()
  return data.content?.[0]?.text ?? ''
}

// ---------------------------------------------------------------------------
// Gemini chat
// ---------------------------------------------------------------------------

interface GeminiContent {
  role: 'user' | 'model'
  parts: Array<{ text: string }>
}

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{ text: string }>
    }
  }>
}

function messagesToGeminiContents(messages: LLMMessage[]): {
  systemInstruction?: { parts: Array<{ text: string }> }
  contents: GeminiContent[]
} {
  let systemInstruction: { parts: Array<{ text: string }> } | undefined
  const contents: GeminiContent[] = []

  for (const msg of messages) {
    if (msg.role === 'system') {
      systemInstruction = { parts: [{ text: msg.content }] }
    } else {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      })
    }
  }

  return { systemInstruction, contents }
}

async function geminiChat(
  apiKey: string,
  model: string,
  messages: LLMMessage[],
): Promise<string> {
  const { systemInstruction, contents } = messagesToGeminiContents(messages)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...(systemInstruction ? { systemInstruction } : {}),
      contents,
      generationConfig: { temperature: 0.7 },
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Gemini API error ${response.status}: ${text}`)
  }

  const data: GeminiResponse = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
}

// ---------------------------------------------------------------------------
// Helper: wrap CORS-unsupported providers with a helpful error
// ---------------------------------------------------------------------------

function wrapCorsError(providerName: string, e: unknown): Error {
  const msg = e instanceof Error ? e.message : String(e)
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('CORS')) {
    return new Error(
      `${providerName} API does not support direct browser calls (CORS). ` +
      'Please use a CORS-friendly provider (e.g. DeepSeek, Gemini, Qwen) or set up a CORS proxy.',
    )
  }
  return e instanceof Error ? e : new Error(msg)
}

// ---------------------------------------------------------------------------
// Unified chat
// ---------------------------------------------------------------------------

export async function chat(config: LLMConfig, messages: LLMMessage[]): Promise<string> {
  const model = config.model || DEFAULT_MODELS[config.provider]
  const compat = OPENAI_COMPATIBLE[config.provider]

  if (compat) {
    try {
      return await openaiChat(compat.baseUrl, config.apiKey, model, messages)
    } catch (e: unknown) {
      if (!compat.corsSupported) {
        throw wrapCorsError(config.provider, e)
      }
      throw e
    }
  }

  switch (config.provider) {
    case 'gemini':
      return geminiChat(config.apiKey, model, messages)

    case 'claude':
      try {
        return await claudeChat(config.apiKey, model, messages)
      } catch (e: unknown) {
        throw wrapCorsError('Claude', e)
      }

    default:
      throw new Error(`Unsupported provider: ${config.provider}`)
  }
}

// ---------------------------------------------------------------------------
// Streaming: OpenAI-compatible SSE
// ---------------------------------------------------------------------------

async function openaiStream(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: LLMMessage[],
  onChunk: (text: string) => void,
): Promise<string> {
  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      stream: true,
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`API error ${response.status}: ${text}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let fullText = ''
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    // Keep the last potentially incomplete line in the buffer
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || !trimmed.startsWith('data: ')) continue
      const data = trimmed.slice(6)
      if (data === '[DONE]') continue

      try {
        const parsed = JSON.parse(data)
        const delta = parsed.choices?.[0]?.delta?.content
        if (delta) {
          fullText += delta
          onChunk(fullText)
        }
      } catch {
        // Skip malformed JSON chunks
      }
    }
  }

  return fullText
}

// ---------------------------------------------------------------------------
// Streaming: Claude (Anthropic) SSE
// ---------------------------------------------------------------------------

async function claudeStream(
  apiKey: string,
  model: string,
  messages: LLMMessage[],
  onChunk: (text: string) => void,
): Promise<string> {
  let systemPrompt: string | undefined
  const claudeMessages: ClaudeMessage[] = []

  for (const msg of messages) {
    if (msg.role === 'system') {
      systemPrompt = msg.content
    } else {
      claudeMessages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      })
    }
  }

  const body: Record<string, unknown> = {
    model,
    messages: claudeMessages,
    max_tokens: 4096,
    stream: true,
  }

  if (systemPrompt) {
    body.system = systemPrompt
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Claude API error ${response.status}: ${text}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let fullText = ''
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || !trimmed.startsWith('data: ')) continue
      const data = trimmed.slice(6)

      try {
        const parsed = JSON.parse(data)
        // Claude SSE events have different types; content_block_delta has the text
        if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
          fullText += parsed.delta.text
          onChunk(fullText)
        }
      } catch {
        // Skip malformed JSON chunks
      }
    }
  }

  return fullText
}

// ---------------------------------------------------------------------------
// Streaming: Gemini
// ---------------------------------------------------------------------------

async function geminiStream(
  apiKey: string,
  model: string,
  messages: LLMMessage[],
  onChunk: (text: string) => void,
): Promise<string> {
  const { systemInstruction, contents } = messagesToGeminiContents(messages)
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...(systemInstruction ? { systemInstruction } : {}),
      contents,
      generationConfig: { temperature: 0.7 },
    }),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Gemini API error ${response.status}: ${text}`)
  }

  const reader = response.body?.getReader()
  if (!reader) throw new Error('No response body')

  const decoder = new TextDecoder()
  let fullText = ''
  let buffer = ''

  while (true) {
    const { done, value } = await reader.read()
    if (done) break

    buffer += decoder.decode(value, { stream: true })
    const lines = buffer.split('\n')
    buffer = lines.pop() ?? ''

    for (const line of lines) {
      const trimmed = line.trim()
      if (!trimmed || !trimmed.startsWith('data: ')) continue
      const data = trimmed.slice(6)

      try {
        const parsed = JSON.parse(data)
        const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text
        if (text) {
          fullText += text
          onChunk(fullText)
        }
      } catch {
        // Skip malformed JSON chunks
      }
    }
  }

  return fullText
}

// ---------------------------------------------------------------------------
// Unified streaming chat
// ---------------------------------------------------------------------------

export async function chatStream(
  config: LLMConfig,
  messages: LLMMessage[],
  onChunk: (text: string) => void,
): Promise<string> {
  const model = config.model || DEFAULT_MODELS[config.provider]
  const compat = OPENAI_COMPATIBLE[config.provider]

  if (compat) {
    try {
      return await openaiStream(compat.baseUrl, config.apiKey, model, messages, onChunk)
    } catch (e: unknown) {
      if (!compat.corsSupported) {
        throw wrapCorsError(config.provider, e)
      }
      throw e
    }
  }

  switch (config.provider) {
    case 'gemini':
      return geminiStream(config.apiKey, model, messages, onChunk)

    case 'claude':
      try {
        return await claudeStream(config.apiKey, model, messages, onChunk)
      } catch (e: unknown) {
        throw wrapCorsError('Claude', e)
      }

    default:
      throw new Error(`Unsupported provider: ${config.provider}`)
  }
}

// ---------------------------------------------------------------------------
// Test connection
// ---------------------------------------------------------------------------

export async function testConnection(config: LLMConfig): Promise<boolean> {
  try {
    const result = await chat(config, [
      { role: 'user', content: 'Hi, reply with "OK" only.' },
    ])
    return result.length > 0
  } catch {
    return false
  }
}
