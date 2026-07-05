<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const API_URL = 'https://marujob.class.fabricadesoftware.ifc.edu.br'
const user = ref(null)
const email = ref('')

onMounted(async () => {
  try {
    const response = await axios.get(`${API_URL}/api/usuarios/me/`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })


    console.log('USER:', response.data)
    console.log('IMAGE PATH:', response.data.profile_image)
    console.log('FINAL URL:', getImageUrl(response.data.profile_image))


    user.value = response.data
    email.value = response.data.email
  } catch (erro) {
    console.error('Erro ao buscar usuário:', erro)
  }
})

const getImageUrl = (path) => {
  if (!path) return null

  if (path.startsWith('http')) return path

  return `${API_URL}${path}`
}
</script>
<template>

  <div class="perfil">
    <section class="header-perfil">
      <div class="separacao"></div>

      <div class="profile-content">
        <div class="img-usu">
          <img v-if="user && user.profile_image" :src="getImageUrl(user.profile_image)"class="avatar"/>
          <div v-else class="avatar"></div>

          <button class="icone">
            <i class="fa-solid fa-camera"></i>
          </button>
        </div>

        <div class="info">
          <h2>{{ user?.name }}</h2>
          <span>Designer Gráfico</span>

          <div class="loc">
            <i class="fa-solid fa-loc-dot"></i>
            <p>São Paulo, SP</p>
          </div>
        </div>
      </div>

   
      <div class="status">
        <div class="card">
          <i class="fa-regular fa-folder"></i>
          <h3>24</h3>
          <p>Projetos</p>
        </div>

        <div class="card ativo">
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

 
    <section class="box">
      <div class="titulo">
        <i class="fa-regular fa-user"></i>
        <h3>Sobre</h3>
      </div>
      <p>
        Designer gráfico apaixonado por criar marcas e identidades visuais únicas. Transformo ideias
        em designs memoráveis.
      </p>
    </section>


    <section class="box">
      <div class="titulo">
        <i class="fa-regular fa-folder"></i>
        <h3>Habilidades</h3>
      </div>

      <div class="hab">
        <span>Design</span>
        <span>UI/UX</span>
        <span>Branding</span>
        <span>Photoshop</span>
      </div>
    </section>

    
    <section class="box">
      <div class="superior-port">
        <div class="titulo">
          <i class="fa-regular fa-folder-open"></i>
          <h3>Portfólio</h3>
        </div>

        <button>Ver todos ></button>
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


    <div class="last-info">
      <section class="last-card">
        <div class="titulo">
          <i class="fa-regular fa-envelope"></i>
          <h3>E-mail</h3>
        </div>

        <p>{{ email }}</p>
      </section>

      <section class="last-card">
        <div class="titulo">
          <i class="fa-solid fa-phone"></i>
          <h3>Telefone</h3>
        </div>

        <p>(11) 99999-9999</p>
      </section>
    </div>

    
    <button class="btn-editar">Editar Perfil</button>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: sans-serif;
}

.perfil {
  background: #e8e1f2;
  min-height: 100vh;
  padding-bottom: 40px;
}


.header-perfil {
  position: relative;
  border-bottom-left-radius: 40px;
  border-bottom-right-radius: 40px;

  background-image: url('/src/assets/images/perfil.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  padding: 40px 50px 120px;
  overflow: hidden;
}

.separacao {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(2px);
}

.profile-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 2;
}

.img-usu {
  position: relative;
}

.avatar {
  width: 90px;
  height: 90px;
  background: #8c8c8c;
  border-radius: 50%;
}

.icone {
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

.info {
  display: flex;
  flex-direction: column;
  justify-content: center;

  flex: 1;

  text-align: center;
}

.info h2 {
  color: white;
  font-size: 24px;
  font-weight: 700;
}

.info span {
  color: #ece2ff;
  font-size: 14px;
}

.loc {
  justify-content: center;
}


.status {
  position: absolute;
  left: 50%;
  bottom: 10px;
  transform: translateX(-50%);
  width: 92%;
  display: flex;


  gap: 10px;
  z-index: 3;

}

.card {
  flex: 1;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  text-align: center;
  padding: 14px 10px;
  color: #5e4d77;
}

.card.ativo {
  background: rgba(255, 255, 255, 0.9);
}

.card i {
  margin-bottom: 6px;
}

.card h3 {
  font-size: 18px;
}

.card p {
  font-size: 12px;


}



.box {
  background: #f5f2fb;
  margin: 25px 14px 10px 14px;
  padding: 16px;
  border-radius: 18px;
}

.titulo {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6d47d9;
  margin-bottom: 12px;
}

.titulo h3 {
  font-weight: 650;
  font-size: 16px;
}

.box p {
  color: #513f7c;
  font-size: 14px;
  line-height: 1.5;
}



.hab {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.hab span {
  background: #aba6b5;
  color: #49357b;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 650;
}



.superior-port {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.superior-port button {
  border: none;
  background: none;
  color: #7a3ff2;
  font-size: 12px;
  cursor: pointer;
}

.portfolio {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  margin-top: 12px;
}

.portfolio::-webkit-scrollbar {
  display: none;
}

.portfolio-card {
  min-width: 140px;
}

.portfolio-image {
  width: 100%;
  height: 90px;
  background: #aaa;
  border-radius: 12px;
  margin-bottom: 8px;

}

.portfolio-card h4 {
  font-size: 13px;

  color: #444;
}

.portfolio-card p {
  font-size: 11px;
  color: #777;
}



.last-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 16px;
}

.last-card {
  background: #f5f2fb;
  border-radius: 18px;
  padding: 16px;
}

.last-card p {
  font-size: 13px;
  color: #666;
}


.btn-editar {
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
  margin-bottom: 100px;

}
</style>
