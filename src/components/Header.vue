<script setup>
const API_URL = 'https://marujob.class.fabricadesoftware.ifc.edu.br'
</script>

<template>
  <header class="header">
    <!-- <div class="desfoque"></div> -->
    <img src="@/assets/images/logo.png" class="logo-top" />

    <router-link to="/favoritos" class="favorito">
    <FontAwesomeIcon :icon="['fas', 'heart']" />
    </router-link>

    <div class="titulo"> 
      <img src="@/assets/images/slogan.png" class="slogan" />
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
}

.titulo {
  text-align: center;
  z-index: 2;

  animation: fadeUp 1s ease;
}

.slogan {
  margin-top: 10vw;
  width: 370px;
  opacity: 0.95;
}

</style>