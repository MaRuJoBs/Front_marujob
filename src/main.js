import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { limparPwaDesenvolvimento } from './utils/devServiceWorker'

import { library } from '@fortawesome/fontawesome-svg-core'

import {
  faHouse,
  faBriefcase,
  faMessage,
  faUser,
  faHeart,
  faTrash,
  faEnvelope,
  faLock,
  faShieldHalved,
  faPlus,
  faMagnifyingGlass,
  faSliders,
  faLocationDot,
  faArrowLeft,
  faImage,
  faCamera,
  faPen,
  faPhone,
} from '@fortawesome/free-solid-svg-icons'

import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import '@fortawesome/fontawesome-free/css/all.min.css'

async function iniciarApp() {
  if (import.meta.env.DEV && (await limparPwaDesenvolvimento())) return
  const app = createApp(App)

  app.use(createPinia())
  app.use(router)

  library.add(
    faHouse,
    faBriefcase,
    faMessage,
    faUser,
    faHeart,
    faTrash,
    faEnvelope,
    faLock,
    faShieldHalved,
    faPlus,
    faMagnifyingGlass,
    faSliders,
    faLocationDot,
    faArrowLeft,
    faImage,
    faCamera,
    faPen,
    faPhone,
  )

  app.component('FontAwesomeIcon', FontAwesomeIcon)

  app.mount('#app')
}

iniciarApp()
