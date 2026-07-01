<template>
  <div class="page">
   <FavoritosComponent />
  </div>
</template>

<script setup>
import FavoritosComponent from '@/components/FavoritosComponent.vue';
const API_URL = import.meta.env.VITE_API_URL

</script>

<style scoped>
.page {
  max-width: 420px;
}
</style>

