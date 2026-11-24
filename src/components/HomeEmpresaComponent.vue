<script setup>
import { computed, nextTick, ref, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import ConfirmarExclusaoVaga from '@/components/ConfirmarExclusaoVaga.vue'
import fundoEmpresa from '@/assets/images/fundoempresa.png'
import { sessao } from '@/services/authService'
import { storeToRefs } from 'pinia'
import { useVagasStore } from '@/stores/vagas'
import { useGerenciamentoVagas } from '@/stores/gerenciamentoVagas'
import { formatarTempo, formatarPagamento } from '@/utils/vagaForm'
import { ANCORA_VAGAS_EMPRESA } from '@/components/navegacaoDesktop'

const vagasStore = useVagasStore()
const { confirmacao } = storeToRefs(vagasStore)
const gerenciamento = useGerenciamentoVagas()
const { vagas, ultima: ultimaPublicada, carregando, erro, sucesso } = storeToRefs(gerenciamento)
const busca = ref('')
const categoria = ref('')
const categorias = computed(() => [...new Set(vagas.value.map((vaga) => vaga.tag).filter(Boolean))])
const normalizarBusca = (texto) =>
  String(texto ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
const vagasFiltradas = computed(() =>
  vagas.value.filter(
    (vaga) =>
      (!categoria.value || vaga.tag === categoria.value) &&
      normalizarBusca(`${vaga.titulo} ${vaga.descricao} ${vaga.tag}`).includes(
        normalizarBusca(busca.value).trim(),
      ),
  ),
)
watch(
  () => [sessao.usuario?.id, sessao.revisao, sessao.tipo],
  () => {
    busca.value = ''
    categoria.value = ''
    if (sessao.tipo === 'empresa') gerenciamento.carregar()
  },
  { immediate: true },
)

// F61: "Gerenciar vagas" (navegação desktop) abre /homeEmpresa#vagas-empresa. Depois de carregar,
// leva à lista de vagas (ou ao painel de vagas, quando ainda não há nenhuma) e move o foco.
const route = useRoute()
watch(
  () => [route.hash, carregando.value],
  async ([hash, ocupado], anterior) => {
    if (ocupado) return
    await nextTick()
    if (hash === ANCORA_VAGAS_EMPRESA) {
      const secao =
        document.getElementById(ANCORA_VAGAS_EMPRESA.slice(1)) ??
        document.querySelector('.ultima-publicada')
      secao?.scrollIntoView({ block: 'start' })
      secao?.querySelector('h2')?.focus({ preventScroll: true })
    } else if (anterior?.[0] === ANCORA_VAGAS_EMPRESA) window.scrollTo({ top: 0 })
  },
  { immediate: true },
)

const mostrarAvisoSenha = ref(false)

onMounted(() => {
  mostrarAvisoSenha.value = localStorage.getItem('precisa_definir_senha') === 'true'
})
</script>
<template>
  <main class="home mrj-ui">
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
      <button
        class="fechar-aviso"
        aria-label="Fechar aviso de criação de senha"
        @click="mostrarAvisoSenha = false"
      >
        ×
      </button>

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
    <section class="welcome" :style="{ backgroundImage: `url('${fundoEmpresa}')` }">
      <p class="welcome-label">Área da empresa</p>
      <h1>Bem-vindo, {{ sessao.usuario?.name || 'Empresa' }}!</h1>

      <p>Gerencie suas vagas e encontre profissionais para seus projetos.</p>

      <router-link v-if="sessao.tipo === 'empresa'" class="new-job" to="/criar-vaga">
        <span>+</span>
        Criar nova vaga
      </router-link>
    </section>

    <!-- Vagas -->
    <section class="section painel-vagas ultima-publicada" :aria-busy="carregando">
      <div class="section-title">
        <h2 tabindex="-1">
          {{ ultimaPublicada ? 'Última vaga publicada' : 'Suas oportunidades' }}
        </h2>
      </div>

      <p v-if="carregando" class="estado-vagas" role="status">Carregando suas oportunidades...</p>
      <div v-else-if="erro" class="estado-vagas estado-vagas--erro" role="alert">
        {{ erro }} <button type="button" @click="gerenciamento.carregar()">Tentar novamente</button>
      </div>
      <router-link
        v-else-if="ultimaPublicada"
        class="job-card vaga-publicada destaque-vaga"
        :to="'/empresa/vagas/' + ultimaPublicada.id"
        :aria-label="'Ver detalhes de ' + ultimaPublicada.titulo"
      >
        <span class="vaga-icone" aria-hidden="true"
          ><FontAwesomeIcon :icon="['fas', 'briefcase']"
        /></span>
        <div class="vaga-conteudo">
          <div class="job-header">
            <h3>{{ ultimaPublicada.titulo }}</h3>
            <strong class="price">{{ formatarPagamento(ultimaPublicada.preco) }}</strong>
          </div>
          <div class="job-footer">
            <span class="job-info">{{ ultimaPublicada.tag }}</span>
            <span class="job-info">{{ formatarTempo(ultimaPublicada.tempo) }}</span>
            <span v-if="ultimaPublicada.modalidade" class="job-info">{{
              ultimaPublicada.modalidade
            }}</span>
          </div>
          <span class="abrir-vaga">Ver detalhes <span aria-hidden="true">›</span></span>
        </div>
      </router-link>

      <div v-else class="sem-publicacao vazio-publicacao">
        <FontAwesomeIcon :icon="['fas', 'briefcase']" aria-hidden="true" />
        <h3>Publique sua primeira vaga</h3>
        <p>Você ainda não tem oportunidades publicadas.</p>
        <router-link to="/criar-vaga">Criar nova vaga</router-link>
      </div>
    </section>
    <section
      id="vagas-empresa"
      class="section painel-vagas gerenciamento-vagas"
      v-if="!carregando && !erro && vagas.length"
    >
      <div class="section-title">
        <h2 tabindex="-1">Vagas da empresa</h2>
        <span class="quantidade-vagas">{{ vagas.length }}</span>
      </div>
      <div class="filtros-vagas">
        <label for="busca-vagas-empresa">Buscar suas vagas</label>
        <div class="busca-vagas">
          <FontAwesomeIcon :icon="['fas', 'magnifying-glass']" aria-hidden="true" />
          <input
            id="busca-vagas-empresa"
            v-model="busca"
            type="search"
            placeholder="Buscar suas vagas"
          />
        </div>
        <label class="categoria-vagas">
          <span>Filtrar por categoria</span>
          <select v-model="categoria">
            <option value="">Todas as categorias</option>
            <option v-for="tag in categorias" :key="tag" :value="tag">{{ tag }}</option>
          </select>
        </label>
      </div>
      <p v-if="sucesso" role="status" class="confirmacao-publicacao">{{ sucesso }}</p>
      <p v-if="!vagasFiltradas.length" class="sem-publicacao" role="status">
        Nenhuma vaga encontrada com esses filtros.
      </p>
      <div class="lista-vagas">
        <article v-for="vaga in vagasFiltradas" :key="vaga.id" class="job-card vaga-publicada">
          <div class="vaga-icone" aria-hidden="true">
            <FontAwesomeIcon :icon="['fas', 'briefcase']" />
          </div>
          <div class="vaga-conteudo">
            <div class="job-header">
              <h4>
                <router-link class="titulo-vaga" :to="'/empresa/vagas/' + vaga.id">{{
                  vaga.titulo
                }}</router-link>
              </h4>
              <strong class="price">{{ formatarPagamento(vaga.preco) }}</strong>
            </div>
            <div class="job-footer">
              <span class="job-info">{{ vaga.tag }}</span>
              <span class="job-info">{{ formatarTempo(vaga.tempo) }}</span>
              <span v-if="vaga.modalidade" class="job-info">{{ vaga.modalidade }}</span>
              <span v-if="vaga.cidade || vaga.uf" class="job-info">{{
                [vaga.cidade, vaga.uf].filter(Boolean).join(' / ')
              }}</span>
            </div>
            <div class="acoes-vaga">
              <router-link :to="'/editar-vaga/' + vaga.id"
                >Editar<span class="sr-only"> {{ vaga.titulo }}</span></router-link
              >
              <button type="button" @click="gerenciamento.pedirExclusao(vaga)">
                Excluir<span class="sr-only"> {{ vaga.titulo }}</span>
              </button>
              <router-link class="ver-detalhes" :to="'/empresa/vagas/' + vaga.id"
                >Ver detalhes<span class="sr-only"> {{ vaga.titulo }}</span></router-link
              >
            </div>
          </div>
        </article>
      </div>
    </section>
    <p v-if="sucesso && !vagas.length" role="status" class="confirmacao-publicacao">
      {{ sucesso }}
    </p>
    <ConfirmarExclusaoVaga />
  </main>
</template>

<style scoped>
.home {
  min-height: calc(100dvh - 76px);
  padding-bottom: calc(104px + env(safe-area-inset-bottom, 0px));
  background: var(--mrj-color-secondary-hover);
  color: var(--mrj-color-text);
  font-family: var(--mrj-font-family);
  line-height: var(--mrj-line-height);
  overflow-wrap: anywhere;
}
.welcome {
  padding: 16px 16px 20px;
  background-color: var(--mrj-color-secondary);
  background-position: center 22%;
  background-size: cover;
  border-bottom: 1px solid var(--mrj-color-border-subtle);
}
.welcome-label {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 4px;
}
.welcome h1 {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
}
.welcome > p:not(.welcome-label) {
  margin-top: 6px;
  font-size: var(--mrj-font-size-sm);
  max-width: 36ch;
}
.new-job {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
  margin-top: 14px;
  padding: 8px 12px;
  border-radius: var(--mrj-radius-sm);
  background: var(--mrj-color-primary);
  color: var(--mrj-color-on-primary);
  font-size: var(--mrj-font-size-sm);
  font-weight: 600;
  text-decoration: none;
}
.new-job > span {
  font-size: 22px;
  line-height: 1;
}
.painel-vagas {
  margin: 16px 12px 0;
  padding: 12px;
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: var(--mrj-radius-lg);
  background: var(--mrj-color-secondary);
}
.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 10px;
}
.section-title h2 {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.4;
}
.quantidade-vagas {
  display: grid;
  place-items: center;
  min-width: 26px;
  min-height: 26px;
  padding: 2px 6px;
  border-radius: var(--mrj-radius-pill);
  font-size: 12px;
  background: var(--mrj-color-surface);
}
.job-card {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr);
  gap: 8px 10px;
  padding: 12px 10px;
  min-width: 0;
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: var(--mrj-radius-md);
  background: var(--mrj-color-surface);
}
.vaga-icone {
  display: grid;
  place-items: center;
  align-self: start;
  grid-row: 1 / 3;
  width: 32px;
  height: 36px;
  border-radius: var(--mrj-radius-sm);
  background: var(--mrj-color-primary);
  color: var(--mrj-color-on-primary);
  font-size: 16px;
}
.vaga-conteudo {
  display: contents;
}
.job-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: start;
  gap: 8px;
  min-width: 0;
  grid-column: 2;
}
.job-header :is(h3, h4) {
  min-width: 0;
  margin: 0;
  font-size: var(--mrj-font-size-sm);
  font-weight: 600;
  line-height: 1.4;
}
.titulo-vaga {
  display: inline-block;
  padding-block: 2px;
  color: inherit;
  font-weight: inherit;
  text-decoration: none;
}
.titulo-vaga:hover {
  text-decoration: underline;
}
.price {
  max-width: 100%;
  padding: 3px 6px;
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: var(--mrj-radius-pill);
  color: var(--mrj-color-primary);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.4;
}
.job-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  grid-column: 2;
  min-width: 0;
}
.job-info {
  font-size: 12px;
  color: var(--mrj-color-text-secondary);
}
.job-info:first-child {
  padding: 2px 7px;
  border-radius: var(--mrj-radius-pill);
  background: var(--mrj-color-secondary);
}
.destaque-vaga {
  color: inherit;
  text-decoration: none;
}
.abrir-vaga {
  grid-column: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 24px;
  font-size: 12px;
  font-weight: 600;
  color: var(--mrj-color-primary);
}
.abrir-vaga > span {
  font-size: 22px;
}
.lista-vagas {
  display: grid;
  gap: 8px;
}
.acoes-vaga {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.25fr);
  grid-column: 1 / -1;
  gap: 6px;
  padding-top: 8px;
  border-top: 1px solid var(--mrj-color-border-subtle);
}
.acoes-vaga :is(a, button),
.section button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  min-width: 0;
  padding: 6px 4px;
  border: 1px solid var(--mrj-color-border);
  border-radius: var(--mrj-radius-sm);
  background: transparent;
  color: var(--mrj-color-text);
  font: inherit;
  font-size: 12px;
  text-decoration: none;
  cursor: pointer;
}
.acoes-vaga .ver-detalhes {
  background: var(--mrj-color-primary);
  border-color: var(--mrj-color-primary);
  color: var(--mrj-color-on-primary);
}
button:disabled {
  opacity: var(--mrj-disabled-opacity);
  cursor: wait;
}
.filtros-vagas {
  display: grid;
  gap: 8px;
  margin-bottom: 10px;
}
.busca-vagas {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-inline: 10px;
  border: 1px solid var(--mrj-color-border);
  border-radius: var(--mrj-radius-sm);
  background: var(--mrj-color-surface);
}
.busca-vagas input {
  width: 100%;
  min-width: 0;
  min-height: 44px;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: var(--mrj-font-size-md);
}
.categoria-vagas select {
  width: 100%;
  min-height: 44px;
  padding: 8px 10px;
  border: 1px solid var(--mrj-color-border);
  border-radius: var(--mrj-radius-sm);
  background: var(--mrj-color-surface);
  color: inherit;
  font: inherit;
  font-size: var(--mrj-font-size-md);
}
.sem-publicacao,
.estado-vagas {
  padding: 12px;
  border-radius: var(--mrj-radius-md);
  background: var(--mrj-color-surface);
  font-size: var(--mrj-font-size-sm);
}
.vazio-publicacao {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr);
  gap: 6px 10px;
  align-items: start;
}
.vazio-publicacao > svg {
  grid-row: 1 / 3;
  font-size: 26px;
  color: var(--mrj-color-primary);
}
.vazio-publicacao h3 {
  font-size: var(--mrj-font-size-sm);
  font-weight: 600;
}
.vazio-publicacao p {
  grid-column: 2;
}
.vazio-publicacao a {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  margin-top: 4px;
  border: 1px solid var(--mrj-color-border);
  border-radius: var(--mrj-radius-sm);
  color: inherit;
  font-weight: 600;
  text-decoration: none;
}
.estado-vagas button {
  width: 100%;
  margin-top: 8px;
}
.estado-vagas--erro {
  color: var(--mrj-color-danger);
}
.confirmacao-publicacao {
  display: flex;
  align-items: start;
  gap: 12px;
  margin: 12px;
  padding: 12px;
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: var(--mrj-radius-md);
  background: var(--mrj-color-surface);
  color: var(--mrj-color-success);
  font-size: var(--mrj-font-size-sm);
}
.confirmacao-publicacao button {
  margin-left: auto;
  min-width: 44px;
  min-height: 44px;
  border: 0;
  background: transparent;
  color: inherit;
  font-size: 22px;
  cursor: pointer;
}
:is(button, a, input, select):focus-visible {
  outline: var(--mrj-focus-width) solid var(--mrj-color-focus);
  outline-offset: 3px;
}
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
}
.aviso-senha {
  position: fixed;
  inset: 0;
  background: #24133266;
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}
.aviso-conteudo {
  width: min(340px, calc(100% - 32px));
  min-width: 0;
  background: var(--mrj-color-surface);
  border-radius: var(--mrj-radius-lg);
  padding: 20px;
  display: grid;
  gap: 12px;
}
.aviso-conteudo strong {
  font-size: 20px;
  font-weight: 700;
}
.aviso-conteudo span {
  font-size: var(--mrj-font-size-sm);
}
.fechar-aviso {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: var(--mrj-radius-pill);
  background: var(--mrj-color-surface);
  color: inherit;
  font-size: 24px;
  cursor: pointer;
}
.btn-criar-senha {
  min-height: 44px;
  border: 0;
  border-radius: var(--mrj-radius-sm);
  background: var(--mrj-color-primary);
  color: var(--mrj-color-on-primary);
  font: inherit;
  cursor: pointer;
}
@media (max-width: 359px) {
  .welcome {
    padding-inline: 12px;
  }
  .painel-vagas {
    margin-inline: 8px;
    padding: 10px;
  }
  .job-card {
    grid-template-columns: 28px minmax(0, 1fr);
    gap: 6px 8px;
    padding: 10px 8px;
  }
  .vaga-icone {
    width: 28px;
    height: 32px;
  }
  .job-header {
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 6px;
  }
  .price {
    padding-inline: 4px;
    font-size: 12px;
  }
}
/* F61 · Desktop: painel. Boas-vindas e última vaga lado a lado; gerenciamento em largura total,
   filtros em linha e vagas em grid minmax(). Sem dados novos: só o que a página já mostra. */
@media (min-width: 64rem) {
  .home {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr);
    align-content: start;
    gap: 24px;
    min-height: auto;
    padding: 32px 40px 56px;
    background: transparent;
  }
  .home > :not(.welcome, .ultima-publicada) {
    grid-column: 1 / -1;
  }
  .confirmacao-publicacao {
    margin: 0;
  }
  .welcome {
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 32px;
    border: 1px solid var(--mrj-color-border-subtle);
    border-radius: var(--mrj-radius-lg);
  }
  .welcome h1 {
    font-size: clamp(1.5rem, 1rem + 1vw, 2rem);
  }
  .new-job {
    align-self: flex-start;
    margin-top: 20px;
    padding-inline: 20px;
  }
  .painel-vagas {
    margin: 0;
    padding: 20px;
  }
  .filtros-vagas {
    grid-template-columns: minmax(0, 2fr) minmax(14rem, 1fr);
    column-gap: 16px;
    margin-bottom: 16px;
  }
  .filtros-vagas > label[for] {
    grid-column: 1;
    grid-row: 1;
  }
  .busca-vagas {
    grid-column: 1;
    grid-row: 2;
  }
  .categoria-vagas {
    display: grid;
    grid-column: 2;
    grid-row: 1 / 3;
    gap: 8px;
  }
  .lista-vagas {
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
    gap: 12px;
  }
}
</style>
