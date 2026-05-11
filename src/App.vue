<template>
  <div class="app">
   <PerfilComponent />
  </div>
</template>

<script setup>
import PerfilComponent from './components/PerfilComponent.vue';
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