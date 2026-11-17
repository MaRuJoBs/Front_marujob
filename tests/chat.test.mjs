import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { resolve } from 'node:path'

const storage = new Map()
globalThis.localStorage = {
  getItem: (k) => storage.get(k) ?? null,
  setItem: (k, v) => storage.set(k, v),
  removeItem: (k) => storage.delete(k),
}

const vite = await createServer({
  configFile: false,
  resolve: { alias: { '@': resolve('src') } },
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, watch: null, ws: false },
  appType: 'custom',
})
const load = (path) => vite.ssrLoadModule('/src/' + path)
const { default: api } = await load('services/api.js')
const urls = await load('features/chat/lib/urls.js')
const chatApi = await load('features/chat/services/chatApi.js')
const toastLib = await load('features/chat/composables/useChatToast.js')
const { ChatSocket, STATUS, CLOSE_UNAUTHORIZED } = await load('features/chat/lib/socketClient.js')

after(() => vite.close())

// ---- URLs ----

test('URL do WebSocket segue a base da API (http->ws, https->wss, relativa usa a página)', () => {
  assert.equal(
    urls.chatSocketUrl('a b', 'http://127.0.0.1:8000/api/'),
    'ws://127.0.0.1:8000/ws/chat/?token=a%20b',
  )
  assert.equal(
    urls.chatSocketUrl('t', 'https://marujob.example/api/'),
    'wss://marujob.example/ws/chat/?token=t',
  )
  assert.equal(
    urls.chatSocketUrl('t', '/api/', 'http://localhost:5173'),
    'ws://localhost:5173/ws/chat/?token=t',
  )
})

test('mídia relativa vira URL do backend; absoluta (Cloudinary) é mantida', () => {
  assert.equal(
    urls.mediaUrl('/media/users/a.jpg', 'http://127.0.0.1:8000/api/'),
    'http://127.0.0.1:8000/media/users/a.jpg',
  )
  assert.equal(
    urls.mediaUrl('https://res.cloudinary.com/x/a.jpg', 'http://127.0.0.1:8000/api/'),
    'https://res.cloudinary.com/x/a.jpg',
  )
  assert.equal(urls.mediaUrl(null), null)
})

// ---- REST ----

function captureRequests(responses) {
  const calls = []
  const original = api.defaults.adapter
  api.defaults.adapter = async (config) => {
    calls.push(config)
    const data = responses.shift() ?? {}
    return { data, status: 200, statusText: 'OK', headers: {}, config }
  }
  return { calls, restore: () => (api.defaults.adapter = original) }
}

test('rotas do chat ficam sob a base /api/ (sem barra inicial) e o contato envia a candidatura', async () => {
  localStorage.setItem('token', 'access-token')
  const { calls, restore } = captureRequests([{ id: 7 }])
  try {
    const room = await chatApi.openContact(42)
    assert.equal(room.id, 7)
    assert.equal(calls[0].url, 'chat/rooms/contact/')
    assert.equal(calls[0].method, 'post')
    assert.deepEqual(JSON.parse(calls[0].data), { candidatura: 42 })
    assert.equal(calls[0].headers.Authorization, 'Bearer access-token')
  } finally {
    restore()
  }
})

test('lista de conversas segue a paginação do DRF pelo campo next', async () => {
  const { calls, restore } = captureRequests([
    { results: [{ id: 1 }], next: 'http://x/api/chat/rooms/?page=2' },
    { results: [{ id: 2 }], next: null },
  ])
  try {
    const rooms = await chatApi.listRooms()
    assert.deepEqual(
      rooms.map((r) => r.id),
      [1, 2],
    )
    assert.deepEqual(
      calls.map((c) => c.params.page),
      [1, 2],
    )
  } finally {
    restore()
  }
})

// ---- toast ----

test('toast: fila com limite, sem duplicar o mesmo id e limpa no logout', () => {
  toastLib.clearToasts()
  const toast = toastLib.useChatToast()
  for (let i = 0; i < 6; i += 1) toast.error(`erro ${i}`)
  assert.equal(toastLib.toasts.length, 4)
  assert.equal(toastLib.toasts.at(-1).text, 'erro 5')

  toast.message({ id: 'm1', message: { author: 'Ana', preview: 'oi' } })
  toast.message({ id: 'm1', message: { author: 'Ana', preview: 'oi de novo' } })
  assert.equal(toastLib.toasts.filter((t) => t.id === 'm1').length, 1)

  toastLib.clearToasts()
  assert.equal(toastLib.toasts.length, 0)
})

// ---- WebSocket ----

class FakeSocket {
  static instances = []
  constructor(url) {
    this.url = url
    this.readyState = 0
    this.sent = []
    FakeSocket.instances.push(this)
  }
  send(data) {
    this.sent.push(JSON.parse(data))
  }
  close() {
    this.readyState = 3
  }
  open() {
    this.readyState = 1
    this.onopen?.()
  }
  closeWith(code) {
    this.readyState = 3
    this.onclose?.({ code })
  }
}

function makeSocket(options = {}) {
  FakeSocket.instances = []
  const statuses = []
  const socket = new ChatSocket({
    getToken: () => localStorage.getItem('token'),
    buildUrl: (token) => urls.chatSocketUrl(token, 'http://127.0.0.1:8000/api/'),
    onEvent: () => {},
    onStatus: (s) => statuses.push(s),
    WebSocketImpl: FakeSocket,
    setTimeoutImpl: () => 0,
    clearTimeoutImpl: () => {},
    ...options,
  })
  return { socket, statuses }
}

test('4401: renova o token uma vez e reconecta com o novo', async () => {
  localStorage.setItem('token', 'velho')
  let renovacoes = 0
  const { socket } = makeSocket({
    refreshToken: async () => {
      renovacoes += 1
      localStorage.setItem('token', 'novo')
      return 'novo'
    },
  })

  socket.connect()
  FakeSocket.instances[0].open()
  FakeSocket.instances[0].closeWith(CLOSE_UNAUTHORIZED)
  await new Promise((r) => setImmediate(r))

  assert.equal(renovacoes, 1)
  assert.equal(FakeSocket.instances.length, 2)
  assert.match(FakeSocket.instances[1].url, /token=novo$/)
  socket.close()
})

test('4401 sem conseguir renovar: para de tentar e fica como não autorizado', async () => {
  localStorage.setItem('token', 'velho')
  const { socket } = makeSocket({ refreshToken: async () => null })

  socket.connect()
  FakeSocket.instances[0].closeWith(CLOSE_UNAUTHORIZED)
  await new Promise((r) => setImmediate(r))

  assert.equal(socket.status, STATUS.UNAUTHORIZED)
  assert.equal(FakeSocket.instances.length, 1)
})

test('sem token não abre conexão', () => {
  localStorage.removeItem('token')
  const { socket } = makeSocket()
  socket.connect()
  assert.equal(FakeSocket.instances.length, 0)
  assert.equal(socket.status, STATUS.UNAUTHORIZED)
})
