// Regras da lista de conversas (/mensagens): prévia, vaga do chip, presença, filtro e subtítulo.
import { formatLastSeenFull, messagePreview } from './format'

// Tons da paleta roxa do MaruJob para o fundo do avatar sem foto. Todos com contraste AA para o texto.
const AVATAR_COLORS = [
  { background: '#6e4ab7', color: '#ffffff' },
  { background: '#4f2ba5', color: '#ffffff' },
  { background: '#8a5cc7', color: '#ffffff' },
  { background: '#5c3a8b', color: '#ffffff' },
  { background: '#7d3c98', color: '#ffffff' },
  { background: '#dfd1ee', color: '#4f2ba5' },
  { background: '#cdb8ec', color: '#3d2280' },
  { background: '#ead9f7', color: '#63369e' },
]

/** Cor estável por pessoa: o mesmo nome sempre gera a mesma cor (ignora maiúsculas e espaços nas pontas). */
export function avatarColor(name) {
  const key = String(name ?? '')
    .trim()
    .toLowerCase()
  let hash = 0

  for (const char of key) hash = (hash * 31 + char.codePointAt(0)) >>> 0

  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

/** Vaga de que trata a conversa: a da última mensagem (evento em tempo real), a da API ou a pendente. */
export function roomVaga(room) {
  return room?.last_message?.vaga || room?.vaga || room?.pending_vaga || null
}

/** Prévia da última mensagem; "Você: " quando a mensagem é minha. */
export function roomPreview(room) {
  const message = room?.last_message

  if (!message) return room?.pending_vaga ? 'Envie a primeira mensagem' : 'Sem mensagens'

  const mine = message.author && message.author.id !== room.other?.id && !message.is_deleted

  return `${mine ? 'Você: ' : ''}${messagePreview(message)}`
}

/** A outra pessoa está conectada? A presença em tempo real vence o que veio da API. */
export function isOnline(room, presence = {}) {
  const id = room?.other?.id

  if (id == null) return false

  return Boolean(presence[id]?.online ?? room.other.online)
}

/** Último acesso da outra pessoa: o da presença em tempo real ou o que veio da API. */
export function lastSeen(room, presence = {}) {
  const id = room?.other?.id

  if (id == null) return null

  return presence[id]?.last_seen ?? room.other.last_seen ?? null
}

/**
 * Linha abaixo do nome no cabeçalho da conversa: "digitando" > "@Profissão" > "online" >
 * "visto por último às HH:MM". Retorna { text, kind } (kind: typing | handle | online | seen | none).
 */
export function conversationStatus(room, { presence = {}, typing = false, now = new Date() } = {}) {
  if (typing) return { text: 'digitando', kind: 'typing' }

  const profissao = (room?.other?.profissao ?? '').trim()

  if (profissao) return { text: `@${profissao.replace(/\s+/g, '-')}`, kind: 'handle' }
  if (isOnline(room, presence)) return { text: 'online', kind: 'online' }

  const seen = formatLastSeenFull(lastSeen(room, presence), now)

  return seen ? { text: seen, kind: 'seen' } : { text: '', kind: 'none' }
}

/** Filtra por nome ou título da vaga e, na aba "Não lidas", só conversas com mensagens não lidas. */
export function filterRooms(rooms, { term = '', onlyUnread = false } = {}) {
  const query = term.trim().toLowerCase()

  return rooms.filter((room) => {
    if (onlyUnread && !(room.unread > 0)) return false
    if (!query) return true

    const vaga = roomVaga(room)?.titulo ?? ''

    return `${room.name} ${vaga}`.toLowerCase().includes(query)
  })
}

/** Subtítulo do cabeçalho: "2 não lidas" quando houver; senão "3 conversas". */
export function roomsSubtitle(rooms) {
  const unread = rooms.filter((room) => room.unread > 0).length

  if (unread) return `${unread} ${unread === 1 ? 'não lida' : 'não lidas'}`
  if (!rooms.length) return ''

  return `${rooms.length} ${rooms.length === 1 ? 'conversa' : 'conversas'}`
}
