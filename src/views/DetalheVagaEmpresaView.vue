<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import EmpresaHeader from '@/components/EmpresaHeader.vue'
import ConfirmarExclusaoVaga from '@/components/ConfirmarExclusaoVaga.vue'
import { useDetalheVagaEmpresa } from '@/composables/useDetalheVagaEmpresa'
import { useGerenciamentoVagas } from '@/stores/gerenciamentoVagas'
import { sessao } from '@/services/authSession'
import {
  formularioDaVaga,
  detalhesComplementaresVaga,
  formatarPagamento,
  formatarTempo,
  formatarDataPublicacao,
  formatarFaixaSalarial,
} from '@/utils/vagaForm'
import {
  faCalendar,
  faTag,
  faDollarSign,
  faBriefcase,
  faChartLine,
  faClock,
  faHouse,
} from '@fortawesome/free-solid-svg-icons'

const router = useRouter()
const store = useGerenciamentoVagas()
const { vaga, carregando, erro, recarregar } = useDetalheVagaEmpresa()
const informacoes = computed(() => (vaga.value ? formularioDaVaga(vaga.value) : null))
const detalhes = computed(() =>
  [
    ...detalhesComplementaresVaga(vaga.value)
      .filter(([rotulo]) => ['Localização', 'Status'].includes(rotulo))
      .map(([rotulo, valor]) => ({ rotulo, valor, icone: faHouse })),
    {
      rotulo: 'Data de publicação',
      valor: formatarDataPublicacao(vaga.value?.data_publicacao),
      icone: faCalendar,
    },
    { rotulo: 'Categoria', valor: vaga.value?.tag || 'Não informada', icone: faTag },
    {
      rotulo: 'Faixa salarial',
      valor: formatarFaixaSalarial(vaga.value?.salario_minimo, vaga.value?.salario_maximo),
      icone: faDollarSign,
    },
    {
      rotulo: 'Tipo de trabalho',
      valor: vaga.value?.tipo_contratacao || 'Não disponível',
      icone: faBriefcase,
    },
    {
      rotulo: 'Nível de experiência',
      valor: vaga.value?.nivel_experiencia || 'Não disponível',
      icone: faChartLine,
    },
    {
      rotulo: 'Jornada de trabalho',
      valor: vaga.value?.jornada_trabalho || 'Não disponível',
      icone: faClock,
    },
  ].filter(({ valor }) => valor && !['Não disponível', 'Não informada'].includes(valor)),
)
</script>

<template>
  <div class="detalhe-vaga-empresa mrj-ui">
    <EmpresaHeader voltar />
    <main class="detalhe-conteudo" :aria-busy="carregando">
      <p v-if="carregando" class="feedback" role="status">Carregando oportunidade...</p>
      <section v-else-if="erro" class="feedback" role="alert">
        <h1 tabindex="-1">Não foi possível abrir a vaga</h1>
        <p>{{ erro }}</p>
        <div class="acoes">
          <router-link to="/homeEmpresa">Voltar</router-link
          ><button type="button" @click="recarregar">Tentar novamente</button>
        </div>
      </section>
      <template v-else-if="vaga">
        <section class="resumo-vaga" aria-labelledby="vaga-titulo">
          <div class="vaga-icone" aria-hidden="true">
            <FontAwesomeIcon :icon="['fas', 'briefcase']" />
          </div>
          <div class="resumo-texto">
            <h1 id="vaga-titulo" tabindex="-1">{{ vaga.titulo }}</h1>
            <p v-if="sessao.usuario?.name" class="nome-empresa">{{ sessao.usuario.name }}</p>
            <div class="condicoes-vaga">
              <span v-if="informacoes.modalidade"
                ><FontAwesomeIcon :icon="faHouse" aria-hidden="true" />
                {{ informacoes.modalidade }}</span
              >
              <span
                ><FontAwesomeIcon :icon="faClock" aria-hidden="true" />
                {{ formatarTempo(vaga.tempo) }}</span
              >
            </div>
          </div>
          <span class="preco">{{ formatarPagamento(vaga.preco) }}</span>
        </section>

        <section class="bloco-descricao" aria-labelledby="descricao-titulo">
          <h2 id="descricao-titulo">Descrição da vaga</h2>
          <p>{{ informacoes.descricao || 'Descrição não informada.' }}</p>
        </section>

        <section v-if="vaga.requisitos" class="bloco-descricao" aria-labelledby="requisitos-titulo">
          <h2 id="requisitos-titulo">Requisitos</h2>
          <p :class="{ indisponivel: !vaga.requisitos }">
            {{ vaga.requisitos || 'Não disponível.' }}
          </p>
        </section>

        <section v-if="vaga.beneficios" class="bloco-descricao" aria-labelledby="beneficios-titulo">
          <h2 id="beneficios-titulo">Benefícios</h2>
          <p :class="{ indisponivel: !vaga.beneficios }">
            {{ vaga.beneficios || 'Não disponível.' }}
          </p>
        </section>

        <dl class="informacoes-vaga">
          <div v-for="detalhe in detalhes" :key="detalhe.rotulo">
            <dt>
              <FontAwesomeIcon :icon="detalhe.icone" aria-hidden="true" /> {{ detalhe.rotulo }}
            </dt>
            <dd>{{ detalhe.valor }}</dd>
          </div>
        </dl>

        <div class="acoes acoes-principais">
          <router-link to="/homeEmpresa">Voltar</router-link>
          <router-link class="primario" :to="'/editar-vaga/' + vaga.id"
            ><FontAwesomeIcon :icon="['fas', 'pen']" aria-hidden="true" /> Editar vaga</router-link
          >
        </div>
        <button type="button" class="excluir-vaga" @click="store.pedirExclusao(vaga)">
          <FontAwesomeIcon :icon="['fas', 'trash']" aria-hidden="true" /> Excluir oportunidade
        </button>
      </template>
    </main>
    <ConfirmarExclusaoVaga @excluida="router.replace('/homeEmpresa')" />
  </div>
</template>

<style scoped>
.detalhe-vaga-empresa {
  min-height: 100dvh;
  color: var(--mrj-color-text-secondary);
  background: var(--mrj-color-background);
  font-family: var(--mrj-font-family);
  line-height: var(--mrj-line-height);
}
.detalhe-conteudo {
  padding: 22px 16px calc(104px + env(safe-area-inset-bottom, 0px));
}
.resumo-vaga {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: flex-start;
  gap: var(--mrj-space-3);
  margin-bottom: 22px;
}
.vaga-icone {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 60px;
  height: 64px;
  border-radius: var(--mrj-radius-md);
  color: var(--mrj-color-primary);
  background: var(--mrj-color-secondary);
  font-size: 26px;
}
.resumo-texto {
  flex: 1;
  min-width: 0;
}
h1 {
  color: var(--mrj-color-text);
  font-size: 19px;
  font-weight: 700;
  line-height: 1.35;
  overflow-wrap: anywhere;
}
.nome-empresa {
  margin-top: 5px;
  color: var(--mrj-color-text-secondary);
  font-size: var(--mrj-font-size-sm);
  overflow-wrap: anywhere;
}
.condicoes-vaga {
  display: flex;
  flex-wrap: wrap;
  gap: 5px 12px;
  margin-top: 6px;
  color: var(--mrj-color-text-secondary);
  font-size: var(--mrj-font-size-sm);
}
.condicoes-vaga span {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}
.preco {
  grid-column: 2;
  justify-self: start;
  max-width: 100%;
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: var(--mrj-radius-lg);
  padding: 3px 10px;
  background: var(--mrj-color-surface);
  color: var(--mrj-color-text-secondary);
  font-size: var(--mrj-font-size-sm);
  font-weight: 600;
  overflow-wrap: anywhere;
}
.bloco-descricao {
  margin-bottom: var(--mrj-space-4);
  padding: 18px;
  border-radius: var(--mrj-radius-lg);
  background: var(--mrj-color-surface);
  border: 1px solid var(--mrj-color-border-subtle);
  box-shadow: var(--mrj-shadow-card);
}
h2 {
  color: var(--mrj-color-text);
  font-size: var(--mrj-font-size-sm);
  font-weight: 650;
}
.bloco-descricao p {
  margin-top: 10px;
  font-size: var(--mrj-font-size-sm);
  line-height: 1.7;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.bloco-descricao .indisponivel {
  color: var(--mrj-color-text-secondary);
}
.informacoes-vaga {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 10px;
}
.informacoes-vaga > div {
  min-width: 0;
  padding: 14px 12px;
  border-radius: var(--mrj-radius-md);
  background: var(--mrj-color-surface);
  border: 1px solid var(--mrj-color-border-subtle);
}
dt {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: var(--mrj-font-size-sm);
  color: var(--mrj-color-text-secondary);
}
dt svg {
  flex-shrink: 0;
}
dd {
  margin: 6px 0 0;
  color: var(--mrj-color-text-secondary);
  font-size: var(--mrj-font-size-sm);
  overflow-wrap: anywhere;
}
.acoes {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 20px;
}
.acoes a,
.acoes button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--mrj-space-2);
  min-height: 46px;
  padding: 10px 16px;
  border: 1px solid var(--mrj-color-border);
  border-radius: var(--mrj-radius-md);
  background: #f8f1ff;
  color: var(--mrj-color-text-secondary);
  font: inherit;
  font-size: var(--mrj-font-size-sm);
  text-decoration: none;
  cursor: pointer;
}
.acoes-principais a {
  flex: 1;
}
.acoes .primario {
  color: var(--mrj-color-on-primary);
  background: var(--mrj-color-primary);
  border-color: var(--mrj-color-primary);
}
.excluir-vaga {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--mrj-space-2);
  width: 100%;
  min-height: 44px;
  margin-top: var(--mrj-space-3);
  border: 0;
  border-radius: var(--mrj-radius-md);
  background: transparent;
  color: var(--mrj-color-danger);
  font: inherit;
  font-size: var(--mrj-font-size-sm);
  cursor: pointer;
}
.feedback {
  padding: 18px;
  border-radius: var(--mrj-radius-lg);
  background: var(--mrj-color-surface);
  font-size: var(--mrj-font-size-sm);
}
.feedback p {
  margin-top: var(--mrj-space-3);
  line-height: 1.6;
}
a:focus-visible,
button:focus-visible {
  outline: var(--mrj-focus-width) solid var(--mrj-color-focus);
  outline-offset: var(--mrj-focus-offset);
}
@media (max-width: 359px) {
  .detalhe-conteudo {
    padding-inline: 12px;
  }
  .vaga-icone {
    width: 48px;
    height: 52px;
  }
}
@media (max-width: 359px) {
  .informacoes-vaga {
    grid-template-columns: minmax(0, 1fr);
  }
}
.acoes .primario:hover {
  background: var(--mrj-color-primary-hover);
}
</style>
