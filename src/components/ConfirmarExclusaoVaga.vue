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
  padding: 24px;
  border: 1px solid #d8c4ed;
  border-radius: 18px;
  background: #faf7fe;
  color: #493260;
  overflow-wrap: anywhere;
}
h3 {
  color: #4e2b7c;
  font-size: 18px;
}
p {
  margin-top: 16px;
  font-size: 14px;
  line-height: 1.6;
}
dialog::backdrop {
  background: #20103599;
}
.acoes-vaga {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
button {
  min-height: 44px;
  padding: 9px 14px;
  border: 1px solid #9a73ca;
  border-radius: 9px;
  background: #faf7fe;
  color: #5a348c;
  font: inherit;
  font-size: 13px;
  cursor: pointer;
}
button:last-child {
  background: #7548bd;
  border-color: #7548bd;
  color: white;
}
button:disabled {
  opacity: 0.65;
  cursor: wait;
}
button:focus-visible {
  outline: 3px solid #63369e;
  outline-offset: 3px;
}
</style>
