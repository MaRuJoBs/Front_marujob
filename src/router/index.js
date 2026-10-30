import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes.js'
import { instalarProtecao } from './authGuard.js'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

instalarProtecao(router)

export default router
