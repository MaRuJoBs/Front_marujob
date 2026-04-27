<template>
  <footer class="footer">
  <div class="item active">
  <span class="icon">
    <FontAwesomeIcon :icon="['fas', 'house']" />
  </span>
  <p>Início</p>
</div>

<div class="item">
  <span class="icon">
    <FontAwesomeIcon :icon="['fas', 'briefcase']" />
  </span>
  <p>Freelances</p>
</div>

<div class="item">
  <span class="icon">
    <FontAwesomeIcon :icon="['fas', 'message']" />
  </span>
  <p>Mensagens</p>
</div>

<div class="item">
  <span class="icon">
    <FontAwesomeIcon :icon="['fas', 'user']" />
  </span>
  <p>Perfil</p>
</div>
  </footer>
</template>

<script setup>
</script>

<style scoped>
.footer {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);

  width: 100%;
  max-width: 420px;

  height: 85px;
  padding-bottom: env(safe-area-inset-bottom);

  background: #e9e4f5;
  border-radius: 25px 25px 0 0;

  display: flex;
  justify-content: space-around;
  align-items: center;

  box-shadow: 0 -5px 20px rgba(0,0,0,0.1);
  z-index: 999;
}

.item {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  color: #8b7bb5;
}

.icon {
  font-size: 22px;
  margin-bottom: 3px;
}

.item.active {
  color: #5b3cc4;
}
</style>