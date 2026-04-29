<script setup lang="ts">
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
} from '@vicons/ionicons5'
import { researchFields } from '../data/fields'

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
}

// Paper count estimates for display
const countMap: Record<string, string> = {
  'llm': '120K+',
  'computer-vision': '280K+',
  'embodied-ai': '35K+',
  'robotics': '95K+',
  'control-theory': '150K+',
  'signal-processing': '200K+',
  'deep-learning': '350K+',
  'reinforcement-learning': '80K+',
  'optimization': '180K+',
  'autonomous-driving': '60K+',
  'multimodal': '45K+',
  'nlp': '200K+',
}

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

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4">
        <div
          v-for="field in researchFields"
          :key="field.slug"
          class="group relative rounded-xl p-4 cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-lg"
          style="background: var(--bg-card); border: 1px solid var(--border);"
          @click="goToField(field.slug)"
        >
          <!-- Icon -->
          <div
            class="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
            :style="{ background: field.color + '18' }"
          >
            <NIcon :size="22" :color="field.color">
              <component :is="iconMap[field.icon]" />
            </NIcon>
          </div>

          <!-- Name -->
          <div class="font-medium text-sm mb-0.5" style="color: var(--text);">
            {{ field.name }}
          </div>
          <div class="text-xs mb-2" style="color: var(--text-secondary);">
            {{ field.nameEn }}
          </div>

          <!-- Paper count -->
          <div class="text-xs" style="color: var(--text-secondary);">
            {{ countMap[field.slug] || 'N/A' }} {{ t('locale') === 'zh' ? '篇论文' : 'papers' }}
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
