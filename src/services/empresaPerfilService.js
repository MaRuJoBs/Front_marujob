import api from './api.js'

export const camposPerfil = [
  'name',
  'descricao_institucional',
  'area_atuacao',
  'cidade',
  'uf',
  'website',
  'contato_comercial',
]
export const ufs =
  'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ')
export function urlPublica(valor) {
  if (!valor) return ''
  try {
    const base = new URL(api.defaults.baseURL, globalThis.location?.origin || 'http://localhost')
    const url = new URL(valor, base.origin)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : ''
  } catch {
    return ''
  }
}
export function validarPerfil(form) {
  const erros = {}
  if (!form.name?.trim()) erros.name = 'Informe o nome comercial.'
  if (form.uf && !ufs.includes(form.uf)) erros.uf = 'Selecione uma UF brasileira válida.'
  if (form.website && !/^https?:\/\//i.test(form.website))
    erros.website = 'Informe um endereço com http:// ou https://.'
  else if (form.website && !urlPublica(form.website)) erros.website = 'Informe um website válido.'
  return erros
}
export function payloadPerfil(form, original, imagem) {
  const dados = {}
  for (const campo of camposPerfil) {
    if ((form[campo] ?? '') !== (original[campo] ?? '')) dados[campo] = form[campo] ?? ''
  }
  if (imagem === null && original.profile_image) dados.profile_image = null
  if (imagem instanceof Blob) {
    const multipart = new FormData()
    for (const [chave, valor] of Object.entries(dados)) multipart.append(chave, valor)
    multipart.append('profile_image', imagem, imagem.name || 'logo.png')
    return multipart
  }
  return dados
}
export const consultarPerfilEmpresa = (config) =>
  api.get('empresas/me/', config).then((r) => r.data)
export const atualizarPerfilEmpresa = (dados, config) =>
  api.patch('empresas/me/', dados, config).then((r) => r.data)
