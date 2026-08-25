<template>
  <div class="page">
   <FavoritosComponent />
  </div>
</template>

<script setup>
import FavoritosComponent from '@/components/FavoritosComponent.vue';
const API_URL = 'https://marujob.class.fabricadesoftware.ifc.edu.br'
</script>

<style scoped>
.page {
  max-width: 420px;
}
</style>

