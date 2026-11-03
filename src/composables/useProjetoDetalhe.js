import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRecursoPrivado } from '@/composables/useRecursoPrivado'
import { consultarProjeto, excluirProjeto as remover } from '@/services/perfilPortfolioService'
export function useProjetoDetalhe() {
  const route = useRoute(),
    router = useRouter(),
    projeto = ref(null),
    mostrarModalExcluir = ref(false),
    excluindo = ref(false),
    sucesso = ref('')
  const recurso = useRecursoPrivado(() => {
    projeto.value = null
    mostrarModalExcluir.value = false
    excluindo.value = false
    sucesso.value = ''
  })
  const carregarProjeto = () => {
    recurso.invalidar()
    return recurso.executar(
      (config) => consultarProjeto(route.params.id, config),
      (p) => {
        projeto.value = p
      },
    )
  }
  async function excluirProjeto() {
    if (excluindo.value || !mostrarModalExcluir.value || !projeto.value) return
    const id = projeto.value.id
    excluindo.value = true
    await recurso.executar(
      (config) => remover(id, config),
      () => {
        mostrarModalExcluir.value = false
        projeto.value = null
        sucesso.value = 'Projeto excluído com sucesso.'
      },
    )
    excluindo.value = false
  }
  watch(() => route.params.id, carregarProjeto, { immediate: true })
  return {
    projeto,
    mostrarModalExcluir,
    excluindo,
    sucesso,
    ...recurso,
    carregarProjeto,
    excluirProjeto,
    router,
  }
}
