<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import ConfirmarExclusaoVaga from '@/components/ConfirmarExclusaoVaga.vue'
import fundoEmpresa from '@/assets/images/fundoempresa.png'
import { sessao } from '@/services/authService'
import { storeToRefs } from 'pinia'
import { useVagasStore } from '@/stores/vagas'
import { useGerenciamentoVagas } from '@/stores/gerenciamentoVagas'
import { formatarTempo, formatarPagamento } from '@/utils/vagaForm'

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

const mostrarAvisoSenha = ref(false)

onMounted(() => {
  mostrarAvisoSenha.value = localStorage.getItem('precisa_definir_senha') === 'true'
})
</script>
<template>
  <main class="home mrj-ui" :style="{ backgroundImage: `url('${fundoEmpresa}')` }">
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
    <section class="welcome">
      <h2>Bem-vindo, {{ sessao.usuario?.name || 'Empresa' }}!</h2>

      <p>Gerencie suas vagas e encontre profissionais para seus projetos.</p>

      <router-link v-if="sessao.tipo === 'empresa'" class="new-job" to="/criar-vaga">
        <span>+</span>
        Criar nova vaga
      </router-link>
    </section>

    <!-- Vagas -->
    <section class="section" :aria-busy="carregando">
      <div class="section-title">
        <h3 tabindex="-1">Última vaga publicada</h3>
      </div>

      <p v-if="carregando" class="estado-vagas" role="status">Carregando suas oportunidades...</p>
      <div v-else-if="erro" class="estado-vagas estado-vagas--erro" role="alert">
        {{ erro }} <button type="button" @click="gerenciamento.carregar()">Tentar novamente</button>
      </div>
      <div v-else-if="ultimaPublicada" class="job-card vaga-publicada">
        <div class="job-header">
          <h4>
            <router-link class="titulo-vaga" :to="'/empresa/vagas/' + ultimaPublicada.id">{{
              ultimaPublicada.titulo
            }}</router-link>
          </h4>

          <div class="price">{{ formatarPagamento(ultimaPublicada.preco) }}</div>
        </div>

        <p v-if="ultimaPublicada.descricao" class="descricao-publicada">
          {{ ultimaPublicada.descricao }}
        </p>

        <div class="job-footer">
          <div class="job-info">{{ ultimaPublicada.tag }}</div>

          <div class="job-info">
            <i class="fa-regular fa-clock" aria-hidden="true"></i>
            {{ formatarTempo(ultimaPublicada.tempo) }}
          </div>
        </div>
      </div>

      <div v-else class="sem-publicacao">
        <p>Você ainda não tem oportunidades publicadas.</p>
        <router-link to="/criar-vaga">Criar nova vaga</router-link>
      </div>
      <p v-if="ultimaPublicada" class="sem-publicacao">
        Exibimos a vaga com maior ID como aproximação da última publicação. A API não informa a data
        de publicação.
      </p>
    </section>
    <section class="section" v-if="!carregando && !erro && vagas.length">
      <div class="section-title">
        <h3>Suas oportunidades ({{ vagas.length }})</h3>
      </div>
      <div class="filtros-vagas">
        <label class="busca-vagas">
          <FontAwesomeIcon :icon="['fas', 'magnifying-glass']" aria-hidden="true" />
          <span class="sr-only">Buscar suas vagas</span>
          <input
            v-model="busca"
            type="search"
            placeholder="Buscar por título ou palavra-chave..."
          />
        </label>
        <label class="categoria-vagas">
          <span class="sr-only">Filtrar por categoria</span>
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
            <p class="descricao-publicada">{{ vaga.descricao }}</p>
            <div class="job-footer">
              <span class="job-info">{{ vaga.tag }}</span
              ><span class="job-info">{{ formatarTempo(vaga.tempo) }}</span>
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
.titulo-vaga {
  display: inline-block;
  padding-block: 4px;
  color: inherit;
  font-weight: inherit;
  text-decoration: none;
}
.titulo-vaga:hover {
  text-decoration: underline;
  text-underline-offset: 3px;
}
.home {
  min-height: calc(100dvh - 92px);
  padding: 4px 16px calc(104px + env(safe-area-inset-bottom, 0px));
  background-color: var(--mrj-color-background);
  background-size: 100% auto;
  background-blend-mode: soft-light;
  background-repeat: no-repeat;
  color: var(--mrj-color-text-secondary);
  font-family: var(--mrj-font-family);
  line-height: var(--mrj-line-height);
}
.welcome {
  padding: var(--mrj-space-6) 0 var(--mrj-space-2);
}
.welcome h2 {
  font-size: 24px;
  line-height: 1.35;
  font-weight: 700;
  overflow-wrap: anywhere;
}
.welcome p {
  margin-top: 6px;
  max-width: 34ch;
  font-size: var(--mrj-font-size-sm);
  line-height: 1.5;
  color: var(--mrj-color-text-secondary);
}
.new-job {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: var(--mrj-space-4);
  min-height: 46px;
  padding: 10px 16px;
  border-radius: var(--mrj-radius-md);
  background: var(--mrj-color-primary);
  color: var(--mrj-color-on-primary);
  font-size: var(--mrj-font-size-sm);
  font-weight: 600;
  text-decoration: none;
  box-shadow: 0 3px 8px #59318c14;
}
.new-job span {
  font-size: 23px;
  line-height: 1;
}
.section {
  margin-top: 22px;
  min-width: 0;
}
.section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--mrj-space-3);
  margin-bottom: var(--mrj-space-3);
}
.section-title h3 {
  font-size: 16px;
  font-weight: 650;
  color: var(--mrj-color-text);
}
.job-card {
  min-width: 0;
  padding: var(--mrj-space-4);
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: var(--mrj-radius-lg);
  background: var(--mrj-color-surface);
  overflow-wrap: anywhere;
  box-shadow: var(--mrj-shadow-card);
}
.job-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  justify-items: start;
  gap: var(--mrj-space-2);
}
.job-header h4 {
  min-width: 0;
  flex: 1 1 120px;
  color: var(--mrj-color-text);
  font-size: 15px;
  font-weight: 650;
  line-height: 1.4;
}
.price {
  max-width: 100%;
  padding: 3px 9px;
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: var(--mrj-radius-lg);
  background: var(--mrj-color-surface);
  color: var(--mrj-color-text-secondary);
  font-size: var(--mrj-font-size-sm);
  font-weight: 650;
  overflow-wrap: anywhere;
}
.descricao-publicada {
  margin: 12px 0;
  color: var(--mrj-color-text-secondary);
  font-size: var(--mrj-font-size-sm);
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.job-footer {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
  margin-top: var(--mrj-space-3);
}
.job-info {
  color: var(--mrj-color-text-secondary);
  font-size: var(--mrj-font-size-sm);
  line-height: 1.5;
}
.job-info:first-child {
  border: 1px solid var(--mrj-color-border-subtle);
  background: var(--mrj-color-secondary);
  padding: 2px 9px;
  border-radius: var(--mrj-radius-lg);
}
.lista-vagas {
  display: grid;
  gap: var(--mrj-space-3);
}
.lista-vagas .job-card {
  display: flex;
  align-items: flex-start;
  gap: var(--mrj-space-3);
  padding: 14px 12px;
  border-radius: var(--mrj-radius-md);
}
.vaga-icone {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 48px;
  border-radius: var(--mrj-radius-md);
  background: var(--mrj-color-secondary);
  color: var(--mrj-color-primary);
  font-size: 19px;
}
.vaga-conteudo {
  flex: 1;
  min-width: 0;
}
.lista-vagas .job-header h4 {
  font-size: var(--mrj-font-size-sm);
}
.lista-vagas .price {
  font-size: var(--mrj-font-size-sm);
}
.lista-vagas .descricao-publicada {
  margin-block: 6px;
  font-size: var(--mrj-font-size-sm);
}
.acoes-vaga {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--mrj-space-2);
  margin-top: var(--mrj-space-3);
}
.acoes-vaga .ver-detalhes {
  grid-column: 1 / -1;
  grid-row: 2;
}
.acoes-vaga button,
.acoes-vaga a,
.section button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 9px 14px;
  border: 1px solid var(--mrj-color-border);
  border-radius: var(--mrj-radius-md);
  background: var(--mrj-color-surface);
  color: var(--mrj-color-text-secondary);
  font: inherit;
  font-size: var(--mrj-font-size-sm);
  text-decoration: none;
  cursor: pointer;
}
.acoes-vaga a {
  background: var(--mrj-color-primary);
  border-color: var(--mrj-color-primary);
  color: var(--mrj-color-on-primary);
}
.acoes-vaga button:disabled {
  opacity: var(--mrj-disabled-opacity);
  cursor: wait;
}
.filtros-vagas {
  display: grid;
  gap: 9px;
  margin-bottom: 14px;
}
.busca-vagas {
  display: flex;
  align-items: center;
  gap: 9px;
  background: var(--mrj-color-surface);
  border: 1px solid var(--mrj-color-border);
  border-radius: var(--mrj-radius-md);
  padding-inline: 12px;
  color: var(--mrj-color-text-secondary);
}
.busca-vagas input {
  flex: 1;
  width: 100%;
  min-width: 0;
  min-height: 44px;
  background: transparent;
  border: none;
  color: var(--mrj-color-text-secondary);
  font: inherit;
  font-size: var(--mrj-font-size-sm);
}
.categoria-vagas select {
  width: 100%;
  min-height: 44px;
  border: 1px solid var(--mrj-color-border);
  border-radius: var(--mrj-radius-md);
  background: var(--mrj-color-secondary);
  padding: 8px 12px;
  font: inherit;
  font-size: var(--mrj-font-size-sm);
  color: var(--mrj-color-text-secondary);
}
.sem-publicacao {
  margin-top: var(--mrj-space-3);
  padding: 14px;
  border-radius: 12px;
  background: var(--mrj-color-surface);
  color: var(--mrj-color-text-secondary);
  font-size: var(--mrj-font-size-sm);
  line-height: 1.6;
}
.sem-publicacao a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: var(--mrj-color-text-secondary);
  font-weight: 600;
}
.confirmacao-publicacao {
  display: flex;
  align-items: flex-start;
  gap: var(--mrj-space-3);
  margin-block: 12px;
  padding: 14px;
  border: 1px solid #bde2ca;
  border-radius: 12px;
  background: #e9f8ee;
  color: var(--mrj-color-text-secondary);
  font-size: var(--mrj-font-size-sm);
}
.confirmacao-publicacao p {
  margin-top: 4px;
  font-size: var(--mrj-font-size-sm);
  line-height: 1.5;
}
.confirmacao-publicacao button {
  margin-left: auto;
  border: 0;
  background: transparent;
  color: inherit;
  min-width: var(--mrj-control-height-md);
  min-height: var(--mrj-control-height-md);
  font-size: 22px;
  cursor: pointer;
}
button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible {
  outline: var(--mrj-focus-width) solid var(--mrj-color-focus);
  outline-offset: var(--mrj-focus-offset);
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
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: min(388px, calc(100% - 32px));
  z-index: 1000;
  padding: 18px;
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: var(--mrj-radius-lg);
  background: var(--mrj-color-secondary);
  box-shadow: 0 8px 30px #39234f22;
}
.fechar-aviso {
  position: absolute;
  top: 4px;
  right: 8px;
  min-width: var(--mrj-control-height-md);
  min-height: var(--mrj-control-height-md);
  border: none;
  background: transparent;
  color: var(--mrj-color-text-secondary);
  font-size: 24px;
  cursor: pointer;
}
.aviso-conteudo {
  display: flex;
  flex-direction: column;
  gap: var(--mrj-space-2);
  padding-right: 32px;
}
.aviso-conteudo strong {
  color: var(--mrj-color-text-secondary);
  font-size: 15px;
}
.aviso-conteudo span {
  color: var(--mrj-color-text-secondary);
  font-size: var(--mrj-font-size-sm);
  line-height: 1.5;
}
.btn-criar-senha {
  align-self: flex-start;
  min-height: 44px;
  border: 0;
  border-radius: var(--mrj-radius-md);
  padding: 8px 16px;
  background: var(--mrj-color-primary);
  color: var(--mrj-color-on-primary);
  font: inherit;
  font-size: var(--mrj-font-size-sm);
  cursor: pointer;
}
@media (max-width: 359px) {
  .home {
    padding-inline: 12px;
  }
  .vaga-icone {
    width: 34px;
    height: 40px;
    font-size: 16px;
  }
  .lista-vagas .job-card {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    gap: 8px;
  }
}
.estado-vagas {
  display: grid;
  gap: var(--mrj-space-3);
  padding: var(--mrj-space-4);
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: var(--mrj-radius-lg);
  background: var(--mrj-color-surface);
  font-size: var(--mrj-font-size-sm);
}
.estado-vagas--erro {
  color: var(--mrj-color-danger);
}
.acoes-vaga a:hover,
.new-job:hover {
  background: var(--mrj-color-primary-hover);
}
.busca-vagas input::placeholder {
  color: var(--mrj-color-text-secondary);
  opacity: 1;
}
</style>
