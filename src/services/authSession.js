import { reactive } from 'vue'

// Somente tokens e a preferência de senha persistem. O perfil é revalidado na API.
export const sessao = reactive({
  usuario: null,
  tipo: null,
  revisao: 0,
  precisaDefinirSenha: false,
})

export const tokenValido = (token) =>
  typeof token === 'string' && token.trim() !== '' && !['undefined', 'null'].includes(token)

export const obterAccessToken = () => {
  const token = localStorage.getItem('token')
  return tokenValido(token) ? token : null
}

export const obterRefreshToken = () => {
  const token = localStorage.getItem('refresh')
  return tokenValido(token) ? token : null
}

export function limparSessao() {
  localStorage.removeItem('token')
  localStorage.removeItem('refresh')
  localStorage.removeItem('precisa_definir_senha')
  sessao.usuario = null
  sessao.tipo = null
  sessao.precisaDefinirSenha = false
  sessao.revisao++
}

export function salvarTokens(data) {
  if (!tokenValido(data?.access) || !tokenValido(data?.refresh)) {
    throw new Error('O servidor não retornou os tokens necessários para entrar.')
  }
  limparSessao()
  localStorage.setItem('token', data.access)
  localStorage.setItem('refresh', data.refresh)
  atualizarNecessidadeSenha(data.precisa_definir_senha === true)
}

export function atualizarNecessidadeSenha(precisa) {
  sessao.precisaDefinirSenha = precisa === true
  localStorage.setItem('precisa_definir_senha', String(sessao.precisaDefinirSenha))
}

export function identificarTipo(usuario) {
  // O backend retorna null quando a conta não tem um papel autorizado.
  if (usuario?.tipo === null) return null
  const grupos = (Array.isArray(usuario?.groups) ? usuario.groups : [])
    .map((grupo) => (typeof grupo === 'string' ? grupo : grupo?.name))
    .filter((nome) => typeof nome === 'string')
    .map((nome) =>
      nome
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim()
        .toLowerCase(),
    )
  const empresa = grupos.includes('empresa')
  const usuarioComum = grupos.includes('usuario')
  if (empresa && usuarioComum) return null

  const tipoGrupo = empresa ? 'empresa' : usuarioComum ? 'usuario' : null
  const tipoServidor =
    usuario?.tipo === 'empresa' || usuario?.tipo === 'usuario' ? usuario.tipo : null
  if (tipoGrupo && tipoServidor && tipoGrupo !== tipoServidor) return null
  return tipoServidor ?? tipoGrupo
}

export const paginaInicial = () => (sessao.tipo === 'empresa' ? '/homeEmpresa' : '/home')
