<script setup>
import Footer from './components/Footer.vue'
import FooterEmpresa from './components/FooterEmpresaComponent.vue'
import { sessao } from './services/authService'
import './styles/tokens.css'
import './styles/shell.css'

// Estas páginas já reservam espaço para a navegação inferior.
// Mantém a reserva local sem somar novamente a altura inteira do footer.
const paginasComReserva = new Set([
  'home',
  'homeEmpresa',
  'freelances',
  'oportunidade',
  'favoritos',
  'perfil',
  'portfolio',
  'detalhe-vaga-empresa',
  'perfil-empresa',
  'configuracoes-empresa',
  'notificacoes-empresa',
])
</script>

<template>
  <div
    class="app"
    :class="{
      'app--navigation': !$route.meta.hideFooter && sessao.usuario,
      'app--empresa': sessao.tipo === 'empresa',
      'app--page-reserve': paginasComReserva.has($route.name),
      'app--favorites': $route.name === 'favoritos',
      'app--wide': $route.meta.layout === 'wide',
    }"
  >
    <div class="app-content">
      <router-view />
    </div>

    <template v-if="!$route.meta.hideFooter && sessao.usuario">
      <FooterEmpresa v-if="sessao.tipo === 'empresa'" />
      <Footer v-else />
    </template>
  </div>
</template>
