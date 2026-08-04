<script setup>
import { ref, computed } from 'vue'

const pesquisa = ref('')

const projetos = ref([
  {
    id: 1,
    titulo: 'Landing Page Restaurante',
    categoria: 'Website',
    imagem: null,
    tags: ['Vue', 'CSS']
  },
  {
    id: 2,
    titulo: 'Sistema Escolar',
    categoria: 'Aplicativo',
    imagem: null,
    tags: ['Vue', 'JavaScript']
  },
  {
    id: 3,
    titulo: 'Dashboard Financeiro',
    categoria: 'Dashboard',
    imagem: null,
    tags: ['ChartJS', 'Vue']
  },
  {
    id: 4,
    titulo: 'Identidade Visual',
    categoria: 'Branding',
    imagem: null,
    tags: ['Photoshop', 'Illustrator']
  },
  {
    id: 5,
    titulo: 'Loja Virtual',
    categoria: 'E-commerce',
    imagem: null,
    tags: ['Vue', 'Firebase']
  },
  {
    id: 6,
    titulo: 'Aplicativo Fitness',
    categoria: 'Mobile',
    imagem: null,
    tags: ['UI', 'Figma']
  }
])

const projetosFiltrados = computed(() => {
  if (!pesquisa.value.trim()) {
    return projetos.value
  }

  return projetos.value.filter((projeto) => {
    return (
      projeto.titulo
        .toLowerCase()
        .includes(pesquisa.value.toLowerCase()) ||

      projeto.categoria
        .toLowerCase()
        .includes(pesquisa.value.toLowerCase()) ||

      projeto.tags.some(tag =>
        tag
          .toLowerCase()
          .includes(pesquisa.value.toLowerCase())
      )
    )
  })
})
</script>

<template>
  <div class="portfolio">

    <!-- Cabeçalho -->
    <section class="header">

      <div class="perfil">

        <div class="avatar"></div>

        <div class="dados">
          <h2>Breno Silva</h2>
          <p>Desenvolvedor Full Stack</p>

          <div class="localizacao">
            <FontAwesomeIcon :icon="['fas', 'location-dot']" />
            <span>Joinville - SC</span>
          </div>
        </div>

      </div>

    </section>

    <!-- Barra de pesquisa -->
    <section class="pesquisa">

      <div class="input-busca">

        <FontAwesomeIcon
          :icon="['fas', 'magnifying-glass']"
          class="icone"
        />

        <input
          type="text"
          v-model="pesquisa"
          placeholder="Pesquisar projeto..."
        >

      </div>

      <button class="filtro">

        <FontAwesomeIcon :icon="['fas', 'sliders']" />

      </button>

    </section>

    <!-- Título -->
    <section class="titulo">

      <h3>Meus Projetos</h3>

      <span>{{ projetosFiltrados.length }} projetos</span>

    </section>

    <!-- Grid -->
    <section class="grid">

      <router-link
        v-for="projeto in projetosFiltrados"
        :key="projeto.id"
        :to="`/portfolio/${projeto.id}`"
        class="card"
      >

        <div class="imagem">

          <img
            v-if="projeto.imagem"
            :src="projeto.imagem"
          >

          <FontAwesomeIcon
            v-else
            :icon="['fas', 'image']"
            class="img-icon"
          />

        </div>

        <div class="conteudo">

          <h4>{{ projeto.titulo }}</h4>

          <p>{{ projeto.categoria }}</p>

          <div class="tags">

            <span
              v-for="tag in projeto.tags"
              :key="tag"
            >
              {{ tag }}
            </span>

          </div>

        </div>

      </router-link>

    </section>

    <!-- Botão flutuante -->
    <router-link
      to="/portfolio/adicionar"
      class="btn-add"
    >

      <FontAwesomeIcon
        :icon="['fas', 'plus']"
      />

    </router-link>

  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.portfolio {
  min-height: 100vh;
  background: #e8e1f2;
  padding-bottom: 120px;
}

/* Header */

.header {
  background: linear-gradient(135deg, #5b3cc4, #7a3ff2);
  padding: 40px 20px 70px;
  border-bottom-left-radius: 35px;
  border-bottom-right-radius: 35px;
}

.perfil {
  display: flex;
  align-items: center;
  gap: 16px;
}

.avatar {
  width: 85px;
  height: 85px;
  border-radius: 50%;
  background: #d9d9d9;
  border: 3px solid white;
}

.dados h2 {
  color: white;
  font-size: 24px;
  margin-bottom: 4px;
}

.dados p {
  color: #efe8ff;
  font-size: 15px;
}

.localizacao {
  display: flex;
  align-items: center;
  gap: 6px;
  color: white;
  margin-top: 10px;
  font-size: 14px;
}

/* Pesquisa */

.pesquisa {
  display: flex;
  gap: 10px;
  padding: 0 18px;
  margin-top: -28px;
}

.input-busca {
  flex: 1;
  background: white;
  border-radius: 15px;
  display: flex;
  align-items: center;
  padding: 0 15px;
  height: 50px;
  box-shadow: 0 4px 10px rgba(0,0,0,.08);
}

.input-busca input {
  border: none;
  outline: none;
  width: 100%;
  margin-left: 10px;
  background: transparent;
  font-size: 15px;
}

.icone {
  color: #888;
}

.filtro {
  width: 50px;
  height: 50px;
  border: none;
  border-radius: 15px;
  background: #5b3cc4;
  color: white;
  font-size: 18px;
  cursor: pointer;
  transition: .3s;
}

.filtro:hover {
  background: #4c2fb2;
}

/* Título */

.titulo {
  margin: 30px 20px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.titulo h3 {
  color: #49357b;
  font-size: 22px;
}

.titulo span {
  color: #7d6d9d;
  font-size: 14px;
}

/* Grid */

.grid {
  padding: 0 18px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}

.card {
  text-decoration: none;
  background: white;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0,0,0,.08);
  transition: .25s;
}

.card:hover {
  transform: translateY(-4px);
}

.imagem {
  width: 100%;
  height: 150px;
  background: #d6d6d6;
  display: flex;
  justify-content: center;
  align-items: center;
}

.imagem img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.img-icon {
  font-size: 42px;
  color: #888;
}

.conteudo {
  padding: 14px;
}

.conteudo h4 {
  color: #49357b;
  font-size: 17px;
  margin-bottom: 6px;
}

.conteudo p {
  color: #777;
  font-size: 14px;
  margin-bottom: 12px;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tags span {
  background: #ece6ff;
  color: #5b3cc4;
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 30px;
  font-weight: 600;
}

/* Botão flutuante */

.btn-add {
  position: fixed;
  bottom: 100px;
  right: 25px;
  width: 65px;
  height: 65px;
  border-radius: 50%;
  background: #5b3cc4;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 28px;
  text-decoration: none;
  box-shadow: 0 8px 20px rgba(91,60,196,.4);
  transition: .25s;
  z-index: 999;
}

.btn-add:hover {
  transform: scale(1.08);
  background: #4928b0;
}

/* Responsivo */

@media (max-width: 390px) {

  .grid {
    gap: 14px;
  }

  .imagem {
    height: 120px;
  }

  .conteudo h4 {
    font-size: 15px;
  }

  .dados h2 {
    font-size: 20px;
  }

  .titulo h3 {
    font-size: 20px;
  }

}

@media (max-width: 340px) {

  .grid {
    grid-template-columns: 1fr;
  }

}
</style>