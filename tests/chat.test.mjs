import test, { after } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createPinia } from 'pinia'
import { resolve } from 'node:path'

const storage = new Map()
globalThis.localStorage = {
  getItem: (k) => storage.get(k) ?? null,
  setItem: (k, v) => storage.set(k, v),
  removeItem: (k) => storage.delete(k),
}

const vite = await createServer({
  configFile: false,
  plugins: [
    {
      name: 'chat-router-em-memoria',
      resolveId: (id) => (id === 'virtual:chat-router' ? '\0chat-router' : null),
      load: (id) => (id === '\0chat-router' ? 'export default { push() {} }' : null),
    },
  ],
  resolve: {
    alias: [
      { find: /^@\/router$/, replacement: 'virtual:chat-router' },
      { find: '@', replacement: resolve('src') },
    ],
  },
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
const roomList = await load('features/chat/lib/roomList.js')

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

// ---- Lista de conversas ----

const vagaCard = (id, titulo) => ({ id, titulo, status: 'publicada', modalidade: 'Remoto' })
const listRoom = (extra = {}) => ({
  id: 1,
  name: 'Diego Santana',
  other: { id: 2, name: 'Diego Santana', online: false },
  unread: 0,
  last_message: null,
  pending_vaga: null,
  vaga: null,
  ...extra,
})

test('avatar: cor estável por nome, da paleta roxa, e varia entre pessoas', () => {
  const diego = roomList.avatarColor('Diego Santana')

  assert.deepEqual(roomList.avatarColor('  diego santana '), diego)
  assert.match(diego.background, /^#[0-9a-f]{6}$/)
  assert.match(diego.color, /^#[0-9a-f]{6}$/)

  const nomes = [
    'Ana',
    'Bia Tech',
    'Carla',
    'Diego',
    'Studio Ônix',
    'Nova Labs',
    'Bruno',
    'Mariana',
  ]
  const cores = new Set(nomes.map((nome) => roomList.avatarColor(nome).background))

  assert.ok(cores.size > 1, 'todas as pessoas ficaram com a mesma cor')
  assert.ok(roomList.avatarColor('').background)
  assert.ok(roomList.avatarColor(null).background)
})

test('chip da vaga: última mensagem com cartão, depois o campo vaga da API, depois a pendente', () => {
  assert.equal(roomList.roomVaga(listRoom()), null)
  assert.equal(
    roomList.roomVaga(listRoom({ pending_vaga: vagaCard(1, 'Pendente') })).titulo,
    'Pendente',
  )
  assert.equal(
    roomList.roomVaga(listRoom({ vaga: vagaCard(2, 'API'), pending_vaga: vagaCard(1, 'Pendente') }))
      .titulo,
    'API',
  )
  assert.equal(
    roomList.roomVaga(
      listRoom({ vaga: vagaCard(2, 'API'), last_message: { id: 9, vaga: vagaCard(3, 'Nova') } }),
    ).titulo,
    'Nova',
  )
})

test('prévia: "Você: " só nas minhas mensagens; vazia mostra o convite', () => {
  const dele = { id: 1, author: { id: 2 }, body: 'Oi!', is_deleted: false }
  const minha = { id: 2, author: { id: 80 }, body: 'Olá', is_deleted: false }
  const apagada = { id: 3, author: { id: 80 }, body: null, is_deleted: true }

  assert.equal(roomList.roomPreview(listRoom({ last_message: dele })), 'Oi!')
  assert.equal(roomList.roomPreview(listRoom({ last_message: minha })), 'Você: Olá')
  assert.equal(roomList.roomPreview(listRoom({ last_message: apagada })), 'Mensagem apagada')
  assert.equal(roomList.roomPreview(listRoom()), 'Sem mensagens')
  assert.equal(
    roomList.roomPreview(listRoom({ pending_vaga: vagaCard(1, 'X') })),
    'Envie a primeira mensagem',
  )
})

test('online: presença em tempo real vence o valor da API', () => {
  const room = listRoom({ other: { id: 2, online: true } })

  assert.equal(roomList.isOnline(room), true)
  assert.equal(roomList.isOnline(room, { 2: { online: false } }), false)
  assert.equal(roomList.isOnline(listRoom(), { 2: { online: true } }), true)
  assert.equal(roomList.isOnline(listRoom({ other: null })), false)
})

test('filtro: busca por nome ou vaga e aba "Não lidas"', () => {
  const rooms = [
    listRoom({ id: 1, name: 'Diego', unread: 2, vaga: vagaCard(1, 'Desenvolvedor Vue') }),
    listRoom({ id: 2, name: 'Mariana', unread: 0, vaga: vagaCard(2, 'Designer') }),
    listRoom({ id: 3, name: 'Tech', unread: 1 }),
  ]
  const ids = (list) => list.map((room) => room.id)

  assert.deepEqual(ids(roomList.filterRooms(rooms)), [1, 2, 3])
  assert.deepEqual(ids(roomList.filterRooms(rooms, { onlyUnread: true })), [1, 3])
  assert.deepEqual(ids(roomList.filterRooms(rooms, { term: '  MARI ' })), [2])
  assert.deepEqual(ids(roomList.filterRooms(rooms, { term: 'vue' })), [1])
  assert.deepEqual(ids(roomList.filterRooms(rooms, { term: 'designer', onlyUnread: true })), [])
})

test('subtítulo: não lidas quando houver, senão total de conversas', () => {
  assert.equal(roomList.roomsSubtitle([]), '')
  assert.equal(roomList.roomsSubtitle([listRoom()]), '1 conversa')
  assert.equal(roomList.roomsSubtitle([listRoom(), listRoom(), listRoom()]), '3 conversas')
  assert.equal(roomList.roomsSubtitle([listRoom({ unread: 4 }), listRoom()]), '1 não lida')
  assert.equal(
    roomList.roomsSubtitle([listRoom({ unread: 4 }), listRoom({ unread: 1 }), listRoom()]),
    '2 não lidas',
  )
})

test('cabeçalho: digitando > @profissão > online > visto por último', () => {
  const now = new Date(2026, 10, 20, 18, 0)
  const hoje = new Date(2026, 10, 20, 14, 5).toISOString()
  const ontem = new Date(2026, 10, 19, 9, 30).toISOString()
  const antiga = new Date(2026, 9, 3, 9, 30).toISOString()
  const room = (other) => listRoom({ other: { id: 2, online: false, ...other } })
  const status = (r, opts = {}) => roomList.conversationStatus(r, { now, ...opts })

  assert.deepEqual(status(room({ profissao: 'Web Developer' }), { typing: true }), {
    text: 'digitando',
    kind: 'typing',
  })
  assert.deepEqual(status(room({ profissao: ' Web Developer ', online: true })), {
    text: '@Web-Developer',
    kind: 'handle',
  })
  assert.equal(status(room({ online: true })).text, 'online')
  assert.equal(status(room({}), { presence: { 2: { online: true } } }).text, 'online')
  assert.equal(status(room({ last_seen: hoje })).text, 'visto por último às 14:05')
  assert.equal(status(room({ last_seen: ontem })).text, 'visto por último ontem às 09:30')
  assert.equal(status(room({ last_seen: antiga })).text, 'visto por último em 03/10')
  assert.equal(
    status(room({ last_seen: antiga }), { presence: { 2: { online: false, last_seen: hoje } } })
      .text,
    'visto por último às 14:05',
  )
  assert.deepEqual(status(room({})), { text: '', kind: 'none' })
})

test('contagem do chat preserva eventos mais recentes, reúne consultas e limpa a sessão', async () => {
  const { useChatStore } = await load('features/chat/stores/chat.js')
  const { sessao, limparSessao } = await load('services/authSession.js')
  const previousWebSocket = globalThis.WebSocket
  const previousAdapter = api.defaults.adapter
  const sockets = []
  const pending = []
  const pendingReads = []
  const pendingOlder = []
  globalThis.document = {
    visibilityState: 'visible',
    addEventListener() {},
    removeEventListener() {},
  }
  globalThis.WebSocket = class {
    constructor() {
      sockets.push(this)
    }
    close() {}
    emit(event) {
      this.onmessage({ data: JSON.stringify(event) })
    }
  }
  api.defaults.adapter = (config) => {
    const response = (data, status = 200) => ({ data, status, headers: {}, config })
    if (config.url === 'chat/rooms/42/messages/') {
      if (config.params.before) {
        return new Promise((resolve) =>
          pendingOlder.push(() => resolve(response({ results: [{ id: 8 }] }))),
        )
      }
      return Promise.resolve(response({ results: [{ id: 9 }], has_more: true, next_before: 9 }))
    }
    if (config.url === 'chat/rooms/42/read/' && config.method === 'post') {
      return new Promise((resolve) => pendingReads.push(() => resolve(response(undefined, 204))))
    }
    assert.equal(config.url, 'chat/rooms/')
    return new Promise((resolve) =>
      pending.push((rooms) => resolve(response({ results: rooms, next: null }))),
    )
  }
  const chat = useChatStore(createPinia())
  try {
    sessao.usuario = { id: 1 }
    localStorage.setItem('token', 'token-simulado')
    const primeira = chat.start()
    const simultanea = chat.loadRooms()
    sockets[0].emit({ type: 'room.updated', room: 42, summary: { id: 42, unread: 3 } })
    assert.equal(chat.unreadTotal, 3)
    await new Promise((resolve) => setImmediate(resolve))
    assert.equal(pending.length, 1)
    pending.shift()([{ id: 42, unread: 1 }])
    await Promise.all([primeira, simultanea])
    assert.equal(chat.unreadTotal, 3)
    assert.equal(chat.rooms.length, 1)

    await chat.openRoom(42)
    await chat.openRoom(42)
    assert.equal(pendingReads.length, 1)
    assert.equal(chat.unreadTotal, 3)
    sockets[0].emit({ type: 'room.updated', room: 42, summary: { id: 42, unread: 1 } })
    pendingReads.shift()()
    await new Promise((resolve) => setImmediate(resolve))
    assert.equal(chat.unreadTotal, 1)
    assert.equal(pendingReads.length, 1)
    pendingReads.shift()()
    await new Promise((resolve) => setImmediate(resolve))
    assert.equal(chat.unreadTotal, 0)
    const paginaAntiga = chat.loadOlder()
    chat.closeRoom()

    const antiga = chat.loadRooms()
    await new Promise((resolve) => setImmediate(resolve))
    limparSessao()
    chat.stop()
    sessao.usuario = { id: 2 }
    assert.equal(chat.unreadTotal, 0)
    pending.shift()([{ id: 42, unread: 7 }])
    await antiga
    pendingOlder.shift()()
    assert.equal(await paginaAntiga, false)
    assert.deepEqual(chat.rooms, [])
  } finally {
    chat.stop()
    limparSessao()
    api.defaults.adapter = previousAdapter
    globalThis.WebSocket = previousWebSocket
    delete globalThis.document
  }
})
