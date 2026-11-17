<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faBriefcase, faXmark } from '@fortawesome/free-solid-svg-icons'
import { sessao } from '@/services/authSession'

// Cartão da vaga da candidatura: aparece acima do campo de texto ("contexto" da conversa, ainda não
// enviado) e dentro da primeira mensagem enviada a partir da candidatura.
const { vaga, dismissible = false } = defineProps({
  vaga: { type: Object, required: true },
  dismissible: { type: Boolean, default: false },
})

const emit = defineEmits(['dismiss'])

// A empresa dona da vaga abre a tela de gestão; o freelancer, a página pública da oportunidade.
const link = computed(() =>
  sessao.usuario?.id != null && vaga.empresa === sessao.usuario.id
    ? `/empresa/vagas/${vaga.id}`
    : `/oportunidade/${vaga.id}`,
)
const local = computed(() =>
  [vaga.modalidade, [vaga.cidade, vaga.uf].filter(Boolean).join('/')].filter(Boolean).join(' · '),
)
</script>

<template>
  <div class="card" :class="{ 'card--bar': dismissible }">
    <RouterLink class="card__link" :to="link" :title="`Ver vaga: ${vaga.titulo}`">
      <span class="card__icone" aria-hidden="true"><FontAwesomeIcon :icon="faBriefcase" /></span>
      <span class="card__text">
        <small
          >{{ dismissible ? 'Conversando sobre a vaga' : 'Vaga'
          }}<template v-if="local"> · {{ local }}</template></small
        >
        <strong>{{ vaga.titulo }}</strong>
      </span>
    </RouterLink>

    <button
      v-if="dismissible"
      type="button"
      class="card__close"
      aria-label="Não anexar esta vaga"
      title="Não anexar esta vaga"
      @click="emit('dismiss')"
    >
      <FontAwesomeIcon :icon="faXmark" :style="{ fontSize: '16px' }" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.card {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
  border: 1px solid #dcd0e8;
  border-radius: 12px;
  background-color: #f6f1fa;
}

.card--bar {
  margin: 0 24px;
  padding-right: 8px;
}

.card__link {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 10px;
  min-width: 0;
  padding: 8px;
  color: #2c2c2c;
}

.card__icone {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  color: #6e4ab7;
  font-size: 18px;
  border-radius: 10px;
  background-color: #eae1f3;
}

.card__text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  line-height: 1.3;
}

.card__text small {
  color: #796197;
  font-size: 12px;
}

.card__text strong {
  overflow: hidden;
  color: #6e4ab7;
  font-size: 14px;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.card__close {
  display: inline-flex;
  padding: 6px;
  color: #796197;
  border-radius: 50%;
  cursor: pointer;
}

.card__close:hover {
  background-color: #eae1f3;
  color: #6e4ab7;
}

@container (max-width: 650px) {
  .card--bar {
    margin: 0 12px;
  }
}
</style>
