<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const API_URL = 'https://marujob.class.fabricadesoftware.ifc.edu.br'

const empresa = ref({
  name: 'Nome da Empresa',
  area: 'Agência de Desenvolvimento',
  profile_image: null,
  rating: 5,
  reviews: 32,
  location: 'Centro, SP',
  resumo: 'Agência especializada em desenvolvimento de apps e sistemas personalizados.',
  sobre:
    'Somos uma agência de desenvolvimento focada na criação de aplicativos e sistemas personalizados para clientes de todos os portes. Com uma equipe experiente, desenvolvemos soluções inovadoras e sob medida para as necessidades de cada cliente.',
  telefone: '(11) 9999-99999',
  email: 'contato@empresa.com.br',
  site: 'www.empresa.com.br',
})

const tags = ['Design de app', 'Branding', 'Web', 'Dev', 'UX/UI']

const vagas = ref([
  {
    id: 1,
    titulo: 'Design de App',
    tempo: '3 dias atrás',
    local: 'Centro, SP • Aprovação',
    modelo: 'Home office',
  },
  {
    id: 2,
    titulo: 'Design de App',
    tempo: '3 dias atrás',
    local: 'Centro, SP • Aprovação',
    modelo: 'Home office',
  },
])

const getImageUrl = (path) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${API_URL}${path}`
}

onMounted(async () => {
  // Ajuste o endpoint quando a API de empresas estiver pronta
  try {
    const response = await axios.get(`${API_URL}/api/usuarios/me/`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
    empresa.value.name = response.data.name || empresa.value.name
    empresa.value.email = response.data.email || empresa.value.email
    empresa.value.profile_image = response.data.profile_image
  } catch (erro) {
    console.error('Erro ao buscar empresa:', erro)
  }
})
</script>

<template>
  <div class="perfil">
    <!-- TOPO -->
    <header class="topo">
      <img src="/src/assets/images/logoempresa.png" alt="MaruJob's Empresas" class="logo" />
    </header>

    <!-- CARD PRINCIPAL -->
    <section class="card-empresa">
      <div class="linha-principal">
        <img
          v-if="empresa.profile_image"
          :src="getImageUrl(empresa.profile_image)"
          class="avatar"
          alt="Logo da empresa"
        />
        <div v-else class="avatar"></div>

        <div class="info">
          <h2>{{ empresa.name }}</h2>
          <span>{{ empresa.area }}</span>
        </div>

        <button class="btn-editar">Editar perfil</button>
      </div>

      <div class="avaliacao">
        <div class="estrelas">
          <i v-for="n in empresa.rating" :key="n" class="fa-solid fa-star"></i>
        </div>
        <span>({{ empresa.reviews }} avaliações)</span>
      </div>

      <div class="loc">
        <i class="fa-solid fa-location-dot"></i>
        <p>{{ empresa.location }}</p>
      </div>
    </section>

    <!-- RESUMO -->
    <section class="resumo">
      <p>{{ empresa.resumo }}</p>
      <i class="fa-solid fa-chevron-right"></i>
    </section>

    <!-- TAGS -->
    <div class="tags">
      <span v-for="tag in tags" :key="tag">{{ tag }}</span>
      <span class="mais"><i class="fa-solid fa-plus"></i></span>
    </div>

    <!-- VAGAS -->
    <section class="box">
      <div class="superior">
        <h3>Vagas da Empresa</h3>
        <router-link to="/vagas" class="ver-todas">Ver todas ></router-link>
      </div>

      <div class="vaga" v-for="vaga in vagas" :key="vaga.id">
        <div class="vaga-icone">
          <i class="fa-solid fa-briefcase"></i>
        </div>

        <div class="vaga-info">
          <h4>{{ vaga.titulo }}</h4>
          <small>{{ vaga.tempo }}</small>

          <div class="vaga-detalhe">
            <i class="fa-solid fa-location-dot"></i>
            <span>{{ vaga.local }}</span>
          </div>
          <div class="vaga-detalhe">
            <i class="fa-solid fa-house-laptop"></i>
            <span>{{ vaga.modelo }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- SOBRE NÓS -->
    <section class="box">
      <h3 class="titulo-simples">Sobre nós</h3>
      <p class="texto">{{ empresa.sobre }}</p>
    </section>

    <!-- CONTATO -->
    <section class="box contato">
      <h3 class="titulo-simples">Sobre nós</h3>

      <div class="contato-item">
        <i class="fa-solid fa-phone"></i>
        <p>{{ empresa.telefone }}</p>
      </div>
      <div class="contato-item">
        <i class="fa-regular fa-envelope"></i>
        <p>{{ empresa.email }}</p>
      </div>
      <div class="contato-item">
        <i class="fa-solid fa-globe"></i>
        <p>{{ empresa.site }}</p>
      </div>
    </section>
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
  min-height: 100vh;
  padding: 0 14px 100px;
  background-color: #b9a3ee;
  background-image: url('/src/assets/images/fundoempresa.png');
  background-size: cover;
  background-position: center top;
  background-repeat: no-repeat;
  background-attachment: fixed;
}

/* TOPO */
.topo {
  display: flex;
  justify-content: center;
  padding: 24px 0 18px;
}

.logo {
  width: 65%;
  max-width: 320px;
  height: auto;
  object-fit: contain;
}

/* CARD PRINCIPAL */
.card-empresa {
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 16px;
}

.linha-principal {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 70px;
  height: 70px;
  min-width: 70px;
  border-radius: 50%;
  background: #8c8c8c;
  object-fit: cover;
}

.info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.info h2 {
  font-size: 17px;
  font-weight: 700;
  color: #2f2150;
}

.info span {
  font-size: 11px;
  color: #6b5a8e;
}

.btn-editar {
  border: none;
  background: #7a3ff2;
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 10px;
  cursor: pointer;
  align-self: flex-start;
}

.avaliacao {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.estrelas {
  color: #f5b301;
  font-size: 14px;
  display: flex;
  gap: 2px;
}

.avaliacao span {
  font-size: 12px;
  color: #5e4d77;
}

.loc {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  color: #6d47d9;
  font-size: 13px;
}

.loc p {
  color: #4b3b6e;
}

/* RESUMO */
.resumo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 12px;
  padding: 12px 14px;
  background: rgba(255, 255, 255, 0.45);
  border-radius: 12px;
  color: #4b3b6e;
  font-size: 13px;
}

.resumo i {
  color: #8a7aa8;
  font-size: 12px;
}

/* TAGS */
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.tags span {
  background: rgba(255, 255, 255, 0.55);
  color: #4b3b6e;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 20px;
}

.tags .mais {
  background: #fff;
  color: #7a3ff2;
}

/* BOX GENÉRICO */
.box {
  background: rgba(255, 255, 255, 0.45);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  padding: 16px;
  margin-top: 14px;
}

.superior {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.superior h3,
.titulo-simples {
  font-size: 16px;
  font-weight: 700;
  color: #2f2150;
}

.titulo-simples {
  margin-bottom: 10px;
}

.ver-todas {
  text-decoration: none;
  color: #7a3ff2;
  font-size: 12px;
  font-weight: 600;
}

/* VAGAS */
.vaga {
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(255, 255, 255, 0.55);
  border-radius: 16px;
  padding: 14px;
  margin-bottom: 10px;
}

.vaga:last-child {
  margin-bottom: 0;
}

.vaga-icone {
  width: 54px;
  height: 54px;
  min-width: 54px;
  border-radius: 14px;
  background: #7a3ff2;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
}

.vaga-info h4 {
  font-size: 15px;
  font-weight: 700;
  color: #2f2150;
}

.vaga-info small {
  display: block;
  font-size: 11px;
  color: #6b5a8e;
  margin-bottom: 4px;
}

.vaga-detalhe {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #4b3b6e;
}

.vaga-detalhe i {
  color: #7a3ff2;
  font-size: 10px;
  width: 12px;
}

/* SOBRE / CONTATO */
.texto {
  font-size: 13px;
  line-height: 1.5;
  color: #3d2f5c;
}

.contato-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
  color: #4b3b6e;
}

.contato-item:last-child {
  margin-bottom: 0;
}

.contato-item i {
  width: 18px;
  text-align: center;
  color: #4b3b6e;
}

.contato-item p {
  font-size: 14px;
}
</style>