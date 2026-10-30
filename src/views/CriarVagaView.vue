<script setup>
import CriarVagaComponent from '@/components/CriarVagaComponent.vue'
import { useChaveFormularioVaga } from '@/composables/useChaveFormularioVaga'
import { sessao } from '@/services/authSession'

const chaveFormulario = useChaveFormularioVaga()
</script>

<template>
  <CriarVagaComponent v-if="sessao.tipo === 'empresa' && sessao.usuario" :key="chaveFormulario" />
  <p v-else role="status">Validando sessão...</p>
</template>
