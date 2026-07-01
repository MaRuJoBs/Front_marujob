<template>
  <div class="page">
   <OportunidadeComponent />
  </div>
</template>

<script setup>
import OportunidadeComponent from '@/components/OportunidadeComponent.vue';
const API_URL = import.meta.env.VITE_API_URL
</script>

<style scoped>
.page {
  max-width: 420px;
}
</style>