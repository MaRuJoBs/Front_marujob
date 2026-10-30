<script setup>
import Footer from './components/Footer.vue'
import FooterEmpresa from './components/FooterEmpresaComponent.vue'
import { sessao } from './services/authService'
</script>

<template>
  <div class="app">
    <router-view />

    <template v-if="!$route.meta.hideFooter && sessao.usuario">
      <FooterEmpresa v-if="sessao.tipo === 'empresa'" />
      <Footer v-else />
    </template>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Poppins', sans-serif;
  background: #f3f0ff;
}

.app {
  max-width: 420px;
  margin: 0 auto;
}
</style>
