<script setup>
import { RouterLink } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faPlugCircleXmark } from '@fortawesome/free-solid-svg-icons'

// Faixa de conexão do chat: 'offline' (reconectando) ou 'unauthorized' (sessão expirada).
defineProps({
  state: { type: String, default: null },
})

const emit = defineEmits(['retry'])
</script>

<template>
  <p v-if="state === 'offline'" class="banner" role="status">
    <FontAwesomeIcon :icon="faPlugCircleXmark" aria-hidden="true" />
    Reconectando...
    <button type="button" @click="emit('retry')">Tentar agora</button>
  </p>
  <p v-else-if="state === 'unauthorized'" class="banner banner--error" role="alert">
    Sua sessão expirou.
    <RouterLink to="/">Entrar novamente</RouterLink>
  </p>
</template>

<style scoped>
.banner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 0;
  padding: 0.375rem 1rem;
  color: var(--mrj-color-text);
  font-size: 0.875rem;
  background-color: var(--mrj-color-secondary);
}

.banner--error {
  color: var(--mrj-color-danger);
  background-color: #fff0f0;
}

.banner button,
.banner a {
  padding: 0;
  color: inherit;
  font-weight: 600;
  text-decoration: underline;
  border: none;
  background: none;
  cursor: pointer;
}
</style>
