<script setup>
import { useRouter } from 'vue-router'
import EmpresaHeader from '../components/EmpresaHeader.vue'
import BaseCard from '../components/ui/BaseCard.vue'
import BaseButton from '../components/ui/BaseButton.vue'
const router = useRouter()
</script>

<template>
  <div class="configuracoes-empresa mrj-ui">
    <EmpresaHeader />
    <main>
      <router-link to="/empresa/perfil">Voltar ao perfil</router-link>
      <h1>Configurações</h1>
      <BaseCard>
        <h2>Segurança e acesso</h2>
        <BaseButton
          variant="outline"
          @click="
            router.push({ path: '/trocar-senha', query: { origem: 'configuracoes-empresa' } })
          "
          >Alterar senha</BaseButton
        >
      </BaseCard>
    </main>
  </div>
</template>

<style scoped>
.configuracoes-empresa {
  min-height: 100vh;
  background: var(--mrj-color-secondary);
  color: var(--mrj-color-text);
  font-family: var(--mrj-font-family);
  line-height: var(--mrj-line-height);
}
main {
  max-width: 760px;
  margin: auto;
  padding: 24px 16px 110px;
  overflow-wrap: anywhere;
}
h1 {
  font-size: 21px;
  font-weight: 700;
  margin-block: var(--mrj-space-4) var(--mrj-space-6);
  line-height: 1.25;
}
h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}
a {
  display: inline-flex;
  align-items: center;
  min-height: var(--mrj-control-height-md);
  text-underline-offset: 3px;
  color: inherit;
}
a:focus-visible {
  outline: 3px solid var(--mrj-color-focus);
  outline-offset: 3px;
}
/* F61 · Desktop: reserva da barra inferior removida; largura de leitura mantida. */
@media (min-width: 64rem) {
  .configuracoes-empresa {
    min-height: auto;
    background: transparent;
  }
  main {
    padding: 32px 40px 56px;
  }
}
</style>
