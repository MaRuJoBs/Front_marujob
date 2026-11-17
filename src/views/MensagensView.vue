<script setup>
import { computed, onBeforeUnmount, watch } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faComments, faPlugCircleXmark } from '@fortawesome/free-solid-svg-icons'
import ChatPane from '@/features/chat/components/ChatPane.vue'
import RoomList from '@/features/chat/components/RoomList.vue'
import { useChatToast } from '@/features/chat/composables/useChatToast'
import { STATUS } from '@/features/chat/lib/socketClient'
import { useChatStore } from '@/features/chat/stores/chat'

// O chat (WebSocket, conversas, avisos) é ligado no App.vue conforme o login;
// aqui só se abre/fecha a conversa indicada na URL (/mensagens?room=<id>).
const route = useRoute()
const router = useRouter()
const toast = useChatToast()
const chat = useChatStore()

const routeRoomId = computed(() => {
  const id = Number(route.query.room)

  return Number.isSafeInteger(id) && id > 0 ? id : null
})
const room = computed(() => chat.activeRoom)

// A conversa da URL precisa existir para este usuário; senão volta para a lista.
const roomMissing = computed(
  () =>
    routeRoomId.value !== null &&
    chat.roomsLoaded &&
    !chat.loadingRooms &&
    !chat.roomsError &&
    !room.value &&
    !chat.loadingHistory,
)

onBeforeUnmount(() => chat.closeRoom())

watch(routeRoomId, (id) => chat.openRoom(id), { immediate: true })

// Depois de carregar a lista, tenta abrir a conversa da URL de novo (ex.: atualização da página).
watch(
  () => chat.roomsLoaded,
  (loaded) => {
    if (loaded && routeRoomId.value !== null && !room.value) chat.openRoom(routeRoomId.value)
  },
)

watch(roomMissing, (missing) => {
  if (!missing) return

  toast.error('Conversa não encontrada.')
  router.replace({ name: 'mensagens' })
})

// A conversa aberta saiu da lista: volta para a lista.
watch(
  () => chat.activeRoomId,
  (id) => {
    if (id === null && routeRoomId.value !== null && chat.roomsLoaded && !roomMissing.value) {
      router.replace({ name: 'mensagens' })
    }
  },
)

const banner = computed(() => {
  if (chat.connection === STATUS.UNAUTHORIZED) return 'unauthorized'
  if ([STATUS.RECONNECTING, STATUS.CONNECTING].includes(chat.connection) && chat.roomsLoaded) {
    return 'offline'
  }

  return null
})

function selectRoom(id) {
  router.push({ name: 'mensagens', query: { room: String(id) } })
}
</script>

<template>
  <main class="mensagens">
    <h1 class="mensagens__titulo">Mensagens</h1>

    <div class="chat" :class="{ 'chat--room': routeRoomId !== null }">
      <p v-if="banner === 'offline'" class="chat__banner" role="status">
        <FontAwesomeIcon :icon="faPlugCircleXmark" aria-hidden="true" />
        Reconectando...
        <button type="button" @click="chat.retryConnection()">Tentar agora</button>
      </p>
      <p
        v-else-if="banner === 'unauthorized'"
        class="chat__banner chat__banner--error"
        role="alert"
      >
        Sua sessão expirou.
        <RouterLink to="/">Entrar novamente</RouterLink>
      </p>

      <RoomList
        class="chat__rooms"
        :rooms="chat.rooms"
        :active-id="routeRoomId"
        :loading="chat.loadingRooms"
        :error="chat.roomsError"
        @select="selectRoom"
        @retry="chat.loadRooms()"
      />

      <ChatPane v-if="room" class="chat__pane" @back="router.push({ name: 'mensagens' })" />
      <section v-else class="chat__empty">
        <FontAwesomeIcon :icon="faComments" :style="{ fontSize: '48px' }" aria-hidden="true" />
        <p v-if="routeRoomId !== null">Abrindo conversa...</p>
        <p v-else>Escolha uma conversa ou use "Conversar" em uma candidatura.</p>
      </section>
    </div>
  </main>
</template>

<style scoped>
/* A largura disponível muda conforme o shell (freelancer: amplo; empresa: compacto), então o
   layout do chat responde ao próprio container, não à janela. */
.mensagens {
  container-type: inline-size;
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: calc(100dvh - var(--mrj-navigation-height, 85px) - env(safe-area-inset-bottom, 0px));
  min-height: 28rem;
  padding: 16px 16px 12px;
  box-sizing: border-box;
}

.mensagens__titulo {
  margin: 0;
  color: #533581;
  font-size: 1.5rem;
}

/* Paleta do MaruJob para os componentes do chat (as variáveis são herdadas por todos eles). */
.chat {
  --color-primary: #6e4ab7;
  --color-primary-hover: #63369e;
  --color-background: #ffffff;
  --color-surface: #f6f1fa;
  --color-border: #dcd0e8;
  --color-text: #2f2140;
  --color-text-secondary: #5c3a8b;
  --color-danger: #b30000;
  --color-success: #195539;
  --color-bg-page: #eee7f4;
  --radius-sm: 8px;
  --radius-lg: 16px;
  --shadow-md: 0 6px 20px rgba(76, 53, 103, 0.18);
  --chat-bg: #ffffff;
  --chat-deep: #f6f1fa;

  font-family: Arial, Helvetica, sans-serif;
  display: grid;
  flex: 1;
  grid-template-columns: minmax(16rem, 22rem) minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr);
  min-height: 0;
  overflow: hidden;
  border: 1px solid #dcd0e8;
  border-radius: 16px;
  background-color: var(--chat-bg);
  box-shadow: 0 2px 3px #4c356719;
}

.chat :deep(button),
.chat :deep(input),
.chat :deep(textarea) {
  font-family: inherit;
}

.chat__banner {
  display: flex;
  grid-column: 1 / -1;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 0;
  padding: 0.375rem 1rem;
  color: #533581;
  font-size: 0.875rem;
  background-color: #eae1f3;
}

.chat__banner--error {
  color: #b30000;
  background-color: #fff0f0;
}

.chat__banner button,
.chat__banner a {
  padding: 0;
  color: inherit;
  font-weight: 600;
  text-decoration: underline;
  border: none;
  background: none;
  cursor: pointer;
}

.chat__rooms {
  grid-row: 2;
  border-right: 1px solid var(--color-border);
}

.chat__pane,
.chat__empty {
  grid-row: 2;
}

.chat__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0 24px;
  color: #796197;
  text-align: center;
  background-color: var(--chat-deep);
}

/* Espaço estreito: uma tela por vez (lista -> conversa). */
@container (max-width: 700px) {
  .chat {
    grid-template-columns: minmax(0, 1fr);
  }

  .chat__rooms {
    border-right: none;
  }

  .chat--room .chat__rooms,
  .chat:not(.chat--room) .chat__pane,
  .chat:not(.chat--room) .chat__empty {
    display: none;
  }
}

@container (max-width: 480px) {
  .mensagens__titulo {
    font-size: 1.25rem;
  }
}
</style>
