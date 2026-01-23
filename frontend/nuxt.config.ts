import { SiteLocale } from "./app/enums/SiteLocale";

// https://nuxt.com/docs/api/configuration/nuxt-config
const apiBase = process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:42100';

export default defineNuxtConfig({
  ssr: false,
  future: {
    compatibilityVersion: 4
  },
  modules: [
    '@nuxt/eslint',
    '@pinia/nuxt',
    '@nuxt/ui',
    'nuxt-charts',
    [
      "@nuxtjs/i18n",
      {
        locales: Object.values(SiteLocale).map((locale) => {
          return {
            code: locale,
            file: `${locale}.json`
          };
        }),
        langDir: "../i18n/locales",
        detectBrowserLanguage: false,
        defaultLocale: SiteLocale.En,
        customRoutes: "page",
        strategy: "no_prefix"
      }
    ]
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
