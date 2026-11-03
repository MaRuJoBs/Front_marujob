import { ref, computed, watch, onUnmounted } from 'vue'
import { sessao } from '../services/authSession.js'
import { capturarEmpresa } from '../services/freelanceService.js'
import {
  listarNotificacoes,
  consultarCandidatura,
  decidirCandidatura,
  marcarNotificacaoLida,
} from '../services/notificacoesService.js'
import { erroNotificacoes, statusCandidatura, filtrosNotificacoes } from '../utils/notificacoes.js'

export function useNotificacoesEmpresa() {
  const notificacoes = ref([]),
    filtro = ref(''),
    pagina = ref(1),
    total = ref(0),
    proxima = ref(null),
    anterior = ref(null)
  const carregando = ref(false),
    erro = ref(''),
    feedback = ref(''),
    erroAcao = ref('')
  const selecionada = ref(null),
    confirmacao = ref(null)
  const processando = ref({}),
    lendo = ref({}),
    contatos = ref({}),
    carregandoCandidato = ref({}),
    errosCandidato = ref({}),
    bloqueadas = ref({})
  const haDecisao = computed(() => Object.values(processando.value).some(Boolean))
  const ocupada = computed(() => haDecisao.value || Object.values(lendo.value).some(Boolean))
  let ativa = true,
    consulta = 0,
    controllerLista
  const controllers = new Set(),
    consultasCandidato = new Map(),
    versoes = new Map()
  const pendente = (n) =>
    n?.status === 'pendente' && !ocupada.value && !bloqueadas.value[n.candidatura]
  const contaAtual = (conta) => ativa && conta.atual()
  function cancelarLista() {
    consulta++
    controllerLista?.abort()
    carregando.value = false
  }
  function cancelarCandidatos() {
    for (const { controller } of consultasCandidato.values()) controller.abort()
    consultasCandidato.clear()
    carregandoCandidato.value = {}
  }
  function limpar() {
    cancelarLista()
    cancelarCandidatos()
    for (const controller of controllers) controller.abort()
    controllers.clear()
    versoes.clear()
    notificacoes.value = []
    filtro.value = ''
    pagina.value = 1
    total.value = 0
    proxima.value = anterior.value = null
    selecionada.value = confirmacao.value = null
    erro.value = feedback.value = erroAcao.value = ''
    processando.value = {}
    lendo.value = {}
    contatos.value = {}
    errosCandidato.value = {}
    bloqueadas.value = {}
  }
  function vinculoCorreto(n, candidatura) {
    return (
      String(n.candidatura) === String(candidatura.id) &&
      String(n.freelancer) === String(candidatura.freelancer) &&
      String(n.oportunidade) === String(candidatura.oportunidade)
    )
  }
  function aplicarCandidatura(n, c) {
    if (!vinculoCorreto(n, c)) throw new Error('Resposta de outra candidatura.')
    const atualizar = (item) =>
      String(item.candidatura) === String(c.id)
        ? { ...item, status: c.status, freelancer_detalhes: c.freelancer_detalhes }
        : item
    notificacoes.value = notificacoes.value.map(atualizar)
    if (selecionada.value) selecionada.value = atualizar(selecionada.value)
    contatos.value[c.id] = c.whatsapp
    bloqueadas.value[c.id] = false
  }
  async function carregar(destino = pagina.value) {
    if (!ativa || sessao.tipo !== 'empresa' || !sessao.usuario || ocupada.value) return
    cancelarLista()
    cancelarCandidatos()
    const numero = consulta,
      conta = capturarEmpresa(),
      filtroAtual = filtro.value
    controllerLista = new AbortController()
    const signal = controllerLista.signal
    const atual = () => contaAtual(conta) && numero === consulta && !signal.aborted
    notificacoes.value = []
    contatos.value = {}
    errosCandidato.value = {}
    erro.value = ''
    proxima.value = anterior.value = null
    total.value = 0
    carregando.value = true
    try {
      const resultado = await listarNotificacoes({ status: filtroAtual, pagina: destino, signal })
      if (!atual()) return
      notificacoes.value = resultado.results
      total.value = resultado.count
      pagina.value = destino
      proxima.value = resultado.next
      anterior.value = resultado.previous
      for (const n of resultado.results) {
        bloqueadas.value[n.candidatura] = false
        if (n.status === 'aprovada') void carregarCandidato(n)
      }
      // Uma decisão pode esvaziar a última página de um filtro.
      if (!resultado.results.length && resultado.previous) return await carregar(resultado.previous)
    } catch (error) {
      if (!atual()) return
      if (error.response?.status === 404 && destino > 1) return await carregar(destino - 1)
      erro.value = erroNotificacoes(error)
    } finally {
      if (atual()) carregando.value = false
    }
  }
  function filtrar(valor) {
    if (ocupada.value || !filtrosNotificacoes.some((f) => f.valor === valor)) return
    selecionada.value = confirmacao.value = null
    erroAcao.value = feedback.value = ''
    filtro.value = valor
    pagina.value = 1
    return carregar(1)
  }
  async function carregarCandidato(n) {
    if (!ativa || !n || processando.value[n.candidatura]) return
    const conta = capturarEmpresa(),
      id = n.candidatura,
      versao = versoes.get(id) || 0
    consultasCandidato.get(id)?.controller.abort()
    const operacao = { controller: new AbortController() }
    consultasCandidato.set(id, operacao)
    const atual = () =>
      contaAtual(conta) &&
      consultasCandidato.get(id) === operacao &&
      (versoes.get(id) || 0) === versao &&
      !operacao.controller.signal.aborted
    carregandoCandidato.value[id] = true
    errosCandidato.value[id] = ''
    try {
      const c = await consultarCandidatura(id, { signal: operacao.controller.signal })
      if (atual()) aplicarCandidatura(n, c)
    } catch (error) {
      if (atual()) errosCandidato.value[id] = erroNotificacoes(error)
    } finally {
      if (atual()) {
        carregandoCandidato.value[id] = false
        consultasCandidato.delete(id)
      }
    }
  }
  function visualizar(n) {
    if (!notificacoes.value.some((item) => item.id === n?.id)) return
    selecionada.value = n
    return carregarCandidato(n)
  }
  function pedirDecisao(n, acao) {
    if (
      !['aprovar', 'recusar'].includes(acao) ||
      !pendente(n) ||
      !notificacoes.value.some((item) => item.id === n.id && item.status === 'pendente') ||
      sessao.tipo !== 'empresa'
    )
      return
    erroAcao.value = ''
    feedback.value = ''
    confirmacao.value = { notificacao: n, acao }
  }
  function cancelarDecisao() {
    if (!haDecisao.value) {
      confirmacao.value = null
      erroAcao.value = ''
    }
  }
  async function confirmarDecisao() {
    const solicitacao = confirmacao.value
    if (!solicitacao || !pendente(solicitacao.notificacao)) return
    const atual = notificacoes.value.find((item) => item.id === solicitacao.notificacao.id)
    if (!atual || atual.status !== 'pendente') {
      confirmacao.value = null
      erroAcao.value =
        'O estado desta candidatura foi atualizado. Consulte os dados atuais antes de continuar.'
      return
    }
    const n = solicitacao.notificacao,
      id = n.candidatura,
      conta = capturarEmpresa()
    processando.value[id] = true
    erroAcao.value = ''
    feedback.value = ''
    cancelarLista()
    versoes.set(id, (versoes.get(id) || 0) + 1)
    consultasCandidato.get(id)?.controller.abort()
    consultasCandidato.delete(id)
    carregandoCandidato.value[id] = false
    const controller = new AbortController()
    controllers.add(controller)
    let atualizarLista = false
    try {
      const c = await decidirCandidatura(id, solicitacao.acao, { signal: controller.signal })
      if (!contaAtual(conta)) return
      aplicarCandidatura(n, c)
      feedback.value = `Decisão confirmada: candidatura ${statusCandidatura[c.status].toLowerCase()}.`
      confirmacao.value = null
      atualizarLista = true
    } catch (error) {
      if (!contaAtual(conta)) return
      erroAcao.value = erroNotificacoes(error)
      if (error.response?.status === 409) {
        confirmacao.value = null
        bloqueadas.value[id] = true
        try {
          const c = await consultarCandidatura(id, { signal: controller.signal })
          if (!contaAtual(conta)) return
          aplicarCandidatura(n, c)
          confirmacao.value = null
          atualizarLista = true
        } catch {
          if (contaAtual(conta))
            erroAcao.value +=
              ' Não foi possível atualizar o estado. Atualize a lista antes de tentar novamente.'
        }
      }
    } finally {
      controllers.delete(controller)
      if (contaAtual(conta)) {
        processando.value[id] = false
        if (atualizarLista) await carregar(pagina.value)
      }
    }
  }
  async function marcarLida(n) {
    if (
      ocupada.value ||
      !n ||
      n.lida !== false ||
      lendo.value[n.id] ||
      !notificacoes.value.some((item) => item.id === n.id)
    )
      return
    const conta = capturarEmpresa(),
      controller = new AbortController()
    controllers.add(controller)
    lendo.value[n.id] = true
    erroAcao.value = ''
    feedback.value = ''
    cancelarLista()
    try {
      await marcarNotificacaoLida(n.id, { signal: controller.signal })
      if (!contaAtual(conta)) return
      // A resposta de leitura não pode sobrescrever uma decisão simultânea.
      notificacoes.value = notificacoes.value.map((item) =>
        item.id === n.id ? { ...item, lida: true } : item,
      )
      if (selecionada.value?.id === n.id) selecionada.value = { ...selecionada.value, lida: true }
      feedback.value = 'Notificação marcada como lida.'
    } catch (error) {
      if (contaAtual(conta)) erroAcao.value = erroNotificacoes(error)
    } finally {
      controllers.delete(controller)
      if (contaAtual(conta)) lendo.value[n.id] = false
    }
  }
  watch(
    () => [sessao.revisao, sessao.usuario?.id, sessao.tipo],
    () => {
      limpar()
      if (sessao.tipo === 'empresa' && sessao.usuario) void carregar(1)
    },
    { flush: 'sync', immediate: true },
  )
  onUnmounted(() => {
    ativa = false
    limpar()
  })
  return {
    notificacoes,
    filtro,
    pagina,
    total,
    proxima,
    anterior,
    carregando,
    erro,
    feedback,
    erroAcao,
    selecionada,
    confirmacao,
    processando,
    lendo,
    contatos,
    carregandoCandidato,
    errosCandidato,
    bloqueadas,
    haDecisao,
    ocupada,
    pendente,
    carregar,
    filtrar,
    carregarCandidato,
    visualizar,
    pedirDecisao,
    cancelarDecisao,
    confirmarDecisao,
    marcarLida,
  }
}
