import { computed, ref, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
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
  const route = useRoute()
  const store = useVagasStore()
  store.prepararRascunho(sessao.usuario?.id)
  const form = store.rascunho
  const erros = ref({})
  const erroGeral = ref(store.avisoPublicacao)
  const chaveEnvio = computed(() => `${sessao.revisao}:${sessao.usuario?.id}:POST`)
  const publicando = computed(() => store.envios.has(chaveEnvio.value))
  const publicada = ref(Boolean(store.avisoPublicacao))
  let ativo = true
  onBeforeUnmount(() => {
    ativo = false
  })

  async function publicar() {
    if (!ativo || route.name !== 'criar-vaga' || publicando.value || publicada.value) return
    erros.value = validarVaga(form)
    erroGeral.value = ''
    if (Object.keys(erros.value).length) return
    if (!sessao.usuario || sessao.tipo !== 'empresa') {
      erroGeral.value = 'Entre com uma conta de empresa para publicar uma vaga.'
      return
    }
    const revisao = sessao.revisao
    const usuarioId = sessao.usuario.id
    const envio = chaveEnvio.value
    if (!store.iniciarEnvio(envio)) return
    try {
      const payload = montarPayloadVaga(form)
      const vaga = await publicarVaga(payload)
      // Não exibe dados de uma conta depois de logout ou troca de sessão.
      if (
        sessao.revisao !== revisao ||
        sessao.usuario?.id !== usuarioId ||
        sessao.tipo !== 'empresa'
      )
        return
      publicada.value = true
      const pendentes = camposNaoConfirmados(vaga, payload)
      store.registrarPublicacao(vaga, pendentes.length > 0)
      if (pendentes.length) {
        erroGeral.value = `A vaga foi publicada, mas o servidor não confirmou estas informações: ${pendentes.join(', ')}. O preenchimento foi mantido nesta sessão. Não publique novamente para evitar uma vaga duplicada.`
        store.avisoPublicacao = erroGeral.value
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
      if (!ativo || (sessao.usuario?.id != null && sessao.usuario.id !== usuarioId)) return
      const feedback = interpretarErroPublicacao(error)
      erros.value = feedback.erros
      erroGeral.value = feedback.mensagem
    } finally {
      store.finalizarEnvio(envio)
    }
  }

  return { form, erros, erroGeral, publicando, publicada, publicar }
}
