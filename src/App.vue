<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import DesktopNav from './components/DesktopNav.vue'
import Footer from './components/Footer.vue'
import FooterEmpresa from './components/FooterEmpresaComponent.vue'
import ChatToastHost from './features/chat/components/ChatToastHost.vue'
import { useChatStore } from './features/chat/stores/chat'
import { useContadorNotificacoes } from './stores/contadorNotificacoes'
import { sessao } from './services/authService'
import { useNotificacoesFreelancer } from './stores/notificacoesFreelancer'
import {
  cancelarSincronizacaoPush,
  limparPushSemSessao,
  sincronizarPush,
} from './composables/usePushNotifications'
import { obterAccessToken, obterRefreshToken } from './services/authSession'
import { EVENTO_PUSH, RENOVAR_PUSH } from './pushEvents'
import './styles/tokens.css'
import './styles/shell.css'

const route = useRoute()
const chat = useChatStore()
const contador = useContadorNotificacoes()
const notificacoes = useNotificacoesFreelancer()
const centralFreelancer = 'notificacoes-freelancer'

function atualizarFreelancer() {
  if (sessao.tipo !== 'usuario') return
  notificacoes.atualizarContagem()
  if (route.name === centralFreelancer) notificacoes.carregar()
}

function aoRetomar() {
  if (document.visibilityState !== 'visible') return
  atualizarFreelancer()
  sincronizarPush({ verificar: true })
}

function aoReceberPush({ data }) {
  if (data?.type === EVENTO_PUSH) atualizarFreelancer()
  if (data?.type === RENOVAR_PUSH) sincronizarPush({ renovar: true })
}

watch(
  () => [sessao.revisao, sessao.tipo, sessao.usuario?.id],
  () => {
    notificacoes.limpar()
    cancelarSincronizacaoPush()
  },
  { flush: 'sync' },
)

watch(
  () => [sessao.revisao, sessao.tipo, sessao.usuario?.id, route.name],
  ([, tipo, id], anterior) => {
    if (
      (anterior?.[1] === 'usuario' || route.name === 'login') &&
      !obterAccessToken() &&
      !obterRefreshToken()
    ) {
      limparPushSemSessao()
    }
    if (tipo !== 'usuario' || id == null) return
    if (
      !anterior ||
      anterior[0] !== sessao.revisao ||
      anterior[2] !== id ||
      route.name === centralFreelancer
    ) {
      atualizarFreelancer()
      sincronizarPush()
    }
  },
  { immediate: true },
)

onMounted(() => {
  window.addEventListener('focus', aoRetomar)
  window.addEventListener('online', aoRetomar)
  document.addEventListener('visibilitychange', aoRetomar)
  navigator.serviceWorker?.addEventListener('message', aoReceberPush)
})

// Conversa aberta (/mensagens?room=<id>) ocupa a tela toda: sem rodapé de navegação.
const rodapeOculto = computed(
  () => Boolean(route.meta.hideFooter) || (route.name === 'mensagens' && route.query.room != null),
)

// F61: navegação desktop (≥ 64rem) em toda página autenticada. Independe de rodapeOculto, para que
// a conversa aberta e os formulários de vaga mantenham a navegação no computador.
const navegacaoDesktop = computed(() => Boolean(sessao.usuario) && !route.meta.publica)

// Chat em tempo real ligado só com usuário logado. Trocar de conta (ou sair) desliga e limpa tudo,
// para nada de uma conta sobrar na outra.
watch(
  () => [sessao.usuario?.id ?? null, sessao.revisao, sessao.tipo],
  ([id]) => {
    chat.stop()
    contador.limpar()
    if (id != null) chat.start()
    if (id != null && sessao.tipo === 'empresa') contador.atualizar()
  },
  { immediate: true },
)
watch(
  () => route.name,
  (nome) => {
    if (nome === 'notificacoes-empresa') contador.atualizar()
  },
)
onUnmounted(() => {
  chat.stop()
  contador.limpar()
  notificacoes.limpar()
  cancelarSincronizacaoPush()
  window.removeEventListener('focus', aoRetomar)
  window.removeEventListener('online', aoRetomar)
  document.removeEventListener('visibilitychange', aoRetomar)
  navigator.serviceWorker?.removeEventListener('message', aoReceberPush)
})
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
  'mensagens',
  'busca-freelancers',
  'perfil-publico-freelancer',
])
</script>

<template>
  <div
    class="app"
    :class="{
      'app--navigation': !rodapeOculto && sessao.usuario,
      'app--desktop-nav': navegacaoDesktop,
      'app--publica': $route.meta.publica,
      'app--empresa': sessao.tipo === 'empresa',
      'app--notificacoes mrj-ui': $route.name === 'notificacoes-freelancer',
      'app--page-reserve': paginasComReserva.has($route.name),
      'app--favorites': $route.name === 'favoritos',
      'app--wide': $route.meta.layout === 'wide',
    }"
  >
    <a class="saltar-conteudo" href="#conteudo-principal" @click.prevent="focarConteudo">
      Pular para o conteúdo
    </a>
    <DesktopNav v-if="navegacaoDesktop" />
    <section
      id="conteudo-principal"
      ref="conteudo"
      class="app-content"
      tabindex="-1"
      aria-label="Conteúdo da página"
    >
      <router-view />
    </section>

    <template v-if="!rodapeOculto && sessao.usuario">
      <FooterEmpresa v-if="sessao.tipo === 'empresa'" />
      <Footer v-else />
    </template>

    <ChatToastHost />
  </div>
</template>
