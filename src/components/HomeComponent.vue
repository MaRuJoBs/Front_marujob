<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { listarOportunidades } from '@/services/freelanceService'
import { erroOportunidades, formatarPreco } from '@/utils/oportunidades'
import FavoritoButton from '@/components/FavoritoButton.vue'
import { useFavoritosLocais } from '@/composables/useFavoritosLocais'

const { erroFavorito } = useFavoritosLocais()

const jobs = ref([])
const page = ref(1)
const temProximaPagina = ref(false)
const totalFreelances = ref(0)
const slideAtual = ref(0)
const slideContainer = ref(null)
const mostrarAvisoSenha = ref(false)
const carregandoJobs = ref(false)
const erroJobs = ref('')
let controlador
let observadorEntrada

const vRevelar = {
  mounted(elemento) {
    if (
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    )
      return

    observadorEntrada ??= new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (!entrada.isIntersecting) continue
          entrada.target.classList.remove('revelar-pendente')
          entrada.target.classList.add('revelar-visivel')
          observadorEntrada.unobserve(entrada.target)
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -24px 0px' },
    )
    elemento.classList.add('revelar-pendente')
    observadorEntrada.observe(elemento)
  },
  unmounted(elemento) {
    observadorEntrada?.unobserve(elemento)
  },
}

const buscarJobs = async () => {
  if (carregandoJobs.value) return
  controlador = new AbortController()
  carregandoJobs.value = true
  erroJobs.value = ''
  try {
    const data = await listarOportunidades({ page: page.value }, controlador.signal)
    if (controlador.signal.aborted) return

    jobs.value = [...jobs.value, ...data.results]
    totalFreelances.value = data.count
    temProximaPagina.value = data.next !== null
    page.value++
  } catch (error) {
    if (!controlador.signal.aborted) erroJobs.value = erroOportunidades(error)
  } finally {
    if (!controlador.signal.aborted) carregandoJobs.value = false
  }
}

onBeforeUnmount(() => {
  controlador?.abort()
  observadorEntrada?.disconnect()
})

onMounted(() => {
  buscarJobs()

  mostrarAvisoSenha.value = localStorage.getItem('precisa_definir_senha') === 'true'
})

const trabalhosMaisPagam = computed(() => {
  return [...jobs.value].sort((a, b) => Number(b.preco) - Number(a.preco)).slice(0, 6)
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
  if (!largura) return

  slideAtual.value = Math.round(slideContainer.value.scrollLeft / largura)
}
</script>

<template>
  <main class="home mrj-ui freelancer-page">
    <header class="home-topbar">
      <router-link to="/home" class="marca" aria-label="MaRuJoBs — início">
        <img src="@/assets/images/logo.png" alt="" />
        <span>MaRuJoBs<span class="marca-ponto">.</span></span>
      </router-link>
      <router-link to="/favoritos" class="atalho-favoritos">
        <i class="fa-regular fa-heart" aria-hidden="true"></i><span>Favoritos</span>
      </router-link>
    </header>
    <section class="home-hero" aria-labelledby="home-titulo">
      <h1 id="home-titulo">
        <span class="hero-linha">Seu próximo projeto</span>
        <span class="hero-linha hero-linha-destaque">começa aqui.</span>
      </h1>
      <p class="hero-descricao">
        Explore oportunidades e encontre trabalhos que combinam com o que você faz.
      </p>
      <router-link to="/freelances" class="hero-cta"
        >Explorar oportunidades <i class="fa-solid fa-arrow-right" aria-hidden="true"></i
      ></router-link>
    </section>
    <div v-if="mostrarAvisoSenha" class="aviso-senha">
      <button
        class="fechar-aviso"
        aria-label="Fechar aviso de senha"
        @click="mostrarAvisoSenha = false"
      >
        ×
      </button>

      <div class="aviso-conteudo">
        <strong>Crie uma senha para sua conta</strong>
        <span>
          Sua conta Google ainda não possui uma senha. Você pode criar uma para também entrar usando
          seu e-mail e senha.
        </span>

        <button class="btn-criar-senha" @click="$router.push('/definir-senha')">Criar senha</button>
      </div>
    </div>
    <p v-if="carregandoJobs" class="estado-jobs" role="status">Carregando oportunidades...</p>
    <div v-else-if="erroJobs" class="estado-jobs erro-jobs" role="alert">
      <p>{{ erroJobs }}</p>
      <button type="button" @click="buscarJobs">Tentar novamente</button>
    </div>
    <p v-else-if="!jobs.length" class="estado-jobs vazio-jobs" role="status">
      Nenhuma oportunidade disponível no momento.
    </p>
    <section v-revelar class="principais">
      <h2>Oportunidades em destaque</h2>

      <div class="subtitulo">
        <span>Os trabalhos que oferecem os melhores valores.</span>
      </div>

      <div
        ref="slideContainer"
        class="slide-scroll"
        tabindex="0"
        role="region"
        aria-label="Oportunidades em destaque; role para ver mais"
        @scroll="atualizarSlide"
      >
        <div v-for="(slide, index) in slides" :key="index" class="slide">
          <article v-for="job in slide" :key="job.id" class="card">
            <router-link :to="`/oportunidade/${job.id}`" class="card-conteudo">
              <div class="imagem">
                <img v-if="job.foto" :src="getImageUrl(job.foto)" class="avatar" alt="" />
                <i v-else class="fa-solid fa-briefcase" aria-hidden="true"></i>

                <div class="selo" v-if="job.preco >= 2500">★ Destaque</div>
              </div>

              <div class="info">
                <h3 :title="job.titulo">{{ job.titulo }}</h3>
                <p>{{ job.tag }}</p>

                <div class="preco">
                  <span>R$ {{ formatarPreco(job.preco) }}</span>
                  <p>•</p>
                  <p class="horas">{{ job.tempo }} horas</p>
                </div>
              </div>

              <div class="seta-card">›</div>
            </router-link>
            <FavoritoButton :id="job.id" />
          </article>
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

    <p v-if="erroFavorito" class="erro-favorito" role="alert">{{ erroFavorito }}</p>
    <div v-revelar class="chamada">
      <strong>Seu próximo trabalho pode estar aqui.</strong>
      <span>Encontre oportunidades, mostre seu talento e comece hoje.</span>
    </div>

    <section class="mais">
      <div v-revelar class="titulo-mais">
        <div>
          <h2>Mais oportunidades</h2>
          <span v-if="!carregandoJobs && !erroJobs" class="contador">
            {{ totalFreelances }}
            {{ totalFreelances === 1 ? 'oportunidade' : 'oportunidades' }}
            para explorar
          </span>
        </div>
      </div>

      <div class="grid-oportunidades">
        <div
          v-for="(job, index) in jobsHome"
          :key="job.id"
          v-revelar
          class="mini-card"
          :style="{ '--entrada-atraso': `${index * 65}ms` }"
        >
          <div class="mini-card-topo">
            <span class="mini-card-icone"
              ><i class="fa-solid fa-briefcase" aria-hidden="true"></i
            ></span>
            <span v-if="job.tag" class="categoria-vaga">{{ job.tag }}</span>
            <FavoritoButton :id="job.id" />
          </div>
          <h3 class="mini-card-titulo" :title="job.titulo">{{ job.titulo }}</h3>
          <div class="mini-card-resumo">
            <div>
              <span class="mini-rotulo">Valor do projeto</span>
              <span v-if="job.preco != null && job.preco !== ''" class="mini-preco"
                >R$ {{ formatarPreco(job.preco) }}</span
              >
              <span v-else class="mini-preco">Não informado</span>
            </div>
            <p class="mini-tempo">
              <i class="fa-regular fa-clock" aria-hidden="true"></i> {{ job.tempo }} horas
            </p>
          </div>

          <router-link :to="`/oportunidade/${job.id}`" class="botao-detalhes">
            Ver detalhes <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </router-link>
        </div>
      </div>

      <router-link v-revelar to="/freelances" class="link-todos btn-mais"> Ver todos </router-link>
    </section>
  </main>
</template>

<style scoped src="../styles/freelancer.css"></style>
<style scoped>
.home {
  min-height: 100dvh;
  padding: 0 20px 112px;
}
.home-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 0;
  border-bottom: 1px solid var(--mrj-color-border-subtle);
}
.marca {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  color: var(--mrj-color-text);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.05em;
}
.marca img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}
.marca-ponto {
  color: var(--mrj-color-primary);
}
.atalho-favoritos {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  color: var(--mrj-color-text-secondary);
  text-decoration: none;
  font-size: 0.8125rem;
}
.atalho-favoritos i {
  color: var(--mrj-color-primary);
  font-size: 20px;
}
.home-hero {
  padding: 40px 0;
  container-type: inline-size;
}
.home-hero h1 {
  font-size: clamp(2.375rem, 6.5cqw, 4.25rem);
  font-weight: 600;
  line-height: 1.12;
  letter-spacing: -0.055em;
  max-width: 800px;
}
.hero-linha {
  display: block;
  animation: hero-entrada 1100ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
}
.hero-linha-destaque {
  color: var(--mrj-color-primary);
  animation-delay: 180ms;
}
@supports (background-clip: text) {
  .hero-linha-destaque {
    background: linear-gradient(110deg, #673fd7 10%, #8a4fce 45%, #5b3cc4 75%, #673fd7);
    background-size: 220% 100%;
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
    animation:
      hero-entrada 1100ms 180ms cubic-bezier(0.2, 0.7, 0.2, 1) both,
      hero-brilho 12s 1400ms ease-in-out infinite;
  }
}
@keyframes hero-entrada {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
@keyframes hero-brilho {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}
@media (prefers-reduced-motion: reduce) {
  .hero-linha,
  .hero-linha-destaque {
    animation: none;
  }
}
.hero-descricao {
  margin: 18px 0 24px !important;
  max-width: 500px;
  color: var(--mrj-color-text-secondary);
  font-size: 0.9375rem;
}
.hero-cta,
.botao-detalhes,
.btn-mais,
.btn-criar-senha {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 46px;
  padding: 12px 18px;
  border: 0;
  border-radius: 10px;
  background: var(--mrj-color-primary);
  color: white;
  text-decoration: none;
  font-size: 0.8125rem;
  font-weight: 600;
}
.hero-cta:hover,
.botao-detalhes:hover,
.btn-mais:hover {
  background: var(--mrj-color-primary-hover);
}
.principais h2 {
  margin-bottom: 6px;
}
.subtitulo {
  font-size: 0.8125rem;
  color: var(--mrj-color-text-secondary);
  margin-bottom: 18px;
}
.slide-scroll {
  display: flex;
  overflow-x: auto;
  gap: 16px;
  scroll-snap-type: x mandatory;
  scrollbar-width: thin;
  padding: 4px;
  margin: 0 -4px;
}
.slide {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 26rem), 1fr));
  gap: 12px;
  min-width: 100%;
  width: 100%;
  flex-shrink: 0;
  scroll-snap-align: start;
  align-content: start;
}
.card {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: 18px;
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: 16px;
  background: white;
  box-shadow: var(--mrj-shadow-card);
}
.card-conteudo {
  min-width: 0;
  flex: 1;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  color: inherit;
  text-decoration: none;
}
.imagem {
  width: 48px;
  height: 60px;
  flex: 0 0 48px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: var(--mrj-color-secondary);
  color: var(--mrj-color-primary);
  position: relative;
  overflow: hidden;
}
.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.selo {
  position: absolute;
  bottom: 0;
  inset-inline: 0;
  padding: 2px;
  background: var(--mrj-color-primary);
  color: white;
  font-size: 8px;
  text-align: center;
}
.info {
  min-width: 0;
  flex: 1;
}
.info h3 {
  font-size: 0.9375rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.info > p {
  color: var(--mrj-color-text-secondary);
  font-size: 0.75rem;
  margin-top: 4px;
}
.preco {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}
.preco > span {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--mrj-color-primary);
}
.preco > p {
  font-size: 0.75rem;
  color: var(--mrj-color-text-secondary);
}
.seta-card {
  display: none;
}
.pontos-rolagem {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
}
.pontos-rolagem span {
  display: block;
  width: 6px;
  height: 6px;
  border-radius: 99px;
  background: #c9c6d9;
}
.pontos-rolagem span.active {
  width: 20px;
  background: var(--mrj-color-primary);
}
.chamada {
  margin: 32px 0;
  padding: 20px;
  border-left: 3px solid var(--mrj-color-primary);
  background: var(--mrj-color-secondary);
  border-radius: 0 12px 12px 0;
}
.chamada strong {
  display: block;
  font-size: 0.9375rem;
  font-weight: 600;
}
.chamada span {
  display: block;
  font-size: 0.8125rem;
  color: var(--mrj-color-text-secondary);
  margin-top: 4px;
}
.titulo-mais {
  margin-bottom: 18px;
}
.contador {
  display: block;
  font-size: 0.8125rem;
  color: var(--mrj-color-text-secondary);
  margin-top: 4px;
}
.grid-oportunidades {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr));
  gap: 16px;
}
.mini-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
  padding: 20px;
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: 16px;
  background: white;
  box-shadow: var(--mrj-shadow-card);
}
.mini-card-topo {
  display: flex;
  align-items: center;
  gap: 8px;
}
.mini-card-titulo {
  min-width: 0;
  font-size: 1rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.mini-card-icone {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  border-radius: 12px;
  background: var(--mrj-color-secondary);
  color: var(--mrj-color-primary);
}
.mini-card-topo .categoria-vaga {
  flex: 1;
  font-size: 0.75rem;
  color: var(--mrj-color-text-secondary);
}
.mini-card-topo .favorito {
  margin-left: auto;
}
.mini-card-resumo {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--mrj-color-border-subtle);
}
.mini-rotulo {
  display: block;
  color: var(--mrj-color-text-secondary);
  font-size: 0.6875rem;
}
.mini-preco {
  display: block;
}
.mini-tempo {
  display: flex;
  align-items: center;
  gap: 6px;
}
.botao-detalhes {
  background: var(--mrj-color-secondary);
  color: var(--mrj-color-primary);
  margin-top: 4px;
}
.botao-detalhes:hover {
  color: white;
}
.mini-card:hover {
  border-color: #d7ccef;
  box-shadow: 0 8px 28px #4930800c;
}
.mini-card p {
  color: var(--mrj-color-text-secondary);
  font-size: 0.8125rem;
}
.mini-card .mini-preco {
  font-size: 1.125rem;
  font-weight: 600;
  margin-top: 8px;
}
.mini-card .botao-detalhes {
  margin-top: auto;
}
.btn-mais {
  margin: 24px auto 0;
  display: flex;
  width: fit-content;
  background: transparent;
  color: var(--mrj-color-primary);
  border: 1px solid var(--mrj-color-border-subtle);
}
.btn-mais:hover {
  color: white;
}
.aviso-senha {
  position: relative;
  padding: 20px 52px 20px 20px;
  background: white;
  border-radius: 16px;
  margin-bottom: 24px;
}
.aviso-conteudo {
  display: grid;
  gap: 8px;
  font-size: 0.875rem;
}
.aviso-conteudo span {
  color: var(--mrj-color-text-secondary);
}
.btn-criar-senha {
  width: fit-content;
  margin-top: 8px;
}
.fechar-aviso {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 44px;
  border: 0;
  background: transparent;
  color: var(--mrj-color-text-secondary);
  font-size: 24px;
}
.estado-jobs {
  margin-bottom: 24px;
}
.erro-favorito {
  color: var(--mrj-color-danger);
  margin-block: 16px;
}
@media (prefers-reduced-motion: no-preference) {
  .home-topbar {
    animation: hero-entrada 650ms ease-out backwards;
  }
  .hero-descricao {
    animation: hero-entrada 850ms 280ms ease-out backwards;
  }
  .hero-cta {
    animation: hero-entrada 850ms 420ms ease-out backwards;
  }
  .revelar-pendente {
    opacity: 0;
    transform: translateY(24px);
  }
  .revelar-pendente:focus-within {
    opacity: 1;
    transform: none;
  }
  .revelar-visivel {
    animation: home-revelar 700ms var(--entrada-atraso, 0ms) cubic-bezier(0.2, 0.7, 0.2, 1)
      backwards;
  }
  .card,
  .mini-card {
    transition:
      transform 240ms ease,
      border-color 240ms ease,
      box-shadow 240ms ease;
  }
  .hero-cta,
  .botao-detalhes,
  .btn-mais,
  .atalho-favoritos {
    transition:
      transform 220ms ease,
      background-color 220ms ease,
      color 220ms ease,
      box-shadow 220ms ease;
  }
  .hero-cta i,
  .botao-detalhes i,
  .atalho-favoritos i,
  .mini-card-icone {
    transition: transform 240ms ease;
  }
  .hero-cta:is(:hover, :focus-visible),
  .btn-mais:is(:hover, :focus-visible) {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px #673fd724;
  }
  .hero-cta:active,
  .botao-detalhes:active,
  .btn-mais:active {
    transform: scale(0.98);
  }
  .hero-cta:is(:hover, :focus-visible) i,
  .botao-detalhes:is(:hover, :focus-visible) i {
    transform: translateX(4px);
  }
  .atalho-favoritos:is(:hover, :focus-visible) i {
    transform: scale(1.15) rotate(-8deg);
  }
  .pontos-rolagem span {
    transition:
      width 280ms ease,
      background-color 280ms ease;
  }
  .slide-scroll {
    scroll-behavior: smooth;
  }
  @media (hover: hover) {
    .card:hover,
    .mini-card:hover {
      transform: translateY(-3px);
    }
    .mini-card:hover .mini-card-icone {
      transform: rotate(-6deg) scale(1.06);
    }
  }
}
@keyframes home-revelar {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
