<script setup>
import { ref, onMounted, onBeforeUnmount, onUnmounted, nextTick } from 'vue'
defineProps({ titulo: String, excluindo: Boolean, erro: String })
const emit = defineEmits(['cancelar', 'confirmar'])
const dialogo = ref(null)
let anterior
let pagina
onMounted(() => {
  anterior = document.activeElement
  pagina = dialogo.value.closest('main')
  dialogo.value.showModal()
  dialogo.value.querySelector('button')?.focus()
})
onBeforeUnmount(() => {
  dialogo.value?.close()
})
onUnmounted(async () => {
  await nextTick()
  if (anterior?.isConnected) anterior.focus()
  else if (pagina?.isConnected) {
    const destino = pagina.querySelector('[role="status"]') || pagina
    destino.setAttribute('tabindex', '-1')
    destino.focus()
  }
})
</script>
<template>
  <dialog
    ref="dialogo"
    :aria-busy="excluindo"
    aria-labelledby="excluir-titulo"
    aria-describedby="excluir-descricao"
    @cancel.prevent="!excluindo && emit('cancelar')"
  >
    <h3 id="excluir-titulo">Excluir {{ titulo }}?</h3>
    <p id="excluir-descricao">Essa ação não poderá ser desfeita.</p>
    <p v-if="erro" role="alert">{{ erro }}</p>
    <p v-if="excluindo" role="status">Excluindo...</p>
    <div class="acoes">
      <button :disabled="excluindo" @click="emit('cancelar')">Cancelar</button>
      <button :disabled="excluindo" @click="emit('confirmar')">Excluir</button>
    </div>
  </dialog>
</template>
<style scoped>
dialog {
  margin: auto;
  width: min(360px, calc(100% - 32px));
  box-sizing: border-box;
  max-height: 90dvh;
  overflow: auto;
  overflow-wrap: anywhere;
  padding: 24px;
  border: 0;
  border-radius: 22px;
  background: #f7f5fc;
  color: #4b338d;
}
dialog::backdrop {
  background: #0008;
}
p {
  margin: 16px 0;
}
.acoes {
  display: flex;
  gap: 12px;
}
button {
  flex: 1;
  min-height: 44px;
  border: 0;
  border-radius: 12px;
  background: #e8e1f2;
  color: #4b338d;
}
button:last-child {
  background: #c43535;
  color: white;
}
button:disabled {
  opacity: 0.6;
}
button:focus-visible {
  outline: 3px solid #7a3ff2;
  outline-offset: 3px;
}
</style>
