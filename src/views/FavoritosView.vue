<template>
  <div class="page">
   <FavoritosComponent />
  </div>
</template>

<script setup>
import FavoritosComponent from '@/components/FavoritosComponent.vue';
</script>

<style scoped>
.page {
  max-width: 420px;
}
/* F61: limite de 420px só no mobile; no layout wide o grid usa a largura do shell. */
@media (min-width: 48rem) {
  .page {
    max-width: none;
  }
}
</style>

