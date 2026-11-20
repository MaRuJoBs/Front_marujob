<script setup>
import { computed, ref, watch } from 'vue'
import { useChatStore } from '../stores/chat'
import ChatWindow from './ChatWindow.vue'
import RoomInfoPanel from './RoomInfoPanel.vue'

// Conversa já aberta no store (chat.openRoom) com o painel de detalhes do contato.
const emit = defineEmits(['back'])

const chat = useChatStore()

const maxFileMb = Number(import.meta.env.VITE_CHAT_MAX_UPLOAD_MB) || 10

const infoOpen = ref(false)
const room = computed(() => chat.activeRoom)

watch(
  () => room.value?.id,
  () => {
    infoOpen.value = false
  },
)
</script>

<template>
  <div v-if="room" class="pane" :class="{ 'pane--info': infoOpen }">
    <ChatWindow
      class="pane__window"
      :room="room"
      :messages="chat.activeMessages"
      :members="chat.activeMembers"
      :presence="chat.presence"
      :me-id="chat.me?.id ?? null"
      :loading="chat.loadingHistory"
      :loading-older="chat.loadingHistory"
      :error="chat.historyError"
      :typing="chat.typingNow"
      :max-file-mb="maxFileMb"
      @back="emit('back')"
      @info="infoOpen = !infoOpen"
      @load-older="chat.loadOlder()"
      @dismiss-context="chat.dismissContext(room.id)"
      @send="chat.sendText($event.body, $event.replyTo)"
      @send-file="chat.sendFile($event.file, $event.replyTo)"
      @edit="chat.editMessage($event.id, $event.body)"
      @delete="chat.deleteMessage($event)"
      @typing="chat.notifyTyping()"
    />

    <RoomInfoPanel
      v-if="infoOpen"
      class="pane__info"
      :room="room"
      :presence="chat.presence"
      @close="infoOpen = false"
    />
  </div>
</template>

<style scoped>
/* As cores (--chat-bg, --chat-deep, --chat-bubble) vêm da página de mensagens. */
.pane {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  min-width: 0;
  min-height: 0;
}

/* Uma tela por vez: os detalhes do contato cobrem a conversa (nunca em coluna ao lado). */
.pane--info .pane__window {
  display: none;
}

.pane__info {
  padding-top: env(safe-area-inset-top, 0px);
}

@media (prefers-reduced-motion: no-preference) {
  .pane__info {
    animation: info-in 0.28s cubic-bezier(0.2, 0.8, 0.2, 1) both;
  }
}

@keyframes info-in {
  from {
    opacity: 0;
    transform: translateX(1.5rem);
  }
}
</style>
