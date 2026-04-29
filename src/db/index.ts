/**
 * Dexie.js 数据库定义
 *
 * 基于 IndexedDB 的本地持久化层，使用 Dexie 封装。
 * 提供 5 个表以及通用 CRUD、导入导出、清除等方法。
 */

import Dexie, { type EntityTable } from 'dexie'
import type { Paper, SavedPaper, Tag, SearchRecord, Subscription } from '../types/paper'

// ---------------------------------------------------------------------------
// Schema 类型
// ---------------------------------------------------------------------------

/** settings 表的行结构 */
interface SettingRow {
  key: string
  value: unknown
}

// ---------------------------------------------------------------------------
// Database class
// ---------------------------------------------------------------------------

class ScholarDB extends Dexie {
  papers!: EntityTable<SavedPaper, 'id'>
  tags!: EntityTable<Tag, 'id'>
  searchHistory!: EntityTable<SearchRecord, 'id'>
  subscriptions!: EntityTable<Subscription, 'id'>
  settings!: EntityTable<SettingRow, 'key'>

  constructor() {
    super('ScholarSearchDB')

    this.version(1).stores({
      papers: 'id, doi, title, year, readingStatus, *tags',
      tags: '++id, &name',
      searchHistory: '++id, query',
      subscriptions: '++id, keyword',
      settings: '&key',
    })
  }
}

// ---------------------------------------------------------------------------
// Singleton
// ---------------------------------------------------------------------------

export const db = new ScholarDB()

// ---------------------------------------------------------------------------
// Papers CRUD
// ---------------------------------------------------------------------------

/** 添加一篇论文到收藏 */
export async function addPaper(paper: SavedPaper): Promise<string> {
  return db.papers.add(paper)
}

/** 通过 id 获取单篇论文 */
export async function getPaper(id: string): Promise<SavedPaper | undefined> {
  return db.papers.get(id)
}

/** 更新论文（局部更新） */
export async function updatePaper(
  id: string,
  changes: Partial<SavedPaper>,
): Promise<number> {
  return db.papers.update(id, changes)
}

/** 删除论文 */
export async function deletePaper(id: string): Promise<void> {
  return db.papers.delete(id)
}

/** 获取所有收藏的论文 */
export async function getAllPapers(): Promise<SavedPaper[]> {
  return db.papers.toArray()
}

// ---------------------------------------------------------------------------
// Tags CRUD
// ---------------------------------------------------------------------------

/** 创建标签 */
export async function addTag(tag: Tag): Promise<string> {
  return db.tags.add(tag)
}

/** 获取所有标签 */
export async function getTags(): Promise<Tag[]> {
  return db.tags.toArray()
}

/** 更新标签 */
export async function updateTag(
  id: string,
  changes: Partial<Tag>,
): Promise<number> {
  return db.tags.update(id, changes)
}

/** 删除标签 */
export async function deleteTag(id: string): Promise<void> {
  return db.tags.delete(id)
}

// ---------------------------------------------------------------------------
// Search History
// ---------------------------------------------------------------------------

/** 添加搜索记录 */
export async function addSearchRecord(record: SearchRecord): Promise<number> {
  return db.searchHistory.add(record)
}

/** 获取搜索历史（按时间倒序） */
export async function getSearchHistory(): Promise<SearchRecord[]> {
  return db.searchHistory.orderBy('id').reverse().toArray()
}

/** 清除搜索历史 */
export async function clearSearchHistory(): Promise<void> {
  return db.searchHistory.clear()
}

// ---------------------------------------------------------------------------
// Subscriptions CRUD
// ---------------------------------------------------------------------------

/** 添加订阅 */
export async function addSubscription(sub: Subscription): Promise<string> {
  return db.subscriptions.add(sub)
}

/** 获取所有订阅 */
export async function getSubscriptions(): Promise<Subscription[]> {
  return db.subscriptions.toArray()
}

/** 删除订阅 */
export async function deleteSubscription(id: string): Promise<void> {
  return db.subscriptions.delete(id)
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

/** 获取设置项 */
export async function getSetting<T = unknown>(key: string): Promise<T | undefined> {
  const row = await db.settings.get(key)
  return row ? (row.value as T) : undefined
}

/** 写入设置项 */
export async function setSetting(key: string, value: unknown): Promise<void> {
  await db.settings.put({ key, value })
}

// ---------------------------------------------------------------------------
// Export / Import / Clear
// ---------------------------------------------------------------------------

interface ExportData {
  papers: SavedPaper[]
  tags: Tag[]
  searchHistory: SearchRecord[]
  subscriptions: Subscription[]
  settings: SettingRow[]
  exportedAt: string
}

/** 将所有表数据导出为 JSON 对象 */
export async function exportAllData(): Promise<ExportData> {
  const [papers, tags, searchHistory, subscriptions, settings] = await Promise.all([
    db.papers.toArray(),
    db.tags.toArray(),
    db.searchHistory.toArray(),
    db.subscriptions.toArray(),
    db.settings.toArray(),
  ])

  return {
    papers,
    tags,
    searchHistory,
    subscriptions,
    settings,
    exportedAt: new Date().toISOString(),
  }
}

/** 从 JSON 对象恢复所有数据（先清空再写入） */
export async function importAllData(json: ExportData): Promise<void> {
  await db.transaction('rw', [db.papers, db.tags, db.searchHistory, db.subscriptions, db.settings], async () => {
    await db.papers.clear()
    await db.tags.clear()
    await db.searchHistory.clear()
    await db.subscriptions.clear()
    await db.settings.clear()

    if (json.papers?.length) await db.papers.bulkAdd(json.papers)
    if (json.tags?.length) await db.tags.bulkAdd(json.tags)
    if (json.searchHistory?.length) await db.searchHistory.bulkAdd(json.searchHistory)
    if (json.subscriptions?.length) await db.subscriptions.bulkAdd(json.subscriptions)
    if (json.settings?.length) await db.settings.bulkAdd(json.settings)
  })
}

/** 清除所有数据 */
export async function clearAllData(): Promise<void> {
  await db.transaction('rw', [db.papers, db.tags, db.searchHistory, db.subscriptions, db.settings], async () => {
    await db.papers.clear()
    await db.tags.clear()
    await db.searchHistory.clear()
    await db.subscriptions.clear()
    await db.settings.clear()
  })
}
