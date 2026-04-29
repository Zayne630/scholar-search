/**
 * Pinia 搜索状态 store
 *
 * 管理搜索关键词、筛选条件、搜索结果、搜索历史等状态。
 * 并行调用多个 API 搜索论文，合并去重后呈现。
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Paper, SearchFilters, SearchRecord } from '../types/paper'
import {
  searchPapers as searchOpenAlex,
} from '../api/openalex'
import {
  searchPapers as searchSemanticScholar,
} from '../api/semanticscholar'
import {
  searchPapers as searchCrossRef,
} from '../api/crossref'
import {
  searchPapers as searchArxiv,
} from '../api/arxiv'
import {
  addSearchRecord as dbAddSearchRecord,
  getSearchHistory as dbGetSearchHistory,
  clearSearchHistory as dbClearSearchHistory,
} from '../db'

export const useSearchStore = defineStore('search', () => {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const query = ref('')
  const filters = ref<SearchFilters>({
    sortBy: 'relevance',
    sortOrder: 'desc',
  })
  const results = ref<Paper[]>([])
  const total = ref(0)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentCursor = ref<string | undefined>(undefined)
  const searchHistory = ref<SearchRecord[]>([])

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /**
   * 计算两个字符串的简单相似度（基于公共子序列比率）
   * 用于在没有 DOI 的情况下按标题去重。
   */
  function titleSimilarity(a: string, b: string): number {
    const sa = a.toLowerCase().replace(/[^a-z0-9]/g, '')
    const sb = b.toLowerCase().replace(/[^a-z0-9]/g, '')
    if (sa === sb) return 1
    if (!sa.length || !sb.length) return 0

    // 简单的 trigram 重叠率
    const trigramsA = new Set<string>()
    for (let i = 0; i <= sa.length - 3; i++) {
      trigramsA.add(sa.substring(i, i + 3))
    }
    let overlap = 0
    let totalTrigrams = 0
    for (let i = 0; i <= sb.length - 3; i++) {
      totalTrigrams++
      if (trigramsA.has(sb.substring(i, i + 3))) overlap++
    }
    return totalTrigrams > 0 ? overlap / totalTrigrams : 0
  }

  /**
   * 合并并去重论文列表
   * 优先按 DOI 去重，没有 DOI 的用标题相似度（>= 0.8 视为相同）。
   * 合并时拼接 source 数组。
   */
  function deduplicatePapers(papers: Paper[]): Paper[] {
    const doiMap = new Map<string, Paper>()
    const titleMap = new Map<string, Paper>()
    const result: Paper[] = []

    for (const paper of papers) {
      // DOI 去重
      if (paper.doi) {
        const doiKey = paper.doi.toLowerCase()
        const existing = doiMap.get(doiKey)
        if (existing) {
          // 合并 source
          const mergedSources = new Set([...existing.source, ...paper.source])
          existing.source = Array.from(mergedSources)
          // 保留更丰富的信息
          if (!existing.abstract && paper.abstract) existing.abstract = paper.abstract
          if (!existing.pdfUrl && paper.pdfUrl) existing.pdfUrl = paper.pdfUrl
          if (!existing.tldr && paper.tldr) existing.tldr = paper.tldr
          continue
        }
        doiMap.set(doiKey, paper)
        result.push(paper)
        continue
      }

      // 标题去重
      const normalizedTitle = paper.title.toLowerCase().replace(/[^a-z0-9]/g, '')
      let foundDuplicate = false
      for (const [existingTitle] of titleMap) {
        if (titleSimilarity(normalizedTitle, existingTitle) >= 0.8) {
          const existing = titleMap.get(existingTitle)!
          const mergedSources = new Set([...existing.source, ...paper.source])
          existing.source = Array.from(mergedSources)
          if (!existing.abstract && paper.abstract) existing.abstract = paper.abstract
          if (!existing.pdfUrl && paper.pdfUrl) existing.pdfUrl = paper.pdfUrl
          if (!existing.tldr && paper.tldr) existing.tldr = paper.tldr
          foundDuplicate = true
          break
        }
      }

      if (!foundDuplicate) {
        titleMap.set(normalizedTitle, paper)
        result.push(paper)
      }
    }

    return result
  }

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  /**
   * 搜索论文：并行调用 4 个 API，合并去重结果
   */
  async function search() {
    if (!query.value.trim()) return

    isLoading.value = true
    error.value = null
    results.value = []
    total.value = 0
    currentCursor.value = undefined

    try {
      const searchPromises = [
        searchOpenAlex(query.value, filters.value).catch((e) => {
          console.warn('[OpenAlex] search failed:', e)
          return { papers: [], total: 0, page: 1, pageSize: 25, hasMore: false }
        }),
        searchSemanticScholar(query.value, filters.value).catch((e) => {
          console.warn('[SemanticScholar] search failed:', e)
          return { papers: [], total: 0, page: 1, pageSize: 25, hasMore: false }
        }),
        searchCrossRef(query.value, filters.value).catch((e) => {
          console.warn('[CrossRef] search failed:', e)
          return { papers: [], total: 0, page: 1, pageSize: 25, hasMore: false }
        }),
        searchArxiv(query.value, filters.value).catch((e) => {
          console.warn('[arXiv] search failed:', e)
          return { papers: [], total: 0, page: 1, pageSize: 25, hasMore: false }
        }),
      ]

      const [openalexResult, s2Result, crossrefResult, arxivResult] = await Promise.all(searchPromises)

      // 保存 OpenAlex 的 cursor 用于分页
      const openalexResponse = openalexResult as ReturnType<typeof openalexResult> & { nextCursor?: string }
      if ('nextCursor' in openalexResult) {
        currentCursor.value = (openalexResult as { nextCursor?: string }).nextCursor
      }

      const allPapers = [
        ...openalexResult.papers,
        ...s2Result.papers,
        ...crossrefResult.papers,
        ...arxivResult.papers,
      ]

      const maxYear = new Date().getFullYear()
      results.value = deduplicatePapers(allPapers).filter(p => !p.year || p.year <= maxYear)
      total.value = results.value.length

      // 保存搜索历史
      await saveSearchRecord(query.value)
    } catch (e) {
      error.value = (e as Error).message || 'Search failed'
    } finally {
      isLoading.value = false
    }
  }

  /**
   * 加载下一页（目前主要用于 OpenAlex cursor 分页）
   */
  async function loadMore() {
    if (!query.value.trim()) return

    isLoading.value = true
    error.value = null

    try {
      const cursor = currentCursor.value || undefined
      const openalexResult = await searchOpenAlex(query.value, filters.value, cursor)
      const s2Result = await searchSemanticScholar(query.value, filters.value, results.value.length)
      const crossrefResult = await searchCrossRef(query.value, filters.value, Math.ceil(results.value.length / 25) + 1)

      // 更新 OpenAlex cursor
      if ('nextCursor' in openalexResult) {
        currentCursor.value = (openalexResult as { nextCursor?: string }).nextCursor
      }

      const newPapers = [
        ...openalexResult.papers,
        ...s2Result.papers,
        ...crossrefResult.papers,
      ]

      const maxYear = new Date().getFullYear()
      const dedupedNew = deduplicatePapers([...results.value, ...newPapers]).filter(p => !p.year || p.year <= maxYear)
      const added = dedupedNew.slice(results.value.length)
      results.value = dedupedNew
      total.value = dedupedNew.length
    } catch (e) {
      error.value = (e as Error).message || 'Load more failed'
    } finally {
      isLoading.value = false
    }
  }

  function setQuery(q: string) {
    query.value = q
  }

  function setFilters(f: SearchFilters) {
    filters.value = { ...f }
  }

  function clearResults() {
    results.value = []
    total.value = 0
    error.value = null
    currentCursor.value = undefined
  }

  /**
   * 从 IndexedDB 加载搜索历史
   */
  async function loadSearchHistory() {
    try {
      searchHistory.value = await dbGetSearchHistory()
    } catch (e) {
      console.warn('Failed to load search history:', e)
    }
  }

  /**
   * 保存搜索记录到 IndexedDB
   */
  async function saveSearchRecord(q: string) {
    try {
      const record: SearchRecord = {
        query: q,
        filters: JSON.stringify(filters.value),
        timestamp: new Date(),
      }
      const id = await dbAddSearchRecord(record)
      record.id = id
      searchHistory.value.unshift(record)
    } catch (e) {
      console.warn('Failed to save search record:', e)
    }
  }

  /**
   * 清除搜索历史
   */
  async function clearHistory() {
    try {
      await dbClearSearchHistory()
      searchHistory.value = []
    } catch (e) {
      console.warn('Failed to clear search history:', e)
    }
  }

  /**
   * 从已有搜索结果中按 ID 查找论文（缓存命中最快最可靠）
   */
  function getPaperFromCache(id: string): Paper | undefined {
    return results.value.find(p => p.id === id)
  }

  return {
    // state
    query,
    filters,
    results,
    total,
    isLoading,
    error,
    currentCursor,
    searchHistory,
    // getters
    getPaperFromCache,
    // actions
    search,
    loadMore,
    setQuery,
    setFilters,
    clearResults,
    loadSearchHistory,
    saveSearchRecord,
    clearSearchHistory: clearHistory,
  }
})
