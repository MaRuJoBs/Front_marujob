<script setup>
import { computed, useId } from 'vue'
import BaseButton from './ui/BaseButton.vue'
import {
  faLocationCrosshairs,
  faLocationDot,
  faCircleCheck,
} from '@fortawesome/free-solid-svg-icons'

const props = defineProps({
  estado: { type: Object, required: true },
  salva: { type: Object, default: null },
  erros: { type: Object, default: () => ({}) },
})
const {
  confirmada,
  loadingLocation,
  locationError,
  buscandoEndereco,
  erroLocalizacao,
  gpsOcupado,
  bloqueada,
  label,
  usarLocalizacaoAtual,
  remover,
  descartar,
} = props.estado
const id = `empresa-local-${useId()}`
const cidadeExibida = computed(() => label(confirmada.value || props.salva))
const mensagemErro = computed(
  () =>
    locationError.value ||
    erroLocalizacao.value ||
    [props.erros.cidade, props.erros.uf].filter(Boolean).join(' '),
)
</script>

<template>
  <section class="empresa-localizacao" :aria-labelledby="`${id}-titulo`">
    <div class="titulo-localizacao">
      <span class="icone-localizacao"
        ><FontAwesomeIcon :icon="faLocationDot" aria-hidden="true"
      /></span>
      <div>
        <h2 :id="`${id}-titulo`">Localização da empresa</h2>
        <p>Mostre onde sua empresa está.</p>
      </div>
    </div>
    <div class="cidade-atual" :class="{ confirmada }" role="status">
      <FontAwesomeIcon :icon="confirmada ? faCircleCheck : faLocationDot" aria-hidden="true" />
      <div>
        <strong>{{ cidadeExibida || 'Localização não informada' }}</strong>
        <p v-if="confirmada">Salve as alterações para atualizar o perfil.</p>
        <p v-else>Cidade e estado exibidos no perfil</p>
      </div>
    </div>
    <BaseButton
      class="btn-gps"
      :disabled="bloqueada"
      :loading="gpsOcupado"
      :loading-label="loadingLocation ? 'Obtendo localização...' : 'Identificando cidade...'"
      :aria-describedby="`${id}-ajuda ${id}-erro`"
      @click="usarLocalizacaoAtual"
    >
      <FontAwesomeIcon :icon="faLocationCrosshairs" aria-hidden="true" />
      <span v-if="!gpsOcupado">Usar minha localização atual</span>
    </BaseButton>
    <p :id="`${id}-ajuda`" class="ajuda">
      Use o GPS quando estiver na empresa. Apenas cidade e UF serão salvas.
    </p>
    <p :id="`${id}-erro`" v-show="mensagemErro" role="alert" class="erro">{{ mensagemErro }}</p>
    <div v-if="confirmada || gpsOcupado || salva?.cidade || salva?.uf" class="acoes-localizacao">
      <BaseButton
        v-if="confirmada || gpsOcupado"
        variant="text"
        :disabled="bloqueada"
        @click="descartar"
        >Descartar alteração de localização</BaseButton
      >
      <BaseButton
        v-if="cidadeExibida && !gpsOcupado"
        variant="text"
        :disabled="bloqueada"
        @click="remover"
        >Remover localização</BaseButton
      >
    </div>
    <p class="fonte">
      Localização por
      <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer"
        >OpenStreetMap</a
      >
    </p>
  </section>
</template>

<style scoped>
.empresa-localizacao {
  display: grid;
  gap: 14px;
  min-width: 0;
  padding: 18px 14px;
  border: 1px solid var(--mrj-color-border-subtle);
  border-radius: 18px;
  background: #f8f5fc;
  overflow-wrap: anywhere;
}
.titulo-localizacao {
  display: flex;
  align-items: center;
  gap: 10px;
}
.icone-localizacao {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: var(--mrj-color-secondary);
  color: var(--mrj-color-primary);
  flex-shrink: 0;
}
h2 {
  font-size: 16px;
  margin: 0 0 2px;
}
p {
  margin: 0;
  font-size: 12px;
  color: var(--mrj-color-text-secondary);
  line-height: 1.5;
}
.cidade-atual {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px;
  background: #fff;
  border: 1px solid #e2d9ed;
  border-radius: 12px;
}
.cidade-atual > svg {
  flex-shrink: 0;
  color: var(--mrj-color-primary);
}
.cidade-atual strong {
  font-size: 14px;
}
.cidade-atual p {
  margin-top: 2px;
}
.confirmada {
  border-color: #bca7d8;
}
.btn-gps {
  width: 100%;
  border-radius: 12px;
  padding: 13px 10px;
  font-size: 14px;
}
.erro {
  color: var(--mrj-color-danger);
  font-size: 14px;
}
.acoes-localizacao {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.acoes-localizacao > * {
  font-size: 12px;
  padding-inline: 4px;
}
.fonte {
  font-size: 11px;
}
a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: var(--mrj-color-primary);
  text-underline-offset: 3px;
}
a:focus-visible {
  outline: 3px solid var(--mrj-color-focus);
  outline-offset: 3px;
}
</style>
