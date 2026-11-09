<script setup>
import { computed, useAttrs, useId } from 'vue'
import '../../styles/tokens.css'

defineOptions({ inheritAttrs: false })
const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  id: { type: String, default: undefined },
  label: { type: String, required: true },
  type: {
    type: String,
    default: 'text',
    validator: (value) =>
      ['text', 'email', 'password', 'search', 'tel', 'url', 'number'].includes(value),
  },
  placeholder: { type: String, default: '' },
  help: { type: String, default: '' },
  error: { type: String, default: '' },
  disabled: Boolean,
  required: Boolean,
})
const emit = defineEmits(['update:modelValue'])
const attrs = useAttrs()
const generatedId = useId()
const inputId = computed(() => props.id || `mrj-input-${generatedId}`)
// $attrs reflete o render atual; não é uma fonte reativa para cache em computed.
const describedBy = () =>
  [
    attrs['aria-describedby'],
    props.help && `${inputId.value}-help`,
    props.error && `${inputId.value}-error`,
  ]
    .filter(Boolean)
    .join(' ') || undefined
</script>

<template>
  <div class="mrj-ui mrj-field">
    <label :for="inputId" class="mrj-field__label">
      {{ label }}<span v-if="required"> (obrigatório)</span>
    </label>
    <input
      v-bind="$attrs"
      :id="inputId"
      class="mrj-field__input"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :aria-invalid="error ? 'true' : $attrs['aria-invalid']"
      :aria-describedby="describedBy()"
      @input="emit('update:modelValue', $event.target.value)"
    />
    <p v-if="help" :id="`${inputId}-help`" class="mrj-field__help">{{ help }}</p>
    <p v-if="error" :id="`${inputId}-error`" class="mrj-field__error" role="alert">
      {{ error }}
    </p>
  </div>
</template>

<style scoped>
.mrj-field {
  display: grid;
  gap: var(--mrj-space-2);
  min-width: 0;
  color: var(--mrj-color-text);
  font-family: var(--mrj-font-family);
  font-size: var(--mrj-font-size-md);
  line-height: var(--mrj-line-height);
  overflow-wrap: anywhere;
}
.mrj-field__label {
  font-weight: var(--mrj-font-weight-semibold);
}
.mrj-field__input {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  min-height: var(--mrj-control-height-md);
  padding: var(--mrj-space-2) var(--mrj-space-3);
  border: var(--mrj-border-width) solid var(--mrj-color-border);
  border-radius: var(--mrj-radius-sm);
  background: var(--mrj-color-surface);
  color: var(--mrj-color-text);
  font: inherit;
  transition: border-color var(--mrj-motion-duration);
}
.mrj-field__input::placeholder {
  color: var(--mrj-color-text-secondary);
  opacity: 1;
}
.mrj-field__input:hover:not(:disabled) {
  border-color: var(--mrj-color-primary-hover);
}
.mrj-field__input:focus-visible {
  outline: var(--mrj-focus-width) solid var(--mrj-color-focus);
  outline-offset: var(--mrj-focus-offset);
}
.mrj-field__input[aria-invalid='true'] {
  border-color: var(--mrj-color-danger);
}
.mrj-field__input:disabled {
  opacity: var(--mrj-disabled-opacity);
  cursor: not-allowed;
}
.mrj-field__help,
.mrj-field__error {
  margin: 0;
  font-size: var(--mrj-font-size-sm);
}
.mrj-field__help {
  color: var(--mrj-color-text-secondary);
}
.mrj-field__error {
  color: var(--mrj-color-danger);
}
</style>
