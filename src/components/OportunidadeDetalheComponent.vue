<script setup>
import { useRoute, RouterLink } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faArrowLeft,
  faHeart,
  faClock,
  faWallet,
  faFileLines,
  faRectangleList,
  faPaperPlane,
  faTag,
} from '@fortawesome/free-solid-svg-icons'
import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { useFavoritosLocais } from '@/composables/useFavoritosLocais'
import { obterOportunidade } from '@/services/freelanceService'
import { erroOportunidades, formatarPreco } from '@/utils/oportunidades'
const route = useRoute()
const job = ref(null)
const { favoritos, erroFavorito, toggleFavorito } = useFavoritosLocais()
const isFavorite = computed(() => job.value && favoritos.value.includes(job.value.id))
const carregando = ref(false)
const erro = ref('')
let controlador
let revisao = 0
function favoritar() {
  if (job.value) toggleFavorito(job.value)
}
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
  <main class="oportunidade">
    <header class="topo">
      <RouterLink class="botao-icone" to="/freelances" aria-label="Voltar à listagem"
        ><FontAwesomeIcon :icon="faArrowLeft"
      /></RouterLink>
      <div class="cabecalho">
        <h1>{{ job?.titulo || (carregando ? 'Carregando...' : 'Oportunidade') }}</h1>
        <p v-if="job?.tag">{{ job.tag }}</p>
      </div>
      <button
        v-if="job"
        class="botao-icone favorito"
        :class="{ ativo: isFavorite }"
        :aria-label="isFavorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'"
        :aria-pressed="Boolean(isFavorite)"
        @click="favoritar"
      >
        <FontAwesomeIcon :icon="faHeart" />
      </button>
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
        <section v-if="job.descricao" class="card sobre">
          <div class="icone-card"><FontAwesomeIcon :icon="faFileLines" aria-hidden="true" /></div>
          <div class="conteudo-card">
            <h2>Sobre a oportunidade</h2>
            <p class="texto">{{ job.descricao }}</p>
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
      </div>
      <section class="acoes" aria-label="Candidatura">
        <button class="btn-candidatar" aria-describedby="candidatura-ajuda">
          <FontAwesomeIcon :icon="faPaperPlane" aria-hidden="true" /> Quero me candidatar
        </button>
        <p id="candidatura-ajuda" class="ajuda">
          Candidatura ainda não disponível nesta interface.
        </p>
      </section>
    </template>
  </main>
</template>
<style scoped>
.oportunidade {
  --roxo: #7150a6;
  --texto: #533581;
  --secundario: #796197;
  min-height: 100dvh;
  padding: 16px 16px calc(112px + env(safe-area-inset-bottom));
  background: #f5f0fc;
  color: var(--texto);
  font-family: Arial, sans-serif;
  line-height: 1.45;
  overflow-wrap: anywhere;
}
.topo {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 40px;
  align-items: start;
  gap: 8px;
  margin: 0 -4px 22px;
}
.botao-icone {
  display: inline-grid;
  place-items: center;
  width: 40px;
  min-height: 44px;
  text-decoration: none;
  border: 0;
  background: transparent;
  color: #8261b0;
  font-size: 20px;
  cursor: pointer;
}
.cabecalho {
  min-width: 0;
  padding-top: 7px;
  text-align: center;
}
.cabecalho h1 {
  margin: 0;
  color: #533581;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.35;
}
.cabecalho p {
  color: #80639f;
  margin: 3px 0 0;
  font-size: 13px;
  line-height: 1.35;
}
.favorito {
  color: #b4acbc;
}
.favorito.ativo {
  color: #e72343;
}
.blocos {
  display: grid;
  gap: 12px;
}
.card {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  align-items: start;
  column-gap: 10px;
  padding: 16px 12px;
  border: 1px solid #f0e9f7;
  border-radius: 13px;
  background: #fdfbff;
}
.sobre {
  min-height: 124px;
}
.icone-card {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 9px;
  background: #eee6f8;
  color: #7c58aa;
  font-size: 13px;
}
.conteudo-card {
  min-width: 0;
  padding-top: 3px;
}
h2 {
  margin: 0 0 10px;
  color: #59398d;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.35;
}
.texto {
  margin: 0;
  color: #514363;
  font-size: 14px;
  line-height: 1.55;
  white-space: pre-wrap;
}
.informacoes-card .conteudo-card {
  display: flex;
  flex-direction: column;
  min-height: 120px;
}
.lista-info {
  display: grid;
  gap: 10px;
  margin: 0;
}
.info-item {
  display: flex;
  align-items: start;
  gap: 8px;
  color: #80619f;
  font-size: 14px;
  line-height: 1.45;
}
.info-item dt {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 15px;
  padding-top: 3px;
  flex-shrink: 0;
  color: #8f6bb6;
}
.info-item dd {
  margin: 0;
}
.valor {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  margin-top: auto;
}
.preco {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 9px;
  background: #fff;
  border: 1px solid #ddd0e9;
  border-radius: 14px;
  box-shadow: 0 1px 3px #4d356714;
  color: #5c3a8b;
  font-size: 12px;
  line-height: 1.4;
}
.preco svg {
  font-size: 11px;
  color: #9478b3;
}
.acoes {
  margin-top: 24px;
  padding: 0 4px;
}
.btn-candidatar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 44px;
  border: 0;
  border-radius: 24px;
  padding: 10px 14px;
  background: var(--roxo);
  color: #fff;
  font: inherit;
  font-size: 14px;
  line-height: 1.4;
  cursor: pointer;
}
.btn-candidatar svg {
  font-size: 13px;
}
.ajuda {
  margin: 10px 12px 0;
  color: #79658c;
  font-size: 12px;
  line-height: 1.5;
  text-align: center;
}
.estado {
  padding: 20px;
  border: 1px solid #ded1ea;
  border-radius: 13px;
  background: #fdfbff;
  font-size: 14px;
  line-height: 1.6;
}
.estado p {
  margin: 0 0 14px;
}
button:focus-visible,
a:focus-visible {
  outline: 2px solid #68449b;
  outline-offset: 3px;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}
@media (min-width: 375px) {
  .oportunidade {
    padding-left: 20px;
    padding-right: 20px;
  }
  .card {
    padding: 16px 14px;
  }
}
</style>
