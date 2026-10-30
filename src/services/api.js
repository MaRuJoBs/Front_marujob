import axios from 'axios'
import {
  limparSessao,
  obterAccessToken,
  obterRefreshToken,
  sessao,
  tokenValido,
} from './authSession.js'

const baseURL = `${(import.meta.env.VITE_API_URL || '/api/').replace(/\/+$/, '')}/`
const api = axios.create({ baseURL, timeout: 15000 })
// Sem interceptors: a renovação nunca renova a si mesma.
const authApi = axios.create({ baseURL, timeout: 15000 })
let renovacao = null

const rotasPublicas = new Set(['token', 'token/refresh', 'token/verify', 'auth/google', 'registro'])

function rotaPublica(config) {
  if (config.skipAuth) return true
  const origem = globalThis.location?.origin || 'http://localhost'
  const base = new URL(baseURL, origem)
  const url = new URL(config.url || '', base)
  if (url.origin !== base.origin) return true
  const caminho = url.pathname.startsWith(base.pathname)
    ? url.pathname.slice(base.pathname.length)
    : url.pathname.replace(/^\/+/, '')
  return rotasPublicas.has(caminho.replace(/\/+$/, ''))
}

export function renovarAccessToken() {
  const refresh = obterRefreshToken()
  const revisao = sessao.revisao
  if (!refresh) {
    limparSessao()
    return Promise.reject(new Error('Sua sessão expirou. Entre novamente.'))
  }
  if (renovacao?.revisao === revisao) return renovacao.promise

  const atual = { revisao }
  atual.promise = authApi
    .post('token/refresh/', { refresh })
    .then(({ data }) => {
      // Uma resposta antiga não pode reabrir uma sessão após logout ou outro login.
      if (sessao.revisao !== revisao || obterRefreshToken() !== refresh) {
        throw new Error('A sessão foi encerrada ou substituída.')
      }
      if (!tokenValido(data.access) || (data.refresh !== undefined && !tokenValido(data.refresh))) {
        limparSessao()
        throw new Error('O servidor retornou tokens inválidos.')
      }
      localStorage.setItem('token', data.access)
      if (data.refresh) localStorage.setItem('refresh', data.refresh)
      return data.access
    })
    .catch((error) => {
      if (sessao.revisao === revisao && [400, 401, 403].includes(error.response?.status)) {
        limparSessao()
      }
      // Falhas de rede e de servidor não significam que o refresh foi revogado.
      throw error
    })
    .finally(() => {
      if (renovacao === atual) renovacao = null
    })
  renovacao = atual
  return atual.promise
}

api.interceptors.request.use((config) => {
  if (rotaPublica(config)) {
    delete config.headers.Authorization
    return config
  }
  // Não repete uma operação de uma conta na sessão de outra conta.
  if (config._retry && config._authRevision !== sessao.revisao) {
    return Promise.reject(new axios.CanceledError('A sessão foi substituída.'))
  }
  config._authRevision = sessao.revisao
  config._accessToken = obterAccessToken()
  if (config._accessToken) config.headers.Authorization = `Bearer ${config._accessToken}`
  else delete config.headers.Authorization
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config
    if (!original || error.response?.status !== 401 || rotaPublica(original)) throw error
    if (original._authRevision !== sessao.revisao) throw error
    if (original._retry) {
      limparSessao()
      throw error
    }
    if (!obterRefreshToken()) {
      limparSessao()
      throw error
    }
    original._retry = true
    // Um 401 pode chegar depois de outra requisição já ter renovado o token.
    const access = obterAccessToken()
    if (!access || access === original._accessToken) await renovarAccessToken()
    if (original._authRevision !== sessao.revisao) throw error
    return api(original)
  },
)

export default api
