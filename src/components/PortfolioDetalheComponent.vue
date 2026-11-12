<script setup>
import ConfirmarExclusaoProjeto from './ConfirmarExclusaoProjeto.vue'
import { useProjetoDetalhe } from '@/composables/useProjetoDetalhe'
import { resolverImagem } from '@/services/perfilPortfolioService'
import { linkSeguro } from '@/utils/perfilPortfolio'
const {
  projeto,
  mostrarModalExcluir,
  excluindo,
  sucesso,
  carregando,
  erro,
  carregarProjeto,
  excluirProjeto,
  router,
} = useProjetoDetalhe()
</script>
<template>
  <div class="portfolio-detalhe mrj-ui freelancer-page">
    <div v-if="carregando && !excluindo" role="status" class="carregando">
      Carregando projeto...
    </div>

    <div v-else-if="sucesso" role="status">
      {{ sucesso }} <router-link to="/portfolio">Voltar ao portfólio</router-link>
    </div>
    <div v-else-if="!projeto" role="alert">
      {{ erro }} <button @click="carregarProjeto">Tentar novamente</button
      ><router-link to="/portfolio">Voltar</router-link>
    </div>

    <div v-else class="conteudo-projeto">
      <!-- Cabeçalho -->
      <section class="header">
        <router-link to="/portfolio" class="btn-voltar" aria-label="Voltar ao portfólio">
          <FontAwesomeIcon :icon="['fas', 'arrow-left']" />
        </router-link>

        <h2>Detalhes do Projeto</h2>
      </section>

      <!-- Imagem -->
      <section class="imagem-projeto">
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

        <div v-else class="imagem-vazia">
          <FontAwesomeIcon :icon="['fas', 'image']" class="icone-imagem" />
        </div>
      </section>

      <!-- Informações -->
      <section class="informacoes">
        <div class="cabecalho">
          <h1>{{ projeto.titulo }}</h1>

          <span class="categoria">
            {{ projeto.categoria }}
          </span>
        </div>

        <div class="tags">
          <span v-for="tag in projeto.tags" :key="tag">
            {{ tag }}
          </span>
        </div>

        <div class="descricao">
          <h3>Descrição</h3>

          <p>
            {{ projeto.descricao }}
          </p>
        </div>

        <div v-if="linkSeguro(projeto.link)" class="link">
          <h3>Link do Projeto</h3>

          <a :href="linkSeguro(projeto.link)" target="_blank" rel="noopener noreferrer">
            {{ projeto.link }}
          </a>
        </div>
      </section>

      <!-- Botões -->
      <section class="acoes">
        <button class="editar" @click="router.push(`/portfolio/${projeto.id}/editar`)">
          <FontAwesomeIcon :icon="['fas', 'pen']" />

          Editar
        </button>

        <button class="excluir" @click="mostrarModalExcluir = true">
          <FontAwesomeIcon :icon="['fas', 'trash']" />
          Excluir
        </button>
      </section>
    </div>
    <ConfirmarExclusaoProjeto
      v-if="mostrarModalExcluir"
      :titulo="projeto?.titulo"
      :excluindo="excluindo"
      :erro="erro"
      @cancelar="mostrarModalExcluir = false"
      @confirmar="excluirProjeto"
    />
  </div>
</template>

<style scoped src="../styles/freelancer.css"></style>
<style scoped>
.portfolio-detalhe {
  min-height: 100dvh;
  padding: 24px 20px;
}
.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}
.header h2 {
  font-size: 1rem;
}
.btn-voltar {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  border: 1px solid var(--mrj-color-border-subtle);
  background: white;
  color: var(--mrj-color-text-secondary);
  border-radius: 12px;
  text-decoration: none;
}
.imagem-projeto {
  margin: 0 0 24px;
  width: 100%;
  border-radius: 16px;
  overflow: hidden;
  background: var(--mrj-color-secondary);
}
.imagem-projeto img {
  display: block;
  width: 100%;
  max-height: 400px;
  aspect-ratio: 16/9;
  object-fit: cover;
}
.imagem-vazia {
  display: grid;
  place-items: center;
  width: 100%;
  min-height: 220px;
  aspect-ratio: 16/7;
  color: #8b7ba8;
  font-size: 48px;
}
.informacoes {
  padding: 28px;
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: 16px;
  background: white;
}
.cabecalho {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}
.cabecalho h1 {
  min-width: 0;
  flex: 1 1 16rem;
}
.categoria,
.tags span {
  display: inline-flex;
  padding: 6px 10px;
  border-radius: 6px;
  background: var(--mrj-color-secondary);
  color: var(--mrj-color-primary);
  font-size: 0.75rem;
}
.categoria:empty,
.tags:empty {
  display: none;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}
.descricao,
.link {
  margin-top: 28px;
}
.descricao h3,
.link h3 {
  font-size: 1rem;
  margin-bottom: 12px;
}
.descricao p {
  color: var(--mrj-color-text-secondary);
  font-size: 0.9375rem;
  line-height: 1.8;
  white-space: pre-wrap;
}
.link a {
  font-size: 0.875rem;
  color: var(--mrj-color-primary);
  text-decoration: underline;
  text-underline-offset: 3px;
}
.acoes {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 24px;
}
.editar,
.excluir {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 120px;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
}
.editar {
  border: 0;
  background: var(--mrj-color-primary);
  color: white;
}
.excluir {
  border: 1px solid #e7c7cb;
  background: #fff5f5;
  color: var(--mrj-color-danger);
}
.excluir:hover {
  background: #ffe8e8;
}
.carregando {
  min-height: 200px;
  display: grid;
  place-items: center;
}
</style>
