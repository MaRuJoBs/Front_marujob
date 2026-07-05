<script setup>
import { ref, onMounted, computed } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
const API_URL = 'https://marujob.class.fabricadesoftware.ifc.edu.br'


const jobs = ref([])
const favoritos = ref([])

const toggleFavorito = (job) => {
  if (favoritos.value.includes(job.id)) {
    favoritos.value = favoritos.value.filter(id => id !== job.id)
  } else {
    favoritos.value.push(job.id)
  }

  localStorage.setItem('favoritos', JSON.stringify(favoritos.value))
}

onMounted(async () => {
  const salvos = localStorage.getItem('favoritos')
  favoritos.value = salvos ? JSON.parse(salvos) : []

  const res = await fetch('http://127.0.0.1:8000/api/freelances/')
  const data = await res.json()

  jobs.value = data.results
})
const favoritosFiltrados = computed(() =>
  jobs.value.filter(job => favoritos.value.includes(job.id))
)
</script>

<template>
  <div class="body">
    <div class="header">
      <div class="title">

        <FontAwesomeIcon
          :icon="['fas', 'heart']"
        />
        <span>Favoritos</span>

      </div>
      <button class="btn-deletar">
        <FontAwesomeIcon
          :icon="['fas', 'trash']"
        />
      </button>
    </div>

    
    <section
  class="bloco-vaga"
  v-for="job in favoritosFiltrados"
  :key="job.id"
>
      <div class="parte-superior">
        <div>
          <h3>{{ job.titulo }}</h3>
<p class="company">{{ job.tag }}</p>
        </div>

        <button class="fav" @click="toggleFavorito(job)">
  <FontAwesomeIcon :icon="['fas', 'heart']" />
</button>
      </div>

      <div class="divisao"></div>

      <div class="info">
        <p>
  <FontAwesomeIcon :icon="['fas', 'briefcase']" />
  {{ job.tempo }} horas
</p>

<p>
  <FontAwesomeIcon :icon="['fas', 'briefcase']" />
  Freelancer
</p>
      </div>

      <div class="parte-inferior">
        <button class="details">
          Ver detalhes
        </button>

        <span class="price">
  R$ {{ job.preco }}
</span>
      </div>
    </section>
  </div>
</template>

<style scoped>
.body {
  min-height: 100vh;
  padding: 20px;
  font-family: Arial, sans-serif;
  background: linear-gradient(180deg, #cbb6ff, #f5f3ff);
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  box-sizing: border-box;
  padding-bottom: 25vh;
}

.header {
  background: #f4f1ff;
  border-radius: 22px;
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}

.title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #6b4bc4;
  font-size: 18px;
  
}

.title svg {
  font-size: 22px;
  color: #8b5cf6;
}

.btn-deletar {
  border: none;
  background: transparent;
  color: #8a69d4;
  font-size: 22px;
  cursor: pointer;
}


.bloco-vaga {
  background: #f7f5ff;
  border-radius: 16px;
  margin-bottom: 18px;
  overflow: hidden;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
}


.parte-superior {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px 15px 10px;
}

.parte-superior h3 {
  margin: 0;
  color: #5637b4;
  font-size: 18px;
}

.company {
  margin-top: 5px;
  color: #7d72a7;
  font-size: 16px;
}

.fav {
  border: none;
  background: transparent;
  cursor: pointer;
}

.fav svg {
  color: red;
  font-size: 26px;
}

.divisao {
  height: 1px;
  background: #cfc7e8;
}

.info {
  padding: 12px 15px 5px;
}

.info p {
  margin: 8px 0;
  color: #6d5b9d;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info svg {
  color: #6546c2;
}

.parte-inferior {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 15px 18px;
  justify-content: space-between;
}

.details {
  background: #6b4bc4;
  color: white;
  border: none;
  padding: 10px 35px;
  border-radius: 25px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
}


.price {
  position: absolute;
  right: 15px;
  background: #f4f1ff;
  border: 2px solid #cfc7e8;
  padding: 7px 15px;
  border-radius: 20px;
  color: #5637b4;
  font-size: 16px;
  font-weight: bold;
}
</style>