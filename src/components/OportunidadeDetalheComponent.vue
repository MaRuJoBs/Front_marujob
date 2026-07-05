<script setup>
import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const route = useRoute()
const job = ref(null)
// const API_URL = 'https://marujob.class.fabricadesoftware.ifc.edu.br'
const isFavorite = ref(false);

function favoritar() {
  isFavorite.value = !isFavorite.value;
}
onMounted(async () => {
  try {
    const res = await fetch(`http://127.0.0.1:8000/api/freelances/${route.params.id}/`)
    job.value = await res.json()
  } catch (error) {
    console.log(error)
  }
})
</script>

<template>
  <section class="fundo">
    <div class="header">
      <button class="btn-voltar">
        <span class="fa-solid fa-arrow-left"></span>
      </button>

      <div class="titulo">
        <h1>{{ job?.titulo }}</h1>
<p>{{ job?.tag }}</p>
      </div>

      
      <button class="btn-favorito" @click="favoritar">
        <i
          :class="isFavorite ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"
        ></i>
      </button>
    </div>

   
    <div class="card">
      <div class="sup-card">
      <p>!</p>
      <h2>Sobre a oportunidade</h2>
      </div>
      <p>{{ job?.descricao }}</p>
    </div>

  
    <div class="card">
      <div class="sup-card">
        <p>!</p>
        <h2>Informações Principais</h2>
      </div>

      <div class="info">
        <p><span class="fa-solid fa-location-dot"></span>Centro, SP</p>
<p><span class="fa-regular fa-clock"></span> {{ job?.tempo }} horas</p>
      </div>

      <div class="price">R${{ job?.preco }}</div>
    </div>


    <div class="card">
      <div class="sup-card">
        <p>!</p>
        <h2>Atividades</h2>
      </div>

      <ul>
        <li>Criação de artes para redes-sociais, e-mail marketing.</li>
        <li>Edição de imagens e tratamento de fotos.</li>
        <li>Apoio na identidade visual de campanhas.</li>
        <li>Organização e atualização de arquivos de design.</li>
      </ul>
    </div>


    <div class="card">
      <div class="sup-card">
        <p>!</p>
        <h2>Requisitos</h2>
      </div>

      <ul>
        <li>Conhecimento em Photoshop, Illustrator e/ou Canva.</li>
        <li>Noções de identidade visual e diagramação.</li>
        <li>Portfólio será um diferencial.</li>
      </ul>
    </div>


    <div class="mensagem">
      <h3>Dúvidas?</h3>
      <p>Fale com o recrutador</p>

      <button class="btn-mensagem">
        <i class="fa-regular fa-message"></i>
        Enviar Mensagem
      </button>
    </div>

    <div class="candidatar">
      <button>Quero me candidatar</button>
    </div>

  </section>
</template>


<style scoped>
.sup-card {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.sup-card p {
  font-size: 20px;
  color: #ee0303;
  font-weight: bold;
  border-radius: 100%;
  border: 2px solid #ff0000;
  padding: 0px 10px;
}
.fundo {
  min-height: 100vh;
  padding: 20px;
  padding-bottom: 100px;
  background: linear-gradient(180deg, #f5f1ff 0%, #f8f6ff 100%);
  font-family: Arial, sans-serif;
  max-width: 420px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.btn-voltar,
.btn-favorito {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
}

.btn-voltar {
  color: #5d45b6;
}

.btn-favorito {
  color: red;
}

.titulo {
  text-align: center;
}

.titulo h1 {
  margin: 0;
  font-size: 22px;
  width: 280px;
  
  color: #4f389e;
}

.titulo p {
  margin: 0;
  color: #8f8f8f;
}


.card {
  background: white;
  border-radius: 20px;
  padding: 0 18px 18px 18px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card h2 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #4f389e;
  font-size: 18px;
  margin-top: 13px
}

.card p,
.card li {
  color: #333;
  line-height: 1.4;
}

.card ul {
  padding-left: 18px;
}


.info p {
  color: #7a63c8;
  margin: 12px 0;
}

.price {
  width: fit-content;
  margin-left: auto;
  padding: 10px 18px;
  border-radius: 12px;
  border: 1px solid #d6d6d6;
  color: #4f389e;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08);
}


.mensagem {
  text-align: center;
  margin-top: 50px;
}

.mensagem h3 {
  margin-bottom: 4px;
  color: #4f389e;
}

.mensagem p {
  color: #888;
  margin-bottom: 10px;
}

.btn-mensagem {
  background: white;
  border: 1px solid #d8d8d8;
  border-radius: 20px;
  padding: 8px 25px;
  color: #4f389e;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}


.candidatar {
  position: fixed;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 40px);
  max-width: 380px;
}

.candidatar button {
  width: 100%;
  border: none;
  background: #6548c7;
  color: white;
  padding: 14px;
  border-radius: 14px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
}  
</style>