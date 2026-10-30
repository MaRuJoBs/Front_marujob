<script setup>
import { nextTick, ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faSliders } from '@fortawesome/free-solid-svg-icons'
import { parametrosOportunidades } from '@/utils/oportunidades'
const props = defineProps({ filtros: { type: Object, required: true } })
const emit = defineEmits(['aplicar-filtros', 'limpar-filtros'])
const aberto = ref(false)
const rascunho = ref({})
const erro = ref('')
const primeiroCampo = ref(null)
const botaoAbrir = ref(null)
function abrir() {
  rascunho.value = { ...props.filtros }
  erro.value = ''
  aberto.value = true
  nextTick(() => primeiroCampo.value?.focus())
}
function fechar() {
  aberto.value = false
  nextTick(() => botaoAbrir.value?.focus())
}
function teclaModal(event) {
  if (event.key !== 'Tab') return
  const campos = Array.from(event.currentTarget.querySelectorAll('button, input'))
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
  emit('limpar-filtros')
  fechar()
}
defineExpose({ abrir })
</script>
<template>
  <div class="filtros-container">
    <button
      ref="botaoAbrir"
      class="botao-filtro"
      :aria-expanded="aberto"
      aria-haspopup="dialog"
      @click="abrir"
    >
      <span>Filtros</span><FontAwesomeIcon :icon="faSliders" aria-hidden="true" />
    </button>
    <div v-if="aberto" class="filtros-overlay" @click.self="fechar" @keydown.esc="fechar">
      <form
        class="filtros-painel"
        role="dialog"
        aria-modal="true"
        aria-label="Filtros de oportunidades"
        @submit.prevent="aplicar"
        @keydown="teclaModal"
      >
        <header class="filtros-header">
          <h2>Filtros</h2>
          <button type="button" class="botao-fechar" aria-label="Fechar filtros" @click="fechar">
            ×
          </button>
        </header>
        <div class="filtros-conteudo">
          <section class="filtro-secao">
            <h3>Tag</h3>
            <label for="filtro-tag">Informe a tag da oportunidade</label>
            <div class="input-wrapper">
              <input id="filtro-tag" ref="primeiroCampo" v-model="rascunho.tag" type="text" />
            </div>
          </section>
          <section class="filtro-secao">
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
          <button type="button" class="limpar" @click="limpar">Limpar filtros</button
          ><button class="aplicar" type="submit">Aplicar filtros</button>
        </footer>
      </form>
    </div>
  </div>
</template>
<style scoped>
button:focus-visible,
input:focus-visible {
  outline: 2px solid #68449b;
  outline-offset: 3px;
}
.campo {
  min-width: 0;
}
input {
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
  min-height: 40px;
  background-color: #7050a6;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 12px;
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
