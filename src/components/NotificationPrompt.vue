<script setup>
import { ref } from 'vue'
import BaseButton from './ui/BaseButton.vue'
import { usePushNotifications } from '../composables/usePushNotifications'
import { sessao } from '../services/authSession'

defineProps({ configuracao: Boolean })

const { estado, mensagem, permissao, suportado, exibirPrompt, ativar, desativar, adiar } =
  usePushNotifications()
const interagiu = ref(false)
const disponivel = suportado && !import.meta.env.DEV

function solicitar() {
  interagiu.value = true
  ativar()
}

function dispensar() {
  interagiu.value = false
  adiar()
}
</script>

<template>
  <section
    v-if="
      sessao.tipo === 'usuario' && (configuracao || (disponivel && (exibirPrompt || interagiu)))
    "
    class="push mrj-ui"
    aria-label="Avisos do navegador"
  >
    <h2 v-if="configuracao">Avisos do navegador</h2>
    <p v-if="!disponivel">
      Web Push está indisponível neste navegador ou endereço. No iPhone, abra o app pela Tela de
      Início.
    </p>
    <p v-else-if="permissao === 'denied'">
      Os avisos estão bloqueados. Para habilitá-los, altere a permissão nas configurações do
      navegador.
    </p>
    <template v-else>
      <p v-if="estado === 'ativo'" role="status">Avisos ativados neste dispositivo.</p>
      <p v-else-if="estado === 'ativando'" role="status">Ativando avisos…</p>
      <p v-else>Quer receber avisos quando uma empresa responder à sua candidatura?</p>
      <p v-if="mensagem" role="alert">{{ mensagem }}</p>
      <div class="acoes">
        <BaseButton
          v-if="estado !== 'ativo'"
          size="small"
          :disabled="estado === 'ativando'"
          @click="solicitar"
        >
          Ativar notificações
        </BaseButton>
        <BaseButton v-if="!configuracao" size="small" variant="text" @click="dispensar"
          >Agora não</BaseButton
        >
        <BaseButton
          v-else-if="estado === 'ativo' || (estado === 'erro' && permissao === 'granted')"
          size="small"
          variant="outline"
          @click="desativar"
          >Desativar neste dispositivo</BaseButton
        >
      </div>
    </template>
  </section>
</template>

<style scoped>
.push {
  padding: var(--mrj-space-4);
  margin-block: var(--mrj-space-3);
  background: var(--mrj-color-surface);
  color: var(--mrj-color-text);
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: var(--mrj-radius-md);
  font:
    var(--mrj-font-size-sm)/1.5 'Poppins',
    sans-serif;
}
h2 {
  font-size: var(--mrj-font-size-md);
}
p {
  margin-block: var(--mrj-space-2);
}
.acoes {
  display: flex;
  flex-wrap: wrap;
  gap: var(--mrj-space-2);
}
.acoes :deep(button) {
  font-family: inherit;
}
</style>
