<script setup>
import { computed, ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { RouterLink } from 'vue-router'
import { sessao } from '@/services/authSession'
import { formatListTime, messagePreview } from '../lib/format'
import ChatAvatar from './ChatAvatar.vue'

const { rooms, activeId, loading, error } = defineProps({
  rooms: { type: Array, required: true },
  activeId: { type: Number, default: null },
  loading: { type: Boolean, default: false },
  error: { type: String, default: '' },
})

const emit = defineEmits(['select', 'retry'])

const filter = ref('')

// Onde ficam as candidaturas de cada tipo de conta (para o estado vazio).
const atalho = computed(() =>
  sessao.tipo === 'empresa'
    ? { to: '/empresa/notificacoes', label: 'Ver candidaturas recebidas' }
    : { to: '/freelances', label: 'Ver oportunidades' },
)

const visible = computed(() => {
  const term = filter.value.trim().toLowerCase()

  return term ? rooms.filter((room) => room.name.toLowerCase().includes(term)) : rooms
})

function preview(room) {
  const message = room.last_message

  if (!message) return room.pending_vaga ? `Vaga: ${room.pending_vaga.titulo}` : 'Sem mensagens'

  const who =
    message.author && message.author.id !== room.other?.id && !message.is_deleted ? 'Você: ' : ''

  return `${who}${messagePreview(message)}`
}
</script>

<template>
  <section class="rooms" aria-label="Conversas">
    <header class="rooms__header">
      <h2 class="rooms__title">Conversas</h2>
    </header>

    <div class="rooms__search">
      <FontAwesomeIcon :icon="faMagnifyingGlass" :style="{ fontSize: '16px' }" aria-hidden="true" />
      <input
        v-model="filter"
        type="search"
        placeholder="Buscar conversa"
        aria-label="Buscar conversa"
      />
    </div>

    <p v-if="loading && !rooms.length" class="rooms__state" role="status">
      Carregando conversas...
    </p>
    <div v-else-if="error && !rooms.length" class="rooms__state rooms__state--error" role="alert">
      <p>{{ error }}</p>
      <button type="button" class="rooms__link" @click="emit('retry')">Tentar novamente</button>
    </div>
    <div v-else-if="!rooms.length" class="rooms__state">
      <p>
        Você ainda não tem conversas. Para falar com alguém, use "Conversar" em uma candidatura.
      </p>
      <RouterLink class="rooms__link" :to="atalho.to">{{ atalho.label }}</RouterLink>
    </div>
    <p v-else-if="!visible.length" class="rooms__state">Nenhuma conversa encontrada.</p>

    <TransitionGroup tag="ul" name="rooms" class="rooms__list">
      <li
        v-for="(room, index) in visible"
        :key="room.id"
        class="rooms__item"
        :style="{ '--i': Math.min(index, 8) }"
      >
        <button
          type="button"
          class="room"
          :class="{ 'room--active': room.id === activeId }"
          :aria-current="room.id === activeId ? 'true' : undefined"
          @click="emit('select', room.id)"
        >
          <ChatAvatar :name="room.name" :src="room.image" :size="40" />
          <span class="room__body">
            <span class="room__top">
              <span class="room__name">{{ room.name }}</span>
              <time v-if="room.last_message_at" class="room__time">{{
                formatListTime(room.last_message_at)
              }}</time>
            </span>
            <span class="room__bottom">
              <span class="room__preview">{{ preview(room) }}</span>
              <Transition name="badge" mode="out-in">
                <span
                  v-if="room.unread > 0"
                  :key="room.unread"
                  class="room__badge"
                  :aria-label="`${room.unread} não lidas`"
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
  background-color: var(--chat-bg, var(--color-background));
}

.rooms__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1rem 0.75rem;
}

.rooms__title {
  color: #6e4ab7;
  font-size: 1.25rem;
  font-weight: 800;
}

.rooms__search {
  position: relative;
  padding: 0 1rem 0.75rem;
}

.rooms__search svg {
  position: absolute;
  top: 0.625rem;
  left: 1.75rem;
  color: var(--color-text-secondary);
}

.rooms__search input {
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  border: none;
  border-radius: 999px;
  background-color: color-mix(
    in srgb,
    var(--color-primary) 6%,
    var(--chat-bg, var(--color-background))
  );
}

.rooms__state {
  padding: 1.5rem 1rem;
  text-align: center;
  color: var(--color-text-secondary);
}

.rooms__state--error {
  color: var(--color-danger);
}

.rooms__link {
  margin-top: 0.5rem;
  color: var(--color-primary);
  font-weight: 500;
}

.rooms__list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  border-top: 1px solid var(--color-border);
}

.rooms__list {
  position: relative;
}

.rooms__list li {
  border-bottom: 1px solid var(--color-border);
}

.room {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem;
  text-align: left;
}

.room {
  border-left: 3px solid transparent;
}

.room:hover {
  background-color: #f6f1fa;
}

.room--active {
  border-left-color: #6e4ab7;
  background-color: #eae1f3;
}

.room__body {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.room__top,
.room__bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.room__name {
  overflow: hidden;
  color: var(--color-text);
  font-weight: 600;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.room__time {
  flex-shrink: 0;
  color: var(--color-text-secondary);
  font-size: 0.75rem;
}

.room__preview {
  overflow: hidden;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.room__badge {
  flex-shrink: 0;
  min-width: 1.5rem;
  padding: 0.125rem 0.5rem;
  color: var(--color-primary);
  font-size: 0.75rem;
  font-weight: 600;
  line-height: 1.25;
  text-align: center;
  border-radius: 0.5rem;
  background-color: color-mix(
    in srgb,
    var(--color-primary) 14%,
    var(--chat-bg, var(--color-background))
  );
}

/* Animações: salas entram em cascata, trocam de lugar suavemente quando chega mensagem nova. */
.room {
  transition: background-color 0.15s ease;
}

.rooms__search input {
  transition:
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}

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
    width: 100%;
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
    transform: translateX(-0.75rem);
  }
}
</style>
