import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'

import { registerSW } from 'virtual:pwa-register'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')

registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('🆕 Nova versão disponível do app')
  },
  onOfflineReady() {
    console.log('📦 App pronto para uso offline')
  }
})