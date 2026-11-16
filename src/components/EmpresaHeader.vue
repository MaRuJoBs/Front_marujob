<script setup>
defineProps({ voltar: { type: Boolean, default: false } })
</script>

<template>
  <header class="empresa-header mrj-ui">
    <router-link v-if="voltar" to="/homeEmpresa" class="voltar" aria-label="Voltar ao início">
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path d="m14 6-6 6 6 6" />
      </svg>
    </router-link>
    <router-link to="/homeEmpresa" class="marca" aria-label="MaRuJoB's — início da empresa">
      <img src="@/assets/images/logo.png" alt="" />
      <span>MaRuJoB's<small>EMPRESAS</small></span>
    </router-link>
    <router-link
      to="/empresa/notificacoes"
      class="notificacoes"
      aria-label="Notificações de candidaturas"
      title="Notificações de candidaturas"
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />
      </svg>
    </router-link>
  </header>
</template>

<style scoped>
.empresa-header {
  display: flex;
  align-items: center;
  gap: var(--mrj-space-2);
  min-height: 76px;
  padding: 10px 16px;
  background: var(--mrj-color-secondary) url('@/assets/images/fundo.png') center 36% / cover;
  border-bottom: 1px solid var(--mrj-color-border-subtle);
  font-family: var(--mrj-font-family);
}
.marca {
  display: inline-flex;
  align-items: center;
  gap: var(--mrj-space-1);
  min-width: 0;
  min-height: 44px;
  text-decoration: none;
  color: var(--mrj-color-primary);
}
.marca img {
  width: 44px;
  height: 44px;
  object-fit: contain;
}
.marca > span {
  font-size: 25px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: -1px;
}
.marca small {
  display: block;
  margin-top: 5px;
  text-align: center;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 3px;
}
.voltar,
.notificacoes {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: var(--mrj-radius-pill);
  background: var(--mrj-color-surface);
  color: var(--mrj-color-primary);
  text-decoration: none;
}
.notificacoes {
  margin-left: auto;
}
.notificacoes.router-link-active {
  background: var(--mrj-color-primary);
  color: var(--mrj-color-on-primary);
}
a:focus-visible {
  outline: 3px solid var(--mrj-color-focus);
  outline-offset: 3px;
}
@media (max-width: 359px) {
  .empresa-header {
    padding-inline: 12px;
    gap: 4px;
  }
  .marca > span {
    font-size: 21px;
  }
  .marca img {
    width: 36px;
    height: 36px;
  }
}
</style>
