<script setup>
import AvisosChat from '@/components/AvisosChat.vue'
</script>

<template>
  <main class="central-freelancer mrj-ui">
    <h1>Notificações</h1>
    <AvisosChat />
  </main>
</template>

<style scoped>
.central-freelancer {
  padding: 16px;
  color: var(--mrj-color-text);
  background: var(--mrj-color-secondary);
}
.central-freelancer h1 {
  font-size: 21px;
  font-weight: 750;
}
</style>
