<template>
  <div class="app">

    <router-view />

    <Footer v-if="!$route.meta.hideFooter" />


  </div>
</template>

<script setup>
import Footer from './components/Footer.vue'

</script>

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