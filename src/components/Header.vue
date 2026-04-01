<template>
  <header class="header">

    <div class="overlay"></div>

    <img src="@/assets/images/logo.png" class="logo-top" />

    <div class="brand"> 
      <img src="@/assets/images/slogan.png" class="slogan" />
    </div>

  </header>
</template>

<script setup>
</script>

<style scoped>
.header {
  width: 100%;
  height: 300px;
  position: relative;
  overflow: hidden;

  background: url('@/assets/images/fundo.png') no-repeat center top;
  background-size: cover;

  display: flex;
  align-items: center;
  justify-content: center;
}

.overlay {
  position: absolute;
  width: 100%;
  height: 100%;

  background: linear-gradient(
    to bottom,
    rgba(123, 92, 255, 0.25),
    rgba(255, 255, 255, 0.1)
  );

  backdrop-filter: blur(2px);
}

.logo-top {
  position: absolute;
  top: 20px;
  left: 20px;
  width: 48px;
  z-index: 2;

  animation: fadeDown 0.8s ease;
}

.brand {
  text-align: center;
  z-index: 2;

  animation: fadeUp 1s ease;
}

.title {
  font-family: 'Poppins', sans-serif;
  font-size: 34px;
  font-weight: 700;
  color: #6c4bbd;

  text-shadow: 0px 6px 15px rgba(0,0,0,0.2);
}

.slogan {
  margin-top: 10px;
  width: 190px;
  opacity: 0.95;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(25px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeDown {
  from {
    opacity: 0;
    transform: translateY(-25px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 400px) {
  .title {
    font-size: 28px;
  }

  .slogan {
    width: 150px;
  }
}
</style>