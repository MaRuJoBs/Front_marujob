<script setup>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { dismissToast, toasts } from '../composables/useChatToast'
import ChatAvatar from './ChatAvatar.vue'

// Avisos do chat (erros e mensagens novas). Montado uma vez no App.vue.
function activate(toast) {
  if (!toast.onClick) return

  toast.onClick()
  dismissToast(toast.id)
}
</script>

<template>
  <div class="toasts" aria-live="polite" aria-atomic="false">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast"
        :class="[`toast--${toast.type}`, { 'toast--clickable': toast.onClick }]"
        :role="toast.type === 'error' ? 'alert' : 'status'"
      >
        <button
          v-if="toast.type === 'message' && toast.message"
          type="button"
          class="toast__body"
          @click="activate(toast)"
        >
          <ChatAvatar :name="toast.message.author" :src="toast.message.avatar ?? null" :size="40" />
          <span class="toast__text">
            <strong>{{ toast.message.author }}</strong>
            <span>{{ toast.message.preview }}</span>
          </span>
          <span class="toast__open">Abrir</span>
        </button>
        <p v-else class="toast__body toast__body--text">{{ toast.text }}</p>

        <button
          type="button"
          class="toast__close"
          aria-label="Fechar aviso"
          @click="dismissToast(toast.id)"
        >
          <FontAwesomeIcon :icon="faXmark" aria-hidden="true" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toasts {
  position: fixed;
  z-index: 1000;
  top: 16px;
  right: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: min(360px, calc(100vw - 32px));
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 8px 10px 14px;
  color: #533581;
  font-family: Arial, Helvetica, sans-serif;
  border: 1px solid #dcd0e8;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 6px 20px rgba(76, 53, 103, 0.18);
  pointer-events: auto;
}

.toast--error {
  color: #b30000;
  border-color: #f0c4c4;
  background: #fff5f5;
}

.toast__body {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 12px;
  min-width: 0;
  margin: 0;
  padding: 0;
  color: inherit;
  font: inherit;
  text-align: left;
  border: none;
  background: none;
}

.toast--clickable .toast__body {
  cursor: pointer;
}

.toast__body--text {
  font-size: 14px;
  line-height: 1.4;
}

.toast__text {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  line-height: 1.3;
}

.toast__text strong,
.toast__text span {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.toast__text strong {
  font-size: 15px;
}

.toast__text span {
  color: #5c3a8b;
  font-size: 13px;
}

.toast__open {
  flex-shrink: 0;
  padding: 6px 14px;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  border-radius: 999px;
  background-color: #6e4ab7;
}

.toast__close {
  display: inline-flex;
  flex-shrink: 0;
  padding: 6px 8px;
  color: inherit;
  border: none;
  border-radius: 50%;
  background: none;
  cursor: pointer;
}

.toast__close:hover {
  background-color: #eae1f3;
}

.toast-enter-active,
.toast-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(24px);
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active {
    transition: none;
  }
}
</style>
