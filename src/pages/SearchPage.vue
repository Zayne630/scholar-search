<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSearchStore } from '../stores/search'
import SearchBar from '../components/SearchBar.vue'
import PaperCard from '../components/PaperCard.vue'
import type { SearchFilters } from '../types/paper'
import {
  NButton,
  NIcon,
  NSelect,
  NInputNumber,
  NInput,
  NSpace,
  NSpin,
  NEmpty,
  NResult,
  NTag,
  NDrawer,
  NDrawerContent,
  NCollapse,
  NCollapseItem,
} from 'naive-ui'
import {
  FilterOutline,
  ChevronDownOutline,
  CloseOutline,
  RefreshOutline,
} from '@vicons/ionicons5'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const searchStore = useSearchStore()

const filtersVisible = ref(false)
const sidebarCollapsed = ref(false)

// Local filter state
const yearFrom = ref<number | null>(null)
const yearTo = ref<number | null>(null)
const venueFilter = ref('')
const fieldFilter = ref('')
const sortBy = ref<'relevance' | 'date' | 'citations'>('relevance')
const sortOrder = ref<'asc' | 'desc'>('desc')

const sortOptions = computed(() => [
  { label: t('search.filters.sortRelevance'), value: 'relevance' },
  { label: t('search.filters.sortDate'), value: 'date' },
  { label: t('search.filters.sortCitations'), value: 'citations' },
])

const orderOptions = computed(() => [
  { label: t('search.filters.orderDesc'), value: 'desc' },
  { label: t('search.filters.orderAsc'), value: 'asc' },
])

// Sync query from URL
const currentQuery = computed(() => (route.query.q as string) || '')

watch(currentQuery, (newQ, oldQ) => {
  if (newQ && newQ !== oldQ) {
    // 仅在查询词变化时搜索，避免返回页面时重复搜索
    if (searchStore.query !== newQ || searchStore.results.length === 0) {
      performSearch(newQ)
    }
  }
}, { immediate: false })

// Results
const papers = computed(() => searchStore.results)
const isLoading = computed(() => searchStore.isLoading)
const error = computed(() => searchStore.error)
const total = computed(() => searchStore.total)
const hasMore = computed(() => (papers.value.length > 0 && papers.value.length < 500))

// Venue options from current results (extract unique venues)
const venueOptions = computed(() => {
  const venues = new Set<string>()
  papers.value.forEach((p) => {
    if (p.venue) venues.add(p.venue)
  })
  return Array.from(venues).map((v) => ({ label: v, value: v }))
})

// Field options from current results
const fieldOptions = computed(() => {
  const fields = new Set<string>()
  papers.value.forEach((p) => {
    p.fieldsOfStudy?.forEach((f) => fields.add(f))
  })
  return Array.from(fields).map((f) => ({ label: f, value: f }))
})

function performSearch(q: string) {
  searchStore.setQuery(q)
  searchStore.setFilters(buildFilters())
  searchStore.search()
}

function buildFilters(): SearchFilters {
  return {
    yearFrom: yearFrom.value || undefined,
    yearTo: yearTo.value || undefined,
    venue: venueFilter.value || undefined,
    fieldOfStudy: fieldFilter.value || undefined,
    sortBy: sortBy.value,
    sortOrder: sortOrder.value,
  }
}

function handleSearch(q: string) {
  router.push({ path: '/search', query: { q } })
}

function applyFilters() {
  if (currentQuery.value) {
    performSearch(currentQuery.value)
  }
  filtersVisible.value = false
}

function resetFilters() {
  yearFrom.value = null
  yearTo.value = null
  venueFilter.value = ''
  fieldFilter.value = ''
  sortBy.value = 'relevance'
  sortOrder.value = 'desc'
}

function loadMore() {
  searchStore.loadMore()
}

function retrySearch() {
  if (currentQuery.value) {
    performSearch(currentQuery.value)
  }
}

// Read initial query on mount - only search if no cached results
onMounted(() => {
  const q = currentQuery.value
  if (q) {
    // 如果 store 中已有该查询的结果，不重新搜索
    if (searchStore.query === q && searchStore.results.length > 0) {
      return
    }
    performSearch(q)
  }
})
</script>

<template>
  <div class="flex flex-col min-h-screen">
    <!-- Top search bar -->
    <div
      class="sticky top-14 z-40 px-4 py-3 flex items-center gap-3 backdrop-blur-md"
      style="background: var(--bg); border-bottom: 1px solid var(--border);"
    >
      <SearchBar size="default" @search="handleSearch" />

      <!-- Filter toggle button -->
      <NButton quaternary @click="filtersVisible = !filtersVisible">
        <template #icon>
          <NIcon><FilterOutline /></NIcon>
        </template>
        {{ t('search.advanced') }}
      </NButton>
    </div>

    <!-- Advanced filter drawer (mobile) / panel (desktop) -->
    <NDrawer v-model:show="filtersVisible" :width="340" placement="left" :auto-focus="false">
      <NDrawerContent :title="t('search.advanced')" style="background: var(--bg);">
        <div class="flex flex-col gap-4">
          <!-- Year range -->
          <div class="flex gap-2">
            <NInputNumber
              v-model:value="yearFrom"
              :placeholder="t('search.filters.yearFrom')"
              clearable
              size="small"
              :min="1900"
              :max="2030"
              class="flex-1"
            />
            <NInputNumber
              v-model:value="yearTo"
              :placeholder="t('search.filters.yearTo')"
              clearable
              size="small"
              :min="1900"
              :max="2030"
              class="flex-1"
            />
          </div>

          <!-- Venue -->
          <NSelect
            v-model:value="venueFilter"
            :placeholder="t('search.filters.venue')"
            :options="venueOptions"
            clearable
            filterable
            size="small"
          />

          <!-- Field of study -->
          <NSelect
            v-model:value="fieldFilter"
            :placeholder="t('search.filters.field')"
            :options="fieldOptions"
            clearable
            filterable
            size="small"
          />

          <!-- Sort by -->
          <NSelect
            v-model:value="sortBy"
            :placeholder="t('search.filters.sortBy')"
            :options="sortOptions"
            size="small"
          />

          <!-- Sort order -->
          <NSelect
            v-model:value="sortOrder"
            :placeholder="t('search.filters.sortOrder')"
            :options="orderOptions"
            size="small"
          />

          <div class="flex gap-2 mt-2">
            <NButton type="primary" size="small" @click="applyFilters" class="flex-1">
              {{ t('search.button') }}
            </NButton>
            <NButton size="small" @click="resetFilters">
              {{ t('common.cancel') }}
            </NButton>
          </div>
        </div>
      </NDrawerContent>
    </NDrawer>

    <!-- Main content -->
    <div class="flex flex-1 max-w-7xl mx-auto w-full px-4 py-4 gap-4">
      <!-- Desktop sidebar filters (optional visible) -->
      <aside
        v-if="!sidebarCollapsed && papers.length > 0"
        class="hidden lg:block w-64 shrink-0"
      >
        <div
          class="sticky top-32 rounded-xl p-4"
          style="background: var(--bg-card); border: 1px solid var(--border);"
        >
          <h3 class="text-sm font-semibold mb-3" style="color: var(--text);">
            {{ t('search.advanced') }}
          </h3>

          <div class="flex flex-col gap-3">
            <NInputNumber
              v-model:value="yearFrom"
              :placeholder="t('search.filters.yearFrom')"
              clearable
              size="small"
              :min="1900"
              :max="2030"
            />
            <NInputNumber
              v-model:value="yearTo"
              :placeholder="t('search.filters.yearTo')"
              clearable
              size="small"
              :min="1900"
              :max="2030"
            />
            <NSelect
              v-model:value="sortBy"
              :placeholder="t('search.filters.sortBy')"
              :options="sortOptions"
              size="small"
            />
            <NSelect
              v-model:value="sortOrder"
              :placeholder="t('search.filters.sortOrder')"
              :options="orderOptions"
              size="small"
            />
            <NButton type="primary" size="small" block @click="applyFilters">
              {{ t('search.button') }}
            </NButton>
            <NButton size="small" block @click="resetFilters">
              {{ t('common.cancel') }}
            </NButton>
          </div>
        </div>
      </aside>

      <!-- Results area -->
      <div class="flex-1 min-w-0">
        <!-- Status: loading -->
        <div v-if="isLoading" class="flex flex-col items-center justify-center py-20">
          <NSpin size="large" />
          <p class="mt-4 text-sm" style="color: var(--text-secondary);">
            {{ t('search.searching') }}
          </p>
        </div>

        <!-- Status: error -->
        <NResult
          v-else-if="error"
          status="error"
          :title="t('common.error')"
          :description="error"
        >
          <template #footer>
            <NButton type="primary" @click="retrySearch">
              <template #icon>
                <NIcon><RefreshOutline /></NIcon>
              </template>
              {{ t('common.retry') }}
            </NButton>
          </template>
        </NResult>

        <!-- Status: no query -->
        <div
          v-else-if="!currentQuery"
          class="flex flex-col items-center justify-center py-20"
        >
          <NEmpty :description="t('search.placeholder')" />
        </div>

        <!-- Status: no results -->
        <div
          v-else-if="papers.length === 0 && !isLoading"
          class="flex flex-col items-center justify-center py-20"
        >
          <NEmpty :description="t('search.noResults')" />
        </div>

        <!-- Results list -->
        <template v-else>
          <!-- Results header -->
          <div class="flex items-center justify-between mb-4">
            <span class="text-sm" style="color: var(--text-secondary);">
              {{ t('search.total', { count: total }) }}
            </span>
            <NButton
              v-if="papers.length > 0"
              size="tiny"
              quaternary
              class="lg:hidden"
              @click="sidebarCollapsed = !sidebarCollapsed"
            >
              <template #icon>
                <NIcon><FilterOutline /></NIcon>
              </template>
            </NButton>
          </div>

          <!-- Paper cards -->
          <div class="flex flex-col gap-3">
            <PaperCard
              v-for="paper in papers"
              :key="paper.id"
              :paper="paper"
            />
          </div>

          <!-- Load more -->
          <div v-if="hasMore" class="flex justify-center mt-6 mb-4">
            <NButton
              :loading="isLoading"
              @click="loadMore"
              type="primary"
              ghost
            >
              <template #icon>
                <NIcon><ChevronDownOutline /></NIcon>
              </template>
              {{ t('search.showMore') }}
            </NButton>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
