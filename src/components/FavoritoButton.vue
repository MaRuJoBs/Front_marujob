<script setup>
import { useFavoritosStore } from '@/stores/favoritos'

defineProps({ id: { type: [Number, String], required: true } })
const store = useFavoritosStore()
</script>

<template>
  <button
    type="button"
    class="favorito"
    :class="{ ativo: store.ehFavorito(id) }"
    :aria-label="store.ehFavorito(id) ? 'Remover dos favoritos' : 'Salvar nos favoritos'"
    :aria-pressed="store.ehFavorito(id)"
    @click.stop.prevent="store.toggleFavorito(id)"
  >
    <i
      :class="store.ehFavorito(id) ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"
      aria-hidden="true"
    ></i>
  </button>
</template>

<style scoped>
.favorito {
  display: inline-grid;
  place-items: center;
  flex: 0 0 44px;
  width: 44px;
  min-height: 44px;
  border: 0;
  border-radius: 50%;
  padding: 0;
  background: transparent;
  color: #796197;
  font-size: 20px;
  cursor: pointer;
}
.favorito.ativo {
  color: #673fd7;
}
/* O reset global define font-weight em ::before; o glifo deve herdar o estilo FontAwesome. */
.favorito i::before {
  font-weight: inherit;
}
.favorito:hover {
  background: #673fd714;
}
.favorito:focus-visible {
  outline: 2px solid #673fd7;
  outline-offset: 2px;
}
</style>
