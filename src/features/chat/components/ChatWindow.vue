<script setup>
import { computed, ref, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faChevronLeft, faEllipsisVertical } from '@fortawesome/free-solid-svg-icons'
import { conversationStatus, isOnline } from '../lib/roomList'
import ChatAvatar from './ChatAvatar.vue'
import ChatVagaCard from './ChatVagaCard.vue'
import MessageComposer from './MessageComposer.vue'
import MessageList from './MessageList.vue'

const { room, messages, meId, presence, typing, disabled, maxFileMb } = defineProps({
  room: { type: Object, required: true },
  // { items, hasMore, loaded } ou null enquanto não há histórico.
  messages: { type: Object, default: null },
  meId: { type: Number, default: null },
  // Membros da sala e presença ao vivo (tiques de entrega e contador de online).
  members: { type: Array, default: () => [] },
  presence: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
  loadingOlder: { type: Boolean, default: false },
  error: { type: String, default: '' },
  typing: { type: Array, default: () => [] },
  disabled: { type: Boolean, default: false },
  maxFileMb: { type: Number, default: 10 },
})

const emit = defineEmits([
  'back',
  'info',
  'load-older',
  'send',
  'send-file',
  'edit',
  'delete',
  'typing',
  'dismiss-context',
])

const replyTo = ref(null)
const editing = ref(null)

// Trocar de sala descarta resposta/edição pendentes.
watch(
  () => room.id,
  () => {
    replyTo.value = null
    editing.value = null
  },
)

// Linha de baixo do cabeçalho: "digitando..." enquanto a outra pessoa digita; senão a profissão
// ("@Web-Developer"); sem profissão, "online" ou "visto por último às HH:MM".
const online = computed(() => isOnline(room, presence))
const status = computed(() => conversationStatus(room, { presence, typing: typing.length > 0 }))
const subtitle = computed(() => status.value.text)

function startReply(message) {
  editing.value = null
  replyTo.value = message
}

function startEdit(message) {
  replyTo.value = null
  editing.value = message
}

function confirmDelete(message) {
  if (window.confirm('Apagar esta mensagem para todos?')) emit('delete', message.id)
}

function cancelContext() {
  replyTo.value = null
  editing.value = null
}

function onSend(payload) {
  emit('send', payload)
  replyTo.value = null
}

function onSendFile(payload) {
  emit('send-file', payload)
  replyTo.value = null
}

function onEdit(payload) {
  emit('edit', payload)
  editing.value = null
}
</script>

<template>
  <section class="window" :aria-label="`Conversa com ${room.name}`">
    <header class="window__header">
      <button
        type="button"
        class="window__back"
        aria-label="Voltar às conversas"
        @click="emit('back')"
      >
        <FontAwesomeIcon :icon="faChevronLeft" :style="{ fontSize: '18px' }" aria-hidden="true" />
      </button>
      <ChatAvatar
        :key="`avatar-${room.id}`"
        class="window__swap"
        :name="room.name"
        :src="room.image"
        :size="40"
        colored
        :online="online ? true : null"
      />
      <div :key="`title-${room.id}`" class="window__title window__swap">
        <h2>{{ room.name }}</h2>
        <small
          v-if="subtitle"
          :class="{
            window__typing: status.kind === 'typing',
            window__plain: status.kind === 'online' || status.kind === 'seen',
          }"
          aria-live="polite"
          >{{ subtitle
          }}<span v-if="status.kind === 'typing'" class="dots" aria-hidden="true"
            ><i></i><i></i><i></i></span
          ><span v-if="status.kind === 'typing'" class="visually-hidden">...</span></small
        >
      </div>
      <button
        type="button"
        class="window__info"
        aria-label="Detalhes do contato"
        @click="emit('info')"
      >
        <FontAwesomeIcon
          :icon="faEllipsisVertical"
          :style="{ fontSize: '18px' }"
          aria-hidden="true"
        />
      </button>
    </header>

    <MessageList
      :key="room.id"
      :messages="messages?.items ?? []"
      :me-id="meId"
      :members="members"
      :presence="presence"
      :has-more="messages?.hasMore ?? false"
      :loading="loading"
      :loading-older="loadingOlder"
      :error="error"
      @load-older="emit('load-older')"
      @reply="startReply"
      @edit="startEdit"
      @delete="confirmDelete"
    />

    <ChatVagaCard
      v-if="room.pending_vaga"
      class="window__context"
      :vaga="room.pending_vaga"
      dismissible
      @dismiss="emit('dismiss-context')"
    />

    <MessageComposer
      :disabled="disabled"
      :reply-to="replyTo"
      :editing="editing"
      :max-file-mb="maxFileMb"
      @send="onSend"
      @send-file="onSendFile"
      @edit="onEdit"
      @typing="emit('typing')"
      @cancel="cancelContext"
    />
  </section>
</template>

<style scoped>
.window {
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  background-color: var(--chat-deep, var(--chat-bg));
}

/* Cabeçalho do protótipo: degradê roxo encostado no topo e nas laterais (tela cheia; respeita o
   notch com safe-area-inset-top). */
.window__header {
  display: flex;
  flex-shrink: 0;
  align-items: center;
  gap: 0.625rem;
  padding: calc(0.75rem + env(safe-area-inset-top, 0px)) 0.5rem 0.75rem 0.25rem;
  color: #ffffff;
  box-shadow: 0 2px 10px rgba(79, 43, 165, 0.18);
  background: linear-gradient(
    135deg,
    var(--mrj-color-primary, #6e4ab7) 0%,
    var(--mrj-color-primary-active, #4f2ba5) 100%
  );
}

.window__title {
  flex: 1;
  min-width: 0;
}

.window__title {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.window__title h2 {
  overflow: hidden;
  margin: 0;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
  line-height: 1.25;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.window__title small {
  overflow: hidden;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.75rem;
  font-style: italic;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.window__typing {
  color: #ffffff !important;
  font-weight: 600;
}

/* "online" e "visto por último": texto normal, sem o itálico do @handle. */
.window__plain {
  font-style: normal !important;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.window__back,
.window__info {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 2.75rem;
  min-height: 2.75rem;
  padding: 0.5rem;
  color: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 50%;
  background: none;
  cursor: pointer;
}

.window__back:hover,
.window__info:hover {
  color: #ffffff;
  background-color: rgba(255, 255, 255, 0.16);
}

.dots {
  display: inline-flex;
  gap: 0.1875rem;
  margin-left: 0.25rem;
  vertical-align: middle;
}

.dots i {
  width: 0.3125rem;
  height: 0.3125rem;
  border-radius: 50%;
  background-color: currentColor;
}

.window__back,
.window__info {
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

@media (prefers-reduced-motion: no-preference) {
  .window__swap {
    animation: swap-in 0.25s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }

  .dots i {
    animation: dot-bounce 1.2s ease-in-out infinite;
  }

  .dots i:nth-child(2) {
    animation-delay: 0.15s;
  }

  .dots i:nth-child(3) {
    animation-delay: 0.3s;
  }
}

@keyframes swap-in {
  from {
    opacity: 0;
    transform: translateX(0.5rem);
  }
}

@keyframes dot-bounce {
  0%,
  60%,
  100% {
    opacity: 0.4;
    transform: translateY(0);
  }

  30% {
    opacity: 1;
    transform: translateY(-0.25rem);
  }
}
</style>
