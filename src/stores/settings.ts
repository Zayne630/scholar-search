/**
 * Pinia 设置状态 store
 *
 * 管理语言、主题、API Key、GitHub Gist 同步、数据导入导出等设置。
 * 设置持久化到 IndexedDB（通过 src/db 层）和 localStorage。
 */

import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  getSetting,
  setSetting as dbSetSetting,
  exportAllData,
  importAllData as dbImportAllData,
  clearAllData as dbClearAllData,
} from '../db'
import type { LLMProvider } from '../api/llm'
import type { TranslationService } from '../api/translate'

export const useSettingsStore = defineStore('settings', () => {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  const locale = ref<'zh' | 'en'>('zh')
  const theme = ref<'light' | 'dark' | 'system'>('system')
  const openalexKey = ref('')
  const semanticScholarKey = ref('')
  const gistToken = ref('')
  const lastSyncTime = ref<Date | null>(null)

  // AI / LLM settings
  const llmProvider = ref<LLMProvider | ''>('')
  const llmApiKey = ref('')
  const llmModel = ref('')

  // Translation settings
  const translationService = ref<TranslationService>('ai')
  const deeplApiKey = ref('')
  const baiduAppId = ref('')
  const baiduSecretKey = ref('')

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  /** 从 IndexedDB 加载设置 */
  async function loadSettings() {
    try {
      const savedLocale = await getSetting<string>('locale')
      const savedTheme = await getSetting<string>('theme')
      const savedOpenalexKey = await getSetting<string>('openalexKey')
      const savedSemanticScholarKey = await getSetting<string>('semanticScholarKey')
      const savedGistToken = await getSetting<string>('gistToken')
      const savedLastSyncTime = await getSetting<string>('lastSyncTime')
      const savedLlmProvider = await getSetting<string>('llmProvider')
      const savedLlmApiKey = await getSetting<string>('llmApiKey')
      const savedLlmModel = await getSetting<string>('llmModel')

      if (savedLocale) locale.value = savedLocale as 'zh' | 'en'
      if (savedTheme) theme.value = savedTheme as 'light' | 'dark' | 'system'
      if (savedOpenalexKey) openalexKey.value = savedOpenalexKey
      if (savedSemanticScholarKey) semanticScholarKey.value = savedSemanticScholarKey
      if (savedGistToken) gistToken.value = savedGistToken
      if (savedLastSyncTime) lastSyncTime.value = new Date(savedLastSyncTime)
      if (savedLlmProvider) llmProvider.value = savedLlmProvider as LLMProvider
      if (savedLlmApiKey) llmApiKey.value = savedLlmApiKey
      if (savedLlmModel) llmModel.value = savedLlmModel

      // Translation settings
      const savedTranslationService = await getSetting<string>('translationService')
      const savedDeeplApiKey = await getSetting<string>('deeplApiKey')
      const savedBaiduAppId = await getSetting<string>('baiduAppId')
      const savedBaiduSecretKey = await getSetting<string>('baiduSecretKey')
      if (savedTranslationService) translationService.value = savedTranslationService as TranslationService
      if (savedDeeplApiKey) deeplApiKey.value = savedDeeplApiKey
      if (savedBaiduAppId) baiduAppId.value = savedBaiduAppId
      if (savedBaiduSecretKey) baiduSecretKey.value = savedBaiduSecretKey

      // 应用主题
      applyTheme(theme.value)
    } catch (e) {
      console.warn('Failed to load settings:', e)
    }
  }

  /** 设置语言，保存到 IndexedDB 并更新 vue-i18n locale */
  async function setLocale(l: 'zh' | 'en') {
    locale.value = l
    await dbSetSetting('locale', l)

    // 更新 vue-i18n
    try {
      const { default: i18n } = await import('../i18n')
      i18n.global.locale.value = l
    } catch {
      // i18n 可能未初始化
    }
    localStorage.setItem('locale', l)
  }

  /** 设置主题，保存到 IndexedDB 并应用到 html 元素 */
  async function setTheme(t: 'light' | 'dark' | 'system') {
    theme.value = t
    await dbSetSetting('theme', t)
    applyTheme(t)
  }

  /** 应用主题到 DOM */
  function applyTheme(t: 'light' | 'dark' | 'system') {
    const html = document.documentElement
    if (t === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      html.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
    } else {
      html.setAttribute('data-theme', t)
    }
  }

  /**
   * 保存 API Key
   *
   * @param api - 'openalex' | 'semanticScholar'
   * @param key - API Key 字符串
   */
  async function setApiKey(api: 'openalex' | 'semanticScholar', key: string) {
    const settingKey = api === 'openalex' ? 'openalexKey' : 'semanticScholarKey'
    const refToUpdate = api === 'openalex' ? openalexKey : semanticScholarKey

    refToUpdate.value = key
    await dbSetSetting(settingKey, key)

    // 同步写入 localStorage 供 API 层读取
    try {
      const raw = localStorage.getItem('settings')
      const settings = raw ? JSON.parse(raw) : {}
      settings[settingKey] = key
      localStorage.setItem('settings', JSON.stringify(settings))
    } catch {
      // ignore
    }
  }

  /** 将所有数据上传到 GitHub Gist */
  async function syncToGist() {
    if (!gistToken.value) {
      throw new Error('GitHub Gist token is not configured')
    }

    const data = await exportAllData()
    const gistId = await getSetting<string>('gistId')

    const body = {
      description: `Scholar Search backup - ${new Date().toISOString()}`,
      public: false,
      files: {
        'scholar-search-backup.json': {
          content: JSON.stringify(data, null, 2),
        },
      },
      ...(gistId ? {} : {}),
    }

    try {
      const response = await fetch(
        gistId
          ? `https://api.github.com/gists/${gistId}`
          : 'https://api.github.com/gists',
        {
          method: gistId ? 'PATCH' : 'POST',
          headers: {
            Authorization: `Bearer ${gistToken.value}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        },
      )

      if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(`GitHub API error: ${response.status} ${errorBody}`)
      }

      const result = await response.json()

      // 保存 gistId 以便下次更新
      if (!gistId && result.id) {
        await dbSetSetting('gistId', result.id)
      }

      lastSyncTime.value = new Date()
      await dbSetSetting('lastSyncTime', lastSyncTime.value.toISOString())
    } catch (e) {
      throw new Error(`Sync to Gist failed: ${(e as Error).message}`)
    }
  }

  /** 从 GitHub Gist 恢复数据 */
  async function syncFromGist() {
    if (!gistToken.value) {
      throw new Error('GitHub Gist token is not configured')
    }

    const gistId = await getSetting<string>('gistId')
    if (!gistId) {
      throw new Error('No Gist ID found. Please sync to Gist first.')
    }

    try {
      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        headers: {
          Authorization: `Bearer ${gistToken.value}`,
        },
      })

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const gist = await response.json()
      const file = gist.files?.['scholar-search-backup.json']
      if (!file?.content) {
        throw new Error('No backup data found in Gist')
      }

      const data = JSON.parse(file.content)
      await dbImportAllData(data)
    } catch (e) {
      throw new Error(`Sync from Gist failed: ${(e as Error).message}`)
    }
  }

  /** 触发下载所有数据的 JSON 文件 */
  async function exportData() {
    const data = await exportAllData()
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `scholar-search-backup-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  /** 从文件导入数据 */
  async function importData(file: File) {
    const text = await file.text()
    const data = JSON.parse(text)
    await dbImportAllData(data)
  }

  /** 设置翻译服务配置 */
  async function setTranslationConfig(
    service: TranslationService,
    extras?: {
      deeplApiKey?: string
      baiduAppId?: string
      baiduSecretKey?: string
    },
  ) {
    translationService.value = service
    await dbSetSetting('translationService', service)

    if (extras) {
      if (extras.deeplApiKey !== undefined) {
        deeplApiKey.value = extras.deeplApiKey
        await dbSetSetting('deeplApiKey', extras.deeplApiKey)
      }
      if (extras.baiduAppId !== undefined) {
        baiduAppId.value = extras.baiduAppId
        await dbSetSetting('baiduAppId', extras.baiduAppId)
      }
      if (extras.baiduSecretKey !== undefined) {
        baiduSecretKey.value = extras.baiduSecretKey
        await dbSetSetting('baiduSecretKey', extras.baiduSecretKey)
      }
    }
  }

  /** 清除所有数据 */
  async function clearAll() {
    await dbClearAllData()
    // 重置状态
    locale.value = 'zh'
    theme.value = 'system'
    openalexKey.value = ''
    semanticScholarKey.value = ''
    gistToken.value = ''
    lastSyncTime.value = null
    llmProvider.value = ''
    llmApiKey.value = ''
    llmModel.value = ''
    translationService.value = 'ai'
    deeplApiKey.value = ''
    baiduAppId.value = ''
    baiduSecretKey.value = ''
    applyTheme('system')
    localStorage.removeItem('locale')
    localStorage.removeItem('settings')
  }

  /** 设置 LLM 配置 */
  async function setLLMConfig(
    provider: LLMProvider | '',
    apiKey: string,
    model?: string,
  ) {
    llmProvider.value = provider
    llmApiKey.value = apiKey
    if (model !== undefined) llmModel.value = model

    await dbSetSetting('llmProvider', provider)
    await dbSetSetting('llmApiKey', apiKey)
    await dbSetSetting('llmModel', model ?? '')
  }

  return {
    // state
    locale,
    theme,
    openalexKey,
    semanticScholarKey,
    gistToken,
    lastSyncTime,
    llmProvider,
    llmApiKey,
    llmModel,
    translationService,
    deeplApiKey,
    baiduAppId,
    baiduSecretKey,
    // actions
    loadSettings,
    setLocale,
    setTheme,
    setApiKey,
    setLLMConfig,
    setTranslationConfig,
    syncToGist,
    syncFromGist,
    exportData,
    importData,
    clearAllData: clearAll,
  }
})
