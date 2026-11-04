import api from './api.js'
import { sessao } from './authSession.js'

export function normalizarTags(tags) {
  if (typeof tags === 'string') {
    try {
      tags = JSON.parse(tags)
    } catch {
      tags = []
    }
  }
  return Array.isArray(tags)
    ? [
        ...new Set(
          tags
            .filter((tag) => typeof tag === 'string')
            .map((tag) => tag.trim())
            .filter(Boolean),
        ),
      ]
    : []
}

function normalizarProjeto(data) {
  if (!data || !/^\d+$/.test(String(data.id)) || Number(data.id) < 1)
    throw new Error('A API retornou um projeto inválido.')
  return { ...data, tags: normalizarTags(data.tags) }
}

function caminhoProjeto(id) {
  if (!/^\d+$/.test(String(id)) || Number(id) < 1)
    throw new Error('Identificador de projeto inválido.')
  return `portfolios/${id}/`
}

export async function listarPortfolios(signal) {
  const revisao = sessao.revisao
  const usuario = sessao.usuario?.id
  const base = new URL(api.defaults.baseURL, globalThis.location?.origin || 'http://localhost')
  const visitadas = new Set()
  const projetos = new Map()
  let pagina = 'portfolios/'
  while (pagina) {
    if (sessao.revisao !== revisao || sessao.usuario?.id !== usuario || signal?.aborted)
      throw new Error('A sessão foi encerrada ou substituída.')
    if (visitadas.has(pagina)) throw new Error('A API retornou paginação repetida de portfólios.')
    visitadas.add(pagina)
    const { data } = await api.get(pagina, { signal })
    if (sessao.revisao !== revisao || sessao.usuario?.id !== usuario || signal?.aborted)
      throw new Error('A sessão foi encerrada ou substituída.')
    const lista = Array.isArray(data) ? data : data?.results
    if (!Array.isArray(lista)) throw new Error('A API retornou uma lista de projetos inválida.')
    for (const item of lista) {
      const projeto = normalizarProjeto(item)
      projetos.set(String(projeto.id), projeto)
    }
    pagina = null
    if (!Array.isArray(data) && data.next) {
      const url = new URL(data.next, new URL('portfolios/', base))
      if (
        url.origin !== base.origin ||
        url.pathname !== `${base.pathname}portfolios/` ||
        url.username ||
        url.password ||
        url.hash
      )
        throw new Error('A API retornou uma próxima página de portfólios inválida.')
      pagina = `portfolios/${url.search}`
    }
  }
  return [...projetos.values()]
}

export async function obterPortfolio(id, signal) {
  const { data } = await api.get(caminhoProjeto(id), { signal })
  const projeto = normalizarProjeto(data)
  if (Number(projeto.id) !== Number(id)) throw new Error('A API retornou outro projeto.')
  return projeto
}

export async function salvarPortfolio(id, dados) {
  const response =
    id == null ? await api.post('portfolios/', dados) : await api.patch(caminhoProjeto(id), dados)
  if (response.status !== (id == null ? 201 : 200))
    throw new Error(
      'O servidor não confirmou a gravação. Confira seus projetos antes de tentar novamente.',
    )
  const projeto = normalizarProjeto(response.data)
  if (id != null && Number(projeto.id) !== Number(id))
    throw new Error(
      'O servidor confirmou outro projeto. Confira seu portfólio antes de tentar novamente.',
    )
  return projeto
}

export function erroPortfolio(error) {
  const status = error.response?.status
  if (status === 401) return 'Sua sessão expirou. Entre novamente.'
  if (status === 403) return 'Sua conta não tem permissão para acessar ou salvar este projeto.'
  if (status === 404) return 'Este projeto não está disponível.'
  if (status >= 500)
    return 'O servidor não conseguiu concluir a operação. Tente novamente em instantes.'
  if (status === 400) {
    const campos = {
      titulo: 'Título',
      categoria: 'Categoria',
      descricao: 'Descrição',
      link: 'Link',
      imagem: 'Imagem',
      tags: 'Tags',
    }
    const mensagens = Object.entries(error.response?.data || {}).flatMap(([campo, valores]) =>
      (Array.isArray(valores) ? valores.flat() : [valores])
        .filter((valor) => typeof valor === 'string')
        .map((valor) => (campos[campo] ? `${campos[campo]}: ${valor}` : valor)),
    )
    return mensagens.join(' ') || 'Revise os campos do projeto e tente novamente.'
  }
  if (!error.response && error.isAxiosError)
    return 'Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.'
  return error.message || 'Não foi possível carregar o portfólio.'
}
