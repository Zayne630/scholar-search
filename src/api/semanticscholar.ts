/**
 * Semantic Scholar API 封装
 *
 * 文档：https://api.semanticscholar.org/api-docs/
 * 需要通过 CORS 代理访问（浏览器端）。
 * 使用 offset 分页。
 */

import axios from 'axios'
import type { Paper, Author, SearchResult, SearchFilters } from '../types/paper'
import { proxyGet } from './proxy'
import { quotedTermIfNeeded, isExactPhrase } from './searchQuery'
import { s2ScopeFilter, toS2FieldsOfStudy } from '../data/scope'

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

/** 构建 S2 API 的完整 URL（不附加代理，代理由 proxyGet 处理） */
function apiURL(path: string, params?: Record<string, string | number | undefined>): string {
  const url = new URL(`${BASE_URL}${path}`)
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value))
      }
    }
  }
  return url.toString()
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

function buildS2Filters(filters?: SearchFilters, skipScope = false): Record<string, string> {
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

  // 研究领域约束（settings 中配置，见 src/data/scope.ts）。
  // 精确短语查询自带消歧，跳过学科过滤以免误杀。
  // 与"高级筛选"的 fieldOfStudy 取并集，且都过滤为 S2 合法枚举值，
  // 传非法值（如 OpenAlex 的领域显示名）会导致 S2 返回 400
  const scopeFields = skipScope ? [] : toS2FieldsOfStudy(s2ScopeFilter() ?? '')
  const manualFields = toS2FieldsOfStudy(filters.fieldOfStudy ?? '')
  const allFields = Array.from(new Set([...scopeFields, ...manualFields]))
  if (allFields.length) {
    result.fieldsOfStudy = allFields.join(',')
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
  const processedQuery = quotedTermIfNeeded(query)
  const params: Record<string, string | number | undefined> = {
    query: processedQuery,
    offset,
    limit: pageSize,
    fields: PAPER_FIELDS,
  }

  // Semantic Scholar 支持通过查询参数进行年份等过滤
  const s2Filters = buildS2Filters(filters, isExactPhrase(processedQuery))
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
    const data = await proxyGet<{ data?: S2Paper[]; total?: number }>(
      apiURL('/paper/search', params),
      { headers: buildHeaders() },
    )
    const papers: Paper[] = (data.data ?? []).map(mapPaperToPaper)
    const total = data.total ?? 0

    return {
      papers,
      total,
      page: Math.floor(offset / pageSize) + 1,
      pageSize,
      hasMore: offset + papers.length < total,
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
    const data = await proxyGet<S2Paper>(
      apiURL(`/paper/${encodeURIComponent(paperId)}`, {
        fields: PAPER_FIELDS,
      }),
      { headers: buildHeaders() },
    )
    return mapPaperToPaper(data)
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
    const data = await proxyGet<{ data?: Array<{ citedPaper?: S2Paper }>; total?: number }>(
      apiURL(
        `/paper/${encodeURIComponent(paperId)}/references`,
        {
          fields: PAPER_FIELDS,
          offset,
          limit: pageSize,
        },
      ),
      { headers: buildHeaders() },
    )
    const raw = data.data ?? []

    const papers = raw
      .filter((r) => r.citedPaper)
      .map((r) => mapPaperToPaper(r.citedPaper!))

    return {
      papers,
      total: data.total ?? papers.length,
      page: Math.floor(offset / pageSize) + 1,
      pageSize,
      hasMore: offset + papers.length < (data.total ?? 0),
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
    const data = await proxyGet<{ data?: Array<{ citingPaper?: S2Paper }>; total?: number }>(
      apiURL(
        `/paper/${encodeURIComponent(paperId)}/citations`,
        {
          fields: PAPER_FIELDS,
          offset,
          limit: pageSize,
        },
      ),
      { headers: buildHeaders() },
    )
    const raw = data.data ?? []

    const papers = raw
      .filter((r) => r.citingPaper)
      .map((r) => mapPaperToPaper(r.citingPaper!))

    return {
      papers,
      total: data.total ?? papers.length,
      page: Math.floor(offset / pageSize) + 1,
      pageSize,
      hasMore: offset + papers.length < (data.total ?? 0),
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
    const data = await proxyGet<{ recommendedPapers?: Array<{ recommendedPaper?: S2Paper }> }>(
      apiURL(
        `/paper/${encodeURIComponent(paperId)}/recommendations`,
        {
          fields: PAPER_FIELDS,
          limit: pageSize,
        },
      ),
      { headers: buildHeaders() },
    )
    const raw = data.recommendedPapers ?? []

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
    const data = await proxyGet<{ data?: S2Paper[]; total?: number }>(
      apiURL(
        `/author/${encodeURIComponent(authorId)}/papers`,
        {
          fields: PAPER_FIELDS,
          offset,
          limit: pageSize,
        },
      ),
      { headers: buildHeaders() },
    )
    const raw: S2Paper[] = data.data ?? []

    const papers = raw.map(mapPaperToPaper)

    return {
      papers,
      total: data.total ?? papers.length,
      page: Math.floor(offset / pageSize) + 1,
      pageSize,
      hasMore: offset + papers.length < (data.total ?? 0),
    }
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return { papers: [], total: 0, page: 1, pageSize, hasMore: false }
    }
    throw new Error(`Semantic Scholar author papers failed: ${(error as Error).message}`)
  }
}
