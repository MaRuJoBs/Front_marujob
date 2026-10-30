import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { sessao } from '../services/authSession.js'
import { consultarVagaPropria, mensagemErroVagas } from '../services/freelanceService.js'

export function useDetalheVagaEmpresa() {
  const route = useRoute()
  const vaga = ref(null)
  const carregando = ref(false)
  const erro = ref('')
  const tentativa = ref(0)
  watch(
    () => [route.params.id, sessao.usuario?.id, sessao.tipo, sessao.revisao, tentativa.value],
    async (_, __, invalidar) => {
      let ativa = true
      invalidar(() => {
        ativa = false
      })
      vaga.value = null
      erro.value = ''
      carregando.value = true
      try {
        const resultado = await consultarVagaPropria(route.params.id)
        if (ativa) vaga.value = resultado
      } catch (error) {
        if (ativa) erro.value = mensagemErroVagas(error)
      } finally {
        if (ativa) carregando.value = false
      }
    },
    { immediate: true, flush: 'sync' },
  )
  return {
    vaga,
    carregando,
    erro,
    recarregar: () => {
      tentativa.value++
    },
  }
}
