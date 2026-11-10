import api from './api.js'
import { sessao, obterAccessToken, obterRefreshToken } from './authSession.js'

const envios = new Map()
const statusValidos = new Set(['pendente', 'aprovada', 'recusada'])
const idValido = (id) =>
  (typeof id === 'number' || (typeof id === 'string' && /^[1-9]\d*$/.test(id))) &&
  Number.isSafeInteger(Number(id)) &&
  Number(id) > 0

function contaAtual() {
  const id = sessao.usuario?.id,
    revisao = sessao.revisao
  const verificar = () => {
    if (
      sessao.tipo !== 'usuario' ||
      !idValido(id) ||
      String(sessao.usuario?.id) !== String(id) ||
      sessao.revisao !== revisao ||
      (!obterAccessToken() && !obterRefreshToken())
    )
      throw new Error('Sessão de usuário necessária.')
  }
  verificar()
  return { id: Number(id), revisao, verificar }
}
function validarOportunidade(id) {
  if (!idValido(id)) throw new Error('Oportunidade inválida.')
  return Number(id)
}
function normalizar(data) {
  if (
    !data ||
    !idValido(data.id) ||
    !idValido(data.freelancer) ||
    !idValido(data.oportunidade) ||
    !statusValidos.has(data.status)
  )
    throw new Error('Resposta de candidatura inválida.')
  return {
    id: Number(data.id),
    freelancer: Number(data.freelancer),
    oportunidade: Number(data.oportunidade),
    status: data.status,
  }
}
function proximaPagina(link, oportunidade) {
  if (typeof link !== 'string') throw new Error('Paginação inválida.')
  const base = new URL(api.defaults.baseURL, globalThis.location?.origin || 'http://localhost')
  const endpoint = new URL('candidaturas/', base),
    url = new URL(link, endpoint)
  const pagina = url.searchParams.get('page') || '1'
  if (
    url.origin !== base.origin ||
    url.pathname !== endpoint.pathname ||
    url.username ||
    url.password ||
    url.hash ||
    !idValido(pagina) ||
    [...url.searchParams.keys()].some((k) => !['page', 'oportunidade'].includes(k)) ||
    url.searchParams.getAll('page').length > 1 ||
    url.searchParams.getAll('oportunidade').length > 1 ||
    (url.searchParams.has('oportunidade') &&
      url.searchParams.get('oportunidade') !== String(oportunidade))
  )
    throw new Error('Paginação inválida.')
  return Number(pagina)
}
const chaveEnvio = (conta, oportunidade) => `${conta.revisao}:${conta.id}:${oportunidade}`

export async function consultarCandidaturaPropria(id, signal) {
  const oportunidade = validarOportunidade(id),
    conta = contaAtual()
  // Ao retornar ao detalhe, aguarda o POST deste cliente terminar antes de reconciliar.
  await envios.get(chaveEnvio(conta, oportunidade))?.catch(() => {})
  conta.verificar()
  const visitadas = new Set(),
    registros = new Map()
  let pagina = 1,
    encontrada = null,
    total
  while (pagina !== null) {
    if (visitadas.has(pagina)) throw new Error('Paginação repetida.')
    visitadas.add(pagina)
    conta.verificar()
    const { data, status } = await api.get('candidaturas/', {
      params: { oportunidade, page: pagina },
      signal,
      _sessionRevision: conta.revisao,
    })
    conta.verificar()
    if (
      status !== 200 ||
      !Array.isArray(data?.results) ||
      !Number.isSafeInteger(data.count) ||
      data.count < 0 ||
      (total !== undefined && total !== data.count)
    )
      throw new Error('Listagem de candidaturas inválida.')
    total = data.count
    for (const item of data.results) {
      const candidatura = normalizar(item)
      if (registros.has(candidatura.id)) throw new Error('Listagem inconsistente.')
      registros.set(candidatura.id, candidatura)
      if (candidatura.freelancer === conta.id && candidatura.oportunidade === oportunidade) {
        if (encontrada) throw new Error('Mais de uma candidatura encontrada.')
        encontrada = candidatura
      }
    }
    if (registros.size > total || (data.next != null && data.results.length === 0))
      throw new Error('Listagem de candidaturas inconsistente.')
    pagina = data.next == null ? null : proximaPagina(data.next, oportunidade)
  }
  if (registros.size !== total) throw new Error('Consulta de candidaturas incompleta.')
  return encontrada
}

export async function enviarCandidatura(id) {
  const oportunidade = validarOportunidade(id),
    conta = contaAtual()
  const chave = chaveEnvio(conta, oportunidade)
  if (envios.has(chave)) throw new Error('Envio já em andamento.')
  const operacao = (async () => {
    const response = await api.post(
      'candidaturas/',
      { oportunidade },
      {
        _sessionRevision: conta.revisao,
      },
    )
    conta.verificar()
    if (response.status !== 201) throw new Error('Envio não confirmado.')
    const data = normalizar(response.data)
    if (data.freelancer !== conta.id || data.oportunidade !== oportunidade)
      throw new Error('Vínculo de candidatura inválido.')
    return data
  })()
  envios.set(chave, operacao)
  try {
    return await operacao
  } finally {
    envios.delete(chave)
  }
}

export function mensagemErroCandidatura(error, envio = false) {
  const status = error.response?.status
  if (status === 401) return 'Sua sessão expirou. Entre novamente.'
  if (status === 403) return 'Você não tem permissão para se candidatar a esta oportunidade.'
  if (status === 404) return 'O recurso não está disponível. Volte à listagem de oportunidades.'
  if (status === 400)
    return 'A API recusou a solicitação. Verifique a oportunidade e atualize sua candidatura antes de tentar novamente.'
  if (status >= 500)
    return envio
      ? 'O servidor falhou ao confirmar o envio. Consulte sua candidatura antes de tentar novamente.'
      : 'O servidor está indisponível. Tente consultar sua candidatura novamente em instantes.'
  if (envio)
    return 'Não foi possível confirmar o envio. O resultado pode estar indefinido; consulte sua candidatura antes de tentar novamente.'
  return 'Não foi possível consultar sua candidatura. Tente consultar novamente.'
}
