import { watch } from 'vue'
import { restaurarSessao, sessao, paginaInicial, logout } from '../services/authService.js'
import { obterAccessToken, obterRefreshToken } from '../services/authSession.js'

export async function protegerRota(to) {
  // Permite exibir a falha sem repetir a mesma consulta em um redirecionamento.
  if (to.meta.publica && to.query.motivo) return true
  try {
    const usuario = await restaurarSessao()
    if (!usuario) return to.meta.publica ? true : { name: 'login', replace: true }
    if (to.meta.publica || (to.meta.tipo && to.meta.tipo !== sessao.tipo)) {
      return { path: paginaInicial(), replace: true }
    }
    return true
  } catch (error) {
    if (to.meta.publica) return true
    const motivo =
      error.code === 'AUTH_GROUP_MISSING'
        ? 'grupo'
        : obterAccessToken() || obterRefreshToken()
          ? 'conexao'
          : 'sessao'
    return { name: 'login', query: { motivo }, replace: true }
  }
}

export function instalarProtecao(router) {
  router.beforeEach(protegerRota)
  // Abrange a expiração detectada por qualquer requisição em uma página já aberta.
  const pararWatch = watch(
    () => sessao.revisao,
    () => {
      if (
        !obterAccessToken() &&
        !obterRefreshToken() &&
        router.currentRoute.value.name &&
        !router.currentRoute.value.meta.publica
      ) {
        router.replace({ name: 'login', query: { motivo: 'sessao' } })
      }
    },
  )
  const sincronizarAbas = (event) => {
    if (event.storageArea !== localStorage || ![null, 'token', 'refresh'].includes(event.key))
      return
    // O perfil em memória nunca deve sobreviver a uma troca de conta em outra aba.
    sessao.usuario = null
    sessao.tipo = null
    sessao.revisao++
    if (!obterAccessToken() && !obterRefreshToken()) logout()
    if (!router.currentRoute.value.meta.publica) {
      router.replace({ path: router.currentRoute.value.fullPath, force: true })
    }
  }
  window.addEventListener('storage', sincronizarAbas)
  return () => {
    pararWatch()
    window.removeEventListener('storage', sincronizarAbas)
  }
}
