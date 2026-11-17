<script setup>
import { computed, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faComments } from '@fortawesome/free-solid-svg-icons'
import ChatPane from '@/features/chat/components/ChatPane.vue'
import ConnectionBanner from '@/features/chat/components/ConnectionBanner.vue'
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
  <!-- Layout de celular, uma tela por vez: a lista de conversas; ao tocar, a conversa ocupa a tela
       toda (sem título nem rodapé de navegação, que o App.vue esconde com ?room=). -->
  <main
    class="mensagens mrj-ui"
    :class="routeRoomId !== null ? 'mensagens--conversa' : 'mensagens--lista'"
  >
    <!-- Lista: o título "Mensagens" fica no cabeçalho em degradê do próprio RoomList. -->
    <RoomList
      v-if="routeRoomId === null"
      class="mensagens__lista"
      :rooms="chat.rooms"
      :active-id="null"
      :loading="chat.loadingRooms"
      :error="chat.roomsError"
      @select="selectRoom"
      @retry="chat.loadRooms()"
    >
      <ConnectionBanner :state="banner" @retry="chat.retryConnection()" />
    </RoomList>

    <template v-else>
      <ConnectionBanner :state="banner" @retry="chat.retryConnection()" />
      <ChatPane
        v-if="room"
        class="mensagens__conversa"
        @back="router.push({ name: 'mensagens' })"
      />
      <section v-else class="mensagens__abrindo" role="status">
        <FontAwesomeIcon :icon="faComments" :style="{ fontSize: '40px' }" aria-hidden="true" />
        <p>Abrindo conversa...</p>
      </section>
    </template>
  </main>
</template>

<style scoped>
/* Mesma largura de celular do resto do app (o shell limita a 26.25rem). */
.mensagens {
  /* Cores do chat a partir dos tokens do MaruJob (src/styles/tokens.css). */
  --color-primary: var(--mrj-color-primary);
  --color-primary-hover: var(--mrj-color-primary-hover);
  --color-background: #ffffff;
  --color-surface: var(--mrj-color-surface);
  --color-border: var(--mrj-color-border-subtle);
  --color-text: var(--mrj-color-text);
  --color-text-secondary: var(--mrj-color-text-secondary);
  --color-danger: var(--mrj-color-danger);
  --color-success: var(--mrj-color-success);
  --color-bg-page: var(--mrj-color-background);
  --radius-sm: var(--mrj-radius-sm);
  --radius-lg: var(--mrj-radius-lg);
  --shadow-md: 0 6px 20px rgba(76, 53, 103, 0.18);
  --chat-bg: #ffffff;
  /* Protótipo: área das mensagens lilás acinzentada e balões claros. */
  --chat-deep: color-mix(in srgb, var(--mrj-color-border) 42%, var(--mrj-color-background));
  --chat-bubble: color-mix(in srgb, #ffffff 70%, var(--mrj-color-surface));
  /* Cinza das prévias e textos auxiliares (mesmo text-secondary das páginas do app, freelancer.css). */
  --chat-muted: #666b80;

  display: flex;
  flex-direction: column;
  gap: 12px;
  height: calc(100dvh - var(--mrj-navigation-height, 85px) - env(safe-area-inset-bottom, 0px));
  padding: 16px 16px 12px;
  box-sizing: border-box;
  font-family: var(--mrj-font-family);
}

/* Lista: de ponta a ponta até o rodapé. Como as outras páginas (Início, Freelances, Perfil), pinta o
   próprio fundo claro em vez de herdar o do body (que fica escuro no modo escuro do sistema). */
.mensagens--lista {
  gap: 0;
  height: 100dvh;
  padding: 8px 0 0;
  background-color: #ffffff;
}

/* A página reserva o espaço do rodapé (App.vue: paginasComReserva), então o lilás da lista passa por
   trás dos cantos arredondados do rodapé, como o fundo da Início. */
.mensagens--lista .mensagens__lista {
  padding-bottom: calc(var(--mrj-navigation-height, 85px) + env(safe-area-inset-bottom, 0px));
}

/* Conversa aberta: ocupa a tela toda, com o campo de digitar colado embaixo. */
.mensagens--conversa {
  gap: 0;
  height: 100dvh;
  padding: 8px 0 0;
}

.mensagens :deep(button),
.mensagens :deep(input),
.mensagens :deep(textarea) {
  font-family: inherit;
}

.mensagens__lista {
  flex: 1;
  min-height: 0;
}

.mensagens__conversa {
  flex: 1;
  min-height: 0;
}

.mensagens__abrindo {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  color: var(--mrj-color-text-secondary);
}
</style>

<style>
/* Reset dos controles do chat com especificidade zero (:where): tira o visual padrão do navegador
   (fundo cinza e borda dos botões, marcadores de lista) sem competir com os estilos dos componentes.
   .viewer é o visualizador de imagens, que é teleportado para o <body>. */
:where(.mensagens, .viewer) :where(button) {
  padding: 0;
  color: inherit;
  font: inherit;
  border: none;
  background: none;
  cursor: pointer;
}

:where(.mensagens, .viewer) :where(button:disabled) {
  cursor: default;
}

:where(.mensagens) :where(ul, ol) {
  list-style: none;
}

:where(.mensagens) :where(input, textarea) {
  width: 100%;
  color: inherit;
  font: inherit;
}
</style>
