import api, { renovarAccessToken } from './api.js'
import { registrarFalhaGoogle } from '../utils/googleDiagnostics.js'
import {
  sessao,
  salvarTokens,
  limparSessao,
  identificarTipo,
  obterAccessToken,
  obterRefreshToken,
  atualizarNecessidadeSenha,
} from './authSession.js'

export { sessao, paginaInicial } from './authSession.js'
let consultaPerfil = null

export async function restaurarSessao() {
  if (!obterAccessToken() && !obterRefreshToken()) return null
  if (sessao.usuario) return sessao.usuario
  const revisao = sessao.revisao
  if (consultaPerfil?.revisao === revisao) return consultaPerfil.promise
  const atual = { revisao }
  atual.promise = (async () => {
    if (!obterAccessToken()) await renovarAccessToken()
    const { data } = await api.get('usuarios/me/')
    if (sessao.revisao !== revisao) return null
    const tipo = identificarTipo(data)
    if (!tipo) {
      limparSessao()
      const error = new Error(
        'Não foi possível identificar o grupo da sua conta. Contate o suporte para verificar o cadastro no servidor.',
      )
      error.code = 'AUTH_GROUP_MISSING'
      throw error
    }
    sessao.usuario = data
    sessao.tipo = tipo
    if (typeof data.precisa_definir_senha === 'boolean') {
      atualizarNecessidadeSenha(data.precisa_definir_senha)
    } else {
      sessao.precisaDefinirSenha = localStorage.getItem('precisa_definir_senha') === 'true'
    }
    return data
  })().finally(() => {
    if (consultaPerfil === atual) consultaPerfil = null
  })
  consultaPerfil = atual
  return atual.promise
}

async function iniciarSessao(data) {
  salvarTokens(data)
  const revisao = sessao.revisao
  try {
    if (!(await restaurarSessao())) throw new Error('A sessão foi encerrada. Entre novamente.')
    return data
  } catch (error) {
    if (sessao.revisao === revisao) limparSessao()
    throw error
  }
}

export async function login(email, password) {
  const revisao = sessao.revisao
  const { data } = await api.post('token/', { email: email.trim(), password })
  if (sessao.revisao !== revisao) throw new Error('A sessão foi encerrada ou substituída.')
  return iniciarSessao(data)
}

export async function loginComGoogle(credential, tipo = null, cadastro = false) {
  if (typeof credential !== 'string' || !credential.trim()) {
    throw new Error('O Google não retornou uma credencial. Tente novamente.')
  }
  const revisao = sessao.revisao
  let data
  try {
    const response = await api.post(
      'auth/google/',
      { credential, tipo, cadastro },
      { skipAuth: true },
    )
    data = response.data
  } catch (error) {
    error.authStage = 'google'
    registrarFalhaGoogle(error, credential)
    throw error
  }
  if (sessao.revisao !== revisao) throw new Error('A sessão foi encerrada ou substituída.')
  try {
    return await iniciarSessao(data)
  } catch (error) {
    error.authStage = 'sessao'
    registrarFalhaGoogle(error, credential)
    throw error
  }
}

export async function registrar(formData) {
  const { data } = await api.post('registro/', formData)
  return data
}

export async function definirSenha(senha) {
  const { data } = await api.post('auth/definir-senha/', { senha })
  atualizarNecessidadeSenha(false)
  return data
}

export async function trocarSenha(senhaAtual, novaSenha) {
  const { data } = await api.post('auth/trocar-senha/', {
    senha_atual: senhaAtual,
    nova_senha: novaSenha,
  })
  return data
}

export function logout() {
  limparSessao()
  globalThis.google?.accounts?.id?.disableAutoSelect()
}
