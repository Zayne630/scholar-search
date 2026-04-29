<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMessage } from 'naive-ui'
import { useFavoritesStore } from '../stores/favorites'
import { useSettingsStore } from '../stores/settings'
import { getPaperById, getPaperReferences, getPaperCitations, getRecommendedPapers } from '../api/semanticscholar'
import { searchByDOI as searchByDOI_OpenAlex, searchPapers as searchPapersOpenAlex, getWorkById, getReferences as getOAReferences, getCitations as getOACitations } from '../api/openalex'
import { searchByDOI as searchByDOI_CrossRef } from '../api/crossref'
import { translateText, type TranslationConfig } from '../api/translate'
import type { Paper } from '../types/paper'
import {
  NButton,
  NIcon,
  NSpin,
  NResult,
  NTabs,
  NTabPane,
  NTag,
  NSpace,
  NTooltip,
  NDivider,
  NCard,
  NEmpty,
  NModal,
  NInput,
  NSelect,
  NDropdown,
} from 'naive-ui'
import {
  ArrowBackOutline,
  HeartOutline,
  Heart,
  DocumentTextOutline,
  ShareSocialOutline,
  BookmarkOutline,
  OpenOutline,
  ChatboxEllipsesOutline,
  LibraryOutline,
  Bookmark,
} from '@vicons/ionicons5'
import * as echarts from 'echarts'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const message = useMessage()
const favoritesStore = useFavoritesStore()
const settingsStore = useSettingsStore()

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const paper = ref<Paper | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const notFound = ref(false)

const references = ref<Paper[]>([])
const citations = ref<Paper[]>([])
const similar = ref<Paper[]>([])
const relationLoading = ref(false)

const activeRelationTab = ref('references')

// Citation graph
const chartRef = ref<HTMLDivElement | null>(null)
let chartInstance: echarts.ECharts | null = null

// Share modal
const showShareModal = ref(false)
const shareLink = ref('')

// Notes
const showNotesModal = ref(false)
const editingNotes = ref('')

// Reading status options
const readingStatusOptions = computed(() => [
  { label: t('library.unread'), value: 'unread' },
  { label: t('library.reading'), value: 'reading' },
  { label: t('library.read'), value: 'read' },
])

// Translation state
const detailTranslationCache = new Map<string, string>()
const translatingAbstract = ref(false)
const translatedAbstract = ref('')

function isChinese(text: string): boolean {
  const chineseChars = text.match(/[一-鿿]/g)
  return (chineseChars?.length ?? 0) / text.length > 0.1
}

function getTranslationConfig(): TranslationConfig {
  const service = settingsStore.translationService || 'ai'
  return {
    service,
    llmProvider: settingsStore.llmProvider,
    llmApiKey: settingsStore.llmApiKey,
    llmModel: settingsStore.llmModel,
    deeplApiKey: settingsStore.deeplApiKey,
    baiduAppId: settingsStore.baiduAppId,
    baiduSecretKey: settingsStore.baiduSecretKey,
  }
}

async function translateAbstract() {
  if (!paper.value?.abstract) return
  if (isChinese(paper.value.abstract)) return
  // If already cached, use it
  if (detailTranslationCache.has(paper.value.id)) {
    translatedAbstract.value = detailTranslationCache.get(paper.value.id)!
    return
  }

  translatingAbstract.value = true
  try {
    const config = getTranslationConfig()
    translatedAbstract.value = await translateText(paper.value.abstract, config)
    if (translatedAbstract.value) {
      detailTranslationCache.set(paper.value.id, translatedAbstract.value)
    }
  } catch (e) {
    console.warn('Translation failed:', e)
  } finally {
    translatingAbstract.value = false
  }
}

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------

const paperId = computed(() => route.params.id as string)

const isSaved = computed(() => paper.value ? favoritesStore.isSaved(paper.value.id) : false)

const savedPaper = computed(() => {
  if (!paper.value) return null
  return favoritesStore.papers.find(p => p.id === paper.value!.id) ?? null
})

const authorList = computed(() => {
  if (!paper.value?.authors?.length) return []
  return paper.value.authors
})

// ---------------------------------------------------------------------------
// Load paper
// ---------------------------------------------------------------------------

async function loadPaper() {
  loading.value = true
  error.value = null
  notFound.value = false
  paper.value = null

  try {
    const id = paperId.value
    let result: Paper | null = null

    // Strategy 0: 从 search store 缓存中查找（最快最可靠）
    const { useSearchStore } = await import('../stores/search')
    const searchStore = useSearchStore()
    result = searchStore.getPaperFromCache(id) ?? null

    // Strategy 0.5: 从 favorites store 中查找
    if (!result) {
      const fav = favoritesStore.papers.find(p => p.id === id)
      if (fav) result = fav
    }

    // Strategy 1: OpenAlex ID 直接查询 (W 开头)
    if (!result && /^[WA]\d+$/i.test(id)) {
      try {
        result = await getWorkById(id)
      } catch { /* ignore */ }
    }

    // Strategy 2: DOI 查询
    if (!result && (id.startsWith('10.') || id.includes('/'))) {
      try { result = await searchByDOI_OpenAlex(id) } catch {}
      if (!result) {
        try { result = await searchByDOI_CrossRef(id) } catch {}
      }
    }

    // Strategy 3: Semantic Scholar (可能因 CORS 失败)
    if (!result) {
      try {
        const resolvedId = id.startsWith('10.') ? `DOI:${id}` : id
        result = await getPaperById(resolvedId)
      } catch {}
    }

    // Strategy 4: 用标题搜索（如果有 DOI，从 DOI 中提取信息搜索）
    if (!result) {
      try {
        const searchResults = await searchPapersOpenAlex(id, undefined, undefined, 5)
        // 精确匹配第一个结果
        if (searchResults.papers.length > 0) {
          result = searchResults.papers[0]
        }
      } catch {}
    }

    if (!result) {
      notFound.value = true
    } else {
      paper.value = result
      loadRelations()
    }
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    loading.value = false
  }
}

async function loadRelations() {
  if (!paper.value) return
  relationLoading.value = true

  try {
    const id = paper.value.id
    const s2Id = paper.value.externalIds?.doi
      ? `DOI:${paper.value.externalIds.doi}`
      : id

    // Try Semantic Scholar first (may fail due to CORS)
    const [refsResult, citesResult, similarResult] = await Promise.allSettled([
      getPaperReferences(s2Id, 0, 50),
      getPaperCitations(s2Id, 0, 50),
      getRecommendedPapers(s2Id, 20),
    ])

    if (refsResult.status === 'fulfilled' && refsResult.value.papers.length > 0) {
      references.value = refsResult.value.papers
    }
    if (citesResult.status === 'fulfilled' && citesResult.value.papers.length > 0) {
      citations.value = citesResult.value.papers
    }
    if (similarResult.status === 'fulfilled' && similarResult.value.length > 0) {
      similar.value = similarResult.value
    }

    // Fallback to OpenAlex if Semantic Scholar failed
    if (references.value.length === 0 || citations.value.length === 0) {
      const oaId = paper.value.externalIds?.openalex || (id.startsWith('W') ? id : null)
      if (oaId) {
        const [oaRefs, oaCites] = await Promise.allSettled([
          getOAReferences(oaId, 20),
          getOACitations(oaId, 20),
        ])
        if (references.value.length === 0 && oaRefs.status === 'fulfilled') {
          references.value = oaRefs.value
        }
        if (citations.value.length === 0 && oaCites.status === 'fulfilled') {
          citations.value = oaCites.value
        }
      }
    }

    // Fallback similar: search by title keywords
    if (similar.value.length === 0 && paper.value.title) {
      try {
        const keywords = paper.value.title.split(/\s+/).filter(w => w.length > 4).slice(0, 5).join(' ')
        if (keywords) {
          const simResult = await searchPapersOpenAlex(keywords, undefined, undefined, 10)
          similar.value = simResult.papers.filter(p => p.id !== id)
        }
      } catch { /* ignore */ }
    }

    await nextTick()
    renderCitationGraph()
  } catch (e) {
    console.warn('Failed to load relations:', e)
  } finally {
    relationLoading.value = false
  }
}

// ---------------------------------------------------------------------------
// Citation Graph (ECharts force-directed graph)
// ---------------------------------------------------------------------------

function renderCitationGraph() {
  if (!chartRef.value || !paper.value) return

  if (!chartInstance) {
    chartInstance = echarts.init(chartRef.value)
    window.addEventListener('resize', () => chartInstance?.resize())
  }

  const currentId = paper.value.id
  const nodes: echarts.EChartsOption['series'] = []
  const links: { source: string; target: string }[] = []
  const nodeData: { name: string; category: number; symbolSize: number; value: string; itemStyle?: { color?: string } }[] = []

  // Current paper node
  nodeData.push({
    name: currentId,
    category: 0,
    symbolSize: 50,
    value: paper.value.title,
    itemStyle: { color: '#6366f1' },
  })

  // Reference nodes (category 1)
  references.value.slice(0, 20).forEach(ref => {
    nodeData.push({
      name: ref.id,
      category: 1,
      symbolSize: 25,
      value: ref.title,
      itemStyle: { color: '#10b981' },
    })
    links.push({ source: currentId, target: ref.id })
  })

  // Citation nodes (category 2)
  citations.value.slice(0, 20).forEach(cite => {
    if (!nodeData.find(n => n.name === cite.id)) {
      nodeData.push({
        name: cite.id,
        category: 2,
        symbolSize: 25,
        value: cite.title,
        itemStyle: { color: '#f59e0b' },
      })
    }
    links.push({ source: cite.id, target: currentId })
  })

  const option: echarts.EChartsOption = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.dataType === 'node') {
          const title = params.data.value || params.name
          return title.length > 60 ? title.slice(0, 60) + '...' : title
        }
        return ''
      },
    },
    legend: {
      data: [t('paper.abstract'), t('paper.references'), t('paper.citedBy')],
      bottom: 0,
      textStyle: { color: 'var(--text-secondary)' },
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        roam: true,
        draggable: true,
        label: { show: false },
        force: {
          repulsion: 200,
          gravity: 0.1,
          edgeLength: 80,
        },
        categories: [
          { name: t('paper.abstract') },
          { name: t('paper.references') },
          { name: t('paper.citedBy') },
        ],
        data: nodeData,
        links: links.map(l => ({ ...l, lineStyle: { opacity: 0.4 } })),
        emphasis: {
          focus: 'adjacency',
          lineStyle: { width: 3 },
        },
      },
    ],
  }

  chartInstance.setOption(option, true)

  // Click handler
  chartInstance.off('click')
  chartInstance.on('click', (params: any) => {
    if (params.dataType === 'node' && params.data.name !== currentId) {
      router.push({ name: 'paper', params: { id: params.data.name } })
    }
  })
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function goBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

function toggleFavorite() {
  if (!paper.value) return
  if (isSaved.value) {
    favoritesStore.removePaper(paper.value.id)
    message.success(t('paper.removeFromLibrary'))
  } else {
    favoritesStore.addPaper(paper.value)
    message.success(t('paper.addToLibrary'))
  }
}

function searchAuthor(authorName: string) {
  router.push({ path: '/search', query: { q: authorName } })
}

function openPdf() {
  if (paper.value?.pdfUrl) {
    window.open(paper.value.pdfUrl, '_blank')
  }
}

function openDoi() {
  if (paper.value?.doi) {
    window.open(`https://doi.org/${paper.value.doi}`, '_blank')
  }
}

function exportBibtex() {
  if (!paper.value) return
  const p = paper.value
  const key = p.authors[0]?.name?.split(' ').pop()?.toLowerCase() || 'unknown'
  const bib = `@article{${key}${p.year || ''},
  title={${p.title}},
  author={${p.authors.map(a => a.name).join(' and ')}},
  year={${p.year || ''}},
  ${p.venue ? `journal={${p.venue}},` : ''}
  ${p.doi ? `doi={${p.doi}},` : ''}
  abstract={${p.abstract || ''}}
}`
  navigator.clipboard.writeText(bib).then(() => {
    message.success('BibTeX copied to clipboard')
  }).catch(() => {
    // Fallback: create a download
    const blob = new Blob([bib], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${key}${p.year || ''}.bib`
    a.click()
    URL.revokeObjectURL(url)
  })
}

function sharePaper() {
  shareLink.value = window.location.href
  showShareModal.value = true
}

function copyShareLink() {
  navigator.clipboard.writeText(shareLink.value).then(() => {
    message.success('Link copied')
  })
}

function openNotes() {
  if (!paper.value) return
  editingNotes.value = favoritesStore.getPaperNotes(paper.value.id)
  showNotesModal.value = true
}

async function saveNotes() {
  if (!paper.value) return
  await favoritesStore.updateNotes(paper.value.id, editingNotes.value)
  showNotesModal.value = false
  message.success(t('common.save'))
}

async function updateReadingStatus(status: string) {
  if (!paper.value) return
  await favoritesStore.updateReadingStatus(paper.value.id, status as any)
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

onMounted(() => {
  loadPaper()
})

watch(paperId, () => {
  loadPaper()
})

function goToPaper(id: string) {
  router.push({ name: 'paper', params: { id } })
}
</script>

<template>
  <div class="min-h-screen" style="background: var(--bg);">
    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center min-h-[60vh]">
      <NSpin size="large" :description="t('common.loading')" />
    </div>

    <!-- Error -->
    <div v-else-if="error" class="flex items-center justify-center min-h-[60vh]">
      <NResult status="error" :title="t('common.error')" :description="error">
        <template #footer>
          <NButton type="primary" @click="loadPaper">{{ t('common.retry') }}</NButton>
        </template>
      </NResult>
    </div>

    <!-- Not Found -->
    <div v-else-if="notFound" class="flex items-center justify-center min-h-[60vh]">
      <NResult status="404" title="404" :description="t('search.noResults')">
        <template #footer>
          <NButton type="primary" @click="goBack">{{ t('common.back') }}</NButton>
        </template>
      </NResult>
    </div>

    <!-- Paper Content -->
    <div v-else-if="paper" class="max-w-7xl mx-auto px-4 md:px-8 py-6">
      <!-- Top bar -->
      <div class="flex items-center gap-3 mb-6">
        <NButton quaternary @click="goBack">
          <template #icon>
            <NIcon><ArrowBackOutline /></NIcon>
          </template>
          {{ t('common.back') }}
        </NButton>
      </div>

      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Main content -->
        <div class="flex-1 min-w-0">
          <!-- Title -->
          <h1 class="text-2xl md:text-3xl font-bold leading-snug mb-4" style="color: var(--text);">
            {{ paper.title }}
          </h1>

          <!-- Authors -->
          <div class="flex flex-wrap items-center gap-1 mb-4">
            <template v-for="(author, idx) in authorList" :key="idx">
              <span v-if="idx > 0" style="color: var(--text-secondary);">,&nbsp;</span>
              <button
                class="text-sm font-medium hover:underline cursor-pointer bg-transparent border-none"
                style="color: var(--primary);"
                @click="searchAuthor(author.name)"
              >
                {{ author.name }}
              </button>
              <span v-if="author.affiliation" class="text-xs" style="color: var(--text-secondary);">
                ({{ author.affiliation }})
              </span>
            </template>
          </div>

          <!-- Metadata row -->
          <div class="flex flex-wrap items-center gap-3 mb-5">
            <NTag v-if="paper.year" size="medium" :bordered="false" type="info">
              {{ paper.year }}
            </NTag>
            <NTag v-if="paper.venue" size="medium" :bordered="false" type="success">
              {{ paper.venue }}
            </NTag>
            <span class="text-sm" style="color: var(--text-secondary);">
              {{ t('paper.citations') }}: {{ paper.citationCount }}
            </span>
            <a
              v-if="paper.doi"
              class="text-sm hover:underline cursor-pointer"
              style="color: var(--primary);"
              @click.prevent="openDoi"
            >
              DOI: {{ paper.doi }}
            </a>
          </div>

          <!-- Action buttons -->
          <div class="flex flex-wrap items-center gap-2 mb-6">
            <NButton :type="isSaved ? 'error' : 'default'" @click="toggleFavorite">
              <template #icon>
                <NIcon>
                  <Heart v-if="isSaved" />
                  <HeartOutline v-else />
                </NIcon>
              </template>
              {{ isSaved ? t('paper.removeFromLibrary') : t('paper.addToLibrary') }}
            </NButton>

            <NButton v-if="paper.pdfUrl" @click="openPdf">
              <template #icon>
                <NIcon><DocumentTextOutline /></NIcon>
              </template>
              {{ t('paper.viewPdf') }}
            </NButton>

            <NButton @click="exportBibtex">
              <template #icon>
                <NIcon><LibraryOutline /></NIcon>
              </template>
              {{ t('paper.downloadBibtex') }}
            </NButton>

            <NButton @click="sharePaper">
              <template #icon>
                <NIcon><ShareSocialOutline /></NIcon>
              </template>
            </NButton>

            <NButton v-if="isSaved" @click="openNotes">
              <template #icon>
                <NIcon><ChatboxEllipsesOutline /></NIcon>
              </template>
              {{ t('library.notes') }}
            </NButton>
          </div>

          <!-- AI Summary (TLDR) -->
          <div v-if="paper.tldr" class="mb-6">
            <NCard size="small" style="border-left: 3px solid var(--primary);">
              <div class="text-xs font-semibold uppercase tracking-wide mb-2" style="color: var(--primary);">
                {{ t('paper.tldr') }}
              </div>
              <p class="text-sm leading-relaxed" style="color: var(--text);">
                {{ paper.tldr }}
              </p>
            </NCard>
          </div>

          <!-- Abstract -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold mb-2" style="color: var(--text);">
              {{ t('paper.abstract') }}
            </h2>
            <p v-if="paper.abstract" class="text-sm leading-relaxed" style="color: var(--text-secondary);">
              {{ paper.abstract }}
            </p>
            <p v-else class="text-sm italic" style="color: var(--text-secondary);">
              {{ t('paper.noAbstract') }}
            </p>
            <!-- Translate button -->
            <button
              v-if="paper.abstract && !isChinese(paper.abstract)"
              class="mt-2 text-xs font-medium cursor-pointer bg-transparent border-none"
              style="color: var(--primary);"
              @click="translateAbstract"
            >
              {{ translatingAbstract ? '翻译中...' : '翻译摘要' }}
            </button>
            <!-- Translation result -->
            <div v-if="translatedAbstract" class="text-sm leading-relaxed mt-2 pl-3"
                 style="color: var(--text-secondary); border-left: 2px solid var(--primary);">
              {{ translatedAbstract }}
            </div>
          </div>

          <!-- Fields of Study -->
          <div v-if="paper.fieldsOfStudy?.length" class="mb-6">
            <h2 class="text-lg font-semibold mb-2" style="color: var(--text);">
              {{ t('paper.fieldsOfStudy') }}
            </h2>
            <NSpace>
              <NTag v-for="field in paper.fieldsOfStudy" :key="field" size="small" round :bordered="false">
                {{ field }}
              </NTag>
            </NSpace>
          </div>

          <NDivider />

          <!-- Citation Relations -->
          <div class="mb-6">
            <NTabs v-model:value="activeRelationTab" type="line" animated>
              <NTabPane name="references" :tab="`${t('paper.references')} (${references.length})`">
                <NSpin :show="relationLoading">
                  <div v-if="references.length" class="grid gap-3 mt-3">
                    <NCard
                      v-for="ref in references.slice(0, 10)"
                      :key="ref.id"
                      size="small"
                      hoverable
                      class="cursor-pointer"
                      @click="goToPaper(ref.id)"
                    >
                      <div class="text-sm font-medium line-clamp-1" style="color: var(--primary);">
                        {{ ref.title }}
                      </div>
                      <div class="text-xs mt-1" style="color: var(--text-secondary);">
                        {{ ref.authors.slice(0, 3).map(a => a.name).join(', ') }}
                        {{ ref.authors.length > 3 ? 'et al.' : '' }}
                        <span v-if="ref.year"> &middot; {{ ref.year }}</span>
                        <span> &middot; {{ t('search.citations', { count: ref.citationCount }) }}</span>
                      </div>
                    </NCard>
                  </div>
                  <NEmpty v-else :description="t('search.noResults')" class="py-8" />
                </NSpin>
              </NTabPane>

              <NTabPane name="citations" :tab="`${t('paper.citedBy')} (${citations.length})`">
                <NSpin :show="relationLoading">
                  <div v-if="citations.length" class="grid gap-3 mt-3">
                    <NCard
                      v-for="cite in citations.slice(0, 10)"
                      :key="cite.id"
                      size="small"
                      hoverable
                      class="cursor-pointer"
                      @click="goToPaper(cite.id)"
                    >
                      <div class="text-sm font-medium line-clamp-1" style="color: var(--primary);">
                        {{ cite.title }}
                      </div>
                      <div class="text-xs mt-1" style="color: var(--text-secondary);">
                        {{ cite.authors.slice(0, 3).map(a => a.name).join(', ') }}
                        {{ cite.authors.length > 3 ? 'et al.' : '' }}
                        <span v-if="cite.year"> &middot; {{ cite.year }}</span>
                        <span> &middot; {{ t('search.citations', { count: cite.citationCount }) }}</span>
                      </div>
                    </NCard>
                  </div>
                  <NEmpty v-else :description="t('search.noResults')" class="py-8" />
                </NSpin>
              </NTabPane>

              <NTabPane name="similar" :tab="`${t('paper.similar')} (${similar.length})`">
                <NSpin :show="relationLoading">
                  <div v-if="similar.length" class="grid gap-3 mt-3">
                    <NCard
                      v-for="sim in similar.slice(0, 10)"
                      :key="sim.id"
                      size="small"
                      hoverable
                      class="cursor-pointer"
                      @click="goToPaper(sim.id)"
                    >
                      <div class="text-sm font-medium line-clamp-1" style="color: var(--primary);">
                        {{ sim.title }}
                      </div>
                      <div class="text-xs mt-1" style="color: var(--text-secondary);">
                        {{ sim.authors.slice(0, 3).map(a => a.name).join(', ') }}
                        {{ sim.authors.length > 3 ? 'et al.' : '' }}
                        <span v-if="sim.year"> &middot; {{ sim.year }}</span>
                        <span> &middot; {{ t('search.citations', { count: sim.citationCount }) }}</span>
                      </div>
                    </NCard>
                  </div>
                  <NEmpty v-else :description="t('search.noResults')" class="py-8" />
                </NSpin>
              </NTabPane>
            </NTabs>
          </div>

          <!-- Citation Graph -->
          <div class="mb-6">
            <h2 class="text-lg font-semibold mb-3" style="color: var(--text);">
              {{ t('paper.references') }} / {{ t('paper.citedBy') }}
            </h2>
            <div ref="chartRef" class="w-full h-80 md:h-96 rounded-lg" style="background: var(--bg-secondary);" />
          </div>
        </div>

        <!-- Right sidebar (desktop) -->
        <div class="hidden lg:block w-72 shrink-0">
          <div class="sticky top-20 flex flex-col gap-4">
            <!-- External links -->
            <NCard size="small" :title="t('paper.viewSource')">
              <NSpace vertical>
                <a
                  v-if="paper.url"
                  :href="paper.url"
                  target="_blank"
                  class="flex items-center gap-2 text-sm hover:underline"
                  style="color: var(--primary);"
                >
                  <NIcon size="14"><OpenOutline /></NIcon>
                  Semantic Scholar
                </a>
                <a
                  v-if="paper.externalIds?.openalex"
                  :href="`https://openalex.org/works/${paper.externalIds.openalex}`"
                  target="_blank"
                  class="flex items-center gap-2 text-sm hover:underline"
                  style="color: var(--primary);"
                >
                  <NIcon size="14"><OpenOutline /></NIcon>
                  OpenAlex
                </a>
                <a
                  v-if="paper.externalIds?.arxiv"
                  :href="`https://arxiv.org/abs/${paper.externalIds.arxiv}`"
                  target="_blank"
                  class="flex items-center gap-2 text-sm hover:underline"
                  style="color: var(--primary);"
                >
                  <NIcon size="14"><OpenOutline /></NIcon>
                  arXiv
                </a>
                <a
                  v-if="paper.doi"
                  :href="`https://doi.org/${paper.doi}`"
                  target="_blank"
                  class="flex items-center gap-2 text-sm hover:underline"
                  style="color: var(--primary);"
                >
                  <NIcon size="14"><OpenOutline /></NIcon>
                  CrossRef / DOI
                </a>
              </NSpace>
            </NCard>

            <!-- Saved paper info -->
            <NCard v-if="isSaved && savedPaper" size="small" :title="t('paper.addToLibrary')">
              <div class="flex flex-col gap-3">
                <!-- Reading status -->
                <div>
                  <div class="text-xs mb-1" style="color: var(--text-secondary);">Reading Status</div>
                  <NSelect
                    :value="savedPaper.readingStatus"
                    :options="readingStatusOptions"
                    size="small"
                    @update:value="updateReadingStatus"
                  />
                </div>

                <!-- Tags -->
                <div>
                  <div class="text-xs mb-1" style="color: var(--text-secondary);">{{ t('library.tags') }}</div>
                  <NSpace v-if="savedPaper.tags.length" size="small">
                    <NTag
                      v-for="tagId in savedPaper.tags"
                      :key="tagId"
                      size="small"
                      closable
                      @close="favoritesStore.removeTagFromPaper(savedPaper.id, tagId)"
                    >
                      {{ favoritesStore.tags.find(t => t.id === tagId)?.name || tagId }}
                    </NTag>
                  </NSpace>
                  <span v-else class="text-xs" style="color: var(--text-secondary);">--</span>
                </div>

                <!-- Notes preview -->
                <div v-if="savedPaper.notes">
                  <div class="text-xs mb-1" style="color: var(--text-secondary);">{{ t('library.notes') }}</div>
                  <p class="text-xs line-clamp-3" style="color: var(--text);">{{ savedPaper.notes }}</p>
                </div>
              </div>
            </NCard>
          </div>
        </div>
      </div>
    </div>

    <!-- Share modal -->
    <NModal v-model:show="showShareModal" preset="dialog" :title="t('common.share') || 'Share'" style="max-width: 500px;">
      <NInput :value="shareLink" readonly>
        <template #suffix>
          <NButton size="tiny" @click="copyShareLink">Copy</NButton>
        </template>
      </NInput>
    </NModal>

    <!-- Notes modal -->
    <NModal v-model:show="showNotesModal" preset="dialog" :title="t('library.notes')" positive-text="Save" negative-text="Cancel"
      @positive-click="saveNotes"
    >
      <NInput
        v-model:value="editingNotes"
        type="textarea"
        :rows="8"
        :placeholder="t('library.addNote')"
      />
    </NModal>
  </div>
</template>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
