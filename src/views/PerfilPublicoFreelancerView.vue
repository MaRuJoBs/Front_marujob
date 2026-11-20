<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { obterFreelancer, erroFreelancers } from '../services/freelancersPublicosService.js'
import { sessao } from '../services/authSession.js'
const route = useRoute()
const router = useRouter()
const perfil = ref(null)
const carregando = ref(false)
const erro = ref('')
const fotoFalhou = ref(false)
let controller
let revisao = 0
async function carregar() {
  controller?.abort()
  controller = new AbortController()
  const atual = ++revisao
  perfil.value = null
  fotoFalhou.value = false
  erro.value = ''
  carregando.value = true
  try {
    const resultado = await obterFreelancer(route.params.id, controller.signal)
    if (atual === revisao) perfil.value = resultado
  } catch (error) {
    if (atual === revisao && error.code !== 'ERR_CANCELED') erro.value = erroFreelancers(error)
  } finally {
    if (atual === revisao) carregando.value = false
  }
}
watch(() => route.params.id, carregar, { immediate: true })
watch(
  () => sessao.revisao,
  () => {
    controller?.abort()
    revisao++
    perfil.value = null
    carregando.value = false
    erro.value = 'A sessão foi alterada. Entre novamente.'
  },
)
onBeforeUnmount(() => {
  revisao++
  controller?.abort()
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
            class="profissional projeto"
          >
            <img
              v-if="projeto.imagem"
              :src="projeto.imagem"
              alt=""
              loading="lazy"
              referrerpolicy="no-referrer"
              @error="$event.target.hidden = true"
            />
            <h3>{{ projeto.titulo || 'Projeto sem título' }}</h3>
            <p v-if="projeto.categoria">{{ projeto.categoria }}</p>
            <p v-if="projeto.descricao" class="descricao">{{ projeto.descricao }}</p>
            <ul class="habilidades">
              <li v-for="tag in projeto.tags" :key="tag">{{ tag }}</li>
            </ul>
            <a v-if="projeto.link" :href="projeto.link" target="_blank" rel="noopener noreferrer"
              >Abrir projeto (nova aba)</a
            >
          </article>
        </div>
      </section>
    </template>
  </main>
</template>
<style scoped src="../styles/freelancers-publicos.css"></style>
