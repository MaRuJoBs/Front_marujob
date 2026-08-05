<template>
  <div class="portfolio-detalhe">

    <!-- Cabeçalho -->
    <section class="header">

      <router-link
        to="/portfolio"
        class="btn-voltar"
      >
        <FontAwesomeIcon :icon="['fas', 'arrow-left']" />
      </router-link>

      <h2>Detalhes do Projeto</h2>

    </section>

    <!-- Imagem -->
    <section class="imagem-projeto">

      <img
        v-if="projeto.imagem"
        :src="projeto.imagem"
        alt="Projeto"
      >

      <div
        v-else
        class="imagem-vazia"
      >
        <FontAwesomeIcon
          :icon="['fas', 'image']"
          class="icone-imagem"
        />
      </div>

    </section>

    <!-- Informações -->
    <section class="informacoes">

      <div class="cabecalho">

        <h1>{{ projeto.titulo }}</h1>

        <span class="categoria">
          {{ projeto.categoria }}
        </span>

      </div>

      <div class="tags">

        <span
          v-for="tag in projeto.tags"
          :key="tag"
        >
          {{ tag }}
        </span>

      </div>

      <div class="descricao">

        <h3>Descrição</h3>

        <p>
          {{ projeto.descricao }}
        </p>

      </div>

      <div class="link">

        <h3>Link do Projeto</h3>

        <a
          :href="projeto.link"
          target="_blank"
        >
          {{ projeto.link }}
        </a>

      </div>

    </section>

    <!-- Botões -->
    <section class="acoes">

      <button class="editar">

        <FontAwesomeIcon
          :icon="['fas', 'pen']"
        />

        Editar

      </button>

      <button class="excluir">

        <FontAwesomeIcon
          :icon="['fas', 'trash']"
        />

        Excluir

      </button>

    </section>

  </div>
</template>
<script setup>
import { ref } from 'vue'

const projeto = ref({
  id: 1,

  titulo: 'Landing Page Restaurante',

  categoria: 'Website',

  descricao:
    'Este projeto foi desenvolvido para um restaurante com o objetivo de apresentar o cardápio, informações de contato e sistema de reservas. O layout foi pensado para oferecer uma ótima experiência tanto em computadores quanto em dispositivos móveis.',

  link: 'https://meusite.com',

  imagem: null,

  tags: [
    'Vue.js',
    'HTML',
    'CSS',
    'JavaScript'
  ]
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.portfolio-detalhe {
  min-height: 100vh;
  background: #e8e1f2;
  padding-bottom: 110px;
}

/* HEADER */

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
  color: white;
  font-size: 24px;
  font-weight: 700;
}

.btn-voltar {
  position: absolute;
  left: 20px;
  color: white;
  font-size: 24px;
  text-decoration: none;
}

/* IMAGEM */

.imagem-projeto {
  width: calc(100% - 32px);
  margin: 25px auto;
}

.imagem-projeto img {
  width: 100%;
  height: 250px;
  border-radius: 20px;
  object-fit: cover;
  box-shadow: 0 5px 18px rgba(0,0,0,.12);
}

.imagem-vazia {
  width: 100%;
  height: 250px;
  background: #d5d0e3;
  border-radius: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.icone-imagem {
  font-size: 60px;
  color: #8b7bb5;
}

/* INFORMAÇÕES */

.informacoes {
  background: #f7f5fc;
  width: calc(100% - 32px);
  margin: auto;
  border-radius: 22px;
  padding: 22px;
  box-shadow: 0 5px 15px rgba(0,0,0,.08);
}

.cabecalho {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 20px;
}

.cabecalho h1 {
  color: #4b338d;
  font-size: 24px;
  flex: 1;
}

.categoria {
  background: #d9cffd;
  color: #5b3cc4;
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

/* TAGS */

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 25px;
}

.tags span {
  background: #ece6ff;
  color: #5b3cc4;
  padding: 7px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
}

/* DESCRIÇÃO */

.descricao h3,
.link h3 {
  color: #4b338d;
  margin-bottom: 10px;
  font-size: 18px;
}

.descricao {
  margin-bottom: 25px;
}

.descricao p {
  color: #666;
  line-height: 1.7;
  text-align: justify;
  font-size: 15px;
}

/* LINK */

.link a {
  color: #5b3cc4;
  text-decoration: none;
  word-break: break-all;
  font-size: 15px;
  font-weight: 600;
}

.link a:hover {
  text-decoration: underline;
}

/* BOTÕES */

.acoes {
  width: calc(100% - 32px);
  margin: 25px auto;
  display: flex;
  gap: 15px;
}

.editar,
.excluir {
  flex: 1;
  border: none;
  border-radius: 15px;
  padding: 15px;
  color: white;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: .3s;
}

.editar {
  background: #5b3cc4;
}

.editar:hover {
  background: #4c2fb2;
}

.excluir {
  background: #e74c3c;
}

.excluir:hover {
  background: #cf3f30;
}

.editar i,
.excluir i,
.editar svg,
.excluir svg {
  margin-right: 8px;
}

/* RESPONSIVO */

@media (max-width: 480px) {

  .cabecalho {
    flex-direction: column;
  }

  .cabecalho h1 {
    font-size: 22px;
  }

  .categoria {
    align-self: flex-start;
  }

  .acoes {
    flex-direction: column;
  }

  .imagem-projeto img,
  .imagem-vazia {
    height: 220px;
  }
}

@media (max-width: 360px) {

  .header h2 {
    font-size: 20px;
  }

  .cabecalho h1 {
    font-size: 20px;
  }

  .descricao p {
    font-size: 14px;
  }

}
</style>