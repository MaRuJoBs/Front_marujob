<script setup>
import { ref, computed, onMounted, watch } from 'vue'

import { usePerfilPortfolio } from '@/composables/usePerfilPortfolio'
import { resolverImagem } from '@/services/perfilPortfolioService'
import FiltrosPortifolio from './FiltrosPortifolio.vue'
import PerfilAvatar from './PerfilAvatar.vue'

const pesquisa = ref('')
const { usuario, projetos, carregando, erro, carregar } = usePerfilPortfolio()
const projetosExibidos = ref([])
watch(projetos, (lista) => {
  projetosExibidos.value = lista
  pesquisa.value = ''
})
const aplicarFiltros = (resultado) => {
  projetosExibidos.value = resultado
}

const limparFiltros = () => {
  projetosExibidos.value = projetos.value
}

const projetosPesquisados = computed(() => {
  const termo = pesquisa.value.toLowerCase().trim()

  if (!termo) {
    return projetosExibidos.value
  }

  return projetosExibidos.value.filter((projeto) => {
    const titulo = String(projeto.titulo || '').toLowerCase()
    const categoria = String(projeto.categoria || '').toLowerCase()
    const tags = (projeto.tags || []).map((tag) => String(tag).toLowerCase())

    return (
      titulo.includes(termo) || categoria.includes(termo) || tags.some((tag) => tag.includes(termo))
    )
  })
})

onMounted(carregar)
</script>

<template>
  <div class="portfolio">
    <!-- Cabeçalho -->
    <p v-if="carregando" role="status">Carregando portfólio...</p>
    <div v-else-if="erro" role="alert">
      {{ erro }} <button @click="carregar">Tentar novamente</button>
    </div>
    <template v-else-if="usuario"
      ><section class="header">
        <div class="perfil">
          <div class="avatar">
            <PerfilAvatar :usuario="usuario"><FontAwesomeIcon :icon="['fas', 'user']" /></PerfilAvatar>
          </div>

          <div class="dados">
            <h2>{{ usuario?.name || 'Usuário' }}</h2>
            <p>{{ usuario.profissao || 'Profissão não informada' }}</p>

            <div class="localizacao">
              <FontAwesomeIcon :icon="['fas', 'location-dot']" />
              <span>{{ usuario.localizacao || 'Localização não informada' }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Barra de pesquisa -->
      <section class="pesquisa">
        <div class="input-busca">
          <FontAwesomeIcon :icon="['fas', 'magnifying-glass']" class="icone" />

          <input type="text" v-model="pesquisa" placeholder="Pesquisar projeto..." />
        </div>

        <FiltrosPortifolio
          :projetos="projetos"
          :pesquisa="pesquisa"
          @aplicar-filtros="aplicarFiltros"
          @limpar-filtros="limparFiltros"
        />
      </section>

      <!-- Título -->
      <section class="titulo">
        <h3>Meus Projetos</h3>
        <router-link to="/portfolio/adicionar">Adicionar projeto</router-link>

        <span>{{ projetosPesquisados.length }} projetos</span>
      </section>

      <!-- Grid -->
      <section class="grid">
        <router-link
          v-for="projeto in projetosPesquisados"
          :key="projeto.id"
          :to="`/portfolio/${projeto.id}`"
          class="card"
        >
          <div class="imagem">
            <img
              @load="
                (event) => {
                  event.target.hidden = false
                }
              "
              @error="
                (event) => {
                  event.target.hidden = true
                }
              "
              v-if="projeto.imagem"
              :src="resolverImagem(projeto.imagem)"
              :alt="projeto.titulo"
            />

            <FontAwesomeIcon v-else :icon="['fas', 'image']" class="img-icon" />
          </div>

          <div class="conteudo">
            <h4>{{ projeto.titulo }}</h4>

            <p>{{ projeto.categoria }}</p>

            <div class="tags">
              <span v-for="tag in projeto.tags" :key="tag">
                {{ tag }}
              </span>
            </div>
          </div>
        </router-link>
      </section>
      <p v-if="!projetosPesquisados.length" role="status">Nenhum projeto encontrado.</p></template
    >
  </div>
</template>

<style scoped>
.dados,
.conteudo,
.card {
  min-width: 0;
  overflow-wrap: anywhere;
}
.avatar {
  flex-shrink: 0;
}
.titulo {
  flex-wrap: wrap;
  gap: 12px;
}
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.portfolio {
  min-height: 100vh;
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  background: #e8e1f2;
  padding-bottom: 120px;
}

/* HEADER */

.header {
  background: linear-gradient(135deg, #5b3cc4, #7a3ff2);
  padding: 40px 20px 70px;
  border-bottom-left-radius: 35px;
  border-bottom-right-radius: 35px;
}

.perfil {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 85px;
  height: 85px;
  border-radius: 50%;
  background: #d9d9d9;
  border: 3px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: #8a7fb4;
  font-size: 32px;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dados h2 {
  color: white;
  font-size: 24px;
  margin-bottom: 4px;
}

.dados p {
  color: #efe8ff;
  font-size: 15px;
}

.localizacao {
  display: flex;
  align-items: center;
  gap: 6px;
  color: white;
  margin-top: 10px;
  font-size: 14px;
}

/* PESQUISA */

.pesquisa {
  display: flex;
  gap: 10px;
  padding: 0 18px;
  margin-top: -28px;
}

.input-busca {
  flex: 1;
  background: white;
  border-radius: 15px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  height: 50px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
}

.input-busca input {
  border: none;
  outline: none;
  width: 100%;
  margin-left: 10px;
  background: transparent;
  font-size: 15px;
}

.icone {
  color: #888;
}

/* TÍTULO */

.titulo {
  margin: 30px 20px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.titulo h3 {
  color: #49357b;
  font-size: 22px;
}

.titulo span {
  color: #7d6d9d;
  font-size: 14px;
}

/* GRID */

.grid {
  padding: 0 18px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}

.card {
  text-decoration: none;
  background: white;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  transition: 0.25s;
}

.card:hover {
  transform: translateY(-4px);
}

.imagem {
  width: 100%;
  height: 150px;
  background: #d6d6d6;
  display: flex;
  justify-content: center;
  align-items: center;
}

.imagem img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.img-icon {
  font-size: 42px;
  color: #888;
}

.conteudo {
  padding: 14px;
}

.conteudo h4 {
  color: #49357b;
  font-size: 17px;
  margin-bottom: 6px;
}

.conteudo p {
  color: #777;
  font-size: 14px;
  margin-bottom: 12px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tags span {
  background: #ece6ff;
  color: #5b3cc4;
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 30px;
  font-weight: 600;
}

/* FOOTER */

.footer {
  position: fixed;
  width: 100%;
  max-width: 420px;
  height: 85px;

  left: 50%;
  bottom: 0;
  transform: translateX(-50%);

  background: #eee8f8;

  display: grid;
  grid-template-columns: repeat(4, 1fr);
  align-items: center;

  padding: 8px 15px 5px;

  border-top-left-radius: 30px;
  border-top-right-radius: 30px;

  box-shadow: 0 -5px 20px rgba(0, 0, 0, 0.08);

  z-index: 1000;
}

/* ITENS */

.footer-item {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;

  color: #8775b5;
  text-decoration: none;
  font-size: 22px;
}

.footer-item span {
  font-size: 12px;
}

.footer-item:hover {
  color: #5b3cc4;
}

/* BOTÃO + */

.btn-add {
  position: absolute;
  left: 50%;
  top: -38px;
  transform: translateX(-50%);

  width: 76px;
  height: 76px;
  border-radius: 50%;

  background: #5b3cc4;
  color: white;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 34px;
  text-decoration: none;

  border: 6px solid #e8e1f2;
  box-shadow: 0 7px 18px rgba(91, 60, 196, 0.35);

  z-index: 1001;
  transition: 0.25s;
}

.btn-add:hover {
  transform: translateX(-50%) scale(1.08);
  background: #4928b0;
}

/* RESPONSIVO */

@media (max-width: 390px) {
  .grid {
    gap: 14px;
  }

  .imagem {
    height: 120px;
  }

  .conteudo h4 {
    font-size: 15px;
  }

  .dados h2 {
    font-size: 20px;
  }

  .titulo h3 {
    font-size: 20px;
  }
}

@media (max-width: 340px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
