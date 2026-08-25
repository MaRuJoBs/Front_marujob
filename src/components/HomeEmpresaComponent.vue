<script setup>
import logoMaruJob from '@/assets/images/logoempresa.png'
import fundoEmpresa from '@/assets/images/fundoempresa.png'
</script>
<template>
  <main class="home":style="{backgroundImage: `url('${fundoEmpresa}')`,}">
    <!-- Header -->
    <header class="hero">
      <img :src="logoMaruJob" alt="MaRuJob" class="logo" />
    </header>

    <!-- Welcome -->
    <section class="welcome">
      <h2>Bem-vindo, Nome da Empresa!</h2>

      <p>Encontre os melhores freelancers para seus projetos.</p>

      <button class="new-job">
        <span>+</span>
        Criar nova vaga
      </button>
    </section>

    <!-- Vagas -->
    <section class="section">
      <div class="section-title">
        <h3>Vagas Ativas</h3>
        <span>Ver todos ›</span>
      </div>

      <div class="job-card">
        <div class="job-header">
          <h4>Vagas Ativas</h4>

          <div class="price">R$ 200</div>
        </div>

        <div class="job-date"><i class="fa-regular fa-calendar"></i> 3 dias</div>

        <div class="job-footer">
          <div class="job-info"><i class="fa-solid fa-location-dot"></i> Centro, SP</div>

          <div class="job-info"><i class="fa-solid fa-briefcase"></i> Home Office</div>

          <button class="details-btn">Ver mais</button>
        </div>
      </div>

      <div class="job-card">
        <div class="job-header">
          <h4>Vagas Ativas</h4>

          <div class="price">R$ 200</div>
        </div>

        <div class="job-date"><i class="fa-regular fa-calendar"></i> 3 dias</div>

        <div class="job-footer">
          <div class="job-info"><i class="fa-solid fa-location-dot"></i> Centro, SP</div>

          <div class="job-info"><i class="fa-solid fa-briefcase"></i> Home Office</div>

          <button class="details-btn">Ver mais</button>
        </div>
      </div>
    </section>

    <!-- Recomendações -->
    <section class="section">
      <div class="section-title">
        <h3>Recomendações de Freelancers</h3>
        <span>Ver todos ›</span>
      </div>

      <div class="categories">
        <button class="active">Design</button>

        <button>Redação</button>

        <button>Marketing</button>

        <button>Vídeo</button>
      </div>

      <div class="freelancers">
        <div class="freelancer-card">
          <div class="avatar"></div>

          <h4>Ricardo Baron</h4>

          <p>Design Gráfico</p>

          <div class="stars">
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
            <i class="fa-solid fa-star"></i>
          </div>

          <button>Ver perfil</button>
        </div>

        <div class="freelancer-card">
          <div class="avatar"></div>

          <h4>Ricardo Baron</h4>

          <p>Design Gráfico</p>

          <div class="stars">⭐⭐⭐⭐⭐</div>

          <button>Ver perfil</button>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.home {
  min-height: 100vh;
  width: 100%;

  background-repeat: no-repeat;
  background-position: top center;

  /* Ajuste o tamanho da imagem */
  background-size: cover;

  /* Faz a imagem acompanhar a rolagem */
  background-attachment: scroll;

  padding-bottom: 30px;
}


/* HERO */

.hero {
  height: 70px;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  padding: 5px 15px 0;
  position: relative;
  overflow: hidden;
}

.logo {
  width: 180px;
  height: auto;
  object-fit: contain;
  position: relative;
  top: -10px;
  /* sobe a logo */
  z-index: 2;
}

.hero::after {
  content: '';

  position: absolute;
  width: 350px;
  height: 350px;

  border-radius: 50%;

  background: rgba(255, 255, 255, 0.1);

  bottom: -250px;
  left: -100px;
}

.logo {
  width: 300px;
  z-index: 2;
}

/* WELCOME */

.welcome {
  padding: 20px;
}

.welcome h2 {
  color: #5e3ea7;
  font-size: 25px;
  font-weight: 800;
}

.welcome p {
  color: #74688f;
  font-size: 14px;
  margin-top: 2px;
}

.new-job {
  margin-top: 20px;

  background-color: #4687ab;

  border: none;

  color: white;

  padding: 14px 20px;

  border-radius: 15px;

  display: flex;
  align-items: center;
  gap: 10px;

  font-size: 15px;
  font-weight: 600;

  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}

.new-job span {
  font-size: 22px;
}

/* SECTION */

.section {
  padding: 0 20px;
  margin-top: 18px;
}

.section-title {
  background: #efe5fa;

  padding: 14px 16px;

  border-radius: 14px;

  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title h3 {
  color: #5f469a;
  font-size: 18px;
}

.section-title span {
  color: #8474a9;
  font-size: 13px;
}

/* JOB CARD */

.job-card {
  background: #f6effd;

  border-radius: 18px;

  padding: 16px;

  margin-top: 12px;

  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.job-header h4 {
  color: #5e3ea7;
}

.price {
  background: white;
  padding: 4px 16px;
  border-radius: 30px;
  color: #5e3ea7;
  font-weight: 700;
}

.job-date {
  margin-top: 10px;
  color: #80759b;
}

.job-footer {
  margin-top: 14px;

  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.job-info {
  color: #80759b;
  font-size: 13px;
}

.details-btn {
  margin-left: auto;

  border: none;

  background: #7854d7;

  color: white;

  padding: 8px 16px;

  border-radius: 20px;

  font-weight: 600;
}

/* TAGS */

.categories {
  display: flex;
  gap: 8px;

  overflow-x: auto;

  margin-top: 14px;
  padding-bottom: 5px;
}

.categories button {
  border: none;

  background: white;

  color: #75658f;

  padding: 8px 14px;

  border-radius: 20px;

  white-space: nowrap;
}

.categories .active {
  background: #7b58d3;
  color: white;
}

/* FREELANCERS */

.freelancers {
  margin-top: 16px;

  display: grid;
  grid-template-columns: repeat(2, 1fr);

  gap: 12px;
}

.freelancer-card {
  background: #f6effd;

  border-radius: 18px;

  padding: 16px;

  text-align: center;

  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.avatar {
  width: 90px;
  height: 90px;

  border-radius: 50%;

  background: #d8d8d8;

  margin: 0 auto 12px;
}

.freelancer-card h4 {
  color: #5e3ea7;
  font-size: 15px;
}

.freelancer-card p {
  color: #8474a9;
  font-size: 13px;

  margin-top: 4px;
}

.stars {
  margin: 10px 0;
}

.freelancer-card button {
  width: 100%;

  border: none;

  background: #7854d7;

  color: white;

  padding: 10px;

  border-radius: 20px;

  font-weight: 600;
}
</style>
