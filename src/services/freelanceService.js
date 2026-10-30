import api from './api.js'

export async function publicarVaga(payload) {
  const response = await api.post('freelances/', payload)
  if (response.status !== 201) {
    const error = new Error(
      'O servidor não confirmou a publicação. Confira suas vagas antes de tentar novamente.',
    )
    error.code = 'PUBLICACAO_NAO_CONFIRMADA'
    throw error
  }
  return response.data
}
