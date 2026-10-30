import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { configurarGoogle, desativarGoogle } from '../utils/googleAuth.js'
import { loginComGoogle } from '../services/authService.js'
import { mensagensErro } from '../utils/authErrors.js'

export function useGoogleAuth({ tipo = null, cadastro = false, ocupado, onSuccess, onError }) {
  const googleButton = ref(null)
  const googleLoading = ref(false)
  const googleDisponivel = Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim())
  const googlePronto = ref(false)
  const googleInicializando = ref(false)
  const googleErro = ref('')
  let ativo = true

  const carregarGoogle = async () => {
    if (!ativo || googleInicializando.value || ocupado.value || googleLoading.value) return
    googleInicializando.value = true
    googleErro.value = ''
    try {
      await nextTick()
      const configurado = await configurarGoogle(
        googleButton.value,
        async (response) => {
          if (!ativo || ocupado.value || googleLoading.value) return
          googleLoading.value = true
          googleErro.value = ''
          try {
            await loginComGoogle(response.credential, tipo, cadastro)
            if (ativo) await onSuccess()
          } catch (error) {
            if (ativo) onError(mensagensErro(error, 'Não foi possível entrar com o Google.'))
          } finally {
            googleLoading.value = false
          }
        },
        () => ativo,
      )
      if (ativo) googlePronto.value = configurado
    } catch (error) {
      if (ativo) {
        googlePronto.value = false
        googleErro.value = error.message || 'Não foi possível carregar o Google. Tente novamente.'
      }
    } finally {
      if (ativo) googleInicializando.value = false
    }
  }
  onMounted(carregarGoogle)

  onBeforeUnmount(() => {
    ativo = false
    desativarGoogle()
  })
  return {
    googleButton,
    googleLoading,
    googleErro,
    googleDisponivel,
    googlePronto,
    googleInicializando,
    carregarGoogle,
  }
}
