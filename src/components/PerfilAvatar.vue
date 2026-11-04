<script setup>
import { computed, ref, watch } from 'vue'
import { resolverImagem } from '@/utils/imagens'
import { obterFotoGoogle } from '@/services/fotoGoogle'

const props = defineProps({ usuario: { type: Object, default: null } })
const falhas = ref([])
const candidatos = computed(() => [
  ...new Set(
    [resolverImagem(props.usuario?.profile_image), obterFotoGoogle(props.usuario?.id)].filter(
      Boolean,
    ),
  ),
])
watch(candidatos, () => {
  falhas.value = []
})
const foto = computed(() => candidatos.value.find((url) => !falhas.value.includes(url)))
</script>

<template>
  <img
    v-if="foto"
    :key="foto"
    :src="foto"
    alt="Foto de perfil"
    referrerpolicy="no-referrer"
    @error="falhas.push($event.currentTarget.src)"
  />
  <span v-else role="img" aria-label="Foto de perfil indisponível"><slot /></span>
</template>

<style scoped>
img {
  object-fit: cover;
}
span {
  display: inline-grid;
  place-items: center;
}
</style>
