<script setup>
import { computed } from 'vue'
import '../../styles/tokens.css'

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'outline', 'text'].includes(value),
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value),
  },
  type: {
    type: String,
    default: 'button',
    validator: (value) => ['button', 'submit', 'reset'].includes(value),
  },
  disabled: Boolean,
  loading: Boolean,
  loadingLabel: { type: String, default: 'Carregando…' },
})
const emit = defineEmits(['click'])
const blocked = computed(() => props.disabled || props.loading)
function onClick(event) {
  if (blocked.value) {
    event.preventDefault()
    return
  }
  emit('click', event)
}
</script>

<template>
  <button
    class="mrj-ui mrj-button"
    :class="[`mrj-button--${variant}`, `mrj-button--${size}`]"
    :type="type"
    :disabled="blocked"
    :aria-busy="loading || undefined"
    @click="onClick"
  >
    <slot />
    <span v-if="loading" role="status">{{ loadingLabel }}</span>
  </button>
</template>

<style scoped>
.mrj-button {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--mrj-space-2);
  max-width: 100%;
  min-height: var(--mrj-control-height-md);
  padding: var(--mrj-space-2) var(--mrj-space-4);
  border: var(--mrj-border-width) solid transparent;
  border-radius: var(--mrj-radius-sm);
  background: var(--mrj-color-primary);
  color: var(--mrj-color-on-primary);
  font-family: var(--mrj-font-family);
  font-size: var(--mrj-font-size-md);
  font-weight: var(--mrj-font-weight-semibold);
  line-height: var(--mrj-line-height);
  overflow-wrap: anywhere;
  cursor: pointer;
  transition:
    background-color var(--mrj-motion-duration),
    border-color var(--mrj-motion-duration);
}
.mrj-button:hover:not(:disabled) {
  background: var(--mrj-color-primary-hover);
}
.mrj-button:active:not(:disabled) {
  background: var(--mrj-color-primary-active);
}
.mrj-button--secondary {
  background: var(--mrj-color-secondary);
  color: var(--mrj-color-text);
}
.mrj-button--outline,
.mrj-button--text {
  background: transparent;
  color: var(--mrj-color-text);
}
.mrj-button--outline {
  border-color: var(--mrj-color-border);
}
.mrj-button--secondary:hover:not(:disabled),
.mrj-button--outline:hover:not(:disabled),
.mrj-button--text:hover:not(:disabled) {
  background: var(--mrj-color-secondary-hover);
}
.mrj-button--secondary:active:not(:disabled),
.mrj-button--outline:active:not(:disabled),
.mrj-button--text:active:not(:disabled) {
  background: var(--mrj-color-secondary);
}
.mrj-button--small {
  min-height: var(--mrj-control-height-sm);
  font-size: var(--mrj-font-size-sm);
  padding-inline: var(--mrj-space-3);
}
.mrj-button--large {
  min-height: var(--mrj-control-height-lg);
  font-size: var(--mrj-font-size-lg);
  padding-inline: var(--mrj-space-6);
}
.mrj-button:focus-visible {
  outline: var(--mrj-focus-width) solid var(--mrj-color-focus);
  outline-offset: var(--mrj-focus-offset);
}
.mrj-button:disabled {
  opacity: var(--mrj-disabled-opacity);
  cursor: not-allowed;
}
.mrj-button[aria-busy='true'] {
  cursor: wait;
}
</style>
