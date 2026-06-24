<template>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <button class="back-btn">
        <i class="fa-solid fa-arrow-left"></i>
      </button>

      <div class="title-area">
        <h1>Design Gráfico</h1>
        <p>Design Pro</p>
      </div>

      <!-- ❤️ FAVORITO -->
      <button class="favorite-btn" @click="toggleFavorite">
        <i
          :class="isFavorite ? 'fa-solid fa-heart' : 'fa-regular fa-heart'"
        ></i>
      </button>
    </div>

    <!-- Sobre -->
    <div class="card">
      <h2>Sobre a oportunidade</h2>
      <p>
        Lorem Ipsum is simply dummy text of the printing and typesetting
        industry. Lorem Ipsum has been the industry's standard type specimen
        book. It has survive
      </p>
    </div>

    <!-- Informações -->
    <div class="card">
      <h2>Informações Principais</h2>

      <div class="info">
        <p>
          <i class="fa-solid fa-location-dot"></i>
          Centro, SP
        </p>

        <p>29/05/2026</p>
        <p>9:00 - 15:00</p>
      </div>

      <div class="price">R$200</div>
    </div>

    <!-- Atividades -->
    <div class="card">
      <h2>Atividades</h2>

      <ul>
        <li>Criação de artes para redes-sociais, e-mail marketing.</li>
        <li>Edição de imagens e tratamento de fotos.</li>
        <li>Apoio na identidade visual de campanhas.</li>
        <li>Organização e atualização de arquivos de design.</li>
      </ul>
    </div>

    <!-- Requisitos -->
    <div class="card">
      <h2>Requisitos</h2>

      <ul>
        <li>Conhecimento em Photoshop, Illustrator e/ou Canva.</li>
        <li>Noções de identidade visual e diagramação.</li>
        <li>Portfólio será um diferencial.</li>
      </ul>
    </div>

    <!-- Dúvidas -->
    <div class="contact">
      <h3>Dúvidas?</h3>
      <p>Fale com o recrutador</p>

      <button class="message-btn">
        <i class="fa-regular fa-message"></i>
        Enviar Mensagem
      </button>
    </div>

    <!-- Botão final -->
    <div class="bottom-action">
      <button>Quero me candidatar</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

// ❤️ estado do favorito
const isFavorite = ref(false);

function toggleFavorite() {
  isFavorite.value = !isFavorite.value;
}
</script>

<style scoped>
.container {
  min-height: 100vh;
  padding: 20px;
  padding-bottom: 100px;
  background: linear-gradient(180deg, #f5f1ff 0%, #f8f6ff 100%);
  font-family: Arial, sans-serif;
  max-width: 420px;
  margin: 0 auto;
}

/* HEADER */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.back-btn,
.favorite-btn {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
}

.back-btn {
  color: #5d45b6;
}

.favorite-btn {
  color: red;
}

.title-area {
  text-align: center;
}

.title-area h1 {
  margin: 0;
  font-size: 28px;
  color: #4f389e;
}

.title-area p {
  margin: 0;
  color: #8f8f8f;
}

/* CARDS */
.card {
  background: white;
  border-radius: 20px;
  padding: 18px;
  margin-bottom: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.card h2 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #4f389e;
  font-size: 18px;
}

.card p,
.card li {
  color: #333;
  line-height: 1.4;
}

.card ul {
  padding-left: 18px;
}

/* INFO */
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

/* DÚVIDAS */
.contact {
  text-align: center;
  margin-top: 50px;
}

.contact h3 {
  margin-bottom: 4px;
  color: #4f389e;
}

.contact p {
  color: #888;
  margin-bottom: 10px;
}

.message-btn {
  background: white;
  border: 1px solid #d8d8d8;
  border-radius: 20px;
  padding: 8px 25px;
  color: #4f389e;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* BOTÃO FINAL */
.bottom-action {
  position: fixed;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 40px);
  max-width: 380px;
}

.bottom-action button {
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