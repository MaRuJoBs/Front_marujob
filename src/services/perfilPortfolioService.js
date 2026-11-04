import api from './api.js'
import { sessao } from './authSession.js'
import {
  camposPerfil,
  camposProjeto,
  payloadPermitido,
  imagemUrl,
} from '../utils/perfilPortfolio.js'

export const resolverImagem = (path) => imagemUrl(path, api.defaults.baseURL)
async function requisitar(method, url, data, config = {}) {
  const revisao = sessao.revisao
  const response = await api.request({ ...config, method, url, data, _sessionRevision: revisao })
  if (sessao.revisao !== revisao) throw new Error('Sessão substituída.')
  return response
}
export const consultarPerfil = async (config) =>
  (await requisitar('get', 'usuarios/me/', undefined, config)).data
export const atualizarPerfil = async (dados, config) =>
  (await requisitar('patch', 'usuarios/me/', payloadPermitido(dados, camposPerfil), config)).data
export const consultarProjeto = async (id, config) =>
  (await requisitar('get', `portfolios/${encodeURIComponent(id)}/`, undefined, config)).data
export async function salvarProjeto(id, dados, config) {
  const response = await requisitar(
    id ? 'patch' : 'post',
    id ? `portfolios/${encodeURIComponent(id)}/` : 'portfolios/',
    payloadPermitido(dados, camposProjeto),
    config,
  )
  if (response.status !== (id ? 200 : 201)) throw new Error('Resposta inesperada.')
  return response.data
}
export async function excluirProjeto(id, config) {
  const response = await requisitar(
    'delete',
    `portfolios/${encodeURIComponent(id)}/`,
    undefined,
    config,
  )
  if (response.status !== 204) throw new Error('Exclusão não confirmada.')
}
export async function listarProjetos(config) {
  const projetos = []
  const visitadas = new Set()
  let url = '?page=1'
  const origem = globalThis.location?.origin || 'http://localhost'
  const base = new URL(api.defaults.baseURL, origem)
  while (url) {
    const atual = new URL(url, new URL('portfolios/', base))
    if (
      atual.origin !== base.origin ||
      atual.pathname !== new URL('portfolios/', base).pathname ||
      visitadas.has(atual.href)
    )
      throw new Error('Paginação inválida.')
    visitadas.add(atual.href)
    const { data } = await requisitar('get', `portfolios/${atual.search}`, undefined, config)
    const itens = Array.isArray(data) ? data : data.results
    if (!Array.isArray(itens)) throw new Error('Lista inválida.')
    projetos.push(...itens)
    url = Array.isArray(data) ? null : data.next
  }
  return [...new Map(projetos.map((p) => [p.id, p])).values()]
}
