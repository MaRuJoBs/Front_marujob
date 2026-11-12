<script setup>
import { computed, nextTick, ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSliders } from '@fortawesome/free-solid-svg-icons'
import { parametrosOportunidades } from '@/utils/oportunidades'
import { categoriasVaga } from '@/utils/vagaForm'
import { opcoesTags } from '@/utils/tags'
const props = defineProps({
  filtros: { type: Object, required: true },
  tagsDisponiveis: { type: Array, default: () => [] },
})
const emit = defineEmits(['aplicar-filtros', 'limpar-filtros'])
const aberto = ref(false)
const secao = ref('todos')
const rascunho = ref({})
const erro = ref('')
const primeiroCampo = ref(null)
const botaoAbrir = ref(null)
let botaoRetorno = null
const tags = computed(() =>
  opcoesTags(
    categoriasVaga.map((categoria) => categoria.value),
    props.tagsDisponiveis,
    [rascunho.value.tag],
  ),
)
const rotuloTag = (tag) => categoriasVaga.find((categoria) => categoria.value === tag)?.label || tag
function abrir(modo = 'todos', origem = null) {
  secao.value = modo === 'tags' ? 'tags' : 'todos'
  botaoRetorno = origem || botaoAbrir.value
  rascunho.value = { ...props.filtros }
  erro.value = ''
  aberto.value = true
  nextTick(() => primeiroCampo.value?.focus())
}
function fechar() {
  aberto.value = false
  nextTick(() => botaoRetorno?.focus())
}
function teclaModal(event) {
  if (event.key !== 'Tab') return
  const campos = Array.from(event.currentTarget.querySelectorAll('button, input, select'))
  const primeiro = campos[0],
    ultimo = campos.at(-1)
  if (event.shiftKey && document.activeElement === primeiro) {
    event.preventDefault()
    ultimo.focus()
  } else if (!event.shiftKey && document.activeElement === ultimo) {
    event.preventDefault()
    primeiro.focus()
  }
}
function aplicar() {
  try {
    parametrosOportunidades(rascunho.value)
    emit('aplicar-filtros', { ...rascunho.value })
    fechar()
  } catch (e) {
    erro.value = e.message
  }
}
function limpar() {
  if (secao.value === 'tags') emit('aplicar-filtros', { ...props.filtros, tag: '' })
  else emit('limpar-filtros')
  fechar()
}
defineExpose({ abrir, abrirTags: (origem) => abrir('tags', origem) })
</script>
<template>
  <div class="filtros-container">
    <button
      ref="botaoAbrir"
      class="botao-filtro"
      :aria-expanded="aberto"
      aria-haspopup="dialog"
      @click="abrir()"
    >
      <span>Filtros</span><FontAwesomeIcon :icon="faSliders" aria-hidden="true" />
    </button>
    <div v-if="aberto" class="filtros-overlay" @click.self="fechar" @keydown.esc="fechar">
      <form
        class="filtros-painel"
        role="dialog"
        aria-modal="true"
        :aria-label="secao === 'tags' ? 'Selecionar tag' : 'Filtros de oportunidades'"
        @submit.prevent="aplicar"
        @keydown="teclaModal"
      >
        <header class="filtros-header">
          <h2>{{ secao === 'tags' ? 'Selecionar tag' : 'Filtros' }}</h2>
          <button type="button" class="botao-fechar" aria-label="Fechar filtros" @click="fechar">
            ×
          </button>
        </header>
        <div class="filtros-conteudo">
          <section class="filtro-secao">
            <h3>Tag</h3>
            <label for="filtro-tag">Selecione a área da oportunidade</label>
            <div class="input-wrapper">
              <select id="filtro-tag" ref="primeiroCampo" v-model="rascunho.tag">
                <option value="">Todas as áreas</option>
                <option v-for="tag in tags" :key="tag" :value="tag">{{ rotuloTag(tag) }}</option>
              </select>
            </div>
          </section>
          <section v-if="secao !== 'tags'" class="filtro-secao">
            <h3>Preço</h3>
            <div class="campos">
              <div class="campo">
                <label for="preco-min">Mínimo</label>
                <div class="input-wrapper">
                  <input id="preco-min" v-model="rascunho.preco_min" inputmode="decimal" />
                </div>
              </div>
              <div class="campo">
                <label for="preco-max">Máximo</label>
                <div class="input-wrapper">
                  <input id="preco-max" v-model="rascunho.preco_max" inputmode="decimal" />
                </div>
              </div>
            </div>
          </section>
          <p v-if="erro" role="alert">{{ erro }}</p>
        </div>
        <footer class="filtros-footer">
          <button type="button" class="limpar" @click="limpar">
            {{ secao === 'tags' ? 'Limpar tag' : 'Limpar filtros' }}</button
          ><button class="aplicar" type="submit">
            {{ secao === 'tags' ? 'Aplicar tag' : 'Aplicar filtros' }}
          </button>
        </footer>
      </form>
    </div>
  </div>
</template>
<style scoped>
button:focus-visible {
  outline: 2px solid #68449b;
  outline-offset: 3px;
}
.campo {
  min-width: 0;
}
input,
select {
  box-sizing: border-box;
  min-width: 0;
  font-size: 16px !important;
}

/* ===== CONTAINER ===== */
.filtros-container {
  display: inline-block;
}

/* ===== BOTÃO DE FILTRO ===== */
.botao-filtro {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  min-height: var(--mrj-control-height-md);
  background-color: var(--mrj-color-primary);
  color: #fff;
  border: none;
  border-radius: var(--mrj-radius-md);
  font-family: inherit;
  font-size: var(--mrj-font-size-sm);
  font-weight: 400;
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
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* ===== PAINEL (bottom sheet) ===== */
.filtros-painel {
  width: 100%;
  max-width: 420px;
  max-height: 85vh;
  max-height: 85dvh;
  background: #fff;
  border-radius: 20px 20px 0 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  animation: slideUp 0.25s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
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
  width: 44px;
  height: 44px;
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

.categorias input[type='checkbox'] {
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
  font-size: var(--mrj-font-size-sm);
  color: var(--mrj-color-text-secondary);
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
  border: 1px solid var(--mrj-color-border);
  border-radius: 8px;
  padding: 8px 10px;
  background: #fff;
}

.input-wrapper span {
  font-size: 13px;
  color: #888;
}

.input-wrapper input,
.input-wrapper select {
  border: none;
  outline: none;
  width: 100%;
  font-size: 14px;
  color: #1a1a1a;
  background: transparent;
  min-height: 28px;
  font-family: inherit;
}
.input-wrapper select {
  min-height: 32px;
  cursor: pointer;
}
.input-wrapper select:focus {
  outline: none;
}
.filtros-container .filtros-painel .input-wrapper input {
  border: 0;
  padding: 0;
  background: transparent;
  min-height: 28px;
}

/* ===== FOOTER ===== */
.filtros-footer {
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #eee;
  padding-bottom: max(16px, env(safe-area-inset-bottom));
}

.filtros-footer button {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  min-height: var(--mrj-control-height-md);
  font-family: inherit;
}

.limpar {
  background: #f2f2f2;
  color: #555;
}

.aplicar {
  background: var(--mrj-color-primary);
  color: #fff;
}

.aplicar:active {
  background: #5a22b5;
}

.input-wrapper:focus-within,
button:focus-visible {
  outline: var(--mrj-focus-width) solid var(--mrj-color-focus);
  outline-offset: var(--mrj-focus-offset);
}
.filtros-conteudo [role='alert'] {
  color: var(--mrj-color-danger);
  overflow-wrap: anywhere;
}
.aplicar:hover,
.botao-filtro:hover {
  background: var(--mrj-color-primary-hover);
}
@media (min-width: 768px) {
  .filtros-overlay {
    align-items: center;
    padding: 24px;
  }
  .filtros-painel {
    border-radius: var(--mrj-radius-lg);
  }
}
@media (prefers-reduced-motion: reduce) {
  .filtros-overlay,
  .filtros-painel {
    animation: none;
  }
  .botao-filtro {
    transition: none;
  }
}
</style>
