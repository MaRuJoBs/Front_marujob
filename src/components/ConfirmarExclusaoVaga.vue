<script setup>
import { nextTick, ref, watch, onBeforeUnmount } from 'vue'
import { storeToRefs } from 'pinia'
import { useGerenciamentoVagas } from '@/stores/gerenciamentoVagas'
import { capturarEmpresa } from '@/services/freelanceService'

const emit = defineEmits(['excluida'])
const store = useGerenciamentoVagas()
const { selecionada, excluindo, erroExclusao } = storeToRefs(store)
const dialogo = ref(null)
let focoAnterior
let ativa = true
watch(
  selecionada,
  async (vaga) => {
    if (vaga) {
      focoAnterior = document.activeElement
      await nextTick()
      if (!ativa || !selecionada.value) return
      dialogo.value?.showModal()
      dialogo.value?.querySelector('button')?.focus()
    } else {
      if (!focoAnterior) return
      dialogo.value?.close()
      await nextTick()
      if (!ativa) return
      if (focoAnterior?.isConnected) focoAnterior.focus()
      else document.querySelector('main h1, .section h3')?.focus()
    }
  },
  { immediate: true },
)
onBeforeUnmount(() => {
  ativa = false
  store.cancelarExclusao()
})
async function confirmar() {
  if (excluindo.value || !selecionada.value) return
  const conta = capturarEmpresa()
  await store.confirmarExclusao()
  if (ativa && conta.atual() && !selecionada.value && !erroExclusao.value) emit('excluida')
}
</script>

<template>
  <dialog
    class="mrj-ui"
    ref="dialogo"
    aria-labelledby="excluir-titulo"
    aria-describedby="excluir-descricao"
    @cancel.prevent="store.cancelarExclusao()"
  >
    <h3 id="excluir-titulo">Excluir oportunidade</h3>
    <p id="excluir-descricao">
      Tem certeza de que deseja excluir a oportunidade “{{ selecionada?.titulo }}”? Esta ação não
      poderá ser desfeita. Candidaturas vinculadas poderão ser removidas permanentemente.
    </p>
    <p v-if="erroExclusao" role="alert">{{ erroExclusao }}</p>
    <div class="acoes-vaga">
      <button type="button" :disabled="excluindo" @click="store.cancelarExclusao()">
        Cancelar
      </button>
      <button type="button" :disabled="excluindo" @click="confirmar">
        {{ excluindo ? 'Excluindo...' : 'Confirmar exclusão' }}
      </button>
    </div>
    <p v-if="excluindo" role="status">Aguarde a confirmação do servidor.</p>
  </dialog>
</template>

<style scoped>
dialog {
  margin: auto;
  width: min(480px, calc(100% - 32px));
  max-height: calc(100dvh - 32px);
  overflow: auto;
  padding: var(--mrj-space-6);
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: var(--mrj-radius-lg);
  background: var(--mrj-color-surface);
  color: var(--mrj-color-text-secondary);
  overflow-wrap: anywhere;
  font-family: var(--mrj-font-family);
  line-height: var(--mrj-line-height);
  box-shadow: var(--mrj-shadow-card);
}
h3 {
  font-weight: var(--mrj-font-weight-semibold);
  color: var(--mrj-color-text);
  font-size: 18px;
}
p {
  margin-top: var(--mrj-space-4);
  font-size: var(--mrj-font-size-sm);
  line-height: 1.6;
}
dialog::backdrop {
  background: #20103599;
}
.acoes-vaga {
  display: flex;
  flex-wrap: wrap;
  gap: var(--mrj-space-2);
  margin-top: var(--mrj-space-6);
}
button {
  min-height: 44px;
  padding: 9px 14px;
  border: 1px solid var(--mrj-color-border);
  border-radius: var(--mrj-radius-md);
  background: var(--mrj-color-surface);
  color: var(--mrj-color-text-secondary);
  font: inherit;
  font-size: var(--mrj-font-size-sm);
  cursor: pointer;
}
button:last-child {
  background: var(--mrj-color-primary);
  border-color: var(--mrj-color-primary);
  color: var(--mrj-color-on-primary);
}
button:disabled {
  opacity: var(--mrj-disabled-opacity);
  cursor: wait;
}
button:focus-visible {
  outline: var(--mrj-focus-width) solid var(--mrj-color-focus);
  outline-offset: var(--mrj-focus-offset);
}
button {
  flex: 1 1 120px;
  max-width: 100%;
  overflow-wrap: anywhere;
}
[role='alert'] {
  color: var(--mrj-color-danger);
}
button:hover:not(:disabled) {
  filter: brightness(0.95);
}
</style>
