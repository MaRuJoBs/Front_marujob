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
  <div class="portfolio mrj-ui freelancer-page">
    <!-- Cabeçalho -->
    <p v-if="carregando" role="status">Carregando portfólio...</p>
    <div v-else-if="erro" role="alert">
      {{ erro }} <button @click="carregar">Tentar novamente</button>
    </div>
    <template v-else-if="usuario"
      ><section class="header">
        <div class="perfil">
          <div class="avatar">
            <PerfilAvatar :usuario="usuario"
              ><FontAwesomeIcon :icon="['fas', 'user']"
            /></PerfilAvatar>
          </div>

          <div class="dados">
            <p class="nome">{{ usuario?.name || 'Usuário' }}</p>
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

          <input
            type="text"
            aria-label="Pesquisar projeto"
            v-model="pesquisa"
            placeholder="Pesquisar projeto..."
          />
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
        <h1>Meus Projetos</h1>
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

<style scoped src="../styles/freelancer.css"></style>
<style scoped>
.portfolio {
  min-height: 100dvh;
  padding-bottom: 120px;
}
.header {
  padding: 32px 24px;
  background: linear-gradient(120deg, #eee8ff, #f7f8fc);
}
.perfil {
  display: flex;
  align-items: center;
  gap: 20px;
}
.avatar {
  display: grid;
  place-items: center;
  width: 80px;
  height: 80px;
  flex: 0 0 80px;
  border-radius: 50%;
  overflow: hidden;
  background: white;
  border: 4px solid white;
  color: var(--mrj-color-primary);
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.dados {
  min-width: 0;
}
.dados .nome {
  font-size: clamp(1.125rem, 3vw, 1.75rem);
  font-weight: 600;
  letter-spacing: -0.03em;
}
.dados > p:not(.nome) {
  font-size: 0.875rem;
  color: var(--mrj-color-text-secondary);
  margin-top: 4px;
}
.localizacao {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 8px;
  font-size: 0.8125rem;
  color: var(--mrj-color-text-secondary);
}
.localizacao svg {
  margin-top: 4px;
  color: var(--mrj-color-primary);
}
.pesquisa {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 24px 0;
}
.input-busca {
  display: flex;
  flex: 1;
  min-width: 0;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
  border: 1px solid var(--mrj-color-border);
  border-radius: 12px;
  background: white;
  color: var(--mrj-color-text-secondary);
}
.input-busca input {
  min-width: 0;
  width: 100%;
  height: 50px;
  background: transparent;
  border: 0;
  outline: 0;
  font-size: 0.875rem;
  color: var(--mrj-color-text);
}
.input-busca:focus-within {
  outline: 3px solid var(--mrj-color-focus);
  outline-offset: 3px;
}
.titulo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 28px 24px 20px;
}
.titulo h1 {
  font-size: 1.5rem;
}
.titulo > a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 10px 16px;
  border-radius: 10px;
  background: var(--mrj-color-primary);
  color: white;
  text-decoration: none;
  font-size: 0.8125rem;
  font-weight: 600;
}
.titulo > span {
  width: 100%;
  font-size: 0.8125rem;
  color: var(--mrj-color-text-secondary);
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
  gap: 20px;
  padding: 0 24px;
}
.card {
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: 16px;
  background: white;
  box-shadow: var(--mrj-shadow-card);
  text-decoration: none;
  color: inherit;
}
.card:hover {
  border-color: var(--mrj-color-primary);
}
.imagem {
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 16/10;
  background: var(--mrj-color-secondary);
  overflow: hidden;
}
.imagem img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.img-icon {
  font-size: 36px;
  color: #8b7ba8;
}
.conteudo {
  padding: 20px;
}
.conteudo h4 {
  font-size: 1rem;
  line-height: 1.5;
}
.conteudo > p {
  color: var(--mrj-color-text-secondary);
  font-size: 0.8125rem;
  margin-top: 6px;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 14px;
}
.tags:empty {
  display: none;
}
.tags span {
  background: var(--mrj-color-secondary);
  color: var(--mrj-color-primary);
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 0.75rem;
}
</style>
