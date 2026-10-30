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
      <span class="icon"><i class="fa-solid fa-right-from-bracket"></i></span>
      <p>Sair</p>
    </button>
  </footer>
</template>

<style scoped>
.footer {
  position: fixed;
  bottom: 0;
  /* left: 50%;
  transform: translateX(-50%); */
  width: min(100%, 420px);
  min-height: 85px;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  /* padding-bottom: env(safe-area-inset-bottom); */
  background: #e9e4f5;
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
  color: #8b7bb5;
}

.icon {
  font-size: 22px;
  margin-bottom: 3px;
}

.router-link-active {
  color: #31168a;
}
</style>
