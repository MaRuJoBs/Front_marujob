// src/router/index.js

import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import PerfilView from '../views/PerfilView.vue'
import FreelancesView from '../views/FreelancesView.vue'
import MensagensView from '../views/MensagensView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },

    {
      path: '/freelances',
      name: 'freelances',
      component: FreelancesView,
    },

    {
      path: '/mensagens',
      name: 'mensagens',
      component: MensagensView,
    },

    {
      path: '/perfil',
      name: 'perfil',
      component: PerfilView,
    },
  ],
})

export default router