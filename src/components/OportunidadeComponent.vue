<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faMagnifyingGlass, faHeart, faClock, faAlignLeft } from '@fortawesome/free-solid-svg-icons'
import Filtros from '@/components/Filtros.vue'
import FavoritoButton from '@/components/FavoritoButton.vue'
import { useOportunidades } from '@/composables/useOportunidades'
import { formatarPreco } from '@/utils/oportunidades'
import { formularioDaVaga, statusVaga } from '@/utils/vagaForm'
const painelFiltros = ref(null)
const {
  jobs,
  erroFavorito,
  pesquisa,
  filtros,
  pagina,
  total,
  proxima,
  anterior,
  carregando,
  erro,
  carregar,
  aplicar,
  limpar,
} = useOportunidades()
</script>
<template>
  <main class="body oportunidades mrj-ui freelancer-page">
    <header class="cabecalho-listagem">
      <svg class="ondas" viewBox="0 0 420 120" preserveAspectRatio="none" aria-hidden="true">
        <path fill="#b58be4" d="M0 0H420V57C330 98 295 4 208 29S64 64 0 7Z" />
        <path fill="#cba9ed" d="M0 0H420V17C358 78 306 72 250 40S139 74 80 42 23 17 0 0Z" />
        <path
          fill="#dfc9f3"
          opacity=".7"
          d="M0 0C65 67 109 54 172 26S282 75 420 20V72C295 94 262 41 186 50S69 91 0 38Z"
        />
      </svg>
      <RouterLink to="/home" class="voltar-pagina"
        ><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Início</RouterLink
      >
      <p class="eyebrow">Explore novos caminhos</p>
      <h1>Encontre seu próximo projeto</h1>
      <p class="descricao-pagina">Oportunidades para colocar seu talento em prática.</p>
      <div class="busca-filtros">
        <label class="busca"
          ><FontAwesomeIcon :icon="faMagnifyingGlass" aria-hidden="true" /><input
            v-model="pesquisa"
            type="search"
            aria-label="Pesquisar por título"
            placeholder="Buscar oportunidades..."
        /></label>
        <Filtros
          ref="painelFiltros"
          :filtros="filtros"
          :tags-disponiveis="jobs.map((job) => job.tag)"
          @aplicar-filtros="aplicar"
          @limpar-filtros="limpar"
        />
      </div>
      <div class="chips" aria-label="Filtro por tag">
        <button
          class="chip"
          :class="{ selecionado: !filtros.tag }"
          :aria-pressed="!filtros.tag"
          @click="aplicar({ ...filtros, tag: '' })"
        >
          Todos
        </button>
        <button
          v-if="filtros.tag"
          class="chip selecionado"
          aria-pressed="true"
          @click="aplicar({ ...filtros, tag: '' })"
        >
          {{ filtros.tag }} <span aria-hidden="true">×</span
          ><span class="sr-only">Remover tag</span>
        </button>
        <button class="chip escolher-tag" @click="painelFiltros?.abrirTags($event.currentTarget)">
          {{ filtros.tag ? 'Alterar tag' : 'Selecionar tag' }}
        </button>
      </div>
      <div v-if="filtros.preco_min || filtros.preco_max || filtros.tag" class="filtros-ativos">
        <span v-if="filtros.preco_min" class="filtro-aplicado"
          >Mín. {{ formatarPreco(filtros.preco_min) }}</span
        >
        <span v-if="filtros.preco_max" class="filtro-aplicado"
          >Máx. {{ formatarPreco(filtros.preco_max) }}</span
        >
        <button
          v-if="filtros.tag || filtros.preco_min || filtros.preco_max"
          class="remover"
          @click="limpar"
        >
          Remover filtros
        </button>
      </div>
    </header>
    <section class="resultados" aria-label="Oportunidades disponíveis">
      <p v-if="erroFavorito" class="estado" role="alert">{{ erroFavorito }}</p>
      <div v-if="carregando" class="estado" role="status">
        <span class="carregador" aria-hidden="true"></span> Carregando oportunidades...
      </div>
      <div v-else-if="erro" class="estado" role="alert">
        <p>{{ erro }}</p>
        <button class="details" @click="carregar(1)">Tentar novamente na primeira página</button>
      </div>
      <template v-else>
        <p v-if="!jobs.length" class="estado" role="status">Nenhuma oportunidade encontrada.</p>
        <p v-else class="resumo-resultados" role="status">
          {{ total }} oportunidades · Página {{ pagina }}
        </p>
        <template v-for="(job, index) in jobs" :key="job.id">
          <article class="vaga">
            <header class="vaga-superior">
              <div class="vaga-categoria">
                <span class="vaga-icone"
                  ><i class="fa-solid fa-briefcase" aria-hidden="true"></i
                ></span>
                <p v-if="job.tag" class="tag">{{ job.tag }}</p>
              </div>
              <FavoritoButton :id="job.id" />
            </header>
            <div class="vaga-titulo">
              <h2 :title="job.titulo">{{ job.titulo || 'Título não informado' }}</h2>
            </div>
            <div class="info">
              <p
                v-if="formularioDaVaga(job).modalidade || job.cidade || job.uf || job.status"
                class="tag"
              >
                {{
                  [
                    formularioDaVaga(job).modalidade,
                    [job.cidade, job.uf].filter(Boolean).join(' / '),
                    statusVaga[job.status],
                  ]
                    .filter(Boolean)
                    .join(' · ')
                }}
              </p>
              <p v-if="job.descricao" class="descricao">
                <FontAwesomeIcon :icon="faAlignLeft" aria-hidden="true" /><span>{{
                  formularioDaVaga(job).descricao
                }}</span>
              </p>
              <div class="linha-final">
                <p v-if="job.tempo != null && job.tempo !== ''">
                  <FontAwesomeIcon :icon="faClock" aria-hidden="true" /><span
                    >Tempo: {{ job.tempo }}</span
                  >
                </p>
                <span v-if="job.preco != null && job.preco !== ''" class="preco"
                  ><span class="sr-only">Preço informado: </span>R$
                  {{ formatarPreco(job.preco) }}</span
                >
              </div>
            </div>
            <footer class="vaga-inferior">
              <RouterLink class="details" :to="`/oportunidade/${job.id}`"
                >Ver detalhes <i class="fa-solid fa-arrow-right" aria-hidden="true"></i
              ></RouterLink>
            </footer>
          </article>
          <aside v-if="index === 1" class="obs">
            <FontAwesomeIcon :icon="faHeart" aria-hidden="true" />
            <p>
              Salve oportunidades em seus favoritos!<br /><span
                >Toque no coração para adicionar</span
              >
            </p>
          </aside>
        </template>
        <nav class="paginacao" aria-label="Paginação de oportunidades">
          <p>{{ total }} oportunidades</p>
          <div>
            <button class="chip" :disabled="!anterior" @click="carregar(pagina - 1)">
              Anterior</button
            ><span>Página {{ pagina }}</span
            ><button class="chip" :disabled="!proxima" @click="carregar(pagina + 1)">
              Próxima
            </button>
          </div>
        </nav>
      </template>
    </section>
  </main>
</template>
<style scoped src="../styles/freelancer.css"></style>
<style scoped>
.body {
  min-height: 100dvh;
  padding: 24px 20px 112px;
}
.cabecalho-listagem {
  position: relative;
  margin-bottom: 24px;
}
.cabecalho-listagem:has(.filtros-overlay) {
  z-index: 2000;
}
.ondas {
  display: none;
}
.busca-filtros {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
}
.busca {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
  background: white;
  border: 1px solid var(--mrj-color-border);
  border-radius: 12px;
  color: var(--mrj-color-text-secondary);
}
.busca input {
  width: 100%;
  min-width: 0;
  height: 48px;
  font-size: 0.875rem;
  background: transparent;
  border: 0;
  color: var(--mrj-color-text);
  outline: none;
}
.busca:focus-within {
  outline: 3px solid var(--mrj-color-focus);
  outline-offset: 3px;
}
.busca input::placeholder {
  color: var(--mrj-color-text-secondary);
}
.chips,
.filtros-ativos {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}
.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 14px;
  min-height: 44px;
  max-width: 100%;
  border-radius: 99px;
  border: 1px solid var(--mrj-color-border-subtle);
  background: white;
  color: var(--mrj-color-text-secondary);
  font-size: 0.8125rem;
}
.chip.selecionado {
  background: var(--mrj-color-secondary);
  border-color: transparent;
  color: var(--mrj-color-primary);
  font-weight: 600;
}
.chip:hover:not(:disabled) {
  border-color: var(--mrj-color-primary);
}
.filtro-aplicado {
  padding: 6px 10px;
  border: 0;
  border-radius: 8px;
  background: var(--mrj-color-secondary);
  color: var(--mrj-color-primary);
  font-size: 0.75rem;
  max-width: 100%;
}
.remover {
  border: 0;
  background: transparent;
  color: var(--mrj-color-primary);
  font-size: 0.8125rem;
}
.resultados {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr));
  gap: 16px;
}
.resumo-resultados {
  grid-column: 1/-1;
  color: var(--mrj-color-text-secondary);
  font-size: 0.8125rem;
  padding-bottom: 4px;
}
.vaga {
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: white;
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: 16px;
  box-shadow: var(--mrj-shadow-card);
}
.vaga-superior {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 20px 0;
}
.vaga-titulo {
  min-width: 0;
  padding: 14px 20px 0;
}
.vaga-categoria {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.vaga-icone {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex: 0 0 40px;
  border-radius: 12px;
  background: var(--mrj-color-secondary);
  color: var(--mrj-color-primary);
}
.vaga h2 {
  font-size: 1rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.tag {
  font-size: 0.75rem;
  color: var(--mrj-color-text-secondary);
  margin-top: 6px !important;
}
.vaga-categoria .tag {
  display: inline-block;
  background: var(--mrj-color-secondary);
  color: var(--mrj-color-primary);
  padding: 4px 8px;
  border-radius: 6px;
}
.info {
  display: grid;
  gap: 12px;
  flex: 1;
  padding: 16px 20px;
  font-size: 0.8125rem;
  color: var(--mrj-color-text-secondary);
}
.info p {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.info svg {
  flex: 0 0 14px;
  margin-top: 4px;
  color: #8b7ba8;
}
.descricao span {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.linha-final {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}
.preco {
  font-size: 1rem;
  font-weight: 600;
  color: var(--mrj-color-text);
}
.vaga-inferior {
  display: flex;
  padding: 0 20px 20px;
}
.details {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 44px;
  padding: 10px 16px;
  border: 0;
  border-radius: 10px;
  background: var(--mrj-color-secondary);
  color: var(--mrj-color-primary);
  font-size: 0.8125rem;
  font-weight: 600;
  text-decoration: none;
}
.details:hover {
  background: var(--mrj-color-primary-hover);
  color: white;
}
.vaga:hover {
  border-color: #d7ccef;
  box-shadow: 0 8px 28px #4930800c;
}
.obs {
  grid-column: 1/-1;
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--mrj-color-secondary);
  color: var(--mrj-color-primary);
  padding: 16px 20px;
  border-radius: 12px;
  font-size: 0.8125rem;
}
.obs svg {
  flex-shrink: 0;
  font-size: 20px;
}
.obs span {
  color: var(--mrj-color-text-secondary);
}
.paginacao {
  grid-column: 1/-1;
  margin-top: 16px;
  font-size: 0.8125rem;
  color: var(--mrj-color-text-secondary);
}
.paginacao > p {
  text-align: center;
  margin-bottom: 12px;
}
.paginacao > div {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}
.estado {
  grid-column: 1/-1;
}
.estado .details {
  margin-top: 12px;
}
.carregador {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid #d8cdef;
  border-top-color: var(--mrj-color-primary);
  border-radius: 50%;
  margin-right: 6px;
}
</style>
