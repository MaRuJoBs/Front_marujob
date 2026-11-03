<script setup>
import EmpresaHeader from '@/components/EmpresaHeader.vue'
import NotificacoesDialog from '@/components/NotificacoesDialog.vue'
import { useNotificacoesEmpresa } from '@/composables/useNotificacoesEmpresa'
import {
  filtrosNotificacoes,
  statusCandidatura,
  dataCandidatura,
  urlWhatsApp,
} from '@/utils/notificacoes'
import { resolverImagem } from '@/services/perfilPortfolioService'
const {
  notificacoes,
  filtro,
  pagina,
  total,
  proxima,
  anterior,
  carregando,
  erro,
  feedback,
  erroAcao,
  selecionada,
  confirmacao,
  processando,
  lendo,
  contatos,
  carregandoCandidato,
  errosCandidato,
  bloqueadas,
  ocupada,
  carregar,
  filtrar,
  carregarCandidato,
  visualizar,
  pedirDecisao,
  cancelarDecisao,
  confirmarDecisao,
  marcarLida,
} = useNotificacoesEmpresa()
const contatoSeguro = (n) =>
  urlWhatsApp({ status: n.status, whatsapp: contatos.value[n.candidatura] })
</script>
<template>
  <EmpresaHeader voltar />
  <main class="notificacoes-empresa">
    <div class="cabecalho">
      <div>
        <p class="sobretitulo">Sua empresa</p>
        <h1 tabindex="-1">Notificações</h1>
      </div>
      <button type="button" :disabled="carregando || ocupada" @click="carregar()">Atualizar</button>
    </div>
    <p class="introducao">Acompanhe os profissionais interessados nas suas oportunidades.</p>
    <nav class="filtros" aria-label="Filtrar candidaturas por status">
      <button
        v-for="opcao in filtrosNotificacoes"
        :key="opcao.valor"
        type="button"
        :aria-pressed="filtro === opcao.valor"
        :disabled="ocupada"
        @click="filtrar(opcao.valor)"
      >
        {{ opcao.texto }}
      </button>
    </nav>
    <p v-if="feedback" role="status" class="feedback sucesso">{{ feedback }}</p>
    <p v-if="erroAcao && !confirmacao" role="alert" class="feedback falha">{{ erroAcao }}</p>
    <div v-if="carregando" role="status" class="estado">Carregando notificações...</div>
    <div v-else-if="erro" role="alert" class="estado falha">
      <p>{{ erro }}</p>
      <button type="button" @click="carregar()">Tentar novamente</button>
    </div>
    <template v-else>
      <div v-if="!notificacoes.length" role="status" class="estado">
        <h2>
          {{
            filtro
              ? 'Nenhuma candidatura encontrada neste filtro.'
              : 'Nenhuma notificação por enquanto.'
          }}
        </h2>
        <p>As candidaturas recebidas para suas oportunidades aparecerão aqui.</p>
      </div>
      <template v-else>
        <p class="resumo">
          {{ total }} {{ total === 1 ? 'notificação' : 'notificações' }}
          {{ filtro ? 'neste filtro' : 'no total' }} · Página {{ pagina }}
        </p>
        <section class="lista" aria-label="Candidaturas recebidas">
          <article
            v-for="n in notificacoes"
            :key="n.id"
            class="card"
            :class="{ 'nao-lida': n.lida === false }"
            :aria-busy="Boolean(processando[n.candidatura] || lendo[n.id])"
          >
            <div class="card-topo">
              <div class="avatar" aria-hidden="true">
                <img
                  v-if="resolverImagem(n.freelancer_detalhes.profile_image)"
                  :src="resolverImagem(n.freelancer_detalhes.profile_image)"
                  alt=""
                  @error="(event) => (event.target.hidden = true)"
                />
              </div>
              <div class="identidade">
                <h2>{{ n.freelancer_detalhes.name || 'Nome não informado' }}</h2>
                <p>{{ n.freelancer_detalhes.profissao || 'Profissão não informada' }}</p>
              </div>
            </div>
            <h3 class="oportunidade">
              {{ n.oportunidade_titulo || 'Título da oportunidade não informado' }}
            </h3>
            <p class="data">
              Candidatura:
              <time
                v-if="dataCandidatura(n.candidatura_criado_em)"
                :datetime="n.candidatura_criado_em"
                >{{ dataCandidatura(n.candidatura_criado_em) }}</time
              ><span v-else>Data não informada</span>
            </p>
            <div class="indicadores">
              <span class="status" :class="n.status">{{ statusCandidatura[n.status] }}</span
              ><span class="leitura">{{
                n.lida === false
                  ? '● Não lida'
                  : n.lida === true
                    ? '✓ Lida'
                    : 'Leitura não informada'
              }}</span>
            </div>
            <div class="acoes">
              <button type="button" :disabled="ocupada" @click="visualizar(n)">
                Visualizar candidato</button
              ><button
                v-if="n.lida === false"
                type="button"
                :disabled="ocupada"
                @click="marcarLida(n)"
              >
                {{ lendo[n.id] ? 'Marcando...' : 'Marcar como lida' }}
              </button>
            </div>
            <div v-if="n.status === 'pendente'" class="acoes decisoes">
              <button
                type="button"
                class="aprovar"
                :disabled="ocupada || bloqueadas[n.candidatura]"
                @click="pedirDecisao(n, 'aprovar')"
              >
                Aprovar</button
              ><button
                type="button"
                :disabled="ocupada || bloqueadas[n.candidatura]"
                @click="pedirDecisao(n, 'recusar')"
              >
                Recusar
              </button>
            </div>
            <p v-if="processando[n.candidatura]" role="status" class="ajuda">
              Processando decisão...
            </p>
            <p v-if="bloqueadas[n.candidatura]" class="ajuda">
              Atualize o estado da candidatura antes de continuar.
            </p>
            <div v-if="n.status === 'aprovada'" class="contato">
              <p v-if="carregandoCandidato[n.candidatura]" role="status">
                Consultando disponibilidade do contato...
              </p>
              <template v-else-if="errosCandidato[n.candidatura]"
                ><p role="alert">{{ errosCandidato[n.candidatura] }}</p>
                <button type="button" :disabled="ocupada" @click="carregarCandidato(n)">
                  Consultar contato novamente
                </button></template
              >
              <template v-else-if="contatoSeguro(n)"
                ><a
                  :href="contatoSeguro(n)"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="whatsapp"
                  >Conversar pelo WhatsApp</a
                >
                <p class="ajuda">
                  Abre uma conversa; nenhuma mensagem é enviada automaticamente.
                </p></template
              >
              <p v-else>Contato pelo WhatsApp indisponível para esta candidatura.</p>
            </div>
          </article>
        </section>
      </template>
      <nav v-if="anterior || proxima" class="paginacao" aria-label="Páginas de notificações">
        <button type="button" :disabled="!anterior || ocupada" @click="carregar(anterior)">
          Anterior</button
        ><span>Página {{ pagina }}</span
        ><button type="button" :disabled="!proxima || ocupada" @click="carregar(proxima)">
          Próxima
        </button>
      </nav>
    </template>
    <NotificacoesDialog
      v-if="confirmacao"
      :notificacao="confirmacao.notificacao"
      :acao="confirmacao.acao"
      :processando="Boolean(processando[confirmacao.notificacao.candidatura])"
      :erro="erroAcao"
      @fechar="cancelarDecisao"
      @confirmar="confirmarDecisao"
    />
    <NotificacoesDialog
      v-else-if="selecionada"
      :notificacao="selecionada"
      :carregando="Boolean(carregandoCandidato[selecionada.candidatura])"
      :erro="errosCandidato[selecionada.candidatura]"
      :contato="contatos[selecionada.candidatura]"
      @fechar="selecionada = null"
      @tentar="carregarCandidato(selecionada)"
    />
  </main>
</template>
<style scoped>
.notificacoes-empresa {
  min-height: calc(100dvh - 92px);
  padding: 24px 16px calc(104px + env(safe-area-inset-bottom, 0px));
  background: #ddc8f7;
  color: #412473;
  overflow-wrap: anywhere;
}
.cabecalho {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.sobretitulo {
  font-size: 12px;
  color: #68517e;
}
h1 {
  font-size: 25px;
  font-weight: 750;
  line-height: 1.3;
}
.introducao {
  margin: 10px 0 20px;
  font-size: 14px;
  color: #65517e;
}
.filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 16px 0;
}
.filtros button {
  flex: 1 1 42%;
  border-radius: 20px;
}
.filtros button[aria-pressed='true'] {
  background: #7548bd;
  color: #fff;
  border-color: #7548bd;
}
.resumo {
  margin: 18px 0 12px;
  font-size: 12px;
  color: #65517e;
}
.lista {
  display: grid;
  gap: 16px;
}
.card {
  min-width: 0;
  padding: 18px;
  border: 1px solid #eee3fa;
  border-radius: 18px;
  background: #f7f1fc;
}
.nao-lida {
  border-inline-start: 4px solid #7548bd;
}
.card-topo {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  background: #d4c4e7;
  border-radius: 50%;
  overflow: hidden;
}
.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.identidade {
  min-width: 0;
}
h2 {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
}
.identidade p,
.data {
  font-size: 12px;
  color: #65517e;
}
.oportunidade {
  font-size: 14px;
  font-weight: 650;
  margin-top: 16px;
}
.data {
  margin-top: 6px;
}
.indicadores {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}
.status {
  padding: 4px 12px;
  border-radius: 18px;
  font-size: 12px;
  font-weight: 650;
  background: #ede2f9;
}
.pendente {
  background: #fff0ce;
  color: #785418;
}
.aprovada {
  background: #dff3e7;
  color: #245c3d;
}
.recusada {
  background: #fae1e6;
  color: #87384b;
}
.leitura {
  font-size: 12px;
  color: #60467e;
}
.acoes {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}
.acoes button {
  flex: 1 1 120px;
}
.decisoes {
  padding-top: 12px;
  border-top: 1px solid #e3d5ef;
}
.aprovar {
  background: #7548bd;
  color: white;
  border-color: #7548bd;
}
.contato {
  margin-top: 16px;
  padding-top: 14px;
  border-top: 1px solid #e3d5ef;
  font-size: 13px;
}
.ajuda {
  margin-top: 8px;
  font-size: 12px;
  color: #65517e;
}
.paginacao {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 20px;
  font-size: 13px;
}
.estado,
.feedback {
  padding: 18px;
  border: 1px solid #d9c6eb;
  border-radius: 14px;
  background: #f7f1fc;
  margin: 16px 0;
}
.estado p {
  font-size: 14px;
  margin: 8px 0;
}
.sucesso {
  background: #e9f8ee;
  color: #216547;
  border-color: #bde2ca;
}
.falha {
  background: #fff0f2;
  color: #813346;
  border-color: #e9c5ce;
}
button,
.whatsapp {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 9px 12px;
  border: 1px solid #ac8ace;
  border-radius: 10px;
  background: #faf7fe;
  color: #5a348c;
  font: inherit;
  font-size: 13px;
  text-decoration: none;
  cursor: pointer;
}
.whatsapp {
  background: #e5f6ec;
  border-color: #a1ceb4;
  color: #195539;
}
button:disabled {
  opacity: 0.6;
  cursor: wait;
}
button:focus-visible,
a:focus-visible {
  outline: 3px solid #63369e;
  outline-offset: 3px;
}
@media (max-width: 359px) {
  .notificacoes-empresa {
    padding-inline: 12px;
  }
  .card {
    padding: 14px;
  }
}
</style>
