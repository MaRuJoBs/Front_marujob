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
  <main class="body">
    <div class="header">
      <div class="title">
        <FontAwesomeIcon :icon="['fas', 'heart']" />
        <span>Favoritos</span>
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
          <h3>
            {{
              item.job?.titulo ||
              (item.status === 'carregando' ? 'Carregando...' : `Oportunidade #${item.id}`)
            }}
          </h3>
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

<style scoped>
.body {
  min-height: 100vh;
  padding: 20px;
  font-family: 'Poppins', sans-serif;
  background: linear-gradient(180deg, #cbb6ff, #f5f3ff);
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  box-sizing: border-box;
  padding-bottom: 25vh;
}

.header {
  background: #f4f1ff;
  border-radius: 22px;
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #6b4bc4;
  font-size: 18px;
}

.title svg {
  font-size: 22px;
  color: #8b5cf6;
}

.btn-atualizar {
  border: none;
  background: transparent;
  color: #8a69d4;
  font-size: 22px;
  cursor: pointer;
  min-width: 44px;
  min-height: 44px;
}

.bloco-vaga {
  background: #f7f5ff;
  border-radius: 16px;
  margin-bottom: 18px;
  overflow: hidden;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
  overflow-wrap: anywhere;
}

.parte-superior {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px 15px 10px;
  gap: 8px;
}

.parte-superior > div {
  min-width: 0;
}

.parte-superior h3 {
  margin: 0;
  color: #5637b4;
  font-size: 18px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.company {
  margin-top: 5px;
  color: #7d72a7;
  font-size: 16px;
}

.divisao {
  height: 1px;
  background: #cfc7e8;
}

.info {
  padding: 12px 15px 5px;
}

.info p {
  margin: 8px 0;
  color: #6d5b9d;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info svg {
  color: #6546c2;
}

.parte-inferior {
  display: flex;
  align-items: center;
  padding: 10px 15px 18px;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.details {
  background: #6b4bc4;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  box-sizing: border-box;
  text-decoration: none;
  max-width: 100%;
}

.price {
  background: #f4f1ff;
  border: 2px solid #cfc7e8;
  padding: 7px 15px;
  border-radius: 20px;
  color: #5637b4;
  font-size: 16px;
  font-weight: bold;
}

.estado {
  padding: 16px;
  color: #5637b4;
  background: #f7f5ff;
  border-radius: 16px;
  overflow-wrap: anywhere;
}
.estado p {
  margin: 0 0 12px;
}
button:disabled {
  opacity: 0.5;
  cursor: default;
}
button:focus-visible,
a:focus-visible {
  outline: 2px solid #673fd7;
  outline-offset: 3px;
}
</style>
