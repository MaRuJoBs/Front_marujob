<script setup>
import { watch } from 'vue'
import { RouterLink } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faRotateRight } from '@fortawesome/free-solid-svg-icons'
import FavoritoButton from '@/components/FavoritoButton.vue'
import { useFavoritosStore } from '@/stores/favoritos'
import { formatarPreco } from '@/utils/oportunidades'

const store = useFavoritosStore()

function atualizar() {
  store.carregarFavoritos()
  store.carregarOportunidades({ recarregar: true })
}

watch(
  () => store.favoritos.slice(),
  () => store.carregarOportunidades(),
  { immediate: true },
)
</script>

<template>
  <main class="body mrj-ui freelancer-page">
    <RouterLink to="/home" class="voltar-pagina"
      ><i class="fa-solid fa-arrow-left" aria-hidden="true"></i> Início</RouterLink
    >
    <div class="header">
      <div class="title">
        <FontAwesomeIcon :icon="['fas', 'heart']" />
        <h1>Favoritos</h1>
      </div>
      <button
        type="button"
        class="btn-atualizar"
        aria-label="Atualizar favoritos"
        :disabled="store.carregando"
        @click="atualizar"
      >
        <FontAwesomeIcon :icon="faRotateRight" aria-hidden="true" />
      </button>
    </div>
    <p class="descricao-pagina">Suas oportunidades salvas, em um só lugar.</p>

    <p v-if="store.erroFavorito" class="estado" role="alert">{{ store.erroFavorito }}</p>
    <p v-if="store.carregando" class="estado" role="status">
      Carregando oportunidades favoritas...
    </p>
    <div v-else-if="!store.favoritos.length && !store.erroFavorito" class="estado" role="status">
      <p>Você ainda não adicionou nenhuma oportunidade aos favoritos.</p>
      <RouterLink class="details" to="/freelances">Explorar oportunidades</RouterLink>
    </div>

    <section
      v-for="item in store.oportunidadesFavoritas"
      :key="item.id"
      class="bloco-vaga"
      :aria-busy="item.status === 'carregando'"
    >
      <div class="parte-superior">
        <div>
          <h2 :title="item.job?.titulo">
            {{
              item.job?.titulo ||
              (item.status === 'carregando' ? 'Carregando...' : `Oportunidade #${item.id}`)
            }}
          </h2>
          <p v-if="item.job?.tag" class="company">{{ item.job.tag }}</p>
        </div>

        <FavoritoButton :id="item.id" />
      </div>

      <p v-if="item.status === 'carregando'" class="estado" role="status">
        Consultando oportunidade...
      </p>
      <div v-else-if="item.erro" class="estado" :role="item.status === 'erro' ? 'alert' : 'status'">
        <p>{{ item.erro }}</p>
        <button
          type="button"
          class="details"
          :disabled="store.carregando"
          @click="store.carregarOportunidades({ recarregar: true })"
        >
          Tentar novamente
        </button>
      </div>
      <template v-else-if="item.job">
        <div class="divisao"></div>

        <div class="info">
          <p v-if="item.job.tempo != null && item.job.tempo !== ''">
            <FontAwesomeIcon :icon="['fas', 'briefcase']" />
            {{ item.job.tempo }} horas
          </p>

          <p>
            <FontAwesomeIcon :icon="['fas', 'briefcase']" />
            Freelancer
          </p>
        </div>

        <div class="parte-inferior">
          <RouterLink class="details" :to="`/oportunidade/${item.id}`"> Ver detalhes </RouterLink>

          <span class="price">
            {{
              item.job.preco == null || item.job.preco === ''
                ? 'Preço não informado'
                : `R$ ${formatarPreco(item.job.preco)}`
            }}
          </span>
        </div>
      </template>
    </section>
  </main>
</template>

<style scoped src="../styles/freelancer.css"></style>
<style scoped>
.body {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 19rem), 1fr));
  gap: 16px;
  align-content: start;
  min-height: 100dvh;
  padding: 24px 20px 25vh;
}
.voltar-pagina,
.header,
.descricao-pagina,
.estado {
  grid-column: 1/-1;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.title {
  display: flex;
  align-items: center;
  gap: 12px;
}
.title svg {
  color: var(--mrj-color-primary);
  font-size: 24px;
}
.btn-atualizar {
  display: grid;
  place-items: center;
  width: 44px;
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: 12px;
  color: var(--mrj-color-primary);
  background: white;
}
.descricao-pagina {
  margin-top: -8px !important;
  margin-bottom: 8px !important;
}
.bloco-vaga {
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: white;
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: 16px;
  box-shadow: var(--mrj-shadow-card);
}
.parte-superior {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 20px 0;
}
.parte-superior > div {
  min-width: 0;
}
.parte-superior h2 {
  font-size: 1rem;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.company {
  color: var(--mrj-color-text-secondary);
  font-size: 0.75rem;
  margin-top: 6px !important;
}
.divisao {
  height: 1px;
  margin: 16px 20px 0;
  background: var(--mrj-color-border-subtle);
}
.info {
  display: grid;
  gap: 8px;
  padding: 16px 20px;
  font-size: 0.8125rem;
  color: var(--mrj-color-text-secondary);
}
.info p {
  display: flex;
  align-items: center;
  gap: 8px;
}
.info svg {
  width: 14px;
  color: var(--mrj-color-primary);
}
.parte-inferior {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 0 20px 20px;
  margin-top: auto;
}
.price {
  order: -1;
  font-size: 1.125rem;
  font-weight: 600;
}
.details {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 10px 16px;
  border: 0;
  border-radius: 10px;
  background: var(--mrj-color-primary);
  color: white;
  text-decoration: none;
  font-size: 0.8125rem;
  font-weight: 600;
}
.details:hover {
  background: var(--mrj-color-primary-hover);
}
.bloco-vaga > .estado {
  margin: 16px;
}
</style>
