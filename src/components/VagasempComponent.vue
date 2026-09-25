<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import logoemp from '@/assets/images/logoempresa.png'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const API_URL = 'https://marujob.class.fabricadesoftware.ifc.edu.br'

const router = useRouter()

const vagasMock = [
  {
    id: 1,
    titulo: 'Design de App',
    empresa: 'Startup Criativa',
    prazo: '3 Dias',
    local: 'Home Office',
    preco: 350,
    categoria: 'Design',
    tag: 'Design',
  },
  {
    id: 2,
    titulo: 'Design de App',
    empresa: 'Startup Criativa',
    prazo: '3 Dias',
    local: 'Home Office',
    preco: 350,
    categoria: 'Design',
    tag: 'Design',
  },
  {
    id: 3,
    titulo: 'Design de App',
    empresa: 'Startup Criativa',
    prazo: '3 Dias',
    local: 'Home Office',
    preco: 350,
    categoria: 'Design',
    tag: 'Design',
  },
  {
    id: 4,
    titulo: 'Design de App',
    empresa: 'Startup Criativa',
    prazo: '3 Dias',
    local: 'Home Office',
    preco: 350,
    categoria: 'Design',
    tag: 'Design',
  },
]

const vagas = ref([])
const busca = ref('')
const carregando = ref(true)

const categorias = ['Todas', 'Design', 'Desenvolvimento', 'Mais']
const categoriaAtiva = ref('Todas')

const selecionarCategoria = (cat) => {
  categoriaAtiva.value = cat
}

const buscarVagas = async () => {
  carregando.value = true

  try {
    let url = `${API_URL}/api/vagas/?page=1`
    const todas = []

    while (url) {
      const res = await fetch(url)

      if (!res.ok) {
        throw new Error(`Erro ao buscar vagas. Status: ${res.status}`)
      }

      const data = await res.json()

      if (Array.isArray(data.results)) {
        todas.push(...data.results)
      }

      url = data.next
    }

    vagas.value = todas.length ? todas : vagasMock
  } catch (error) {
    console.error('Erro ao carregar vagas:', error)
    vagas.value = vagasMock
  } finally {
    carregando.value = false
  }
}

onMounted(() => {
  buscarVagas()
})

const vagasFiltradas = computed(() => {
  const termo = busca.value.toLowerCase().trim()

  return vagas.value.filter((v) => {
    const passaCategoria =
      categoriaAtiva.value === 'Todas' ||
      v.categoria?.toLowerCase() === categoriaAtiva.value.toLowerCase()

    if (!termo) return passaCategoria

    const passaBusca =
      v.titulo?.toLowerCase().includes(termo) ||
      v.empresa?.toLowerCase().includes(termo)

    return passaCategoria && passaBusca
  })
})

const abrirVaga = (vaga) => {
  router.push(`/vaga/${vaga.id}`)
}
</script>

<template>
  <div class="body">
    <div class="glow glow-1"></div>
    <div class="glow glow-2"></div>

    <div class="conteudo">
      <div class="topo-banner">
        <img :src="logoemp" alt="MaRuJoB's Empresas" />
      </div>

      <h1 class="titulo-pagina">Vagas</h1>
      <p class="subtitulo">Todas as vagas de outras empresas.</p>

      <div class="busca-linha">
        <div class="busca-caixa">
          <FontAwesomeIcon icon="magnifying-glass" class="busca-icon" />
          <input
            v-model="busca"
            type="text"
            placeholder="Buscar por cargo ou palavra-chave..."
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
        <p>Carregando vagas...</p>
      </div>

      <template v-else>
        <section
          v-for="v in vagasFiltradas"
          :key="v.id"
          class="card-vaga"
          @click="abrirVaga(v)"
        >
          <div class="icone-vaga">
            <FontAwesomeIcon icon="layer-group" />
          </div>

          <div class="info-vaga">
            <h3>{{ v.titulo }}</h3>
            <p class="empresa">{{ v.empresa }}</p>

            <div class="meta">
              <span class="meta-item">
                <FontAwesomeIcon icon="calendar" />
                {{ v.prazo }}
              </span>
              <span class="meta-item">
                <FontAwesomeIcon icon="clock" />
                {{ v.local }}
              </span>
            </div>
          </div>

          <div class="lateral-vaga">
            <span class="price">
              R$ {{ v.preco }}
              <FontAwesomeIcon icon="chevron-right" class="price-seta" />
            </span>
            <span class="tag-categoria">{{ v.tag }}</span>
          </div>
        </section>

        <div v-if="vagasFiltradas.length === 0" class="nenhum">
          <div class="fim-icone">
            <FontAwesomeIcon icon="flag" />
          </div>
          <h4>Nenhuma vaga encontrada</h4>
          <p>Tente pesquisar por outro cargo ou palavra-chave.</p>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.body {
  position: relative;
  min-height: 100vh;
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  box-sizing: border-box;
  overflow: hidden;
  background-image: url('@/assets/images/fundo.png');
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
}

.glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(50px);
  z-index: 0;
  pointer-events: none;
}

.glow-1 {
  top: -80px;
  left: -60px;
  width: 260px;
  height: 260px;
  background: radial-gradient(circle, #b79bf0 0%, #d9c9f7 70%, transparent 100%);
  opacity: 0.7;
}

.glow-2 {
  top: -40px;
  right: -90px;
  width: 220px;
  height: 220px;
  background: radial-gradient(circle, #8a6fd6 0%, #c6b3f2 70%, transparent 100%);
  opacity: 0.55;
}

.conteudo {
  position: relative;
  z-index: 1;
  padding: 20px 16px 30px;
}

.topo-banner {
  display: flex;
  justify-content: center;
  align-items: center;
}

.topo-banner img {
  width: 2000px;       /* estava 160px, aumentei */
  max-width: 90%;     /* estava 60%, aumentei também */
  height: auto;
  display: block;
}   

.titulo-pagina {
  color: #3f2582;
  font-size: 26px;
  margin: 0 0 4px;   /* tirei o espaço de cima */
  font-weight: 700;
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

.card-vaga {
  background: #ffffff;
  border-radius: 18px;
  padding: 14px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 4px 14px rgba(107, 75, 196, 0.1);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}

.card-vaga:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(107, 75, 196, 0.16);
}

.icone-vaga {
  width: 42px;
  height: 42px;
  border-radius: 12px;
  background: linear-gradient(135deg, #b79bf0, #6b4bc4);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 16px;
  flex-shrink: 0;
}

.info-vaga {
  flex: 1;
  min-width: 0;
}

.info-vaga h3 {
  margin: 0;
  color: #3f2582;
  font-size: 14px;
  font-weight: 700;
}

.empresa {
  margin: 2px 0 6px;
  color: #9a8fc4;
  font-size: 11px;
}

.meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 10px;
  color: #8a7cbf;
}

.lateral-vaga {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}

.price {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f3effc;
  padding: 5px 10px;
  border-radius: 20px;
  color: #4b2e9e;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.price-seta {
  font-size: 9px;
  color: #a79fc9;
}

.tag-categoria {
  background: #d9cef7;
  color: #6b4bc4;
  font-size: 10px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 20px;
  white-space: nowrap;
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