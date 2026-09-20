<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import SearchBar from '../components/SearchBar.vue'
import { NIcon, NCard } from 'naive-ui'
import {
  RocketOutline,
  EyeOutline,
  HardwareChipOutline,
  SettingsOutline,
  PulseOutline,
  CellularOutline,
  CalculatorOutline,
  BulbOutline,
  GitMergeOutline,
  CloudOutline,
  ShieldCheckmarkOutline,
  BugOutline,
} from '@vicons/ionicons5'
import { researchFields } from '../data/fields'
import { getTrendData } from '../api/openalex'

const router = useRouter()
const { t } = useI18n()

// Icon name string -> component mapping
const iconMap: Record<string, any> = {
  RocketOutline,
  EyeOutline,
  HardwareChipOutline,
  SettingsOutline,
  PulseOutline,
  CellularOutline,
  CalculatorOutline,
  BulbOutline,
  GitMergeOutline,
  CloudOutline,
  ShieldCheckmarkOutline,
  BugOutline,
}

// Real-time paper counts per field (current year, OpenAlex)
const countMap = ref<Record<string, string>>({})
const currentYear = new Date().getFullYear()

onMounted(async () => {
  await Promise.allSettled(
    researchFields.map(async (f) => {
      try {
        const data = await getTrendData(f.keyword, currentYear - 2, currentYear)
        const sum = Object.values(data).reduce((a, b) => a + b, 0)
        if (sum > 0) {
          countMap.value[f.slug] = sum >= 1000
            ? `${Math.round(sum / 100) / 10}K+`
            : `${sum}`
        }
      } catch {
        // leave empty, rendered as '--'
      }
    }),
  )
})

function handleSearch(query: string) {
  router.push({ path: '/search', query: { q: query } })
}

function goToField(slug: string) {
  router.push({ name: 'field', params: { slug } })
}
</script>

<template>
  <div class="flex flex-col items-center w-full">
    <!-- Hero Section -->
    <section class="flex flex-col items-center justify-center w-full px-4 pt-20 pb-12 md:pt-28 md:pb-16">
      <h1 class="text-4xl md:text-5xl font-bold tracking-tight mb-4" style="color: var(--primary);">
        ScholarSearch
      </h1>
      <p class="text-base md:text-lg mb-8 text-center max-w-lg" style="color: var(--text-secondary);">
        {{ t('locale') === 'zh'
          ? '跨平台学术文献检索引擎，聚合 OpenAlex、Semantic Scholar、CrossRef、arXiv'
          : 'Cross-platform academic search engine powered by OpenAlex, Semantic Scholar, CrossRef & arXiv'
        }}
      </p>

      <!-- Search bar -->
      <SearchBar size="large" @search="handleSearch" />
    </section>

    <!-- Hot Research Fields -->
    <section class="w-full max-w-6xl px-4 pb-16">
      <h2 class="text-lg font-semibold mb-6 text-center" style="color: var(--text);">
        {{ t('locale') === 'zh' ? '热门研究领域' : 'Popular Research Fields' }}
      </h2>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="field in researchFields"
          :key="field.slug"
          class="group relative rounded-xl p-5 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
          style="background: var(--bg-card); border: 1px solid var(--border);"
          @click="goToField(field.slug)"
        >
          <div class="flex items-start gap-4">
            <!-- Icon -->
            <div
              class="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              :style="{ background: field.color + '18' }"
            >
              <NIcon :size="26" :color="field.color">
                <component :is="iconMap[field.icon]" />
              </NIcon>
            </div>

            <div class="min-w-0 flex-1">
              <!-- Name -->
              <div class="font-medium text-sm mb-0.5" style="color: var(--text);">
                {{ field.name }}
              </div>
              <div class="text-xs mb-2 truncate" style="color: var(--text-secondary);">
                {{ field.nameEn }}
              </div>

              <!-- Paper count -->
              <div class="text-xs" style="color: var(--text-secondary);">
                {{ countMap[field.slug] || '--' }} {{ t('locale') === 'zh' ? '篇论文' : 'papers' }}
              </div>
            </div>
          </div>

          <!-- Hover accent bar -->
          <div
            class="absolute bottom-0 left-3 right-3 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            :style="{ background: field.color }"
          />
        </div>
      </div>
    </section>
  </div>
</template>
