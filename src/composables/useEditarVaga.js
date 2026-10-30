import { reactive, ref, watch, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { sessao } from '../services/authSession.js'
import {
  capturarEmpresa,
  consultarVagaPropria,
  editarVaga,
  mensagemErroVagas,
} from '../services/freelanceService.js'
import {
  novoRascunhoVaga,
  formularioDaVaga,
  validarEdicaoVaga,
  montarPayloadEdicao,
  interpretarErroPublicacao,
  camposNaoConfirmados,
} from '../utils/vagaForm.js'
import { useGerenciamentoVagas } from '../stores/gerenciamentoVagas.js'

export function useEditarVaga() {
  const route = useRoute()
  const router = useRouter()
  const store = useGerenciamentoVagas()
  const form = reactive(novoRascunhoVaga())
  const erros = ref({})
  const erroGeral = ref('')
  const publicando = ref(false)
  const publicada = ref(false)
  const carregando = ref(true)
  const autorizada = ref(false)
  let original = null
  let ativa = true
  onBeforeUnmount(() => {
    ativa = false
  })
  watch(
    () => [route.params.id, sessao.revisao, sessao.usuario?.id, sessao.tipo],
    async (_, __, limpar) => {
      let ativo = true
      limpar(() => {
        ativo = false
      })
      original = null
      autorizada.value = false
      carregando.value = true
      erroGeral.value = ''
      Object.assign(form, novoRascunhoVaga())
      try {
        const vaga = await consultarVagaPropria(route.params.id)
        if (!ativo) return
        original = vaga
        Object.assign(form, formularioDaVaga(vaga))
        autorizada.value = true
      } catch (error) {
        if (ativo) erroGeral.value = mensagemErroVagas(error)
      } finally {
        if (ativo) carregando.value = false
      }
    },
    { immediate: true, flush: 'sync' },
  )
  async function publicar() {
    if (!autorizada.value || publicando.value || publicada.value) return
    erros.value = validarEdicaoVaga(form, original)
    erroGeral.value = ''
    if (Object.keys(erros.value).length) return
    const conta = capturarEmpresa()
    const id = original.id
    publicando.value = true
    try {
      const payload = montarPayloadEdicao(form, original)
      const vaga = await editarVaga(id, payload)
      if (!conta.atual() || String(route.params.id) !== String(id)) return
      const pendentes = camposNaoConfirmados(vaga, payload)
      if (pendentes.length) {
        erroGeral.value = `O servidor confirmou a edição, mas não confirmou estas informações: ${pendentes.join(', ')}. Seus campos foram mantidos. Tente salvar novamente após a integração do servidor.`
        return
      }
      store.registrarEdicao(vaga)
      publicada.value = true
      if (ativa) await router.replace('/homeEmpresa')
    } catch (error) {
      if (!conta.atual()) return
      erros.value = interpretarErroPublicacao(error).erros
      erroGeral.value = mensagemErroVagas(error)
    } finally {
      publicando.value = false
    }
  }
  return {
    form,
    erros,
    erroGeral,
    publicando,
    publicada,
    publicar,
    carregando,
    autorizada,
    validar: (dados) => validarEdicaoVaga(dados, original),
  }
}
