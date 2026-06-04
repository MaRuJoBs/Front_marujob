<script setup>
import { ref, onMounted, computed } from 'vue'


const jobs = ref([])
const page = ref(1)
const totalPages = ref(1)
const temProximaPagina = ref(false)
const buscarJobs = async () => {
  const res = await fetch(`http://127.0.0.1:8000/api/freelances/?page=${page.value}`)
  const data = await res.json()

    console.log("PAGE:", page.value)
  console.log("RESULTS:", data.results)

  jobs.value = [...jobs.value, ...data.results]
  temProximaPagina.value = data.next !== null
}
onMounted(() => {
  buscarJobs()
})

const principais = computed(() => {
  return jobs.value.filter((job) => job.preco >= 50)
})

const limite = ref(3)
const principaisLimitados = computed(() => {
  return principais.value.slice(0, limite.value)
})



const gruposPrincipais = computed(() => {
  const grupos = []

  for (let i = 0; i < principais.value.length; i += 3) {
    grupos.push(principais.value.slice(i, i + 3))
  }

  return grupos
})
const slideAtual = ref(0)
</script>

<template>
  <main class="home">
    <section class="principais">
      <h2>Principais</h2>

      <div v-for="job in principaisLimitados" :key="job.id" class="card">
        <div class="retangulo"></div>

        <div class="info">
          <h3>{{ job.titulo }}</h3>
          <p>{{ job.tag }}</p>

          <div class="preco">
            <span>R${{ job.preco }}</span>
            <p>•</p>
            <p class="horas">{{ job.tempo }} horas</p>
          </div>
        </div>
      </div>
    </section>

    <div class="dots">
      <span class="active"></span>
      <span></span>
      <span></span>
      <span></span>
    </div>

    <section class="mais">
      <h3>Mais oportunidade...</h3>

      <div class="scroll">
        <div class="mini-card" v-for="job in jobs" :key="job.id">
          <h4>{{ job.titulo }}</h4>
          <p>Empresa</p>
          <!--<p>{{ job.empresa }}</p>-->
          <span>R${{ job.preco }}</span>
          <p>{{ job.tempo }} horas</p>
          <button>Ver Detalhes</button>
        </div>
      </div>
      <button 
  v-if="temProximaPagina"
  @click="page++; buscarJobs()"
>
  Ver mais
</button>
    </section>
  </main>
</template>
<style scoped>
body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #ebebeb;
}
main {
  background-color: #e0d1f9;
  border-radius: 60px 60px 0 0;
  margin-top: -85px;
  position: relative;
  z-index: 5;
  height: 100vh;
}
.home {
  padding: 0 16px 16px 16px;
}

/* PRINCIPAIS */

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
.retangulo {
  width: 80px;
  height: 80px;
  background-color: #939292;
  border-radius: 10px;
  margin: 0;
}
.card {
  background: #d8d2e6;
  border-radius: 12px;
  padding: 25px 12px 25px 12px;
  margin-top: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
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
.arrow {
  margin-left: auto;
  font-size: 50px;
  color: #5b3cc4;
}

/* DOTS */
.dots {
  text-align: center;
  margin: 10px 0;
}

.dots span {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin: 3px;
  background: #bbb;
  border-radius: 50%;
}

.dots .active {
  background: #5b3cc4;
}

/* MAIS OPORTUNIDADES */
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
  -webkit-overflow-scrolling: touch;
}

.mini-card {
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
  margin: 15px auto 0 auto; /* 🔥 isso centraliza */
  display: block; /* 🔥 importante */
}
</style>
