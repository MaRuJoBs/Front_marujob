<script setup>
import { ref, onMounted, onBeforeUnmount, onUnmounted, nextTick } from 'vue'
import { resolverImagem } from '@/services/perfilPortfolioService'
import { statusCandidatura, urlWhatsApp } from '@/utils/notificacoes'
const props = defineProps({
  notificacao: { type: Object, required: true },
  acao: String,
  processando: Boolean,
  carregando: Boolean,
  erro: String,
  contato: Object,
})
const emit = defineEmits(['fechar', 'confirmar', 'tentar'])
const dialogo = ref(null)
let focoAnterior
onMounted(() => {
  focoAnterior = document.activeElement
  dialogo.value.showModal()
  dialogo.value.querySelector('button')?.focus()
})
onBeforeUnmount(() => {
  dialogo.value?.close()
})
onUnmounted(async () => {
  await nextTick()
  if (focoAnterior?.isConnected) focoAnterior.focus()
  else document.querySelector('h1')?.focus()
})
const contatoSeguro = () =>
  urlWhatsApp({ status: props.notificacao.status, whatsapp: props.contato })
</script>
<template>
  <dialog
    ref="dialogo"
    class="notificacoes-dialog mrj-ui"
    aria-labelledby="notificacao-dialog-titulo"
    @cancel.prevent="!processando && emit('fechar')"
  >
    <h2 id="notificacao-dialog-titulo">
      {{
        acao
          ? acao === 'aprovar'
            ? 'Aprovar candidatura?'
            : 'Recusar candidatura?'
          : 'Informações profissionais'
      }}
    </h2>
    <template v-if="acao">
      <p>
        Confirma {{ acao === 'aprovar' ? 'a aprovação' : 'a recusa' }} de
        <strong>{{
          notificacao.freelancer_detalhes.name || 'Candidato sem nome informado'
        }}</strong>
        para “{{ notificacao.oportunidade_titulo || 'Oportunidade sem título informado' }}”?
      </p>
      <p>Após a decisão, não será possível escolher o estado oposto.</p>
    </template>
    <template v-else>
      <img
        v-if="resolverImagem(notificacao.freelancer_detalhes.profile_image)"
        :src="resolverImagem(notificacao.freelancer_detalhes.profile_image)"
        class="foto"
        alt="Foto do candidato"
        @error="(event) => (event.target.hidden = true)"
      />
      <h3>{{ notificacao.freelancer_detalhes.name || 'Nome não informado' }}</h3>
      <p>{{ notificacao.freelancer_detalhes.profissao || 'Profissão não informada' }}</p>
      <h3 class="subtitulo">Habilidades</h3>
      <ul v-if="notificacao.freelancer_detalhes.habilidades.length" class="habilidades">
        <li v-for="(habilidade, index) in notificacao.freelancer_detalhes.habilidades" :key="index">
          {{ habilidade }}
        </li>
      </ul>
      <p v-else>Nenhuma habilidade informada.</p>
      <p>Status: {{ statusCandidatura[notificacao.status] }}</p>
      <template v-if="notificacao.status === 'aprovada'">
        <a
          v-if="contatoSeguro()"
          :href="contatoSeguro()"
          target="_blank"
          rel="noopener noreferrer"
          class="whatsapp"
          >Conversar pelo WhatsApp</a
        >
        <p v-else-if="!carregando && !erro">
          Contato pelo WhatsApp indisponível para esta candidatura.
        </p>
        <p v-if="contatoSeguro()" class="ajuda">
          O link abre uma conversa. Nenhuma mensagem é enviada automaticamente.
        </p>
      </template>
    </template>
    <p v-if="carregando" role="status">Atualizando os dados da candidatura...</p>
    <p v-if="erro" role="alert">{{ erro }}</p>
    <p v-if="processando" role="status">Aguardando confirmação da decisão...</p>
    <div class="acoes">
      <button type="button" :disabled="processando" @click="emit('fechar')">
        {{ acao ? 'Cancelar' : 'Fechar' }}
      </button>
      <button
        v-if="acao"
        type="button"
        :disabled="processando"
        class="principal"
        @click="emit('confirmar')"
      >
        {{
          processando
            ? 'Processando...'
            : acao === 'aprovar'
              ? 'Confirmar aprovação'
              : 'Confirmar recusa'
        }}
      </button>
      <button v-else-if="erro" type="button" :disabled="carregando" @click="emit('tentar')">
        Tentar novamente
      </button>
    </div>
  </dialog>
</template>
<style scoped>
.notificacoes-dialog {
  margin: auto;
  width: min(400px, calc(100% - 24px));
  max-height: calc(100dvh - 24px);
  overflow: auto;
  overflow-wrap: anywhere;
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: var(--mrj-radius-lg);
  padding: 22px;
  background: var(--mrj-color-surface);
  color: var(--mrj-color-text-secondary);
  font: inherit;
  font-family: var(--mrj-font-family);
  line-height: var(--mrj-line-height);
  box-shadow: var(--mrj-shadow-card);
}
dialog::backdrop {
  background: #20103599;
}
h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--mrj-color-text);
}
h3 {
  font-size: 16px;
  font-weight: 650;
}
p {
  margin-top: var(--mrj-space-3);
  font-size: var(--mrj-font-size-sm);
  line-height: 1.6;
}
.subtitulo {
  margin-top: 18px;
}
.foto {
  display: block;
  width: 76px;
  height: 76px;
  border-radius: 50%;
  object-fit: cover;
  margin: 18px 0;
}
.habilidades {
  display: flex;
  flex-wrap: wrap;
  gap: var(--mrj-space-2);
  list-style: none;
  padding: 0;
  margin-top: 10px;
}
.habilidades li {
  padding: 4px 10px;
  border-radius: var(--mrj-radius-lg);
  background: var(--mrj-color-secondary);
  font-size: var(--mrj-font-size-sm);
}
.acoes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--mrj-space-2);
  margin-top: 20px;
}
button,
.whatsapp {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 10px 14px;
  border: 1px solid var(--mrj-color-border);
  border-radius: var(--mrj-radius-md);
  background: var(--mrj-color-surface);
  color: var(--mrj-color-text-secondary);
  font: inherit;
  font-size: var(--mrj-font-size-sm);
  text-decoration: none;
  cursor: pointer;
}
.principal {
  background: var(--mrj-color-primary);
  color: var(--mrj-color-on-primary);
}
.whatsapp {
  margin-top: var(--mrj-space-4);
  background: #e5f6ec;
  color: var(--mrj-color-success);
  border-color: #a1ceb4;
}
.ajuda {
  font-size: var(--mrj-font-size-sm);
}
button:disabled {
  opacity: var(--mrj-disabled-opacity);
  cursor: wait;
}
button:focus-visible,
a:focus-visible {
  outline: var(--mrj-focus-width) solid var(--mrj-color-focus);
  outline-offset: var(--mrj-focus-offset);
}
button {
  flex: 1 1 120px;
  max-width: 100%;
  overflow-wrap: anywhere;
}
[role='alert'] {
  color: var(--mrj-color-danger);
}
button:hover:not(:disabled) {
  filter: brightness(0.95);
}
</style>
