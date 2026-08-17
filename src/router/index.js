import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'
import PerfilView from '../views/PerfilView.vue'
import FreelancesView from '../views/FreelancesView.vue'
import MensagensView from '../views/MensagensView.vue'

import FavoritosView from '../views/FavoritosView.vue'
import RegisterComponent from '@/components/RegisterComponent.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterEmpComponent from '@/components/RegisterEmpComponent.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'login',
      component: LoginView,
      meta: { hideFooter: true }
    },

    {
      path: '/home',
      name: 'home',
      component: HomeView,
    },

    {
      path: '/register',
      name: 'register',
      component: RegisterComponent,
      meta: { hideFooter: true }
    },
    {
      path: '/registerEmpresa',
      name: 'registerEmpresa',
      component: RegisterEmpComponent,
      meta: { hideFooter: true }
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
    {
    path: '/oportunidade/:id',
    name: 'oportunidade',
    component: () => import('../components/OportunidadeDetalheComponent.vue')
    },
    {
  path: '/portfolio',
  name: 'portfolio',
  component: () => import('@/views/PortfolioView.vue')
    },
    {
  path: '/portfolio/adicionar',
  name: 'portfolioAdicionar',
  component: () => import('@/views/PortfolioAdicionarView.vue')
    },
    {
  path: '/portfolio/:id',
  name: 'portfolioDetalhe',
  component: () => import('@/views/PortfolioDetalheView.vue')
    },
    
  ],
})

export default router