/**
 * CORS 代理配置
 *
 * 部分学术 API 不支持浏览器直接跨域访问，需要通过 Cloudflare Worker 代理。
 * 本模块提供代理 URL 拼接和域名白名单判断。
 */

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

/**
 * 根据需要为 URL 添加 CORS 代理前缀。
 *
 * 如果 URL 所在域名在白名单中，返回拼接了代理前缀的 URL；
 * 否则原样返回，直接请求。
 *
 * @param url - 原始请求 URL
 * @returns 可直接用于 fetch/axios 的 URL
 */
export function proxyFetch(url: string): string {
  if (!needsProxy(url)) {
    return url
  }
  // 代理 Worker 的路径规则：PROXY_BASE_URL + 编码后的原始 URL
  return `${PROXY_BASE_URL}${encodeURIComponent(url)}`
}
