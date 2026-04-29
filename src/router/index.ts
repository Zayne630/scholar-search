import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/pages/HomePage.vue')
    },
    {
      path: '/search',
      name: 'search',
      component: () => import('@/pages/SearchPage.vue')
    },
    {
      path: '/paper/:id',
      name: 'paper',
      component: () => import('@/pages/PaperDetailPage.vue')
    },
    {
      path: '/field/:slug',
      name: 'field',
      component: () => import('@/pages/FieldDetailPage.vue')
    },
    {
      path: '/trends',
      name: 'trends',
      component: () => import('@/pages/TrendPage.vue')
    },
    {
      path: '/library',
      name: 'library',
      component: () => import('@/pages/LibraryPage.vue')
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/pages/SettingsPage.vue')
    }
  ],
  scrollBehavior() {
    return { top: 0 }
  }
})

export default router
