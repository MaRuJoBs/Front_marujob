import { defineStore } from 'pinia'
import { ref } from 'vue'
import { sessao } from '../services/authSession.js'
import {
  contarNaoLidas,
  listarNotificacoesFreelancer,
  marcarLeituraFreelancer,
} from '../services/notificacoesFreelancerService.js'

export const useNotificacoesFreelancer = defineStore('notificacoes-freelancer', () => {
  const total = ref(null)
  const itens = ref([])
  const pagina = ref(1)
  const temProxima = ref(false)
  const carregando = ref(false)
  const salvando = ref(false)
  const erro = ref('')
  const erroLeitura = ref('')
  let lista
  let contador
  let leitura
  let paginaSolicitada = 1

  function limpar() {
    lista?.abort()
    contador?.abort()
    leitura?.abort()
    itens.value = []
    total.value = null
    pagina.value = 1
    paginaSolicitada = 1
    temProxima.value = false
    carregando.value = salvando.value = false
    erro.value = erroLeitura.value = ''
  }

  function iniciar(anterior) {
    if (sessao.tipo !== 'usuario' || sessao.usuario?.id == null) return
    anterior?.abort()
    const controller = new AbortController()
    const revisao = sessao.revisao
    const config = { signal: controller.signal, _sessionRevision: revisao }
    return {
      controller,
      config,
      atual: () => !controller.signal.aborted && sessao.revisao === revisao,
    }
  }

  async function atualizarContagem() {
    if (salvando.value) return
    const pedido = iniciar(contador)
    if (!pedido) return
    contador = pedido.controller
    try {
      const count = await contarNaoLidas(pedido.config)
      if (pedido.atual()) total.value = count
    } catch {
      // A próxima atualização por foco ou navegação recupera a contagem.
    }
  }

  async function carregar(destino = paginaSolicitada) {
    if (salvando.value) return
    const pedido = iniciar(lista)
    if (!pedido) return
    lista = pedido.controller
    paginaSolicitada = destino
    carregando.value = true
    erro.value = ''
    try {
      const dados = await listarNotificacoesFreelancer(pedido.config, destino)
      if (!pedido.atual()) return
      itens.value = dados.results
      temProxima.value = Boolean(dados.next)
      pagina.value = destino
    } catch {
      if (pedido.atual()) erro.value = 'Não foi possível carregar as notificações.'
    } finally {
      if (pedido.atual()) carregando.value = false
    }
  }

  async function marcarLida(id = null) {
    if (salvando.value || carregando.value) return
    if (id != null && !itens.value.some((item) => item.id === id && !item.lida)) return
    const pedido = iniciar(leitura)
    if (!pedido) return
    leitura = pedido.controller
    contador?.abort()
    salvando.value = true
    erroLeitura.value = ''
    try {
      await marcarLeituraFreelancer(pedido.config, id)
      if (!pedido.atual()) return
      itens.value = itens.value.map((item) =>
        id == null || item.id === id ? { ...item, lida: true } : item,
      )
    } catch {
      if (pedido.atual())
        erroLeitura.value = 'Não foi possível atualizar a leitura. Tente novamente.'
    } finally {
      if (pedido.atual()) {
        salvando.value = false
        await Promise.all([atualizarContagem(), carregar()])
      }
    }
  }

  return {
    total,
    itens,
    pagina,
    temProxima,
    carregando,
    salvando,
    erro,
    erroLeitura,
    limpar,
    atualizarContagem,
    carregar,
    marcarLida,
  }
})
