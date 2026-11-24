<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePerfilPublicoFreelancer } from '../composables/usePerfilPublicoFreelancer.js'

const route = useRoute()
const router = useRouter()
const { perfil, carregando, erro, carregar } = usePerfilPublicoFreelancer()
const fotoFalhou = ref(false)
watch(perfil, () => {
  fotoFalhou.value = false
})
</script>
<template>
  <main class="diretorio mrj-ui" :aria-busy="carregando">
    <button
      type="button"
      @click="router.push({ path: '/empresa/freelancers', query: route.query })"
    >
      Voltar aos profissionais
    </button>
    <p v-if="carregando" role="status">Carregando perfil público…</p>
    <div v-else-if="erro" role="alert">
      <h1>Perfil indisponível</h1>
      <p>{{ erro }}</p>
      <button type="button" @click="carregar">Tentar novamente</button>
    </div>
    <template v-else-if="perfil">
      <header class="profissional">
        <img
          v-if="perfil.foto_perfil && !fotoFalhou"
          :src="perfil.foto_perfil"
          alt=""
          referrerpolicy="no-referrer"
          @error="fotoFalhou = true"
        /><span v-else class="avatar" aria-hidden="true">◎</span>
        <p class="sobretitulo">Perfil público</p>
        <h1>{{ perfil.nome || 'Nome não informado' }}</h1>
        <p v-if="perfil.profissao">{{ perfil.profissao }}</p>
        <p v-if="perfil.cidade">{{ perfil.cidade }}</p>
        <ul class="habilidades">
          <li v-for="habilidade in perfil.habilidades" :key="habilidade">{{ habilidade }}</li>
        </ul>
      </header>
      <section v-if="perfil.descricao">
        <h2>Sobre o profissional</h2>
        <p class="descricao">{{ perfil.descricao }}</p>
      </section>
      <section>
        <h2>Portfólio público</h2>
        <p v-if="!perfil.portfolio.length">Nenhum projeto público disponível.</p>
        <div class="grade">
          <article
            v-for="(projeto, index) in perfil.portfolio"
            :key="projeto.id ?? index"
            class="profissional projeto projeto-card"
          >
            <RouterLink
              class="projeto-card-link"
              :to="{
                name: 'projeto-publico-freelancer',
                params: { id: perfil.id, projetoId: projeto.id },
                query: route.query,
              }"
              :aria-labelledby="`projeto-titulo-${index}`"
            >
              <img
                v-if="projeto.imagem"
                :src="projeto.imagem"
                alt=""
                loading="lazy"
                referrerpolicy="no-referrer"
                @error="$event.target.hidden = true"
              />
              <h3 :id="`projeto-titulo-${index}`">{{ projeto.titulo || 'Projeto sem título' }}</h3>
              <p v-if="projeto.categoria">{{ projeto.categoria }}</p>
              <p v-if="projeto.descricao" class="descricao">{{ projeto.descricao }}</p>
              <ul class="habilidades">
                <li v-for="tag in projeto.tags" :key="tag">{{ tag }}</li>
              </ul>
            </RouterLink>
            <a
              v-if="projeto.link"
              class="projeto-card-externo"
              :href="projeto.link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir projeto (nova aba)
            </a>
          </article>
        </div>
      </section>
    </template>
  </main>
</template>
<style scoped src="../styles/freelancers-publicos.css"></style>
