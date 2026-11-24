<script setup>
import { computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faBuilding } from '@fortawesome/free-solid-svg-icons'
import PerfilAvatar from './PerfilAvatar.vue'
import api from '../services/api.js'
import { identidadeEmpresaVaga } from '../utils/identidadeEmpresaVaga.js'

const props = defineProps({
  vaga: { type: Object, required: true },
  perfil: { type: Object, default: null },
})
const identidade = computed(() =>
  identidadeEmpresaVaga(props.vaga, props.perfil, api.defaults.baseURL),
)
</script>

<template>
  <span class="empresa-vaga">
    <PerfilAvatar class="empresa-vaga-logo" :usuario="identidade">
      <FontAwesomeIcon :icon="faBuilding" aria-hidden="true" />
    </PerfilAvatar>
    <span v-if="identidade.name">{{ identidade.name }}</span>
  </span>
</template>

<style scoped>
.empresa-vaga {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  color: #544568;
  font-size: 0.8125rem;
  overflow-wrap: anywhere;
}
.empresa-vaga-logo {
  box-sizing: border-box;
  flex: 0 0 auto;
  width: 40px;
  height: 40px;
  padding: 4px;
  border: 1px solid #e8def4;
  border-radius: 12px;
  background: #f6f0fc;
  color: #673fd7;
  object-fit: contain;
}
</style>
