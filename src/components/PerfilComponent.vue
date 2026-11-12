<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { logout as encerrarSessao } from '@/services/authService'
import { resolverImagem as getImageUrl } from '@/services/perfilPortfolioService'
import { usePerfilPortfolio } from '@/composables/usePerfilPortfolio'
import PerfilAvatar from './PerfilAvatar.vue'
const router = useRouter()
const { usuario: user, projetos: portfolio, carregando, erro, carregar } = usePerfilPortfolio()
const email = computed(() => user.value?.email || '')
const logout = () => {
  encerrarSessao()
  router.replace('/')
}
onMounted(carregar)
</script>
<template>
  <div class="perfil mrj-ui freelancer-page">
    <p v-if="carregando" role="status">Carregando perfil...</p>
    <div v-else-if="erro" role="alert">
      {{ erro }} <button @click="carregar">Tentar novamente</button>
    </div>
    <template v-else-if="user"
      ><section class="header-perfil">
        <div class="separacao"></div>

        <div class="profile-content">
          <div class="img-usu">
            <PerfilAvatar :usuario="user" class="avatar" />

            <button class="icone" aria-label="Alterar foto" @click="router.push('/editar-perfil')">
              <i class="fa-solid fa-camera"></i>
            </button>
          </div>

          <div class="info">
            <h1>{{ user?.name }}</h1>
            <span>{{ user?.profissao || 'Profissão não informada' }}</span>
            <div class="loc">
              <i class="fa-solid fa-location-dot" aria-hidden="true"></i>
              <p>{{ user?.localizacao || 'Localização não informada' }}</p>
            </div>
          </div>
        </div>

        <div class="status">
          <div class="card">
            <i class="fa-regular fa-folder"></i>
            <h3>{{ portfolio.length }}</h3>
            <p>Projetos</p>
          </div>
        </div>
      </section>

      <div class="perfil-conteudo">
        <section class="box sobre-perfil">
          <div class="titulo">
            <i class="fa-regular fa-user"></i>
            <h2>Sobre</h2>
          </div>
          <p>
            {{ user?.sobre || 'Nenhuma informação adicionada.' }}
          </p>
        </section>

        <section class="box habilidades-perfil">
          <div class="titulo">
            <i class="fa-regular fa-folder"></i>
            <h2>Habilidades</h2>
          </div>

          <div class="hab">
            <span v-for="habilidade in user?.habilidades || []" :key="habilidade">
              {{ habilidade }}
            </span>

            <span v-if="!user?.habilidades?.length"> Nenhuma habilidade adicionada. </span>
          </div>
        </section>

        <section class="box projetos-perfil">
          <div class="superior-port">
            <router-link to="/portfolio" class="titulo-link">
              <div class="titulo">
                <i class="fa-regular fa-folder-open"></i>
                <h2>Portfólio</h2>
              </div>
            </router-link>

            <router-link to="/portfolio" class="ver-todos"> Ver todos > </router-link>
          </div>

          <div class="portfolio">
            <router-link
              v-for="item in portfolio"
              :key="item.id"
              :to="`/portfolio/${item.id}`"
              class="portfolio-card"
            >
              <img
                @load="
                  (event) => {
                    event.target.hidden = false
                  }
                "
                @error="
                  (event) => {
                    event.target.hidden = true
                  }
                "
                v-if="item.imagem"
                :src="getImageUrl(item.imagem)"
                class="portfolio-image"
                :alt="item.titulo"
              />

              <div v-else class="portfolio-image"></div>

              <h3>{{ item.titulo }}</h3>
              <p>{{ item.categoria }}</p>
            </router-link>

            <p v-if="portfolio.length === 0" class="sem-portfolio">
              Você ainda não possui projetos no portfólio.
            </p>
          </div>
        </section>

        <div class="last-info">
          <section class="last-card">
            <div class="titulo">
              <i class="fa-regular fa-envelope"></i>
              <h2>E-mail</h2>
            </div>

            <p>{{ email }}</p>
          </section>

          <section class="last-card">
            <div class="titulo">
              <i class="fa-solid fa-phone"></i>
              <h2>Telefone</h2>
            </div>

            <p>{{ user?.telefone || 'Telefone não informado' }}</p>
          </section>
        </div>

        <button class="btn-editar" @click="router.push('/editar-perfil')">Editar Perfil</button>
        <section class="configuracoes">
          <h2>Configurações da conta</h2>

          <button class="config-item" @click="router.push('/trocar-senha')">
            <div>
              <i class="fa-solid fa-lock"></i>
              <span>Alterar senha</span>
            </div>

            <i class="fa-solid fa-chevron-right"></i>
          </button>

          <button class="config-item sair" @click="logout">
            <div>
              <i class="fa-solid fa-right-from-bracket"></i>
              <span>Sair da conta</span>
            </div>

            <i class="fa-solid fa-chevron-right"></i>
          </button>
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped src="../styles/freelancer.css"></style>
<style scoped>
.perfil {
  min-height: 100dvh;
  padding-bottom: 112px;
}
.header-perfil {
  padding: 32px 24px;
  background: linear-gradient(120deg, #eee8ff, #f7f8fc);
}
.separacao {
  display: none;
}
.profile-content {
  display: flex;
  align-items: center;
  gap: 20px;
}
.img-usu {
  flex-shrink: 0;
  position: relative;
}
.avatar {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  border: 4px solid white;
  object-fit: cover;
  box-shadow: 0 6px 24px #35216712;
}
.icone {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  position: absolute;
  right: -8px;
  bottom: -4px;
  border: 3px solid white;
  border-radius: 50%;
  background: var(--mrj-color-primary);
  color: white;
}
.info {
  min-width: 0;
}
.info h1 {
  font-size: clamp(1.25rem, 3vw, 2rem);
}
.info > span {
  display: block;
  color: var(--mrj-color-text-secondary);
  font-size: 0.875rem;
  margin-top: 6px;
}
.loc {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-top: 10px;
  font-size: 0.8125rem;
  color: var(--mrj-color-text-secondary);
}
.loc i {
  margin-top: 4px;
  color: var(--mrj-color-primary);
}
.status {
  margin-top: 24px;
  display: flex;
}
.card {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid var(--mrj-color-border-subtle);
  padding: 10px 16px;
  border-radius: 12px;
}
.card i {
  color: var(--mrj-color-primary);
  margin-right: 4px;
}
.card h3 {
  font-size: 1rem;
}
.card p {
  font-size: 0.8125rem;
  color: var(--mrj-color-text-secondary);
}
.perfil-conteudo {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 26rem), 1fr));
  gap: 20px;
  padding: 24px;
}
.box,
.last-card,
.configuracoes {
  background: white;
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: 16px;
  padding: 24px;
  box-shadow: var(--mrj-shadow-card);
  min-width: 0;
}
.titulo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.titulo i {
  color: var(--mrj-color-primary);
}
.titulo h2 {
  font-size: 1rem;
}
.box > p {
  font-size: 0.875rem;
  line-height: 1.8;
  white-space: pre-wrap;
  color: var(--mrj-color-text-secondary);
}
.hab {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.hab span {
  max-width: 100%;
  padding: 7px 12px;
  background: var(--mrj-color-secondary);
  color: var(--mrj-color-primary);
  border-radius: 8px;
  font-size: 0.8125rem;
}
.projetos-perfil,
.last-info,
.btn-editar,
.configuracoes {
  grid-column: 1/-1;
}
.superior-port {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.superior-port .titulo {
  margin: 0;
}
.titulo-link,
.ver-todos {
  text-decoration: none;
}
.ver-todos {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: var(--mrj-color-primary);
  font-size: 0.8125rem;
}
.portfolio {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
  gap: 16px;
  margin-top: 20px;
}
.portfolio-card {
  display: block;
  min-width: 0;
  text-decoration: none;
  color: inherit;
}
.portfolio-image {
  display: block;
  width: 100%;
  aspect-ratio: 16/10;
  object-fit: cover;
  background: var(--mrj-color-secondary);
  border-radius: 12px;
  margin-bottom: 12px;
}
.portfolio-card h3 {
  font-size: 0.875rem;
  line-height: 1.6;
}
.portfolio-card p,
.sem-portfolio {
  font-size: 0.8125rem;
  color: var(--mrj-color-text-secondary);
  margin-top: 4px;
}
.last-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
  gap: 20px;
}
.last-card p {
  font-size: 0.875rem;
  color: var(--mrj-color-text-secondary);
}
.btn-editar {
  justify-self: start;
  padding: 12px 24px;
  border: 0;
  border-radius: 10px;
  color: white;
  background: var(--mrj-color-primary);
  font-size: 0.875rem;
  font-weight: 600;
}
.configuracoes h2 {
  font-size: 1rem;
  margin-bottom: 12px;
}
.config-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 14px 0;
  border: 0;
  border-bottom: 1px solid var(--mrj-color-border-subtle);
  background: transparent;
  font-size: 0.875rem;
  color: var(--mrj-color-text-secondary);
}
.config-item > div {
  display: flex;
  align-items: center;
  gap: 12px;
}
.config-item:last-child {
  border: 0;
  padding-bottom: 0;
}
.config-item.sair {
  color: var(--mrj-color-danger);
}
</style>
