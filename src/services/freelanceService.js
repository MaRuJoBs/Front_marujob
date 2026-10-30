import api from './api.js'
import { sessao } from './authSession.js'
import { camposComplementaresVaga } from '../utils/vagaForm.js'

export const vagaPropria = (vaga, id = sessao.usuario?.id) =>
  sessao.tipo === 'empresa' &&
  id != null &&
  vaga?.empresa != null &&
  /^\d+$/.test(String(id)) &&
  String(vaga.empresa) === String(id)

export function capturarEmpresa() {
  const id = sessao.usuario?.id
  const revisao = sessao.revisao
  const atual = () =>
    sessao.tipo === 'empresa' &&
    id != null &&
    String(sessao.usuario?.id) === String(id) &&
    sessao.revisao === revisao
  return {
    id,
    atual,
    verificar() {
      if (!atual()) throw new Error('A sessão foi encerrada ou substituída.')
    },
  }
}

function paginaSegura(next) {
  const base = new URL(api.defaults.baseURL, globalThis.location?.origin || 'http://localhost')
  const destino = new URL(next, new URL('freelances/', base))
  if (
    destino.origin !== base.origin ||
    destino.pathname !== `${base.pathname}freelances/` ||
    destino.username ||
    destino.password ||
    destino.hash
  ) {
    throw new Error('A API retornou uma próxima página inválida.')
  }
  return `freelances/${destino.search}`
}

export async function listarVagasEmpresa() {
  const conta = capturarEmpresa()
  conta.verificar()
  const vagas = new Map()
  const visitadas = new Set()
  let pagina = 'freelances/'
  while (pagina) {
    conta.verificar()
    if (visitadas.has(pagina)) throw new Error('A API retornou paginação repetida.')
    visitadas.add(pagina)
    const { data } = await api.get(pagina)
    conta.verificar()
    const resultados = Array.isArray(data) ? data : data?.results
    if (!Array.isArray(resultados)) throw new Error('Resposta de vagas inválida.')
    for (const vaga of resultados) if (vagaPropria(vaga, conta.id)) vagas.set(vaga.id, vaga)
    pagina = !Array.isArray(data) && data.next ? paginaSegura(data.next) : null
  }
  return [...vagas.values()].sort((a, b) => Number(b.id) - Number(a.id))
}

function caminhoVaga(id) {
  if (!/^\d+$/.test(String(id))) throw new Error('Identificador de vaga inválido.')
  return `freelances/${id}/`
}

export async function consultarVagaPropria(id) {
  const conta = capturarEmpresa()
  conta.verificar()
  const { data } = await api.get(caminhoVaga(id))
  conta.verificar()
  if (!vagaPropria(data, conta.id)) {
    const error = new Error('Esta oportunidade não pertence à sua empresa.')
    error.response = { status: 403 }
    throw error
  }
  return data
}

export async function editarVaga(id, payload) {
  const conta = capturarEmpresa()
  await consultarVagaPropria(id)
  conta.verificar()
  const campos = Object.fromEntries(
    [
      'titulo',
      'descricao',
      'tag',
      'preco',
      'tempo',
      ...camposComplementaresVaga.map(({ nome }) => nome),
    ]
      .filter((campo) => Object.hasOwn(payload, campo))
      .map((campo) => [campo, payload[campo]]),
  )
  const response = await api.patch(caminhoVaga(id), campos)
  conta.verificar()
  if (response.status !== 200) throw new Error('O servidor não confirmou a edição.')
  return response.data
}

export async function excluirVaga(id) {
  const conta = capturarEmpresa()
  await consultarVagaPropria(id)
  conta.verificar()
  const response = await api.delete(caminhoVaga(id))
  conta.verificar()
  if (response.status !== 204) throw new Error('O servidor não confirmou a exclusão.')
}

export function mensagemErroVagas(error) {
  const status = error.response?.status
  if (status === 401) return 'Sua sessão expirou. Entre novamente.'
  if (status === 403) return 'Você não tem permissão para gerenciar esta oportunidade.'
  if (status === 404) return 'Esta oportunidade não foi encontrada. Atualize a listagem.'
  if (status === 400) return 'Revise os campos informados e tente novamente.'
  if (status >= 500) return 'O servidor está indisponível. Tente novamente em instantes.'
  if (error.isAxiosError && !error.response)
    return 'Não foi possível conectar ao servidor. Verifique sua conexão.'
  return error.message || 'Não foi possível concluir a operação.'
}

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
