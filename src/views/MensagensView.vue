<script setup>
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faComments } from '@fortawesome/free-solid-svg-icons'
import ChatPane from '@/features/chat/components/ChatPane.vue'
import ConnectionBanner from '@/features/chat/components/ConnectionBanner.vue'
import RoomList from '@/features/chat/components/RoomList.vue'
import { useChatToast } from '@/features/chat/composables/useChatToast'
import { STATUS } from '@/features/chat/lib/socketClient'
import { useChatStore } from '@/features/chat/stores/chat'
import { useMediaQuery } from '@/composables/useMediaQuery'

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
// F61: a partir de 64rem, lista e conversa lado a lado (mesma instância, mesmo store; o
// WebSocket continua sendo aberto só no App.vue). Abaixo disso, o fluxo mobile é o de sempre.
const desktop = useMediaQuery('(min-width: 64rem)')
const viewportStyle = shallowRef(null)

// Quando o teclado reduz só o viewport visual, a conversa precisa caber nele.
watch(
  routeRoomId,
  (id, _, onCleanup) => {
    viewportStyle.value = null

    const viewport = window.visualViewport

    if (id === null || !viewport) return

    function syncViewport() {
      viewportStyle.value =
        viewport.scale === 1 && viewport.height < document.documentElement.clientHeight - 1
          ? {
              top: `${viewport.offsetTop}px`,
              height: `${viewport.height}px`,
              '--chat-bottom-inset': '0px',
            }
          : null
    }

    syncViewport()
    viewport.addEventListener('resize', syncViewport)
    viewport.addEventListener('scroll', syncViewport)
    onCleanup(() => {
      viewport.removeEventListener('resize', syncViewport)
      viewport.removeEventListener('scroll', syncViewport)
    })
  },
  { immediate: true },
)

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
  <!-- F61 · Desktop (≥ 64rem): duas colunas. A URL (?room=) continua sendo a conversa aberta. -->
  <main v-if="desktop" class="mensagens mensagens--desktop mrj-ui">
    <RoomList
      class="mensagens__lista"
      :rooms="chat.rooms"
      :active-id="routeRoomId"
      :loading="chat.loadingRooms"
      :error="chat.roomsError"
      :presence="chat.presence"
      @select="selectRoom"
      @retry="chat.loadRooms()"
    >
      <ConnectionBanner :state="banner" @retry="chat.retryConnection()" />
    </RoomList>
    <div class="mensagens__painel">
      <ChatPane
        v-if="routeRoomId !== null && room"
        class="mensagens__conversa"
        @back="router.push({ name: 'mensagens' })"
      />
      <section v-else-if="routeRoomId !== null" class="mensagens__abrindo" role="status">
        <FontAwesomeIcon :icon="faComments" :style="{ fontSize: '40px' }" aria-hidden="true" />
        <p>Abrindo conversa...</p>
      </section>
      <section v-else class="mensagens__abrindo mensagens__vazio">
        <FontAwesomeIcon :icon="faComments" :style="{ fontSize: '40px' }" aria-hidden="true" />
        <p>Selecione uma conversa para ver as mensagens.</p>
      </section>
    </div>
  </main>
  <main
    v-else
    class="mensagens mrj-ui"
    :style="viewportStyle"
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
      :presence="chat.presence"
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
/* A tela de mensagens é a coluna do app: mesma largura e mesmo alinhamento do rodapé de navegação
   (shell.css: .app .app-navigation), centralizada e da altura inteira da tela. Fixa e com fundo
   próprio, então dentro da coluna nunca aparece o fundo do body nem margem; fora dela (computador)
   fica o fundo normal das outras telas, como na Início. Fica abaixo do rodapé (999) e dos avisos. */
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
  /* Fundo lilás claro da paleta (tokens.css), o mesmo na lista e na conversa; itens e balões brancos. */
  --chat-deep: var(--mrj-color-secondary);
  --chat-bubble: #ffffff;
  --chat-shadow: 0 4px 14px rgba(76, 53, 103, 0.1);
  /* Cinza das prévias e textos auxiliares (mesmo text-secondary das páginas do app, freelancer.css). */
  --chat-muted: #666b80;

  position: fixed;
  z-index: 10;
  top: 0;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: var(--mrj-content-width, 26.25rem);
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  overflow: hidden;
  box-sizing: border-box;
  font-family: var(--mrj-font-family);
  background-color: var(--chat-deep);
}

/* A área rolável termina acima da barra, com o fundo da página atrás dela. */
.mensagens--lista {
  padding-bottom: calc(var(--mrj-footer-occupied-height) + env(safe-area-inset-bottom, 0px));
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

/* F61 · Desktop: ocupa a área à direita da sidebar, na altura da janela. Lista e histórico
   rolam de forma independente; nenhuma barra cobre a conversa. */
@media (min-width: 64rem) {
  .mensagens--desktop {
    left: var(--mrj-layout-sidebar);
    right: 0;
    width: auto;
    max-width: none;
    transform: none;
    display: grid;
    grid-template-columns: minmax(18rem, 22rem) minmax(0, 1fr);
  }
  .mensagens--desktop .mensagens__lista {
    min-height: 0;
    overflow-y: auto;
    border-right: 1px solid var(--mrj-color-border-subtle);
  }
  .mensagens__painel {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
  }
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
