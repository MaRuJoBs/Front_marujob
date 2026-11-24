<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons'
import { logout } from '@/services/authService'
import { sessao } from '@/services/authSession'
import IndicadorAvisos from './IndicadorAvisos.vue'
import { itemAtivo, navegacaoDesktop } from './navegacaoDesktop'

// F61 · Navegação desktop (≥ 64rem), a mesma para freelancer e empresa; os itens vêm da
// configuração por tipo de conta. Abaixo de 64rem fica oculta e a barra inferior continua.
const route = useRoute()
const router = useRouter()
const config = computed(() => navegacaoDesktop[sessao.tipo === 'empresa' ? 'empresa' : 'usuario'])
const ativo = computed(() => itemAtivo(config.value.itens, route))

function sair() {
  logout()
  router.replace('/')
}
</script>

<template>
  <nav
    class="desktop-nav mrj-ui"
    :class="sessao.tipo === 'empresa' ? 'desktop-nav--empresa' : 'desktop-nav--freelancer'"
    :aria-label="config.rotulo"
  >
    <!-- Marca sem aria-current: a página atual é indicada só pelo item da lista. -->
    <router-link v-slot="{ href, navigate }" :to="config.inicio" custom>
      <a :href="href" class="desktop-nav__marca" @click="navigate">
        <img src="@/assets/images/logo.png" alt="" />
        <span class="desktop-nav__rotulo desktop-nav__nome">MaRuJoB's</span>
        <span class="sr-only">— início</span>
      </a>
    </router-link>

    <ul class="desktop-nav__lista">
      <li v-for="item in config.itens" :key="item.id">
        <router-link v-slot="{ href, navigate }" :to="item.to" custom>
          <a
            :href="href"
            class="desktop-nav__item"
            :class="{ 'desktop-nav__item--ativo': ativo === item.id }"
            :aria-current="ativo === item.id ? 'page' : undefined"
            @click="navigate"
          >
            <span class="desktop-nav__icone">
              <FontAwesomeIcon :icon="item.icone" aria-hidden="true" />
            </span>
            <span class="desktop-nav__rotulo">{{ item.rotulo }}</span>
            <IndicadorAvisos
              v-if="item.indicador"
              :candidaturas="item.indicador === 'candidaturas'"
              :candidaturas-empresa="item.indicador === 'candidaturas-empresa'"
            />
          </a>
        </router-link>
      </li>
    </ul>

    <button v-if="config.sair" type="button" class="desktop-nav__item desktop-nav__sair" @click="sair">
      <span class="desktop-nav__icone">
        <FontAwesomeIcon :icon="faRightFromBracket" aria-hidden="true" />
      </span>
      <span class="desktop-nav__rotulo">Sair</span>
    </button>
  </nav>
</template>

<style scoped>
.desktop-nav {
  display: none;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (min-width: 64rem) {
  .desktop-nav {
    position: fixed;
    inset: 0 auto 0 0;
    z-index: 900;
    display: flex;
    flex-direction: column;
    gap: var(--mrj-space-1);
    width: var(--mrj-layout-sidebar);
    padding: var(--mrj-space-4) var(--mrj-space-2);
    box-sizing: border-box;
    background: var(--mrj-color-surface);
    border-right: 1px solid var(--mrj-color-border-subtle);
    box-shadow: 4px 0 24px #4c35670d;
    font-family: var(--mrj-font-family);
  }

  .desktop-nav--freelancer {
    --mrj-color-primary: #673fd7;
    --mrj-color-primary-hover: #5b3cc4;
    --mrj-color-primary-active: #5b3cc4;
    --mrj-color-secondary: #f0ebff;
    --mrj-color-surface: #ffffff;
    --mrj-color-text: #202137;
    --mrj-color-text-secondary: #666b80;
    --mrj-color-border-subtle: #e8eaf2;
    --mrj-color-focus: #5b3cc4;
    --mrj-font-family: 'Poppins', sans-serif;
  }

  .desktop-nav__marca {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--mrj-space-2);
    min-height: var(--mrj-control-height-lg);
    margin-bottom: var(--mrj-space-4);
    color: var(--mrj-color-primary-hover);
    font-weight: 700;
    font-size: var(--mrj-font-size-lg);
    text-decoration: none;
    border-radius: var(--mrj-radius-md);
  }

  .desktop-nav__marca img {
    width: 2.5rem;
    height: 2.5rem;
    flex: none;
  }

  .desktop-nav__lista {
    display: flex;
    flex-direction: column;
    gap: var(--mrj-space-1);
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .desktop-nav__item {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--mrj-space-3);
    width: 100%;
    min-height: var(--mrj-control-height-md);
    padding: var(--mrj-space-1);
    box-sizing: border-box;
    border: 0;
    border-radius: var(--mrj-radius-md);
    background: transparent;
    color: var(--mrj-color-text-secondary);
    font: inherit;
    font-size: var(--mrj-font-size-sm);
    text-decoration: none;
    cursor: pointer;
    transition:
      background-color var(--mrj-motion-duration) ease,
      color var(--mrj-motion-duration) ease;
  }

  /* Hover discreto; o destaque forte (fundo, cor e barra) é exclusivo do aria-current. */
  .desktop-nav__item:hover:not(.desktop-nav__item--ativo) {
    background: color-mix(in srgb, var(--mrj-color-secondary) 45%, transparent);
    color: var(--mrj-color-text);
  }

  .desktop-nav__item--ativo {
    background: var(--mrj-color-secondary);
    color: var(--mrj-color-primary-hover);
    font-weight: var(--mrj-font-weight-semibold);
  }

  .desktop-nav__item--ativo::before {
    content: '';
    position: absolute;
    inset: 0.625rem auto 0.625rem calc(-1 * var(--mrj-space-2));
    width: 3px;
    border-radius: 0 3px 3px 0;
    background: var(--mrj-color-primary);
  }

  .desktop-nav__item:focus-visible,
  .desktop-nav__marca:focus-visible {
    outline: var(--mrj-focus-width) solid var(--mrj-color-focus);
    outline-offset: 0;
  }

  .desktop-nav__icone {
    display: grid;
    flex: none;
    place-items: center;
    width: 2.25rem;
    height: 2.25rem;
    font-size: 1.0625rem;
  }

  .desktop-nav__sair {
    margin-top: auto;
  }

  /* Indicador de não lidos sobre o ícone (posição absoluta herdada de IndicadorAvisos). */
  .desktop-nav__item :deep(.indicador) {
    top: 0.125rem;
    right: auto;
    left: 1.75rem;
  }

  /* 1024–1279px: recolhida, só ícones. O rótulo continua no DOM (nome acessível) e vira
     dica visual ao passar o mouse ou focar pelo teclado. */
  .desktop-nav__rotulo {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  .desktop-nav__item:is(:hover, :focus-visible) .desktop-nav__rotulo {
    left: calc(100% + var(--mrj-space-3));
    top: 50%;
    z-index: 1;
    width: auto;
    height: auto;
    overflow: visible;
    clip-path: none;
    transform: translateY(-50%);
    padding: var(--mrj-space-1) var(--mrj-space-3);
    border-radius: var(--mrj-radius-sm);
    background: var(--mrj-color-text);
    color: #fff;
    font-weight: var(--mrj-font-weight-regular);
    box-shadow: 0 4px 14px #4c356733;
    pointer-events: none;
  }
}

@media (min-width: 80rem) {
  .desktop-nav {
    padding-inline: var(--mrj-space-4);
  }

  .desktop-nav__marca {
    justify-content: flex-start;
    padding-inline: var(--mrj-space-2);
  }

  .desktop-nav__item {
    justify-content: flex-start;
    padding-inline: var(--mrj-space-2);
  }

  .desktop-nav__item--ativo::before {
    left: calc(-1 * var(--mrj-space-4));
  }

  .desktop-nav__rotulo,
  .desktop-nav__item:is(:hover, :focus-visible) .desktop-nav__rotulo {
    position: static;
    width: auto;
    height: auto;
    overflow: visible;
    clip-path: none;
    transform: none;
    padding: 0;
    background: none;
    color: inherit;
    font-weight: inherit;
    box-shadow: none;
    white-space: normal;
  }

  .desktop-nav__item :deep(.indicador) {
    position: static;
    margin-left: auto;
  }
}
</style>
