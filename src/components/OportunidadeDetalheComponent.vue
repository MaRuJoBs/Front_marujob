<script setup>
import { useRoute, RouterLink } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faArrowLeft,
  faClock,
  faWallet,
  faFileLines,
  faRectangleList,
  faPaperPlane,
  faTag,
} from '@fortawesome/free-solid-svg-icons'
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import FavoritoButton from '@/components/FavoritoButton.vue'
import { useFavoritosLocais } from '@/composables/useFavoritosLocais'
import { obterOportunidade } from '@/services/freelanceService'
import { erroOportunidades, formatarPreco } from '@/utils/oportunidades'
import { useCandidatura } from '@/composables/useCandidatura'
import { formularioDaVaga, detalhesComplementaresVaga } from '@/utils/vagaForm'
const informacoes = computed(() => (job.value ? formularioDaVaga(job.value) : null))
const complementos = computed(() => detalhesComplementaresVaga(job.value))
const route = useRoute()
const job = ref(null)
const {
  candidatura,
  carregando: consultandoCandidatura,
  enviando: enviandoCandidatura,
  permitida: candidaturaPermitida,
  podeEnviar: podeCandidatar,
  erro: erroCandidatura,
  feedback: feedbackCandidatura,
  consultar: consultarCandidatura,
  enviar: candidatar,
} = useCandidatura(() => job.value?.id)
const { erroFavorito } = useFavoritosLocais()
const carregando = ref(false)
const erro = ref('')
let controlador
let revisao = 0
async function carregar() {
  const atual = ++revisao
  controlador?.abort()
  controlador = new AbortController()
  carregando.value = true
  job.value = null
  erro.value = ''
  try {
    const data = await obterOportunidade(route.params.id, controlador.signal)
    if (atual === revisao) job.value = data
  } catch (e) {
    if (atual === revisao) erro.value = erroOportunidades(e, true)
  } finally {
    if (atual === revisao) carregando.value = false
  }
}
watch(() => route.params.id, carregar, { immediate: true })
onBeforeUnmount(() => {
  ++revisao
  controlador?.abort()
})
</script>
<template>
  <main class="oportunidade mrj-ui freelancer-page">
    <header class="topo">
      <RouterLink class="botao-icone" to="/freelances" aria-label="Voltar à listagem"
        ><FontAwesomeIcon :icon="faArrowLeft"
      /></RouterLink>
      <div class="cabecalho">
        <h1>{{ job?.titulo || (carregando ? 'Carregando...' : 'Oportunidade') }}</h1>
        <p v-if="job?.tag">{{ job.tag }}</p>
      </div>
      <FavoritoButton v-if="job" :id="job.id" />
      <span v-else aria-hidden="true"></span>
    </header>
    <p v-if="erroFavorito" class="estado" role="alert">{{ erroFavorito }}</p>
    <p v-if="carregando" class="estado" role="status">Carregando oportunidade...</p>
    <div v-else-if="erro" class="estado" role="alert">
      <p>{{ erro }}</p>
      <button class="btn-candidatar" @click="carregar">Tentar novamente</button>
    </div>
    <template v-else-if="job">
      <div class="blocos">
        <section v-if="informacoes.descricao" class="card sobre">
          <div class="icone-card"><FontAwesomeIcon :icon="faFileLines" aria-hidden="true" /></div>
          <div class="conteudo-card">
            <h2>Sobre a oportunidade</h2>
            <p class="texto">{{ informacoes.descricao }}</p>
          </div>
        </section>
        <section class="card informacoes-card">
          <div class="icone-card">
            <FontAwesomeIcon :icon="faRectangleList" aria-hidden="true" />
          </div>
          <div class="conteudo-card">
            <h2>Informações Principais</h2>
            <dl class="lista-info">
              <div v-if="job.tag" class="info-item">
                <dt>
                  <FontAwesomeIcon :icon="faTag" aria-hidden="true" /><span class="sr-only"
                    >Tag</span
                  >
                </dt>
                <dd>{{ job.tag }}</dd>
              </div>
              <div v-if="job.tempo != null && job.tempo !== ''" class="info-item">
                <dt>
                  <FontAwesomeIcon :icon="faClock" aria-hidden="true" /><span class="sr-only"
                    >Tempo informado</span
                  >
                </dt>
                <dd>Tempo informado: {{ job.tempo }}</dd>
              </div>
              <div
                v-for="[rotulo, valor] in complementos"
                :key="rotulo"
                class="info-item complemento"
              >
                <dt>{{ rotulo }}:</dt>
                <dd>{{ valor }}</dd>
              </div>
            </dl>
            <div class="valor">
              <span class="sr-only">Preço informado: </span
              ><span class="preco"
                ><FontAwesomeIcon :icon="faWallet" aria-hidden="true" />
                {{ formatarPreco(job.preco) }}</span
              >
            </div>
          </div>
        </section>
        <section
          v-for="campo in ['requisitos', 'beneficios'].filter((c) => job[c])"
          :key="campo"
          class="card"
        >
          <div class="icone-card"><FontAwesomeIcon :icon="faFileLines" aria-hidden="true" /></div>
          <div class="conteudo-card">
            <h2>{{ campo === 'requisitos' ? 'Requisitos' : 'Benefícios' }}</h2>
            <p class="texto">{{ job[campo] }}</p>
          </div>
        </section>
      </div>
      <section class="acoes" aria-label="Candidatura">
        <button
          class="btn-candidatar"
          aria-describedby="candidatura-ajuda"
          :disabled="!podeCandidatar"
          :aria-busy="consultandoCandidatura || enviandoCandidatura"
          @click="candidatar"
        >
          <FontAwesomeIcon :icon="faPaperPlane" aria-hidden="true" />
          {{ enviandoCandidatura ? 'Confirmando candidatura...' : 'Quero me candidatar' }}
        </button>
        <p id="candidatura-ajuda" class="ajuda" role="status">
          <template v-if="!candidaturaPermitida"
            >A candidatura é exclusiva para usuários autenticados.</template
          >
          <template v-else-if="consultandoCandidatura">Consultando sua candidatura...</template>
          <template v-else-if="enviandoCandidatura">Aguarde a confirmação do envio.</template>
          <template v-else-if="candidatura"
            >Sua candidatura está {{ candidatura.status }}.</template
          >
          <template v-else-if="podeCandidatar"
            >Você pode se candidatar a esta oportunidade.</template
          >
          <template v-else>Consulte sua candidatura para continuar.</template>
        </p>
        <p v-if="feedbackCandidatura" class="ajuda" role="status">{{ feedbackCandidatura }}</p>
        <p v-if="erroCandidatura" class="ajuda" role="alert">{{ erroCandidatura }}</p>
        <button
          v-if="candidaturaPermitida && erroCandidatura"
          class="btn-candidatar"
          :disabled="consultandoCandidatura || enviandoCandidatura"
          @click="consultarCandidatura"
        >
          Consultar candidatura novamente
        </button>
      </section>
    </template>
  </main>
</template>
<style scoped src="../styles/freelancer.css"></style>
<style scoped>
.oportunidade {
  min-height: 100dvh;
  padding: 24px 20px 112px;
}
.topo {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 44px;
  align-items: start;
  gap: 12px;
  margin-bottom: 28px;
}
.botao-icone {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: 12px;
  color: var(--mrj-color-text-secondary);
  text-decoration: none;
  background: white;
}
.cabecalho {
  min-width: 0;
  padding-top: 6px;
}
.cabecalho h1 {
  font-size: clamp(1.25rem, 2.5vw, 1.875rem);
  line-height: 1.4;
}
.cabecalho p {
  margin-top: 8px;
  color: var(--mrj-color-text-secondary);
  font-size: 0.875rem;
}
.blocos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 28rem), 1fr));
  gap: 20px;
  align-items: start;
}
.card {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 24px;
  background: white;
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: 16px;
  box-shadow: var(--mrj-shadow-card);
  min-width: 0;
}
.informacoes-card {
  grid-row: span 2;
}
.icone-card {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  background: var(--mrj-color-secondary);
  color: var(--mrj-color-primary);
  border-radius: 10px;
  font-size: 14px;
}
.conteudo-card {
  flex: 1;
  min-width: 0;
}
.conteudo-card h2 {
  font-size: 1rem;
  margin: 3px 0 16px;
}
.texto {
  white-space: pre-wrap;
  font-size: 0.875rem;
  line-height: 1.8;
  color: var(--mrj-color-text-secondary);
}
.lista-info {
  display: grid;
  gap: 14px;
  margin: 0;
}
.info-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.875rem;
  color: var(--mrj-color-text-secondary);
}
.info-item dt {
  flex-shrink: 0;
  color: var(--mrj-color-text-secondary);
}
.info-item dd {
  min-width: 0;
  margin: 0;
}
.complemento {
  flex-wrap: wrap;
  gap: 4px 8px;
}
.complemento dt {
  font-weight: 600;
  color: var(--mrj-color-text);
}
.valor {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--mrj-color-border-subtle);
}
.preco {
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  font-size: 1.5rem;
  color: var(--mrj-color-primary);
  font-weight: 600;
}
.preco svg {
  font-size: 18px;
}
.acoes {
  max-width: 480px;
  margin: 28px 0 0 auto;
}
.btn-candidatar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  min-height: 48px;
  padding: 12px 18px;
  border: 0;
  border-radius: 12px;
  background: var(--mrj-color-primary);
  color: white;
  font-size: 0.875rem;
  font-weight: 600;
}
.btn-candidatar:hover:not(:disabled) {
  background: var(--mrj-color-primary-hover);
}
.ajuda {
  margin-top: 12px !important;
  font-size: 0.8125rem;
  color: var(--mrj-color-text-secondary);
  text-align: center;
}
.ajuda[role='alert'] {
  color: var(--mrj-color-danger);
}
.estado {
  margin-bottom: 20px;
}
</style>
