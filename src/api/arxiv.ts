/**
 * arXiv API 封装
 *
 * 文档：https://info.arxiv.org/help/api/index.html
 * 需要通过 CORS 代理访问（浏览器端）。
 * 响应格式为 Atom XML，需要用 DOMParser 解析。
 */

import axios from 'axios'
import type { Paper, Author, SearchResult, SearchFilters } from '../types/paper'
import { proxyFetch } from './proxy'

// ---------------------------------------------------------------------------
// 常量
// ---------------------------------------------------------------------------

const BASE_URL = 'http://export.arxiv.org/api/query'
const API_SOURCE = 'arxiv'

// ---------------------------------------------------------------------------
// XML 解析辅助
// ---------------------------------------------------------------------------

/** 从 entry 元素中提取文本子元素内容 */
function getText(parent: Element, tagName: string): string | undefined {
  // arXiv 的 Atom 命名空间：http://www.w3.org/2005/Atom
  const el = parent.getElementsByTagNameNS('http://www.w3.org/2005/Atom', tagName)[0]
    ?? parent.getElementsByTagName(tagName)[0]
  return el?.textContent?.trim() || undefined
}

/** 从 entry 元素中提取作者列表 */
function getAuthors(entry: Element): Author[] {
  const authors: Author[] = []
  const authorEls = entry.getElementsByTagNameNS('http://www.w3.org/2005/Atom', 'author')
  if (authorEls.length === 0) {
    // fallback: 无命名空间
    const fallbacks = entry.getElementsByTagName('author')
    for (let i = 0; i < fallbacks.length; i++) {
      const name = fallbacks[i].getElementsByTagName('name')[0]?.textContent?.trim()
      if (name) {
        authors.push({ name })
      }
    }
  } else {
    for (let i = 0; i < authorEls.length; i++) {
      const name = authorEls[i].getElementsByTagName('name')[0]?.textContent?.trim()
      if (name) {
        authors.push({ name })
      }
    }
  }
  return authors
}

/** 提取 PDF 链接：查找 <link title="pdf"> 或 rel="related" type="application/pdf" */
function getPdfUrl(entry: Element): string | undefined {
  const links = entry.getElementsByTagNameNS('http://www.w3.org/2005/Atom', 'link')
  const fallbackLinks = entry.getElementsByTagName('link')

  const allLinks = links.length > 0 ? links : fallbackLinks

  for (let i = 0; i < allLinks.length; i++) {
    const link = allLinks[i]
    const title = link.getAttribute('title')
    const type = link.getAttribute('type')
    if (title === 'pdf' || type === 'application/pdf') {
      return link.getAttribute('href') ?? undefined
    }
  }

  // 回退：arXiv ID 拼接 PDF URL
  const id = getText(entry, 'id')
  if (id) {
    const arxivId = extractArxivId(id)
    if (arxivId) {
      return `https://arxiv.org/pdf/${arxivId}.pdf`
    }
  }

  return undefined
}

/** 提取 arXiv DOI */
function getDoi(entry: Element): string | undefined {
  // arXiv 命名空间中的 doi
  const doiEl = entry.getElementsByTagNameNS('http://arxiv.org/schemas/atom', 'doi')[0]
  return doiEl?.textContent?.trim() || undefined
}

/** 提取分类/领域 */
function getCategories(entry: Element): string[] {
  const categories: string[] = []
  const catEls = entry.getElementsByTagNameNS('http://arxiv.org/schemas/atom', 'primary_category')
  if (catEls.length > 0) {
    const term = catEls[0].getAttribute('term')
    if (term) categories.push(term)
  }
  const catEls2 = entry.getElementsByTagName('category')
  for (let i = 0; i < catEls2.length; i++) {
    const term = catEls2[i].getAttribute('term')
    if (term && !categories.includes(term)) {
      categories.push(term)
    }
  }
  return categories
}

/** 从 arXiv entry ID URL 中提取纯 ID */
function extractArxivId(idUrl: string): string | undefined {
  // 例如: http://arxiv.org/abs/2301.00001v1 -> 2301.00001v1
  const match = idUrl.match(/\/abs\/(.+)$/)
  return match?.[1] ?? undefined
}

/** 解析单个 <entry> 为 Paper */
function parseEntry(entry: Element): Paper {
  const idUrl = getText(entry, 'id') ?? ''
  const arxivId = extractArxivId(idUrl)

  const title = getText(entry, 'title')?.replace(/\s+/g, ' ') ?? 'Untitled'
  const abstract = getText(entry, 'summary')?.replace(/\s+/g, ' ').trim()
  const published = getText(entry, 'published')
  const year = published ? parseInt(published.substring(0, 4), 10) : 0

  const authors = getAuthors(entry)
  const pdfUrl = getPdfUrl(entry)
  const doi = getDoi(entry)
  const categories = getCategories(entry)

  return {
    id: arxivId ?? idUrl,
    title,
    authors,
    year,
    doi,
    abstract,
    venue: 'arXiv',
    venueType: 'preprint',
    citationCount: 0, // arXiv API 不提供引用数
    pdfUrl,
    url: idUrl,
    source: [API_SOURCE],
    fieldsOfStudy: categories.length > 0 ? categories : undefined,
    externalIds: {
      arxiv: arxivId,
      doi,
    },
  }
}

/** 解析 arXiv API 的 Atom XML 响应 */
function parseResponse(xml: string): { papers: Paper[]; total: number } {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'application/xml')

  // 检查解析错误
  const parseError = doc.getElementsByTagName('parsererror')[0]
  if (parseError) {
    throw new Error(`XML parse error: ${parseError.textContent}`)
  }

  // total results
  const totalEl =
    doc.getElementsByTagNameNS('http://a9.com/-/spec/opensearch/1.1/', 'totalResults')[0]
    ?? doc.getElementsByTagName('totalResults')[0]
  const total = parseInt(totalEl?.textContent ?? '0', 10)

  // entries
  const entries = doc.getElementsByTagNameNS('http://www.w3.org/2005/Atom', 'entry')
  const fallbackEntries = entries.length > 0 ? entries : doc.getElementsByTagName('entry')

  const papers: Paper[] = []
  for (let i = 0; i < fallbackEntries.length; i++) {
    try {
      papers.push(parseEntry(fallbackEntries[i]))
    } catch {
      // 跳过解析失败的条目
    }
  }

  return { papers, total: isNaN(total) ? papers.length : total }
}

// ---------------------------------------------------------------------------
// 查询构建
// ---------------------------------------------------------------------------

/**
 * 将用户输入的查询关键词转为 arXiv 查询语法
 *
 * 支持前缀：
 * - ti: (title)
 * - au: (author)
 * - abs: (abstract)
 * - cat: (category)
 *
 * 如果用户没有指定前缀，则搜索标题和摘要。
 */
function buildSearchQuery(query: string): string {
  // 检测是否已有 arXiv 前缀
  const hasPrefix = /^(ti|au|abs|cat|all|srctitle|journal|rn|uid|author|title):/i.test(query)
  if (hasPrefix) {
    return query
  }

  // 默认搜索标题和摘要
  const escaped = query.replace(/"/g, '\\"')
  return `ti:"${escaped}" OR abs:"${escaped}"`
}

function buildFilterQuery(filters?: SearchFilters): string {
  const parts: string[] = []
  if (!filters) return ''

  if (filters.fieldOfStudy) {
    parts.push(`cat:${filters.fieldOfStudy}`)
  }
  // arXiv 没有原生的年份筛选参数，年份过滤在客户端进行

  return parts.join(' AND ')
}

/**
 * 客户端年份过滤
 */
function filterByYear(papers: Paper[], filters?: SearchFilters): Paper[] {
  if (!filters?.yearFrom && !filters?.yearTo) return papers
  return papers.filter((p) => {
    if (p.year === 0) return true // 保留无年份的论文
    if (filters.yearFrom && p.year < filters.yearFrom) return false
    if (filters.yearTo && p.year > filters.yearTo) return false
    return true
  })
}

/**
 * 客户端排序
 */
function sortPapers(papers: Paper[], filters?: SearchFilters): Paper[] {
  if (!filters) return papers
  const sorted = [...papers]
  switch (filters.sortBy) {
    case 'date':
      sorted.sort((a, b) =>
        filters.sortOrder === 'asc' ? a.year - b.year : b.year - a.year,
      )
      break
    case 'citations':
      sorted.sort((a, b) =>
        filters.sortOrder === 'asc'
          ? a.citationCount - b.citationCount
          : b.citationCount - a.citationCount,
      )
      break
    default:
      break // relevance 保持 API 原始排序
  }
  return sorted
}

// ---------------------------------------------------------------------------
// 公开 API
// ---------------------------------------------------------------------------

/**
 * 搜索 arXiv 论文
 *
 * @param query - 搜索关键词（支持 ti:, au:, abs:, cat: 前缀）
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
  const searchQuery = buildSearchQuery(query)
  const filterQuery = buildFilterQuery(filters)

  let fullQuery = searchQuery
  if (filterQuery) {
    fullQuery = `(${searchQuery}) AND (${filterQuery})`
  }

  const start = (page - 1) * pageSize
  const url = proxyFetch(
    `${BASE_URL}?search_query=${encodeURIComponent(fullQuery)}&start=${start}&max_results=${pageSize}&sortBy=relevance&sortOrder=descending`,
  )

  try {
    const response = await axios.get(url, {
      responseType: 'text',
      headers: { Accept: 'application/xml' },
    })
    const { papers: rawPapers, total } = parseResponse(response.data)

    // 客户端过滤年份（arXiv API 不支持年份过滤参数）
    let papers = filterByYear(rawPapers, filters)
    papers = sortPapers(papers, filters)

    return {
      papers,
      total,
      page,
      pageSize,
      hasMore: start + rawPapers.length < total,
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(
        `arXiv API error: ${error.response?.statusText ?? error.message}`,
      )
    }
    throw new Error(`arXiv request failed: ${(error as Error).message}`)
  }
}

/**
 * 获取 arXiv 最新论文
 *
 * @param category - arXiv 分类（如 cs.AI, physics.optics），不传则为全部
 * @param maxResults - 最大返回数量，默认 20
 */
export async function getLatestPapers(
  category?: string,
  maxResults: number = 20,
): Promise<Paper[]> {
  const searchQuery = category ? `cat:${category}` : 'all'
  const url = proxyFetch(
    `${BASE_URL}?search_query=${encodeURIComponent(searchQuery)}&start=0&max_results=${maxResults}&sortBy=submittedDate&sortOrder=descending`,
  )

  try {
    const response = await axios.get(url, {
      responseType: 'text',
      headers: { Accept: 'application/xml' },
    })
    const { papers } = parseResponse(response.data)
    return papers
  } catch (error) {
    throw new Error(`arXiv latest papers failed: ${(error as Error).message}`)
  }
}
