import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import PerfilView from '../views/PerfilView.vue'
import FreelancesView from '../views/FreelancesView.vue'
import MensagensView from '../views/MensagensView.vue'

import FavoritosView from '../views/Favoritos.View.vue'
import RegisterComponent from '@/components/RegisterComponent.vue'
import LoginView from '@/views/LoginView.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
      meta: { hideFooter: true }
    },
    //problema aqui
    {
      path: '/home',
      name: 'home',
      component: HomeView,
    },

    {
      path: '/register',
      name: 'register',
      component: RegisterComponent,
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

    {
      path: '/favoritos',
      name: 'favoritos',
      component: FavoritosView,
    },
  ],
})

export default router