<script setup>
import { sessao } from '@/services/authService'
</script>

<template>
  <header class="header mrj-ui">
    <!-- <div class="desfoque"></div> -->
    <img src="@/assets/images/logo.png" class="logo-top" alt="MaRuJoB's" />

    <router-link
      v-if="sessao.tipo === 'usuario'"
      to="/favoritos"
      class="favorito"
      aria-label="Favoritos"
    >
      <FontAwesomeIcon :icon="['fas', 'heart']" />
    </router-link>

    <div class="titulo">
      <img src="@/assets/images/slogan.png" class="slogan" alt="MaRuJoB's Freelances" />
    </div>
  </header>
</template>

<style scoped>
.header {
  width: 100%;
  height: 33vh;
  position: relative;
  background: url('@/assets/images/fundo.png') no-repeat center top;
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* .desfoque {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(123, 92, 255, 0.25),
    rgba(255, 255, 255, 0.1)
  );
  backdrop-filter: blur(2px);
} */

.logo-top {
  position: absolute;
  top: -3px;
  left: -7px;
  width: 100px;
  z-index: 3;
  animation: fadeDown 0.8s ease;
}

.favorito {
  position: absolute;
  top: 18px;
  right: 20px;
  font-size: 32px;
  z-index: 3;
  text-decoration: none;
  display: grid;
  place-items: center;
  min-width: var(--mrj-control-height-md);
  min-height: var(--mrj-control-height-md);
}

.titulo {
  width: 100%;
  min-width: 0;
  text-align: center;
  z-index: 2;

  animation: fadeUp 1s ease;
}

.slogan {
  width: min(100%, 370px);
  margin-top: min(10vw, 42px);
  margin-inline: auto;
  opacity: 0.95;
}

.favorito:focus-visible {
  outline: var(--mrj-focus-width) solid var(--mrj-color-focus);
  outline-offset: var(--mrj-focus-offset);
  border-radius: var(--mrj-radius-sm);
}
</style>
