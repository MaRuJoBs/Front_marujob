<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faComments } from '@fortawesome/free-solid-svg-icons'
import { apiErrorMessage } from '../lib/errors'
import { useChatToast } from '../composables/useChatToast'
import { useChatStore } from '../stores/chat'

// "Conversar" de uma candidatura (lado do freelancer e da empresa): abre — ou reabre — a conversa
// com a outra parte e leva à tela de mensagens com o cartão da vaga pronto para ir na próxima mensagem.
const { candidatura, disabled = false } = defineProps({
  candidatura: { type: [Number, String], required: true },
  disabled: { type: Boolean, default: false },
})

const router = useRouter()
const chat = useChatStore()
const toast = useChatToast()
const abrindo = ref(false)

async function conversar() {
  if (abrindo.value) return

  abrindo.value = true

  try {
    const room = await chat.contactCandidatura(Number(candidatura))

    await router.push({ name: 'mensagens', query: { room: String(room.id) } })
  } catch (error) {
    toast.error(apiErrorMessage(error, 'Não foi possível abrir a conversa.'))
  } finally {
    abrindo.value = false
  }
}
</script>

<template>
  <button
    type="button"
    class="conversar"
    :disabled="disabled || abrindo"
    :aria-busy="abrindo"
    @click="conversar"
  >
    <FontAwesomeIcon :icon="faComments" aria-hidden="true" />
    {{ abrindo ? 'Abrindo conversa...' : 'Conversar' }}
  </button>
</template>
