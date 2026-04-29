/**
 * 多翻译服务封装
 *
 * 支持 AI / Google / DeepL / 百度 / MyMemory 五种翻译引擎。
 * 统一入口 translateText()，根据 TranslationConfig.service 分发到对应引擎。
 */

import { chat } from './llm'
import type { LLMProvider } from './llm'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TranslationService = 'ai' | 'mymemory'

export interface TranslationConfig {
  service: TranslationService
  // AI 翻译复用 LLM 配置
  llmProvider?: string
  llmApiKey?: string
  llmModel?: string
  // DeepL
  deeplApiKey?: string
  // 百度翻译
  baiduAppId?: string
  baiduSecretKey?: string
}

// ---------------------------------------------------------------------------
// Helper: 按句子分段翻译长文本
// ---------------------------------------------------------------------------

async function translateInSegments(
  text: string,
  segmentFn: (segment: string) => Promise<string>,
  maxSegmentLength: number = 800,
): Promise<string> {
  if (text.length <= maxSegmentLength) {
    return segmentFn(text)
  }

  // 按句子分段
  const sentences = text.split(/(?<=[.!?])\s+/)
  const segments: string[] = []
  let current = ''

  for (const sentence of sentences) {
    if ((current + ' ' + sentence).length > maxSegmentLength && current) {
      segments.push(current.trim())
      current = sentence
    } else {
      current = current ? current + ' ' + sentence : sentence
    }
  }
  if (current.trim()) segments.push(current.trim())

  const results = await Promise.all(segments.map(segmentFn))
  return results.join(' ')
}

// ---------------------------------------------------------------------------
// 有道翻译（免费，无需 Key，国内可访问）
// ---------------------------------------------------------------------------

async function translateYoudao(text: string): Promise<string> {
  async function translateSegment(segment: string): Promise<string> {
    // 有道翻译词典接口，免费无需 Key
    const url = `https://dict.youdao.com/suggest?num=1&doctype=json&q=${encodeURIComponent(segment)}&le=en`
    // 有道的 suggest 接口只适合单词，改用 translateapi
    const transUrl = `https://translate.youdao.com/translate?&doctype=json&type=EN2ZH_CN&i=${encodeURIComponent(segment)}`
    const response = await fetch(transUrl)
    if (!response.ok) {
      throw new Error(`Youdao Translate error ${response.status}`)
    }
    const data = await response.json()
    // 有道返回格式: { translateResult: [[{ tgt: "翻译结果" }]] }
    const parts: string[] = []
    if (data.translateResult && Array.isArray(data.translateResult)) {
      for (const row of data.translateResult) {
        if (Array.isArray(row)) {
          for (const item of row) {
            if (item.tgt) parts.push(item.tgt)
          }
        }
      }
    }
    if (parts.length === 0) {
      throw new Error('Youdao Translate returned empty result')
    }
    return parts.join('')
  }

  return translateInSegments(text, translateSegment, 800)
}

// ---------------------------------------------------------------------------
// Google 翻译（免费，无需 Key，国内可能无法访问）
// ---------------------------------------------------------------------------

async function translateGoogle(text: string): Promise<string> {
  async function translateSegment(segment: string): Promise<string> {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(segment)}`
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Google Translate error ${response.status}`)
    }
    const data = await response.json()
    const parts: string[] = []
    if (Array.isArray(data)) {
      for (const item of data) {
        if (Array.isArray(item) && typeof item[0] === 'string') {
          parts.push(item[0])
        }
      }
    }
    if (parts.length === 0) {
      throw new Error('Google Translate returned empty result')
    }
    return parts.join('')
  }

  return translateInSegments(text, translateSegment, 800)
}

// ---------------------------------------------------------------------------
// DeepL（需 API Key）
// ---------------------------------------------------------------------------

async function translateDeepL(text: string, apiKey: string): Promise<string> {
  if (!apiKey) throw new Error('DeepL API Key is required')

  // 判断使用免费版还是付费版端点
  const isFreeKey = apiKey.endsWith(':fx')
  const endpoint = isFreeKey
    ? 'https://api-free.deepl.com/v2/translate'
    : 'https://api.deepl.com/v2/translate'

  async function translateSegment(segment: string): Promise<string> {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        auth_key: apiKey,
        text: segment,
        target_lang: 'ZH',
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`DeepL API error ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    return data.translations?.[0]?.text ?? ''
  }

  return translateInSegments(text, translateSegment, 1000)
}

// ---------------------------------------------------------------------------
// 百度翻译（需 App ID + Secret Key）
// ---------------------------------------------------------------------------

async function translateBaidu(
  text: string,
  appId: string,
  secretKey: string,
): Promise<string> {
  if (!appId || !secretKey) throw new Error('Baidu App ID and Secret Key are required')

  async function translateSegment(segment: string): Promise<string> {
    const salt = String(Math.random())
    // 签名: MD5(appid + text + salt + secretKey)
    const signRaw = `${appId}${segment}${salt}${secretKey}`
    // 使用 Web Crypto API 计算 MD5 不直接支持，使用简单的 hash 替代
    // 百度要求 MD5，我们用 SubtleCrypto 不支持 MD5，这里用 fetch-friendly 方式
    const sign = await md5Hex(signRaw)

    const params = new URLSearchParams({
      q: segment,
      from: 'en',
      to: 'zh',
      appid: appId,
      salt,
      sign,
    })

    const response = await fetch(`https://fanyi-api.baidu.com/api/trans/vip/translate?${params}`)
    const data = await response.json()

    if (data.error_code) {
      throw new Error(`Baidu API error ${data.error_code}: ${data.error_msg}`)
    }

    const parts: string[] = (data.trans_result ?? []).map((r: { dst: string }) => r.dst)
    return parts.join('')
  }

  return translateInSegments(text, translateSegment, 500)
}

/**
 * 简易 MD5 实现（浏览器端无 crypto.subtle MD5 支持）
 * 用于百度翻译签名
 */
async function md5Hex(str: string): Promise<string> {
  // 使用 crypto.subtle 的 SHA-256 不行，百度要求 MD5
  // 这里使用一个轻量级纯 JS MD5 实现
  const encoder = new TextEncoder()
  const bytes = encoder.encode(str)
  return md5(bytes)
}

/**
 * 纯 JS MD5 实现
 * Based on RFC 1321
 */
function md5(input: Uint8Array): string {
  function safeAdd(x: number, y: number): number {
    const lsw = (x & 0xffff) + (y & 0xffff)
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16)
    return (msw << 16) | (lsw & 0xffff)
  }

  function bitRotateLeft(num: number, cnt: number): number {
    return (num << cnt) | (num >>> (32 - cnt))
  }

  function md5cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b)
  }

  function md5ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t)
  }

  function md5gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t)
  }

  function md5hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn(b ^ c ^ d, a, b, x, s, t)
  }

  function md5ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t)
  }

  function binlMD5(x: number[], len: number): number[] {
    x[len >> 5] |= 0x80 << (len % 32)
    x[(((len + 64) >>> 9) << 4) + 14] = len

    let a = 1732584193
    let b = -271733879
    let c = -1732584194
    let d = 271733878

    for (let i = 0; i < x.length; i += 16) {
      const olda = a, oldb = b, oldc = c, oldd = d

      a = md5ff(a, b, c, d, x[i] || 0, 7, -680876936)
      d = md5ff(d, a, b, c, x[i + 1] || 0, 12, -389564586)
      c = md5ff(c, d, a, b, x[i + 2] || 0, 17, 606105819)
      b = md5ff(b, c, d, a, x[i + 3] || 0, 22, -1044525330)
      a = md5ff(a, b, c, d, x[i + 4] || 0, 7, -176418897)
      d = md5ff(d, a, b, c, x[i + 5] || 0, 12, 1200080426)
      c = md5ff(c, d, a, b, x[i + 6] || 0, 17, -1473231341)
      b = md5ff(b, c, d, a, x[i + 7] || 0, 22, -45705983)
      a = md5ff(a, b, c, d, x[i + 8] || 0, 7, 1770035416)
      d = md5ff(d, a, b, c, x[i + 9] || 0, 12, -1958414417)
      c = md5ff(c, d, a, b, x[i + 10] || 0, 17, -42063)
      b = md5ff(b, c, d, a, x[i + 11] || 0, 22, -1990404162)
      a = md5ff(a, b, c, d, x[i + 12] || 0, 7, 1804603682)
      d = md5ff(d, a, b, c, x[i + 13] || 0, 12, -40341101)
      c = md5ff(c, d, a, b, x[i + 14] || 0, 17, -1502002290)
      b = md5ff(b, c, d, a, x[i + 15] || 0, 22, 1236535329)

      a = md5gg(a, b, c, d, x[i + 1] || 0, 5, -165796510)
      d = md5gg(d, a, b, c, x[i + 6] || 0, 9, -1069501632)
      c = md5gg(c, d, a, b, x[i + 11] || 0, 14, 643717713)
      b = md5gg(b, c, d, a, x[i] || 0, 20, -373897302)
      a = md5gg(a, b, c, d, x[i + 5] || 0, 5, -701558691)
      d = md5gg(d, a, b, c, x[i + 10] || 0, 9, 38016083)
      c = md5gg(c, d, a, b, x[i + 15] || 0, 14, -660478335)
      b = md5gg(b, c, d, a, x[i + 4] || 0, 20, -405537848)
      a = md5gg(a, b, c, d, x[i + 9] || 0, 5, 568446438)
      d = md5gg(d, a, b, c, x[i + 14] || 0, 9, -1019803690)
      c = md5gg(c, d, a, b, x[i + 3] || 0, 14, -187363961)
      b = md5gg(b, c, d, a, x[i + 8] || 0, 20, 1163531501)
      a = md5gg(a, b, c, d, x[i + 13] || 0, 5, -1444681467)
      d = md5gg(d, a, b, c, x[i + 2] || 0, 9, -51403784)
      c = md5gg(c, d, a, b, x[i + 7] || 0, 14, 1735328473)
      b = md5gg(b, c, d, a, x[i + 12] || 0, 20, -1926607734)

      a = md5hh(a, b, c, d, x[i + 5] || 0, 4, -378558)
      d = md5hh(d, a, b, c, x[i + 8] || 0, 11, -2022574463)
      c = md5hh(c, d, a, b, x[i + 11] || 0, 16, 1839030562)
      b = md5hh(b, c, d, a, x[i + 14] || 0, 23, -35309556)
      a = md5hh(a, b, c, d, x[i + 1] || 0, 4, -1530992060)
      d = md5hh(d, a, b, c, x[i + 4] || 0, 11, 1272893353)
      c = md5hh(c, d, a, b, x[i + 7] || 0, 16, -155497632)
      b = md5hh(b, c, d, a, x[i + 10] || 0, 23, -1094730640)
      a = md5hh(a, b, c, d, x[i + 13] || 0, 4, 681279174)
      d = md5hh(d, a, b, c, x[i] || 0, 11, -358537222)
      c = md5hh(c, d, a, b, x[i + 3] || 0, 16, -722521979)
      b = md5hh(b, c, d, a, x[i + 6] || 0, 23, 76029189)
      a = md5hh(a, b, c, d, x[i + 9] || 0, 4, -640364487)
      d = md5hh(d, a, b, c, x[i + 12] || 0, 11, -421815835)
      c = md5hh(c, d, a, b, x[i + 15] || 0, 16, 530742520)
      b = md5hh(b, c, d, a, x[i + 2] || 0, 23, -995338651)

      a = md5ii(a, b, c, d, x[i] || 0, 6, -198630844)
      d = md5ii(d, a, b, c, x[i + 7] || 0, 10, 1126891415)
      c = md5ii(c, d, a, b, x[i + 14] || 0, 15, -1416354905)
      b = md5ii(b, c, d, a, x[i + 5] || 0, 21, -57434055)
      a = md5ii(a, b, c, d, x[i + 12] || 0, 6, 1700485571)
      d = md5ii(d, a, b, c, x[i + 3] || 0, 10, -1894986606)
      c = md5ii(c, d, a, b, x[i + 10] || 0, 15, -1051523)
      b = md5ii(b, c, d, a, x[i + 1] || 0, 21, -2054922799)
      a = md5ii(a, b, c, d, x[i + 8] || 0, 6, 1873313359)
      d = md5ii(d, a, b, c, x[i + 15] || 0, 10, -30611744)
      c = md5ii(c, d, a, b, x[i + 6] || 0, 15, -1560198380)
      b = md5ii(b, c, d, a, x[i + 13] || 0, 21, 1309151649)
      a = md5ii(a, b, c, d, x[i + 4] || 0, 6, -145523070)
      d = md5ii(d, a, b, c, x[i + 11] || 0, 10, -1120210379)
      c = md5ii(c, d, a, b, x[i + 2] || 0, 15, 718787259)
      b = md5ii(b, c, d, a, x[i + 9] || 0, 21, -343485551)

      a = safeAdd(a, olda)
      b = safeAdd(b, oldb)
      c = safeAdd(c, oldc)
      d = safeAdd(d, oldd)
    }

    return [a, b, c, d]
  }

  function binl2rstr(input: number[]): Uint8Array {
    const output = new Uint8Array(input.length * 4)
    for (let i = 0; i < input.length * 32; i += 8) {
      output[i >> 3] = (input[i >> 5] >>> (i % 32)) & 0xff
    }
    return output
  }

  function rstr2binl(input: Uint8Array): number[] {
    const output: number[] = []
    for (let i = 0; i < input.length * 8; i += 32) {
      output[i >> 5] = 0
    }
    for (let i = 0; i < input.length * 8; i += 8) {
      output[i >> 5] |= (input[i / 8] & 0xff) << (i % 32)
    }
    return output
  }

  function rstrMD5(s: Uint8Array): Uint8Array {
    return binl2rstr(binlMD5(rstr2binl(s), s.length * 8))
  }

  function rstr2hex(input: Uint8Array): string {
    const hexTab = '0123456789abcdef'
    let output = ''
    for (let i = 0; i < input.length; i++) {
      const x = input[i]
      output += hexTab.charAt((x >>> 4) & 0x0f) + hexTab.charAt(x & 0x0f)
    }
    return output
  }

  return rstr2hex(rstrMD5(input))
}

// ---------------------------------------------------------------------------
// MyMemory（免费保底）
// ---------------------------------------------------------------------------

async function translateMyMemory(text: string): Promise<string> {
  async function translateSegment(segment: string): Promise<string> {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(segment)}&langpair=en|zh-CN`
    const response = await fetch(url)
    const data = await response.json()
    return data.responseData?.translatedText ?? ''
  }

  return translateInSegments(text, translateSegment, 500)
}

// ---------------------------------------------------------------------------
// AI 翻译（复用 LLM 配置）
// ---------------------------------------------------------------------------

async function translateAI(
  text: string,
  llmProvider?: string,
  llmApiKey?: string,
  llmModel?: string,
): Promise<string> {
  if (!llmProvider || !llmApiKey) {
    throw new Error('AI translation requires LLM provider and API key to be configured')
  }

  const result = await chat(
    {
      provider: llmProvider as LLMProvider,
      apiKey: llmApiKey,
      model: llmModel || undefined,
    },
    [
      {
        role: 'system',
        content: '你是学术翻译专家。将以下英文学术摘要翻译为中文，要求：\n1. 保持学术术语的准确性\n2. 翻译完整，不要遗漏任何内容\n3. 语言流畅自然',
      },
      {
        role: 'user',
        content: `摘要：\n${text}`,
      },
    ],
  )
  return result
}

// ---------------------------------------------------------------------------
// 统一入口
// ---------------------------------------------------------------------------

/**
 * 统一翻译入口
 *
 * 根据 config.service 分发到对应翻译引擎。
 *
 * @param text - 待翻译文本（英文学术摘要）
 * @param config - 翻译服务配置
 * @returns 翻译后的中文文本
 */
export async function translateText(
  text: string,
  config: TranslationConfig,
): Promise<string> {
  switch (config.service) {
    case 'ai':
      return translateAI(text, config.llmProvider, config.llmApiKey, config.llmModel)

    case 'mymemory':
      return translateMyMemory(text)

    default:
      // 如果未配置翻译服务，优先 AI，fallback 到 MyMemory
      if (config.llmProvider && config.llmApiKey) {
        return translateAI(text, config.llmProvider, config.llmApiKey, config.llmModel)
      }
      return translateMyMemory(text)
  }
}
