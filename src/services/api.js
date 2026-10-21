import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL

const api = axios.create({
  baseURL: BASE_URL,
})

// Axios separado para renovar o token,
// evitando que a renovação entre em um loop.
const authApi = axios.create({
  baseURL: BASE_URL,
})

// Guarda uma renovação em andamento.
// Assim, várias requisições não tentam renovar
// o mesmo token ao mesmo tempo.
let refreshPromise = null

const limparTokens = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('refresh')
}

const rotaEhPublica = (url = '') => {
  const caminho = new URL(url, BASE_URL).pathname
    .replace(/^\/api\//, '')
    .replace(/^\/+/, '')

  return [
    'token/',
    'token/refresh/',
    'token/verify/',
    'auth/google/',
    'registro/',
  ].includes(caminho)
}

// Adiciona o access token às requisições privadas.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  if (token && !rotaEhPublica(config.url)) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

// Renova o access token quando ele expirar.
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    if (!originalRequest) {
      return Promise.reject(error)
    }

    const status = error.response?.status

    // Só tenta renovar em caso de 401,
    // em rotas privadas e uma única vez.
    if (
      status !== 401 ||
      originalRequest._retry ||
      rotaEhPublica(originalRequest.url)
    ) {
      return Promise.reject(error)
    }

    const refreshToken = localStorage.getItem('refresh')

    if (!refreshToken) {
      limparTokens()
      return Promise.reject(error)
    }

    originalRequest._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = authApi
          .post('token/refresh/', {
            refresh: refreshToken,
          })
          .then(({ data }) => {
            localStorage.setItem('token', data.access)

            // Compatível com refresh token rotation,
            // caso esteja habilitada no Django.
            if (data.refresh) {
              localStorage.setItem('refresh', data.refresh)
            }

            return data.access
          })
          .finally(() => {
            refreshPromise = null
          })
      }

      const novoToken = await refreshPromise

      // Atualiza o token na requisição original.
      originalRequest.headers.Authorization =
        `Bearer ${novoToken}`

      // Repete a requisição que falhou.
      return api(originalRequest)
    } catch (refreshError) {
      limparTokens()
      return Promise.reject(refreshError)
    }
  }
)

export default api
