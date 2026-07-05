<script setup>
import { ref, onMounted, computed } from 'vue'


// const API_URL = 'https://marujob.class.fabricadesoftware.ifc.edu.br'

const jobs = ref([])
const page = ref(1)
// const user = ref(null)

const temProximaPagina = ref(false)

const buscarJobs = async () => {

  try {
    // const res = await fetch(`${API_URL}/api/freelances/?page=${page.value}`)
    const res = await fetch(`http://127.0.0.1:8000/api/freelances/?page=${page.value}`)
    const data = await res.json()

   

    jobs.value = [...jobs.value, ...data.results]
    temProximaPagina.value = data.next !== null

    page.value++
    // if (data.count) {
    //   totalPages.value = Math.ceil(data.count / data.results.length)
    // }
  } catch (error) {
    console.error('Erro ao buscar freelances:', error)

}
}

onMounted(() => {
  buscarJobs()
})

const principais = computed(() => {
  return jobs.value.filter((job) => job.preco >= 2500)
})

const jobsHome = computed(() => {
  return jobs.value.slice(0, 20)
})

const limite = ref(3)

const principaisLimitados = computed(() => {
  return principais.value.slice(0, limite.value)
})


// const gruposPrincipais = computed(() => {
//   const grupos = []

//   for (let i = 0; i < principais.value.length; i += 3) {
//     grupos.push(principais.value.slice(i, i + 3))
//   }
//   return grupos
// })

const grupos = computed(() => {
  const resultado = []

  for (let i = 0; i < jobsHome.value.length; i += 10) {
    resultado.push(jobsHome.value.slice(i, i + 10))

  }
  return resultado
})


// const slideAtual = ref(0)

const getImageUrl = (path) => {
  if (!path) return null

  if (path.startsWith('http')) return path

  return `${path}`
}

</script>

<template>
  <main class="home">
    <section class="principais">
      <h2>Principais</h2>

      <router-link
        v-for="job in principaisLimitados"
        :key="job.id"
        :to="`/oportunidade/${job.id}`"
        class="card"
      >
        <div class="imagem">
          <img :src="getImageUrl(job.foto)" class="avatar" />
        </div>

        <div class="info">
          <h3>{{ job.titulo }}</h3>
          <p>{{ job.tag }}</p>

          <div class="preco">
            <span>R${{ job.preco }}</span>
            <p>•</p>
            <p class="horas">{{ job.tempo }} horas</p>
          </div>
        </div>
      </router-link>
    </section>

    <div class="pontos-rolagem">
      <span class="active"></span>
      <span></span>
      <span></span>
      <span></span>
    </div>

    <section class="mais">
      <h3>Mais oportunidade...</h3>

      <div class="scroll" v-for="(grupo, index) in grupos" :key="index">
        <div class="mini-card" v-for="job in grupo" :key="job.id">
          <h4>{{ job.titulo }}</h4>
          <p>Empresa</p>
          <span>R${{ job.preco }}</span>
          <p>{{ job.tempo }} horas</p>

          <router-link :to="`/oportunidade/${job.id}`">
            <button>Ver detalhes</button>
          </router-link>
        </div>
      </div>

      <router-link to="/freelances">
        <button class="btn-mais">Ver todos</button>
      </router-link>
    </section>
  </main>
</template>

<style scoped>
main {
  background-color: #e0d1f9;
  border-radius: 60px 60px 0 0;
  margin-top: -95px;
  position: relative;
  z-index: 5;
 
}
.home {
  padding: 0 16px 16px 16px;
  padding-bottom: 25vh;
}

.principais h2 {
  color: rgb(226, 205, 205);
  background: #5b3cc4;
  text-align: center;
  max-width: 190px;
  font-size: 22px;
  padding: 5px 18px;
  border-radius: 0 0 10px 10px;
  margin: 0 auto;
}
.imagem {
  width: 80px;
  height: 80px;
  background-color: #939292;
  border-radius: 10px;
  margin: 0;
}
.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 10px;
}
.card {
  background: #d8d2e6;
  border-radius: 12px;
  padding: 25px 12px 25px 12px;
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}

.card h3 {
  margin: 0;
  font-size: 20px;
  color: #543b91;
}

.card p {
  margin: 2px 0;
  color: #777;
  font-size: 15px;
}
div.preco {
  display: flex;
  align-items: center;
  gap: 8px;
}
.card span {
  font-size: 15px;
  color: #543b91;
}
.card .horas {
  font-size: 15px;
  color: #777;
}

.pontos-rolagem {
  text-align: center;
  margin: 10px 0;
}

.pontos-rolagem span {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin: 3px;
  background: #bbb;
  border-radius: 50%;
}

.pontos-rolagem .active {
  background: #5b3cc4;
}

.mais h3 {
  margin: 8px 0;
  color: #49357b;
  font-size: 15px;
}

.scroll {
  display: flex;
  overflow-x: auto;
  gap: 10px;
  scroll-snap-type: x mandatory;
  /* -webkit-overflow-scrolling: touch; */
  margin-bottom: 10px;
}

.mini-card {
  scroll-snap-align: start;
  background: #fff;
  border-radius: 10px;
  padding: 20px 15px 20px 12px;
  color: #49357b;
  width: 150px;
  height: 210px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  /* margin-bottom: 10px; */
}

.mini-card span {
  font-size: 18px;
  color: #49357b;
}

.mini-card h4 {
  font-size: 20px;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 2.4em;
}

.mini-card p {
  margin: 4px 0;
  font-size: 15px;
  color: #766a94;
}

.mini-card button {
  border: none;
  background: #5b3cc4;
  color: white;
  border-radius: 15px;
  padding: 8px 16px;
  margin: 15px auto 0 auto;
  display: block;
}
.btn-mais {
  background: #5b3cc4;
  color: white;
  border-radius: 15px;
  padding: 8px 16px;
  margin: 50px auto 0 auto;
  display: block;
  border: none;
}
</style>
