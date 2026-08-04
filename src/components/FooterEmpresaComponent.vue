<script setup>
const API_URL = 'https://marujob.class.fabricadesoftware.ifc.edu.br'
</script>

<template>
  <footer class="footer">

    <router-link to="" class="item">
      <span class="icon">
        <FontAwesomeIcon :icon="['fas', 'house']" />
      </span>
      <p>Início</p>
    </router-link>

    <router-link to="" class="item">
      <span class="icon">
        <FontAwesomeIcon :icon="['fas', 'briefcase']" />
      </span>
      <p>Vagas Disponiveis</p>
    </router-link>

    <router-link to="" class="item">
        <span class="icon">
            <FontAwesomeIcon :icon="['fas', 'people-group']" />
        </span>
        <p>Freelancers</p>
    </router-link>
    
    <router-link to="" class="item">
      <span class="icon">
        <FontAwesomeIcon :icon="['fas', 'message']" />
      </span>
      <p>Mensagens</p>
    </router-link>

    <router-link to="" class="item">
      <span class="icon">
        <FontAwesomeIcon :icon="['fas', 'building']" />
      </span>
      <p>Empresa</p>
    </router-link>

  </footer>
</template>





<style scoped>
.footer {
  position: fixed;
  bottom: 0;
  /* left: 50%;
  transform: translateX(-50%); */
  width: 420px; 
  height: 85px;
  /* padding-bottom: env(safe-area-inset-bottom); */
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