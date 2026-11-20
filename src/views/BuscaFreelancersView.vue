<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FreelancerCard from '../components/freelancers/FreelancerCard.vue'
import { listarFreelancers, erroFreelancers } from '../services/freelancersPublicosService.js'
import { sessao } from '../services/authSession.js'
import { habilidadesSugeridas, opcoesTags } from '../utils/tags.js'
const route = useRoute()
const router = useRouter()
const categoria = ref(typeof route.query.habilidade === 'string' ? route.query.habilidade : '')
const categoriasRecebidas = ref([])
const categorias = computed(() =>
  opcoesTags(habilidadesSugeridas, categoriasRecebidas.value, [categoria.value]),
)
const paginaInicial = Number(route.query.page)
const page = ref(
  Number.isInteger(paginaInicial) && paginaInicial > 0 && paginaInicial <= 1000000
    ? paginaInicial
    : 1,
)
const dados = ref(null)
const carregando = ref(false)
const erro = ref('')
let controller
let revisao = 0
async function carregar() {
  controller?.abort()
  controller = new AbortController()
  const atual = ++revisao
  carregando.value = true
  erro.value = ''
  dados.value = null
  try {
    const resultado = await listarFreelancers(
      { habilidade: categoria.value, page: page.value },
      controller.signal,
    )
    if (atual !== revisao) return
    dados.value = resultado
    categoriasRecebidas.value = opcoesTags(
      categoriasRecebidas.value,
      resultado.results.flatMap((perfil) => perfil.habilidades),
    )
  } catch (error) {
    if (atual === revisao && error.code !== 'ERR_CANCELED') erro.value = erroFreelancers(error)
  } finally {
    if (atual === revisao) carregando.value = false
  }
}
watch(categoria, () => {
  page.value = 1
  carregar()
})
function mudarPagina(delta) {
  if (carregando.value || !(delta > 0 ? dados.value?.next : dados.value?.previous)) return
  page.value += delta
  carregar()
}
function abrir(id) {
  router.push({
    path: `/empresa/freelancers/${id}`,
    query: { habilidade: categoria.value, page: String(page.value) },
  })
}
function primeiraPagina() {
  page.value = 1
  carregar()
}
function abrirChat(id) {
  router.push({ name: 'mensagens', query: { freelancer: String(id) } })
}
watch(
  () => sessao.revisao,
  () => {
    controller?.abort()
    revisao++
    dados.value = null
    categoriasRecebidas.value = []
    carregando.value = false
    erro.value = 'A sessão foi alterada. Entre novamente.'
  },
)
onBeforeUnmount(() => {
  revisao++
  controller?.abort()
})
carregar()
</script>
<template>
  <main class="diretorio mrj-ui" :aria-busy="carregando">
    <header>
      <span class="selo-diretorio" aria-hidden="true"
        ><svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20v-2a6 6 0 0 1 12 0v2M16 5a3 3 0 0 1 0 6M21 20v-2a6 6 0 0 0-3-5" /></svg
      ></span>
      <p class="sobretitulo">Profissionais MaRuJoBs</p>
      <h1>Freelancers</h1>
      <p>Escolha um profissional para conversar.</p>
    </header>
    <div class="seletor-categoria">
      <label for="categoria-freelancer">Categoria</label>
      <select id="categoria-freelancer" v-model="categoria">
        <option value="">Todas as categorias</option>
        <option v-for="opcao in categorias" :key="opcao" :value="opcao">{{ opcao }}</option>
      </select>
    </div>
    <p v-if="carregando" role="status">Carregando freelancers…</p>
    <div v-else-if="erro" role="alert">
      <p>{{ erro }}</p>
      <button type="button" @click="carregar">Tentar novamente</button>
      <button v-if="page > 1" type="button" @click="primeiraPagina">
        Voltar à primeira página
      </button>
    </div>
    <template v-else-if="dados">
      <div class="resumo-profissionais">
        <h2>Profissionais</h2>
        <span class="total-profissionais" role="status"
          >{{ dados.count }} {{ dados.count === 1 ? 'disponível' : 'disponíveis' }}</span
        >
      </div>
      <p v-if="!dados.results.length" class="estado-vazio">
        {{
          categoria
            ? 'Nenhum freelancer disponível nesta categoria.'
            : 'Nenhum freelancer publicou o perfil neste ambiente. Para aparecer aqui, o profissional precisa marcar “Aparecer na lista de freelancers” em Editar perfil e salvar.'
        }}
      </p>
      <ul class="lista-profissionais" aria-label="Freelancers disponíveis">
        <li v-for="perfil in dados.results" :key="perfil.id">
          <FreelancerCard :perfil="perfil" @abrir="abrir" @chat="abrirChat" />
        </li>
      </ul>
      <nav
        v-if="dados.previous || dados.next"
        aria-label="Páginas de profissionais"
        class="paginacao"
      >
        <button :disabled="!dados.previous || page <= 1" @click="mudarPagina(-1)">Anterior</button
        ><span aria-current="page">Página {{ page }}</span
        ><button :disabled="!dados.next || page >= 1000000" @click="mudarPagina(1)">Próxima</button>
      </nav>
    </template>
  </main>
</template>
<style scoped src="../styles/freelancers-publicos.css"></style>
