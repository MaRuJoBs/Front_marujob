// Chamadas REST do chat. A instância `api` (src/services/api.js) já tem a base `.../api/`, envia o JWT
// e renova o token expirado; por isso as rotas aqui são relativas (`chat/rooms/`).
import api from '@/services/api'
import { sessao } from '@/services/authSession'

const unwrap = (response) => response.data

/** Todas as conversas do usuário (a API pagina com PageNumberPagination; segue o `next`). */
export async function listRooms({ signal, revision = sessao.revisao } = {}) {
  const rooms = []
  let page = 1

  for (;;) {
    const data = await api
      .get('chat/rooms/', { params: { page }, signal, _sessionRevision: revision })
      .then(unwrap)

    rooms.push(...(data.results ?? []))

    if (!data.next) return rooms

    page += 1
  }
}

export const getRoom = (roomId) => api.get(`chat/rooms/${roomId}/`).then(unwrap)

export const markRead = (roomId) =>
  api.post(`chat/rooms/${roomId}/read/`, undefined, { _sessionRevision: sessao.revisao })

export const listMessages = (roomId, before = null) =>
  api.get(`chat/rooms/${roomId}/messages/`, { params: before ? { before } : {} }).then(unwrap)

/** Texto (JSON) ou arquivo (multipart). Nunca os dois na mesma mensagem. */
export function sendMessage(roomId, { body = null, file = null, replyTo = null }) {
  if (file) {
    const form = new FormData()

    form.append('file', file)
    if (replyTo) form.append('reply_to', String(replyTo))

    // Força multipart: com o Content-Type JSON padrão o axios serializaria o FormData (e o arquivo se perderia).
    return api
      .post(`chat/rooms/${roomId}/messages/`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(unwrap)
  }

  return api.post(`chat/rooms/${roomId}/messages/`, { body, reply_to: replyTo }).then(unwrap)
}

/** Baixa o anexo como Blob (a rota exige o JWT, então não dá para usar <a href> direto). */
export const downloadFile = (messageId) =>
  api.get(`chat/messages/${messageId}/file/`, { responseType: 'blob' }).then(unwrap)

/**
 * "Conversar" de uma candidatura: cria (ou reaproveita) a conversa entre o freelancer e a empresa
 * dona da vaga. Única forma de iniciar uma conversa.
 */
export const openContact = (candidaturaId) =>
  api.post('chat/rooms/contact/', { candidatura: candidaturaId }).then(unwrap)

/** Descarta o cartão da vaga pendente (o usuário desistiu de anexá-lo à próxima mensagem). */
export const clearContext = (roomId) => api.delete(`chat/rooms/${roomId}/context/`)
