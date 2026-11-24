import api from './api.js'
import { capturarEmpresa } from './freelanceService.js'
import { resolverImagem } from '../utils/imagens.js'
import { sessao } from './authSession.js'

const texto = (valor) => (typeof valor === 'string' ? valor : '')
const lista = (valor) =>
  Array.isArray(valor) ? valor.filter((item) => typeof item === 'string') : []
export function linkPublico(valor) {
  try {
    const url = new URL(valor)
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password
      ? url.href
      : null
  } catch {
    return null
  }
}
export function perfilPublico(data, detalhe = false) {
  if (!data || !Number.isSafeInteger(data.id) || data.id < 1)
    throw new Error('Perfil público inválido.')
  const perfil = {
    id: data.id,
    nome: texto(data.nome),
    profissao: texto(data.profissao),
    cidade: texto(data.cidade),
    habilidades: lista(data.habilidades),
    foto_perfil: resolverImagem(data.foto_perfil),
  }
  if (detalhe) {
    perfil.descricao = texto(data.descricao)
    // O endpoint público pode omitir a flag dos projetos que já filtrou.
    perfil.portfolio = (Array.isArray(data.portfolio) ? data.portfolio : [])
      .filter((projeto) => projeto && (!Object.hasOwn(projeto, 'publico') || projeto.publico === true))
      .map((projeto) => ({
        id: projeto.id,
        titulo: texto(projeto.titulo),
        categoria: texto(projeto.categoria),
        descricao: texto(projeto.descricao),
        tags: lista(projeto.tags),
        imagem: resolverImagem(projeto.imagem),
        link: linkPublico(projeto.link),
      }))
  }
  return perfil
}
export async function listarFreelancers(params = {}, signal) {
  const conta = capturarEmpresa()
  conta.verificar()
  const filtros = {}
  for (const [campo, limite] of Object.entries({
    search: 255,
    profissao: 255,
    cidade: 120,
    habilidade: 100,
  })) {
    const valor = texto(params[campo]).trim()
    if (valor.length > limite) throw new Error('Revise o tamanho dos filtros informados.')
    if (valor) filtros[campo] = valor
  }
  const page = Number(params.page ?? 1)
  if (!Number.isInteger(page) || page < 1 || page > 1000000) throw new Error('Página inválida.')
  const { data } = await api.get('freelancers/', {
    params: { ...filtros, page },
    signal,
    _sessionRevision: sessao.revisao,
  })
  conta.verificar()
  if (!Array.isArray(data?.results) || !Number.isInteger(data.count) || data.count < 0)
    throw new Error('Listagem pública inválida.')
  return {
    count: data.count,
    next: Boolean(data.next),
    previous: Boolean(data.previous),
    results: data.results.map((item) => perfilPublico(item)),
  }
}
export async function obterFreelancer(id, signal) {
  if (!/^[1-9]\d*$/.test(String(id)) || !Number.isSafeInteger(Number(id))) {
    const error = new Error('Perfil não encontrado.')
    error.response = { status: 404 }
    throw error
  }
  const conta = capturarEmpresa()
  conta.verificar()
  const { data } = await api.get(`freelancers/${id}/`, { signal, _sessionRevision: sessao.revisao })
  conta.verificar()
  if (String(data?.id) !== String(id)) throw new Error('Perfil público inválido.')
  return perfilPublico(data, true)
}
export function erroFreelancers(error) {
  const status = error.response?.status
  if (status === 401) return 'Sua sessão expirou. Entre novamente.'
  if (status === 403) return 'Esta área está disponível apenas para empresas autorizadas.'
  if (status === 404)
    return 'Perfil ou página não encontrado, ou indisponível para consulta pública.'
  if (status === 400) return 'Revise os filtros e tente novamente.'
  return 'Não foi possível carregar os profissionais. Tente novamente.'
}
