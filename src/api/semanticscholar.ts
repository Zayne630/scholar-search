/**
 * Semantic Scholar API 封装
 *
 * 文档：https://api.semanticscholar.org/api-docs/
 * 需要通过 CORS 代理访问（浏览器端）。
 * 使用 offset 分页。
 */

import axios from 'axios'
import type { Paper, Author, SearchResult, SearchFilters } from '../types/paper'
import { proxyFetch } from './proxy'

// ---------------------------------------------------------------------------
// 常量
// ---------------------------------------------------------------------------

const BASE_URL = 'https://api.semanticscholar.org/graph/v1'
const API_SOURCE = 'semantic-scholar'

/** 默认请求字段 */
const PAPER_FIELDS = [
  'paperId',
  'externalIds',
  'url',
  'title',
  'abstract',
  'year',
  'referenceCount',
  'citationCount',
  'publicationTypes',
  'journal',
  'authors',
  'fieldsOfStudy',
  'tldr',
].join(',')

// ---------------------------------------------------------------------------
// 辅助：获取用户配置的 Semantic Scholar API Key
// ---------------------------------------------------------------------------

function getApiKey(): string | undefined {
  try {
    const raw = localStorage.getItem('settings')
    if (raw) {
      const settings = JSON.parse(raw)
      if (settings.semanticScholarKey) {
        return settings.semanticScholarKey
      }
    }
  } catch {
    // ignore
  }
  return undefined
}

// ---------------------------------------------------------------------------
// 请求辅助
// ---------------------------------------------------------------------------

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = {}
  const apiKey = getApiKey()
  if (apiKey) {
    headers['x-api-key'] = apiKey
  }
  return headers
}

/** 将 S2 API URL 通过代理发送，并附加公共参数 */
function apiURL(path: string, params?: Record<string, string | number | undefined>): string {
  const url = new URL(`${BASE_URL}${path}`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value))
      }
    }
  }
  return proxyFetch(url.toString())
}

// ---------------------------------------------------------------------------
// 字段映射：Semantic Scholar Paper -> Paper
// ---------------------------------------------------------------------------

interface S2Author {
  authorId?: number | string
  name?: string
  affiliations?: string[]
}

interface S2ExternalIds {
  DOI?: string
  ArXiv?: string
  PubMed?: string
  CorpusId?: number
}

interface S2Journal {
  name?: string
  volume?: string
  pages?: string
}

interface S2Tldr {
  text?: string
}

interface S2Paper {
  paperId?: string
  externalIds?: S2ExternalIds
  url?: string
  title?: string
  abstract?: string
  year?: number
  referenceCount?: number
  citationCount?: number
  publicationTypes?: string[]
  journal?: S2Journal
  authors?: S2Author[]
  fieldsOfStudy?: string[]
  tldr?: S2Tldr
  openAccessPdf?: { url?: string }
}

function mapPaperToPaper(p: S2Paper): Paper {
  const authors: Author[] = (p.authors ?? []).map((a) => ({
    name: a.name ?? 'Unknown',
    id: a.authorId != null ? String(a.authorId) : undefined,
    affiliation: a.affiliations?.[0],
  }))

  const venue = p.journal?.name ?? undefined

  let venueType: Paper['venueType'] = 'unknown'
  if (p.publicationTypes?.length) {
    const t = p.publicationTypes[0].toLowerCase()
    if (t.includes('journal')) venueType = 'journal'
    else if (t.includes('conference')) venueType = 'conference'
    else if (t.includes('review') || t.includes('preprint')) venueType = 'preprint'
    else if (t.includes('book')) venueType = 'book'
  }

  return {
    id: p.paperId ?? '',
    title: p.title ?? 'Untitled',
    authors,
    year: p.year ?? 0,
    doi: p.externalIds?.DOI,
    abstract: p.abstract ?? undefined,
    venue,
    venueType,
    citationCount: p.citationCount ?? 0,
    pdfUrl: p.openAccessPdf?.url ?? undefined,
    url: p.url ?? undefined,
    source: [API_SOURCE],
    fieldsOfStudy: p.fieldsOfStudy ?? undefined,
    tldr: p.tldr?.text ?? undefined,
    externalIds: {
      doi: p.externalIds?.DOI,
      arxiv: p.externalIds?.ArXiv,
      pubmed: p.externalIds?.PubMed ? String(p.externalIds.PubMed) : undefined,
    },
  }
}

// ---------------------------------------------------------------------------
// 筛选器构建
// ---------------------------------------------------------------------------

function buildS2Filters(filters?: SearchFilters): Record<string, string> {
  const result: Record<string, string> = {}
  if (!filters) return result

  const yearParts: string[] = []
  if (filters.yearFrom) yearParts.push(`${filters.yearFrom}`)
  if (filters.yearTo) yearParts.push(`${filters.yearTo}`)
  if (yearParts.length === 2) {
    result.year = `${yearParts[0]}-${yearParts[1]}`
  } else if (yearParts.length === 1) {
    result.year = yearParts[0]
  }

  if (filters.venue) {
    result.venue = filters.venue
  }
  if (filters.fieldOfStudy) {
    result.fieldsOfStudy = filters.fieldOfStudy
  }

  return result
}

// ---------------------------------------------------------------------------
// 公开 API
// ---------------------------------------------------------------------------

/**
 * 搜索论文
 *
 * @param query - 搜索关键词
 * @param filters - 筛选条件
 * @param offset - 分页偏移量
 * @param pageSize - 每页数量，默认 25
 */
export async function searchPapers(
  query: string,
  filters?: SearchFilters,
  offset: number = 0,
  pageSize: number = 25,
): Promise<SearchResult> {
  const params: Record<string, string | number | undefined> = {
    query,
    offset,
    limit: pageSize,
    fields: PAPER_FIELDS,
  }

  // Semantic Scholar 支持通过查询参数进行年份等过滤
  const s2Filters = buildS2Filters(filters)
  if (s2Filters.year) {
    params.year = s2Filters.year
  }
  if (s2Filters.venue) {
    params.venue = s2Filters.venue
  }
  if (s2Filters.fieldsOfStudy) {
    params.fieldsOfStudy = s2Filters.fieldsOfStudy
  }

  try {
    const url = apiURL('/paper/search', params)
    const response = await axios.get(url, { headers: buildHeaders() })
    const { data, total } = response.data

    const papers: Paper[] = (data ?? []).map(mapPaperToPaper)

    return {
      papers,
      total: total ?? 0,
      page: Math.floor(offset / pageSize) + 1,
      pageSize,
      hasMore: offset + papers.length < (total ?? 0),
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      if (status === 429) {
        throw new Error('Semantic Scholar API rate limit exceeded. Please try again later.')
      }
      throw new Error(
        `Semantic Scholar API error: ${error.response?.statusText ?? error.message}`,
      )
    }
    throw new Error(`Semantic Scholar request failed: ${(error as Error).message}`)
  }
}

/**
 * 通过 paperId 获取单篇论文详情
 *
 * @param paperId - 支持 CorpusId, DOI, ArXivId 等格式
 *   例如: `CorpusId:41856767`, `DOI:10.1234/xxx`, `ArXiv:2301.00001`
 */
export async function getPaperById(paperId: string): Promise<Paper | null> {
  try {
    const url = apiURL(`/paper/${encodeURIComponent(paperId)}`, {
      fields: PAPER_FIELDS,
    })
    const response = await axios.get(url, { headers: buildHeaders() })
    return mapPaperToPaper(response.data)
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null
    }
    throw new Error(`Semantic Scholar paper lookup failed: ${(error as Error).message}`)
  }
}

/**
 * 获取论文的参考文献列表
 */
export async function getPaperReferences(
  paperId: string,
  offset: number = 0,
  pageSize: number = 100,
): Promise<SearchResult> {
  try {
    const url = apiURL(
      `/paper/${encodeURIComponent(paperId)}/references`,
      {
        fields: PAPER_FIELDS,
        offset,
        limit: pageSize,
      },
    )
    const response = await axios.get(url, { headers: buildHeaders() })
    const raw: Array<{ citedPaper?: S2Paper }> = response.data.data ?? []

    const papers = raw
      .filter((r) => r.citedPaper)
      .map((r) => mapPaperToPaper(r.citedPaper!))

    return {
      papers,
      total: response.data.total ?? papers.length,
      page: Math.floor(offset / pageSize) + 1,
      pageSize,
      hasMore: offset + papers.length < (response.data.total ?? 0),
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return { papers: [], total: 0, page: 1, pageSize, hasMore: false }
    }
    throw new Error(`Semantic Scholar references failed: ${(error as Error).message}`)
  }
}

/**
 * 获取论文的被引列表（引用了该论文的论文）
 */
export async function getPaperCitations(
  paperId: string,
  offset: number = 0,
  pageSize: number = 100,
): Promise<SearchResult> {
  try {
    const url = apiURL(
      `/paper/${encodeURIComponent(paperId)}/citations`,
      {
        fields: PAPER_FIELDS,
        offset,
        limit: pageSize,
      },
    )
    const response = await axios.get(url, { headers: buildHeaders() })
    const raw: Array<{ citingPaper?: S2Paper }> = response.data.data ?? []

    const papers = raw
      .filter((r) => r.citingPaper)
      .map((r) => mapPaperToPaper(r.citingPaper!))

    return {
      papers,
      total: response.data.total ?? papers.length,
      page: Math.floor(offset / pageSize) + 1,
      pageSize,
      hasMore: offset + papers.length < (response.data.total ?? 0),
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return { papers: [], total: 0, page: 1, pageSize, hasMore: false }
    }
    throw new Error(`Semantic Scholar citations failed: ${(error as Error).message}`)
  }
}

/**
 * 获取与指定论文相似的推荐论文
 */
export async function getRecommendedPapers(
  paperId: string,
  pageSize: number = 10,
): Promise<Paper[]> {
  try {
    const url = apiURL(
      `/paper/${encodeURIComponent(paperId)}/recommendations`,
      {
        fields: PAPER_FIELDS,
        limit: pageSize,
      },
    )
    const response = await axios.get(url, { headers: buildHeaders() })
    const raw: Array<{ recommendedPaper?: S2Paper }> = response.data.recommendedPapers ?? []

    return raw
      .filter((r) => r.recommendedPaper)
      .map((r) => mapPaperToPaper(r.recommendedPaper!))
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return []
    }
    throw new Error(`Semantic Scholar recommendations failed: ${(error as Error).message}`)
  }
}

/**
 * 获取指定作者的论文列表
 */
export async function getAuthorPapers(
  authorId: string,
  offset: number = 0,
  pageSize: number = 25,
): Promise<SearchResult> {
  try {
    const url = apiURL(
      `/author/${encodeURIComponent(authorId)}/papers`,
      {
        fields: PAPER_FIELDS,
        offset,
        limit: pageSize,
      },
    )
    const response = await axios.get(url, { headers: buildHeaders() })
    const data: S2Paper[] = response.data.data ?? []

    const papers = data.map(mapPaperToPaper)

    return {
      papers,
      total: response.data.total ?? papers.length,
      page: Math.floor(offset / pageSize) + 1,
      pageSize,
      hasMore: offset + papers.length < (response.data.total ?? 0),
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return { papers: [], total: 0, page: 1, pageSize, hasMore: false }
    }
    throw new Error(`Semantic Scholar author papers failed: ${(error as Error).message}`)
  }
}
