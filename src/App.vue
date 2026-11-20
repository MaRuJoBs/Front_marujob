<script setup>
import { nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Footer from './components/Footer.vue'
import FooterEmpresa from './components/FooterEmpresaComponent.vue'
import { sessao } from './services/authService'
import './styles/tokens.css'
import './styles/shell.css'

const route = useRoute()
const conteudo = ref(null)
const focarConteudo = () => conteudo.value?.focus()
watch(
  () => route.path,
  async () => {
    await nextTick()
    const titulo = conteudo.value?.querySelector('h1')
    if (titulo) {
      titulo.setAttribute('tabindex', '-1')
      titulo.focus({ preventScroll: true })
    } else focarConteudo()
  },
  { flush: 'post' },
)

// Estas páginas já reservam espaço para a navegação inferior.
// Mantém a reserva local sem somar novamente a altura inteira do footer.
const paginasComReserva = new Set([
  'home',
  'homeEmpresa',
  'freelances',
  'oportunidade',
  'favoritos',
  'perfil',
  'portfolio',
  'detalhe-vaga-empresa',
  'perfil-empresa',
  'configuracoes-empresa',
  'notificacoes-empresa',
  'busca-freelancers',
  'perfil-publico-freelancer',
])
</script>

<template>
  <div
    class="app"
    :class="{
      'app--navigation': !$route.meta.hideFooter && sessao.usuario,
      'app--empresa': sessao.tipo === 'empresa',
      'app--page-reserve': paginasComReserva.has($route.name),
      'app--favorites': $route.name === 'favoritos',
      'app--wide': $route.meta.layout === 'wide',
    }"
  >
    <a class="saltar-conteudo" href="#conteudo-principal" @click.prevent="focarConteudo">
      Pular para o conteúdo
    </a>
    <section
      id="conteudo-principal"
      ref="conteudo"
      class="app-content"
      tabindex="-1"
      aria-label="Conteúdo da página"
    >
      <router-view />
    </section>

    <template v-if="!$route.meta.hideFooter && sessao.usuario">
      <FooterEmpresa v-if="sessao.tipo === 'empresa'" />
      <Footer v-else />
    </template>
  </div>
</template>
