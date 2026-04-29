<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useSearchStore } from '../stores/search'
import {
  NInput,
  NButton,
  NIcon,
  NPopover,
  NSpin,
} from 'naive-ui'
import {
  SearchOutline,
  CloseOutline,
  TimeOutline,
} from '@vicons/ionicons5'

const props = withDefaults(defineProps<{
  size?: 'large' | 'default'
  placeholder?: string
}>(), {
  size: 'default',
  placeholder: '',
})

const emit = defineEmits<{
  search: [query: string]
}>()

const { t } = useI18n()
const router = useRouter()
const searchStore = useSearchStore()

const query = ref('')
const isFocused = ref(false)
const inputRef = ref<HTMLElement | null>(null)

const inputSize = computed(() => (props.size === 'large' ? 'large' : 'medium'))
const resolvedPlaceholder = computed(() =>
  props.placeholder || t('search.placeholder')
)

const recentSearches = computed(() =>
  searchStore.searchHistory.slice(0, 8)
)

const showHistory = computed(() =>
  isFocused.value && recentSearches.value.length > 0 && query.value.length === 0
)

function handleSearch() {
  const q = query.value.trim()
  if (!q) return
  emit('search', q)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    handleSearch()
  }
}

function selectHistory(q: string) {
  query.value = q
  isFocused.value = false
  emit('search', q)
}

function handleFocus() {
  isFocused.value = true
}

function handleBlur() {
  // Delay to allow click on history item
  setTimeout(() => {
    isFocused.value = false
  }, 200)
}

function clearHistory() {
  searchStore.clearSearchHistory()
}

// Set initial query if provided via route
onMounted(() => {
  searchStore.loadSearchHistory()
})
</script>

<template>
  <div class="relative w-full" :class="size === 'large' ? 'max-w-2xl' : 'max-w-xl'">
    <!-- Input + Button -->
    <div class="flex items-center gap-2">
      <div class="flex-1 relative">
        <NInput
          ref="inputRef"
          v-model:value="query"
          :size="inputSize"
          :placeholder="resolvedPlaceholder"
          clearable
          round
          @keydown="handleKeydown"
          @focus="handleFocus"
          @blur="handleBlur"
        >
          <template #prefix>
            <NIcon :size="18" style="color: var(--text-secondary);">
              <SearchOutline />
            </NIcon>
          </template>
        </NInput>
      </div>
      <NButton
        v-if="size === 'large'"
        type="primary"
        :size="inputSize"
        round
        @click="handleSearch"
      >
        <template #icon>
          <NIcon><SearchOutline /></NIcon>
        </template>
        {{ t('search.button') }}
      </NButton>
    </div>

    <!-- Search History Dropdown -->
    <Transition name="fade">
      <div
        v-if="showHistory"
        class="absolute top-full left-0 right-0 mt-1 rounded-lg shadow-lg overflow-hidden z-50"
        style="background: var(--bg-card); border: 1px solid var(--border);"
      >
        <div class="flex items-center justify-between px-4 py-2" style="border-bottom: 1px solid var(--border);">
          <span class="text-xs font-medium" style="color: var(--text-secondary);">
            {{ t('search.history') }}
          </span>
          <NButton text size="tiny" type="error" @click="clearHistory">
            {{ t('search.clearHistory') }}
          </NButton>
        </div>
        <ul class="max-h-64 overflow-y-auto">
          <li
            v-for="(record, idx) in recentSearches"
            :key="idx"
            class="flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:opacity-80"
            style="color: var(--text);"
            @mousedown.prevent="selectHistory(record.query)"
          >
            <NIcon :size="16" style="color: var(--text-secondary);">
              <TimeOutline />
            </NIcon>
            <span class="truncate text-sm">{{ record.query }}</span>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
