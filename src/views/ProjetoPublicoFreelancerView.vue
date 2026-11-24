<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { usePerfilPublicoFreelancer } from '../composables/usePerfilPublicoFreelancer.js'

const route = useRoute()
const { perfil, carregando, erro, indisponivel, carregar } = usePerfilPublicoFreelancer()
const projeto = computed(() =>
  perfil.value?.portfolio.find((item) => String(item.id) === route.params.projetoId),
)
const imagemFalhou = ref(false)
watch(() => projeto.value?.imagem, () => { imagemFalhou.value = false })
</script>

<template>
  <main class="diretorio mrj-ui" :aria-busy="carregando">
    <RouterLink
      class="voltar-perfil"
      :to="{
        name: 'perfil-publico-freelancer',
        params: { id: route.params.id },
        query: route.query,
      }"
    >
      Voltar ao perfil do freelancer
    </RouterLink>

    <p v-if="carregando" role="status">Carregando projeto público…</p>
    <div v-else-if="indisponivel || (!erro && !projeto)" role="alert">
      <h1>Projeto não encontrado ou indisponível</h1>
    </div>
    <div v-else-if="erro" role="alert">
      <h1>Não foi possível carregar o projeto</h1>
      <p>{{ erro }}</p>
      <button type="button" @click="carregar">Tentar novamente</button>
    </div>
    <article v-else class="profissional projeto-detalhe">
      <header>
        <p v-if="projeto.categoria" class="sobretitulo">{{ projeto.categoria }}</p>
        <h1>{{ projeto.titulo || 'Projeto sem título' }}</h1>
        <p>{{ perfil.nome || 'Nome não informado' }}</p>
      </header>

      <div class="projeto-detalhe-conteudo" :class="{ 'tem-imagem': projeto.imagem && !imagemFalhou }">
        <figure v-if="projeto.imagem && !imagemFalhou" class="projeto-detalhe-midia">
          <img
            :key="projeto.imagem"
            :src="projeto.imagem"
            :alt="'Imagem de ' + (projeto.titulo || 'projeto')"
            referrerpolicy="no-referrer"
            @error="imagemFalhou = true"
          />
        </figure>
        <div class="projeto-detalhe-informacoes">
          <section v-if="projeto.descricao">
            <h2>Descrição</h2>
            <p class="descricao">{{ projeto.descricao }}</p>
          </section>
          <section v-if="projeto.tags.length">
            <h2>Tags e tecnologias</h2>
            <ul class="habilidades">
              <li v-for="tag in projeto.tags" :key="tag">{{ tag }}</li>
            </ul>
          </section>
          <a v-if="projeto.link" :href="projeto.link" target="_blank" rel="noopener noreferrer">
            Abrir projeto (nova aba)
          </a>
        </div>
      </div>
    </article>
  </main>
</template>

<style scoped src="../styles/freelancers-publicos.css"></style>
