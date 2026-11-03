export const camposPerfil = [
  'name',
  'profissao',
  'localizacao',
  'latitude',
  'longitude',
  'geolocation_accuracy',
  'geolocation_timestamp',
  'sobre',
  'telefone',
  'habilidades',
  'profile_image',
]
export const camposProjeto = ['titulo', 'categoria', 'descricao', 'tags', 'link', 'imagem']

export function validarLista(lista) {
  if (
    !Array.isArray(lista) ||
    lista.length > 50 ||
    lista.some((v) => typeof v !== 'string' || !v.trim() || v.length > 100) ||
    new Set(lista.map((v) => v.trim().toLowerCase())).size !== lista.length
  )
    return 'Use até 50 itens diferentes, com 1 a 100 caracteres cada.'
  return ''
}
export function validarImagem(file) {
  if (!file) return ''
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
    return 'Selecione uma imagem JPEG, PNG ou WebP.'
  return file.size > 5 * 1024 * 1024 ? 'A imagem deve ter no máximo 5 MiB.' : ''
}
export function linkSeguro(value) {
  try {
    const u = new URL(value)
    return ['https:', 'http:'].includes(u.protocol) && !u.username && !u.password ? u.href : ''
  } catch {
    return ''
  }
}
export function imagemUrl(path, base, origin = globalThis.location?.origin || 'http://localhost') {
  if (typeof path !== 'string' || !path.trim() || /^(?:[a-z]:[\\/]|\\\\|file:)/i.test(path))
    return ''
  try {
    const api = new URL(base, origin)
    const url = new URL(path, new URL('/', api))
    return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password
      ? url.href
      : ''
  } catch {
    return ''
  }
}
export function payloadPermitido(dados, campos) {
  const payload = Object.fromEntries(
    campos.filter((k) => dados[k] !== undefined).map((k) => [k, dados[k]]),
  )
  if (!Object.values(payload).some((v) => v instanceof Blob)) return payload
  const form = new FormData()
  for (const [k, v] of Object.entries(payload))
    form.append(k, Array.isArray(v) ? JSON.stringify(v) : (v ?? ''))
  return form
}
export function mensagemErro(error) {
  return (
    {
      400: 'Revise os campos informados.',
      401: 'Sua sessão expirou. Entre novamente.',
      403: 'Você não tem permissão para acessar este projeto.',
      404: 'Registro inexistente ou inacessível.',
      413: 'O arquivo excede o limite permitido.',
      503: 'Armazenamento temporariamente indisponível. Tente novamente.',
    }[error.response?.status] ||
    (error.response
      ? 'Não foi possível concluir a operação. Tente novamente.'
      : 'Falha de conexão. Verifique sua internet e tente novamente.')
  )
}
export function errosCampos(error) {
  const data = error.response?.data
  return data && typeof data === 'object'
    ? Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, Array.isArray(v) ? v.join(' ') : String(v)]),
      )
    : {}
}
