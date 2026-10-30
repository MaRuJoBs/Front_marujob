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

export async function listarOportunidades(params, signal) {
  const { data } = await api.get('freelances/', { params, signal })
  if (!data || !Array.isArray(data.results) || !Number.isInteger(data.count) || data.count < 0)
    throw new Error('A API retornou uma listagem inválida. Tente novamente.')
  return data
}

export async function obterOportunidade(id, signal) {
  const { data } = await api.get(`freelances/${encodeURIComponent(id)}/`, { signal })
  if (!data || typeof data !== 'object' || data.id == null)
    throw new Error('A API retornou uma oportunidade inválida.')
  return data
}
