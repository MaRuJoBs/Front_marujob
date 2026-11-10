<script setup>
import Footer from './components/Footer.vue'
import FooterEmpresa from './components/FooterEmpresaComponent.vue'
import { sessao } from './services/authService'
import './styles/tokens.css'
import './styles/shell.css'
</script>

<template>
  <div class="app mrj-ui" :class="{ 'app--navigation': !$route.meta.hideFooter && sessao.usuario }">
    <div class="app-content">
      <router-view />
    </div>

    <template v-if="!$route.meta.hideFooter && sessao.usuario">
      <FooterEmpresa v-if="sessao.tipo === 'empresa'" />
      <Footer v-else />
    </template>
  </div>
</template>
