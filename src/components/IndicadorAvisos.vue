<script setup>
import { computed } from 'vue'
import { useChatStore } from '@/features/chat/stores/chat'
import { useContadorNotificacoes } from '@/stores/contadorNotificacoes'

const props = defineProps({ empresa: Boolean })
const chat = useChatStore()
const contador = useContadorNotificacoes()
const total = computed(() => chat.unreadTotal + (props.empresa ? (contador.total ?? 0) : 0))
</script>

<template>
  <template v-if="total > 0">
    <span class="indicador" aria-hidden="true">{{ total > 99 ? '99+' : total }}</span>
    <span class="leitor"
      >, {{ total }} {{ total === 1 ? 'aviso não lido' : 'avisos não lidos' }}</span
    >
  </template>
</template>

<style scoped>
.leitor {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
.indicador {
  position: absolute;
  top: 0;
  right: 0;
  min-width: 18px;
  padding: 2px 4px;
  border-radius: var(--mrj-radius-pill);
  background: var(--mrj-color-primary);
  color: var(--mrj-color-on-primary);
  text-align: center;
  font-size: 10px;
  line-height: 14px;
  font-weight: 700;
  box-shadow: 0 0 0 1px var(--mrj-color-surface);
}
</style>
