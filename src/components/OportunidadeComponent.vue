<script setup>
import { ref, onMounted } from 'vue'
import { RouterLink } from 'vue-router'

// const API_URL = 'https://marujob.class.fabricadesoftware.ifc.edu.br'


const jobs = ref([])
const page = ref(1)
const temProximaPagina = ref(false)
const favoritos = ref([])

const buscarFreelances = async () => {

  try {
    
    const res = await fetch(`http://127.0.0.1:8000/api/freelances/?page=${page.value}`)
    const data = await res.json()

   

    jobs.value = [...jobs.value, ...data.results]
    temProximaPagina.value = data.next !== null

    page.value++
    
  } catch (error) {
    console.error('Erro ao buscar freelances:', error)

}
}
onMounted(() => {
  const salvos = localStorage.getItem('favoritos')
  if (salvos) {
    favoritos.value = JSON.parse(salvos)
  }

  buscarFreelances()
})

const toggleFavorito = (job) => {
  const index = favoritos.value.indexOf(job.id)

  if (index === -1) {
    favoritos.value.push(job.id)
  } else {
    favoritos.value.splice(index, 1)
  }

  localStorage.setItem('favoritos', JSON.stringify(favoritos.value))
}
</script>


<template>
  <div class="body">

    <div class="nav">
      <input type="text" placeholder="Buscar oportunidades..." />
      <button>
        <span class="fa-solid fa-filter"></span> Filtros
      </button>
    </div>

    
    <div class="filtro">
      <button class="active">Todas</button>
      <button>Design</button>
      <button>Design</button>
      <button>Design</button>
      <button>Design Gráfico</button>
    </div>

    
    <section
  class="vaga"
  v-for="job in jobs"
  :key="job.id"
>
  <div class="vaga-superior">

    <div style="display:flex; gap:12px;">
      <div>
        <h3>{{ job.titulo }}</h3>
        <p class="tag">{{ job.tag }}</p>
      </div>

    </div>

    <button class="favorito" @click="toggleFavorito(job)">
  <FontAwesomeIcon
    :icon="['fas', 'heart']"
    :class="{ ativo: favoritos.includes(job.id) }"
  />
</button>
  </div>

  <div class="info">
    <p>{{ job.descricao }}</p>
    <p>{{ job.tempo }} horas</p>
  </div>

  <div class="vaga-inferior">

    <RouterLink :to="`/oportunidade/${job.id}`">
      <button class="details">
        Ver detalhes
      </button>
    </RouterLink>

    <span class="preco">
      R$ {{ job.preco }}
    </span>

  </div>
</section>

    <section class="obs">
      <span>
        <span class="fa-solid fa-heart"></span>
        Salve oportunidades em seus favoritos!
      </span>
      <span>›</span>
    </section>
  </div>
</template>

<style scoped>
.body {
  min-height: 100vh;
  padding: 15px;
  font-family: Arial, sans-serif;
  background: linear-gradient(180deg, #cbb6ff, #f5f3ff);
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  box-sizing: border-box;
  padding-bottom: 100px;

}

.nav {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.nav input {
  flex: 1;
  padding: 12px;
  border-radius: 25px;
  border: none;
  background: #f1ecff;
  outline: none;

}

.nav button {
  background: #6c4ad1;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 12px;
  cursor: pointer;
}




.filters {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  justify-content: center;
}

.filters button {
  background: #e9e3ff;
  border: none;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  color: #5a46b5;
  white-space: nowrap;
  cursor: pointer;
}

.filters .active {
  background: #6c4ad1;
  color: white;
  
}

.vaga {
  background: #f7f5ff;
  border-radius: 16px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.vaga-superior {
  display: flex;
  justify-content: space-between;
}



.vaga-superior h3 {
  margin: 0;
  color: #5a46b5;
}

.tag {
  margin: 3px 0 10px;
  color: #888;
  font-size: 14px;
}

.favorito {
  border: none;
  background: none;
  font-size: 22px;
  cursor: pointer;
  padding-top: 2px;
  align-self: flex-start;
  color: #888;
}

.favorito .ativo {
  color: red;
}



.fav.off {
  opacity: 0.5;
}


.info p {
  margin: 3px 0;
  font-size: 13px;
  color: #6b6b6b;
}

.vaga-inferior {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}



.details {
  background: #6c4ad1;
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 20px;
  cursor: pointer;
}

.preco {
  background: #cdcccf;
  padding: 5px 10px;
  border-radius: 20px;
  color: #5a46b5;
  font-weight: bold;
}

.obs {
  background: #ede7ff;
  padding: 12px;
  border-radius: 12px;
  font-size: 13px;
  color: #6c4ad1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}
</style>