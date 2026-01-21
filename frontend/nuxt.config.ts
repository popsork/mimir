// https://nuxt.com/docs/api/configuration/nuxt-config
const apiBase = process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:42100';

export default defineNuxtConfig({
  ssr: false,
  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@nuxt/ui',
    'nuxt-charts'
  ],

  devtools: {
    enabled: false
  },

  typescript: {
    shim: false,
    strict: true,
    typeCheck: true
  },

  css: ['~/assets/css/main.css'],

  imports: {
    dirs: [
      'app/constants',
      'app/enums',
      'app/composables',
      'app/stores',
      'app/utils',
      'app/types'
    ]
  },

  nitro: {
    devProxy: {
      '/api': {
        target: apiBase,
        changeOrigin: true
      }
    }
  },

  compatibilityDate: '2025-01-15',

  vite: {
    server: {
      proxy: {
        '/api': {
          target: apiBase,
          changeOrigin: true
        }
      }
    },
    build: {
      sourcemap: true
    }
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
