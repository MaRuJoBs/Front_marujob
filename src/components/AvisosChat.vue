<script setup>
import { computed } from 'vue'
import { faMessage } from '@fortawesome/free-solid-svg-icons'
import { useChatStore } from '@/features/chat/stores/chat'
import { roomPreview } from '@/features/chat/lib/roomList'
import { dataCandidatura } from '@/utils/notificacoes'

const chat = useChatStore()
const conversas = computed(() => chat.rooms.filter((room) => room.unread > 0))
</script>

<template>
  <section class="avisos-chat" aria-labelledby="titulo-avisos-chat">
    <div class="cabecalho-chat">
      <h2 id="titulo-avisos-chat">Mensagens</h2>
      <router-link :to="{ name: 'mensagens' }">Todas as conversas</router-link>
    </div>
    <p v-if="chat.loadingRooms || !chat.roomsLoaded" role="status">Carregando mensagens…</p>
    <template v-else-if="chat.roomsError">
      <p role="alert">{{ chat.roomsError }}</p>
      <button type="button" @click="chat.loadRooms()">Tentar carregar mensagens novamente</button>
    </template>
    <template v-else>
      <p role="status">
        {{
          chat.unreadTotal
            ? `${chat.unreadTotal} ${chat.unreadTotal === 1 ? 'mensagem não lida' : 'mensagens não lidas'}`
            : 'Você não tem mensagens não lidas.'
        }}
      </p>
      <ul v-if="conversas.length" class="conversas">
        <li v-for="conversa in conversas" :key="conversa.id">
          <router-link
            class="conversa"
            :to="{ name: 'mensagens', query: { room: String(conversa.id) } }"
          >
            <FontAwesomeIcon :icon="faMessage" aria-hidden="true" />
            <span class="conteudo-aviso">
              <strong>{{ conversa.name }}</strong>
              <span>{{ roomPreview(conversa) }}</span>
              <time
                v-if="dataCandidatura(conversa.last_message_at)"
                :datetime="conversa.last_message_at"
                >{{ dataCandidatura(conversa.last_message_at) }}</time
              >
            </span>
            <span class="nao-lidas">
              {{ conversa.unread }} {{ conversa.unread === 1 ? 'não lida' : 'não lidas' }}
            </span>
          </router-link>
        </li>
      </ul>
    </template>
  </section>
</template>

<style scoped>
.avisos-chat {
  padding: 14px;
  margin-block: 14px 20px;
  border-radius: var(--mrj-radius-md);
  background: var(--mrj-color-surface);
  color: var(--mrj-color-text);
  font-size: var(--mrj-font-size-sm);
}
.cabecalho-chat {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 4px 12px;
}
.cabecalho-chat a,
.avisos-chat button {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  color: var(--mrj-color-primary);
}
.avisos-chat :is(a, button):focus-visible {
  outline: 3px solid var(--mrj-color-focus);
  outline-offset: 2px;
}
.conversas {
  padding: 0;
  margin-block: 10px 0;
  list-style: none;
  display: grid;
  gap: 8px;
}
.conversa {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: start;
  gap: 8px;
  padding: 10px;
  border-radius: var(--mrj-radius-sm);
  text-decoration: none;
  color: var(--mrj-color-text);
  background: var(--mrj-color-secondary);
}
.conversa:is(:hover, :active) {
  background: var(--mrj-color-secondary-hover);
}
.conversa svg,
.nao-lidas {
  color: var(--mrj-color-primary);
}
.conteudo-aviso > * {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.nao-lidas {
  font-weight: 700;
  font-size: 0.75rem;
}
</style>
