<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faMagnifyingGlass, faHeart, faClock, faAlignLeft } from '@fortawesome/free-solid-svg-icons'
import Filtros from '@/components/Filtros.vue'
import { useOportunidades } from '@/composables/useOportunidades'
import { formatarPreco } from '@/utils/oportunidades'
const painelFiltros = ref(null)
const {
  jobs,
  favoritos,
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
  toggleFavorito,
} = useOportunidades()
</script>
<template>
  <main class="body oportunidades">
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
        <button class="chip escolher-tag" @click="painelFiltros?.abrir()">
          {{ filtros.tag ? 'Alterar tag' : 'Selecionar tag' }}
        </button>
      </div>
      <div
        v-if="pesquisa || filtros.preco_min || filtros.preco_max || filtros.tag"
        class="filtros-ativos"
      >
        <button v-if="pesquisa" class="filtro-aplicado" @click="pesquisa = ''">
          {{ pesquisa }} <span aria-hidden="true">×</span
          ><span class="sr-only">Limpar pesquisa</span>
        </button>
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
        <p v-else class="sr-only" role="status">{{ total }} oportunidades · Página {{ pagina }}</p>
        <template v-for="(job, index) in jobs" :key="job.id">
          <article class="vaga">
            <header class="vaga-superior">
              <div class="vaga-titulo">
                <h2>{{ job.titulo || 'Título não informado' }}</h2>
                <p v-if="job.tag" class="tag">{{ job.tag }}</p>
              </div>
              <button
                class="favorito"
                :class="{ ativo: favoritos.includes(job.id) }"
                :aria-label="
                  favoritos.includes(job.id) ? 'Remover dos favoritos' : 'Salvar nos favoritos'
                "
                :aria-pressed="favoritos.includes(job.id)"
                @click="toggleFavorito(job)"
              >
                <FontAwesomeIcon :icon="faHeart" />
              </button>
            </header>
            <div class="info">
              <p v-if="job.descricao" class="descricao">
                <FontAwesomeIcon :icon="faAlignLeft" aria-hidden="true" /><span>{{
                  job.descricao
                }}</span>
              </p>
              <div class="linha-final">
                <p v-if="job.tempo != null && job.tempo !== ''">
                  <FontAwesomeIcon :icon="faClock" aria-hidden="true" /><span
                    >Tempo: {{ job.tempo }}</span
                  >
                </p>
                <span v-if="job.preco != null && job.preco !== ''" class="preco"
                  ><span class="sr-only">Preço informado: </span
                  >{{ formatarPreco(job.preco) }}</span
                >
              </div>
            </div>
            <footer class="vaga-inferior">
              <RouterLink class="details" :to="`/oportunidade/${job.id}`">Ver detalhes</RouterLink>
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
<style scoped>
.body {
  --roxo: #7150a6;
  --texto: #533581;
  --secundario: #796197;
  --borda: #dcd0e8;
  min-height: 100dvh;
  padding-bottom: calc(112px + env(safe-area-inset-bottom));
  background: #eee7f4;
  color: var(--texto);
  font-family: Arial, sans-serif;
  line-height: 1.4;
}
.cabecalho-listagem {
  position: relative;
  isolation: isolate;
  padding: 43px 16px 16px;
  background: linear-gradient(180deg, #d9c5ed, #e7dbf1);
}
.ondas {
  position: absolute;
  inset: 0 0 auto;
  width: 100%;
  height: 85px;
  z-index: -1;
}
.busca-filtros {
  display: flex;
  align-items: center;
  gap: 8px;
}
.busca {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 12px;
  background: #f4edf9;
  border: 1px solid #d9c9e8;
  border-radius: 24px;
  color: #8265af;
  box-shadow: 0 2px 4px #60468112;
}
.busca input {
  width: 100%;
  min-width: 0;
  height: 40px;
  font: inherit;
  font-size: 16px;
  color: var(--texto);
  background: transparent;
  border: 0;
  outline: none;
}
.busca input::placeholder {
  color: #7b639a;
  font-style: italic;
  font-size: 12px;
}
.busca:focus-within {
  outline: 2px solid var(--roxo);
  outline-offset: 2px;
}
.chips {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  padding: 10px 0 2px;
  scrollbar-width: thin;
}
.chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-shrink: 0;
  min-height: 34px;
  max-width: 100%;
  padding: 6px 15px;
  border: 1px solid transparent;
  border-radius: 12px;
  background: #eae1f3;
  color: #755994;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
  overflow-wrap: anywhere;
}
.chip.selecionado {
  background: var(--roxo);
  color: #fff;
}
.escolher-tag {
  border-color: #d9c9e8;
  background: #f0e8f7;
}
.filtros-ativos {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  padding-top: 10px;
}
.filtro-aplicado {
  border: none;
  border-radius: 16px;
  background: #dfd1ee;
  padding: 7px 11px;
  color: #694b8b;
  font: inherit;
  font-size: 12px;
  overflow-wrap: anywhere;
  max-width: 100%;
}
button.filtro-aplicado {
  cursor: pointer;
  min-height: 34px;
}
.remover {
  min-height: 34px;
  border: none;
  background: none;
  color: #725394;
  font: inherit;
  font-size: 12px;
  padding: 5px 2px;
  cursor: pointer;
}
.resultados {
  padding: 14px 16px 0;
}
.vaga {
  overflow-wrap: anywhere;
  background: #f6f1fa;
  border: 1px solid #e5daed;
  border-radius: 12px;
  box-shadow: 0 2px 3px #4c356719;
  margin-bottom: 16px;
}
.vaga-superior {
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px 7px;
  border-bottom: 1px solid var(--borda);
}
.vaga-titulo {
  min-width: 0;
  padding-top: 1px;
}
h2 {
  margin: 0;
  color: #533581;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.3;
}
.tag {
  color: var(--secundario);
  font-size: 13px;
  line-height: 1.4;
  margin: 3px 0 0;
}
.favorito {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  margin: -5px -7px -4px 0;
  border: none;
  background: transparent;
  color: #b4acbc;
  font-size: 19px;
  cursor: pointer;
}
.favorito.ativo {
  color: #e72343;
}
.info {
  display: grid;
  gap: 6px;
  padding: 8px 12px 6px;
  color: #795c9b;
  font-size: 13px;
}
.info p {
  display: flex;
  align-items: start;
  gap: 7px;
  margin: 0;
  line-height: 1.45;
  min-width: 0;
}
.info svg {
  flex-shrink: 0;
  width: 13px;
  margin-top: 3px;
  color: #9671bd;
}
.descricao span {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.linha-final {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}
.linha-final p {
  flex: 1;
}
.preco {
  display: inline-block;
  flex-shrink: 0;
  padding: 4px 9px;
  border: 1px solid #d9cce6;
  border-radius: 14px;
  background: #fdfaff;
  color: #5c3a8b;
  font-size: 12px;
  font-weight: 600;
  line-height: 1.25;
  box-shadow: 0 1px 2px #4c35670c;
}
.vaga-inferior {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 0 0 8px;
}
.vaga-inferior::before,
.vaga-inferior::after {
  content: '';
  height: 1px;
  flex: 1;
  background: var(--borda);
}
.details {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-height: 34px;
  min-width: 130px;
  padding: 6px 20px;
  border: none;
  border-radius: 24px;
  background: var(--roxo);
  color: #fff;
  text-decoration: none;
  font: inherit;
  font-size: 13px;
  line-height: 1.4;
  cursor: pointer;
}
.obs {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  margin: 4px 0 20px;
  background: #e6ddef;
  border: 1px solid #d1c1df;
  border-radius: 11px;
}
.obs svg {
  font-size: 23px;
  flex-shrink: 0;
  color: #b68ed7;
}
.obs p {
  margin: 0;
  color: #745894;
  font-size: 12px;
  line-height: 1.45;
  font-style: italic;
}
.paginacao {
  margin-top: 24px;
  padding-bottom: 8px;
  color: var(--secundario);
  font-size: 12px;
}
.paginacao p {
  text-align: center;
  margin: 0 0 10px;
}
.paginacao > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
button:disabled {
  opacity: 0.45;
  cursor: default;
}
button:focus-visible,
a:focus-visible {
  outline: 2px solid #68449b;
  outline-offset: 3px;
}
.estado {
  background: #fcfaff;
  border: 1px solid var(--borda);
  border-radius: 12px;
  padding: 20px;
  font-size: 14px;
  line-height: 1.6;
}
.estado p {
  margin: 0 0 14px;
}
.carregador {
  display: inline-block;
  width: 14px;
  height: 14px;
  margin-right: 4px;
  border: 2px solid #d7c6e8;
  border-top-color: var(--roxo);
  border-radius: 50%;
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
  .cabecalho-listagem {
    padding-left: 20px;
    padding-right: 20px;
  }
  .resultados {
    padding-left: 20px;
    padding-right: 20px;
  }
}
</style>
