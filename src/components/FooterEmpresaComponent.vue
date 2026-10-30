<script setup>
import { useRouter } from 'vue-router'
import { logout } from '@/services/authService'

const router = useRouter()
const sair = () => {
  logout()
  router.replace('/')
}
</script>

<template>
  <footer class="footer">
    <router-link to="/homeEmpresa" class="item">
      <span class="icon">
        <FontAwesomeIcon :icon="['fas', 'house']" />
      </span>
      <p>Início</p>
    </router-link>

    <router-link to="/mensagens" class="item">
      <span class="icon">
        <FontAwesomeIcon :icon="['fas', 'message']" />
      </span>
      <p>Mensagens</p>
    </router-link>

    <router-link to="/trocar-senha" class="item">
      <span class="icon">
        <FontAwesomeIcon :icon="['fas', 'lock']" />
      </span>
      <p>Alterar senha</p>
    </router-link>

    <button type="button" class="item" @click="sair">
      <span class="icon"
        ><svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          aria-hidden="true"
        >
          <path d="M10 4H4v16h6M9 12h12m-5-5 5 5-5 5" /></svg
      ></span>
      <p>Sair</p>
    </button>
  </footer>
</template>

<style scoped>
.footer {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: min(100%, 420px);
  min-height: 76px;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  /* padding-bottom: env(safe-area-inset-bottom); */
  background: #cbbcd9;
  border-radius: 25px 25px 0 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.1);
  z-index: 999;
}

.item {
  border: 0;
  background: transparent;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-decoration: none;
  font-size: 12px;
  color: #65517f;
  min-width: 44px;
  min-height: 48px;
  justify-content: center;
}

.icon {
  font-size: 22px;
  margin-bottom: 3px;
}

.router-link-active {
  color: #31168a;
}

.item:focus-visible {
  outline: 3px solid #63369e;
  outline-offset: 3px;
  border-radius: 8px;
}
</style>
