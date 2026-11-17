// Toast simples do chat (o projeto não usa vue-toastification): uma fila reativa global,
// renderizada por components/ChatToastHost.vue (montado uma única vez no App.vue).
import { reactive } from 'vue'

const DEFAULT_TIMEOUT_MS = 5000
const MAX_VISIBLE = 4

export const toasts = reactive([])
let seq = 0

export function dismissToast(id) {
  const index = toasts.findIndex((toast) => toast.id === id)

  if (index >= 0) {
    clearTimeout(toasts[index].timer)
    toasts.splice(index, 1)
  }
}

/**
 * Mostra um aviso.
 * @param {object} options
 * @param {'error'|'info'|'message'} [options.type]
 * @param {string} [options.text]                       texto (erro/info)
 * @param {{author: string, avatar?: string|null, preview?: string}} [options.message] prévia de mensagem
 * @param {() => void} [options.onClick]
 * @param {string} [options.id]                         evita duplicar o mesmo aviso
 */
export function showToast({
  type = 'info',
  text = '',
  message = null,
  onClick = null,
  id = null,
  timeout = DEFAULT_TIMEOUT_MS,
}) {
  const key = id ?? `toast-${(seq += 1)}`

  dismissToast(key)

  const toast = { id: key, type, text, message, onClick, timer: null }

  toast.timer = setTimeout(() => dismissToast(key), timeout)
  toasts.push(toast)

  while (toasts.length > MAX_VISIBLE) dismissToast(toasts[0].id)
}

/** API parecida com a do vue-toastification usada no ReadMore: toast.error(texto). */
export function useChatToast() {
  return {
    error: (text) => showToast({ type: 'error', text }),
    info: (text) => showToast({ type: 'info', text }),
    message: (options) => showToast({ type: 'message', ...options }),
  }
}

/** Limpa todos os avisos (logout). */
export function clearToasts() {
  for (const toast of [...toasts]) dismissToast(toast.id)
}
