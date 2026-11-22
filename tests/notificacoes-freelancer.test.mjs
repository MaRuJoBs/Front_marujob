import test, { after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createPinia } from 'pinia'

const vite = await createServer({
  configFile: false,
  optimizeDeps: { noDiscovery: true },
  server: { middlewareMode: true, watch: null, ws: false },
  appType: 'custom',
})
after(() => vite.close())
const load = (file) => vite.ssrLoadModule('/src/' + file)
const { default: api } = await load('services/api.js')
const { sessao, limparSessao } = await load('services/authSession.js')
const { logout } = await load('services/authService.js')
const { protegerRota } = await load('router/authGuard.js')
const { routes } = await load('router/routes.js')
const { useNotificacoesFreelancer } = await load('stores/notificacoesFreelancer.js')
const { usePushNotifications, sincronizarPush, cancelarSincronizacaoPush, decodificarVapid } =
  await load('composables/usePushNotifications.js')

const storage = new Map()
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
}
const chave = Buffer.concat([Buffer.of(4), Buffer.alloc(64)]).toString('base64url')
const endpoint = 'https://fcm.googleapis.com/fcm/send/teste'
const subscriptionJson = {
  endpoint,
  keys: { p256dh: 'chave', auth: 'segredo' },
  expirationTime: null,
}
let chamadas, transporte, subscription, solicitacoes, criadas, removidas

function autenticar(id = 1, tipo = 'usuario') {
  localStorage.setItem('token', 'token-' + id)
  sessao.usuario = { id }
  sessao.tipo = tipo
}

beforeEach(() => {
  limparSessao()
  storage.clear()
  chamadas = []
  transporte = (config) => {
    if (config.url === 'push/vapid-public-key/') return { publicKey: chave }
    if (config.url === 'push/subscriptions/') return null
    throw new Error('Requisição inesperada ' + config.url)
  }
  api.defaults.adapter = async (config) => {
    chamadas.push(config)
    return { config, status: 200, data: await transporte(config), headers: {} }
  }
  subscription = null
  solicitacoes = criadas = removidas = 0
  const registro = {
    pushManager: {
      getSubscription: async () => subscription,
      async subscribe(options) {
        criadas++
        assert.equal(options.userVisibleOnly, true)
        assert.deepEqual(options.applicationServerKey, decodificarVapid(chave))
        subscription = {
          endpoint,
          options,
          toJSON: () => subscriptionJson,
          async unsubscribe() {
            removidas++
            subscription = null
            return true
          },
        }
        return subscription
      },
    },
  }
  globalThis.isSecureContext = true
  globalThis.PushManager = class {}
  globalThis.Notification = {
    permission: 'default',
    async requestPermission() {
      solicitacoes++
      return this.permission
    },
  }
  Object.defineProperty(navigator, 'serviceWorker', {
    configurable: true,
    value: { ready: Promise.resolve(registro), getRegistration: async () => registro },
  })
  cancelarSincronizacaoPush()
})

test('central usa o guard existente e é exclusiva do freelancer', async () => {
  const rota = { ...routes.find(({ path }) => path === '/notificacoes'), query: {} }
  assert.equal((await protegerRota(rota)).name, 'login')
  autenticar(2, 'empresa')
  assert.equal((await protegerRota(rota)).path, '/homeEmpresa')
  sessao.tipo = 'usuario'
  assert.equal(await protegerRota(rota), true)
})

test('histórico paginado, contagem e leitura persistida usam os contratos da B60', async () => {
  autenticar()
  const store = useNotificacoesFreelancer(createPinia())
  let registros = [
    { id: 42, lida: false },
    { id: 43, lida: false },
  ]
  transporte = ({ method, params }) => {
    if (method === 'patch')
      registros = registros.map((r) => (r.id === 42 ? { ...r, lida: true } : r))
    if (method === 'post') registros = registros.map((r) => ({ ...r, lida: true }))
    if (method !== 'get') return null
    if (params.lida === false) return { count: registros.filter((r) => !r.lida).length }
    const page = params.page
    return { results: registros.slice(page - 1, page), next: page === 1 ? '?page=2' : null }
  }
  await Promise.all([store.carregar(), store.atualizarContagem()])
  assert.equal(store.total, 2)
  assert.equal(store.temProxima, true)
  await store.marcarLida(42)
  assert.equal(store.total, 1)
  assert.deepEqual(store.itens, [{ id: 42, lida: true }])
  assert.ok(
    chamadas.some(
      ({ url, method, data }) =>
        method === 'patch' &&
        url === 'notificacoes-freelancer/42/marcar-lida/' &&
        data === undefined,
    ),
  )
  await store.carregar(2)
  assert.equal(store.itens[0].id, 43)
  await store.marcarLida()
  assert.equal(store.total, 0)
  assert.ok(
    chamadas.some(
      ({ url, method, data }) =>
        method === 'post' &&
        url === 'notificacoes-freelancer/marcar-todas-lidas/' &&
        data === undefined,
    ),
  )
  const reaberta = useNotificacoesFreelancer(createPinia())
  await reaberta.carregar()
  assert.deepEqual(reaberta.itens, [{ id: 42, lida: true }])
})

test('resposta antiga não repopula o histórico nem o contador após troca de conta', async () => {
  autenticar()
  const store = useNotificacoesFreelancer(createPinia())
  const lista = Promise.withResolvers()
  const badge = Promise.withResolvers()
  transporte = ({ params }) => (params.lida === false ? badge.promise : lista.promise)
  const pedido = Promise.all([store.carregar(), store.atualizarContagem()])
  await new Promise(setImmediate)
  limparSessao()
  store.limpar()
  autenticar(2)
  lista.resolve({ results: [{ id: 42 }] })
  badge.resolve({ count: 4 })
  await pedido
  assert.deepEqual(store.itens, [])
  assert.equal(store.total, null)
})

test('Push é opcional em contexto inseguro, sem API e com permissão negada', async () => {
  autenticar()
  globalThis.isSecureContext = false
  assert.equal(usePushNotifications().suportado, false)
  await sincronizarPush({ voluntario: true })
  globalThis.isSecureContext = true
  const pushManager = globalThis.PushManager
  delete globalThis.PushManager
  assert.equal(usePushNotifications().suportado, false)
  await sincronizarPush({ voluntario: true })
  globalThis.PushManager = pushManager
  Notification.permission = 'denied'
  await sincronizarPush({ voluntario: true })
  assert.equal(solicitacoes, 0)
  assert.equal(chamadas.length, 0)
})

test('pede permissão somente no clique e registra a inscrição como freelancer', async () => {
  autenticar()
  await sincronizarPush()
  assert.equal(solicitacoes, 0)
  Notification.requestPermission = async () => {
    solicitacoes++
    Notification.permission = 'granted'
    return 'granted'
  }
  const pedido = sincronizarPush({ voluntario: true })
  assert.equal(solicitacoes, 1)
  await pedido
  await sincronizarPush({ verificar: true })
  assert.equal(criadas, 1)
  assert.deepEqual(
    chamadas.map((c) => c.method),
    ['get', 'post'],
  )
  assert.equal(chamadas[0].headers.Authorization, undefined)
  assert.equal(chamadas[1].headers.Authorization, 'Bearer token-1')
  assert.deepEqual(JSON.parse(chamadas[1].data), subscriptionJson)
  assert.equal(usePushNotifications().estado.value, 'ativo')
})

test('logout remove o endpoint com JWT anterior e cancela localmente mesmo offline', async () => {
  autenticar()
  Notification.permission = 'granted'
  await sincronizarPush()
  const online = transporte
  transporte = (config) => {
    if (config.method === 'delete') throw new Error('Offline')
    return online(config)
  }
  await logout()
  const ultima = chamadas.at(-1)
  assert.equal(ultima.method, 'delete')
  assert.equal(ultima.headers.Authorization, 'Bearer token-1')
  assert.deepEqual(JSON.parse(ultima.data), { endpoint })
  assert.equal(removidas, 1)
  assert.equal(sessao.usuario, null)
  assert.equal(localStorage.getItem('token'), null)
})

test('logout interrompe uma permissão do navegador ainda sem resposta', async () => {
  autenticar()
  const prompt = Promise.withResolvers()
  Notification.requestPermission = () => prompt.promise
  const pedido = sincronizarPush({ voluntario: true })
  await new Promise(setImmediate)
  await logout()
  prompt.resolve('granted')
  await pedido
  assert.equal(chamadas.length, 0)
  assert.equal(sessao.usuario, null)
})

test('desativação voluntária impede novo cadastro automático na mesma conta', async () => {
  autenticar()
  Notification.permission = 'granted'
  const push = usePushNotifications()
  await sincronizarPush()
  await push.desativar()
  await sincronizarPush({ verificar: true })
  assert.deepEqual(
    chamadas.map((c) => c.method),
    ['get', 'post', 'delete'],
  )
  assert.equal(removidas, 1)
  await push.ativar()
  assert.equal(criadas, 2)
})
