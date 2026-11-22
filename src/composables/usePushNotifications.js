import { computed, ref } from 'vue'
import { sessao } from '../services/authSession.js'
import {
  obterChaveVapid,
  registrarSubscription,
  removerSubscription,
} from '../services/pushService.js'

const estado = ref('inativo')
const mensagem = ref('')
const permissao = ref(globalThis.Notification?.permission ?? 'default')
let fila = Promise.resolve()
let operacao
let encerrando
let subscriptionSincronizada
const intervaloVapid = 60 * 60 * 1000
const intervaloFalha = 60 * 1000
let esperaRede

function assinatura(subscription) {
  const { endpoint, expirationTime, keys } = subscription.toJSON()
  return JSON.stringify([endpoint, expirationTime, keys?.p256dh, keys?.auth])
}

function proximaTentativa(error) {
  const retryAfter = error.response?.headers?.['retry-after']
  const agora = Date.now()
  if (error.response?.status === 429 && retryAfter) {
    const segundos = Number(retryAfter)
    const limite = Number.isFinite(segundos) ? agora + segundos * 1000 : Date.parse(retryAfter)
    if (limite > agora) return limite
  }
  return agora + intervaloFalha
}

export function pushSuportado() {
  return Boolean(
    globalThis.isSecureContext &&
    globalThis.navigator?.serviceWorker &&
    globalThis.PushManager &&
    globalThis.Notification,
  )
}

export function decodificarVapid(chave) {
  if (typeof chave !== 'string' || !/^[\w-]+={0,2}$/.test(chave)) throw new Error('VAPID inválida')
  const base64 = chave.replace(/-/g, '+').replace(/_/g, '/')
  const bytes = Uint8Array.from(atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')), (c) =>
    c.charCodeAt(0),
  )
  if (bytes.length !== 65 || bytes[0] !== 4) throw new Error('VAPID inválida')
  return bytes
}

function preferencia(id, nome, valor) {
  const chave = `marujob:push:${id}:${nome}`
  try {
    if (valor !== undefined) localStorage.setItem(chave, valor)
    return localStorage.getItem(chave)
  } catch {
    return null
  }
}

function contaAtual() {
  if (sessao.tipo !== 'usuario' || sessao.usuario?.id == null) return null
  return { id: sessao.usuario.id, revisao: sessao.revisao }
}

function executar(tarefa) {
  const proxima = fila.then(tarefa)
  fila = proxima.catch(() => {})
  return proxima
}

async function registroAtivo(signal) {
  const espera = new AbortController()
  const cancelar = () => espera.abort()
  signal.addEventListener('abort', cancelar, { once: true })
  const timer = setTimeout(cancelar, 6000)
  try {
    signal.throwIfAborted()
    return await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) => {
        espera.signal.addEventListener(
          'abort',
          () => reject(new Error('Service Worker indisponível')),
          { once: true },
        )
      }),
    ])
  } finally {
    clearTimeout(timer)
    signal.removeEventListener('abort', cancelar)
  }
}

export function cancelarSincronizacaoPush() {
  operacao?.controller.abort()
  subscriptionSincronizada = null
  estado.value = 'inativo'
  mensagem.value = ''
  permissao.value = globalThis.Notification?.permission ?? 'default'
}

export function sincronizarPush({ voluntario = false, renovar = false, verificar = false } = {}) {
  const conta = contaAtual()
  if (!conta || !pushSuportado() || encerrando) return
  permissao.value = Notification.permission
  if (permissao.value === 'denied') {
    cancelarSincronizacaoPush()
    return
  }
  if (!voluntario && (permissao.value !== 'granted' || preferencia(conta.id, 'desativado') === '1'))
    return
  if (operacao?.revisao === conta.revisao && !operacao.controller.signal.aborted)
    return operacao.promise
  if (!renovar && !voluntario && !verificar && subscriptionSincronizada) return
  if (esperaRede?.revisao === conta.revisao && Date.now() < esperaRede.ate) return

  const controller = new AbortController()
  const { signal } = controller
  const pedido = { revisao: conta.revisao, controller }
  const vigente = () => !signal.aborted && sessao.revisao === conta.revisao
  const config = { signal, _sessionRevision: conta.revisao }
  if (!subscriptionSincronizada) estado.value = 'ativando'
  mensagem.value = ''
  // A chamada precisa ocorrer na interação, antes de aguardar o Service Worker ou a rede.
  let resposta
  try {
    resposta =
      voluntario && permissao.value === 'default'
        ? Notification.requestPermission()
        : Promise.resolve(permissao.value)
  } catch (error) {
    resposta = Promise.reject(error)
  }
  const obterPermissao = Promise.resolve(resposta).catch(() => 'default')

  pedido.promise = executar(async () => {
    let subscription
    let nova = false
    let confirmada = subscriptionSincronizada
    const interrompida = new Promise((resolve) =>
      signal.addEventListener('abort', () => resolve(null), { once: true }),
    )
    try {
      if (!vigente()) return
      const resultado = await Promise.race([obterPermissao, interrompida])
      if (!vigente()) return
      permissao.value = resultado
      if (resultado !== 'granted') return
      const registro = await registroAtivo(signal)
      subscription = await registro.pushManager.getSubscription()
      if (!vigente()) return
      const valida =
        subscription &&
        (subscription.expirationTime == null || subscription.expirationTime > Date.now())
      if (!valida || assinatura(subscription) !== confirmada?.assinatura) {
        confirmada = subscriptionSincronizada = null
      }
      // Foco e visibilidade conferem o navegador. Só revalidamos VAPID periodicamente.
      if (confirmada && Date.now() < confirmada.verificarVapidAte) return
      const chave = decodificarVapid(await obterChaveVapid(config))
      if (!vigente()) return
      if (subscription) {
        const atual = new Uint8Array(subscription.options.applicationServerKey ?? [])
        const mesmaChave =
          atual.length === chave.length && chave.every((byte, i) => atual[i] === byte)
        if (
          !mesmaChave ||
          (subscription.expirationTime != null && subscription.expirationTime <= Date.now())
        ) {
          await removerSubscription(subscription.endpoint, config)
          if (!vigente()) return
          confirmada = subscriptionSincronizada = null
          await subscription.unsubscribe()
          subscription = null
        }
      }
      if (!vigente()) return
      if (confirmada) {
        confirmada.verificarVapidAte = Date.now() + intervaloVapid
        return
      }
      if (!subscription) {
        subscription = await registro.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: chave,
        })
        nova = true
      }
      if (!vigente()) {
        if (nova && encerrando?.revisao !== conta.revisao)
          await subscription.unsubscribe().catch(() => {})
        return
      }
      await registrarSubscription(subscription, config)
      if (!vigente()) return
      preferencia(conta.id, 'desativado', '0')
      subscriptionSincronizada = {
        assinatura: assinatura(subscription),
        verificarVapidAte: Date.now() + intervaloVapid,
      }
      esperaRede = null
      estado.value = 'ativo'
    } catch (error) {
      if (nova && encerrando?.revisao !== conta.revisao)
        await subscription.unsubscribe().catch(() => {})
      if (!vigente()) return
      esperaRede = { revisao: conta.revisao, ate: proximaTentativa(error) }
      if (confirmada) return
      estado.value = 'erro'
      mensagem.value =
        error.response?.status === 429
          ? 'Aguarde um pouco antes de tentar ativar novamente.'
          : 'Não foi possível ativar os avisos neste dispositivo. Tente novamente mais tarde.'
    } finally {
      if (vigente() && estado.value === 'ativando') estado.value = 'inativo'
      if (operacao === pedido) operacao = null
    }
  })
  operacao = pedido
  return pedido.promise
}

async function subscriptionDoDispositivo() {
  const registro = await navigator.serviceWorker.getRegistration()
  return registro?.pushManager?.getSubscription()
}

export function limparPushSemSessao() {
  if (!pushSuportado()) return
  return executar(async () => {
    const subscription = await subscriptionDoDispositivo()
    await subscription?.unsubscribe()
  }).catch(() => {})
}

async function desvincular(conta) {
  const subscription = await subscriptionDoDispositivo()
  if (!subscription) return
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 2500)
  const config = {
    _sessionRevision: conta.revisao,
    signal: controller.signal,
    timeout: 2500,
  }
  try {
    await removerSubscription(subscription.endpoint, config)
  } finally {
    clearTimeout(timer)
    await subscription.unsubscribe()
  }
}

export function encerrarPush({ voluntario = false } = {}) {
  const conta = contaAtual()
  if (!conta || !pushSuportado()) return
  if (voluntario) preferencia(conta.id, 'desativado', '1')
  if (encerrando?.revisao === conta.revisao) return encerrando.promise
  cancelarSincronizacaoPush()
  const pedido = { revisao: conta.revisao }
  encerrando = pedido
  pedido.promise = executar(async () => {
    try {
      if (sessao.revisao === conta.revisao) await desvincular(conta)
    } catch {
      if (voluntario && sessao.revisao === conta.revisao) {
        mensagem.value =
          'Não foi possível confirmar toda a remoção. Você pode tentar desativar novamente.'
        estado.value = 'erro'
      }
    } finally {
      if (encerrando === pedido) encerrando = null
    }
  })
  return pedido.promise
}

export function usePushNotifications() {
  const adiado = ref(null)
  const suportado = pushSuportado()
  const exibirPrompt = computed(() => {
    const conta = contaAtual()
    if (!suportado || !conta || permissao.value !== 'default' || estado.value !== 'inativo')
      return false
    const ate =
      adiado.value?.id === conta.id
        ? adiado.value.ate
        : Number(preferencia(conta.id, 'adiado')) || 0
    return ate <= Date.now()
  })
  function adiar() {
    const conta = contaAtual()
    if (!conta) return
    const ate = Date.now() + 7 * 86400000
    preferencia(conta.id, 'adiado', String(ate))
    adiado.value = { id: conta.id, ate }
  }
  return {
    estado,
    mensagem,
    permissao,
    suportado,
    exibirPrompt,
    adiar,
    ativar: () => sincronizarPush({ voluntario: true }),
    desativar: () => encerrarPush({ voluntario: true }),
  }
}
