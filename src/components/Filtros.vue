<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  jobs: {
    type: Array,
    default: () => []
  },
  pesquisa: {
    type: String,
    default: ''
  }
})

const aberto = ref(false)

const categoriasSelecionadas = ref([])
const tempoMinimo = ref('')
const tempoMaximo = ref('')
const precoMinimo = ref('')
const precoMaximo = ref('')




const emit = defineEmits(['aplicar-filtros', 'limpar-filtros'])

const abrirFiltros = () => {
  aberto.value = true
}

const fecharFiltros = () => {
  aberto.value = false
}

const aplicarFiltros = () => {
  const termoPesquisa = props.pesquisa.toLowerCase().trim()

  const resultado = props.jobs.filter((job) => {

    if (termoPesquisa) {
      const titulo = String(job.titulo || '').toLowerCase()
      const descricao = String(job.descricao || '').toLowerCase()
      const tag = String(job.tag || '').toLowerCase()

      const encontrouPesquisa =
        titulo.startsWith(termoPesquisa) ||
        descricao.includes(termoPesquisa) ||
        tag.includes(termoPesquisa)

      if (!encontrouPesquisa) {
        return false
      }
    }

 
    if (categoriasSelecionadas.value.length > 0) {
      const categoriaJob = String(job.tag || '')
        .toLowerCase()
        .trim()

      const encontrouCategoria =
        categoriasSelecionadas.value.some(
          (categoria) =>
            categoriaJob === categoria.toLowerCase().trim()
        )

      if (!encontrouCategoria) {
        return false
      }
    }

  
    if (
      tempoMinimo.value !== '' &&
      Number(job.tempo) < Number(tempoMinimo.value)
    ) {
      return false
    }

 
    if (
      tempoMaximo.value !== '' &&
      Number(job.tempo) > Number(tempoMaximo.value)
    ) {
      return false
    }

  
    if (
      precoMinimo.value !== '' &&
      Number(job.preco) < Number(precoMinimo.value)
    ) {
      return false
    }


    if (
      precoMaximo.value !== '' &&
      Number(job.preco) > Number(precoMaximo.value)
    ) {
      return false
    }

    return true
  })

  emit('aplicar-filtros', resultado)

  fecharFiltros()
}

const filtrarJobs = () => {
  aplicarFiltros()
  fecharFiltros()
}

const limparFiltros = () => {
  categoriasSelecionadas.value = []
  tempoMinimo.value = ''
  tempoMaximo.value = ''
  precoMinimo.value = ''
  precoMaximo.value = ''

  emit('limpar-filtros')

  fecharFiltros()
}

watch(
  () => props.pesquisa,
  () => {
    aplicarFiltros()
  }
)
</script>

<template>
  <div class="filtros-container">

    
    <button class="botao-filtro" @click="abrirFiltros">
      <span class="fa-solid fa-filter"></span>
      Filtros
    </button>


    
    <div v-if="aberto" class="filtros-overlay">

      <div class="filtros-painel">

        
        <header class="filtros-header">

          <div>
            <h2>Filtros</h2>
            <p>Refine sua busca</p>
          </div>

          <button
            class="botao-fechar"
            @click="fecharFiltros"
          >
            <span class="fa-solid fa-xmark"></span>
          </button>

        </header>


        
        <main class="filtros-conteudo">

          <section class="filtro-secao">

            <h3>Categoria</h3>

            <div class="categorias">

              <label>
                <input
  v-model="categoriasSelecionadas"
  type="checkbox"
  value="Desenvolvimento Web"
>
                <span>Desenvolvimento Web</span>
              </label>

              <label>
                <input
  v-model="categoriasSelecionadas"
  type="checkbox"
  value="Mobile"
>
                <span>Mobile</span>
              </label>

              <label>
                <input
  v-model="categoriasSelecionadas"
  type="checkbox"
  value="UI/UX"
>
                <span>UI/UX</span>
              </label>

              <label>
                <input
  v-model="categoriasSelecionadas"
  type="checkbox"
  value="Design Gráfico"
>
                <span>Design Gráfico</span>
              </label>

              <label>
                <input
  v-model="categoriasSelecionadas"
  type="checkbox"
  value="Marketing"
>
                <span>Marketing</span>
              </label>

              <label>
                <input
  v-model="categoriasSelecionadas"
  type="checkbox"
  value="Vídeo"
>
                <span>Edição de Vídeo</span>
              </label>

              <label>
                <input
  v-model="categoriasSelecionadas"
  type="checkbox"
  value="Suporte"
>
                <span>Suporte Técnico</span>
              </label>

              <label>
                <input
  v-model="categoriasSelecionadas"
  type="checkbox"
  value="Outros"
>
                <span>Outros</span>
              </label>

            </div>

          </section>


          <!-- TEMPO -->
          <section class="filtro-secao">

            <h3>Tempo estimado</h3>

            <div class="campos">

              <div class="campo">
                <label>Mínimo</label>

                <div class="input-wrapper">
                  <input
  v-model="tempoMinimo"
  type="number"
  min="0"
  placeholder="0"
>
                  <span>h</span>
                </div>
              </div>

              <span class="separador">até</span>

              <div class="campo">
                <label>Máximo</label>

                <div class="input-wrapper">
                  <input
  v-model="tempoMaximo"
  type="number"
  min="0"
  placeholder="∞"
>
                  <span>h</span>
                </div>
              </div>

            </div>

          </section>

          <section class="filtro-secao">

            <h3>Preço</h3>

            <div class="campos">

              <div class="campo">
                <label>Mínimo</label>

                <div class="input-wrapper">
                  <span>R$</span>

                  <input
  v-model="precoMinimo"
  type="number"
  min="0"
  placeholder="0"
>
                </div>
              </div>

              <span class="separador">até</span>

              <div class="campo">
                <label>Máximo</label>

                <div class="input-wrapper">
                  <span>R$</span>

                  <input
  v-model="precoMaximo"
  type="number"
  min="0"
  placeholder="∞"
>
                </div>
              </div>

            </div>

          </section>

        </main>

        <footer class="filtros-footer">

          <button
  class="limpar"
  @click="limparFiltros"
>
  Limpar
</button>

<button
  class="aplicar"
  @click="filtrarJobs"
>
  Aplicar filtros
</button>

        </footer>

      </div>

    </div>

  </div>
</template>


<style scoped>
/* ===== CONTAINER ===== */
.filtros-container {
  display: inline-block;
}

/* ===== BOTÃO DE FILTRO ===== */
.botao-filtro {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: #6c2bd9;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.botao-filtro:active {
  background-color: #5a22b5;
}

/* ===== OVERLAY (fundo escuro) ===== */
.filtros-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* ===== PAINEL (bottom sheet) ===== */
.filtros-painel {
  width: 100%;
  max-width: 420px;
  max-height: 85vh;
  background: #fff;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.25s ease-out;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

/* ===== HEADER ===== */
.filtros-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 20px 12px;
  border-bottom: 1px solid #eee;
}

.filtros-header h2 {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.filtros-header p {
  font-size: 13px;
  color: #888;
  margin: 4px 0 0;
}

.botao-fechar {
  background: #f2f2f2;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #555;
  cursor: pointer;
}

.filtros-conteudo {
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
  -webkit-overflow-scrolling: touch;
}

.filtro-secao {
  margin-bottom: 24px;
}

.filtro-secao h3 {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px;
}

/* ===== CATEGORIAS ===== */
.categorias {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.categorias label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #333;
  padding: 8px 10px;
  border-radius: 8px;
  background: #f8f8f8;
}

.categorias input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #6c2bd9;
}

/* ===== CAMPOS (min/max) ===== */
.campos {
  display: flex;
  align-items: center;
  gap: 10px;
}

.campo {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.campo label {
  font-size: 12px;
  color: #888;
}

.separador {
  font-size: 13px;
  color: #999;
  margin-top: 18px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 8px 10px;
  background: #fff;
}

.input-wrapper span {
  font-size: 13px;
  color: #888;
}

.input-wrapper input {
  border: none;
  outline: none;
  width: 100%;
  font-size: 14px;
  color: #1a1a1a;
  background: transparent;
}

/* ===== FOOTER ===== */
.filtros-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #eee;
}

.filtros-footer button {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
}

.limpar {
  background: #f2f2f2;
  color: #555;
}

.aplicar {
  background: #6c2bd9;
  color: #fff;
}

.aplicar:active {
  background: #5a22b5;
}
</style>