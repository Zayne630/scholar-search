<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMessage } from 'naive-ui'
import { getFieldBySlug, researchFields } from '../data/fields'
import { searchPapers as searchOpenAlex } from '../api/openalex'
import { getTrendData } from '../api/openalex'
import type { Paper } from '../types/paper'
import type { TrendDataItem } from '../components/TrendChart.vue'
import TrendChart from '../components/TrendChart.vue'
import PaperCard from '../components/PaperCard.vue'
import {
  NButton,
  NIcon,
  NCard,
  NSpin,
  NEmpty,
  NTag,
} from 'naive-ui'
import {
  ArrowBackOutline,
  SearchOutline,
  TrendingUpOutline,
} from '@vicons/ionicons5'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const message = useMessage()

const currentYear = new Date().getFullYear()

// Current field data
const field = computed(() => getFieldBySlug(route.params.slug as string))

// Redirect if field not found
watch(
  () => route.params.slug,
  (slug) => {
    if (!getFieldBySlug(slug as string)) {
      router.replace('/')
    }
  },
)

// ---------------------------------------------------------------------------
// Hot Papers
// ---------------------------------------------------------------------------

const hotPapers = ref<Paper[]>([])
const hotPapersLoading = ref(false)

async function loadHotPapers() {
  if (!field.value) return
  hotPapersLoading.value = true
  try {
    const result = await searchOpenAlex(field.value.keyword, {
      yearFrom: currentYear - 3,
      yearTo: currentYear,
      sortBy: 'citations',
      sortOrder: 'desc',
    }, undefined, 10)
    hotPapers.value = result.papers.filter(p => p.citationCount > 0)
  } catch (e) {
    console.warn('Failed to load hot papers:', e)
    message.error(t('trends.failedToLoad'))
  } finally {
    hotPapersLoading.value = false
  }
}

// ---------------------------------------------------------------------------
// Trend Chart
// ---------------------------------------------------------------------------

const trendData = ref<TrendDataItem[]>([])
const trendLoading = ref(false)

async function loadTrendData() {
  if (!field.value) return
  trendLoading.value = true
  trendData.value = []

  const yearFrom = currentYear - 5
  const yearTo = currentYear

  // Main field keyword + top 3 subfield keywords
  const keywords = [
    field.value.nameEn,
    ...field.value.subfields.slice(0, 3).map(s => s.keyword),
  ]

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
  } finally {
    trendLoading.value = false
  }
}

// ---------------------------------------------------------------------------
// Navigation
// ---------------------------------------------------------------------------

function goBack() {
  router.push('/')
}

function goToSearch(keyword: string) {
  router.push({ path: '/search', query: { q: keyword } })
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------

onMounted(() => {
  if (field.value) {
    loadHotPapers()
    loadTrendData()
  }
})

watch(
  () => route.params.slug,
  () => {
    if (field.value) {
      loadHotPapers()
      loadTrendData()
    }
  },
)
</script>

<template>
  <div v-if="field" class="min-h-screen pb-12" style="background: var(--bg);">
    <div class="max-w-6xl mx-auto px-4 md:px-8 pt-6">
      <!-- Header -->
      <div class="mb-8">
        <NButton quaternary size="small" @click="goBack" class="mb-4">
          <template #icon>
            <NIcon><ArrowBackOutline /></NIcon>
          </template>
          {{ t('field.backToFields') }}
        </NButton>

        <div class="flex items-center gap-4 mb-3">
          <div
            class="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            :style="{ background: field.color + '18' }"
          >
            <div
              class="w-5 h-5 rounded-full"
              :style="{ background: field.color }"
            />
          </div>
          <div>
            <h1 class="text-2xl md:text-3xl font-bold" style="color: var(--text);">
              {{ locale === 'zh' ? field.name : field.nameEn }}
            </h1>
            <p class="text-sm mt-1" style="color: var(--text-secondary);">
              {{ locale === 'zh' ? field.nameEn : field.name }}
            </p>
          </div>
        </div>

        <p class="text-sm leading-relaxed max-w-2xl" style="color: var(--text-secondary);">
          {{ field.description }}
        </p>
      </div>

      <!-- Sub-fields Grid -->
      <section class="mb-10">
        <div class="flex items-center gap-3 mb-4">
          <h2 class="text-lg font-semibold" style="color: var(--text);">
            {{ t('field.subfields') }}
          </h2>
          <NTag size="small" :bordered="false" round type="info">
            {{ t('field.subfieldCount', { count: field.subfields.length }) }}
          </NTag>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          <div
            v-for="sub in field.subfields"
            :key="sub.keyword"
            class="group relative rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
            style="background: var(--bg-card); border: 1px solid var(--border);"
            @click="goToSearch(sub.keyword)"
          >
            <!-- Name -->
            <div class="font-medium text-sm mb-0.5" style="color: var(--text);">
              {{ sub.name }}
            </div>
            <div class="text-xs mb-2" style="color: var(--text-secondary);">
              {{ sub.nameEn }}
            </div>

            <!-- Description -->
            <p class="text-xs leading-relaxed mb-3 line-clamp-2" style="color: var(--text-secondary);">
              {{ sub.description }}
            </p>

            <!-- Search button -->
            <div class="flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity" :style="{ color: field.color }">
              <NIcon :size="14"><SearchOutline /></NIcon>
              {{ t('field.searchPapers') }}
            </div>

            <!-- Hover accent bar -->
            <div
              class="absolute bottom-0 left-3 right-3 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              :style="{ background: field.color }"
            />
          </div>
        </div>
      </section>

      <!-- Hot Papers -->
      <section class="mb-10">
        <div class="flex items-center gap-3 mb-4">
          <h2 class="text-lg font-semibold" style="color: var(--text);">
            {{ t('field.hotPapers') }}
          </h2>
          <NTag size="small" :bordered="false" round type="info">
            {{ field.nameEn }}
          </NTag>
        </div>

        <NSpin :show="hotPapersLoading" :description="t('trends.loadingData')">
          <div v-if="hotPapers.length" class="grid gap-3">
            <PaperCard
              v-for="paper in hotPapers"
              :key="paper.id"
              :paper="paper"
            />
          </div>
          <NEmpty v-else-if="!hotPapersLoading" :description="t('trends.noData')" class="py-12" />
        </NSpin>
      </section>

      <!-- Trend Chart -->
      <section class="mb-10">
        <div class="flex items-center gap-3 mb-4">
          <h2 class="text-lg font-semibold" style="color: var(--text);">
            {{ t('field.trendComparison') }}
          </h2>
          <NTag size="small" :bordered="false" round>
            {{ t('trends.last5Years') }}
          </NTag>
        </div>
        <p class="text-xs mb-4" style="color: var(--text-secondary);">
          {{ t('field.trendDescription') }}
        </p>

        <NCard>
          <NSpin :show="trendLoading" :description="t('trends.loadingData')">
            <TrendChart
              v-if="trendData.length"
              :data="trendData"
            />
            <NEmpty v-else-if="!trendLoading" :description="t('trends.noData')" class="py-12" />
          </NSpin>
        </NCard>
      </section>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
