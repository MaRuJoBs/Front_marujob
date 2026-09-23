<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const titulo = ref('')
const categoria = ref('')
const descricao = ref('')
const link = ref('')
const imagem = ref(null)
const preview = ref('')
const mostrarCategorias = ref(false)
const inputImagem = ref(null)

const categorias = [
  'Website',
  'Aplicativo',
  'UI / UX',
  'Branding',
  'Social Media',
  'Marketing',
  'Design Gráfico'
]

const projetosPadrao = [
  {
    id: 1,
    titulo: 'Landing Page Restaurante',
    categoria: 'Website',
    descricao: '',
    link: '',
    imagem: null
  },
  {
    id: 2,
    titulo: 'Sistema Escolar',
    categoria: 'Aplicativo',
    descricao: '',
    link: '',
    imagem: null
  },
  {
    id: 3,
    titulo: 'Dashboard Financeiro',
    categoria: 'Dashboard',
    descricao: '',
    link: '',
    imagem: null
  },
  {
    id: 4,
    titulo: 'Identidade Visual',
    categoria: 'Branding',
    descricao: '',
    link: '',
    imagem: null
  },
  {
    id: 5,
    titulo: 'Loja Virtual',
    categoria: 'E-commerce',
    descricao: '',
    link: '',
    imagem: null
  },
  {
    id: 6,
    titulo: 'Aplicativo Fitness',
    categoria: 'Mobile',
    descricao: '',
    link: '',
    imagem: null
  }
]

const carregarProjetos = () => {
  const salvos = localStorage.getItem('portfolioProjetos')

  if (salvos) {
    try {
      return JSON.parse(salvos)
    } catch {
      return projetosPadrao
    }
  }

  return projetosPadrao
}

onMounted(() => {
  const id = Number(route.params.id)
  const projetos = carregarProjetos()
  const projeto = projetos.find((item) => item.id === id)

  if (!projeto) {
    router.push('/portfolio')
    return
  }

  titulo.value = projeto.titulo || ''
  categoria.value = projeto.categoria || ''
  descricao.value = projeto.descricao || ''
  link.value = projeto.link || ''
  preview.value = projeto.imagem || ''
})

const abrirUpload = () => {
  inputImagem.value?.click()
}

const selecionarImagem = (event) => {
  const file = event.target.files?.[0]

  if (!file) return

  imagem.value = file

  const reader = new FileReader()
  reader.onload = () => {
    preview.value = reader.result
  }
  reader.readAsDataURL(file)
}

const selecionarCategoria = (item) => {
  categoria.value = item
  mostrarCategorias.value = false
}

const salvarProjeto = () => {
  if (!titulo.value.trim()) {
    alert('Informe o nome do portfólio.')
    return
  }

  const id = Number(route.params.id)
  const projetos = carregarProjetos()
  const index = projetos.findIndex((item) => item.id === id)

  if (index === -1) return

  projetos[index] = {
    ...projetos[index],
    titulo: titulo.value.trim(),
    categoria: categoria.value,
    descricao: descricao.value.trim(),
    link: link.value.trim(),
    imagem: preview.value || null
  }

  localStorage.setItem('portfolioProjetos', JSON.stringify(projetos))
  router.push(`/portfolio/${id}`)
}

const excluirProjeto = () => {
  const confirmar = confirm('Deseja excluir este portfólio?')

  if (!confirmar) return

  const id = Number(route.params.id)
  const projetos = carregarProjetos().filter((item) => item.id !== id)

  localStorage.setItem('portfolioProjetos', JSON.stringify(projetos))
  router.push('/portfolio')
}

const voltar = () => {
  router.back()
}
</script>

<template>
  <div class="editar-portfolio">
    <header class="header">
      <button class="voltar" type="button" @click="voltar">
        <FontAwesomeIcon :icon="['fas', 'arrow-left']" />
      </button>

      <h1>Editar Portfolio</h1>

      <button class="salvar-topo" type="button" @click="salvarProjeto">
        Salvar
      </button>
    </header>

    <main class="conteudo">
      <section class="foto-area">
        <div class="foto-box" @click="abrirUpload">
          <img v-if="preview" :src="preview" alt="Imagem do portfólio" />
          <template v-else>
            <div class="circulo-foto"></div>
            <span>Alterar foto</span>
          </template>
        </div>

        <input
          ref="inputImagem"
          type="file"
          accept="image/*"
          hidden
          @change="selecionarImagem"
        />
      </section>

      <section class="campo">
        <label for="titulo">Nome do portfólio</label>
        <input
          id="titulo"
          v-model="titulo"
          type="text"
          placeholder="Branding Minimalista"
        />
      </section>

      <section class="campo categoria-campo">
        <label>Categoria</label>

        <button
          class="adicionar-categoria"
          type="button"
          @click="mostrarCategorias = !mostrarCategorias"
        >
          {{ categoria || 'Adicionar' }}
        </button>

        <div v-if="mostrarCategorias" class="lista-categorias">
          <button
            v-for="item in categorias"
            :key="item"
            type="button"
            @click="selecionarCategoria(item)"
          >
            {{ item }}
          </button>
        </div>
      </section>

      <section class="campo descricao-campo">
        <label for="descricao">Descrição</label>
        <textarea
          id="descricao"
          v-model="descricao"
          placeholder="Conte um pouco sobre esse projeto..."
        ></textarea>
      </section>

      <section class="campo link-campo">
        <label for="link">Link externo</label>
        <input
          id="link"
          v-model="link"
          type="url"
          placeholder="www.seusite.com/exemplo/portfolio"
        />
        <small>Adicione um link para seu site, Behance, Dribble ou outra plataforma.</small>
      </section>

      <button class="excluir" type="button" @click="excluirProjeto">
        Excluir
      </button>
    </main>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.editar-portfolio {
  width: 100%;
  max-width: 420px;
  min-height: 100vh;
  margin: 0 auto;
  background: #f8f9fc;
  color: #51466a;
  overflow-x: hidden;
}

.header {
  position: relative;
  height: 116px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 36px;
  background-image: url('@/assets/images/fundo.png');
  background-size: 100% auto;
  background-position: top center;
  background-repeat: no-repeat;
}

.header::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: -1px;
  height: 25px;
  background: #f8f9fc;
  border-radius: 50% 50% 0 0 / 100% 100% 0 0;
}

.header h1 {
  position: relative;
  z-index: 2;
  color: white;
  font-size: 21px;
  font-weight: 700;
  line-height: 32px;
}

.voltar,
.salvar-topo {
  position: absolute;
  z-index: 3;
  top: 32px;
  border: none;
  cursor: pointer;
}

.voltar {
  left: 18px;
  width: 34px;
  height: 34px;
  background: transparent;
  color: white;
  font-size: 23px;
}

.salvar-topo {
  right: 26px;
  padding: 8px 13px;
  border-radius: 15px;
  background: #684b9b;
  color: white;
  font-size: 15px;
  font-weight: 700;
}

.conteudo {
  padding: 0 20px 90px;
}

.foto-area {
  margin-top: -11px;
  margin-bottom: 32px;
}

.foto-box {
  width: 100%;
  height: 300px;
  border-radius: 28px;
  background: #b1b2bb;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
}

.foto-box img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.circulo-foto {
  width: 85px;
  height: 85px;
  border-radius: 50%;
  background: #fbfaff;
  margin-bottom: 9px;
}

.foto-box span {
  color: #503d82;
  font-size: 15px;
  font-weight: 700;
}

.campo {
  position: relative;
  margin-bottom: 22px;
}

.campo label {
  display: block;
  margin: 0 0 9px;
  color: #503b85;
  font-size: 18px;
  font-weight: 700;
}

.campo input,
.campo textarea {
  width: 100%;
  border: 1px solid #b4b4b8;
  border-radius: 11px;
  outline: none;
  background: #e9e9ea;
  color: #555568;
  font-family: inherit;
  font-size: 16px;
}

.campo input {
  height: 45px;
  padding: 0 17px;
}

.campo textarea {
  height: 155px;
  padding: 14px 17px;
  resize: none;
}

.campo input:focus,
.campo textarea:focus {
  border-color: #7652ae;
  box-shadow: 0 0 0 2px rgba(118, 82, 174, .12);
}

.campo input::placeholder,
.campo textarea::placeholder {
  color: #555568;
  opacity: 1;
}

.categoria-campo {
  min-height: 91px;
}

.adicionar-categoria {
  display: block;
  margin-left: auto;
  border: none;
  background: transparent;
  color: #7c5bb0;
  font-family: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.lista-categorias {
  position: absolute;
  top: 69px;
  right: 0;
  left: 0;
  z-index: 5;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 7px;
  padding: 10px;
  border: 1px solid #ddd8e8;
  border-radius: 12px;
  background: white;
  box-shadow: 0 8px 20px rgba(52, 36, 83, .12);
}

.lista-categorias button {
  border: none;
  border-radius: 8px;
  padding: 9px 5px;
  background: #eee9f8;
  color: #5a4389;
  cursor: pointer;
  font-size: 13px;
}

.descricao-campo {
  margin-top: 8px;
  margin-bottom: 51px;
}

.link-campo {
  margin-bottom: 55px;
}

.link-campo small {
  display: block;
  max-width: 355px;
  margin: 6px 6px 0;
  color: #85858d;
  font-size: 12px;
  line-height: 1.25;
}

.excluir {
  width: 100%;
  height: 51px;
  border: none;
  border-radius: 16px;
  background: #ffc5d2;
  color: #111;
  font-family: inherit;
  font-size: 12px;
  font-style: italic;
  cursor: pointer;
}

@media (min-width: 421px) {
  .editar-portfolio {
    box-shadow: 0 0 35px rgba(57, 37, 92, .08);
  }
}
</style>
