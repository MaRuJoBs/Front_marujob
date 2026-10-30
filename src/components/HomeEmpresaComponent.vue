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

      <p v-if="carregando" role="status">Carregando suas oportunidades...</p>
      <div v-else-if="erro" role="alert">
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
              <router-link class="ver-detalhes" :to="'/empresa/vagas/' + vaga.id"
                >Ver detalhes<span class="sr-only"> {{ vaga.titulo }}</span></router-link
              >
              <button type="button" @click="gerenciamento.pedirExclusao(vaga)">
                Excluir<span class="sr-only"> {{ vaga.titulo }}</span>
              </button>
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
  background-color: #ddc8f7;
  background-size: 100% auto;
  background-repeat: no-repeat;
  color: #412473;
}
.welcome {
  padding: 18px 0 4px;
}
.welcome h2 {
  font-size: 21px;
  line-height: 1.35;
  font-weight: 700;
  overflow-wrap: anywhere;
}
.welcome p {
  margin-top: 6px;
  max-width: 34ch;
  font-size: 13px;
  line-height: 1.5;
  color: #65517e;
}
.new-job {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 16px;
  min-height: 46px;
  padding: 10px 16px;
  border-radius: 10px;
  background: #7548bd;
  color: white;
  font-size: 14px;
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
  gap: 12px;
  margin-bottom: 12px;
}
.section-title h3 {
  font-size: 16px;
  font-weight: 650;
  color: #442477;
}
.job-card {
  min-width: 0;
  padding: 16px;
  border: 1px solid #eee3fa;
  border-radius: 16px;
  background: #f4ecfb;
  overflow-wrap: anywhere;
}
.job-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}
.job-header h4 {
  min-width: 0;
  flex: 1 1 120px;
  color: #452677;
  font-size: 15px;
  font-weight: 650;
  line-height: 1.4;
}
.price {
  flex-shrink: 0;
  padding: 3px 9px;
  border: 1px solid #cebddf;
  border-radius: 20px;
  background: #faf7fe;
  color: #4e2a80;
  font-size: 12px;
  font-weight: 650;
  white-space: nowrap;
}
.descricao-publicada {
  margin: 12px 0;
  color: #625272;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.job-footer {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
  margin-top: 12px;
}
.job-info {
  color: #604b7a;
  font-size: 12px;
  line-height: 1.5;
}
.job-info:first-child {
  border: 1px solid #d4c2e7;
  background: #e9dcf6;
  padding: 2px 9px;
  border-radius: 20px;
}
.lista-vagas {
  display: grid;
  gap: 12px;
}
.lista-vagas .job-card {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 12px;
  border-radius: 13px;
}
.vaga-icone {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 44px;
  height: 48px;
  border-radius: 10px;
  background: #a48aca;
  color: white;
  font-size: 19px;
}
.vaga-conteudo {
  flex: 1;
  min-width: 0;
}
.lista-vagas .job-header h4 {
  font-size: 14px;
}
.lista-vagas .price {
  font-size: 11px;
}
.lista-vagas .descricao-publicada {
  margin-block: 6px;
  font-size: 12px;
}
.acoes-vaga {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}
.acoes-vaga button,
.acoes-vaga a,
.section button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 9px 14px;
  border: 1px solid #9a73ca;
  border-radius: 9px;
  background: #faf7fe;
  color: #5a348c;
  font: inherit;
  font-size: 13px;
  text-decoration: none;
  cursor: pointer;
}
.acoes-vaga a {
  background: #7548bd;
  border-color: #7548bd;
  color: white;
}
.acoes-vaga button:disabled {
  opacity: 0.65;
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
  background: #faf7fe;
  border: 1px solid #c4abdf;
  border-radius: 10px;
  padding-inline: 12px;
  color: #927aa9;
}
.busca-vagas input {
  flex: 1;
  width: 100%;
  min-width: 0;
  min-height: 44px;
  background: transparent;
  border: none;
  color: #49335e;
  font: inherit;
  font-size: 14px;
}
.categoria-vagas select {
  width: 100%;
  min-height: 44px;
  border: 1px solid #c4abdf;
  border-radius: 10px;
  background: #ede1f7;
  padding: 8px 12px;
  font: inherit;
  font-size: 13px;
  color: #513279;
}
.sem-publicacao {
  margin-top: 12px;
  padding: 14px;
  border-radius: 12px;
  background: #f3ebfa;
  color: #68537e;
  font-size: 12px;
  line-height: 1.6;
}
.sem-publicacao a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: #63339e;
  font-weight: 600;
}
.confirmacao-publicacao {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-block: 12px;
  padding: 14px;
  border: 1px solid #bde2ca;
  border-radius: 12px;
  background: #e9f8ee;
  color: #216547;
  font-size: 13px;
}
.confirmacao-publicacao p {
  margin-top: 4px;
  font-size: 12px;
  line-height: 1.5;
}
.confirmacao-publicacao button {
  margin-left: auto;
  border: 0;
  background: transparent;
  color: inherit;
  min-width: 28px;
  min-height: 28px;
  font-size: 22px;
  cursor: pointer;
}
button:focus-visible,
a:focus-visible,
input:focus-visible,
select:focus-visible {
  outline: 3px solid #63369e;
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
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  width: min(388px, calc(100% - 32px));
  z-index: 1000;
  padding: 18px;
  border: 1px solid #c8afe2;
  border-radius: 16px;
  background: #f2e8fc;
  box-shadow: 0 8px 30px #39234f22;
}
.fechar-aviso {
  position: absolute;
  top: 4px;
  right: 8px;
  min-width: 36px;
  min-height: 36px;
  border: none;
  background: transparent;
  color: #604478;
  font-size: 24px;
  cursor: pointer;
}
.aviso-conteudo {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-right: 22px;
}
.aviso-conteudo strong {
  color: #563484;
  font-size: 15px;
}
.aviso-conteudo span {
  color: #68517f;
  font-size: 13px;
  line-height: 1.5;
}
.btn-criar-senha {
  align-self: flex-start;
  min-height: 44px;
  border: 0;
  border-radius: 9px;
  padding: 8px 16px;
  background: #7548bd;
  color: white;
  font: inherit;
  font-size: 13px;
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
    gap: 8px;
  }
}
</style>
