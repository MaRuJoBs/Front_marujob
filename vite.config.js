import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  server: {
    headers: { 'Cross-Origin-Opener-Policy': 'same-origin-allow-popups' },
  },
  preview: {
    headers: { 'Cross-Origin-Opener-Policy': 'same-origin-allow-popups' },
  },
  plugins: [
    vue(),
    vueDevTools(),

    VitePWA({
      registerType: 'autoUpdate',

      devOptions: {
        enabled: false,
      },

      // O manifesto estático também precisa existir no servidor de desenvolvimento.
      manifest: false,

      workbox: {
        cleanupOutdatedCaches: true,

        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webmanifest}'],
      },
    }),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
