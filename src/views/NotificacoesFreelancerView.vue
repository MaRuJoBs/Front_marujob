<script setup>
import AvisosChat from '@/components/AvisosChat.vue'
import NotificationPrompt from '@/components/NotificationPrompt.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { useNotificacoesFreelancer } from '@/stores/notificacoesFreelancer'
import { dataCandidatura } from '@/utils/notificacoes'
import { EVENTOS_CANDIDATURA } from '@/pushEvents'

const notificacoes = useNotificacoesFreelancer()

function tentarNovamente() {
  notificacoes.carregar()
  notificacoes.atualizarContagem()
}
</script>

<template>
  <main class="central-freelancer mrj-ui">
    <h1>Notificações</h1>

    <section
      class="historico"
      aria-labelledby="titulo-candidaturas"
      :aria-busy="notificacoes.carregando"
    >
      <h2 id="titulo-candidaturas">Histórico de candidaturas</h2>
      <p v-if="notificacoes.total !== null" role="status">
        {{ notificacoes.total }} {{ notificacoes.total === 1 ? 'não lida' : 'não lidas' }}
      </p>
      <BaseButton
        v-if="notificacoes.total > 0 || notificacoes.itens.some((item) => !item.lida)"
        size="small"
        variant="outline"
        :disabled="notificacoes.carregando || notificacoes.salvando"
        @click="notificacoes.marcarLida()"
        >Marcar todas como lidas</BaseButton
      >

      <p v-if="notificacoes.carregando" role="status">Carregando notificações…</p>
      <p v-if="notificacoes.erroLeitura" role="alert">{{ notificacoes.erroLeitura }}</p>
      <div v-if="notificacoes.erro">
        <p role="alert">{{ notificacoes.erro }}</p>
        <BaseButton size="small" @click="tentarNovamente"> Tentar novamente </BaseButton>
      </div>
      <p v-else-if="!notificacoes.carregando && !notificacoes.itens.length">
        Você ainda não tem notificações de candidaturas.
      </p>

      <ul v-if="notificacoes.itens.length">
        <li v-for="item in notificacoes.itens" :key="item.id" :class="{ 'nao-lida': !item.lida }">
          <div class="metadados">
            <span :class="{ aprovada: item.evento === 'candidatura_aprovada' }">
              {{ EVENTOS_CANDIDATURA[item.evento] }}
            </span>
            <strong v-if="!item.lida">Não lida</strong>
          </div>
          <h3>{{ item.titulo }}</h3>
          <p>{{ item.mensagem }}</p>
          <time v-if="dataCandidatura(item.criado_em)" :datetime="item.criado_em">
            {{ dataCandidatura(item.criado_em) }}
          </time>
          <div class="acoes">
            <router-link
              v-if="item.oportunidade != null"
              :to="{ name: 'oportunidade', params: { id: item.oportunidade } }"
            >
              Ver oportunidade
            </router-link>
            <BaseButton
              v-if="!item.lida"
              size="small"
              variant="text"
              :disabled="notificacoes.carregando || notificacoes.salvando"
              @click="notificacoes.marcarLida(item.id)"
              >Marcar como lida</BaseButton
            >
          </div>
        </li>
      </ul>

      <nav
        v-if="notificacoes.pagina > 1 || notificacoes.temProxima"
        aria-label="Páginas do histórico"
      >
        <BaseButton
          variant="outline"
          size="small"
          :disabled="notificacoes.pagina === 1 || notificacoes.carregando || notificacoes.salvando"
          @click="notificacoes.carregar(notificacoes.pagina - 1)"
          >Anterior</BaseButton
        >
        <span>Página {{ notificacoes.pagina }}</span>
        <BaseButton
          variant="outline"
          size="small"
          :disabled="!notificacoes.temProxima || notificacoes.carregando || notificacoes.salvando"
          @click="notificacoes.carregar(notificacoes.pagina + 1)"
          >Próxima</BaseButton
        >
      </nav>
    </section>

    <AvisosChat />
    <NotificationPrompt configuracao />
  </main>
</template>

<style scoped>
.central-freelancer {
  padding: var(--mrj-space-4);
  color: var(--mrj-color-text);
  background: var(--mrj-color-secondary);
  font:
    var(--mrj-font-size-sm)/1.5 'Poppins',
    sans-serif;
  overflow-wrap: anywhere;
}
h1 {
  font-size: 1.375rem;
  margin-bottom: var(--mrj-space-4);
}
h2 {
  font-size: var(--mrj-font-size-lg);
}
h3 {
  font-size: var(--mrj-font-size-md);
}
.historico {
  display: grid;
  gap: var(--mrj-space-2);
  justify-items: start;
  padding: var(--mrj-space-4);
  border-radius: var(--mrj-radius-md);
  background: var(--mrj-color-surface);
}
ul {
  width: 100%;
  display: grid;
  gap: var(--mrj-space-3);
  list-style: none;
  padding: 0;
}
li {
  display: grid;
  gap: var(--mrj-space-2);
  padding: var(--mrj-space-3);
  border: 1px solid var(--mrj-color-border-subtle);
  border-inline-start: 3px solid var(--mrj-color-border-subtle);
  border-radius: var(--mrj-radius-sm);
}
.nao-lida {
  border-inline-start-color: var(--mrj-color-primary);
  background: var(--mrj-color-secondary);
}
.metadados,
.acoes,
nav {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--mrj-space-2);
}
.metadados {
  justify-content: space-between;
}
.aprovada {
  color: var(--mrj-color-success);
}
time {
  color: var(--mrj-color-text-secondary);
}
.acoes a {
  display: inline-flex;
  align-items: center;
  min-height: var(--mrj-control-height-md);
  color: var(--mrj-color-primary-active);
  text-decoration: underline;
}
.central-freelancer :deep(button) {
  font-family: inherit;
}
</style>
