<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useMessage } from 'naive-ui'
import { marked } from 'marked'
import { searchPapers as searchOpenAlex } from '../api/openalex'
import { getTrendData } from '../api/openalex'
import { getLatestPapers } from '../api/arxiv'
import { getSubscriptions, addSubscription, deleteSubscription } from '../db'
import { researchFields } from '../data/fields'
import { useAI } from '../composables/useAI'
import type { Paper, Subscription } from '../types/paper'
import type { TrendDataItem } from '../components/TrendChart.vue'
import TrendChart from '../components/TrendChart.vue'
import PaperCard from '../components/PaperCard.vue'
import {
  NTabs,
  NTabPane,
  NCard,
  NButton,
  NIcon,
  NSpin,
  NEmpty,
  NInput,
  NSelect,
  NTag,
  NSpace,
  NDivider,
  NResult,
  NModal,
  NInputGroup,
  NTooltip,
  NAlert,
} from 'naive-ui'
import {
    TrendingUpOutline,
    TrendingDownOutline,
    RemoveOutline,
    AddOutline,
    TrashOutline,
    SearchOutline,
    FlameOutline,
    BarChartOutline,
    RibbonOutline,
    CompassOutline,
    BookmarkOutline,
    ChevronDownOutline,
    ChevronForwardOutline,
    SparklesOutline,
    CopyOutline,
} from '@vicons/ionicons5'

const { t, locale } = useI18n()
const router = useRouter()
const message = useMessage()

// ---------------------------------------------------------------------------
// Shared state
// ---------------------------------------------------------------------------

const activeTab = ref('hotPapers')

const timeRangeOptions = computed(() => [
  { label: t('trends.lastYear'), value: '1' },
  { label: t('trends.last3Years'), value: '3' },
  { label: t('trends.last5Years'), value: '5' },
  { label: t('trends.last10Years'), value: '10' },
])

const currentYear = new Date().getFullYear()

function yearFromRange(range: string): number {
  return currentYear - parseInt(range, 10)
}

// ---------------------------------------------------------------------------
// Tab 1: Hot Papers
// ---------------------------------------------------------------------------

const hotPapers = ref<Paper[]>([])
const hotPapersLoading = ref(false)
const hotPapersTimeRange = ref('3')
const hotPapersLoaded = ref(false)

const hotKeywords = computed(() =>
  researchFields.map(f => f.keyword),
)

async function loadHotPapers() {
  hotPapersLoading.value = true
  hotPapersLoaded.value = true
  try {
    const yearFrom = yearFromRange(hotPapersTimeRange.value)
    const allKeywords = hotKeywords.value
    const keyword = allKeywords[Math.floor(Math.random() * allKeywords.length)]
    const result = await searchOpenAlex(keyword, {
      yearFrom,
      yearTo: currentYear,
      sortBy: 'citations',
      sortOrder: 'desc',
    }, undefined, 20)
    hotPapers.value = result.papers
      .filter(p => p.citationCount > 0)
      .sort((a, b) => b.citationCount - a.citationCount)
  } catch (e) {
    console.warn('Failed to load hot papers:', e)
    message.error(t('trends.failedToLoad'))
  } finally {
    hotPapersLoading.value = false
  }
}

function formatCitationCount(count: number): string {
  if (count >= 1000) return (count / 1000).toFixed(1) + 'K'
  return String(count)
}

function citationGrowthEstimate(paper: Paper): string {
  // Rough estimate: citations / years since publication
  const yearsSince = currentYear - (paper.year || currentYear)
  if (yearsSince <= 0) return '+100%'
  const rate = Math.min(((paper.citationCount / yearsSince) * 10), 999)
  return `+${Math.round(rate)}%`
}

// ---------------------------------------------------------------------------
// Tab 2: Trend Chart
// ---------------------------------------------------------------------------

const trendKeywords = ref('')
const trendTimeRange = ref('10')
const trendData = ref<TrendDataItem[]>([])
const trendLoading = ref(false)
const trendLoaded = ref(false)

const defaultTrendKeywords = computed(() =>
  researchFields.slice(0, 3).map(f => f.keyword).join(','),
)

async function loadTrendData() {
  const input = trendKeywords.value.trim() || defaultTrendKeywords.value
  const keywords = input
    .split(/[,，]/)
    .map(k => k.trim())
    .filter(Boolean)

  if (keywords.length === 0) return

  trendLoading.value = true
  trendLoaded.value = true
  trendData.value = []

  const yearFrom = yearFromRange(trendTimeRange.value)
  const yearTo = currentYear

  try {
    const results = await Promise.allSettled(
      keywords.map(async (keyword) => {
        const dataMap = await getTrendData(keyword, yearFrom, yearTo)
        const data = Object.entries(dataMap)
          .map(([year, count]) => ({ year: parseInt(year, 10), count }))
          .sort((a, b) => a.year - b.year)
        return { keyword, data }
      }),
    )

    for (const r of results) {
      if (r.status === 'fulfilled') {
        trendData.value.push(r.value)
      }
    }
  } catch (e) {
    console.warn('Failed to load trend data:', e)
    message.error(t('trends.failedToLoad'))
  } finally {
    trendLoading.value = false
  }
}

// ---------------------------------------------------------------------------
// Tab 3: Field Rankings (with expandable subfields)
// ---------------------------------------------------------------------------

interface FieldInfo {
  name: string
  nameEn: string
  keyword: string
  slug: string
  count: number
  trend: 'up' | 'down' | 'stable'
  color: string
  subfields: { name: string; nameEn: string; keyword: string; count: number; trend: 'up' | 'down' | 'stable' }[]
}

const fieldList = ref<FieldInfo[]>(researchFields.map(f => ({
  name: f.name,
  nameEn: f.nameEn,
  keyword: f.keyword,
  slug: f.slug,
  count: 0,
  trend: 'up' as const,
  color: f.color,
  subfields: f.subfields.map(s => ({
    name: s.name,
    nameEn: s.nameEn,
    keyword: s.keyword,
    count: 0,
    trend: 'stable' as const,
  })),
})))

const fieldLoading = ref(false)
const fieldLoaded = ref(false)
const expandedFields = ref<Set<string>>(new Set())

const sortedFields = computed(() =>
  [...fieldList.value].sort((a, b) => b.count - a.count),
)

function toggleExpand(slug: string) {
  if (expandedFields.value.has(slug)) {
    expandedFields.value.delete(slug)
  } else {
    expandedFields.value.add(slug)
  }
}

async function loadFieldRankings() {
  fieldLoading.value = true
  fieldLoaded.value = true

  try {
    const batchSize = 6
    for (let i = 0; i < fieldList.value.length; i += batchSize) {
      const batch = fieldList.value.slice(i, i + batchSize)
      const results = await Promise.allSettled(
        batch.map(async (field) => {
          // 用完整年份对比，避免当年数据不完整的偏差
          const recent = await getTrendData(field.keyword, currentYear - 1, currentYear - 1)
          const previous = await getTrendData(field.keyword, currentYear - 2, currentYear - 2)

          const recentCount = Object.values(recent).reduce((sum, c) => sum + c, 0)
          const previousCount = Object.values(previous).reduce((sum, c) => sum + c, 0)

          let trend: 'up' | 'down' | 'stable' = 'stable'
          if (previousCount > 0) {
            const growth = (recentCount - previousCount) / previousCount
            if (growth > 0.1) trend = 'up'
            else if (growth < -0.1) trend = 'down'
          } else if (recentCount > 0) {
            trend = 'up'
          }

          return { keyword: field.keyword, count: recentCount + previousCount, trend }
        }),
      )

      for (let j = 0; j < results.length; j++) {
        const r = results[j]
        if (r.status === 'fulfilled') {
          const field = fieldList.value[i + j]
          field.count = r.value.count
          field.trend = r.value.trend
        }
      }
    }

    // Load subfield counts for expanded fields
    await loadExpandedSubfields()
  } catch (e) {
    console.warn('Failed to load field rankings:', e)
  } finally {
    fieldLoading.value = false
  }
}

async function loadExpandedSubfields() {
  for (const slug of expandedFields.value) {
    const field = fieldList.value.find(f => f.slug === slug)
    if (!field) continue

    const batchSize = 4
    for (let i = 0; i < field.subfields.length; i += batchSize) {
      const batch = field.subfields.slice(i, i + batchSize)
      const results = await Promise.allSettled(
        batch.map(async (sub) => {
          const recent = await getTrendData(sub.keyword, currentYear - 1, currentYear - 1)
          const previous = await getTrendData(sub.keyword, currentYear - 2, currentYear - 2)

          const recentCount = Object.values(recent).reduce((sum, c) => sum + c, 0)
          const previousCount = Object.values(previous).reduce((sum, c) => sum + c, 0)

          let trend: 'up' | 'down' | 'stable' = 'stable'
          if (previousCount > 0) {
            const growth = (recentCount - previousCount) / previousCount
            if (growth > 0.1) trend = 'up'
            else if (growth < -0.1) trend = 'down'
          } else if (recentCount > 0) {
            trend = 'up'
          }

          return { keyword: sub.keyword, count: recentCount + previousCount, trend }
        }),
      )

      for (let j = 0; j < results.length; j++) {
        const r = results[j]
        if (r.status === 'fulfilled') {
          const sub = field.subfields[i + j]
          sub.count = r.value.count
          sub.trend = r.value.trend
        }
      }
    }
  }
}

function goToFieldSearch(keyword: string) {
  router.push({ path: '/search', query: { q: keyword } })
}

function goToFieldDetail(slug: string) {
  router.push({ name: 'field', params: { slug } })
}

function trendIcon(trend: 'up' | 'down' | 'stable') {
  if (trend === 'up') return TrendingUpOutline
  if (trend === 'down') return TrendingDownOutline
  return RemoveOutline
}

function trendColor(trend: 'up' | 'down' | 'stable') {
  if (trend === 'up') return '#10b981'
  if (trend === 'down') return '#ef4444'
  return '#94a3b8'
}

// ---------------------------------------------------------------------------
// Tab 4: Emerging Directions
// ---------------------------------------------------------------------------

interface EmergingDirection {
  keyword: string
  growthRate: number
  recentCount: number
  previousCount: number
  paper: Paper | null
}

const emergingDirections = ref<EmergingDirection[]>([])
const emergingLoading = ref(false)
const emergingLoaded = ref(false)

const emergingKeywords = computed(() => {
  // Collect unique subfield keywords from all fields
  const keywords = new Set<string>()
  for (const field of researchFields) {
    for (const sub of field.subfields) {
      keywords.add(sub.keyword)
    }
  }
  // Pick a subset of trending topics
  const trending = [
    'world model',
    'video generation',
    'ai agent',
    'mixture of experts',
    'vision language model',
    '3d gaussian splatting',
    'text-to-video',
    'reasoning language model',
    'robot foundation model',
    'humanoid robot',
    'retrieval augmented generation',
    'large action model',
    'sound generation',
    'ai safety alignment',
  ]
  return trending
})

async function loadEmergingDirections() {
  emergingLoading.value = true
  emergingLoaded.value = true
  emergingDirections.value = []

  try {
    const results = await Promise.allSettled(
      emergingKeywords.value.map(async (keyword) => {
        const recentData = await getTrendData(keyword, currentYear - 1, currentYear - 1)
        const previousData = await getTrendData(keyword, currentYear - 2, currentYear - 2)

        const recentCount = Object.values(recentData).reduce((s, c) => s + c, 0)
        const previousCount = Object.values(previousData).reduce((s, c) => s + c, 0)

        const growthRate = previousCount > 0
          ? ((recentCount - previousCount) / previousCount) * 100
          : recentCount > 0 ? 100 : 0

        // Fetch a representative paper
        let paper: Paper | null = null
        try {
          const searchResult = await searchOpenAlex(keyword, {
            yearFrom: currentYear - 1,
            yearTo: currentYear,
            sortBy: 'citations',
            sortOrder: 'desc',
          }, undefined, 1)
          paper = searchResult.papers[0] ?? null
        } catch {
          // ignore
        }

        return { keyword, growthRate, recentCount, previousCount, paper }
      }),
    )

    const directions: EmergingDirection[] = []
    for (const r of results) {
      if (r.status === 'fulfilled' && r.value.growthRate > 0) {
        directions.push(r.value)
      }
    }

    emergingDirections.value = directions.sort((a, b) => b.growthRate - a.growthRate)
  } catch (e) {
    console.warn('Failed to load emerging directions:', e)
    message.error(t('trends.failedToLoad'))
  } finally {
    emergingLoading.value = false
  }
}

function goToPaper(id: string) {
  router.push({ name: 'paper', params: { id } })
}

// ---------------------------------------------------------------------------
// Tab 5: Subscriptions
// ---------------------------------------------------------------------------

const subscriptions = ref<Subscription[]>([])
const subscriptionLoading = ref(false)
const subscriptionKeyword = ref('')
const showSubscriptionPapers = ref(false)
const subscriptionPapers = ref<Paper[]>([])
const subscriptionPapersLoading = ref(false)
const viewingKeyword = ref('')

async function loadSubscriptions() {
  subscriptionLoading.value = true
  try {
    subscriptions.value = await getSubscriptions()
  } catch (e) {
    console.warn('Failed to load subscriptions:', e)
  } finally {
    subscriptionLoading.value = false
  }
}

async function handleAddSubscription() {
  const keyword = subscriptionKeyword.value.trim()
  if (!keyword) return
  if (subscriptions.value.some(s => s.keyword.toLowerCase() === keyword.toLowerCase())) {
    message.warning(locale.value === 'zh' ? '该关键词已订阅' : 'Already subscribed to this keyword')
    return
  }

  try {
    const now = new Date()
    const id = await addSubscription({
      keyword,
      lastChecked: now,
      createdAt: now,
    })
    subscriptions.value.push({
      id,
      keyword,
      lastChecked: now,
      createdAt: now,
    })
    subscriptionKeyword.value = ''
    message.success(t('trends.subscriptionAdded'))
  } catch (e) {
    console.warn('Failed to add subscription:', e)
  }
}

async function handleDeleteSubscription(id?: string) {
  if (!id) return
  try {
    await deleteSubscription(id)
    subscriptions.value = subscriptions.value.filter(s => s.id !== id)
    message.success(t('trends.subscriptionDeleted'))
  } catch (e) {
    console.warn('Failed to delete subscription:', e)
  }
}

async function viewSubscriptionPapers(keyword: string) {
  viewingKeyword.value = keyword
  showSubscriptionPapers.value = true
  subscriptionPapersLoading.value = true
  subscriptionPapers.value = []

  try {
    const result = await searchOpenAlex(keyword, {
      sortBy: 'date',
      sortOrder: 'desc',
    }, undefined, 10)
    subscriptionPapers.value = result.papers
  } catch (e) {
    console.warn('Failed to load subscription papers:', e)
  } finally {
    subscriptionPapersLoading.value = false
  }
}

function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString()
}

// ---------------------------------------------------------------------------
// Tab 6: AI Insights
// ---------------------------------------------------------------------------

const {
  generating: aiGenerating,
  result: aiResult,
  error: aiError,
  getConfig: getAIConfig,
  summarizeTrends: aiSummarizeTrends,
  compareDirections: aiCompareDirections,
  discoverInnovations: aiDiscoverInnovations,
} = useAI()

const aiAnalysisType = ref<'trendSummary' | 'directionCompare' | 'innovationDiscovery'>('trendSummary')
const aiKeyword = ref('')
const aiConfigured = ref<boolean | null>(null)
const aiCopied = ref(false)

const aiAnalysisTypeOptions = computed(() => [
  { label: t('ai.trendSummary'), value: 'trendSummary' },
  { label: t('ai.directionCompare'), value: 'directionCompare' },
  { label: t('ai.innovationDiscovery'), value: 'innovationDiscovery' },
])

async function checkAIConfig() {
  const config = await getAIConfig()
  aiConfigured.value = config !== null
}

async function runAIAnalysis() {
  const keyword = aiKeyword.value.trim() || 'machine learning'
  aiError.value = null

  try {
    if (aiAnalysisType.value === 'trendSummary') {
      // Fetch data for the keyword
      const yearFrom = currentYear - 3
      const searchResult = await searchOpenAlex(keyword, {
        yearFrom,
        yearTo: currentYear,
        sortBy: 'citations',
        sortOrder: 'desc',
      }, undefined, 20)

      const trendDataMap = await getTrendData(keyword, currentYear - 10, currentYear)

      await aiSummarizeTrends({
        keyword,
        paperCount: searchResult.total ?? searchResult.papers.length,
        recentPapers: searchResult.papers.slice(0, 10).map(p => ({
          title: p.title,
          year: p.year ?? currentYear,
          citationCount: p.citationCount,
        })),
        trendData: trendDataMap,
      })
    } else if (aiAnalysisType.value === 'directionCompare') {
      // Use the field list as directions
      const directions = fieldList.value
        .filter(f => f.count > 0)
        .slice(0, 8)
        .map(f => ({
          name: locale.value === 'zh' ? f.name : f.nameEn,
          paperCount: f.count,
          trend: f.trend === 'up' ? t('trends.trendUp') : f.trend === 'down' ? t('trends.trendDown') : t('trends.trendStable'),
        }))

      if (directions.length === 0) {
        // Load field data first if not loaded
        await loadFieldRankings()
        const dirs = fieldList.value
          .filter(f => f.count > 0)
          .slice(0, 8)
          .map(f => ({
            name: locale.value === 'zh' ? f.name : f.nameEn,
            paperCount: f.count,
            trend: f.trend === 'up' ? t('trends.trendUp') : f.trend === 'down' ? t('trends.trendDown') : t('trends.trendStable'),
          }))
        await aiCompareDirections(dirs)
      } else {
        await aiCompareDirections(directions)
      }
    } else if (aiAnalysisType.value === 'innovationDiscovery') {
      const searchResult = await searchOpenAlex(keyword, {
        yearFrom: currentYear - 1,
        yearTo: currentYear,
        sortBy: 'date',
        sortOrder: 'desc',
      }, undefined, 15)

      await aiDiscoverInnovations(
        searchResult.papers.map(p => ({
          title: p.title,
          abstract: p.abstract,
          year: p.year ?? currentYear,
        })),
      )
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    message.error(msg)
  }
}

function renderMarkdown(text: string): string {
  return marked.parse(text, { async: false }) as string
}

function copyAIResult() {
  if (!aiResult.value) return
  navigator.clipboard.writeText(aiResult.value).then(() => {
    aiCopied.value = true
    setTimeout(() => { aiCopied.value = false }, 2000)
  })
}

// ---------------------------------------------------------------------------
// Load data on tab switch
// ---------------------------------------------------------------------------

async function onTabChange(tab: string) {
  activeTab.value = tab

  switch (tab) {
    case 'hotPapers':
      if (!hotPapersLoaded.value) await loadHotPapers()
      break
    case 'trendChart':
      if (!trendLoaded.value) await loadTrendData()
      break
    case 'fieldRanking':
      if (!fieldLoaded.value) await loadFieldRankings()
      break
    case 'newDirections':
      if (!emergingLoaded.value) await loadEmergingDirections()
      break
    case 'subscriptions':
      await loadSubscriptions()
      break
    case 'aiInsights':
      await checkAIConfig()
      break
  }
}

onMounted(() => {
  loadHotPapers()
})
</script>

<template>
  <div class="min-h-screen pb-12" style="background: var(--bg);">
    <!-- Page header -->
    <div class="max-w-7xl mx-auto px-4 md:px-8 pt-6 pb-4">
      <h1 class="text-2xl md:text-3xl font-bold" style="color: var(--text);">
        {{ t('trends.title') }}
      </h1>
    </div>

    <!-- Tabs -->
    <div class="max-w-7xl mx-auto px-4 md:px-8">
      <NTabs
        v-model:value="activeTab"
        type="line"
        animated
        @update:value="onTabChange"
      >
        <!-- Tab 1: Hot Papers -->
        <NTabPane name="hotPapers" :tab="t('trends.hotPapers')">
          <div class="py-4">
            <!-- Time range selector -->
            <div class="flex flex-wrap items-center gap-3 mb-4">
              <span class="text-sm" style="color: var(--text-secondary);">{{ t('trends.timeRange') }}:</span>
              <NSelect
                v-model:value="hotPapersTimeRange"
                :options="timeRangeOptions"
                size="small"
                style="width: 140px;"
                @update:value="loadHotPapers"
              />
            </div>

            <NSpin :show="hotPapersLoading" :description="t('trends.loadingData')">
              <div v-if="hotPapers.length" class="grid gap-3">
                <div
                  v-for="(paper, idx) in hotPapers"
                  :key="paper.id"
                  class="flex items-start gap-3"
                >
                  <!-- Rank number -->
                  <div
                    class="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold mt-3"
                    :style="{
                      background: idx < 3 ? ['#6366f1', '#10b981', '#f59e0b'][idx] + '18' : 'var(--bg-secondary)',
                      color: idx < 3 ? ['#6366f1', '#10b981', '#f59e0b'][idx] : 'var(--text-secondary)',
                    }"
                  >
                    {{ idx + 1 }}
                  </div>

                  <!-- Paper card with citation growth badge -->
                  <div class="flex-1 min-w-0">
                    <NCard size="small" hoverable class="relative">
                      <div class="flex flex-col gap-2">
                        <div class="flex items-start justify-between gap-2">
                          <h4
                            class="text-sm font-semibold leading-snug cursor-pointer hover:underline line-clamp-2"
                            style="color: var(--primary);"
                            @click="goToPaper(paper.id)"
                          >
                            {{ paper.title }}
                          </h4>
                          <!-- Citation growth badge -->
                          <NTag size="small" :bordered="false" type="success" class="shrink-0">
                            {{ citationGrowthEstimate(paper) }}
                          </NTag>
                        </div>
                        <div class="flex flex-wrap items-center gap-2 text-xs" style="color: var(--text-secondary);">
                          <span>{{ paper.authors.slice(0, 2).map(a => a.name).join(', ') }}{{ paper.authors.length > 2 ? ' et al.' : '' }}</span>
                          <span v-if="paper.year">&middot; {{ paper.year }}</span>
                          <span>&middot; {{ t('search.citations', { count: paper.citationCount }) }}</span>
                        </div>
                      </div>
                    </NCard>
                  </div>
                </div>
              </div>
              <NEmpty v-else-if="!hotPapersLoading" :description="t('trends.noData')" class="py-12" />
            </NSpin>
          </div>
        </NTabPane>

        <!-- Tab 2: Trend Chart -->
        <NTabPane name="trendChart" :tab="t('trends.trendChart')">
          <div class="py-4">
            <!-- Controls -->
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
              <NInputGroup class="flex-1">
                <NInput
                  v-model:value="trendKeywords"
                  :placeholder="t('trends.keywordsPlaceholder')"
                  clearable
                  @keydown.enter="loadTrendData"
                />
                <NButton type="primary" @click="loadTrendData">
                  <template #icon>
                    <NIcon><BarChartOutline /></NIcon>
                  </template>
                  {{ t('trends.generateChart') }}
                </NButton>
              </NInputGroup>
              <NSelect
                v-model:value="trendTimeRange"
                :options="timeRangeOptions"
                size="medium"
                style="width: 140px;"
              />
            </div>

            <!-- Chart -->
            <NCard>
              <NSpin :show="trendLoading" :description="t('trends.loadingData')">
                <TrendChart
                  v-if="trendData.length"
                  :data="trendData"
                />
                <NEmpty v-else-if="!trendLoading" :description="t('trends.noData')" class="py-12" />
              </NSpin>
            </NCard>
          </div>
        </NTabPane>

        <!-- Tab 3: Field Rankings with expandable subfields -->
        <NTabPane name="fieldRanking" :tab="t('trends.fieldRanking')">
          <div class="py-4">
            <NSpin :show="fieldLoading" :description="t('trends.loadingData')">
              <div v-if="sortedFields.length" class="grid gap-2">
                <template v-for="(field, idx) in sortedFields" :key="field.slug">
                  <!-- Main field card -->
                  <NCard
                    size="small"
                    hoverable
                    class="cursor-pointer transition-all duration-200"
                    @click="goToFieldDetail(field.slug)"
                  >
                    <div class="flex items-center gap-4">
                      <!-- Rank badge -->
                      <div
                        class="shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold"
                        :style="{
                          background: idx < 3
                            ? ['#6366f1', '#10b981', '#f59e0b'][idx] + '20'
                            : 'var(--bg-secondary)',
                          color: idx < 3 ? ['#6366f1', '#10b981', '#f59e0b'][idx] : 'var(--text-secondary)',
                        }"
                      >
                        {{ idx + 1 }}
                      </div>

                      <!-- Field info -->
                      <div class="flex-1 min-w-0">
                        <div class="flex items-center gap-2">
                          <span class="font-semibold text-sm" style="color: var(--text);">
                            {{ locale === 'zh' ? field.name : field.nameEn }}
                          </span>
                          <NTag size="tiny" :bordered="false" type="info">
                            {{ locale === 'zh' ? field.nameEn : field.name }}
                          </NTag>
                        </div>
                        <div class="text-xs mt-1" style="color: var(--text-secondary);">
                          {{ t('trends.paperCount') }}: {{ formatCitationCount(field.count) }}
                        </div>
                      </div>

                      <!-- Trend indicator -->
                      <div class="shrink-0 flex items-center gap-1 text-xs font-medium" :style="{ color: trendColor(field.trend) }">
                        <NIcon :size="16">
                          <component :is="trendIcon(field.trend)" />
                        </NIcon>
                        {{ t(`trends.trend${field.trend.charAt(0).toUpperCase() + field.trend.slice(1)}`) }}
                      </div>

                      <!-- Color dot & expand toggle -->
                      <div class="shrink-0 flex items-center gap-2">
                        <div
                          class="w-3 h-3 rounded-full"
                          :style="{ background: field.color }"
                        />
                        <NButton
                          size="tiny"
                          quaternary
                          @click.stop="toggleExpand(field.slug)"
                        >
                          <template #icon>
                            <NIcon :size="16">
                              <ChevronDownOutline v-if="expandedFields.has(field.slug)" />
                              <ChevronForwardOutline v-else />
                            </NIcon>
                          </template>
                        </NButton>
                      </div>
                    </div>
                  </NCard>

                  <!-- Expanded subfields -->
                  <div
                    v-if="expandedFields.has(field.slug)"
                    class="ml-8 md:ml-12 grid gap-2"
                  >
                    <NCard
                      v-for="(sub, subIdx) in field.subfields"
                      :key="sub.keyword"
                      size="small"
                      hoverable
                      class="cursor-pointer transition-all duration-200"
                      @click="goToFieldSearch(sub.keyword)"
                    >
                      <div class="flex items-center gap-3">
                        <!-- Sub-index -->
                        <div
                          class="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium"
                          :style="{
                            background: field.color + '15',
                            color: field.color,
                          }"
                        >
                          {{ subIdx + 1 }}
                        </div>

                        <!-- Subfield info -->
                        <div class="flex-1 min-w-0">
                          <span class="text-sm font-medium" style="color: var(--text);">
                            {{ locale === 'zh' ? sub.name : sub.nameEn }}
                          </span>
                          <span class="text-xs ml-2" style="color: var(--text-secondary);">
                            {{ locale === 'zh' ? sub.nameEn : sub.name }}
                          </span>
                        </div>

                        <!-- Count & trend -->
                        <div class="shrink-0 flex items-center gap-2">
                          <span class="text-xs" style="color: var(--text-secondary);">
                            {{ formatCitationCount(sub.count) }}
                          </span>
                          <NIcon :size="14" :style="{ color: trendColor(sub.trend) }">
                            <component :is="trendIcon(sub.trend)" />
                          </NIcon>
                        </div>
                      </div>
                    </NCard>
                  </div>
                </template>
              </div>
              <NEmpty v-else-if="!fieldLoading" :description="t('trends.noData')" class="py-12" />
            </NSpin>
          </div>
        </NTabPane>

        <!-- Tab 4: Emerging Directions -->
        <NTabPane name="newDirections" :tab="t('trends.newDirections')">
          <div class="py-4">
            <NSpin :show="emergingLoading" :description="t('trends.loadingData')">
              <div v-if="emergingDirections.length" class="grid gap-4 md:grid-cols-2">
                <NCard
                  v-for="dir in emergingDirections"
                  :key="dir.keyword"
                  size="small"
                  hoverable
                  class="transition-all duration-200"
                >
                  <div class="flex flex-col gap-3">
                    <!-- Header -->
                    <div class="flex items-start justify-between gap-2">
                      <h4 class="font-semibold text-sm" style="color: var(--primary);">
                        {{ dir.keyword }}
                      </h4>
                      <NTag size="small" :bordered="false" type="success">
                        +{{ Math.round(dir.growthRate) }}%
                      </NTag>
                    </div>

                    <!-- Stats -->
                    <div class="flex items-center gap-4 text-xs" style="color: var(--text-secondary);">
                      <span>{{ t('trends.growthRate') }}: +{{ Math.round(dir.growthRate) }}%</span>
                      <span>{{ t('trends.paperCount') }}: {{ dir.recentCount }}</span>
                    </div>

                    <!-- Representative paper -->
                    <div v-if="dir.paper" class="pt-2" style="border-top: 1px solid var(--border);">
                      <div class="text-xs mb-1 font-medium" style="color: var(--text-secondary);">
                        {{ t('trends.representativePaper') }}
                      </div>
                      <div
                        class="text-sm cursor-pointer hover:underline line-clamp-2"
                        style="color: var(--text);"
                        @click="goToPaper(dir.paper.id)"
                      >
                        {{ dir.paper.title }}
                      </div>
                      <div class="text-xs mt-1" style="color: var(--text-secondary);">
                        {{ dir.paper.authors.slice(0, 2).map(a => a.name).join(', ') }}
                        {{ dir.paper.year ? ` (${dir.paper.year})` : '' }}
                      </div>
                    </div>

                    <!-- Action -->
                    <NButton
                      size="small"
                      quaternary
                      type="primary"
                      @click="goToFieldSearch(dir.keyword)"
                    >
                      <template #icon>
                        <NIcon><SearchOutline /></NIcon>
                      </template>
                      {{ t('trends.viewPapers') }}
                    </NButton>
                  </div>
                </NCard>
              </div>
              <NEmpty v-else-if="!emergingLoading" :description="t('trends.noData')" class="py-12" />
            </NSpin>
          </div>
        </NTabPane>

        <!-- Tab 5: Subscriptions -->
        <NTabPane name="subscriptions" :tab="t('trends.subscriptions')">
          <div class="py-4">
            <!-- Add subscription -->
            <div class="flex items-center gap-3 mb-6">
              <NInputGroup class="flex-1 max-w-md">
                <NInput
                  v-model:value="subscriptionKeyword"
                  :placeholder="t('trends.subscriptionKeyword')"
                  clearable
                  @keydown.enter="handleAddSubscription"
                />
                <NButton type="primary" @click="handleAddSubscription">
                  <template #icon>
                    <NIcon><AddOutline /></NIcon>
                  </template>
                  {{ t('trends.addSubscription') }}
                </NButton>
              </NInputGroup>
            </div>

            <NSpin :show="subscriptionLoading">
              <div v-if="subscriptions.length" class="grid gap-3">
                <NCard
                  v-for="sub in subscriptions"
                  :key="sub.id"
                  size="small"
                  hoverable
                >
                  <div class="flex items-center gap-4">
                    <!-- Keyword -->
                    <div class="flex-1 min-w-0">
                      <div class="font-semibold text-sm" style="color: var(--primary);">
                        {{ sub.keyword }}
                      </div>
                      <div class="text-xs mt-1" style="color: var(--text-secondary);">
                        {{ t('trends.lastChecked') }}: {{ formatDate(sub.lastChecked) }}
                      </div>
                    </div>

                    <!-- Actions -->
                    <div class="shrink-0 flex items-center gap-2">
                      <NTooltip>
                        <template #trigger>
                          <NButton size="small" quaternary type="primary" @click="viewSubscriptionPapers(sub.keyword)">
                            <template #icon>
                              <NIcon><SearchOutline /></NIcon>
                            </template>
                            {{ t('trends.viewPapers') }}
                          </NButton>
                        </template>
                        {{ t('trends.viewPapers') }}
                      </NTooltip>

                      <NTooltip>
                        <template #trigger>
                          <NButton size="small" quaternary type="error" @click="handleDeleteSubscription(sub.id)">
                            <template #icon>
                              <NIcon><TrashOutline /></NIcon>
                            </template>
                          </NButton>
                        </template>
                        {{ t('trends.deleteSubscription') }}
                      </NTooltip>
                    </div>
                  </div>
                </NCard>
              </div>
              <NEmpty v-else :description="t('trends.noSubscriptions')" class="py-12" />
            </NSpin>
          </div>
        </NTabPane>

        <!-- Tab 6: AI Insights -->
        <NTabPane name="aiInsights" :tab="t('ai.title')">
          <div class="py-4">
            <!-- Not configured warning -->
            <NAlert
              v-if="aiConfigured === false"
              type="warning"
              :show-icon="true"
              class="mb-4"
            >
              <template #header>{{ t('ai.configureFirst') }}</template>
              <NButton
                size="small"
                type="primary"
                class="mt-2"
                @click="router.push({ name: 'settings' })"
              >
                {{ t('ai.goToSettings') }}
              </NButton>
            </NAlert>

            <!-- Controls -->
            <div class="flex flex-col gap-4 mb-6">
              <div class="flex flex-wrap items-center gap-3">
                <span class="text-sm font-medium" style="color: var(--text);">
                  {{ t('ai.analysisType') }}:
                </span>
                <NSelect
                  v-model:value="aiAnalysisType"
                  :options="aiAnalysisTypeOptions"
                  size="small"
                  style="width: 180px;"
                />
              </div>

              <div class="flex flex-wrap items-center gap-3">
                <NInput
                  v-model:value="aiKeyword"
                  :placeholder="t('ai.targetKeyword')"
                  clearable
                  style="width: 300px;"
                  @keydown.enter="runAIAnalysis"
                />
                <NButton
                  type="primary"
                  :loading="aiGenerating"
                  :disabled="aiConfigured === false"
                  @click="runAIAnalysis"
                >
                  <template #icon>
                    <NIcon><SparklesOutline /></NIcon>
                  </template>
                  {{ aiGenerating ? t('ai.generating') : (aiResult ? t('ai.regenerate') : t('ai.generate')) }}
                </NButton>
              </div>
            </div>

            <!-- Result area -->
            <NCard v-if="aiResult || aiGenerating || aiError">
              <!-- Streaming output -->
              <div v-if="aiGenerating && !aiResult" class="flex items-center gap-2 py-4">
                <NSpin size="small" />
                <span class="text-sm" style="color: var(--text-secondary);">{{ t('ai.generating') }}</span>
              </div>

              <!-- Markdown result display -->
              <div
                v-if="aiResult"
                class="prose prose-sm max-w-none ai-result-content"
                style="color: var(--text);"
                v-html="renderMarkdown(aiResult)"
              />

              <!-- Error -->
              <NAlert v-if="aiError" type="error" :show-icon="true" class="mt-4">
                {{ aiError }}
              </NAlert>

              <!-- Copy button -->
              <div v-if="aiResult" class="flex justify-end mt-4 pt-3" style="border-top: 1px solid var(--border);">
                <NButton size="small" quaternary @click="copyAIResult">
                  <template #icon>
                    <NIcon><CopyOutline /></NIcon>
                  </template>
                  {{ aiCopied ? t('ai.copied') : t('ai.copyResult') }}
                </NButton>
              </div>
            </NCard>

            <!-- Empty state -->
            <NEmpty
              v-else
              :description="t('ai.noResult')"
              class="py-16"
            >
              <template #extra>
                <div class="flex items-center gap-1 text-xs mt-2" style="color: var(--text-secondary);">
                  <NIcon :size="14"><SparklesOutline /></NIcon>
                  {{ t('ai.streamOutput') }}
                </div>
              </template>
            </NEmpty>
          </div>
        </NTabPane>
      </NTabs>
    </div>

    <!-- Subscription papers modal -->
    <NModal
      v-model:show="showSubscriptionPapers"
      preset="card"
      :title="`${t('trends.newPapers')} - ${viewingKeyword}`"
      style="max-width: 800px;"
    >
      <NSpin :show="subscriptionPapersLoading">
        <div v-if="subscriptionPapers.length" class="grid gap-3 max-h-[60vh] overflow-y-auto">
          <NCard
            v-for="paper in subscriptionPapers"
            :key="paper.id"
            size="small"
            hoverable
            class="cursor-pointer"
            @click="goToPaper(paper.id)"
          >
            <div class="text-sm font-medium line-clamp-2" style="color: var(--primary);">
              {{ paper.title }}
            </div>
            <div class="text-xs mt-1" style="color: var(--text-secondary);">
              {{ paper.authors.slice(0, 3).map(a => a.name).join(', ') }}
              {{ paper.authors.length > 3 ? ' et al.' : '' }}
              <span v-if="paper.year"> &middot; {{ paper.year }}</span>
              <span> &middot; {{ t('search.citations', { count: paper.citationCount }) }}</span>
            </div>
          </NCard>
        </div>
        <NEmpty v-else-if="!subscriptionPapersLoading" :description="t('trends.noData')" class="py-8" />
      </NSpin>
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
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
