<script setup>
import { ref, onMounted } from 'vue'
// import logoMaruJob from '@/assets/images/logoempresa.png'
import fundoEmpresa from '@/assets/images/fundoempresa.png'
import { sessao } from '@/services/authService'
import { storeToRefs } from 'pinia'
import { useVagasStore } from '@/stores/vagas'
import { formatarPagamento } from '@/utils/vagaForm'

const vagasStore = useVagasStore()
const { ultimaPublicada, confirmacao } = storeToRefs(vagasStore)

const mostrarAvisoSenha = ref(false)

onMounted(() => {
  mostrarAvisoSenha.value = localStorage.getItem('precisa_definir_senha') === 'true'
})
</script>
<template>
  <main class="home" :style="{ backgroundImage: `url('${fundoEmpresa}')` }">
    <div v-if="confirmacao" class="confirmacao-publicacao" role="status">
      <div>
        <strong>{{ confirmacao }}</strong>
        <p>Sua oportunidade já foi enviada para a plataforma.</p>
      </div>
      <button
        type="button"
        aria-label="Fechar confirmação de publicação"
        @click="vagasStore.confirmacao = ''"
      >
        ×
      </button>
    </div>
    <div v-if="mostrarAvisoSenha" class="aviso-senha">
      <button class="fechar-aviso" @click="mostrarAvisoSenha = false">×</button>

      <div class="aviso-conteudo">
        <strong>Crie uma senha para sua conta</strong>

        <span>
          Sua conta Google ainda não possui uma senha. Você pode criar uma para também entrar usando
          seu e-mail e senha.
        </span>

        <button class="btn-criar-senha" @click="$router.push('/definir-senha')">Criar senha</button>
      </div>
    </div>
    <!-- Welcome -->
    <section class="welcome">
      <h2>Bem-vindo, {{ sessao.usuario?.name || 'Empresa' }}!</h2>

      <p>Encontre os melhores freelancers para seus projetos.</p>

      <router-link v-if="sessao.tipo === 'empresa'" class="new-job" to="/criar-vaga">
        <span>+</span>
        Criar nova vaga
      </router-link>
    </section>

    <!-- Vagas -->
    <section class="section">
      <div class="section-title">
        <h3>Última vaga publicada</h3>
      </div>

      <div v-if="ultimaPublicada" class="job-card vaga-publicada">
        <div class="job-header">
          <h4>{{ ultimaPublicada.titulo }}</h4>

          <div class="price">{{ formatarPagamento(ultimaPublicada.preco) }}</div>
        </div>

        <p v-if="ultimaPublicada.descricao" class="descricao-publicada">
          {{ ultimaPublicada.descricao }}
        </p>

        <div class="job-footer">
          <div class="job-info">{{ ultimaPublicada.tag }}</div>

          <div class="job-info">
            <i class="fa-regular fa-clock" aria-hidden="true"></i> {{ ultimaPublicada.tempo }} horas
          </div>
        </div>
      </div>

      <p v-else class="sem-publicacao">
        A confirmação da sua próxima publicação aparecerá aqui. O histórico de vagas ainda não está
        disponível nesta área.
      </p>
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
.new-job {
  text-decoration: none;
}
.confirmacao-publicacao {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin: 16px;
  padding: 16px;
  border-radius: 14px;
  color: #216547;
  background: #e9f8ee;
  border: 1px solid #bde2ca;
}
.confirmacao-publicacao strong {
  font-weight: 600;
  font-size: 14px;
}
.confirmacao-publicacao p {
  margin-top: 4px;
  font-size: 12px;
}
.confirmacao-publicacao button {
  margin-left: auto;
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 22px;
  cursor: pointer;
}
.descricao-publicada {
  font-size: 13px;
  line-height: 1.7;
  color: #756889;
  margin: 12px 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.vaga-publicada .job-header {
  align-items: flex-start;
  gap: 12px;
}
.vaga-publicada h4 {
  overflow-wrap: anywhere;
  min-width: 0;
}
.vaga-publicada .price {
  white-space: nowrap;
}
.sem-publicacao {
  padding: 18px;
  background: #f5f3fc;
  border-radius: 14px;
  color: #756889;
  font-size: 13px;
  line-height: 1.7;
}
/* Aviso para criar senha */
.aviso-senha {
  position: fixed;
  top: 10px;

  width: calc(100% - 40px);
  max-width: 420px;

  left: 50%;
  transform: translateX(-50%);

  padding: 18px;

  background: #efe5fa;
  border-radius: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);

  z-index: 1000;
}

.fechar-aviso {
  position: absolute;
  top: 8px;
  right: 10px;

  border: none;
  background: transparent;

  color: #74688f;
  font-size: 22px;
  cursor: pointer;
}

.aviso-conteudo {
  display: flex;
  flex-direction: column;
  gap: 8px;

  padding-right: 20px;
}

.aviso-conteudo strong {
  color: #5e3ea7;
  font-size: 16px;
}

.aviso-conteudo span {
  color: #74688f;
  font-size: 13px;
  line-height: 1.4;
}

.btn-criar-senha {
  width: fit-content;

  margin-top: 5px;
  padding: 9px 16px;

  border: none;
  border-radius: 20px;

  background: #7854d7;
  color: white;

  font-size: 13px;
  font-weight: 600;

  cursor: pointer;
}
.home {
  min-height: 100vh;
  width: 100%;

  background-repeat: no-repeat;
  background-position: top center;

  margin-top: -17px;

  background-size: cover;
  background-attachment: scroll;

  padding-bottom: 100px;
}

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
  background-color: #5b3cc4;
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
