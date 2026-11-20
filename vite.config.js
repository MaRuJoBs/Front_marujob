import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { VitePWA } from 'vite-plugin-pwa'

// Backend local para o proxy do `npm run dev` (só é usado quando VITE_API_URL é relativa, ex.: /api/).
const backendDev = process.env.VITE_DEV_BACKEND || 'http://127.0.0.1:8000'

export default defineConfig({
  server: {
    headers: { 'Cross-Origin-Opener-Policy': 'same-origin-allow-popups' },
    proxy: {
      '/api': { target: backendDev, changeOrigin: true },
      '/media': { target: backendDev, changeOrigin: true },
      // WebSocket do chat. Sem changeOrigin: o backend valida a origem real do front (CORS).
      '/ws': { target: backendDev, ws: true },
    },
  },
  preview: {
    headers: { 'Cross-Origin-Opener-Policy': 'same-origin-allow-popups' },
  },
  plugins: [
    vue(),
    // O botão flutuante encobre a navegação e o campo de mensagem em telas pequenas.
    process.env.VITE_VUE_DEVTOOLS === 'true' && vueDevTools(),

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
