<script setup>
import { computed, ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faBriefcase, faComments, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { RouterLink } from 'vue-router'
import { sessao } from '@/services/authSession'
import { formatListTime } from '../lib/format'
import { filterRooms, isOnline, roomPreview, roomVaga, roomsSubtitle } from '../lib/roomList'
import ChatAvatar from './ChatAvatar.vue'

const { rooms, activeId, loading, error, presence } = defineProps({
  rooms: { type: Array, required: true },
  activeId: { type: Number, default: null },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
  // Presença em tempo real (id do usuário -> { online }), para a bolinha verde do avatar.
  presence: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['select', 'retry'])

const filter = ref('')
const tab = ref('todas')
const tabs = [
  { id: 'todas', label: 'Todas' },
  { id: 'nao-lidas', label: 'Não lidas' },
]

// Onde ficam as candidaturas de cada tipo de conta (para o estado vazio).
const atalho = computed(() =>
  sessao.tipo === 'empresa'
    ? { to: '/empresa/notificacoes', label: 'Ver candidaturas' }
    : { to: '/freelances', label: 'Ver oportunidades' },
)

const subtitle = computed(() => roomsSubtitle(rooms))

const visible = computed(() =>
  filterRooms(rooms, { term: filter.value, onlyUnread: tab.value === 'nao-lidas' }),
)

const emptyFilter = computed(() =>
  tab.value === 'nao-lidas' && !filter.value.trim()
    ? 'Nenhuma conversa não lida.'
    : 'Nenhuma conversa encontrada.',
)
</script>

<template>
  <!-- Lista de conversas no mesmo estilo da conversa aberta (protótipo referencias/chat.png):
       cabeçalho em degradê, fundo lilás e cada conversa como um item claro e arredondado. -->
  <section class="rooms" aria-labelledby="rooms-titulo">
    <header class="rooms__header">
      <h1 id="rooms-titulo" class="rooms__title">Mensagens</h1>
      <p v-if="subtitle" class="rooms__subtitle" aria-live="polite">{{ subtitle }}</p>
    </header>

    <!-- Avisos da página (ex.: reconectando). -->
    <slot />

    <div v-if="rooms.length" class="rooms__tools">
      <div class="rooms__search">
        <FontAwesomeIcon :icon="faMagnifyingGlass" class="rooms__lupa" aria-hidden="true" />
        <input
          v-model="filter"
          type="search"
          placeholder="Buscar conversa"
          aria-label="Buscar conversa"
        />
      </div>

      <div class="rooms__tabs" role="group" aria-label="Filtrar conversas">
        <button
          v-for="item in tabs"
          :key="item.id"
          type="button"
          class="rooms__tab"
          :class="{ 'rooms__tab--active': tab === item.id }"
          :aria-pressed="tab === item.id ? 'true' : 'false'"
          @click="tab = item.id"
        >
          {{ item.label }}
        </button>
      </div>
    </div>

    <p v-if="loading && !rooms.length" class="rooms__state" role="status">
      Carregando conversas...
    </p>
    <div v-else-if="error && !rooms.length" class="rooms__state" role="alert">
      <h2 class="rooms__state-title">Não foi possível carregar</h2>
      <p>{{ error }}</p>
      <button type="button" class="rooms__pill" @click="emit('retry')">Tentar novamente</button>
    </div>
    <div v-else-if="!rooms.length" class="rooms__state">
      <FontAwesomeIcon :icon="faComments" class="rooms__state-icon" aria-hidden="true" />
      <h2 class="rooms__state-title">Nenhuma conversa ainda</h2>
      <p>
        Para falar com {{ sessao.tipo === 'empresa' ? 'um freelancer' : 'uma empresa' }}, é só usar
        o botão "Conversar" em uma candidatura.
      </p>
      <RouterLink class="rooms__pill" :to="atalho.to">{{ atalho.label }}</RouterLink>
    </div>
    <p v-else-if="!visible.length" class="rooms__state rooms__state--compact">
      {{ emptyFilter }}
    </p>

    <TransitionGroup v-if="rooms.length" tag="ul" name="rooms" class="rooms__list">
      <li
        v-for="(room, index) in visible"
        :key="room.id"
        class="rooms__item"
        :style="{ '--i': Math.min(index, 8) }"
      >
        <button
          type="button"
          class="room"
          :class="{ 'room--active': room.id === activeId, 'room--unread': room.unread > 0 }"
          :aria-current="room.id === activeId ? 'true' : undefined"
          @click="emit('select', room.id)"
        >
          <ChatAvatar
            :name="room.name"
            :src="room.image"
            :size="52"
            colored
            :online="isOnline(room, presence) ? true : null"
          />
          <span class="room__body">
            <span class="room__line">
              <span class="room__name">{{ room.name }}</span>
              <span v-if="isOnline(room, presence)" class="visually-hidden">, online</span>
              <time v-if="room.last_message_at" class="room__time" :datetime="room.last_message_at">
                {{ formatListTime(room.last_message_at) }}
              </time>
            </span>
            <span v-if="roomVaga(room)" class="room__vaga">
              <FontAwesomeIcon :icon="faBriefcase" class="room__vaga-icon" aria-hidden="true" />
              <span class="visually-hidden">Vaga: </span>
              <span class="room__vaga-titulo">{{ roomVaga(room).titulo }}</span>
            </span>
            <span class="room__line">
              <span class="room__preview">{{ roomPreview(room) }}</span>
              <Transition name="badge" mode="out-in">
                <span
                  v-if="room.unread > 0"
                  :key="room.unread"
                  class="room__badge"
                  :aria-label="`${room.unread} ${room.unread === 1 ? 'não lida' : 'não lidas'}`"
                >
                  {{ room.unread > 99 ? '99+' : room.unread }}
                </span>
              </Transition>
            </span>
          </span>
        </button>
      </li>
    </TransitionGroup>
  </section>
</template>

<style scoped>
.rooms {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background-color: var(--chat-deep);
}

/* Mesmo cabeçalho da conversa aberta: degradê roxo encostado no topo e nas laterais
   (respeita a área do notch com safe-area-inset-top). */
.rooms__header {
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  justify-content: center;
  gap: 0.125rem;
  min-height: 4.25rem;
  padding: calc(0.875rem + env(safe-area-inset-top, 0px)) 1.25rem 0.875rem;
  box-shadow: 0 2px 10px rgba(79, 43, 165, 0.18);
  background: linear-gradient(
    135deg,
    var(--mrj-color-primary, #6e4ab7) 0%,
    var(--mrj-color-primary-active, #4f2ba5) 100%
  );
}

.rooms__title {
  margin: 0;
  color: #ffffff;
  font-size: 1.25rem;
  font-weight: 700;
  line-height: 1.2;
}

.rooms__subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.85);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.3;
}

.rooms__tools {
  flex-shrink: 0;
  padding: 1rem 1rem 0.375rem;
}

/* Abas em pílula: "Todas" e "Não lidas". */
.rooms__tabs {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.rooms__tab {
  min-height: 2rem;
  padding: 0 0.875rem;
  color: var(--mrj-color-text, #533581);
  font-size: 0.8125rem;
  font-weight: 600;
  border: 1px solid var(--mrj-color-border-subtle, #dcd0e8);
  border-radius: var(--mrj-radius-pill, 999px);
  background-color: #ffffff;
  transition:
    color 0.15s ease,
    background-color 0.15s ease,
    border-color 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}

.rooms__tab--active {
  color: #ffffff;
  border-color: var(--mrj-color-primary, #6e4ab7);
  background-color: var(--mrj-color-primary, #6e4ab7);
}

/* Busca em pílula logo abaixo do cabeçalho, com respiro dos lados. */
.rooms__search {
  position: relative;
}

.rooms__lupa {
  position: absolute;
  top: 50%;
  left: 1rem;
  color: var(--mrj-color-border, #796197);
  font-size: 0.875rem;
  transform: translateY(-50%);
  pointer-events: none;
}

.rooms__search input {
  height: 2.5rem;
  padding: 0 1rem 0 2.5rem;
  color: var(--mrj-color-text, #533581);
  font-size: 0.875rem;
  border: 1px solid transparent;
  border-radius: var(--mrj-radius-pill, 999px);
  background-color: #ffffff;
  box-shadow: var(--chat-shadow, 0 4px 14px rgba(76, 53, 103, 0.1));
}

.rooms__search input::placeholder {
  color: var(--chat-muted, #666b80);
}

.rooms__search input:focus {
  border-color: var(--mrj-color-primary, #6e4ab7);
  outline: none;
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--mrj-color-primary, #6e4ab7) 20%, transparent);
}

/* Estados (vazio, erro, carregando): centralizados na área da lista. */
.rooms__state {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.625rem;
  padding: 2rem 2rem 3rem;
  color: var(--chat-muted, #666b80);
  font-size: 0.875rem;
  line-height: 1.5;
  text-align: center;
}

.rooms__state--compact {
  flex: 0;
  padding: 1.5rem 1rem;
}

/* Ícone num círculo branco com sombra suave, para não sumir no lilás. */
.rooms__state-icon {
  box-sizing: content-box;
  width: 3rem;
  height: 3rem;
  margin-bottom: 0.5rem;
  padding: 1.5rem;
  color: var(--mrj-color-primary, #6e4ab7);
  border-radius: 50%;
  background-color: #ffffff;
  box-shadow: var(--chat-shadow, 0 4px 14px rgba(76, 53, 103, 0.1));
}

.rooms__state-title {
  margin: 0;
  color: var(--mrj-color-text, #533581);
  font-size: 1.125rem;
  font-weight: 700;
}

.rooms__state p {
  max-width: 17rem;
  /* Sobre o lilás, o cinza não tem contraste suficiente: usa a cor de texto do MaruJob. */
  color: var(--mrj-color-text, #533581);
}

.rooms__pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: var(--mrj-control-height-md, 2.75rem);
  margin-top: 0.5rem;
  padding: 0 1.5rem;
  color: #ffffff;
  font-size: 0.9375rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: var(--mrj-radius-pill, 999px);
  background-color: var(--mrj-color-primary, #6e4ab7);
  box-shadow: 0 6px 16px rgba(110, 74, 183, 0.32);
}

.rooms__pill:hover {
  background-color: var(--mrj-color-primary-hover, #63369e);
}

/* Itens claros e arredondados (como os balões), com espaço entre eles e sem divisórias. */
.rooms__list {
  position: relative;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.625rem;
  min-height: 0;
  padding: 0.5rem 1rem 1rem;
  overflow-y: auto;
  overscroll-behavior: contain;
}

.room {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 0.875rem 0.75rem 0.75rem;
  text-align: left;
  border-radius: 1rem;
  background-color: var(--chat-bubble, #ffffff);
  box-shadow: var(--chat-shadow, 0 4px 14px rgba(76, 53, 103, 0.1));
  -webkit-tap-highlight-color: transparent;
}

/* Feedback ao tocar: fundo levemente mais escuro. */
.room:active {
  background-color: #f1ebf8;
}

.room--active {
  outline: 2px solid var(--mrj-color-primary, #6e4ab7);
}

.room__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.3125rem;
  min-width: 0;
}

/* Linhas 1 (nome + hora) e 3 (prévia + contador). */
.room__line {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.room__name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: var(--mrj-color-text, #533581);
  font-size: 0.9375rem;
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
}

/* Linha 2: chip com a vaga da conversa. */
.room__vaga {
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  gap: 0.3125rem;
  max-width: 100%;
  padding: 0.125rem 0.5rem;
  color: var(--mrj-color-primary-active, #4f2ba5);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.3;
  border-radius: var(--mrj-radius-pill, 999px);
  background-color: var(--mrj-color-secondary, #eae1f3);
}

.room__vaga-icon {
  flex-shrink: 0;
  font-size: 0.625rem;
}

.room__vaga-titulo {
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.room__preview {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  color: var(--chat-muted, #666b80);
  font-size: 0.8125rem;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.room--unread .room__name {
  color: #3a1f78;
  font-weight: 800;
}

.room--unread .room__preview {
  color: #3a1f78;
  font-weight: 600;
}

.room__time {
  flex-shrink: 0;
  color: var(--chat-muted, #666b80);
  font-size: 0.6875rem;
}

.room--unread .room__time {
  color: var(--mrj-color-primary, #6e4ab7);
  font-weight: 600;
}

.room__badge {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  min-width: 1.375rem;
  height: 1.375rem;
  padding: 0 0.375rem;
  color: #ffffff;
  font-size: 0.6875rem;
  font-weight: 700;
  line-height: 1;
  border-radius: 999px;
  background-color: var(--mrj-color-primary, #6e4ab7);
}

.room {
  transition: background-color 0.12s ease;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.rooms__search input {
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

/* Animações: conversas entram em cascata e trocam de lugar suavemente quando chega mensagem nova. */
@media (prefers-reduced-motion: no-preference) {
  .rooms__item {
    animation: room-in 0.35s cubic-bezier(0.2, 0.8, 0.2, 1) both;
    animation-delay: calc(var(--i, 0) * 40ms);
  }

  .rooms-move {
    transition: transform 0.35s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .rooms-leave-active {
    position: absolute;
    width: calc(100% - 1.75rem);
    transition: opacity 0.2s ease;
  }

  .rooms-leave-to {
    opacity: 0;
  }

  .badge-enter-active {
    transition:
      transform 0.3s cubic-bezier(0.3, 1.6, 0.5, 1),
      opacity 0.2s ease-out;
  }

  .badge-leave-active {
    transition: opacity 0.1s ease-in;
  }

  .badge-enter-from {
    opacity: 0;
    transform: scale(0.4);
  }

  .badge-leave-to {
    opacity: 0;
  }
}

@keyframes room-in {
  from {
    opacity: 0;
    transform: translateY(0.5rem);
  }
}
</style>
