<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// Campos do formulário
const titulo = ref('')
const categoria = ref('')
const descricao = ref('')
const link = ref('')

// Upload da imagem (apenas front)
const imagem = ref(null)
const preview = ref('')

// Lista de categorias
const categorias = [
  'Website',
  'Aplicativo',
  'UI / UX',
  'Branding',
  'Social Media',
  'Marketing',
  'Design Gráfico'
]

// Tags
const tags = ref([
  'Vue.js',
  'Figma',
  'Photoshop',
  'UI Design'
])

const novaTag = ref('')

// Referência do input file
const inputImagem = ref(null)

// Abrir seletor de imagem
const abrirUpload = () => {
  inputImagem.value.click()
}

// Selecionar imagem
const selecionarImagem = (event) => {
  const file = event.target.files[0]

  if (!file) return

  imagem.value = file

  preview.value = URL.createObjectURL(file)
}

// Adicionar tag
const adicionarTag = () => {
  const texto = novaTag.value.trim()

  if (!texto) return

  if (!tags.value.includes(texto)) {
    tags.value.push(texto)
  }

  novaTag.value = ''
}

// Adicionar pressionando Enter
const enterTag = (event) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    adicionarTag()
  }
}

// Remover tag
const removerTag = (index) => {
  tags.value.splice(index, 1)
}

// Salvar (somente front)
const salvarProjeto = () => {
  const projeto = {
    titulo: titulo.value,
    categoria: categoria.value,
    descricao: descricao.value,
    link: link.value,
    tags: tags.value,
    imagem: preview.value
  }

  console.log('Projeto criado:')
  console.log(projeto)

  alert('Projeto salvo! (somente front-end)')

  router.push('/portfolio')
}

// Cancelar
const cancelar = () => {
  router.push('/portfolio')
}
</script>

<template>
  <div class="portfolio-add">

    <!-- Cabeçalho -->
    <section class="header">

      <router-link to="/portfolio" class="voltar">
        <FontAwesomeIcon :icon="['fas', 'arrow-left']" />
      </router-link>

      <h2>Adicionar Portfólio</h2>

    </section>

    <!-- Formulário -->
    <section class="formulario">

      <!-- Upload -->
      <div class="upload">

        <div class="preview">

          <img
            v-if="preview"
            :src="preview"
            class="preview-img"
          />

          <FontAwesomeIcon
            v-else
            :icon="['fas', 'image']"
            class="icone-preview"
          />

        </div>

        <input
          type="file"
          accept="image/*"
          ref="inputImagem"
          @change="selecionarImagem"
          hidden
        >

        <button
          class="btn-upload"
          type="button"
          @click="abrirUpload"
        >
          <FontAwesomeIcon :icon="['fas', 'camera']" />
          Escolher imagem
        </button>

      </div>

      <!-- Título -->
      <div class="campo">

        <label>Título do Projeto</label>

        <input
          type="text"
          v-model="titulo"
          placeholder="Ex: Landing Page para Restaurante"
        >

      </div>

      <!-- Categoria -->
      <div class="campo">

        <label>Categoria</label>

        <select v-model="categoria">

          <option disabled value="">
            Selecione uma categoria
          </option>

          <option
            v-for="item in categorias"
            :key="item"
            :value="item"
          >
            {{ item }}
          </option>

        </select>

      </div>

      <!-- Descrição -->
      <div class="campo">

        <label>Descrição</label>

        <textarea
          rows="5"
          v-model="descricao"
          placeholder="Conte um pouco sobre esse projeto..."
        ></textarea>

      </div>

      <!-- Tags -->
      <div class="campo">

        <label>Tecnologias / Tags</label>

        <div class="tags">

          <div
            class="tag"
            v-for="(tag, index) in tags"
            :key="index"
          >

            {{ tag }}

            <button
              type="button"
              @click="removerTag(index)"
            >
              ×
            </button>

          </div>

        </div>

        <div class="nova-tag">

          <input
            type="text"
            v-model="novaTag"
            @keydown="enterTag"
            placeholder="Digite uma tag"
          >

          <button
            type="button"
            @click="adicionarTag"
          >
            Adicionar
          </button>

        </div>

      </div>

      <!-- Link -->
      <div class="campo">

        <label>Link do Projeto</label>

        <input
          type="url"
          v-model="link"
          placeholder="https://..."
        >

      </div>

      <!-- Botões -->
      <div class="acoes">

        <button
          class="cancelar"
          type="button"
          @click="cancelar"
        >
          Cancelar
        </button>

        <button
          class="salvar"
          type="button"
          @click="salvarProjeto"
        >
          Salvar Projeto
        </button>

      </div>

    </section>

  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.portfolio-add {
  min-height: 100vh;
  background: #e8e1f2;
  padding-bottom: 100px;
}

.header {
  height: 90px;
  background: linear-gradient(135deg, #5b3cc4, #7a3ff2);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border-bottom-left-radius: 35px;
  border-bottom-right-radius: 35px;
}

.header h2 {
  color: #fff;
  font-size: 24px;
  font-weight: 700;
}

.voltar {
  position: absolute;
  left: 20px;
  color: white;
  font-size: 24px;
  text-decoration: none;
}

.formulario {
  margin: 20px 16px;
  background: #f7f5fc;
  border-radius: 22px;
  padding: 24px 18px;
  box-shadow: 0 5px 20px rgba(0,0,0,.08);
}

.upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 28px;
}

.preview {
  width: 170px;
  height: 170px;
  border-radius: 20px;
  background: #d7d2e8;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border: 2px dashed #7a3ff2;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.icone-preview {
  font-size: 55px;
  color: #8a7fb4;
}

.btn-upload {
  margin-top: 18px;
  border: none;
  background: #5b3cc4;
  color: white;
  border-radius: 14px;
  padding: 12px 22px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: .25s;
}

.btn-upload:hover {
  background: #4d2eb5;
}

.campo {
  display: flex;
  flex-direction: column;
  margin-bottom: 22px;
}

.campo label {
  font-size: 15px;
  color: #533a91;
  font-weight: 700;
  margin-bottom: 8px;
}

.campo input,
.campo select,
.campo textarea {
  width: 100%;
  border: none;
  border-radius: 14px;
  background: white;
  padding: 14px;
  font-size: 15px;
  outline: none;
  color: #444;
}

.campo textarea {
  resize: vertical;
  min-height: 120px;
}

.campo input:focus,
.campo textarea:focus,
.campo select:focus {
  box-shadow: 0 0 0 3px rgba(122,63,242,.15);
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.tag {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #d8cff8;
  color: #4b338d;
  padding: 8px 14px;
  border-radius: 30px;
  font-size: 14px;
  font-weight: 600;
}

.tag button {
  background: transparent;
  border: none;
  color: #4b338d;
  cursor: pointer;
  font-size: 18px;
}

.nova-tag {
  display: flex;
  gap: 10px;
}

.nova-tag input {
  flex: 1;
}

.nova-tag button {
  border: none;
  background: #7a3ff2;
  color: white;
  padding: 0 18px;
  border-radius: 14px;
  cursor: pointer;
  font-weight: 600;
  transition: .25s;
}

.nova-tag button:hover {
  background: #6230d9;
}

.acoes {
  display: flex;
  gap: 15px;
  margin-top: 35px;
}

.cancelar,
.salvar {
  flex: 1;
  border: none;
  border-radius: 16px;
  padding: 15px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: .25s;
}

.cancelar {
  background: #dad3eb;
  color: #5d4c82;
}

.cancelar:hover {
  background: #cbc3df;
}

.salvar {
  background: #5b3cc4;
  color: white;
}

.salvar:hover {
  background: #4f30b7;
}

@media (max-width: 420px) {

  .preview {
    width: 150px;
    height: 150px;
  }

  .header h2 {
    font-size: 21px;
  }

  .acoes {
    flex-direction: column;
  }

  .nova-tag {
    flex-direction: column;
  }

  .nova-tag button {
    height: 45px;
  }
}
</style>