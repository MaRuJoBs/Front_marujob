<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import {
  faArrowLeft,
  faHeart,
  faCircleInfo,
  faLocationDot,
  faClock,
  faWallet,
  faListCheck,
  faCheck,
  faMessage,
  faPaperPlane
} from '@fortawesome/free-solid-svg-icons'

const route = useRoute()
const router = useRouter()

const API_URL = 'https://marujob.class.fabricadesoftware.ifc.edu.br'

const job = ref(null)
const isFavorite = ref(false)

function favoritar() {
  isFavorite.value = !isFavorite.value
}

function voltar() {
  router.back()
}

onMounted(async () => {
  try {
    const res = await fetch(
      `${API_URL}/api/freelances/${route.params.id}/`
    )

    job.value = await res.json()
  } catch (error) {
    console.error('Erro ao buscar oportunidade:', error)
  }
})
</script>

<template>
  <main class="oportunidade">
    <header class="topo">
      <button class="botao-icone" @click="voltar">
        <FontAwesomeIcon :icon="faArrowLeft" />
      </button>

      <button
        class="botao-icone favorito"
        :class="{ ativo: isFavorite }"
        @click="favoritar"
      >
        <FontAwesomeIcon :icon="faHeart" />
      </button>
    </header>

    <section class="cabecalho">
      <span class="categoria">
        {{ job?.tag || 'Freelance' }}
      </span>

      <h1>{{ job?.titulo }}</h1>
    </section>

    <section class="resumo">
      <div class="resumo-item">
        <FontAwesomeIcon :icon="faClock" />

        <div>
          <span>Duração</span>
          <strong>{{ job?.tempo }} horas</strong>
        </div>
      </div>

      <div class="linha"></div>

      <div class="resumo-item">
        <FontAwesomeIcon :icon="faWallet" />

        <div>
          <span>Pagamento</span>
          <strong>R$ {{ job?.preco }}</strong>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="titulo-card">
        <div class="icone-card">
          <FontAwesomeIcon :icon="faCircleInfo" />
        </div>

        <h2>Sobre a oportunidade</h2>
      </div>

      <p class="texto">
        {{ job?.descricao }}
      </p>
    </section>

    <section class="card informacoes-card">
      <div class="titulo-simples">
        <span>DETALHES</span>
        <h2>Informações</h2>
      </div>

      <div class="lista-info">
        <div class="info-item">
          <div class="info-icone">
            <FontAwesomeIcon :icon="faLocationDot" />
          </div>

          <div>
            <span>Localização</span>
            <strong>Centro, SP</strong>
          </div>
        </div>

        <div class="info-item">
          <div class="info-icone">
            <FontAwesomeIcon :icon="faClock" />
          </div>

          <div>
            <span>Tempo estimado</span>
            <strong>{{ job?.tempo }} horas</strong>
          </div>
        </div>
      </div>
    </section>

    <section class="card">
      <div class="titulo-card">
        <div class="icone-card">
          <FontAwesomeIcon :icon="faListCheck" />
        </div>

        <h2>Atividades</h2>
      </div>

      <ul class="lista">
        <li>Criação de artes para redes sociais e e-mail marketing.</li>
        <li>Edição de imagens e tratamento de fotos.</li>
        <li>Apoio na identidade visual de campanhas.</li>
        <li>Organização e atualização de arquivos de design.</li>
      </ul>
    </section>

    <section class="card">
      <div class="titulo-card">
        <div class="icone-card">
          <FontAwesomeIcon :icon="faCheck" />
        </div>

        <h2>Requisitos</h2>
      </div>

      <ul class="lista">
        <li>Conhecimento em Photoshop, Illustrator e/ou Canva.</li>
        <li>Noções de identidade visual e diagramação.</li>
        <li>Portfólio será um diferencial.</li>
      </ul>
    </section>

    <section class="contato">
      <div class="contato-icone">
        <FontAwesomeIcon :icon="faMessage" />
      </div>

      <div class="contato-texto">
        <h3>Ficou com alguma dúvida?</h3>
        <p>Entre em contato com o recrutador.</p>
      </div>

      <button class="btn-contato">
        Conversar
      </button>
    </section>

    <button class="btn-candidatar">
      <FontAwesomeIcon :icon="faPaperPlane" />
      Quero me candidatar
    </button>
  </main>
</template>

<style scoped>
.oportunidade {
  min-height: 100vh;
  padding: 18px 18px 100px;
  background: #eee8fa;
  box-sizing: border-box;
}

.topo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.botao-icone {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 14px;
  background: #fff;
  color: #5b3cc4;
  font-size: 17px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(72, 48, 120, 0.08);
  cursor: pointer;
  transition: 0.2s ease;
}

.botao-icone:active {
  transform: scale(0.95);
}

.favorito {
  color: #817a91;
}

.favorito.ativo {
  color: #e74865;
  background: #fff1f4;
}

.cabecalho {
  margin-bottom: 20px;
}

.categoria {
  display: inline-block;
  background: #e4dcf7;
  color: #5b3cc4;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  margin-bottom: 10px;
}

.cabecalho h1 {
  margin: 0;
  color: #49357b;
  font-size: 27px;
  line-height: 1.15;
  letter-spacing: -0.4px;
}

.resumo {
  background: linear-gradient(135deg, #5b3cc4, #7554dc);
  border-radius: 20px;
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-bottom: 18px;
  box-shadow: 0 8px 20px rgba(91, 60, 196, 0.22);
}

.resumo-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: white;
}

.resumo-item > svg {
  font-size: 22px;
}

.resumo-item div {
  display: flex;
  flex-direction: column;
}

.resumo-item span {
  font-size: 10px;
  opacity: 0.75;
}

.resumo-item strong {
  margin-top: 2px;
  font-size: 14px;
}

.linha {
  width: 1px;
  height: 38px;
  background: rgba(255, 255, 255, 0.3);
}

.card {
  background: #fff;
  border-radius: 20px;
  padding: 18px;
  margin-bottom: 14px;
  box-shadow: 0 4px 14px rgba(72, 48, 120, 0.07);
}

.titulo-card {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 13px;
}

.icone-card {
  width: 34px;
  height: 34px;
  border-radius: 11px;
  background: #f0ebfa;
  color: #5b3cc4;
  display: flex;
  align-items: center;
  justify-content: center;
}

.titulo-card h2 {
  margin: 0;
  color: #49357b;
  font-size: 16px;
}

.titulo-simples {
  margin-bottom: 15px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eeeaf4;
}

.titulo-simples span {
  display: block;
  margin-bottom: 3px;
  color: #a29bad;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 1px;
}

.titulo-simples h2 {
  margin: 0;
  color: #49357b;
  font-size: 18px;
  font-weight: 700;
}

.texto {
  margin: 0;
  color: #696273;
  font-size: 13px;
  line-height: 1.65;
}

.lista-info {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px;
  border-radius: 13px;
  transition: 0.2s ease;
}

.info-item:hover {
  background: #faf8fd;
}

.info-icone {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: #f0ebfa;
  color: #5b3cc4;
  display: flex;
  align-items: center;
  justify-content: center;
}

.info-item > div:last-child {
  display: flex;
  flex-direction: column;
}

.info-item span {
  color: #9a94a5;
  font-size: 10px;
}

.info-item strong {
  margin-top: 2px;
  color: #49357b;
  font-size: 13px;
}

.lista {
  list-style: none;
  padding: 0;
  margin: 0;
}

.lista li {
  position: relative;
  padding-left: 24px;
  margin-bottom: 12px;
  color: #696273;
  font-size: 13px;
  line-height: 1.5;
}

.lista li:last-child {
  margin-bottom: 0;
}

.lista li::before {
  content: '✓';
  position: absolute;
  left: 0;
  top: 1px;
  color: #5b3cc4;
  font-weight: bold;
}

.contato {
  display: flex;
  align-items: center;
  gap: 11px;
  background: #e4dcf7;
  border-radius: 18px;
  padding: 14px;
  margin: 20px 0;
}

.contato-icone {
  width: 42px;
  height: 42px;
  min-width: 42px;
  border-radius: 13px;
  background: #5b3cc4;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.contato-texto {
  flex: 1;
}

.contato h3 {
  margin: 0;
  color: #49357b;
  font-size: 13px;
}

.contato p {
  margin: 3px 0 0;
  color: #817a91;
  font-size: 10px;
}

.btn-contato {
  border: none;
  background: white;
  color: #5b3cc4;
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.btn-candidatar {
  width: 100%;
  border: none;
  border-radius: 15px;
  padding: 15px;
  margin-top: 10px;
  background: linear-gradient(135deg, #5b3cc4, #7554dc);
  color: white;
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  box-shadow: 0 7px 18px rgba(91, 60, 196, 0.25);
  cursor: pointer;
  transition: 0.2s ease;
}

.btn-candidatar:active {
  transform: scale(0.98);
}
</style>