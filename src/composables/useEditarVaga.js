import { computed, reactive, ref, watch, onBeforeUnmount, nextTick } from 'vue'
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
import { useVagasStore } from '../stores/vagas.js'

export function useEditarVaga() {
  const route = useRoute()
  const router = useRouter()
  const store = useGerenciamentoVagas()
  const enviosStore = useVagasStore()
  const form = reactive(novoRascunhoVaga())
  const erros = ref({})
  const erroGeral = ref('')
  const chaveEnvio = computed(
    () => `${sessao.revisao}:${sessao.usuario?.id}:PATCH:${route.params.id}`,
  )
  const publicando = computed(() => enviosStore.envios.has(chaveEnvio.value))
  const publicada = ref(false)
  const carregando = ref(true)
  const autorizada = ref(false)
  let original = null
  let ativa = true
  let geracao = 0
  onBeforeUnmount(() => {
    ativa = false
  })
  watch(
    () => [route.params.id, sessao.revisao, sessao.usuario?.id, sessao.tipo],
    async (_, __, limpar) => {
      geracao++
      let ativo = true
      let pararEspera
      let encerrarEspera
      limpar(() => {
        ativo = false
        pararEspera?.()
        encerrarEspera?.()
      })
      original = null
      autorizada.value = false
      carregando.value = true
      erroGeral.value = ''
      erros.value = {}
      publicada.value = false
      Object.assign(form, novoRascunhoVaga())
      try {
        // Uma troca de chave pode desmontar este formulário no mesmo ciclo da rota.
        await nextTick()
        if (!ativo || route.name !== 'editar-vaga') return
        if (publicando.value) {
          await new Promise((resolve) => {
            encerrarEspera = resolve
            pararEspera = watch(
              publicando,
              (pendente) => {
                if (!pendente) {
                  pararEspera()
                  resolve()
                }
              },
              { flush: 'sync' },
            )
          })
        }
        if (!ativo) return
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
    if (
      !ativa ||
      route.name !== 'editar-vaga' ||
      !autorizada.value ||
      publicando.value ||
      publicada.value
    )
      return
    erros.value = validarEdicaoVaga(form, original)
    erroGeral.value = ''
    if (Object.keys(erros.value).length) return
    const conta = capturarEmpresa()
    const id = original.id
    const geracaoEnvio = geracao
    const envio = chaveEnvio.value
    if (!enviosStore.iniciarEnvio(envio)) return
    try {
      const payload = montarPayloadEdicao(form, original)
      const vaga = await editarVaga(id, payload)
      if (
        !ativa ||
        geracaoEnvio !== geracao ||
        !conta.atual() ||
        String(route.params.id) !== String(id)
      )
        return
      const pendentes = camposNaoConfirmados(vaga, payload)
      if (pendentes.length) {
        erroGeral.value = `O servidor confirmou a edição, mas não confirmou estas informações: ${pendentes.join(', ')}. Seus campos foram mantidos. Tente salvar novamente após a integração do servidor.`
        return
      }
      store.registrarEdicao(vaga)
      publicada.value = true
      if (ativa) await router.replace('/homeEmpresa')
    } catch (error) {
      if (!ativa || geracaoEnvio !== geracao || !conta.atual()) return
      erros.value = interpretarErroPublicacao(error).erros
      erroGeral.value = mensagemErroVagas(error)
    } finally {
      enviosStore.finalizarEnvio(envio)
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
