<script setup>
import { ref } from 'vue'
import { usePortfolioForm } from '@/composables/usePortfolioForm'

const {
  editando, bloqueado, titulo, categoria, descricao, link, tags, novaTag, preview,
  carregando, salvando, mostrarSucesso, erro, selecionarImagem,
  adicionarTag, removerTag, enterTag, carregarProjeto, salvarProjeto, cancelar,
} = usePortfolioForm()
const inputImagem = ref(null)
const abrirUpload = () => inputImagem.value?.click()
const categorias = ['Website', 'Aplicativo', 'UI / UX', 'Branding', 'Social Media', 'Marketing', 'Design Gráfico']
</script>

<template>
  <div class="portfolio-add">
    <div
  v-if="mostrarSucesso"
  class="toast-sucesso"
  role="status"
>
  <span aria-hidden="true">✓</span>
  Projeto salvo com sucesso!
</div>

    <section class="header">

      <router-link to="/portfolio" class="voltar">
        <FontAwesomeIcon :icon="['fas', 'arrow-left']" />
      </router-link>

      <h2>
  {{ editando ? 'Editar Portfólio' : 'Adicionar Portfólio' }}
</h2>

    </section>


    <p v-if="carregando" class="estado-form" role="status">Carregando projeto...</p>
    <div v-if="erro" class="estado-form" role="alert">
      <p>{{ erro }}</p>
      <button v-if="bloqueado && !carregando" type="button" @click="carregarProjeto">Tentar carregar novamente</button>
    </div>
    <form class="formulario" @submit.prevent="salvarProjeto" :aria-busy="salvando || carregando">
      <fieldset :disabled="salvando || carregando || mostrarSucesso || bloqueado">

      <div class="upload">

        <div class="preview">

          <img
            v-if="preview"
            :src="preview"
            class="preview-img"
            alt="Imagem do projeto"
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

        <label for="projeto-titulo">Título do Projeto</label>

        <input
          id="projeto-titulo"
          type="text"
          required
          maxlength="255"
          v-model="titulo"
          placeholder="Ex: Landing Page para Restaurante"
        >

      </div>

      <!-- Categoria -->
      <div class="campo">

        <label for="projeto-categoria">Categoria</label>

        <select id="projeto-categoria" v-model="categoria" required>

          <option disabled value="">
            Selecione uma categoria
          </option>
          <option v-if="categoria && !categorias.includes(categoria)" :value="categoria">{{ categoria }}</option>

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

        <label for="projeto-descricao">Descrição</label>

        <textarea
          id="projeto-descricao"
          rows="5"
          required
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

        <label for="projeto-link">Link do Projeto (opcional)</label>

        <input
          id="projeto-link"
          type="text"
          inputmode="url"
          maxlength="200"
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
  type="submit"
  :disabled="salvando || carregando || mostrarSucesso"
>
  {{ salvando ? 'Salvando...' : (editando ? 'Salvar Alterações' : 'Salvar Projeto') }}
</button>

      </div>

      </fieldset>
    </form>

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

fieldset { border: 0; min-width: 0; }
.estado-form { margin: 16px; padding: 16px; color: #533a91; background: #f7f5fc; border-radius: 16px; overflow-wrap: anywhere; }
button:disabled { opacity: .65; cursor: default; }

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



.toast-sucesso {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);

  background: #5b3cc4;
  color: white;

  padding: 14px 20px;
  border-radius: 14px;

  display: flex;
  align-items: center;
  gap: 10px;

  font-size: 14px;
  font-weight: 600;

  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);

  z-index: 2000;
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
