<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useFavoritesStore } from '../stores/favorites'
import { useSettingsStore } from '../stores/settings'
import { translateText, type TranslationConfig } from '../api/translate'
import type { Paper } from '../types/paper'
import {
  NCard,
  NButton,
  NIcon,
  NTag,
  NSpace,
  NTooltip,
} from 'naive-ui'
import {
  HeartOutline,
  Heart,
  DocumentTextOutline,
  OpenOutline,
  ChevronDownOutline,
  ChevronUpOutline,
} from '@vicons/ionicons5'

const props = defineProps<{
  paper: Paper
}>()

const { t } = useI18n()
const router = useRouter()
const favoritesStore = useFavoritesStore()
const settingsStore = useSettingsStore()

const abstractExpanded = ref(false)
const ABSTRACT_LIMIT = 200

// Translation state
const translationCache = new Map<string, string>()
const translating = ref(false)
const translatedText = ref('')

const isSaved = computed(() => favoritesStore.isSaved(props.paper.id))

const authors = computed(() => {
  const list = props.paper.authors || []
  if (list.length <= 3) return list.map((a) => a.name).join(', ')
  const first3 = list.slice(0, 3).map((a) => a.name).join(', ')
  return `${first3} ${t('search.total', { count: list.length }).replace(/.*?(\d+).*/, '') > '' ? '...' : '...'}`
})

const authorDisplay = computed(() => {
  const list = props.paper.authors || []
  if (list.length <= 3) return list.map((a) => a.name).join(', ')
  return list.slice(0, 3).map((a) => a.name).join(', ') + ` et al.`
})

const abstractText = computed(() => props.paper.abstract || props.paper.tldr || '')
const abstractTruncated = computed(() => {
  if (!abstractText.value) return ''
  if (abstractText.value.length <= ABSTRACT_LIMIT) return abstractText.value
  if (abstractExpanded.value) return abstractText.value
  return abstractText.value.slice(0, ABSTRACT_LIMIT) + '...'
})

const canExpand = computed(() =>
  abstractText.value.length > ABSTRACT_LIMIT
)

const sourceColors: Record<string, string> = {
  'OpenAlex': '#10b981',
  'Semantic Scholar': '#6366f1',
  'CrossRef': '#f59e0b',
  'arXiv': '#ef4444',
}

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
  if (!abstractText.value || isChinese(abstractText.value)) return
  if (translationCache.has(props.paper.id)) {
    translatedText.value = translationCache.get(props.paper.id)!
    return
  }

  translating.value = true
  try {
    const config = getTranslationConfig()
    translatedText.value = await translateText(abstractText.value, config)
    if (translatedText.value) {
      translationCache.set(props.paper.id, translatedText.value)
    }
  } catch (e) {
    console.warn('Translation failed:', e)
  } finally {
    translating.value = false
  }
}

function toggleFavorite() {
  if (isSaved.value) {
    favoritesStore.removePaper(props.paper.id)
  } else {
    favoritesStore.addPaper(props.paper)
  }
}

function goToDetail() {
  router.push({ name: 'paper', params: { id: props.paper.id } })
}

function openPdf() {
  if (props.paper.pdfUrl) {
    window.open(props.paper.pdfUrl, '_blank')
  }
}
</script>

<template>
  <NCard
    class="paper-card group"
    hoverable
    :bordered="true"
    style="border-radius: 12px; transition: box-shadow 0.2s ease;"
  >
    <div class="flex flex-col gap-3">
      <!-- Title -->
      <h3
        class="text-base font-semibold leading-snug cursor-pointer hover:underline line-clamp-2"
        style="color: var(--primary);"
        @click="goToDetail"
      >
        {{ paper.title }}
      </h3>

      <!-- Authors + Year + Venue -->
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm" style="color: var(--text-secondary);">
        <span>{{ authorDisplay }}</span>
        <span v-if="paper.year" class="flex items-center gap-1">
          · {{ paper.year }}
        </span>
        <span v-if="paper.venue" class="truncate max-w-xs">
          · <em>{{ paper.venue }}</em>
        </span>
      </div>

      <!-- Abstract -->
      <div v-if="abstractText" class="text-sm leading-relaxed" style="color: var(--text-secondary);">
        <span>{{ abstractTruncated }}</span>
        <button
          v-if="canExpand"
          class="ml-1 text-xs font-medium cursor-pointer"
          style="color: var(--primary);"
          @click="abstractExpanded = !abstractExpanded"
        >
          {{ abstractExpanded ? '收起' : '展开' }}
          <NIcon :size="12" class="inline-block align-middle">
            <ChevronUpOutline v-if="abstractExpanded" />
            <ChevronDownOutline v-else />
          </NIcon>
        </button>
        <button
          v-if="abstractText && !isChinese(abstractText)"
          class="ml-2 text-xs font-medium cursor-pointer"
          style="color: var(--primary);"
          @click="translateAbstract"
        >
          {{ translating ? '翻译中...' : '翻译' }}
        </button>
      </div>
      <!-- Translation result -->
      <div v-if="translatedText" class="text-sm leading-relaxed mt-1 pl-3"
           style="color: var(--text-secondary); border-left: 2px solid var(--primary);">
        {{ translatedText }}
      </div>

      <!-- Bottom row: sources, citations, actions -->
      <div class="flex flex-wrap items-center gap-2 mt-1">
        <!-- Source tags -->
        <NTag
          v-for="src in paper.source"
          :key="src"
          size="small"
          :bordered="false"
          round
          :style="{ background: sourceColors[src] || '#94a3b8', color: '#fff' }"
        >
          {{ src }}
        </NTag>

        <!-- Citation count -->
        <span class="text-xs" style="color: var(--text-secondary);">
          {{ t('search.citations', { count: paper.citationCount }) }}
        </span>

        <!-- Spacer -->
        <span class="flex-1" />

        <!-- Action buttons -->
        <NTooltip>
          <template #trigger>
            <NButton
              size="small"
              quaternary
              :type="isSaved ? 'error' : 'default'"
              @click.stop="toggleFavorite"
            >
              <template #icon>
                <NIcon>
                  <Heart v-if="isSaved" />
                  <HeartOutline v-else />
                </NIcon>
              </template>
            </NButton>
          </template>
          {{ isSaved ? t('paper.removeFromLibrary') : t('paper.addToLibrary') }}
        </NTooltip>

        <NTooltip v-if="paper.pdfUrl">
          <template #trigger>
            <NButton size="small" quaternary @click.stop="openPdf">
              <template #icon>
                <NIcon><DocumentTextOutline /></NIcon>
              </template>
            </NButton>
          </template>
          {{ t('paper.viewPdf') }}
        </NTooltip>

        <NTooltip v-if="paper.url">
          <template #trigger>
            <NButton size="small" quaternary @click.stop="window.open(paper.url, '_blank')">
              <template #icon>
                <NIcon><OpenOutline /></NIcon>
              </template>
            </NButton>
          </template>
          {{ t('paper.viewSource') }}
        </NTooltip>
      </div>
    </div>
  </NCard>
</template>

<style scoped>
.paper-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}
[data-theme="dark"] .paper-card:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
