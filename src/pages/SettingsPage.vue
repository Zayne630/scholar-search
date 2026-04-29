<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMessage, useDialog } from 'naive-ui'
import { useSettingsStore } from '../stores/settings'
import type { LLMProvider } from '../api/llm'
import { DEFAULT_MODELS } from '../api/llm'
import type { TranslationService } from '../api/translate'
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NButton,
  NSelect,
  NSwitch,
  NSpace,
  NIcon,
  NDivider,
  NModal,
  NDescriptions,
  NDescriptionsItem,
  NTag,
  NAlert,
  NTooltip,
  NSpin,
  NText,
} from 'naive-ui'
import {
  SunnyOutline,
  MoonOutline,
  DesktopOutline,
  LanguageOutline,
  KeyOutline,
  CloudUploadOutline,
  CloudDownloadOutline,
  TrashOutline,
  InformationCircleOutline,
  OpenOutline,
  SyncOutline,
  LogoGithub,
  SparklesOutline,
  CheckmarkCircleOutline,
  CloseCircleOutline,
} from '@vicons/ionicons5'

const { t } = useI18n()
const message = useMessage()
const dialog = useDialog()
const settingsStore = useSettingsStore()

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

const syncing = ref(false)
const showClearConfirm = ref(false)
const clearConfirmText = ref('')
const importing = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// API key visibility
const showOpenalexKey = ref(false)
const showS2Key = ref(false)
const showGistToken = ref(false)
const showLLMApiKey = ref(false)
const showDeeplApiKey = ref(false)
const showBaiduSecretKey = ref(false)

// AI / LLM settings
const testingLLM = ref(false)
const llmTestResult = ref<'success' | 'failed' | null>(null)

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

const languageOptions = computed(() => [
  { label: '中文', value: 'zh' },
  { label: 'English', value: 'en' },
])

const themeOptions = computed(() => [
  { label: t('settings.light'), value: 'light' },
  { label: t('settings.dark'), value: 'dark' },
  { label: t('settings.system'), value: 'system' },
])

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------

const lastSyncDisplay = computed(() => {
  if (!settingsStore.lastSyncTime) return '--'
  return settingsStore.lastSyncTime.toLocaleString()
})

const appVersion = computed(() => {
  try {
    // Read from package.json version if available
    return '0.0.0'
  } catch {
    return '0.0.0'
  }
})

// ---------------------------------------------------------------------------
// Shortcuts
// ---------------------------------------------------------------------------

const shortcuts = computed(() => [
  { key: '/', description: t('search.placeholder') },
  { key: 'Escape', description: t('common.close') },
  { key: 'Ctrl+K', description: t('search.placeholder') },
  { key: 'Ctrl+/', description: t('settings.shortcutHelp') },
  { key: 'g h', description: t('nav.home') },
  { key: 'g s', description: t('nav.search') },
  { key: 'g l', description: t('nav.library') },
  { key: 'g t', description: t('nav.trends') },
  { key: 'g x', description: t('nav.settings') },
])

// ---------------------------------------------------------------------------
// AI / LLM Options
// ---------------------------------------------------------------------------

const llmProviderOptions = computed(() => [
  { label: t('ai.deepseek'), value: 'deepseek' },
  { label: t('ai.gemini'), value: 'gemini' },
  { label: t('ai.openai'), value: 'openai' },
  { label: t('ai.qwen'), value: 'qwen' },
  { label: t('ai.glm'), value: 'glm' },
  { label: t('ai.moonshot'), value: 'moonshot' },
  { label: t('ai.doubao'), value: 'doubao' },
  { label: t('ai.claude'), value: 'claude' },
  { label: t('ai.groq'), value: 'groq' },
  { label: t('ai.siliconflow'), value: 'siliconflow' },
])

const llmModelPlaceholder = computed(() => {
  const provider = settingsStore.llmProvider
  if (provider && provider in DEFAULT_MODELS) {
    return DEFAULT_MODELS[provider as LLMProvider]
  }
  return t('ai.defaultModel')
})

// ---------------------------------------------------------------------------
// Translation Options
// ---------------------------------------------------------------------------

const translationServiceOptions = computed(() => [
  { label: t('translation.ai'), value: 'ai' },
  { label: t('translation.mymemory'), value: 'mymemory' },
])

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

async function handleLanguageChange(value: string) {
  await settingsStore.setLocale(value as 'zh' | 'en')
  message.success(t('common.save'))
}

async function handleThemeChange(value: string) {
  await settingsStore.setTheme(value as 'light' | 'dark' | 'system')
}

async function saveOpenalexKey() {
  await settingsStore.setApiKey('openalex', settingsStore.openalexKey)
  message.success(t('common.save'))
}

async function saveS2Key() {
  await settingsStore.setApiKey('semanticScholar', settingsStore.semanticScholarKey)
  message.success(t('common.save'))
}

async function saveGistToken() {
  await settingsStore.setApiKey('gist' as any, settingsStore.gistToken)
  // Also save directly via db for the gist token
  const { setSetting } = await import('../db')
  await setSetting('gistToken', settingsStore.gistToken)
  message.success(t('common.save'))
}

async function handleSync() {
  if (!settingsStore.gistToken) {
    message.warning('Please enter GitHub Gist token first')
    return
  }
  syncing.value = true
  try {
    await settingsStore.syncToGist()
    message.success('Sync completed')
  } catch (e) {
    message.error('Sync failed: ' + (e as Error).message)
  } finally {
    syncing.value = false
  }
}

async function handleSyncFromGist() {
  if (!settingsStore.gistToken) {
    message.warning('Please enter GitHub Gist token first')
    return
  }
  syncing.value = true
  try {
    await settingsStore.syncFromGist()
    message.success('Data restored from Gist')
  } catch (e) {
    message.error('Restore failed: ' + (e as Error).message)
  } finally {
    syncing.value = false
  }
}

async function handleExport() {
  try {
    await settingsStore.exportData()
    message.success('Data exported')
  } catch (e) {
    message.error('Export failed: ' + (e as Error).message)
  }
}

async function handleImport(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  importing.value = true
  try {
    await settingsStore.importData(file)
    message.success('Data imported')
  } catch (e) {
    message.error('Import failed: ' + (e as Error).message)
  } finally {
    importing.value = false
    target.value = ''
  }
}

async function saveLLMConfig() {
  await settingsStore.setLLMConfig(
    settingsStore.llmProvider as LLMProvider | '',
    settingsStore.llmApiKey,
    settingsStore.llmModel || undefined,
  )
  message.success(t('common.save'))
}

async function testLLMConnection() {
  if (!settingsStore.llmProvider || !settingsStore.llmApiKey) {
    message.warning('Please configure provider and API key first')
    return
  }

  // Save first
  await saveLLMConfig()

  testingLLM.value = true
  llmTestResult.value = null

  try {
    const { testConnection } = await import('../api/llm')
    const ok = await testConnection({
      provider: settingsStore.llmProvider as LLMProvider,
      apiKey: settingsStore.llmApiKey,
      model: settingsStore.llmModel || undefined,
    })
    llmTestResult.value = ok ? 'success' : 'failed'
    message[ok ? 'success' : 'error'](ok ? t('ai.testSuccess') : t('ai.testFailed'))
  } catch {
    llmTestResult.value = 'failed'
    message.error(t('ai.testFailed'))
  } finally {
    testingLLM.value = false
  }
}

function handleClearData() {
  showClearConfirm.value = true
  clearConfirmText.value = ''
}

async function saveTranslationConfig() {
  await settingsStore.setTranslationConfig(
    settingsStore.translationService as TranslationService,
    {
      deeplApiKey: settingsStore.deeplApiKey,
      baiduAppId: settingsStore.baiduAppId,
      baiduSecretKey: settingsStore.baiduSecretKey,
    },
  )
  message.success(t('common.save'))
}

async function confirmClearData() {
  if (clearConfirmText.value !== 'DELETE') {
    message.warning('Please type DELETE to confirm')
    return
  }
  try {
    await settingsStore.clearAllData()
    showClearConfirm.value = false
    message.success('All data cleared')
  } catch (e) {
    message.error('Failed: ' + (e as Error).message)
  }
}

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

onMounted(() => {
  try {
    settingsStore.loadSettings()
  } catch (e) {
    console.warn('Failed to load settings:', e)
  }
})
</script>

<template>
  <div class="min-h-screen" style="background: var(--bg);">
    <div class="max-w-3xl mx-auto px-4 md:px-8 py-6">
      <h1 class="text-xl md:text-2xl font-bold mb-6" style="color: var(--text);">
        {{ t('settings.title') }}
      </h1>

      <div class="flex flex-col gap-6">
        <!-- ================================================================ -->
        <!-- 1. Appearance -->
        <!-- ================================================================ -->
        <NCard :title="t('settings.theme')">
          <NForm label-placement="left" label-width="100" :show-feedback="false">
            <NFormItem :label="t('settings.language')">
              <NSelect
                :value="settingsStore.locale"
                :options="languageOptions"
                style="width: 200px;"
                @update:value="handleLanguageChange"
              />
            </NFormItem>
            <NFormItem :label="t('settings.theme')" class="mt-4">
              <NSpace>
                <NButton
                  v-for="opt in themeOptions"
                  :key="opt.value"
                  :type="settingsStore.theme === opt.value ? 'primary' : 'default'"
                  size="small"
                  @click="handleThemeChange(opt.value)"
                >
                  <template #icon>
                    <NIcon>
                      <SunnyOutline v-if="opt.value === 'light'" />
                      <MoonOutline v-else-if="opt.value === 'dark'" />
                      <DesktopOutline v-else />
                    </NIcon>
                  </template>
                  {{ opt.label }}
                </NButton>
              </NSpace>
            </NFormItem>
          </NForm>
        </NCard>

        <!-- ================================================================ -->
        <!-- 2. API Keys -->
        <!-- ================================================================ -->
        <NCard :title="t('settings.apiKey')">
          <NAlert type="info" :show-icon="true" class="mb-4" closable>
            {{ t('settings.apiKeyHint') }}
          </NAlert>

          <NForm label-placement="top" :show-feedback="false">
            <NFormItem :label="t('settings.openalexKey')">
              <div class="flex items-center gap-2 w-full">
                <NInput
                  v-model:value="settingsStore.openalexKey"
                  :type="showOpenalexKey ? 'text' : 'password'"
                  :placeholder="'OpenAlex API Key'"
                  style="flex: 1;"
                />
                <NButton size="small" @click="showOpenalexKey = !showOpenalexKey">
                  {{ showOpenalexKey ? 'Hide' : 'Show' }}
                </NButton>
                <NButton size="small" type="primary" @click="saveOpenalexKey">{{ t('common.save') }}</NButton>
              </div>
              <div class="mt-1">
                <a
                  href="https://docs.openalex.org/how-to-use-the-api/get-an-api-key"
                  target="_blank"
                  class="text-xs hover:underline"
                  style="color: var(--primary);"
                >
                  <NIcon size="12" class="inline-block align-middle"><OpenOutline /></NIcon>
                  Get OpenAlex API Key
                </a>
              </div>
            </NFormItem>

            <NDivider style="margin: 12px 0;" />

            <NFormItem :label="t('settings.semanticScholarKey')">
              <div class="flex items-center gap-2 w-full">
                <NInput
                  v-model:value="settingsStore.semanticScholarKey"
                  :type="showS2Key ? 'text' : 'password'"
                  :placeholder="'Semantic Scholar API Key'"
                  style="flex: 1;"
                />
                <NButton size="small" @click="showS2Key = !showS2Key">
                  {{ showS2Key ? 'Hide' : 'Show' }}
                </NButton>
                <NButton size="small" type="primary" @click="saveS2Key">{{ t('common.save') }}</NButton>
              </div>
              <div class="mt-1">
                <a
                  href="https://www.semanticscholar.org/product/api#api-key"
                  target="_blank"
                  class="text-xs hover:underline"
                  style="color: var(--primary);"
                >
                  <NIcon size="12" class="inline-block align-middle"><OpenOutline /></NIcon>
                  Get Semantic Scholar API Key
                </a>
              </div>
            </NFormItem>
          </NForm>
        </NCard>

        <!-- ================================================================ -->
        <!-- 3. AI Summary -->
        <!-- ================================================================ -->
        <NCard :title="t('ai.title')">
          <template #header-extra>
            <NIcon :size="18" style="color: var(--primary);"><SparklesOutline /></NIcon>
          </template>

          <NForm label-placement="top" :show-feedback="false">
            <NFormItem :label="t('ai.provider')">
              <NSelect
                v-model:value="settingsStore.llmProvider"
                :options="llmProviderOptions"
                :placeholder="t('ai.provider')"
                style="width: 240px;"
                @update:value="() => { settingsStore.llmModel = ''; llmTestResult.value = null }"
              />
            </NFormItem>

            <NFormItem :label="t('ai.apiKey')" class="mt-4">
              <div class="flex items-center gap-2 w-full">
                <NInput
                  v-model:value="settingsStore.llmApiKey"
                  :type="showLLMApiKey ? 'text' : 'password'"
                  :placeholder="t('ai.apiKey')"
                  style="flex: 1;"
                  @update:value="() => llmTestResult.value = null"
                />
                <NButton size="small" @click="showLLMApiKey = !showLLMApiKey">
                  {{ showLLMApiKey ? 'Hide' : 'Show' }}
                </NButton>
              </div>
            </NFormItem>

            <NFormItem :label="t('ai.model')" class="mt-4">
              <div class="flex items-center gap-2 w-full">
                <NInput
                  v-model:value="settingsStore.llmModel"
                  :placeholder="llmModelPlaceholder"
                  style="flex: 1;"
                  clearable
                />
                <NTag size="small" :bordered="false" type="info">
                  {{ t('ai.defaultModel') }}
                </NTag>
              </div>
            </NFormItem>

            <!-- Provider hints -->
            <div class="mt-3 text-xs" style="color: var(--text-secondary);">
              <div v-if="settingsStore.llmProvider === 'deepseek'" class="flex items-center gap-1">
                <NIcon :size="14"><InformationCircleOutline /></NIcon>
                {{ t('ai.deepseekHint') }}
              </div>
              <div v-else-if="settingsStore.llmProvider === 'gemini'" class="flex items-center gap-1">
                <NIcon :size="14"><InformationCircleOutline /></NIcon>
                {{ t('ai.geminiHint') }}
              </div>
              <div v-else-if="settingsStore.llmProvider === 'openai'" class="flex items-center gap-1">
                <NIcon :size="14"><InformationCircleOutline /></NIcon>
                {{ t('ai.openaiHint') }}
              </div>
              <div v-else-if="settingsStore.llmProvider === 'qwen'" class="flex items-center gap-1">
                <NIcon :size="14"><InformationCircleOutline /></NIcon>
                {{ t('ai.qwenHint') }}
              </div>
              <div v-else-if="settingsStore.llmProvider === 'glm'" class="flex items-center gap-1">
                <NIcon :size="14"><InformationCircleOutline /></NIcon>
                {{ t('ai.glmHint') }}
              </div>
              <div v-else-if="settingsStore.llmProvider === 'moonshot'" class="flex items-center gap-1">
                <NIcon :size="14"><InformationCircleOutline /></NIcon>
                {{ t('ai.moonshotHint') }}
              </div>
              <div v-else-if="settingsStore.llmProvider === 'doubao'" class="flex items-center gap-1">
                <NIcon :size="14"><InformationCircleOutline /></NIcon>
                {{ t('ai.doubaoHint') }}
              </div>
              <div v-else-if="settingsStore.llmProvider === 'claude'" class="flex items-center gap-1">
                <NIcon :size="14"><InformationCircleOutline /></NIcon>
                {{ t('ai.claudeHint') }}
              </div>
              <div v-else-if="settingsStore.llmProvider === 'groq'" class="flex items-center gap-1">
                <NIcon :size="14"><InformationCircleOutline /></NIcon>
                {{ t('ai.groqHint') }}
              </div>
              <div v-else-if="settingsStore.llmProvider === 'siliconflow'" class="flex items-center gap-1">
                <NIcon :size="14"><InformationCircleOutline /></NIcon>
                {{ t('ai.siliconflowHint') }}
              </div>
            </div>

            <div class="flex items-center gap-3 mt-4">
              <NButton type="primary" @click="saveLLMConfig">{{ t('common.save') }}</NButton>
              <NButton :loading="testingLLM" @click="testLLMConnection">
                <template #icon>
                  <NIcon v-if="!testingLLM">
                    <CheckmarkCircleOutline v-if="llmTestResult === 'success'" />
                    <CloseCircleOutline v-else-if="llmTestResult === 'failed'" />
                    <SparklesOutline v-else />
                  </NIcon>
                </template>
                {{ t('ai.testConnection') }}
              </NButton>
            </div>
          </NForm>
        </NCard>

        <!-- ================================================================ -->
        <!-- 3.5 Translation Service -->
        <!-- ================================================================ -->
        <NCard :title="t('translation.title')">
          <NForm label-placement="top" :show-feedback="false">
            <NFormItem :label="t('translation.service')">
              <NSelect
                v-model:value="settingsStore.translationService"
                :options="translationServiceOptions"
                style="width: 280px;"
                @update:value="saveTranslationConfig"
              />
            </NFormItem>

            <!-- Translation service hints -->
            <div class="mt-2 text-xs" style="color: var(--text-secondary);">
              <div v-if="settingsStore.translationService === 'ai'" class="flex items-center gap-1">
                <NIcon :size="14"><InformationCircleOutline /></NIcon>
                {{ t('translation.aiHint') }}
              </div>
              <div v-else class="flex items-center gap-1">
                <NIcon :size="14"><InformationCircleOutline /></NIcon>
                {{ t('translation.mymemoryHint') }}
              </div>
            </div>
          </NForm>
        </NCard>

        <!-- ================================================================ -->
        <!-- 4. Data Sync -->
        <!-- ================================================================ -->
        <NCard :title="t('settings.sync')">
          <NForm label-placement="top" :show-feedback="false">
            <NFormItem :label="t('settings.gistToken')">
              <div class="flex items-center gap-2 w-full">
                <NInput
                  v-model:value="settingsStore.gistToken"
                  :type="showGistToken ? 'text' : 'password'"
                  :placeholder="'ghp_xxxxxxxxxxxx'"
                  style="flex: 1;"
                />
                <NButton size="small" @click="showGistToken = !showGistToken">
                  {{ showGistToken ? 'Hide' : 'Show' }}
                </NButton>
                <NButton size="small" type="primary" @click="saveGistToken">{{ t('common.save') }}</NButton>
              </div>
              <div class="mt-1">
                <a
                  href="https://github.com/settings/tokens/new?scopes=gist"
                  target="_blank"
                  class="text-xs hover:underline"
                  style="color: var(--primary);"
                >
                  <NIcon size="12" class="inline-block align-middle"><OpenOutline /></NIcon>
                  Create GitHub Token with gist scope
                </a>
              </div>
            </NFormItem>

            <div class="flex items-center gap-3 mt-4">
              <NButton :loading="syncing" @click="handleSync">
                <template #icon><NIcon><CloudUploadOutline /></NIcon></template>
                {{ t('settings.syncNow') }}
              </NButton>
              <NButton :loading="syncing" @click="handleSyncFromGist">
                <template #icon><NIcon><CloudDownloadOutline /></NIcon></template>
                Restore from Gist
              </NButton>
              <span class="text-xs" style="color: var(--text-secondary);">
                {{ t('settings.lastSync', { time: lastSyncDisplay }) }}
              </span>
            </div>
          </NForm>
        </NCard>

        <!-- ================================================================ -->
        <!-- 4. Data Management -->
        <!-- ================================================================ -->
        <NCard :title="t('settings.dataManagement')">
          <NSpace>
            <NButton @click="handleExport">
              <template #icon><NIcon><CloudDownloadOutline /></NIcon></template>
              {{ t('settings.exportData') }}
            </NButton>
            <NButton :loading="importing" @click="fileInput?.click()">
              <template #icon><NIcon><CloudUploadOutline /></NIcon></template>
              {{ t('settings.importData') }}
            </NButton>
            <input
              ref="fileInput"
              type="file"
              accept=".json"
              class="hidden"
              @change="handleImport"
            />
            <NButton type="error" @click="handleClearData">
              <template #icon><NIcon><TrashOutline /></NIcon></template>
              {{ t('settings.clearData') }}
            </NButton>
          </NSpace>
        </NCard>

        <!-- ================================================================ -->
        <!-- 5. Shortcuts -->
        <!-- ================================================================ -->
        <NCard :title="t('settings.shortcuts')">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div
              v-for="shortcut in shortcuts"
              :key="shortcut.key"
              class="flex items-center justify-between px-3 py-2 rounded"
              style="background: var(--bg-secondary);"
            >
              <span class="text-sm" style="color: var(--text);">{{ shortcut.description }}</span>
              <NTag size="small" :bordered="false" round>
                <kbd class="text-xs font-mono">{{ shortcut.key }}</kbd>
              </NTag>
            </div>
          </div>
        </NCard>

        <!-- ================================================================ -->
        <!-- 6. About -->
        <!-- ================================================================ -->
        <NCard :title="t('settings.about')">
          <NDescriptions label-placement="left" :column="1" :bordered="true" size="small">
            <NDescriptionsItem :label="t('settings.version')">
              <NTag size="small" :bordered="false">{{ appVersion }}</NTag>
            </NDescriptionsItem>
            <NDescriptionsItem label="Project">
              Scholar Search - Academic Paper Search & Management Tool
            </NDescriptionsItem>
            <NDescriptionsItem label="GitHub">
              <a
                href="https://github.com"
                target="_blank"
                class="flex items-center gap-1 text-sm hover:underline"
                style="color: var(--primary);"
              >
                <NIcon size="14"><LogoGithub /></NIcon>
                View on GitHub
              </a>
            </NDescriptionsItem>
          </NDescriptions>
        </NCard>
      </div>
    </div>

    <!-- Clear data confirmation modal -->
    <NModal v-model:show="showClearConfirm" preset="dialog" :title="t('settings.clearData')"
      type="warning"
      :positive-text="t('common.confirm')"
      :negative-text="t('common.cancel')"
      @positive-click="confirmClearData"
    >
      <div class="flex flex-col gap-3">
        <p>{{ t('settings.clearDataConfirm') }}</p>
        <NInput
          v-model:value="clearConfirmText"
          placeholder='Type "DELETE" to confirm'
        />
      </div>
    </NModal>
  </div>
</template>
