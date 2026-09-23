import axios from 'axios'

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')

  const rotasPublicas = [
    'token/',
    'auth/google/',
    'registro/',
  ]

  const rotaPublica = rotasPublicas.some(
    rota => config.url?.includes(rota)
  )

  if (token && !rotaPublica) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default api