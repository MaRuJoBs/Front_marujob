import { defineStore } from 'pinia'
import { computed, reactive, ref } from 'vue'
import router from '@/router'
import { renovarAccessToken } from '@/services/api'
import { obterAccessToken, sessao } from '@/services/authSession'
import { clearAttachmentCache } from '../composables/useAttachment'
import { clearToasts, useChatToast } from '../composables/useChatToast'
import {
  applyEvent,
  createState,
  prependHistory,
  pruneTyping,
  setHistory,
  setRooms,
  sortedRooms,
  totalUnread,
  typingUsers,
} from '../lib/chatState'
import { apiErrorMessage } from '../lib/errors'
import { messagePreview } from '../lib/format'
import { ChatSocket, STATUS } from '../lib/socketClient'
import { chatSocketUrl } from '../lib/urls'
import * as chatApi from '../services/chatApi'

const TYPING_SEND_INTERVAL_MS = 2500

/**
 * Renova o access token pelo mesmo fluxo do interceptor do axios (src/services/api.js), que já
 * evita renovações paralelas e limpa a sessão se o refresh for recusado. null = não deu.
 */
const refreshAccessToken = () => renovarAccessToken().catch(() => null)

export const useChatStore = defineStore('chatStore', () => {
  const toast = useChatToast()

  const state = reactive(createState())
  const activeRoomId = ref(null)
  const connection = ref(STATUS.IDLE)
  const loadingRooms = ref(false)
  const roomsLoaded = ref(false) // true depois da primeira tentativa de carregar as conversas
  const roomsError = ref('')
  const loadingHistory = ref(false)
  const historyError = ref('')
  const now = ref(Date.now())
  // Mensagens de texto enviadas e ainda não confirmadas pelo servidor: conversa -> [mensagem provisória].
  const pending = reactive({})
  let pendingSeq = 0

  let socket = null
  let ticker = null
  let hasOpenedBefore = false
  let lastTypingSentAt = 0
  let started = false
  let roomsRequest = null
  const readRequests = new Map()

  // Usuário logado, no formato das mensagens do chat.
  const me = computed(() => {
    const user = sessao.usuario

    if (!user?.id) return null

    return { id: user.id, name: user.name || 'Usuário', avatar: user.profile_image || null }
  })

  const rooms = computed(() => sortedRooms(state))
  const activeRoom = computed(() => state.rooms[activeRoomId.value] ?? null)
  const activeMessages = computed(() => {
    const entry = state.messages[activeRoomId.value] ?? null
    const queue = pending[activeRoomId.value]

    return entry && queue?.length ? { ...entry, items: [...entry.items, ...queue] } : entry
  })
  const unreadTotal = computed(() => totalUnread(state))
  const typingNow = computed(() => typingUsers(state, activeRoomId.value, now.value))
  const isConnected = computed(() => connection.value === STATUS.OPEN)

  // O outro participante da conversa ativa, no formato que os tiques de leitura esperam.
  const activeMembers = computed(() => {
    const other = activeRoom.value?.other

    return other
      ? [
          {
            user: { id: other.id, name: other.name },
            online: other.online,
            last_seen: other.last_seen,
          },
        ]
      : []
  })

  // ---- ciclo de vida ----

  /** Liga o chat: carrega as conversas por REST e abre o WebSocket. */
  async function start() {
    if (started) return

    started = true
    socket = new ChatSocket({
      getToken: obterAccessToken,
      refreshToken: refreshAccessToken,
      buildUrl: (token) => chatSocketUrl(token),
      onEvent: handleEvent,
      onStatus: (status) => {
        connection.value = status
      },
      onOpen: handleOpen,
    })
    ticker = setInterval(() => {
      now.value = Date.now()
      pruneTyping(state, now.value)
    }, 1000)
    document.addEventListener('visibilitychange', markActiveRead)

    socket.connect()
    await loadRooms()
  }

  /** Desliga o chat e limpa tudo (nada de um usuário pode sobrar para o próximo). */
  function stop() {
    started = false
    roomsRequest?.controller.abort()
    roomsRequest = null
    readRequests.clear()
    loadingRooms.value = false
    loadingHistory.value = false
    hasOpenedBefore = false
    socket?.close()
    socket = null
    clearInterval(ticker)
    document.removeEventListener('visibilitychange', markActiveRead)

    Object.assign(state, createState())
    clearAttachmentCache()
    clearToasts()
    for (const key of Object.keys(pending)) delete pending[key]

    activeRoomId.value = null
    connection.value = STATUS.IDLE
    roomsLoaded.value = false
    roomsError.value = ''
    historyError.value = ''
  }

  function retryConnection() {
    socket?.reconnectNow()
  }

  async function handleOpen() {
    const currentSocket = socket
    const reconnected = hasOpenedBefore

    hasOpenedBefore = true

    // Na primeira conexão start() já carregou tudo (se o REST falhou, tenta de novo agora).
    // Nas seguintes pode ter havido mensagens perdidas enquanto estava offline.
    if (!reconnected && !roomsError.value) return

    await loadRooms()

    if (
      socket === currentSocket &&
      reconnected &&
      activeRoomId.value &&
      state.rooms[activeRoomId.value]
    ) {
      await loadHistory(activeRoomId.value, { reset: true })
      if (socket === currentSocket) markActiveRead()
    }
  }

  function addPending(roomId, body, replyToId) {
    const source = replyToId ? state.messages[roomId]?.items.find((m) => m.id === replyToId) : null
    const card = state.rooms[roomId]?.pending_vaga ?? null
    const item = {
      id: -(pendingSeq += 1),
      room: roomId,
      author: { id: me.value.id, name: me.value.name, avatar: me.value.avatar ?? null },
      body,
      file: null,
      created: new Date().toISOString(),
      edited_at: null,
      is_deleted: false,
      read: false,
      pending: true,
      vaga: card,
      reply_to: source
        ? {
            id: source.id,
            author: source.author,
            body: source.body,
            is_deleted: source.is_deleted,
            has_file: Boolean(source.file),
          }
        : null,
    }

    ;(pending[roomId] ??= []).push(item)

    return item
  }

  function removePending(roomId, id) {
    const queue = pending[roomId]
    const index = queue ? queue.findIndex((item) => item.id === id) : -1

    if (index >= 0) queue.splice(index, 1)

    return index >= 0
  }

  function handleEvent(original) {
    let event = original

    if (event.type === 'room.updated' || event.type === 'room.removed') {
      roomsRequest?.changedRooms.add(String(event.room))
    }

    // A confirmação do servidor "assenta" a mensagem provisória (mesmo elemento, sem recriar).
    if (event.type === 'message.new' && event.message?.author?.id === me.value?.id) {
      const queue = pending[event.room]
      const index = queue ? queue.findIndex((item) => item.body === event.message.body) : -1

      if (index >= 0) {
        const [item] = queue.splice(index, 1)

        event = { ...event, message: { ...event.message, _key: item.id } }
      }
    }

    const effects = applyEvent(state, event, {
      meId: me.value?.id ?? null,
      activeRoomId: activeRoomId.value,
      visible: document.visibilityState === 'visible',
    })

    for (const effect of effects) {
      if (effect.type === 'read') markActiveRead()
      if (effect.type === 'removed') handleRemoved(effect.room)
      if (effect.type === 'notify') notifyMessage(effect.room, effect.message)
      if (effect.type === 'error') {
        if (activeRoomId.value != null) pending[activeRoomId.value] = []
        toast.error(effect.detail || 'Ação não permitida.')
      }
    }
  }

  /** Aviso com a prévia da mensagem; clicar leva à conversa. */
  function notifyMessage(roomId, message) {
    const author = message.author?.name ?? state.rooms[roomId]?.name ?? 'Alguém'

    toast.message({
      id: `chat-message-${message.id}`,
      message: {
        author,
        avatar: message.author?.avatar ?? null,
        preview: messagePreview(message),
      },
      onClick: () => router.push({ name: 'mensagens', query: { room: String(roomId) } }),
    })
  }

  function handleRemoved(roomId) {
    if (activeRoomId.value === roomId) activeRoomId.value = null
  }

  // ---- conversas ----

  function loadRooms() {
    if (!started || !me.value) return
    if (roomsRequest) return roomsRequest.promise

    const controller = new AbortController()
    const revision = sessao.revisao
    const changedRooms = new Set()
    const userId = me.value.id
    const current = () =>
      !controller.signal.aborted && revision === sessao.revisao && userId === me.value?.id

    loadingRooms.value = true
    roomsError.value = ''

    const promise = chatApi
      .listRooms({ signal: controller.signal, revision })
      .then((result) => {
        if (!current()) return
        const unchanged = result.filter((room) => !changedRooms.has(String(room.id)))
        const updated = [...changedRooms].map((id) => state.rooms[id]).filter(Boolean)
        setRooms(state, [...unchanged, ...updated])
        markActiveRead()
      })
      .catch((error) => {
        if (!current()) return
        const status = error?.response?.status
        roomsError.value =
          status === 401
            ? 'Sua sessão expirou. Entre novamente para ver as mensagens.'
            : status === 403
              ? 'Sua conta não tem permissão para acessar as mensagens.'
              : apiErrorMessage(error, 'Não foi possível carregar as conversas.')
      })
      .finally(() => {
        if (roomsRequest?.controller !== controller) return
        roomsRequest = null
        if (!current()) return
        loadingRooms.value = false
        roomsLoaded.value = true
      })
    roomsRequest = { controller, promise, changedRooms }
    return promise
  }

  /**
   * "Conversar" em uma candidatura: cria ou reaproveita a conversa com a outra parte
   * e deixa o cartão da vaga pendente para a próxima mensagem. Devolve a conversa.
   */
  async function contactCandidatura(candidaturaId) {
    const currentSocket = socket
    const room = await chatApi.openContact(candidaturaId)
    if (socket !== currentSocket) throw new Error('A sessão foi alterada.')

    state.rooms[room.id] = room

    return room
  }

  async function openRoom(roomId) {
    const currentSocket = socket
    activeRoomId.value = roomId

    if (roomId == null) return

    if (!state.rooms[roomId]) {
      // Link direto/atualização da página: a lista ainda pode não ter chegado.
      try {
        const room = await chatApi.getRoom(roomId)
        if (socket !== currentSocket || activeRoomId.value !== roomId) return
        state.rooms[roomId] = room
      } catch {
        if (socket !== currentSocket || activeRoomId.value !== roomId) return
        activeRoomId.value = null
        historyError.value = 'Conversa não encontrada.'

        return
      }
    }

    if (!state.messages[roomId]?.loaded) await loadHistory(roomId)

    if (socket === currentSocket && activeRoomId.value === roomId) markActiveRead()
  }

  function closeRoom() {
    activeRoomId.value = null
  }

  async function loadHistory(roomId, { reset = false } = {}) {
    const currentSocket = socket
    loadingHistory.value = true
    historyError.value = ''

    try {
      const page = await chatApi.listMessages(roomId)
      if (socket !== currentSocket) return

      if (reset && state.messages[roomId]) state.messages[roomId].items = []

      setHistory(state, roomId, page)
    } catch (error) {
      if (socket !== currentSocket) return
      if (activeRoomId.value === roomId) {
        historyError.value = apiErrorMessage(error, 'Não foi possível carregar as mensagens.')
      }

      // 404: a conversa deixou de existir para este usuário.
      if (error?.response?.status === 404) handleEvent({ type: 'room.removed', room: roomId })
    } finally {
      if (socket === currentSocket) loadingHistory.value = false
    }
  }

  async function loadOlder() {
    const currentSocket = socket
    const roomId = activeRoomId.value
    const entry = state.messages[roomId]

    if (!entry?.hasMore || loadingHistory.value) return false

    loadingHistory.value = true

    try {
      const page = await chatApi.listMessages(roomId, entry.nextBefore)
      if (socket !== currentSocket || state.messages[roomId] !== entry) return false
      prependHistory(state, roomId, page)

      return true
    } catch (error) {
      if (socket === currentSocket) {
        toast.error(apiErrorMessage(error, 'Não foi possível carregar mensagens anteriores.'))
      }

      return false
    } finally {
      if (socket === currentSocket) loadingHistory.value = false
    }
  }

  async function markActiveRead() {
    const roomId = activeRoomId.value
    if (roomId == null || document.visibilityState !== 'visible' || readRequests.has(roomId)) return

    const room = state.rooms[roomId]
    if (!room || !(room.unread > 0) || !state.messages[roomId]?.loaded) return

    const request = Symbol()
    let lerAtualizacao = false
    readRequests.set(roomId, request)
    try {
      await chatApi.markRead(roomId)
      if (readRequests.get(roomId) !== request) return

      if (state.rooms[roomId] === room) {
        room.unread = 0
        roomsRequest?.changedRooms.add(String(roomId))
      } else {
        // Um resumo recebido durante a leitura pode incluir mensagens posteriores.
        lerAtualizacao = activeRoomId.value === roomId && state.rooms[roomId]?.unread > 0
      }
    } catch {
      // Mantém a contagem e permite tentar de novo ao reabrir a conversa.
    } finally {
      if (readRequests.get(roomId) === request) readRequests.delete(roomId)
    }

    if (lerAtualizacao) markActiveRead()
  }

  /** O usuário desistiu de anexar o cartão da vaga à próxima mensagem. */
  async function dismissContext(roomId) {
    const currentSocket = socket
    const room = state.rooms[roomId]
    const previous = room?.pending_vaga ?? null

    if (!room || !previous) return

    room.pending_vaga = null

    try {
      await chatApi.clearContext(roomId)
    } catch (error) {
      if (socket !== currentSocket) return
      room.pending_vaga = previous
      toast.error(apiErrorMessage(error))
    }
  }

  // ---- mensagens ----

  /** Texto: pelo WebSocket quando conectado; senão pelo REST (que também notifica os demais). */
  async function sendText(body, replyTo = null) {
    const currentSocket = socket
    const roomId = activeRoomId.value
    const text = body.trim()

    if (!roomId || !text || !me.value) return false

    const item = addPending(roomId, text, replyTo)

    if (
      socket?.send({
        action: 'send',
        room: roomId,
        body: text,
        ...(replyTo ? { reply_to: replyTo } : {}),
      })
    ) {
      // Sem confirmação em 20 s: tira a mensagem provisória e avisa.
      setTimeout(() => {
        if (removePending(roomId, item.id)) {
          toast.error('Não foi possível confirmar o envio da mensagem.')
        }
      }, 20_000)

      return true
    }

    try {
      const message = await chatApi.sendMessage(roomId, { body: text, replyTo })

      if (socket !== currentSocket) return false
      handleEvent({ type: 'message.new', room: roomId, message })
      removePending(roomId, item.id)

      return true
    } catch (error) {
      if (socket !== currentSocket) return false
      removePending(roomId, item.id)
      toast.error(apiErrorMessage(error))

      return false
    }
  }

  async function sendFile(file, replyTo = null) {
    const currentSocket = socket
    const roomId = activeRoomId.value

    if (!roomId || !file) return false

    try {
      const message = await chatApi.sendMessage(roomId, { file, replyTo })

      if (socket !== currentSocket) return false
      handleEvent({ type: 'message.new', room: roomId, message })

      return true
    } catch (error) {
      if (socket === currentSocket) {
        toast.error(apiErrorMessage(error, 'Não foi possível enviar o arquivo.'))
      }

      return false
    }
  }

  function editMessage(messageId, body) {
    return requireSocket({ action: 'edit', room: activeRoomId.value, message_id: messageId, body })
  }

  function deleteMessage(messageId) {
    return requireSocket({ action: 'delete', room: activeRoomId.value, message_id: messageId })
  }

  function requireSocket(payload) {
    if (socket?.send(payload)) return true

    toast.error('Sem conexão com o chat. Tente novamente em instantes.')

    return false
  }

  /** Avisa que o usuário está digitando (no máximo uma vez a cada 2,5 s). */
  function notifyTyping() {
    const roomId = activeRoomId.value
    const current = Date.now()

    if (!roomId || current - lastTypingSentAt < TYPING_SEND_INTERVAL_MS) return

    lastTypingSentAt = current
    socket?.send({ action: 'typing', room: roomId })
  }

  return {
    // estado
    me,
    activeRoomId,
    connection,
    loadingRooms,
    roomsError,
    roomsLoaded,
    loadingHistory,
    historyError,
    presence: computed(() => state.presence),
    // derivados
    rooms,
    activeRoom,
    activeMembers,
    activeMessages,
    unreadTotal,
    typingNow,
    isConnected,
    // ações
    start,
    stop,
    retryConnection,
    loadRooms,
    contactCandidatura,
    openRoom,
    closeRoom,
    loadHistory,
    loadOlder,
    dismissContext,
    sendText,
    sendFile,
    editMessage,
    deleteMessage,
    notifyTyping,
  }
})
