import { ref, watch, onUnmounted } from 'vue'
import { sessao } from '../services/authSession.js'
import {
  camposPerfil,
  validarPerfil,
  payloadPerfil,
  consultarPerfilEmpresa,
  atualizarPerfilEmpresa,
} from '../services/empresaPerfilService.js'

export function usePerfilEmpresa() {
  const perfil = ref(null),
    form = ref({}),
    imagem = ref(undefined),
    previa = ref('')
  const carregando = ref(false),
    salvando = ref(false),
    editando = ref(false)
  const erro = ref(''),
    sucesso = ref(''),
    erros = ref({})
  let controller,
    ativa = true
  function liberarPrevia() {
    if (previa.value) URL.revokeObjectURL(previa.value)
    previa.value = ''
  }
  function cancelar() {
    if (salvando.value) return
    liberarPrevia()
    imagem.value = undefined
    form.value = Object.fromEntries(camposPerfil.map((c) => [c, perfil.value?.[c] ?? '']))
    erros.value = {}
    erro.value = ''
    editando.value = false
  }
  function selecionarImagem(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    if (!file.type.startsWith('image/')) {
      erros.value.profile_image = 'Selecione um arquivo de imagem.'
      return
    }
    liberarPrevia()
    imagem.value = file
    previa.value = URL.createObjectURL(file)
    delete erros.value.profile_image
  }
  function removerImagem() {
    liberarPrevia()
    imagem.value = null
    delete erros.value.profile_image
  }
  function tratarErro(e) {
    const status = e.response?.status
    erro.value =
      status === 400
        ? 'Revise os campos indicados.'
        : status === 401
          ? 'Sua sessão expirou. Entre novamente.'
          : status === 403
            ? 'Este perfil está disponível somente para contas de empresa.'
            : status === 503
              ? 'O armazenamento de imagens está indisponível. Tente novamente mais tarde.'
              : 'Não foi possível conectar ao serviço. Tente novamente.'
    if (status === 400) {
      const data = e.response.data || {}
      for (const campo of [...camposPerfil, 'profile_image']) {
        if (data[campo])
          erros.value[campo] = Array.isArray(data[campo])
            ? data[campo].join(' ')
            : String(data[campo])
      }
    }
  }
  async function executar(salvar) {
    if (!ativa || carregando.value || salvando.value || sessao.tipo !== 'empresa') return
    if (salvar) {
      erros.value = validarPerfil(form.value)
      if (Object.keys(erros.value).length) return
    }
    const revisao = sessao.revisao
    controller = new AbortController()
    const config = { signal: controller.signal, _sessionRevision: revisao }
    const atual = () => ativa && sessao.revisao === revisao && !config.signal.aborted
    erro.value = ''
    sucesso.value = ''
    if (salvar) salvando.value = true
    else carregando.value = true
    try {
      const dados = salvar
        ? await atualizarPerfilEmpresa(
            payloadPerfil(form.value, perfil.value, imagem.value),
            config,
          )
        : await consultarPerfilEmpresa(config)
      if (!atual()) return
      perfil.value = dados
      salvando.value = false
      cancelar()
      if (salvar) sucesso.value = 'Perfil atualizado com sucesso.'
    } catch (e) {
      if (atual()) tratarErro(e)
    } finally {
      if (atual()) {
        carregando.value = false
        salvando.value = false
      }
    }
  }
  watch(
    () => sessao.revisao,
    () => {
      controller?.abort()
      perfil.value = null
      salvando.value = carregando.value = false
      cancelar()
      sucesso.value = ''
    },
  )
  onUnmounted(() => {
    ativa = false
    controller?.abort()
    liberarPrevia()
  })
  return {
    perfil,
    form,
    imagem,
    previa,
    carregando,
    salvando,
    editando,
    erro,
    sucesso,
    erros,
    cancelar,
    selecionarImagem,
    removerImagem,
    carregar: () => executar(false),
    salvar: () => executar(true),
  }
}
