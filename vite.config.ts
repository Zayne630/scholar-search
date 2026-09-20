import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    // 注意：不要引入 @intlify/unplugin-vue-i18n。
    // 本项目仅在 i18n.ts 中静态 import JSON，无 SFC <i18n> 块，
    // 该插件在 Vite 8 (rolldown) 下会产生 chunk 循环依赖，导致
    // 生产构建产物运行时报 "TypeError: xx is not a function" 白屏。
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // vue-i18n 无插件集成时需要显式提供这些编译常量
  // （否则运行时报 __VUE_I18N_LEGACY_API__ is not defined）
  define: {
    __VUE_I18N_LEGACY_API__: false,
    __VUE_I18N_FULL_INSTALL__: true,
    __INTLIFY_PROD_DEVTOOLS__: false,
    __INTLIFY_DROP_MESSAGE_COMPILER__: false,
  },
  base: '/scholar-search/',
})
