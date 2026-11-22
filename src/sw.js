import { clientsClaim } from 'workbox-core'
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching'
import { NavigationRoute, registerRoute } from 'workbox-routing'
import {
  CENTRAL_NOTIFICACOES,
  EVENTO_PUSH,
  EVENTOS_CANDIDATURA,
  RENOVAR_PUSH,
} from './pushEvents.js'

self.skipWaiting()
clientsClaim()
cleanupOutdatedCaches()
precacheAndRoute(self.__WB_MANIFEST)
const caminhoPrivado = /^\/(?:api|media|ws)(?:\/|$)/
registerRoute(
  new NavigationRoute(createHandlerBoundToURL('index.html'), {
    denylist: [caminhoPrivado],
  }),
)

async function avisarJanelas(type) {
  const janelas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
  for (const janela of janelas) janela.postMessage({ type })
}

self.addEventListener('push', (event) => {
  let payload
  try {
    payload = event.data?.json()
  } catch {
    return
  }
  if (!payload || !Object.hasOwn(EVENTOS_CANDIDATURA, payload.event)) return
  if (typeof payload.title !== 'string' || typeof payload.body !== 'string') return
  event.waitUntil(
    Promise.all([
      self.registration.showNotification(payload.title, {
        body: payload.body,
        icon: '/icons/icon-192.png',
        tag: `candidatura-${payload.notification_id}`,
      }),
      avisarJanelas(EVENTO_PUSH),
    ]),
  )
})

self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(avisarJanelas(RENOVAR_PUSH))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    (async () => {
      const destino = new URL(CENTRAL_NOTIFICACOES, self.location.origin)
      const janelas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      const mesmaOrigem = janelas.filter((janela) => {
        const url = new URL(janela.url)
        return url.origin === destino.origin && !caminhoPrivado.test(url.pathname)
      })
      const janela = mesmaOrigem.find((item) => item.url === destino.href) ?? mesmaOrigem[0]
      if (janela) {
        const ativa =
          janela.url === destino.href
            ? janela
            : await janela.navigate(destino.href).catch(() => null)
        const focada = await ativa?.focus().catch(() => null)
        if (focada) {
          focada.postMessage({ type: EVENTO_PUSH })
          return
        }
      }
      await self.clients.openWindow(destino.href)
    })(),
  )
})
