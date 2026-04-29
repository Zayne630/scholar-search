const ALLOWED_HOSTS = [
  'api.semanticscholar.org',
  'export.arxiv.org'
]

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, x-api-key',
  'Access-Control-Max-Age': '86400',
}

function isAllowed(url: URL): boolean {
  return ALLOWED_HOSTS.includes(url.hostname)
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS })
    }

    const url = new URL(request.url)
    const targetUrl = url.searchParams.get('url')

    if (!targetUrl) {
      return new Response('Missing "url" query parameter', {
        status: 400,
        headers: CORS_HEADERS,
      })
    }

    let target: URL
    try {
      target = new URL(targetUrl)
    } catch {
      return new Response('Invalid URL', {
        status: 400,
        headers: CORS_HEADERS,
      })
    }

    if (!isAllowed(target)) {
      return new Response(`Host "${target.hostname}" is not allowed`, {
        status: 403,
        headers: CORS_HEADERS,
      })
    }

    const headers = new Headers()
    if (request.headers.has('x-api-key')) {
      headers.set('x-api-key', request.headers.get('x-api-key')!)
    }

    try {
      const response = await fetch(target.toString(), {
        method: request.method,
        headers,
      })

      const body = await response.text()
      return new Response(body, {
        status: response.status,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': response.headers.get('Content-Type') || 'application/json',
          'Cache-Control': 'public, max-age=300',
        },
      })
    } catch (err: unknown) {
      return new Response(`Proxy error: ${(err as Error).message}`, {
        status: 502,
        headers: CORS_HEADERS,
      })
    }
  },
}
