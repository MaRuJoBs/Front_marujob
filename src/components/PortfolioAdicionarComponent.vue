<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useProjetoFormulario } from '@/composables/useProjetoFormulario'
import { habilidadesSugeridas, opcoesTags } from '@/utils/tags'
const {
  titulo,
  categoria,
  descricao,
  link,
  tags,
  novaTag,
  editando,
  pronto,
  salvando,
  mostrarSucesso,
  camposErro,
  projetoSalvo,
  carregando,
  erro,
  erroImagem,
  preview,
  selecionarImagem,
  adicionarTag,
  removerTag,
  carregarProjeto,
  salvarProjeto,
  cancelar,
} = useProjetoFormulario()
const inputImagem = ref(null)
const abrirUpload = () => inputImagem.value?.click()
const categorias = [
  'Website',
  'Aplicativo',
  'UI / UX',
  'Branding',
  'Social Media',
  'Marketing',
  'Design Gráfico',
]
const tagsRemovidas = ref([])
const opcoesTecnologias = computed(() =>
  opcoesTags(habilidadesSugeridas, tags.value, tagsRemovidas.value).filter(
    (opcao) =>
      !tags.value.some(
        (tag) => tag.trim().toLocaleLowerCase('pt-BR') === opcao.toLocaleLowerCase('pt-BR'),
      ),
  ),
)
watch(pronto, (valor) => {
  if (!valor) tagsRemovidas.value = []
})
function retirarTag(index) {
  tagsRemovidas.value = opcoesTags(tagsRemovidas.value, [tags.value[index]])
  removerTag(index)
}
function selecionarTag(event) {
  const campo = event.currentTarget
  adicionarTag()
  nextTick(() => {
    campo.value = novaTag.value
  })
}
</script>

<template>
  <div class="portfolio-add mrj-ui freelancer-page">
    <div v-if="mostrarSucesso" role="status" class="toast-sucesso">
      <FontAwesomeIcon :icon="['fas', 'check']" />
      Projeto salvo com sucesso!
      <router-link :to="`/portfolio/${projetoSalvo}`">Consultar projeto</router-link>
      <router-link to="/portfolio">Ver portfólio</router-link>
    </div>

    <section class="header">
      <router-link to="/portfolio" class="voltar" aria-label="Voltar ao portfólio">
        <FontAwesomeIcon :icon="['fas', 'arrow-left']" />
      </router-link>

      <h1>
        {{ editando ? 'Editar Portfólio' : 'Adicionar Portfólio' }}
      </h1>
    </section>

    <p v-if="carregando && !salvando" role="status">Carregando projeto...</p>
    <div v-if="erro" role="alert">
      {{ erro }} <button v-if="!pronto" @click="carregarProjeto">Tentar novamente</button>
    </div>
    <fieldset v-if="pronto" class="formulario" :disabled="salvando || mostrarSucesso">
      <div class="upload">
        <div class="preview">
          <img
            @load="
              (event) => {
                event.target.hidden = false
              }
            "
            @error="
              (event) => {
                event.target.hidden = true
              }
            "
            v-if="preview"
            :src="preview"
            alt="Prévia da imagem do projeto"
            class="preview-img"
          />

          <FontAwesomeIcon v-else :icon="['fas', 'image']" class="icone-preview" />
        </div>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          ref="inputImagem"
          @change="selecionarImagem"
          hidden
        />

        <button class="btn-upload" type="button" @click="abrirUpload">
          <FontAwesomeIcon :icon="['fas', 'camera']" />
          Escolher imagem
        </button>
      </div>

      <div class="campos-projeto">
        <!-- Título -->
        <div class="campo">
          <label for="projeto-titulo">Título do Projeto</label>
          <p v-if="camposErro.titulo" role="alert">{{ camposErro.titulo }}</p>

          <input
            aria-label="Título do Projeto"
            id="projeto-titulo"
            :aria-invalid="!!camposErro.titulo"
            type="text"
            v-model="titulo"
            placeholder="Ex: Landing Page para Restaurante"
          />
        </div>

        <!-- Categoria -->
        <div class="campo">
          <label for="projeto-categoria">Categoria</label>
          <p v-if="camposErro.categoria" role="alert">{{ camposErro.categoria }}</p>

          <select
            aria-label="Categoria"
            id="projeto-categoria"
            :aria-invalid="!!camposErro.categoria"
            v-model="categoria"
          >
            <option value="" disabled>Selecionar categoria</option>
            <option v-if="categoria && !categorias.includes(categoria)" :value="categoria">
              {{ categoria }}
            </option>
            <option v-for="item in categorias" :key="item" :value="item">
              {{ item }}
            </option>
          </select>
        </div>

        <!-- Descrição -->
        <div class="campo">
          <label for="projeto-descricao">Descrição</label>
          <p v-if="camposErro.descricao" role="alert">{{ camposErro.descricao }}</p>

          <textarea
            aria-label="Descrição"
            id="projeto-descricao"
            :aria-invalid="!!camposErro.descricao"
            rows="5"
            v-model="descricao"
            placeholder="Conte um pouco sobre esse projeto..."
          ></textarea>
        </div>

        <!-- Tags -->
        <div class="campo">
          <label for="projeto-tags">Tecnologias / Tags</label>
          <p v-if="camposErro.tags" role="alert">{{ camposErro.tags }}</p>

          <div class="tags">
            <div class="tag" v-for="(tag, index) in tags" :key="index">
              {{ tag }}

              <button type="button" :aria-label="`Remover tag ${tag}`" @click="retirarTag(index)">
                ×
              </button>
            </div>
          </div>

          <div class="nova-tag">
            <select
              aria-label="Tecnologias / Tags"
              id="projeto-tags"
              :aria-invalid="!!camposErro.tags"
              v-model="novaTag"
              @change="selecionarTag"
            >
              <option value="" disabled>Selecionar tecnologia ou tag</option>
              <option v-for="opcao in opcoesTecnologias" :key="opcao" :value="opcao">
                {{ opcao }}
              </option>
            </select>
          </div>
        </div>

        <!-- Link -->
        <div class="campo">
          <label for="projeto-link">Link do Projeto</label>
          <p v-if="camposErro.link" role="alert">{{ camposErro.link }}</p>

          <input
            id="projeto-link"
            :aria-invalid="!!camposErro.link"
            aria-label="Link do Projeto"
            type="url"
            v-model="link"
            placeholder="https://..."
          />
        </div>

        <p v-if="erroImagem" role="alert">{{ erroImagem }}</p>
        <!-- Botões -->
        <div class="acoes">
          <button class="cancelar" type="button" @click="cancelar">Cancelar</button>

          <button class="salvar" type="button" @click="salvarProjeto" :disabled="salvando">
            {{ salvando ? 'Salvando...' : editando ? 'Salvar Alterações' : 'Salvar Projeto' }}
          </button>
        </div>
      </div>
    </fieldset>
  </div>
</template>

<style scoped src="../styles/freelancer.css"></style>
<style scoped>
.portfolio-add {
  min-height: 100dvh;
  padding: 24px 20px;
}
.header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}
.header h1 {
  font-size: 1.5rem;
}
.voltar {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  flex: 0 0 44px;
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: 12px;
  background: white;
  color: var(--mrj-color-text-secondary);
  text-decoration: none;
}
fieldset.formulario {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 28px;
  margin: 0;
  padding: 24px;
  min-width: 0;
  background: white;
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: 16px;
}
.upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1 1 200px;
  min-width: 0;
  gap: 16px;
  padding-block: 8px;
}
.preview {
  display: grid;
  place-items: center;
  width: min(100%, 220px);
  aspect-ratio: 1;
  background: var(--mrj-color-secondary);
  border: 1px dashed var(--mrj-color-primary);
  border-radius: 16px;
  overflow: hidden;
}
.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.icone-preview {
  font-size: 48px;
  color: #8b7ba8;
}
.btn-upload {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 14px;
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: 10px;
  background: white;
  color: var(--mrj-color-primary);
  font-size: 0.8125rem;
  font-weight: 600;
}
.campos-projeto {
  flex: 999 1 320px;
  min-width: 0;
  display: grid;
  gap: 24px;
}
.campo {
  min-width: 0;
}
.nova-tag {
  min-width: 0;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.tags:empty {
  display: none;
}
.tag {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0 4px 0 12px;
  max-width: 100%;
  background: var(--mrj-color-secondary);
  color: var(--mrj-color-primary);
  border-radius: 8px;
  font-size: 0.8125rem;
}
.tag button {
  min-width: 36px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font-size: 18px;
}
.acoes {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 8px;
}
.cancelar,
.salvar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 20px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
}
.cancelar {
  border: 1px solid var(--mrj-color-border-subtle);
  background: white;
  color: var(--mrj-color-text-secondary);
}
.salvar {
  border: 0;
  color: white;
  background: var(--mrj-color-primary);
}
.toast-sucesso {
  background: #eaf7ef !important;
  color: var(--mrj-color-success);
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.toast-sucesso a {
  color: var(--mrj-color-success);
}
</style>
