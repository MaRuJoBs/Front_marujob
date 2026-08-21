<script setup>
import { ref, onMounted, computed } from 'vue'

const API_URL = 'https://marujob.class.fabricadesoftware.ifc.edu.br'

const jobs = ref([])
const page = ref(1)
const temProximaPagina = ref(false)
const totalFreelances = ref(0)
const slideAtual = ref(0)
const slideContainer = ref(null)

const buscarJobs = async () => {
  try {
    const res = await fetch(`${API_URL}/api/freelances/?page=${page.value}`)
    const data = await res.json()

    jobs.value = [...jobs.value, ...data.results]
    totalFreelances.value = data.count
    temProximaPagina.value = data.next !== null
    page.value++
  } catch (error) {
    console.error('Erro ao buscar freelances:', error)
  }
}

onMounted(() => {
  buscarJobs()
})

const trabalhosMaisPagam = computed(() => {
  return [...jobs.value]
    .sort((a, b) => Number(b.preco) - Number(a.preco))
    .slice(0, 6)
})

const slides = computed(() => {
  const resultado = []

  for (let i = 0; i < trabalhosMaisPagam.value.length; i += 2) {
    resultado.push(trabalhosMaisPagam.value.slice(i, i + 2))
  }

  return resultado.slice(0, 3)
})

const jobsHome = computed(() => {
  return jobs.value.slice(0, 6)
})

const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return path
}

const atualizarSlide = () => {
  if (!slideContainer.value) return

  const largura = slideContainer.value.clientWidth
  slideAtual.value = Math.round(
    slideContainer.value.scrollLeft / largura
  )
}
</script>

<template>
  <main class="home">
    <section class="principais">
      <h2>Principais</h2>

      <div class="subtitulo">
        <strong>Encontre a oportunidade certa para você</strong>
        <span>Os trabalhos que oferecem os melhores valores.</span>
      </div>

      <div
        ref="slideContainer"
        class="slide-scroll"
        @scroll="atualizarSlide"
      >
        <div
          v-for="(slide, index) in slides"
          :key="index"
          class="slide"
        >
          <router-link
            v-for="job in slide"
            :key="job.id"
            :to="`/oportunidade/${job.id}`"
            class="card"
          >
            <div class="imagem">
              <img
                v-if="job.foto"
                :src="getImageUrl(job.foto)"
                class="avatar"
              />

              <div class="selo" v-if="job.preco >= 2500">
                ★ Destaque
              </div>
            </div>

            <div class="info">
              <h3>{{ job.titulo }}</h3>
              <p>{{ job.tag }}</p>

              <div class="preco">
                <span>R$ {{ job.preco }}</span>
                <p>•</p>
                <p class="horas">{{ job.tempo }} horas</p>
              </div>
            </div>

            <div class="seta-card">›</div>
          </router-link>
        </div>
      </div>

      <div class="pontos-rolagem" v-if="slides.length > 1">
        <span
          v-for="(_, index) in slides"
          :key="index"
          :class="{ active: index === slideAtual }"
        ></span>
      </div>
    </section>

    <div class="chamada">
      <strong>Seu próximo trabalho pode estar aqui.</strong>
      <span>Encontre oportunidades, mostre seu talento e comece hoje.</span>
    </div>

    <section class="mais">
      <div class="titulo-mais">
        <div>
          <h3>Mais oportunidades</h3>
          <span class="contador">
            {{ totalFreelances }}
            {{ totalFreelances === 1 ? 'oportunidade' : 'oportunidades' }}
            para explorar
          </span>
        </div>
      </div>

      <div class="grid-oportunidades">
        <div
          class="mini-card"
          v-for="job in jobsHome"
          :key="job.id"
        >
          <h4>{{ job.titulo }}</h4>
          <p>Empresa</p>
          <span>R$ {{ job.preco }}</span>
          <p>{{ job.tempo }} horas</p>

          <router-link :to="`/oportunidade/${job.id}`">
            <button>Ver detalhes</button>
          </router-link>
        </div>
      </div>

      <router-link to="/freelances" class="link-todos">
        <button class="btn-mais">Ver todos</button>
      </router-link>
    </section>
  </main>
</template>

<style scoped>
main {
  background: #eee8fa;
  border-radius: 42px 42px 0 0;
  margin-top: -70px;
  position: relative;
  z-index: 5;
  min-height: 100vh;
}

.home {
  padding: 0 18px 100px;
}

.principais h2 {
  width: fit-content;
  min-width: 150px;
  color: white;
  background: #5b3cc4;
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  padding: 9px 24px;
  border-radius: 0 0 14px 14px;
  margin: 0 auto 14px;
  box-shadow: 0 3px 10px rgba(91, 60, 196, 0.2);
}

.subtitulo {
  text-align: center;
  margin: 0 auto 16px;
  padding: 0 8px;
}

.subtitulo strong {
  display: block;
  color: #49357b;
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 3px;
}

.subtitulo span {
  display: block;
  color: #817a91;
  font-size: 12px;
}

.slide-scroll {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  gap: 18px;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.slide-scroll::-webkit-scrollbar {
  display: none;
}

.slide {
  width: 100%;
  min-width: 100%;
  flex-shrink: 0;
  scroll-snap-align: center;
}

.card {
  background: #fff;
  border-radius: 20px;
  padding: 12px;
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 14px;
  text-decoration: none;
  box-shadow: 0 6px 18px rgba(72, 48, 120, 0.09);
  border: 1px solid rgba(91, 60, 196, 0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:active {
  transform: scale(0.97);
  box-shadow: 0 2px 8px rgba(72, 48, 120, 0.08);
}

.imagem {
  width: 76px;
  height: 76px;
  min-width: 76px;
  background: #d8d1e8;
  border-radius: 14px;
  overflow: hidden;
  position: relative;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.selo {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(91, 60, 196, 0.92);
  color: white;
  text-align: center;
  font-size: 8px;
  font-weight: 700;
  padding: 4px 2px;
}

.info {
  min-width: 0;
  flex: 1;
}

.card h3 {
  margin: 0 0 5px;
  font-size: 17px;
  font-weight: 700;
  color: #49357b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card p {
  margin: 2px 0;
  color: #817a91;
  font-size: 13px;
}

.preco {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 8px;
}

.card span {
  font-size: 14px;
  font-weight: 700;
  color: #5b3cc4;
}

.card .horas {
  font-size: 13px;
  color: #817a91;
}

.seta-card {
  width: 28px;
  height: 28px;
  min-width: 28px;
  border-radius: 50%;
  background: #f0ebfa;
  color: #5b3cc4;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 23px;
  line-height: 28px;
  padding: 0 0 7px;
  box-sizing: border-box;
}

.pontos-rolagem {
  text-align: center;
  margin: 13px 0 20px;
}

.pontos-rolagem span {
  display: inline-block;
  width: 7px;
  height: 7px;
  margin: 3px;
  background: #c9c2d8;
  border-radius: 50%;
  transition: 0.2s ease;
}

.pontos-rolagem .active {
  width: 18px;
  border-radius: 10px;
  background: #5b3cc4;
}

.chamada {
  text-align: center;
  padding: 15px 12px 18px;
  margin: 0 0 4px;
}

.chamada strong {
  display: block;
  color: #49357b;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 4px;
}

.chamada span {
  display: block;
  color: #817a91;
  font-size: 12px;
}

.titulo-mais {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 12px;
}

.mais h3 {
  margin: 0;
  color: #49357b;
  font-size: 17px;
  font-weight: 700;
}

.contador {
  display: block;
  margin-top: 3px;
  color: #817a91;
  font-size: 11px;
}

.grid-oportunidades {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.mini-card {
  background: #fff;
  border-radius: 15px;
  padding: 12px;
  min-width: 0;
  height: 175px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 4px 14px rgba(72, 48, 120, 0.08);
  box-sizing: border-box;
}

.mini-card h4 {
  margin: 0;
  color: #49357b;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-card p {
  margin: 3px 0;
  font-size: 11px;
  color: #817a91;
}

.mini-card span {
  font-size: 15px;
  font-weight: 700;
  color: #5b3cc4;
}

.mini-card button {
  width: 100%;
  border: none;
  background: #5b3cc4;
  color: white;
  border-radius: 9px;
  padding: 7px 4px;
  margin-top: 5px;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
}

.link-todos {
  text-decoration: none;
}

.btn-mais {
  background: #5b3cc4;
  color: white;
  border-radius: 12px;
  padding: 10px 24px;
  margin: 24px auto 0;
  display: block;
  border: none;
  font-size: 14px;
  font-weight: 600;
  box-shadow: 0 4px 10px rgba(91, 60, 196, 0.2);
  cursor: pointer;
}
</style>