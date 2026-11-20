<script setup>
import { useRoute, useRouter } from 'vue-router'
import { logout } from '@/services/authService'
import { faBuilding, faUsers } from '@fortawesome/free-solid-svg-icons'

const router = useRouter()
const route = useRoute()
const sair = () => {
  logout()
  router.replace('/')
}
</script>

<template>
  <nav class="footer app-navigation mrj-ui" aria-label="Navegação da empresa">
    <router-link to="/homeEmpresa" class="item">
      <span class="icon" aria-hidden="true">
        <FontAwesomeIcon :icon="['fas', 'house']" />
      </span>
      <span class="label">Início</span>
    </router-link>

    <router-link
      to="/empresa/freelancers"
      class="item"
      :class="{ 'router-link-active': route.name === 'perfil-publico-freelancer' }"
    >
      <span class="icon" aria-hidden="true">
        <FontAwesomeIcon :icon="faUsers" />
      </span>
      <span class="label">Freelancers</span>
    </router-link>

    <router-link to="/mensagens" class="item">
      <span class="icon" aria-hidden="true">
        <FontAwesomeIcon :icon="['fas', 'message']" />
      </span>
      <span class="label">Mensagens</span>
    </router-link>

    <router-link to="/empresa/perfil" class="item">
      <span class="icon" aria-hidden="true">
        <FontAwesomeIcon :icon="faBuilding" />
      </span>
      <span class="label">Perfil</span>
    </router-link>

    <button type="button" class="item" @click="sair">
      <span class="icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M10 4H4v16h6M9 12h12m-5-5 5 5-5 5" />
        </svg>
      </span>
      <span class="label">Sair</span>
    </button>
  </nav>
</template>

<style scoped>
.footer.app-navigation.mrj-ui {
  bottom: 12px;
  width: calc(100% - 24px);
  max-width: calc(26.25rem - 24px);
  border-bottom: 1px solid var(--mrj-color-border-subtle);
  border-radius: 22px;
  box-shadow: 0 8px 30px #4c356724;
  background: #eee5f7;
}
.footer {
  position: fixed;
  bottom: 0;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  align-items: center;
  padding: 7px 10px 5px;
  background: var(--mrj-color-secondary);
  border: 1px solid var(--mrj-color-border-subtle);
  border-bottom: 0;
  border-radius: 16px 16px 0 0;
  box-shadow: 0 -3px 12px #4c35670d;
  z-index: 999;
}

.item {
  border: 0;
  background: transparent;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  text-decoration: none;
  color: #5c3a8b;
  font: inherit;
  min-width: 0;
  min-height: var(--mrj-control-height-md);
  padding: 2px 3px;
  border-radius: var(--mrj-radius-sm);
  -webkit-tap-highlight-color: transparent;
}

.icon {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 10px;
  font-size: 17px;
  line-height: 1;
  transition:
    color var(--mrj-motion-duration) ease,
    background-color var(--mrj-motion-duration) ease;
}

.icon svg {
  width: 18px;
  height: 18px;
}

.label {
  max-width: 100%;
  color: inherit;
  font-size: 10px;
  font-weight: var(--mrj-font-weight-regular);
  line-height: 12px;
  white-space: nowrap;
}

.item.router-link-active {
  color: var(--mrj-color-primary-active);
}

.item.router-link-active .icon {
  background: var(--mrj-color-secondary-hover);
}

.item.router-link-active .label {
  font-weight: var(--mrj-font-weight-semibold);
}

.item:hover:not(.router-link-active) {
  color: var(--mrj-color-text);
  background: #ffffff55;
}

.item:focus-visible {
  outline: var(--mrj-focus-width) solid var(--mrj-color-focus);
  outline-offset: -1px;
}

@media (max-width: 359px) {
  .footer {
    padding-inline: 6px;
  }
}
</style>
