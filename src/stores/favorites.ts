/**
 * Pinia 收藏/文库状态 store
 *
 * 管理论文收藏、标签、笔记、阅读状态等个人知识管理功能。
 * 数据持久化到 IndexedDB（通过 src/db 层）。
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Paper, SavedPaper, Tag, ReadingStatus } from '../types/paper'
import {
  db,
  addPaper as dbAddPaper,
  getPaper as dbGetPaper,
  updatePaper as dbUpdatePaper,
  deletePaper as dbDeletePaper,
  getAllPapers,
  addTag as dbAddTag,
  getTags as dbGetTags,
  updateTag as dbUpdateTag,
  deleteTag as dbDeleteTag,
} from '../db'

export const useFavoritesStore = defineStore('favorites', () => {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const papers = ref<SavedPaper[]>([])
  const tags = ref<Tag[]>([])
  const selectedPapers = ref<Set<string>>(new Set())
  const loading = ref(false)

  // ---------------------------------------------------------------------------
  // Getters
  // ---------------------------------------------------------------------------

  /** 按标签筛选论文 */
  function papersByTag(tagId: string): SavedPaper[] {
    return papers.value.filter((p) => p.tags.includes(tagId))
  }

  /** 按阅读状态筛选论文 */
  function papersByStatus(status: ReadingStatus): SavedPaper[] {
    return papers.value.filter((p) => p.readingStatus === status)
  }

  /** 判断论文是否已收藏 */
  function isSaved(paperId: string): boolean {
    return papers.value.some((p) => p.id === paperId)
  }

  /** 获取论文笔记 */
  function getPaperNotes(paperId: string): string {
    return papers.value.find((p) => p.id === paperId)?.notes ?? ''
  }

  /** 已选论文数量 */
  const selectedCount = computed(() => selectedPapers.value.size)

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  /** 从 IndexedDB 加载所有收藏和标签 */
  async function loadLibrary() {
    loading.value = true
    try {
      const [savedPapers, savedTags] = await Promise.all([
        getAllPapers(),
        dbGetTags(),
      ])
      papers.value = savedPapers
      tags.value = savedTags
    } catch (e) {
      console.error('Failed to load library:', e)
    } finally {
      loading.value = false
    }
  }

  /** 收藏论文（将 Paper 转为 SavedPaper 存入 IndexedDB） */
  async function addPaper(paper: Paper) {
    if (isSaved(paper.id)) return

    const now = new Date()
    const savedPaper: SavedPaper = {
      ...paper,
      tags: [],
      notes: '',
      readingStatus: 'unread',
      addedAt: now,
      updatedAt: now,
    }

    await dbAddPaper(savedPaper)
    papers.value.push(savedPaper)
  }

  /** 移除收藏 */
  async function removePaper(id: string) {
    await dbDeletePaper(id)
    papers.value = papers.value.filter((p) => p.id !== id)
    selectedPapers.value.delete(id)
  }

  /** 更新笔记 */
  async function updateNotes(paperId: string, notes: string) {
    await dbUpdatePaper(paperId, { notes, updatedAt: new Date() })
    const paper = papers.value.find((p) => p.id === paperId)
    if (paper) {
      paper.notes = notes
      paper.updatedAt = new Date()
    }
  }

  /** 更新阅读状态 */
  async function updateReadingStatus(paperId: string, status: ReadingStatus) {
    await dbUpdatePaper(paperId, { readingStatus: status, updatedAt: new Date() })
    const paper = papers.value.find((p) => p.id === paperId)
    if (paper) {
      paper.readingStatus = status
      paper.updatedAt = new Date()
    }
  }

  /** 给论文添加标签 */
  async function addTagToPaper(paperId: string, tagId: string) {
    const paper = papers.value.find((p) => p.id === paperId)
    if (!paper || paper.tags.includes(tagId)) return

    const updatedTags = [...paper.tags, tagId]
    await dbUpdatePaper(paperId, { tags: updatedTags, updatedAt: new Date() })
    paper.tags = updatedTags
    paper.updatedAt = new Date()
  }

  /** 从论文移除标签 */
  async function removeTagFromPaper(paperId: string, tagId: string) {
    const paper = papers.value.find((p) => p.id === paperId)
    if (!paper) return

    const updatedTags = paper.tags.filter((t) => t !== tagId)
    await dbUpdatePaper(paperId, { tags: updatedTags, updatedAt: new Date() })
    paper.tags = updatedTags
    paper.updatedAt = new Date()
  }

  /** 创建新标签 */
  async function createTag(name: string, color: string = '#1890ff') {
    // 检查是否重名
    if (tags.value.some((t) => t.name === name)) return

    const tag: Tag = {
      id: crypto.randomUUID(),
      name,
      color,
      createdAt: new Date(),
    }

    await dbAddTag(tag)
    tags.value.push(tag)
  }

  /** 删除标签（同时从所有论文中移除该标签） */
  async function deleteTagAction(id: string) {
    await dbDeleteTag(id)
    tags.value = tags.value.filter((t) => t.id !== id)

    // 从所有论文中移除该标签
    const affectedPapers = papers.value.filter((p) => p.tags.includes(id))
    for (const paper of affectedPapers) {
      const updatedTags = paper.tags.filter((t) => t !== id)
      await dbUpdatePaper(paper.id, { tags: updatedTags, updatedAt: new Date() })
      paper.tags = updatedTags
      paper.updatedAt = new Date()
    }
  }

  /** 切换选中状态 */
  function toggleSelect(paperId: string) {
    if (selectedPapers.value.has(paperId)) {
      selectedPapers.value.delete(paperId)
    } else {
      selectedPapers.value.add(paperId)
    }
    // 触发响应式更新
    selectedPapers.value = new Set(selectedPapers.value)
  }

  /** 全选 */
  function selectAll() {
    selectedPapers.value = new Set(papers.value.map((p) => p.id))
  }

  /** 取消全选 */
  function deselectAll() {
    selectedPapers.value = new Set()
  }

  /** 批量添加标签到已选论文 */
  async function batchAddTag(tagId: string) {
    const selectedIds = Array.from(selectedPapers.value)
    for (const paperId of selectedIds) {
      await addTagToPaper(paperId, tagId)
    }
  }

  /** 批量移除已选论文 */
  async function batchRemove() {
    const selectedIds = Array.from(selectedPapers.value)
    for (const paperId of selectedIds) {
      await removePaper(paperId)
    }
    selectedPapers.value = new Set()
  }

  /**
   * 导出选中论文
   *
   * @param format - 'bibtex' 使用 citation-js 生成，'json' 导出为 JSON
   */
  async function exportSelected(format: 'bibtex' | 'json') {
    const selectedIds = Array.from(selectedPapers.value)
    const selected = papers.value.filter((p) => selectedIds.includes(p.id))
    return exportPapers(selected, format)
  }

  /** 导出所有收藏 */
  async function exportAll(format: 'bibtex' | 'json') {
    return exportPapers(papers.value, format)
  }

  // ---------------------------------------------------------------------------
  // Internal helpers
  // ---------------------------------------------------------------------------

  async function exportPapers(papersToExport: SavedPaper[], format: 'bibtex' | 'json') {
    if (format === 'json') {
      return JSON.stringify(papersToExport, null, 2)
    }

    // BibTeX: 使用 citation-js
    const { Cite } = await import('citation-js')
    const cite = new Cite()

    for (const paper of papersToExport) {
      cite.add({
        type: 'article-journal',
        title: paper.title,
        author: paper.authors.map((a) => ({ literal: a.name })),
        issued: paper.year ? { 'date-parts': [[paper.year]] } : undefined,
        DOI: paper.doi,
        'container-title': paper.venue,
        abstract: paper.abstract,
      })
    }

    return cite.format('bibtex')
  }

  return {
    // state
    papers,
    tags,
    selectedPapers,
    loading,
    // getters
    papersByTag,
    papersByStatus,
    isSaved,
    getPaperNotes,
    selectedCount,
    // actions
    loadLibrary,
    addPaper,
    removePaper,
    updateNotes,
    updateReadingStatus,
    addTagToPaper,
    removeTagFromPaper,
    createTag,
    deleteTag: deleteTagAction,
    toggleSelect,
    selectAll,
    deselectAll,
    batchAddTag,
    batchRemove,
    exportSelected,
    exportAll,
  }
})
