<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const isSubmitting = ref(false)
const showToast = ref(false)

const form = ref({
  titulo: '',
  categoria: '',
  tipoContratacao: '',
  modalidade: 'Presencial',
  descricao: '',
  requisitos: '',
  beneficios: '',
  salarioMin: '',
  salarioMax: '',
  nivelExperiencia: '',
  jornada: '',
})

const errors = ref({
  titulo: '',
  categoria: '',
  tipoContratacao: '',
  descricao: '',
})

const categorias = [
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'design', label: 'Design' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'rh', label: 'Recursos Humanos' },
  { value: 'vendas', label: 'Vendas' },
  { value: 'operacoes', label: 'Operações' },
  { value: 'outros', label: 'Outros' },
]

const tiposContratacao = [
  { value: 'clt', label: 'CLT' },
  { value: 'pj', label: 'PJ' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'estagio', label: 'Estágio' },
  { value: 'temporario', label: 'Temporário' },
]

const modalidades = [
  { value: 'Presencial', label: 'Presencial' },
  { value: 'Remoto', label: 'Remoto' },
  { value: 'Híbrido', label: 'Híbrido' },
]

const niveisExperiencia = [
  { value: 'junior', label: 'Júnior' },
  { value: 'pleno', label: 'Pleno' },
  { value: 'senior', label: 'Sênior' },
  { value: 'especialista', label: 'Especialista' },
  { value: 'sem_experiencia', label: 'Sem experiência' },
]

const goBack = () => router.back()

const formatSalary = (field, event) => {
  const value = event.target.value.replace(/\D/g, '')

  form.value[field] = value
    ? `R$ ${Number(value).toLocaleString('pt-BR')}`
    : ''
}

const validate = () => {
  let valid = true

  errors.value = {
    titulo: '',
    categoria: '',
    tipoContratacao: '',
    descricao: '',
  }

  if (!form.value.titulo.trim()) {
    errors.value.titulo = 'O título da vaga é obrigatório.'
    valid = false
  }

  if (!form.value.categoria) {
    errors.value.categoria = 'Selecione uma categoria.'
    valid = false
  }

  if (!form.value.tipoContratacao) {
    errors.value.tipoContratacao = 'Selecione o tipo de contratação.'
    valid = false
  }

  if (!form.value.descricao.trim()) {
    errors.value.descricao = 'A descrição da vaga é obrigatória.'
    valid = false
  }

  return valid
}

const handleSubmit = async () => {
  if (!validate()) return

  isSubmitting.value = true

  try {
    // 🔥 FUTURO BACKEND AQUI
    // await axios.post('/api/vagas', form.value)

    console.log('Payload pronto:', form.value)

    // sucesso real (quando backend existir)
    showToast.value = true

  } catch (error) {
    console.error('Erro ao enviar vaga:', error)
  } finally {
    isSubmitting.value = false
  }
}

const resetForm = () => {
  form.value = {
    titulo: '',
    categoria: '',
    tipoContratacao: '',
    modalidade: 'Presencial',
    descricao: '',
    requisitos: '',
    beneficios: '',
    salarioMin: '',
    salarioMax: '',
    nivelExperiencia: '',
    jornada: '',
  }

  errors.value = {
    titulo: '',
    categoria: '',
    tipoContratacao: '',
    descricao: '',
  }

  showToast.value = false
}
</script>

<template>
  <div class="criar-vaga">

    <header class="header">
      <img src="@/assets/images/fundo.png" alt="" class="header-bg" aria-hidden="true" />
      <div class="header-logo">
        <img src="@/assets/images/logo.png" alt="Logo MaRuJoB's" class="logo-icon" />
        <img src="@/assets/images/slogan.png" alt="MaRuJoB's Freelances" class="logo-slogan" />
      </div>
    </header>

    <main class="conteudo">

      <!-- Titulo da pag -->
      <div class="titulo-row">
        <button class="btn-back" @click="goBack" aria-label="Voltar">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="#5B21B6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>
        <div>
          <h1>Criar Nova Vaga</h1>
          <p class="subtitulo">Preencha as informações da vaga</p>
        </div>
      </div>

      <!-- Formulario -->
      <div class="form-card">
        <form @submit.prevent="handleSubmit" novalidate>

          <div class="campo">
            <label>Título da vaga <span class="obrigatorio">*</span></label>
            <input v-model="form.titulo" type="text" :class="{ erro: errors.titulo }" placeholder="Ex: Designer gráfico" />
            <span v-if="errors.titulo" class="msg-erro">{{ errors.titulo }}</span>
          </div>

          <div class="campo">
            <label>Categoria <span class="obrigatorio">*</span></label>
            <div class="select-wrap">
              <select v-model="form.categoria" :class="{ erro: errors.categoria, placeholder: !form.categoria }">
                <option value="" disabled>Selecione a Categoria</option>
                <option v-for="cat in categorias" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
              </select>
              <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 9L12 15L18 9" stroke="#7C3AED" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <span v-if="errors.categoria" class="msg-erro">{{ errors.categoria }}</span>
          </div>

          <div class="campo">
            <label>Tipo de contratação <span class="obrigatorio">*</span></label>
            <div class="select-wrap">
              <select v-model="form.tipoContratacao" :class="{ erro: errors.tipoContratacao, placeholder: !form.tipoContratacao }">
                <option value="" disabled>Selecione o tipo</option>
                <option v-for="tipo in tiposContratacao" :key="tipo.value" :value="tipo.value">{{ tipo.label }}</option>
              </select>
              <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M6 9L12 15L18 9" stroke="#7C3AED" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <span v-if="errors.tipoContratacao" class="msg-erro">{{ errors.tipoContratacao }}</span>
          </div>

          <div class="campo">
            <label>Modalidade <span class="obrigatorio">*</span></label>
            <div class="toggle-group">
              <button
                v-for="mod in modalidades"
                :key="mod.value"
                type="button"
                :class="{ active: form.modalidade === mod.value }"
                @click="form.modalidade = mod.value"
              >
                {{ mod.label }}
              </button>
            </div>
          </div>

          <div class="campo">
            <label>Descrição da vaga <span class="obrigatorio">*</span></label>
            <textarea v-model="form.descricao" :class="{ erro: errors.descricao }" placeholder="Descreva as principais atividades e responsabilidades..." maxlength="1000" rows="4"></textarea>
            <div class="char-count">{{ form.descricao.length }}/1000</div>
            <span v-if="errors.descricao" class="msg-erro">{{ errors.descricao }}</span>
          </div>

          <div class="campo">
            <label>Requisitos</label>
            <textarea v-model="form.requisitos" placeholder="Liste os requisitos e qualificações necessárias..." maxlength="1000" rows="4"></textarea>
            <div class="char-count">{{ form.requisitos.length }}/1000</div>
          </div>

          <div class="campo">
            <label>Benefícios</label>
            <textarea v-model="form.beneficios" placeholder="Informe os benefícios oferecidos (opcional)..." maxlength="1000" rows="3"></textarea>
            <div class="char-count">{{ form.beneficios.length }}/1000</div>
          </div>

          <div class="campo">
            <label>Faixa salarial</label>
            <div class="salario-row">
              <div class="salario-field">
                <label class="salario-label">Salário mínimo</label>
                <input v-model="form.salarioMin" type="text" placeholder="Ex: R$2.000" @input="formatSalary('salarioMin', $event)" />
              </div>
              <div class="salario-field">
                <label class="salario-label">Salário máximo</label>
                <input v-model="form.salarioMax" type="text" placeholder="Ex: R$3.000" @input="formatSalary('salarioMax', $event)" />
              </div>
            </div>
          </div>

          <div class="campo">
            <label>Nível de experiência</label>
            <div class="select-wrap">
              <select v-model="form.nivelExperiencia" :class="{ placeholder: !form.nivelExperiencia }">
                <option value="" disabled>Selecione o nível</option>
                <option v-for="nivel in niveisExperiencia" :key="nivel.value" :value="nivel.value">{{ nivel.label }}</option>
              </select>
              <svg class="chevron" width="16" height="16" viewBox="0 0 24 24"fill ="none">
                <path d="M6 9L12 15L18 9" stroke="#7C3AED" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
          </div>

          <div class="campo">
            <label>Jornada de trabalho</label>
            <input v-model="form.jornada" type="text" placeholder="Ex: Segunda a Sexta, 9h às 18h" />
          </div>

          <div class="acoes">
            <button type="button" class="btn-cancelar" @click="resetForm">Cancelar</button>
            <button type="submit" class="btn-publicar" :disabled="isSubmitting">
              {{ isSubmitting ? 'Publicando...' : 'Publicar vaga' }}
            </button>
          </div>

        </form>
      </div>
    </main>

    <!-- Toast -->
    <transition name="toast">
      <div v-if="showToast" class="toast">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M5 13L9 17L19 7" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        Vaga publicada com sucesso!
      </div>
    </transition>

  </div>
</template>

<style scoped>
.criar-vaga {
  font-family: 'Poppins', Arial, sans-serif;
  background: #e0d1f9;
  min-height: 100vh;
}

/* HEADER */
.header {
  position: relative;
  overflow: hidden;
  background: #7c3aed;
  min-height: 220px;
}

.header-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
}

.header-logo {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px;
}

.logo-icon {
  width: 120px;
  height: 120px;
}

.logo-slogan {
  height: 150px;
  width: auto;
  filter: brightness(0) invert(1);
  padding-top: 1.6vw;
}

/* CONTEUDO */
.conteudo {
  margin-top: -85px;
  padding: 24px 16px 100px;
  background: #e0d1f9;
  border-radius: 60px 60px 0 0;
  position: relative;
  z-index: 5;
}

.titulo-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 18px;
}

.btn-back {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
}

h1 {
  font-size: 20px;
  font-weight: 700;
  color: #2d1b6e;
  margin: 0;
}

.subtitulo {
  font-size: 13px;
  color: #7c6faa;
  margin: 3px 0 0;
}

/* CARD */
.form-card {
  background: #fff;
  border-radius: 16px;
  padding: 22px 16px;
}

/* CAMPOS */
.campo {
  margin-bottom: 16px;
}

label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #2d1b6e;
  margin-bottom: 6px;
}

.obrigatorio {
  color: #7c3aed;
}

/* INPUTS GERAIS */
input,
textarea,
select {
  width: 100%;
  font: inherit;
  font-size: 13px;
  padding: 10px 13px;
  border-radius: 10px;
  border: 1.5px solid #e5deff;
  background: #fafafe;
  color: #2d1b6e;
  outline: none;
  box-sizing: border-box;
  transition: 0.18s;
}

input:focus,
textarea:focus,
select:focus {
  border-color: #7c3aed;
  background: #fff;
}

::placeholder {
  color: #b0a4d6;
}

/* ERRO */
.erro {
  border-color: #ef4444 !important;
}

/* TEXTAREA */
textarea {
  resize: none;
  line-height: 1.5;
}

.char-count {
  text-align: right;
  font-size: 11px;
  color: #b0a4d6;
  margin-top: 3px;
}

.select-wrap {
  position: relative;
}

.select-wrap select {
  appearance: none;
  padding-right: 38px;
}

.chevron {
  position: absolute;
  right: 13px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

/* TOGGLE */
.toggle-group {
  display: flex;
  gap: 8px;
}

.toggle-group button {
  flex: 1;
  padding: 9px 4px;
  border-radius: 10px;
  border: 1.5px solid #e5deff;
  background: #fafafe;
  color: #7c6faa;
  cursor: pointer;
}

.toggle-group button.active {
  background: #5b3cc4;
  border-color: #5b3cc4;
  color: #fff;
}

/* SALÁRIO */
.salario-row {
  display: flex;
  gap: 12px;
}

.salario-label {
  font-size: 11px;
  color: #7c6faa;
  margin-bottom: 5px;
}

/* AÇÕES */
.acoes {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.btn-cancelar,
.btn-publicar {
  flex: 1;
  padding: 12px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
}

.btn-cancelar {
  background: #fff;
  border: 1.5px solid #e5deff;
  color: #5b3cc4;
}

.btn-publicar {
  flex: 1.4;
  border: none;
  background: #5b3cc4;
  color: #fff;
  font-weight: 700;
}

.btn-publicar:disabled {
  opacity: 0.65;
  cursor: not-allowed;
}

/* TOAST */
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: #059669;
  color: #fff;
  padding: 12px 20px;
  border-radius: 12px;
  font-weight: 600;
  display: flex;
  gap: 8px;
}
</style>