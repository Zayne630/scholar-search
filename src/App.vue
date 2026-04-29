<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from './stores/settings'
import {
  NConfigProvider,
  NMessageProvider,
  NDialogProvider,
  NIcon,
  NButton,
  NDrawer,
  NDrawerContent,
  darkTheme,
  type GlobalThemeOverrides,
} from 'naive-ui'
import {
  HomeOutline,
  SearchOutline,
  TrendingUpOutline,
  BookmarkOutline,
  SettingsOutline,
  LanguageOutline,
  MoonOutline,
  SunnyOutline,
  MenuOutline,
  SchoolOutline,
} from '@vicons/ionicons5'

const { t, locale } = useI18n()
const router = useRouter()
const route = useRoute()
const settingsStore = useSettingsStore()

const mobileMenuOpen = ref(false)
const windowWidth = ref(window.innerWidth)

// Theme
const isDark = computed(() => {
  const html = document.documentElement
  return html.getAttribute('data-theme') === 'dark'
})

const naiveTheme = computed(() => (isDark.value ? darkTheme : undefined))

const themeOverrides = computed<GlobalThemeOverrides>(() => ({
  common: {
    primaryColor: isDark.value ? '#818cf8' : '#4f46e5',
    primaryColorHover: isDark.value ? '#a5b4fc' : '#6366f1',
    primaryColorPressed: isDark.value ? '#6366f1' : '#3730a3',
  },
}))

// Navigation items
const navItems = computed(() => [
  { label: t('nav.home'), icon: HomeOutline, route: '/' },
  { label: t('nav.search'), icon: SearchOutline, route: '/search' },
  { label: t('nav.trends'), icon: TrendingUpOutline, route: '/trends' },
  { label: t('nav.library'), icon: BookmarkOutline, route: '/library' },
  { label: t('nav.settings'), icon: SettingsOutline, route: '/settings' },
])

const isActive = (path: string) => {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}

async function navigateTo(path: string) {
  mobileMenuOpen.value = false
  // Clean up any leftover drawer overlay elements
  document.querySelectorAll('.n-drawer-mask').forEach(el => {
    ;(el as HTMLElement).style.display = 'none'
  })
  await router.push(path)
}

function toggleLocale() {
  const newLocale = locale.value === 'zh' ? 'en' : 'zh'
  settingsStore.setLocale(newLocale as 'zh' | 'en')
}

function toggleTheme() {
  const current = settingsStore.theme
  if (current === 'light') {
    settingsStore.setTheme('dark')
  } else {
    settingsStore.setTheme('light')
  }
}

function handleResize() {
  windowWidth.value = window.innerWidth
  if (windowWidth.value >= 768) {
    mobileMenuOpen.value = false
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  settingsStore.loadSettings()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <NConfigProvider :theme="naiveTheme" :theme-overrides="themeOverrides">
    <NMessageProvider>
      <NDialogProvider>
      <div class="min-h-screen flex flex-col" style="background: var(--bg); color: var(--text);">
        <!-- Top Navigation Bar -->
        <header
          class="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-4 md:px-8 backdrop-blur-md"
          style="background: var(--bg); border-bottom: 1px solid var(--border);"
        >
          <!-- Logo -->
          <router-link
            to="/"
            class="flex items-center gap-2 mr-6 shrink-0 no-underline"
            style="color: var(--text);"
          >
            <NIcon size="26" color="var(--primary)">
              <SchoolOutline />
            </NIcon>
            <span class="text-lg font-bold tracking-tight" style="color: var(--primary);">
              ScholarSearch
            </span>
          </router-link>

          <!-- Desktop Navigation -->
          <nav class="hidden md:flex items-center gap-1 flex-1">
            <NButton
              v-for="item in navItems"
              :key="item.route"
              :type="isActive(item.route) ? 'primary' : 'default'"
              :tertiary="isActive(item.route)"
              size="small"
              @click="navigateTo(item.route)"
            >
              <template #icon>
                <NIcon><component :is="item.icon" /></NIcon>
              </template>
              {{ item.label }}
            </NButton>
          </nav>

          <!-- Right actions -->
          <div class="flex items-center gap-2 ml-auto">
            <!-- Language toggle -->
            <NButton size="small" quaternary @click="toggleLocale">
              <template #icon>
                <NIcon><LanguageOutline /></NIcon>
              </template>
              {{ locale === 'zh' ? 'EN' : '中' }}
            </NButton>

            <!-- Theme toggle -->
            <NButton size="small" quaternary @click="toggleTheme">
              <template #icon>
                <NIcon>
                  <SunnyOutline v-if="isDark" />
                  <MoonOutline v-else />
                </NIcon>
              </template>
            </NButton>

            <!-- Mobile hamburger -->
            <NButton size="small" quaternary class="md:hidden" @click="mobileMenuOpen = true">
              <template #icon>
                <NIcon size="22"><MenuOutline /></NIcon>
              </template>
            </NButton>
          </div>
        </header>

        <!-- Mobile Drawer -->
        <NDrawer v-model:show="mobileMenuOpen" placement="left" :width="260">
          <NDrawerContent :title="'ScholarSearch'" style="background: var(--bg);">
            <div class="flex flex-col gap-2">
              <NButton
                v-for="item in navItems"
                :key="item.route"
                :type="isActive(item.route) ? 'primary' : 'default'"
                size="large"
                block
                @click="navigateTo(item.route)"
              >
                <template #icon>
                  <NIcon><component :is="item.icon" /></NIcon>
                </template>
                {{ item.label }}
              </NButton>
            </div>
          </NDrawerContent>
        </NDrawer>

        <!-- Main content -->
        <main class="flex-1 pt-14">
          <router-view />
        </main>
      </div>
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>
