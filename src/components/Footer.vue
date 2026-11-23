<script setup>
import { faBell } from '@fortawesome/free-solid-svg-icons'
import IndicadorAvisos from './IndicadorAvisos.vue'
</script>

<template>
  <nav class="footer app-navigation mrj-ui" aria-label="Navegação do freelancer">
    <router-link to="/home" class="item">
      <span class="icon" aria-hidden="true">
        <FontAwesomeIcon :icon="['fas', 'house']" />
      </span>
      <p>Início</p>
    </router-link>

    <router-link to="/freelances" class="item">
      <span class="icon" aria-hidden="true">
        <FontAwesomeIcon :icon="['fas', 'briefcase']" />
      </span>
      <p>Freelances</p>
    </router-link>

    <router-link to="/mensagens" class="item">
      <span class="icon" aria-hidden="true">
        <FontAwesomeIcon :icon="['fas', 'message']" />
      </span>
      <p>Mensagens</p>
      <IndicadorAvisos />
    </router-link>

    <router-link to="/notificacoes" class="item">
      <span class="icon" aria-hidden="true"><FontAwesomeIcon :icon="faBell" /></span>
      <p>Avisos</p>
      <IndicadorAvisos candidaturas />
    </router-link>

    <router-link to="/perfil" class="item">
      <span class="icon" aria-hidden="true">
        <FontAwesomeIcon :icon="['fas', 'user']" />
      </span>
      <p>Perfil</p>
    </router-link>
  </nav>
</template>

<style scoped>
.footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  background: #e9e4f5;
  border-radius: 25px 25px 0 0;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.1);
  z-index: 999;
}
.footer.app-navigation.mrj-ui {
  bottom: var(--mrj-freelancer-footer-offset, 12px);
  width: calc(100% - 24px);
  max-width: calc(26.25rem - 24px);
  height: calc(var(--mrj-freelancer-footer-height, 76px) + env(safe-area-inset-bottom, 0px));
  padding: 7px 10px env(safe-area-inset-bottom, 0px);
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: 22px;
  box-shadow: 0 8px 30px #4c356724;
  background: #eee5f7;
}

.item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  font-size: 12px;
  color: #5c3a8b;
  justify-content: center;
  gap: 2px;
  min-width: 0;
  min-height: var(--mrj-control-height-md);
  padding: 2px 3px;
  border-radius: var(--mrj-radius-sm);
  -webkit-tap-highlight-color: transparent;
}
.item p {
  margin: 0;
  font-size: 10px;
  line-height: 12px;
  font-weight: var(--mrj-font-weight-regular);
}

.icon {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 10px;
  font-size: 17px;
  line-height: 1;
}
.icon svg {
  width: 18px;
  height: 18px;
}

.router-link-active {
  color: var(--mrj-color-primary-active);
}
.item.router-link-active .icon {
  background: var(--mrj-color-secondary-hover);
}
.item.router-link-active p {
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
</style>
