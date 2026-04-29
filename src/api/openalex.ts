/**
 * OpenAlex API 封装
 *
 * 文档：https://docs.openalex.org/
 * 支持 CORS，无需代理。
 * 使用 mailto 参数进入 Polite Pool 获得更稳定的速率。
 */

import axios from 'axios'
import type { Paper, Author, SearchResult, SearchFilters } from '../types/paper'

// ---------------------------------------------------------------------------
// 常量
// ---------------------------------------------------------------------------

const BASE_URL = 'https://api.openalex.org'
const MAILTO = 'scholar-search@example.com'
const API_SOURCE = 'openalex'

// ---------------------------------------------------------------------------
// 辅助：获取用户在 settings 中配置的 OpenAlex API Key
// ---------------------------------------------------------------------------

/** 尝试从 localStorage 读取 openalex_key（由 Settings 页面写入） */
function getApiKey(): string | undefined {
  try {
    const raw = localStorage.getItem('settings')
    if (raw) {
      const settings = JSON.parse(raw)
      if (settings.openalexKey) {
        return settings.openalexKey
      }
    }
  } catch {
    // ignore
  }
  return undefined
}

// ---------------------------------------------------------------------------
// 字段映射：OpenAlex Work -> Paper
// ---------------------------------------------------------------------------

interface OpenAlexAuthorship {
  author?: {
    id?: string
    display_name?: string
  }
  institutions?: Array<{ display_name?: string }>
}

interface OpenAlexWork {
  id: string
  doi?: string
  title?: string | null
  display_name?: string
  publication_year?: number
  cited_by_count?: number
  type?: string
  primary_location?: {
    source?: {
      display_name?: string
      type?: string
    } | null
    landing_page_url?: string | null
    pdf_url?: string | null
  }
  authorships?: OpenAlexAuthorship[]
  primary_topic?: {
    field?: { display_name?: string }
    subfield?: { display_name?: string }
  } | null
  topics?: Array<{ field?: { display_name?: string } }>
  open_access?: {
    oa_url?: string | null
  }
  ids?: {
    doi?: string
    openalex?: string
    pmid?: string
  }
  abstract_inverted_index?: Record<string, number[]> | null
}

/**
 * 将 OpenAlex 的 abstract_inverted_index（倒排索引）转换为可读文本
 */
function invertedIndexToText(index: Record<string, number[]> | null | undefined): string | undefined {
  if (!index) return undefined
  const pairs: [number, string][] = []
  for (const [word, positions] of Object.entries(index)) {
    for (const pos of positions) {
      pairs.push([pos, word])
    }
  }
  pairs.sort((a, b) => a[0] - b[0])
  return pairs.map(p => p[1]).join(' ')
}

function mapWorkToPaper(work: OpenAlexWork): Paper {
  const authors: Author[] = (work.authorships ?? []).map((a) => ({
    name: a.author?.display_name ?? 'Unknown',
    id: a.author?.id ?? undefined,
    affiliation: a.institutions?.[0]?.display_name,
  }))

  const venue = work.primary_location?.source?.display_name
  const venueType = mapVenueType(work.primary_location?.source?.type)

  const fieldsOfStudy = extractFieldsOfStudy(work)

  const pdfUrl =
    work.primary_location?.pdf_url ??
    work.open_access?.oa_url ??
    undefined

  const paperId = work.ids?.openalex?.replace('https://openalex.org/', '') ?? work.id

  return {
    id: paperId,
    title: work.title ?? work.display_name ?? 'Untitled',
    authors,
    year: work.publication_year ?? 0,
    doi: work.doi?.replace('https://doi.org/', '') ?? work.ids?.doi,
    abstract: invertedIndexToText(work.abstract_inverted_index),
    venue,
    venueType,
    citationCount: work.cited_by_count ?? 0,
    pdfUrl,
    url: work.primary_location?.landing_page_url ?? undefined,
    source: [API_SOURCE],
    fieldsOfStudy,
    externalIds: {
      doi: work.ids?.doi?.replace('https://doi.org/', ''),
      openalex: work.ids?.openalex?.replace('https://openalex.org/', ''),
      pubmed: work.ids?.pmid,
    },
  }
}

function mapVenueType(
  type?: string,
): Paper['venueType'] {
  switch (type) {
    case 'journal':
      return 'journal'
    case 'conference':
      return 'conference'
    case 'repository':
      return 'preprint'
    case 'book':
    case 'book-series':
      return 'book'
    default:
      return 'unknown'
  }
}

function extractFieldsOfStudy(work: OpenAlexWork): string[] {
  const fields: string[] = []
  if (work.primary_topic?.field?.display_name) {
    fields.push(work.primary_topic.field.display_name)
  }
  if (work.primary_topic?.subfield?.display_name) {
    fields.push(work.primary_topic.subfield.display_name)
  }
  if (fields.length === 0 && work.topics?.length) {
    const first = work.topics[0].field?.display_name
    if (first) fields.push(first)
  }
  return fields
}

// ---------------------------------------------------------------------------
// 请求构建
// ---------------------------------------------------------------------------

interface OpenAlexSearchParams {
  search?: string
  filter?: string
  sort?: string
  per_page?: number
  cursor?: string
  mailto?: string
  api_key?: string
  select?: string
}

function buildFilterString(filters?: SearchFilters): string {
  const parts: string[] = []
  if (filters) {
    if (filters.yearFrom) parts.push(`from_publication_date:${filters.yearFrom}-01-01`)
    if (filters.yearTo) parts.push(`to_publication_date:${filters.yearTo}-12-31`)
    if (filters.venue) parts.push(`primary_location.source.display_name.search:${filters.venue}`)
    if (filters.fieldOfStudy) parts.push(`primary_topic.field.display_name:${filters.fieldOfStudy}`)
  }
  return parts.join(',')
}

function buildSortString(filters?: SearchFilters): string {
  if (!filters) return 'relevance_score:desc'
  switch (filters.sortBy) {
    case 'date':
      return filters.sortOrder === 'asc'
        ? 'publication_date:asc'
        : 'publication_date:desc'
    case 'citations':
      return filters.sortOrder === 'asc'
        ? 'cited_by_count:asc'
        : 'cited_by_count:desc'
    case 'relevance':
    default:
      return 'relevance_score:desc'
  }
}

// ---------------------------------------------------------------------------
// 公开 API
// ---------------------------------------------------------------------------

/**
 * 搜索论文
 *
 * @param query - 搜索关键词
 * @param filters - 筛选条件
 * @param cursor - 分页游标（首页传 '*' 或 undefined）
 * @param pageSize - 每页数量，默认 25
 */
export async function searchPapers(
  query: string,
  filters?: SearchFilters,
  cursor?: string,
  pageSize: number = 25,
): Promise<SearchResult> {
  const params: OpenAlexSearchParams = {
    search: query || undefined,
    filter: buildFilterString(filters) || undefined,
    sort: buildSortString(filters),
    per_page: pageSize,
    cursor: cursor || '*',
    mailto: MAILTO,
    select: 'id,doi,title,display_name,publication_year,cited_by_count,type,primary_location,authorships,primary_topic,topics,open_access,ids,abstract_inverted_index',
  }

  const apiKey = getApiKey()
  if (apiKey) {
    params.api_key = apiKey
  }

  try {
    const response = await axios.get(`${BASE_URL}/works`, { params })
    const { results, meta } = response.data

    const papers: Paper[] = (results ?? []).map(mapWorkToPaper)
    const total = meta?.count ?? 0

    return {
      papers,
      total,
      page: 1, // cursor 分页无页码概念，保持占位
      pageSize,
      hasMore: !!meta?.next_cursor,
      // 透传 next_cursor 以便调用方用于下一次请求
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as SearchResult & { nextCursor?: string }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      if (status === 429) {
        throw new Error('OpenAlex API rate limit exceeded. Please try again later.')
      }
      throw new Error(
        `OpenAlex API error: ${error.response?.statusText ?? error.message}`,
      )
    }
    throw new Error(`OpenAlex request failed: ${(error as Error).message}`)
  }
}

/**
 * 通过 DOI 精确查询一篇论文
 */
export async function searchByDOI(doi: string): Promise<Paper | null> {
  const params: OpenAlexSearchParams = {
    filter: `doi:${doi}`,
    mailto: MAILTO,
    per_page: 1,
  }

  const apiKey = getApiKey()
  if (apiKey) {
    params.api_key = apiKey
  }

  try {
    const response = await axios.get(`${BASE_URL}/works`, { params })
    const results: OpenAlexWork[] = response.data.results ?? []
    if (results.length === 0) return null
    return mapWorkToPaper(results[0])
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null
    }
    throw new Error(`OpenAlex DOI lookup failed: ${(error as Error).message}`)
  }
}

/**
 * 通过 OpenAlex ID 直接查询一篇论文
 */
export async function getWorkById(openalexId: string): Promise<Paper | null> {
  const params: OpenAlexSearchParams = {
    mailto: MAILTO,
  }

  const apiKey = getApiKey()
  if (apiKey) {
    params.api_key = apiKey
  }

  try {
    // OpenAlex ID 格式: W1234567890
    const fullId = openalexId.startsWith('W') ? `https://openalex.org/${openalexId}` : openalexId
    const response = await axios.get(`${BASE_URL}/works/${fullId}`, { params })
    return mapWorkToPaper(response.data)
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) return null
    throw new Error(`OpenAlex work lookup failed: ${(error as Error).message}`)
  }
}

/**
 * 获取指定作者的论文列表
 */
export async function getAuthorWorks(
  authorId: string,
  cursor?: string,
  pageSize: number = 25,
): Promise<SearchResult> {
  const params: OpenAlexSearchParams = {
    filter: `author.id:${authorId}`,
    sort: 'publication_date:desc',
    per_page: pageSize,
    cursor: cursor || '*',
    mailto: MAILTO,
  }

  const apiKey = getApiKey()
  if (apiKey) {
    params.api_key = apiKey
  }

  try {
    const response = await axios.get(`${BASE_URL}/works`, { params })
    const { results, meta } = response.data

    return {
      papers: (results ?? []).map(mapWorkToPaper),
      total: meta?.count ?? 0,
      page: 1,
      pageSize,
      hasMore: !!meta?.next_cursor,
    } as SearchResult & { nextCursor?: string }
  } catch (error) {
    throw new Error(`OpenAlex author works failed: ${(error as Error).message}`)
  }
}

/**
 * 获取指定期刊/会议的论文列表
 */
export async function getVenuePapers(
  venueId: string,
  cursor?: string,
  pageSize: number = 25,
): Promise<SearchResult> {
  const params: OpenAlexSearchParams = {
    filter: `primary_location.source.id:${venueId}`,
    sort: 'publication_date:desc',
    per_page: pageSize,
    cursor: cursor || '*',
    mailto: MAILTO,
  }

  const apiKey = getApiKey()
  if (apiKey) {
    params.api_key = apiKey
  }

  try {
    const response = await axios.get(`${BASE_URL}/works`, { params })
    const { results, meta } = response.data

    return {
      papers: (results ?? []).map(mapWorkToPaper),
      total: meta?.count ?? 0,
      page: 1,
      pageSize,
      hasMore: !!meta?.next_cursor,
    } as SearchResult & { nextCursor?: string }
  } catch (error) {
    throw new Error(`OpenAlex venue papers failed: ${(error as Error).message}`)
  }
}

/**
 * 获取某关键词的论文数量年度分布（用于趋势图）
 *
 * @param keyword - 关键词
 * @param yearFrom - 起始年份
 * @param yearTo - 截止年份
 * @returns 年份 -> 论文数量 的映射
 */
export async function getTrendData(
  keyword: string,
  yearFrom: number,
  yearTo: number,
): Promise<Record<number, number>> {
  const apiKey = getApiKey()

  try {
    const response = await axios.get(`${BASE_URL}/works`, {
      params: {
        search: keyword,
        filter: `from_publication_date:${yearFrom}-01-01,to_publication_date:${yearTo}-12-31`,
        group_by: 'publication_year',
        per_page: 50,
        mailto: MAILTO,
        ...(apiKey ? { api_key: apiKey } : {}),
      },
    })

    const groups: Array<{ key: string; count: number }> = response.data.group_by ?? []
    const result: Record<number, number> = {}
    for (const g of groups) {
      const year = parseInt(g.key, 10)
      if (!isNaN(year)) {
        result[year] = g.count
      }
    }
    return result
  } catch (error) {
    throw new Error(`OpenAlex trend data failed: ${(error as Error).message}`)
  }
}

/**
 * 获取论文的参考文献（OpenAlex）
 * OpenAlex 的 referenced_works 字段包含引用的 OpenAlex ID 列表
 */
export async function getReferences(
  openalexId: string,
  pageSize: number = 20,
): Promise<Paper[]> {
  const apiKey = getApiKey()
  const fullId = openalexId.startsWith('W') ? `https://openalex.org/${openalexId}` : openalexId

  try {
    // 先获取论文的 referenced_works 列表
    const workResponse = await axios.get(`${BASE_URL}/works/${fullId}`, {
      params: {
        mailto: MAILTO,
        select: 'referenced_works',
        ...(apiKey ? { api_key: apiKey } : {}),
      },
    })
    const refIds: string[] = workResponse.data?.referenced_works ?? []
    if (refIds.length === 0) return []

    // 批量获取引用论文详情（最多取前 pageSize 个）
    const idsToFetch = refIds.slice(0, pageSize)
    const filter = idsToFetch.map(id => `https://openalex.org/${id.replace('https://openalex.org/', '')}`).join('|')
    const response = await axios.get(`${BASE_URL}/works`, {
      params: {
        filter: `openalex:${idsToFetch.map(id => id.replace('https://openalex.org/', '')).join('|')}`,
        per_page: pageSize,
        mailto: MAILTO,
        ...(apiKey ? { api_key: apiKey } : {}),
      },
    })
    return (response.data.results ?? []).map(mapWorkToPaper)
  } catch {
    return []
  }
}

/**
 * 获取论文的被引论文（OpenAlex）
 */
export async function getCitations(
  openalexId: string,
  pageSize: number = 20,
): Promise<Paper[]> {
  const apiKey = getApiKey()
  const fullId = openalexId.startsWith('W') ? `https://openalex.org/${openalexId}` : openalexId

  try {
    const response = await axios.get(`${BASE_URL}/works`, {
      params: {
        filter: `cites:${fullId}`,
        per_page: pageSize,
        sort: 'publication_date:desc',
        mailto: MAILTO,
        ...(apiKey ? { api_key: apiKey } : {}),
      },
    })
    return (response.data.results ?? []).map(mapWorkToPaper)
  } catch {
    return []
  }
}
