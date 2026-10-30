import { ref, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { sessao } from '../services/authService.js'
import { publicarVaga } from '../services/freelanceService.js'
import { useVagasStore } from '../stores/vagas.js'
import {
  validarVaga,
  montarPayloadVaga,
  interpretarErroPublicacao,
  camposNaoConfirmados,
} from '../utils/vagaForm.js'

export function useCriarVaga() {
  const router = useRouter()
  const store = useVagasStore()
  store.prepararRascunho(sessao.usuario?.id)
  const form = store.rascunho
  const erros = ref({})
  const erroGeral = ref('')
  const publicando = ref(false)
  const publicada = ref(false)
  let ativo = true
  onBeforeUnmount(() => {
    ativo = false
  })

  async function publicar() {
    if (publicando.value || publicada.value) return
    erros.value = validarVaga(form)
    erroGeral.value = ''
    if (Object.keys(erros.value).length) return
    if (!sessao.usuario || sessao.tipo !== 'empresa') {
      erroGeral.value = 'Entre com uma conta de empresa para publicar uma vaga.'
      return
    }
    publicando.value = true
    const revisao = sessao.revisao
    try {
      const payload = montarPayloadVaga(form)
      const vaga = await publicarVaga(payload)
      publicada.value = true
      // Não exibe dados de uma conta depois de logout ou troca de sessão.
      if (sessao.revisao !== revisao) return
      const pendentes = camposNaoConfirmados(vaga, payload)
      store.registrarPublicacao(vaga, pendentes.length > 0)
      if (pendentes.length) {
        erroGeral.value = `A vaga foi publicada, mas o servidor não confirmou estas informações: ${pendentes.join(', ')}. O preenchimento foi mantido nesta sessão. Não publique novamente para evitar uma vaga duplicada.`
        store.confirmacao =
          'Vaga publicada. As informações complementares ainda não foram confirmadas pelo servidor.'
        return
      }
      if (ativo) {
        try {
          await router.replace({ name: 'homeEmpresa' })
        } catch {
          erroGeral.value =
            'A vaga foi publicada, mas não foi possível abrir o início. Use o botão abaixo para continuar.'
        }
      }
    } catch (error) {
      if (!ativo) return
      const feedback = interpretarErroPublicacao(error)
      erros.value = feedback.erros
      erroGeral.value = feedback.mensagem
    } finally {
      publicando.value = false
    }
  }

  return { form, erros, erroGeral, publicando, publicada, publicar }
}
