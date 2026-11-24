import api from './api.js'
import { sessao, obterAccessToken, obterRefreshToken } from './authSession.js'
import { capturarEmpresa, consultarVagaPropria, editarVaga } from './freelanceService.js'
import { proximaPaginaCandidaturas } from './candidaturasService.js'
import { limiteProfissionais, vagaPreenchida } from '../utils/vagaForm.js'
import {
  idValido,
  statusValido,
  normalizarNotificacao,
  normalizarCandidatura,
} from '../utils/notificacoes.js'

const mutacoes = new Set()
const encerramentos = new Map()
function empresaAtual() {
  const conta = capturarEmpresa()
  conta.verificar()
  if (!idValido(conta.id) || (!obterAccessToken() && !obterRefreshToken()))
    throw new Error('Autenticação de empresa necessária.')
  return conta
}
function validarId(id) {
  if (!idValido(id)) throw new Error('Identificador inválido.')
  return String(id)
}
async function requisitar(method, url, { signal, params, mutacao } = {}) {
  const conta = empresaAtual(),
    revisao = sessao.revisao
  const chave = `${revisao}:${conta.id}:${mutacao}`
  if (mutacao && mutacoes.has(chave)) throw new Error('Operação já em andamento.')
  if (mutacao) mutacoes.add(chave)
  try {
    const response = await api.request({
      method,
      url,
      signal,
      params,
      ...(method !== 'get' ? { data: {} } : {}),
      _sessionRevision: revisao,
    })
    conta.verificar()
    if (response.status !== 200) throw new Error('Resposta não confirmada pelo servidor.')
    return response.data
  } finally {
    if (mutacao) mutacoes.delete(chave)
  }
}
export function paginaNotificacoes(link, filtro, atual) {
  if (!link) return null
  if (typeof link !== 'string') throw new Error('Paginação inválida.')
  const base = new URL(api.defaults.baseURL, globalThis.location?.origin || 'http://localhost')
  const endpoint = new URL('notificacoes/', base),
    url = new URL(link, endpoint)
  if (
    url.origin !== base.origin ||
    url.pathname !== endpoint.pathname ||
    url.username ||
    url.password ||
    url.hash ||
    [...url.searchParams.keys()].some((k) => !['page', 'status'].includes(k)) ||
    url.searchParams.getAll('page').length > 1 ||
    url.searchParams.getAll('status').length > 1
  )
    throw new Error('Paginação inválida.')
  if (url.searchParams.has('status') && url.searchParams.get('status') !== filtro)
    throw new Error('Filtro de paginação inválido.')
  const numero = url.searchParams.get('page') || '1'
  if (
    !/^[1-9]\d*$/.test(numero) ||
    !Number.isSafeInteger(Number(numero)) ||
    Number(numero) === atual
  )
    throw new Error('Página inválida.')
  return Number(numero)
}
export async function listarNotificacoes({ status = '', pagina = 1, signal } = {}) {
  if ((status !== '' && !statusValido(status)) || !Number.isSafeInteger(pagina) || pagina < 1)
    throw new Error('Filtro ou página inválidos.')
  const data = await requisitar('get', 'notificacoes/', {
    signal,
    params: { page: pagina, ...(status ? { status } : {}) },
  })
  if (!data || !Array.isArray(data.results) || !Number.isSafeInteger(data.count) || data.count < 0)
    throw new Error('Listagem inválida.')
  return {
    count: data.count,
    results: data.results.map(normalizarNotificacao),
    next: paginaNotificacoes(data.next, status, pagina),
    previous: paginaNotificacoes(data.previous, status, pagina),
  }
}
export async function contarNotificacoesNaoLidas({ signal } = {}) {
  const data = await requisitar('get', 'notificacoes/', { signal, params: { lida: false } })
  if (!Number.isSafeInteger(data?.count) || data.count < 0) throw new Error('Contagem inválida.')
  return data.count
}
export const consultarNotificacao = async (id, config) =>
  normalizarNotificacao(await requisitar('get', `notificacoes/${validarId(id)}/`, config))
export async function marcarNotificacaoLida(id, config) {
  const data = normalizarNotificacao(
    await requisitar('patch', `notificacoes/${validarId(id)}/marcar-lida/`, {
      ...config,
      mutacao: `leitura:${id}`,
    }),
  )
  if (String(data.id) !== String(id) || data.lida !== true)
    throw new Error('Leitura não confirmada.')
  return data
}
export async function consultarCandidatura(id, config) {
  const data = normalizarCandidatura(
    await requisitar('get', `candidaturas/${validarId(id)}/`, config),
  )
  if (String(data.id) !== String(id)) throw new Error('Candidatura inesperada.')
  return data
}
export async function decidirCandidatura(id, acao, config) {
  if (!['aprovar', 'recusar'].includes(acao)) throw new Error('Decisão inválida.')
  const data = normalizarCandidatura(
    await requisitar('post', `candidaturas/${validarId(id)}/${acao}/`, {
      ...config,
      mutacao: `decisao:${id}`,
    }),
  )
  if (
    String(data.id) !== String(id) ||
    data.status !== (acao === 'aprovar' ? 'aprovada' : 'recusada')
  )
    throw new Error('Decisão não confirmada.')
  return data
}

export async function listarCandidaturasEmpresa(oportunidade, { signal } = {}) {
  const conta = empresaAtual()
  if (oportunidade != null) validarId(oportunidade)
  const visitadas = new Set()
  const candidaturas = new Map()
  let pagina = 1
  let total
  while (pagina !== null) {
    conta.verificar()
    if (visitadas.has(pagina)) throw new Error('Paginação de candidaturas repetida.')
    visitadas.add(pagina)
    const data = await requisitar('get', 'candidaturas/', {
      signal,
      params: { page: pagina, ...(oportunidade == null ? {} : { oportunidade }) },
    })
    if (
      !Array.isArray(data?.results) ||
      !Number.isSafeInteger(data.count) ||
      data.count < 0 ||
      (total != null && data.count !== total)
    )
      throw new Error('Listagem de candidaturas indisponível.')
    total = data.count
    for (const item of data.results.map(normalizarCandidatura)) {
      const chave = String(item.id)
      if (
        candidaturas.has(chave) ||
        (oportunidade != null && String(item.oportunidade) !== String(oportunidade))
      )
        throw new Error('Listagem de candidaturas inconsistente.')
      candidaturas.set(chave, item)
    }
    if (candidaturas.size > total || (data.next != null && !data.results.length))
      throw new Error('Listagem de candidaturas inconsistente.')
    pagina = data.next == null ? null : proximaPaginaCandidaturas(data.next, oportunidade)
  }
  conta.verificar()
  if (candidaturas.size !== total) throw new Error('Consulta de candidaturas incompleta.')
  return [...candidaturas.values()]
}

export const contarAprovados = (candidaturas) =>
  candidaturas.filter(({ status }) => status === 'aprovada').length

export function encerrarVagaPreenchida(id) {
  const conta = empresaAtual()
  const chave = `${sessao.revisao}:${conta.id}:${validarId(id)}`
  if (encerramentos.has(chave)) return encerramentos.get(chave)
  const operacao = (async () => {
    const vaga = await consultarVagaPropria(id)
    conta.verificar()
    if (vaga.status !== 'publicada' || limiteProfissionais(vaga.max_profissionais) === null)
      return null
    const candidaturas = await listarCandidaturasEmpresa(id)
    conta.verificar()
    const aprovados = contarAprovados(candidaturas)
    if (!vagaPreenchida(vaga, aprovados)) return null
    try {
      const encerrada = await editarVaga(
        id,
        { status: 'encerrada' },
        {
          antesDeSalvar: (atual) =>
            atual.status === 'publicada' && vagaPreenchida(atual, aprovados),
        },
      )
      conta.verificar()
      if (!encerrada) return null
      if (
        String(encerrada?.id) !== String(id) ||
        String(encerrada.empresa) !== String(conta.id) ||
        encerrada.status !== 'encerrada'
      )
        throw new Error('Encerramento não confirmado.')
      return encerrada
    } catch {
      throw new Error(
        'O limite de profissionais foi atingido, mas o encerramento não foi confirmado. Confira a vaga e tente encerrar novamente.',
      )
    }
  })().finally(() => encerramentos.delete(chave))
  encerramentos.set(chave, operacao)
  return operacao
}
