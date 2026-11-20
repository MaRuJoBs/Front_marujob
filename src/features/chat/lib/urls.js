// URLs do chat derivadas da mesma base da API usada em src/services/api.js (VITE_API_URL, ex.:
// http://127.0.0.1:8000/api/, ou a relativa /api/). Funções puras: recebem a base explicitamente
// para poderem ser testadas fora do Vite.

const ABSOLUTE = /^(?:[a-z][a-z\d+.-]*:)?\/\//i

/** Base da API vinda do ambiente (mesmo padrão de src/services/api.js). */
export function configuredApiUrl() {
  return import.meta.env?.VITE_API_URL || '/api/'
}

/** Origem (esquema + host) do backend. Se a API for relativa (`/api/`), usa a origem da página. */
export function apiOrigin(apiUrl, pageOrigin = globalThis.location?.origin ?? '') {
  if (!apiUrl) return pageOrigin

  try {
    return new URL(apiUrl, pageOrigin || undefined).origin
  } catch {
    return pageOrigin
  }
}

/** Transforma um caminho de mídia devolvido pela API (`/media/x.png`) em URL utilizável. */
export function mediaUrl(path, apiUrl = configuredApiUrl(), pageOrigin) {
  if (!path) return null
  if (ABSOLUTE.test(path)) return path

  return `${apiOrigin(apiUrl, pageOrigin)}${path.startsWith('/') ? '' : '/'}${path}`
}

/** URL do WebSocket do chat (`ws://host/ws/chat/?token=...`; `wss://` quando a API é https). */
export function chatSocketUrl(token, apiUrl = configuredApiUrl(), pageOrigin) {
  const origin = apiOrigin(apiUrl, pageOrigin)
  const base = origin.replace(/^http/i, 'ws')

  return `${base}/ws/chat/?token=${encodeURIComponent(token)}`
}
