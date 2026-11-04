import { reactive } from 'vue'

const fotos = reactive({})
const chave = (id) =>
  /^\d+$/.test(String(id)) && Number(id) > 0 ? `marujobs:foto-google:usuario:${Number(id)}` : null

function urlGoogle(valor) {
  try {
    const url = new URL(valor)
    return url.protocol === 'https:' &&
      !url.username &&
      !url.password &&
      (url.hostname === 'googleusercontent.com' || url.hostname.endsWith('.googleusercontent.com'))
      ? url.href
      : null
  } catch {
    return null
  }
}

export function obterFotoGoogle(id) {
  const storageKey = chave(id)
  if (!storageKey) return null
  if (!Object.hasOwn(fotos, storageKey)) {
    try {
      fotos[storageKey] = urlGoogle(localStorage.getItem(storageKey))
    } catch {
      fotos[storageKey] = null
    }
  }
  return fotos[storageKey]
}

// Somente metadado visual, chamado APÓS o backend aceitar o login e identificar /me/.
// A leitura de claims aqui não autentica ninguém; o JWT Google nunca é persistido.
export function guardarFotoGoogle(credential, id) {
  const storageKey = chave(id)
  if (!storageKey || typeof credential !== 'string') return
  try {
    const partes = credential.split('.')
    if (partes.length !== 3) return
    const payload = partes[1].replace(/-/g, '+').replace(/_/g, '/')
    const bytes = Uint8Array.from(atob(payload), (char) => char.charCodeAt(0))
    const claims = JSON.parse(new TextDecoder().decode(bytes))
    if (!['accounts.google.com', 'https://accounts.google.com'].includes(claims.iss)) return
    const foto = urlGoogle(claims.picture)
    if (!foto) return
    fotos[storageKey] = foto
    try {
      localStorage.setItem(storageKey, foto)
    } catch {
      /* Login continua com a foto em memória. */
    }
  } catch {
    /* Ausência de foto não impede o login. */
  }
}
