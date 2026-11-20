<script setup>
import { computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { formatLastSeen } from '../lib/format'
import ChatAvatar from './ChatAvatar.vue'

// Detalhes do contato da conversa (nome, foto e presença).
const { room, presence } = defineProps({
  room: { type: Object, required: true },
  presence: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['close'])

const other = computed(() => room.other)
const live = computed(() => (other.value ? presence[other.value.id] : null))
const online = computed(() => (live.value ? live.value.online : Boolean(other.value?.online)))
const lastSeen = computed(() => (live.value ? live.value.last_seen : other.value?.last_seen))
</script>

<template>
  <aside class="info" aria-label="Detalhes do contato">
    <header class="info__header">
      <h3>Detalhes do contato</h3>
      <button type="button" aria-label="Fechar" @click="emit('close')">
        <FontAwesomeIcon :icon="faXmark" :style="{ fontSize: '18px' }" aria-hidden="true" />
      </button>
    </header>

    <div class="info__body">
      <ChatAvatar :name="room.name" :src="room.image" :size="96" colored :online="online" />
      <h4>{{ room.name }}</h4>
      <p :class="{ info__online: online }">{{ online ? 'online' : formatLastSeen(lastSeen) }}</p>

      <p class="info__note">
        As conversas no MaruJob começam sempre pelo botão "Conversar" de uma candidatura.
      </p>
    </div>
  </aside>
</template>

<style scoped>
.info {
  display: flex;
  flex-direction: column;
  min-height: 0;
  background-color: #ffffff;
}

.info__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #dcd0e8;
}

.info__header h3 {
  color: #6e4ab7;
  font-size: 16px;
}

.info__header button {
  display: inline-flex;
  padding: 6px;
  color: #796197;
  border-radius: 50%;
  cursor: pointer;
}

.info__header button:hover {
  background-color: #eae1f3;
}

.info__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 28px 20px;
  text-align: center;
}

.info__body h4 {
  color: #2c2c2c;
  font-size: 18px;
}

.info__body p {
  color: #796197;
  font-size: 14px;
}

.info__online {
  color: #3d8b5a !important;
}

.info__note {
  margin-top: 16px;
  padding: 10px 12px;
  color: #5c3a8b !important;
  font-size: 13px !important;
  border-radius: 10px;
  background-color: #f6f1fa;
}
</style>
