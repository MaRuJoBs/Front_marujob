<template>
  <div class="profile-page">

    <!-- HEADER -->
    <section class="profile-header">
      <div class="overlay"></div>

      <div class="profile-content">

        <div class="avatar-box">
          <div class="avatar"></div>

          <button class="camera-btn">
            <i class="fa-solid fa-camera"></i>
          </button>
        </div>

        <div class="user-info">
          <h2>João Silva</h2>
          <span>Designer Gráfico</span>

          <div class="location">
            <i class="fa-solid fa-location-dot"></i>
            <p>São Paulo, SP</p>
          </div>
        </div>

      </div>

      <!-- STATS -->
      <div class="stats">

        <div class="card">
          <i class="fa-regular fa-folder"></i>
          <h3>24</h3>
          <p>Projetos</p>
        </div>

        <div class="card active">
          <i class="fa-solid fa-star"></i>
          <h3>4,9</h3>
          <p>Avaliação</p>
        </div>

        <div class="card">
          <i class="fa-regular fa-clock"></i>
          <h3>118</h3>
          <p>Horas</p>
        </div>

      </div>
    </section>

    <!-- SOBRE -->
    <section class="section-box">
      <div class="section-title">
        <i class="fa-regular fa-user"></i>
        <h3>Sobre</h3>
      </div>
      <p>
        Designer gráfico apaixonado por criar marcas e identidades
        visuais únicas. Transformo ideias em designs memoráveis.
      </p>
    </section>

    <!-- HABILIDADES -->
    <section class="section-box">

      <div class="section-title">
        <i class="fa-regular fa-folder"></i>
        <h3>Habilidades</h3>
      </div>

      <div class="skills">
        <span>Design</span>
        <span>UI/UX</span>
        <span>Branding</span>
        <span>Photoshop</span>
      </div>

    </section>

    <!-- PORTFÓLIO -->
    <section class="section-box">

      <div class="portfolio-header">

        <div class="section-title">
          <i class="fa-regular fa-folder-open"></i>
          <h3>Portfólio</h3>
        </div>

        <button>Ver todos > </button>

      </div>

      <div class="portfolio">

        <div class="portfolio-card">
          <div class="portfolio-image"></div>
          <h4>Branding Minimalista</h4>
          <p>Identidade Visual</p>
        </div>

        <div class="portfolio-card">
          <div class="portfolio-image"></div>
          <h4>UI Mobile</h4>
          <p>Aplicativo</p>
        </div>

        <div class="portfolio-card">
          <div class="portfolio-image"></div>
          <h4>Social Media</h4>
          <p>Marketing</p>
        </div>

      </div>

    </section>

    <!-- CONTATO -->
    <div class="contact-grid">

      <section class="contact-card">

        <div class="section-title">
          <i class="fa-regular fa-envelope"></i>
          <h3>E-mail</h3>
        </div>

        <p>joao@email.com</p>

      </section>

      <section class="contact-card">

        <div class="section-title">
          <i class="fa-solid fa-phone"></i>
          <h3>Telefone</h3>
        </div>

        <p>(11) 99999-9999</p>

      </section>

    </div>

    <!-- BOTÃO -->
    <button class="edit-btn">
      Editar Perfil
    </button>

  </div>
</template>

<style scoped>

*{
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: sans-serif;
}

.profile-page{
  background: #e8e1f2;
  min-height: 100vh;
  padding-bottom: 40px;
}

/* HEADER */

.profile-header{
  position: relative;
  border-bottom-left-radius: 40px;
  border-bottom-right-radius: 40px;
  background-image: url('@/assets/images/perfil.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 30px 20px 90px;
  overflow: hidden;
}

.overlay{
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.2);
  backdrop-filter: blur(2px);
}

.profile-content{
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 2;
}

.avatar-box{
  position: relative;
}

.avatar{
  width: 90px;
  height: 90px;
  background: #8c8c8c;
  border-radius: 50%;
}

.camera-btn{
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: #fff;
  color: #7a3ff2;
  cursor: pointer;
}


.user-info{
  display: flex;
  flex-direction: column;
  justify-content: center;

  flex: 1;

  text-align: center;
}

.user-info h2{
  color: white;
  font-size: 24px;
  font-weight: 700;
}

.user-info span{
  color: #ece2ff;
  font-size: 14px;
}

.location{
  justify-content: center;
} 

/* STATS */

.stats{
  position: absolute;
  left: 50%;
  bottom: -45px;
  transform: translateX(-50%);
  width: 92%;
  display: flex;
  gap: 10px;
  z-index: 3;
}

.card{
  flex: 1;
  background: rgba(255,255,255,0.6);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  text-align: center;
  padding: 14px 10px;
  color: #5e4d77;
}

.card.active{
  background: rgba(255,255,255,0.9);
}

.card i{
  margin-bottom: 6px;
}

.card h3{
  font-size: 18px;
}

.card p{
  font-size: 12px;
}

/* SECTION */

.section-box{
  background: #f5f2fb;
  margin: 25px 14px 10px 14px;
  padding: 16px;
  border-radius: 18px;
}

.section-title{
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6d47d9;
  margin-bottom: 12px;
}

.section-title h3{
  font-weight: 650;
  font-size: 16px;
}

.section-box p{
  color: #513F7C;
  font-size: 14px;
  line-height: 1.5;
}

/* SKILLS */

.skills{
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.skills span{
  background:#ABA6B5;
  color: #49357B;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 650;
}

/* PORTFOLIO */

.portfolio-header{
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.portfolio-header button{
  border: none;
  background: none;
  color: #7a3ff2;
  font-size: 12px;
  cursor: pointer;
}

.portfolio{
  display: flex;
  gap: 12px;
  overflow-x: auto;
  margin-top: 12px;
}

.portfolio::-webkit-scrollbar{
  display: none;
}

.portfolio-card{
  min-width: 140px;
}

.portfolio-image{
  width: 100%;
  height: 90px;
  background: #aaa;
  border-radius: 12px;
  margin-bottom: 8px;
}

.portfolio-card h4{
  font-size: 13px;
  color: #444;
}

.portfolio-card p{
  font-size: 11px;
  color: #777;
}

/* CONTACT */

.contact-grid{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 16px;
}

.contact-card{
  background: #f5f2fb;
  border-radius: 18px;
  padding: 16px;
}

.contact-card p{
  font-size: 13px;
  color: #666;
}

/* BUTTON */
.edit-btn{
  width: 80%;
  margin: 24px auto;
  padding: 14px;
  border: none;
  border-radius: 16px;
  background: #7a3ff2;
  color: white;
  font-size: 15px;
  font-weight: 700;
  display: block;
}

</style>