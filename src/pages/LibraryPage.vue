<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useMessage, useDialog } from 'naive-ui'
import { useFavoritesStore } from '../stores/favorites'
import type { SavedPaper, ReadingStatus, Tag } from '../types/paper'
import {
  NButton,
  NIcon,
  NInput,
  NTag,
  NSpace,
  NSpin,
  NEmpty,
  NCard,
  NTabs,
  NTabPane,
  NSelect,
  NModal,
  NDropdown,
  NCheckbox,
  NTooltip,
  NPopconfirm,
  NDivider,
  NScrollbar,
} from 'naive-ui'
import {
  SearchOutline,
  TrashOutline,
  DownloadOutline,
  CloudUploadOutline,
  AddOutline,
  BookmarkOutline,
  FilterOutline,
  CheckmarkOutline,
  EllipsisVerticalOutline,
  PricetagOutline,
  CreateOutline,
  DocumentTextOutline,
  CloseOutline,
  HeartOutline,
  LibraryOutline,
} from '@vicons/ionicons5'

const router = useRouter()
const { t } = useI18n()
const message = useMessage()
const dialog = useDialog()
const favoritesStore = useFavoritesStore()

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const searchQuery = ref('')
const activeStatusTab = ref('all')
const selectedTagId = ref<string | null>(null)
const sortBy = ref<'addedAt' | 'title' | 'year' | 'citationCount'>('addedAt')
const sortOrder = ref<'asc' | 'desc'>('desc')

// New tag modal
const showNewTagModal = ref(false)
const newTagName = ref('')
const newTagColor = ref('#1890ff')

// Batch tag modal
const showBatchTagModal = ref(false)
const batchTagId = ref('')

// Notes expanded state
const expandedNotes = ref<Set<string>>(new Set())
const editingNoteFor = ref<string | null>(null)
const noteEditText = ref('')

// Import file input
const fileInput = ref<HTMLInputElement | null>(null)

// Tag management
const managingTag = ref<Tag | null>(null)
const showRenameTagModal = ref(false)
const renameTagName = ref('')

// ---------------------------------------------------------------------------
// Reading status tab options
// ---------------------------------------------------------------------------

const statusTabs = computed(() => [
  { label: t('library.all'), value: 'all' },
  { label: t('library.unread'), value: 'unread' },
  { label: t('library.reading'), value: 'reading' },
  { label: t('library.read'), value: 'read' },
])

const sortOptions = computed(() => [
  { label: 'Added Time', value: 'addedAt' },
  { label: 'Title', value: 'title' },
  { label: 'Year', value: 'year' },
  { label: 'Citations', value: 'citationCount' },
])

// ---------------------------------------------------------------------------
// Tag colors
// ---------------------------------------------------------------------------

const tagColorOptions = [
  '#1890ff', '#52c41a', '#faad14', '#f5222d',
  '#722ed1', '#13c2c2', '#eb2f96', '#fa8c16',
  '#2f54eb', '#a0d911',
]

// ---------------------------------------------------------------------------
// Filtered and sorted papers
// ---------------------------------------------------------------------------

const filteredPapers = computed(() => {
  let result = [...favoritesStore.papers]

  // Status filter
  if (activeStatusTab.value !== 'all') {
    result = result.filter(p => p.readingStatus === activeStatusTab.value)
  }

  // Tag filter
  if (selectedTagId.value) {
    result = result.filter(p => p.tags.includes(selectedTagId.value!))
  }

  // Search filter
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.authors.some(a => a.name.toLowerCase().includes(q)) ||
      (p.doi && p.doi.toLowerCase().includes(q))
    )
  }

  // Sort
  result.sort((a, b) => {
    let cmp = 0
    switch (sortBy.value) {
      case 'addedAt':
        cmp = (a.addedAt?.getTime() || 0) - (b.addedAt?.getTime() || 0)
        break
      case 'title':
        cmp = a.title.localeCompare(b.title)
        break
      case 'year':
        cmp = (a.year || 0) - (b.year || 0)
        break
      case 'citationCount':
        cmp = a.citationCount - b.citationCount
        break
    }
    return sortOrder.value === 'desc' ? -cmp : cmp
  })

  return result
})

// Tag paper counts
const tagPaperCounts = computed(() => {
  const counts = new Map<string, number>()
  for (const paper of favoritesStore.papers) {
    for (const tagId of paper.tags) {
      counts.set(tagId, (counts.get(tagId) || 0) + 1)
    }
  }
  return counts
})

const hasSelection = computed(() => favoritesStore.selectedCount > 0)

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function goToPaper(paperId: string) {
  router.push({ name: 'paper', params: { id: paperId } })
}

function toggleFavorite(paper: SavedPaper) {
  favoritesStore.removePaper(paper.id)
  message.success(t('paper.removeFromLibrary'))
}

function toggleSelect(paperId: string) {
  favoritesStore.toggleSelect(paperId)
}

function toggleSelectAll() {
  if (favoritesStore.selectedCount === filteredPapers.value.length) {
    favoritesStore.deselectAll()
  } else {
    for (const p of filteredPapers.value) {
      if (!favoritesStore.selectedPapers.has(p.id)) {
        favoritesStore.toggleSelect(p.id)
      }
    }
  }
}

function removeSelected() {
  dialog.warning({
    title: t('common.confirm'),
    content: t('library.deleteConfirm'),
    positiveText: t('common.delete'),
    negativeText: t('common.cancel'),
    onPositiveClick: async () => {
      await favoritesStore.batchRemove()
      message.success('Removed')
    },
  })
}

async function batchAddTagAction() {
  if (!batchTagId.value) return
  await favoritesStore.batchAddTag(batchTagId.value)
  showBatchTagModal.value = false
  batchTagId.value = ''
  message.success('Tag added')
}

async function createNewTag() {
  if (!newTagName.value.trim()) return
  await favoritesStore.createTag(newTagName.value.trim(), newTagColor.value)
  showNewTagModal.value = false
  newTagName.value = ''
  message.success('Tag created')
}

async function deleteTagAction(tag: Tag) {
  dialog.warning({
    title: t('common.confirm'),
    content: `Delete tag "${tag.name}"?`,
    positiveText: t('common.delete'),
    negativeText: t('common.cancel'),
    onPositiveClick: async () => {
      await favoritesStore.deleteTag(tag.id)
      if (selectedTagId.value === tag.id) {
        selectedTagId.value = null
      }
      message.success('Tag deleted')
    },
  })
}

function startRenameTag(tag: Tag) {
  managingTag.value = tag
  renameTagName.value = tag.name
  showRenameTagModal.value = true
}

async function confirmRenameTag() {
  if (!managingTag.value || !renameTagName.value.trim()) return
  const { updateTag } = await import('../db')
  await updateTag(managingTag.value.id, { name: renameTagName.value.trim() })
  managingTag.value.name = renameTagName.value.trim()
  showRenameTagModal.value = false
  message.success('Tag renamed')
}

async function addTagToPaper(paperId: string, tagId: string) {
  await favoritesStore.addTagToPaper(paperId, tagId)
}

async function removeTagFromPaper(paperId: string, tagId: string) {
  await favoritesStore.removeTagFromPaper(paperId, tagId)
}

async function updateReadingStatus(paperId: string, status: ReadingStatus) {
  await favoritesStore.updateReadingStatus(paperId, status)
}

function toggleNotesExpand(paperId: string) {
  if (expandedNotes.value.has(paperId)) {
    expandedNotes.value.delete(paperId)
  } else {
    expandedNotes.value.add(paperId)
  }
}

function startEditNote(paper: SavedPaper) {
  editingNoteFor.value = paper.id
  noteEditText.value = paper.notes
}

async function saveNote(paperId: string) {
  await favoritesStore.updateNotes(paperId, noteEditText.value)
  editingNoteFor.value = null
  message.success(t('common.save'))
}

function cancelEditNote() {
  editingNoteFor.value = null
}

async function handleExport(format: 'bibtex' | 'json') {
  try {
    const content = await favoritesStore.exportAll(format)
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `library-export.${format === 'json' ? 'json' : 'bib'}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    message.success('Exported')
  } catch (e) {
    message.error('Export failed: ' + (e as Error).message)
  }
}

async function handleBatchExport(format: 'bibtex' | 'json') {
  try {
    const content = await favoritesStore.exportSelected(format)
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `library-export.${format === 'json' ? 'json' : 'bib'}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    message.success('Exported')
  } catch (e) {
    message.error('Export failed: ' + (e as Error).message)
  }
}

async function handleImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const settingsStore = (await import('../stores/settings')).useSettingsStore()
    await settingsStore.importData(file)
    await favoritesStore.loadLibrary()
    message.success('Data imported')
  } catch (e) {
    message.error('Import failed: ' + (e as Error).message)
  }

  target.value = ''
}

function readingStatusDot(status: ReadingStatus): string {
  switch (status) {
    case 'reading': return '#1890ff'
    case 'read': return '#52c41a'
    default: return '#d9d9d9'
  }
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

onMounted(async () => {
  await favoritesStore.loadLibrary()
})
</script>

<template>
  <div class="min-h-screen" style="background: var(--bg);">
    <div class="max-w-7xl mx-auto px-4 md:px-8 py-6">
      <!-- Page title -->
      <div class="flex items-center justify-between mb-4">
        <h1 class="text-xl md:text-2xl font-bold" style="color: var(--text);">
          {{ t('library.title') }}
        </h1>
        <NSpace>
          <NButton size="small" @click="handleExport('json')">
            <template #icon><NIcon><DownloadOutline /></NIcon></template>
            {{ t('library.exportJson') }}
          </NButton>
          <NButton size="small" @click="handleExport('bibtex')">
            <template #icon><NIcon><DownloadOutline /></NIcon></template>
            {{ t('library.exportBibtex') }}
          </NButton>
          <NButton size="small" @click="fileInput?.click()">
            <template #icon><NIcon><CloudUploadOutline /></NIcon></template>
            {{ t('library.import') }}
          </NButton>
          <input
            ref="fileInput"
            type="file"
            accept=".json"
            class="hidden"
            @change="handleImport"
          />
        </NSpace>
      </div>

      <!-- Toolbar: status tabs + search + sort -->
      <div class="flex flex-col md:flex-row items-start md:items-center gap-3 mb-4">
        <NTabs v-model:value="activeStatusTab" type="line" size="small">
          <NTabPane v-for="tab in statusTabs" :key="tab.value" :name="tab.value" :tab="tab.label" />
        </NTabs>

        <div class="flex-1" />

        <NInput
          v-model:value="searchQuery"
          :placeholder="t('search.placeholder')"
          clearable
          size="small"
          style="max-width: 280px;"
        >
          <template #prefix>
            <NIcon><SearchOutline /></NIcon>
          </template>
        </NInput>

        <NSelect
          v-model:value="sortBy"
          :options="sortOptions"
          size="small"
          style="width: 140px;"
        />
      </div>

      <!-- Batch actions bar (visible when items selected) -->
      <div
        v-if="hasSelection"
        class="flex items-center gap-3 mb-4 p-3 rounded-lg"
        style="background: var(--bg-secondary);"
      >
        <span class="text-sm font-medium" style="color: var(--text);">
          {{ favoritesStore.selectedCount }} selected
        </span>
        <NButton size="small" @click="toggleSelectAll">
          {{ favoritesStore.selectedCount === filteredPapers.length ? t('library.deselectAll') : t('library.selectAll') }}
        </NButton>
        <NButton size="small" @click="showBatchTagModal = true">
          <template #icon><NIcon><PricetagOutline /></NIcon></template>
          {{ t('library.batchTag') }}
        </NButton>
        <NButton size="small" @click="handleBatchExport('json')">
          <template #icon><NIcon><DownloadOutline /></NIcon></template>
          {{ t('library.batchExport') }}
        </NButton>
        <NButton size="small" type="error" @click="removeSelected">
          <template #icon><NIcon><TrashOutline /></NIcon></template>
          {{ t('common.delete') }}
        </NButton>
      </div>

      <!-- Main layout: sidebar + content -->
      <div class="flex gap-6">
        <!-- Left sidebar: tags -->
        <div class="hidden md:block w-56 shrink-0">
          <NCard size="small" class="sticky top-20">
            <div class="flex items-center justify-between mb-3">
              <span class="text-sm font-semibold" style="color: var(--text);">{{ t('library.tags') }}</span>
              <NButton size="tiny" quaternary @click="showNewTagModal = true">
                <template #icon><NIcon><AddOutline /></NIcon></template>
              </NButton>
            </div>

            <!-- All / no filter -->
            <button
              class="w-full text-left text-sm px-2 py-1.5 rounded cursor-pointer border-none"
              :style="{
                background: !selectedTagId ? 'var(--bg-secondary)' : 'transparent',
                color: 'var(--text)',
              }"
              @click="selectedTagId = null"
            >
              {{ t('library.all') }} ({{ favoritesStore.papers.length }})
            </button>

            <NDivider style="margin: 8px 0;" />

            <NScrollbar style="max-height: 400px;">
              <div
                v-for="tag in favoritesStore.tags"
                :key="tag.id"
                class="group flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer hover:bg-[var(--bg-secondary)]"
                :style="{ background: selectedTagId === tag.id ? 'var(--bg-secondary)' : 'transparent' }"
                @click="selectedTagId = selectedTagId === tag.id ? null : tag.id"
              >
                <span
                  class="w-2.5 h-2.5 rounded-full shrink-0"
                  :style="{ background: tag.color }"
                />
                <span class="text-sm flex-1 truncate" style="color: var(--text);">
                  {{ tag.name }}
                </span>
                <span class="text-xs" style="color: var(--text-secondary);">
                  {{ tagPaperCounts.get(tag.id) || 0 }}
                </span>

                <!-- Tag actions (show on hover) -->
                <div class="hidden group-hover:flex items-center gap-0.5">
                  <NButton size="tiny" quaternary @click.stop="startRenameTag(tag)">
                    <template #icon><NIcon size="12"><CreateOutline /></NIcon></template>
                  </NButton>
                  <NButton size="tiny" quaternary @click.stop="deleteTagAction(tag)">
                    <template #icon><NIcon size="12"><CloseOutline /></NIcon></template>
                  </NButton>
                </div>
              </div>

              <div v-if="!favoritesStore.tags.length" class="text-xs py-2 text-center" style="color: var(--text-secondary);">
                No tags yet
              </div>
            </NScrollbar>
          </NCard>
        </div>

        <!-- Main content -->
        <div class="flex-1 min-w-0">
          <NSpin :show="favoritesStore.loading">
            <div v-if="filteredPapers.length" class="flex flex-col gap-3">
              <NCard
                v-for="paper in filteredPapers"
                :key="paper.id"
                size="small"
                hoverable
                class="transition-shadow"
              >
                <div class="flex gap-3">
                  <!-- Checkbox -->
                  <div class="flex items-start pt-1">
                    <NCheckbox
                      :checked="favoritesStore.selectedPapers.has(paper.id)"
                      @update:checked="toggleSelect(paper.id)"
                    />
                  </div>

                  <!-- Content -->
                  <div class="flex-1 min-w-0">
                    <!-- Title row -->
                    <div class="flex items-start gap-2">
                      <!-- Reading status dot -->
                      <span
                        class="w-2 h-2 rounded-full mt-2 shrink-0"
                        :style="{ background: readingStatusDot(paper.readingStatus) }"
                      />
                      <h3
                        class="text-sm font-semibold leading-snug cursor-pointer hover:underline line-clamp-2 flex-1"
                        style="color: var(--primary);"
                        @click="goToPaper(paper.id)"
                      >
                        {{ paper.title }}
                      </h3>
                    </div>

                    <!-- Authors + Year + Venue -->
                    <div class="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1 text-xs" style="color: var(--text-secondary);">
                      <span>{{ paper.authors.slice(0, 3).map(a => a.name).join(', ') }}{{ paper.authors.length > 3 ? ' et al.' : '' }}</span>
                      <span v-if="paper.year">&middot; {{ paper.year }}</span>
                      <span v-if="paper.venue">&middot; <em>{{ paper.venue }}</em></span>
                      <span>&middot; {{ t('search.citations', { count: paper.citationCount }) }}</span>
                    </div>

                    <!-- Tags row -->
                    <div class="flex flex-wrap items-center gap-1.5 mt-2">
                      <NTag
                        v-for="tagId in paper.tags"
                        :key="tagId"
                        size="small"
                        closable
                        round
                        :bordered="false"
                        :style="{
                          background: favoritesStore.tags.find(t => t.id === tagId)?.color || '#1890ff',
                          color: '#fff',
                        }"
                        @close="removeTagFromPaper(paper.id, tagId)"
                      >
                        {{ favoritesStore.tags.find(t => t.id === tagId)?.name || tagId }}
                      </NTag>

                      <!-- Add tag dropdown -->
                      <NDropdown
                        trigger="click"
                        :options="favoritesStore.tags
                          .filter(tag => !paper.tags.includes(tag.id))
                          .map(tag => ({ label: tag.name, key: tag.id }))"
                        @select="(key: string) => addTagToPaper(paper.id, key)"
                      >
                        <NButton size="tiny" quaternary>
                          <template #icon><NIcon size="12"><AddOutline /></NIcon></template>
                        </NButton>
                      </NDropdown>
                    </div>

                    <!-- Action row -->
                    <div class="flex flex-wrap items-center gap-2 mt-2">
                      <!-- Reading status -->
                      <NSelect
                        :value="paper.readingStatus"
                        :options="[
                          { label: t('library.unread'), value: 'unread' },
                          { label: t('library.reading'), value: 'reading' },
                          { label: t('library.read'), value: 'read' },
                        ]"
                        size="tiny"
                        style="width: 90px;"
                        @update:value="(v: string) => updateReadingStatus(paper.id, v as ReadingStatus)"
                      />

                      <NButton size="tiny" quaternary @click="toggleNotesExpand(paper.id)">
                        <template #icon><NIcon size="14"><DocumentTextOutline /></NIcon></template>
                        {{ t('library.notes') }}
                      </NButton>

                      <NButton v-if="paper.pdfUrl" size="tiny" quaternary @click="window.open(paper.pdfUrl, '_blank')">
                        <template #icon><NIcon size="14"><DocumentTextOutline /></NIcon></template>
                        PDF
                      </NButton>

                      <span class="flex-1" />

                      <NButton size="tiny" quaternary type="error" @click="toggleFavorite(paper)">
                        <template #icon><NIcon size="14"><TrashOutline /></NIcon></template>
                      </NButton>
                    </div>

                    <!-- Notes section (expandable) -->
                    <div
                      v-if="expandedNotes.has(paper.id)"
                      class="mt-3 p-3 rounded text-sm"
                      style="background: var(--bg-secondary);"
                    >
                      <div v-if="editingNoteFor === paper.id">
                        <NInput
                          v-model:value="noteEditText"
                          type="textarea"
                          :rows="4"
                          :placeholder="t('library.addNote')"
                          size="small"
                        />
                        <NSpace class="mt-2">
                          <NButton size="tiny" type="primary" @click="saveNote(paper.id)">{{ t('common.save') }}</NButton>
                          <NButton size="tiny" @click="cancelEditNote">{{ t('common.cancel') }}</NButton>
                        </NSpace>
                      </div>
                      <div v-else>
                        <p v-if="paper.notes" class="whitespace-pre-wrap" style="color: var(--text);">
                          {{ paper.notes }}
                        </p>
                        <p v-else class="italic" style="color: var(--text-secondary);">
                          {{ t('library.addNote') }}
                        </p>
                        <NButton size="tiny" quaternary class="mt-1" @click="startEditNote(paper)">
                          <template #icon><NIcon size="12"><CreateOutline /></NIcon></template>
                          {{ t('common.edit') }}
                        </NButton>
                      </div>
                    </div>
                  </div>
                </div>
              </NCard>
            </div>

            <!-- Empty state -->
            <NEmpty v-else :description="t('library.empty')" class="py-16">
              <template #extra>
                <NButton type="primary" @click="router.push('/search')">
                  {{ t('nav.search') }}
                </NButton>
              </template>
            </NEmpty>
          </NSpin>
        </div>
      </div>
    </div>

    <!-- New tag modal -->
    <NModal v-model:show="showNewTagModal" preset="dialog" :title="t('library.addTag')" positive-text="Create" negative-text="Cancel"
      @positive-click="createNewTag"
    >
      <div class="flex flex-col gap-3">
        <NInput v-model:value="newTagName" placeholder="Tag name" />
        <div class="flex items-center gap-2">
          <span class="text-sm" style="color: var(--text-secondary);">Color:</span>
          <div class="flex gap-1.5">
            <button
              v-for="c in tagColorOptions"
              :key="c"
              class="w-6 h-6 rounded-full border-2 cursor-pointer"
              :style="{
                background: c,
                borderColor: newTagColor === c ? 'var(--text)' : 'transparent',
              }"
              @click="newTagColor = c"
            />
          </div>
        </div>
      </div>
    </NModal>

    <!-- Batch tag modal -->
    <NModal v-model:show="showBatchTagModal" preset="dialog" :title="t('library.batchTag')" positive-text="Add" negative-text="Cancel"
      @positive-click="batchAddTagAction"
    >
      <NSelect
        v-model:value="batchTagId"
        :options="favoritesStore.tags.map(tag => ({ label: tag.name, value: tag.id }))"
        placeholder="Select tag"
      />
    </NModal>

    <!-- Rename tag modal -->
    <NModal v-model:show="showRenameTagModal" preset="dialog" :title="t('common.edit')" positive-text="Save" negative-text="Cancel"
      @positive-click="confirmRenameTag"
    >
      <NInput v-model:value="renameTagName" placeholder="Tag name" />
    </NModal>
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
