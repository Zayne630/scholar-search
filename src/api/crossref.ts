/**
 * CrossRef API 封装
 *
 * 文档：https://api.crossref.org
 * 支持 CORS，无需代理。
 * 使用 mailto 进入 Polite Pool。
 */

import axios from 'axios'
import type { Paper, Author, SearchResult, SearchFilters } from '../types/paper'

// ---------------------------------------------------------------------------
// 常量
// ---------------------------------------------------------------------------

const BASE_URL = 'https://api.crossref.org'
const MAILTO = 'scholar-search@example.com'
const API_SOURCE = 'crossref'

// ---------------------------------------------------------------------------
// 字段映射：CrossRef Message Item -> Paper
// ---------------------------------------------------------------------------

interface CrossRefAuthor {
  given?: string
  family?: string
  name?: string
  affiliation?: Array<{ name?: string }>
}

interface CrossRefDateParts {
  'date-parts'?: number[][]
}

interface CrossRefItem {
  DOI?: string
  title?: string[]
  author?: CrossRefAuthor[]
  'published-print'?: CrossRefDateParts
  'published-online'?: CrossRefDateParts
  'container-title'?: string[]
  type?: string
  'is-referenced-by-count'?: number
  abstract?: string
  link?: Array<{ 'content-type'?: string; URL?: string }>
  URL?: string
  subject?: string[]
}

function extractYear(item: CrossRefItem): number {
  const dateParts =
    item['published-print']?.['date-parts']?.[0] ??
    item['published-online']?.['date-parts']?.[0]
  return dateParts?.[0] ?? 0
}

function mapItemToPaper(item: CrossRefItem): Paper {
  const authors: Author[] = (item.author ?? []).map((a) => ({
    name: a.name ?? ([a.given, a.family].filter(Boolean).join(' ') || 'Unknown'),
    affiliation: a.affiliation?.[0]?.name,
  }))

  const year = extractYear(item)
  const venue = item['container-title']?.[0] ?? undefined
  const venueType = mapVenueType(item.type)

  // 提取 PDF 链接
  const pdfLink = item.link?.find(
    (l) => l['content-type'] === 'application/pdf',
  )
  const pdfUrl = pdfLink?.URL ?? undefined

  // 清理 CrossRef 摘要中的 JATS 标签
  let abstract = item.abstract
  if (abstract) {
    abstract = abstract
      .replace(/<[^>]+>/g, '')
      .trim()
  }

  return {
    id: item.DOI ?? '',
    title: item.title?.[0] ?? 'Untitled',
    authors,
    year,
    doi: item.DOI,
    abstract: abstract || undefined,
    venue,
    venueType,
    citationCount: item['is-referenced-by-count'] ?? 0,
    pdfUrl,
    url: item.URL ?? (item.DOI ? `https://doi.org/${item.DOI}` : undefined),
    source: [API_SOURCE],
    fieldsOfStudy: item.subject ?? undefined,
    externalIds: {
      doi: item.DOI,
    },
  }
}

function mapVenueType(type?: string): Paper['venueType'] {
  if (!type) return 'unknown'
  const t = type.toLowerCase()
  if (t.includes('journal') || t.includes('article')) return 'journal'
  if (t.includes('proceedings') || t.includes('conference')) return 'conference'
  if (t.includes('preprint') || t.includes('posted-content')) return 'preprint'
  if (t.includes('book')) return 'book'
  return 'unknown'
}

// ---------------------------------------------------------------------------
// 筛选器构建
// ---------------------------------------------------------------------------

function buildCrossRefFilters(filters?: SearchFilters): Record<string, string> {
  const result: Record<string, string> = {}
  if (!filters) return result

  if (filters.yearFrom || filters.yearTo) {
    const from = filters.yearFrom?.toString() ?? '1900'
    const until = filters.yearTo?.toString() ?? new Date().getFullYear().toString()
    result['filter'] = `from-pub-date:${from},until-pub-date:${until}`
  }

  if (filters.venue) {
    const existing = result['filter'] ? result['filter'] + ',' : ''
    result['filter'] = `${existing}container-title:${filters.venue}`
  }

  return result
}

function buildSort(filters?: SearchFilters): string {
  if (!filters) return 'score'
  switch (filters.sortBy) {
    case 'date':
      return filters.sortOrder === 'asc' ? 'published' : 'published'
    case 'citations':
      return 'is-referenced-by-count'
    case 'relevance':
    default:
      return 'score'
  }
}

// ---------------------------------------------------------------------------
// 公开 API
// ---------------------------------------------------------------------------

/**
 * 通过 DOI 精确查询一篇论文
 */
export async function searchByDOI(doi: string): Promise<Paper | null> {
  try {
    const response = await axios.get(`${BASE_URL}/works/${encodeURIComponent(doi)}`, {
      params: { mailto: MAILTO },
    })
    const item: CrossRefItem = response.data.message
    return mapItemToPaper(item)
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null
    }
    throw new Error(`CrossRef DOI lookup failed: ${(error as Error).message}`)
  }
}

/**
 * 搜索论文
 *
 * @param query - 搜索关键词
 * @param filters - 筛选条件
 * @param page - 页码（从 1 开始）
 * @param pageSize - 每页数量，默认 25
 */
export async function searchPapers(
  query: string,
  filters?: SearchFilters,
  page: number = 1,
  pageSize: number = 25,
): Promise<SearchResult> {
  const crFilters = buildCrossRefFilters(filters)
  const sort = buildSort(filters)
  const sortOrder = filters?.sortBy === 'date' && filters.sortOrder === 'asc' ? 'asc' : 'desc'

  const params: Record<string, string | number> = {
    query,
    rows: pageSize,
    offset: (page - 1) * pageSize,
    sort,
    order: sortOrder,
    mailto: MAILTO,
  }

  if (crFilters['filter']) {
    params['filter'] = crFilters['filter']
  }

  try {
    const response = await axios.get(`${BASE_URL}/works`, { params })
    const { message } = response.data
    const items: CrossRefItem[] = message.items ?? []
    const total: number = message['total-results'] ?? 0

    const papers = items.map(mapItemToPaper)

    return {
      papers,
      total,
      page,
      pageSize,
      hasMore: (page - 1) * pageSize + papers.length < total,
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      if (status === 429) {
        throw new Error('CrossRef API rate limit exceeded. Please try again later.')
      }
      throw new Error(
        `CrossRef API error: ${error.response?.statusText ?? error.message}`,
      )
    }
    throw new Error(`CrossRef request failed: ${(error as Error).message}`)
  }
}
