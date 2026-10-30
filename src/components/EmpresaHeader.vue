<script setup>
defineProps({ voltar: { type: Boolean, default: false } })
</script>

<template>
  <header class="empresa-header">
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
  </header>
</template>

<style scoped>
.empresa-header {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 92px;
  padding: 14px 20px;
  background: #be98f3 url('@/assets/images/fundo.png') center 36% / cover;
  border-bottom: 1px solid #c4a6e8;
}
.marca {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
  text-decoration: none;
  color: #713ce0;
}
.marca img {
  width: 56px;
  height: 56px;
  object-fit: contain;
}
.marca > span {
  font-size: 27px;
  line-height: 1;
  font-weight: 800;
  letter-spacing: -1.3px;
}
.marca small {
  display: block;
  margin-top: 6px;
  text-align: center;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 4px;
}
.voltar {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: #f8f1ff;
  color: #6d45a8;
  text-decoration: none;
}
a:focus-visible {
  outline: 3px solid #4e268b;
  outline-offset: 3px;
}
@media (max-width: 359px) {
  .empresa-header {
    padding-inline: 12px;
  }
  .marca > span {
    font-size: 23px;
  }
  .marca img {
    width: 46px;
    height: 46px;
  }
}
</style>
