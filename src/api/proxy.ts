/**
 * CORS 代理配置
 *
 * 部分学术 API 不支持浏览器直接跨域访问，需要通过 Cloudflare Worker 代理。
 * 本模块提供代理 URL 拼接、域名白名单判断，以及新旧两种代理协议的自动容错请求。
 *
 * 两种代理协议：
 * - 新版：PROXY_BASE_URL + "?url=" + encodeURIComponent(原始 URL)
 * - 旧版：PROXY_BASE_URL + encodeURIComponent(原始 URL)（路径形式）
 * proxyGet 会先按新版协议请求，失败时自动降级为旧版协议重试，
 * 因此无论线上 Worker 部署的是哪个版本，请求都能正常工作。
 */

import axios from 'axios'
import type { AxiosRequestConfig } from 'axios'

/** 代理 Worker 基础地址，后续可通过环境变量或配置文件修改 */
const PROXY_BASE_URL = 'https://scholar-proxy.workers.dev/'

/**
 * 需要 CORS 代理的域名白名单。
 * 请求这些域名时，浏览器会受到 CORS 限制，必须走代理。
 */
const PROXY_DOMAINS: readonly string[] = [
  'api.semanticscholar.org',
  'export.arxiv.org',
]

/**
 * 判断给定 URL 是否需要通过 CORS 代理访问。
 *
 * @param url - 原始请求 URL
 * @returns 如果目标域名在白名单中则返回 true
 */
export function needsProxy(url: string): boolean {
  try {
    const { hostname } = new URL(url)
    return PROXY_DOMAINS.some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
    )
  } catch {
    return false
  }
}

/** 新版代理协议：?url= 查询参数形式 */
export function proxyFetch(url: string): string {
  if (!needsProxy(url)) {
    return url
  }
  return `${PROXY_BASE_URL}?url=${encodeURIComponent(url)}`
}

/** 旧版代理协议：路径拼接形式 */
function proxyFetchLegacy(url: string): string {
  return `${PROXY_BASE_URL}${encodeURIComponent(url)}`
}

/**
 * 判断一次失败的请求是否值得用旧协议重试。
 * 网络层失败（Worker 不可达、CORS 拒绝）与 400/404/405/5xx
 * （旧版 Worker 不认识新协议参数的典型响应）重试；
 * 429（上游限流）与 403（域名白名单拒绝）重试没有意义。
 */
function shouldFallback(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false
  if (!error.response) return true
  const status = error.response.status
  return status === 400 || status === 404 || status === 405 || status >= 500
}

/**
 * 发起 GET 请求：白名单外的 URL 直连；白名单内的 URL 走代理，
 * 并在新协议失败时自动降级旧协议。
 *
 * @param url - 原始请求 URL
 * @param config - axios 配置（headers、responseType 等）
 * @returns 响应数据（response.data）
 */
export async function proxyGet<T = unknown>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  if (!needsProxy(url)) {
    const response = await axios.get<T>(url, config)
    return response.data
  }
  try {
    const response = await axios.get<T>(proxyFetch(url), config)
    return response.data
  } catch (error) {
    if (!shouldFallback(error)) throw error
    const response = await axios.get<T>(proxyFetchLegacy(url), config)
    return response.data
  }
}
