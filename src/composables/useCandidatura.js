import { computed, ref, watch, onBeforeUnmount } from 'vue'
import { sessao, obterAccessToken, obterRefreshToken } from '../services/authSession.js'
import {
  consultarCandidaturaPropria,
  enviarCandidatura,
  mensagemErroCandidatura,
} from '../services/candidaturasService.js'

export function useCandidatura(oportunidade) {
  const candidatura = ref(null),
    carregando = ref(false),
    enviando = ref(false)
  const consultada = ref(false),
    erro = ref(''),
    feedback = ref('')
  const permitida = computed(() => sessao.tipo === 'usuario' && sessao.usuario?.id != null)
  const podeEnviar = computed(
    () =>
      permitida.value &&
      oportunidade() != null &&
      consultada.value &&
      !candidatura.value &&
      !carregando.value &&
      !enviando.value,
  )
  let sequencia = 0,
    controlador,
    ativa = true

  async function consultar() {
    if (!ativa || enviando.value) return
    const atual = ++sequencia
    controlador?.abort()
    controlador = new AbortController()
    consultada.value = false
    erro.value = ''
    if (!permitida.value || oportunidade() == null) return
    carregando.value = true
    try {
      const data = await consultarCandidaturaPropria(oportunidade(), controlador.signal)
      if (atual !== sequencia || !ativa) return
      candidatura.value = data
      consultada.value = true
    } catch (e) {
      if (atual === sequencia && ativa) erro.value = mensagemErroCandidatura(e)
    } finally {
      if (atual === sequencia && ativa) carregando.value = false
    }
  }
  async function enviar() {
    if (!podeEnviar.value || (!obterAccessToken() && !obterRefreshToken())) return
    const atual = ++sequencia,
      id = oportunidade()
    controlador?.abort()
    enviando.value = true
    consultada.value = false
    erro.value = ''
    feedback.value = ''
    try {
      // Não aborta a escrita na troca de rota: cancelamento não desfaz o POST no servidor.
      const data = await enviarCandidatura(id)
      if (atual !== sequencia || !ativa) return
      candidatura.value = data
      consultada.value = true
      feedback.value = 'Candidatura enviada e confirmada.'
    } catch (e) {
      if (atual !== sequencia || !ativa) return
      const falha = mensagemErroCandidatura(e, true)
      erro.value = falha
      // Qualquer falha do POST exige leitura antes de habilitar outra tentativa.
      controlador = new AbortController()
      try {
        const data = await consultarCandidaturaPropria(id, controlador.signal)
        if (atual !== sequencia || !ativa) return
        candidatura.value = data
        consultada.value = data !== null || ![403, 404].includes(e.response?.status)
        if (data) {
          erro.value = ''
          feedback.value = 'Candidatura existente confirmada pela consulta.'
        }
      } catch {
        if (atual === sequencia && ativa)
          erro.value = `${falha} A consulta de confirmação também falhou. Consulte novamente para continuar.`
      }
    } finally {
      if (atual === sequencia && ativa) enviando.value = false
    }
  }
  watch(
    [oportunidade, () => sessao.revisao, () => sessao.usuario?.id, () => sessao.tipo],
    () => {
      ++sequencia
      controlador?.abort()
      candidatura.value = null
      consultada.value = false
      carregando.value = false
      enviando.value = false
      erro.value = ''
      feedback.value = ''
      void consultar()
    },
    { immediate: true, flush: 'sync' },
  )
  onBeforeUnmount(() => {
    ativa = false
    ++sequencia
    controlador?.abort()
  })
  return {
    candidatura,
    carregando,
    enviando,
    permitida,
    podeEnviar,
    erro,
    feedback,
    consultar,
    enviar,
  }
}
