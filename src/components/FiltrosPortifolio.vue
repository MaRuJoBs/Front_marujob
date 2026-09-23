<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  projetos: {
    type: Array,
    default: () => []
  },
  pesquisa: {
    type: String,
    default: ''
  }
})

const emit = defineEmits([
  'aplicar-filtros',
  'limpar-filtros'
])

const aberto = ref(false)
const categoriasSelecionadas = ref([])
const tecnologiasSelecionadas = ref([])

const categorias = [
  'Website',
  'Aplicativo',
  'UI / UX',
  'Branding',
  'Social Media',
  'Marketing',
  'Design Gráfico'
]

const tecnologias = computed(() => {
  return [
    ...new Set(
      props.projetos.flatMap(projeto => projeto.tags || [])
    )
  ]
})

const abrirFiltros = () => {
  aberto.value = true
}

const fecharFiltros = () => {
  aberto.value = false
}

const aplicarFiltros = () => {
  const resultado = props.projetos.filter((projeto) => {
    if (categoriasSelecionadas.value.length > 0) {
      const categoriaProjeto = String(
        projeto.categoria || ''
      ).toLowerCase().trim()

      const encontrouCategoria =
        categoriasSelecionadas.value.some(categoria =>
          categoriaProjeto === categoria.toLowerCase().trim()
        )

      if (!encontrouCategoria) {
        return false
      }
    }

    if (tecnologiasSelecionadas.value.length > 0) {
      const tagsProjeto = (projeto.tags || []).map(tag =>
        String(tag).toLowerCase().trim()
      )

      const encontrouTecnologia =
        tecnologiasSelecionadas.value.some(tecnologia =>
          tagsProjeto.includes(tecnologia.toLowerCase().trim())
        )

      if (!encontrouTecnologia) {
        return false
      }
    }

    return true
  })

  emit('aplicar-filtros', resultado)
  fecharFiltros()
}

const limparFiltros = () => {
  categoriasSelecionadas.value = []
  tecnologiasSelecionadas.value = []

  emit('limpar-filtros')
  fecharFiltros()
}
</script>

<template>
  <div class="filtros-container">
    <button
      class="botao-filtro"
      @click="abrirFiltros"
    >
      <FontAwesomeIcon :icon="['fas', 'sliders']" />
    </button>

    <div
      v-if="aberto"
      class="filtros-overlay"
      @click.self="fecharFiltros"
    >
      <div class="filtros-painel">

        <header class="filtros-header">
          <div>
            <h2>Filtros</h2>
            <p>Refine seus projetos</p>
          </div>

          <button
            class="botao-fechar"
            @click="fecharFiltros"
          >
            <FontAwesomeIcon :icon="['fas', 'xmark']" />
          </button>
        </header>

        <main class="filtros-conteudo">

          <section class="filtro-secao">
            <h3>Categoria</h3>

            <div class="opcoes">
              <label
                v-for="categoria in categorias"
                :key="categoria"
              >
                <input
                  v-model="categoriasSelecionadas"
                  type="checkbox"
                  :value="categoria"
                >

                <span>{{ categoria }}</span>
              </label>
            </div>
          </section>

          <section class="filtro-secao">
            <h3>Tecnologia / Tag</h3>

            <div class="opcoes">
              <label
                v-for="tecnologia in tecnologias"
                :key="tecnologia"
              >
                <input
                  v-model="tecnologiasSelecionadas"
                  type="checkbox"
                  :value="tecnologia"
                >

                <span>{{ tecnologia }}</span>
              </label>
            </div>
          </section>

        </main>

        <footer class="filtros-footer">
          <button
            type="button"
            class="botao-limpar"
            @click="limparFiltros"
          >
            Limpar filtros
          </button>

          <button
            type="button"
            class="botao-aplicar"
            @click="aplicarFiltros"
          >
            Aplicar filtros
          </button>
        </footer>

      </div>
    </div>
  </div>
</template>

<style scoped>
.filtros-container {
  display: inline-block;
}

.botao-filtro {
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 15px;
  background: #5b3cc4;
  color: white;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filtros-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 2000;
}

.filtros-painel {
  width: 100%;
  max-width: 420px;
  max-height: 85vh;
  background: white;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.filtros-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.filtros-header h2 {
  color: #49357b;
  font-size: 20px;
  margin: 0;
}

.filtros-header p {
  color: #888;
  font-size: 13px;
  margin-top: 4px;
}

.botao-fechar {
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 50%;
  background: #f2f2f2;
  color: #555;
  cursor: pointer;
}

.filtros-conteudo {
  overflow-y: auto;
  padding: 20px;
}

.filtro-secao {
  margin-bottom: 25px;
}

.filtro-secao h3 {
  color: #49357b;
  font-size: 16px;
  margin-bottom: 12px;
}

.opcoes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.opcoes label {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f7f7f7;
  border-radius: 10px;
  color: #333;
  font-size: 14px;
  cursor: pointer;
}

.opcoes input {
  width: 18px;
  height: 18px;
  accent-color: #5b3cc4;
}

.filtros-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #ddd;
  background: white;
}

.filtros-footer button {
  flex: 1;
  height: 48px;
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.botao-limpar {
  background: #eeeeee;
  color: #555;
}

.botao-aplicar {
  background: #5b3cc4;
  color: white;
}

.botao-aplicar:hover {
  background: #4928b0;
}
</style>