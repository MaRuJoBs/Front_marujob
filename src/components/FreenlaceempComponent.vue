<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import logoemp from '@/assets/images/logoemp.png'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'


const API_URL = 'https://marujob.class.fabricadesoftware.ifc.edu.br'

const router = useRouter()

const freelancersMock = [
  {
    id: 1,
    nome: 'Breno',
    cargo: 'Designer Gráfico',
    avaliacao: 5,
    preco: 200,
    categoria: 'Design',
    tags: ['Branding', 'Branding', 'Branding'],
  },
  {
    id: 2,
    nome: 'João Silva',
    cargo: 'Designer Gráfico',
    avaliacao: 5,
    preco: 200,
    categoria: 'Design',
    tags: ['Branding', 'Branding', 'Branding'],
  },
  {
    id: 3,
    nome: 'João Silva',
    cargo: 'Designer Gráfico',
    avaliacao: 5,
    preco: 200,
    categoria: 'Design',
    tags: ['Branding', 'Branding', 'Branding'],
  },
]

const freelancers = ref([])
const busca = ref('')
const carregando = ref(true)
const erro = ref('')

const categorias = ['Todas', 'Design', 'Desenvolvimento', 'Mais']
const categoriaAtiva = ref('Todas')

const selecionarCategoria = (cat) => {
  categoriaAtiva.value = cat
}

const buscarFreelancers = async () => {
  carregando.value = true
  erro.value = ''

  try {
    let url = `${API_URL}/api/freelancers/?page=1`
    const todos = []

    while (url) {
      const res = await fetch(url)

      if (!res.ok) {
        throw new Error(`Erro ao buscar freelancers. Status: ${res.status}`)
      }

      const data = await res.json()

      if (Array.isArray(data.results)) {
        todos.push(...data.results)
      }

      url = data.next
    }

    freelancers.value = todos.length ? todos : freelancersMock
  } catch (error) {
    console.error('Erro ao carregar freelancers:', error)
    freelancers.value = freelancersMock
  } finally {
    carregando.value = false
  }
}

onMounted(() => {
  buscarFreelancers()
})

const freelancersFiltrados = computed(() => {
  const termo = busca.value.toLowerCase().trim()

  return freelancers.value.filter((f) => {
    const passaCategoria =
      categoriaAtiva.value === 'Todas' ||
      f.categoria?.toLowerCase() === categoriaAtiva.value.toLowerCase()

    if (!termo) return passaCategoria

    const passaBusca =
      f.nome?.toLowerCase().includes(termo) ||
      f.cargo?.toLowerCase().includes(termo) ||
      f.tags?.some((t) => t.toLowerCase().includes(termo))

    return passaCategoria && passaBusca
  })
})

const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${API_URL}${path.startsWith('/') ? path : '/' + path}`
}

const verPerfil = (freelancer) => {
  router.push(`/freelancer/${freelancer.id}`)
}
</script>

<template>
  <div class="body">
    <div class="topo-imagem">
      <img :src="logoemp" alt="logoemp" />
    </div>

    <h1 class="titulo-pagina">Freelancers</h1>
    <p class="subtitulo">Encontre os melhores freelancers aqui!</p>

    <div class="busca-linha">
      <div class="busca-caixa">
        <FontAwesomeIcon icon="magnifying-glass" class="busca-icon" />
        <input
          v-model="busca"
          type="text"
          placeholder="Buscar freelancer por nome, habilidade, etc..."
        />
      </div>

      <button class="btn-filtros">
        <FontAwesomeIcon icon="sliders" />
        <span>Filtros</span>
      </button>
    </div>

    <div class="categorias">
      <button
        v-for="cat in categorias"
        :key="cat"
        class="cat-pill"
        :class="{ ativa: categoriaAtiva === cat }"
        @click="selecionarCategoria(cat)"
      >
        {{ cat }}
        <FontAwesomeIcon v-if="cat === 'Mais'" icon="chevron-down" class="cat-seta" />
      </button>
    </div>

    <div v-if="carregando" class="estado">
      <p>Carregando freelancers...</p>
    </div>

    <template v-else>
      <section v-for="f in freelancersFiltrados" :key="f.id" class="card-freelancer">
        <div class="linha-topo">
          <div class="avatar">
            <img v-if="f.foto" :src="getImageUrl(f.foto)" alt="" />
            <span v-else>{{ f.nome?.charAt(0)?.toUpperCase() || 'F' }}</span>
          </div>

          <div class="info">
            <h3>{{ f.nome || 'Freelancer' }}</h3>
            <p class="cargo">{{ f.cargo || 'Profissional' }}</p>
            <div class="estrelas">
              <span
                v-for="n in 5"
                :key="n"
                class="estrela"
                :class="{ vazia: n > Math.round(f.avaliacao ?? 5) }"
                >★</span
              >
            </div>
          </div>

          <div class="lateral">
            <span class="price">R$ {{ f.preco ?? '0' }}</span>
            <button class="btn-perfil" @click="verPerfil(f)">Ver perfil</button>
          </div>
        </div>

        <div class="tags" v-if="f.tags?.length">
          <span class="tag" v-for="(tag, i) in f.tags" :key="i">
            {{ tag }}
          </span>
        </div>
      </section>

      <div v-if="freelancersFiltrados.length === 0" class="nenhum">
        <div class="fim-icone">
          <FontAwesomeIcon icon="flag" />
        </div>
        <h4>Nenhum freelancer encontrado</h4>
        <p>Tente pesquisar por outro nome ou habilidade.</p>
      </div>
    </template>
  </div>
</template>

<style scoped>
.body {
  min-height: 100vh;
  padding: 16px 10px 30px;
  font-family: Arial, sans-serif;
  background: linear-gradient(180deg, #b79bf0 0%, #ece7fb 40%);
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  box-sizing: border-box;
}

.topo-imagem {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 8px 0 16px;
  overflow: visible; /* garanta que não está cortando */
}

.topo-imagem img {
  width: 280px;
  max-width: 85%;
  height: auto;
  display: block;
  margin: 0 auto;
}

.titulo-pagina {
  color: #3f2582;
  font-size: 26px;
  margin: 4px 0 4px;
  font-weight: 550;
}

.subtitulo {
  color: #5f4f8f;
  font-size: 13px;
  margin: 0 0 18px;
}

.busca-linha {
  display: flex;
  gap: 8px;
  margin-bottom: 14px;
}

.busca-caixa {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border-radius: 14px;
  padding: 12px 14px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
}

.busca-icon {
  color: #9a8fc4;
  font-size: 13px;
}

.busca-caixa input {
  border: none;
  background: transparent;
  outline: none;
  font-size: 13px;
  color: #4b2e9e;
  width: 100%;
}

.busca-caixa input::placeholder {
  color: #a79fc9;
}

.btn-filtros {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #6b4bc4;
  color: white;
  border: none;
  border-radius: 14px;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.categorias {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  background: #ffffff;
  border-radius: 16px;
  padding: 8px 10px;
  margin: 0 auto 18px;
  width: fit-content;
  max-width: 100%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  overflow-x: auto;
}

.cat-pill {
  border: none;
  background: transparent;
  color: #6b4bc4;
  font-size: 12px;
  font-weight: 600;
  padding: 9px 16px;
  border-radius: 12px;
  cursor: pointer;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 4px;
}

.cat-pill.ativa {
  background: #6b4bc4;
  color: #ffffff;
}

.cat-seta {
  font-size: 10px;
}

.card-freelancer {
  background: #ede7fb;
  border-radius: 20px;
  padding: 14px 16px;
  margin-bottom: 14px;
  box-shadow: 0 4px 12px rgba(107, 75, 196, 0.12);
}

.linha-topo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #b79bf0, #6b4bc4);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: #ffffff;
  font-size: 16px;
  font-weight: bold;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info {
  flex: 1;
  min-width: 0;
}

.info h3 {
  margin: 0;
  color: #3f2582;
  font-size: 15px;
  font-weight: 700;
}

.cargo {
  margin: 1px 0 5px;
  color: #9a8fc4;
  font-size: 11px;
}

.estrelas {
  display: flex;
  gap: 1px;
}

.estrela {
  color: #f5b301;
  font-size: 13px;
  line-height: 1;
}

.estrela.vazia {
  color: #ded4f7;
}

.lateral {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.price {
  background: #ffffff;
  border: none;
  padding: 5px 13px;
  border-radius: 20px;
  color: #4b2e9e;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
}

.btn-perfil {
  background: #6b4bc4;
  color: #ffffff;
  border: none;
  border-radius: 20px;
  padding: 7px 15px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
}

.btn-perfil:hover {
  background: #5a3bab;
}

.tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-top: 11px;
}

.tags .tag {
  background: #ffffff;
  color: #6b4bc4;
  font-size: 10px;
  font-weight: 600;
  padding: 4px 11px;
  border-radius: 20px;
}

.estado {
  text-align: center;
  padding: 40px 20px;
  color: #5f4f8f;
}

.nenhum {
  text-align: center;
  margin: 30px 0 10px;
  color: #5f4f8f;
}

.fim-icone {
  width: 54px;
  height: 54px;
  margin: 0 auto 14px;
  background: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b4bc4;
  font-size: 20px;
  box-shadow: 0 3px 8px rgba(107, 75, 196, 0.15);
}

.nenhum h4 {
  color: #3f2582;
  margin: 0 0 6px;
  font-size: 15px;
}

.nenhum p {
  font-size: 12px;
  margin: 0;
  padding: 0 20px;
  line-height: 1.4;
}
</style>
