<script setup>
</script>

<template>
  <div class="app">

    <!-- TOPO FAVORITOS -->
    <div class="favorites-header">

      <div class="favorites-title">

        <FontAwesomeIcon
          :icon="['fas', 'heart']"
        />

        <span>Favoritos</span>

      </div>

      <button class="delete-btn">

        <FontAwesomeIcon
          :icon="['fas', 'trash']"
        />

      </button>

    </div>

    <!-- CARD -->
    <section class="card">

      <div class="card-top">

        <div>
          <h3>Design Gráfico</h3>
          <p class="company">Design Pro</p>
        </div>

        <button class="fav">

          <FontAwesomeIcon
            :icon="['fas', 'heart']"
          />

        </button>

      </div>

      <div class="divider"></div>

      <div class="info">

        <p>
          <FontAwesomeIcon
            :icon="['fas', 'briefcase']"
          />

          Home office
        </p>

        <p>
          <FontAwesomeIcon
            :icon="['fas', 'briefcase']"
          />

          Freelancer
        </p>

      </div>

      <div class="card-bottom">

        <button class="details">
          Ver detalhes
        </button>

        <span class="price">
          R$ 200
        </span>

      </div>

    </section>

    <!-- CARD -->
    <section class="card">

      <div class="card-top">

        <div>
          <h3>Design UI/UX</h3>
          <p class="company">Creative Studio</p>
        </div>

        <button class="fav">

          <FontAwesomeIcon
            :icon="['fas', 'heart']"
          />

        </button>

      </div>

      <div class="divider"></div>

      <div class="info">

        <p>
          <FontAwesomeIcon
            :icon="['fas', 'briefcase']"
          />

          Remoto
        </p>

        <p>
          <FontAwesomeIcon
            :icon="['fas', 'briefcase']"
          />

          Projeto Temporário
        </p>

      </div>

      <div class="card-bottom">

        <button class="details">
          Ver detalhes
        </button>

        <span class="price">
          R$ 350
        </span>

      </div>

    </section>

  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;

  padding: 20px;

  font-family: Arial, sans-serif;

  background: linear-gradient(180deg, #cbb6ff, #f5f3ff);

  width: 100%;
  max-width: 420px;

  margin: 0 auto;

  box-sizing: border-box;
}

/* TOPO */
.favorites-header {
  background: #f4f1ff;

  border-radius: 22px;

  padding: 14px 18px;

  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-bottom: 18px;

  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}

.favorites-title {
  display: flex;
  align-items: center;

  gap: 10px;

  color: #6b4bc4;

  font-size: 18px;
  font-weight: 700;
}

.favorites-title svg {
  font-size: 22px;

  color: #8b5cf6;
}

.delete-btn {
  border: none;

  background: transparent;

  color: #8a69d4;

  font-size: 22px;

  cursor: pointer;
}

/* CARD */
.card {
  background: #f7f5ff;

  border-radius: 16px;

  margin-bottom: 18px;

  overflow: hidden;

  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.08);
}

/* TOPO CARD */
.card-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  padding: 15px 15px 10px;
}

.card-top h3 {
  margin: 0;

  color: #5637b4;

  font-size: 20px;
}

.company {
  margin-top: 5px;

  color: #7d72a7;

  font-size: 16px;
}

/* CORAÇÃO */
.fav {
  border: none;

  background: transparent;

  cursor: pointer;
}

.fav svg {
  color: red;

  font-size: 26px;
}

/* LINHA */
.divider {
  height: 1px;

  background: #cfc7e8;
}

/* INFO */
.info {
  padding: 12px 15px 5px;
}

.info p {
  margin: 8px 0;

  color: #6d5b9d;

  font-size: 15px;

  display: flex;
  align-items: center;
  gap: 8px;
}

.info svg {
  color: #6546c2;
}

/* BOTTOM */
.card-bottom {
  position: relative;

  display: flex;
  justify-content: center;
  align-items: center;

  padding: 10px 15px 18px;
}

/* BOTÃO */
.details {
  background: #6b4bc4;

  color: white;

  border: none;

  padding: 10px 35px;

  border-radius: 25px;

  font-size: 18px;
  font-weight: 600;

  cursor: pointer;
}

/* PREÇO */
.price {
  position: absolute;

  right: 15px;

  background: #f4f1ff;

  border: 2px solid #cfc7e8;

  padding: 7px 15px;

  border-radius: 20px;

  color: #5637b4;

  font-size: 16px;
  font-weight: bold;
}
</style>