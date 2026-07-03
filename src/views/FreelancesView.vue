<template>
  <div class="page">
   <OportunidadeComponent />
  </div>
</template>

<script setup>
import OportunidadeComponent from '@/components/OportunidadeComponent.vue';
const API_URL = 'https://marujob.class.fabricadesoftware.ifc.edu.br'</script>

<style scoped>
.page {
  max-width: 420px;
}
</style>