import { onBeforeUnmount, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { sessao } from '../services/authSession.js'
import { erroFreelancers, obterFreelancer } from '../services/freelancersPublicosService.js'

export function usePerfilPublicoFreelancer() {
  const route = useRoute()
  const perfil = ref(null)
  const carregando = ref(false)
  const erro = ref('')
  const indisponivel = ref(false)
  let controller

  async function carregar() {
    controller?.abort()
    controller = new AbortController()
    const { signal } = controller
    perfil.value = null
    erro.value = ''
    indisponivel.value = false
    carregando.value = true
    try {
      const resultado = await obterFreelancer(route.params.id, signal)
      if (!signal.aborted) perfil.value = resultado
    } catch (error) {
      if (!signal.aborted) {
        indisponivel.value = error.response?.status === 404
        erro.value = erroFreelancers(error)
      }
    } finally {
      if (!signal.aborted) carregando.value = false
    }
  }

  watch(() => route.params.id, carregar, { immediate: true })
  watch(
    () => sessao.revisao,
    () => {
      controller?.abort()
      perfil.value = null
      carregando.value = false
      indisponivel.value = false
      erro.value = 'A sessão foi alterada. Entre novamente.'
    },
  )
  onBeforeUnmount(() => controller?.abort())

  return { perfil, carregando, erro, indisponivel, carregar }
}
