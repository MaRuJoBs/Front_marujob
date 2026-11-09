<script setup>
import '../../styles/tokens.css'

defineProps({ elevated: Boolean })
</script>

<template>
  <div class="mrj-ui mrj-card" :class="{ 'mrj-card--elevated': elevated }">
    <slot name="header" />
    <slot />
    <slot name="footer" />
  </div>
</template>

<style scoped>
.mrj-card {
  box-sizing: border-box;
  display: grid;
  gap: var(--mrj-space-4);
  min-width: 0;
  max-width: 100%;
  padding: var(--mrj-space-4);
  border: var(--mrj-border-width) solid var(--mrj-color-border-subtle);
  border-radius: var(--mrj-radius-md);
  background: var(--mrj-color-surface);
  color: var(--mrj-color-text);
  font-family: var(--mrj-font-family);
  font-size: var(--mrj-font-size-md);
  line-height: var(--mrj-line-height);
  overflow-wrap: anywhere;
}
.mrj-card--elevated {
  box-shadow: var(--mrj-shadow-card);
}
@media (min-width: 48rem) {
  .mrj-card {
    padding: var(--mrj-space-6);
  }
}
</style>
