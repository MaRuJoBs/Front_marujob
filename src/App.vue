<template>
  <div class="app">
    <OportunidadeComponent />
  </div>
</template>

<script setup>
import OportunidadeComponent from './components/OportunidadeComponent.vue';
</script>

<style>
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