export function parametrosOportunidades(filtros = {}, page = 1) {
  const search = String(filtros.search || '').trim()
  if (Array.from(search).length > 200 || search.split(/\s+/).filter(Boolean).length > 20)
    throw new Error('Use até 200 caracteres e 20 termos na pesquisa.')
  const params = { page }
  if (search) params.search = search
  if (String(filtros.tag || '').trim()) params.tag = String(filtros.tag).trim()
  for (const campo of ['preco_min', 'preco_max']) {
    const valor = String(filtros[campo] ?? '')
      .trim()
      .replace(',', '.')
    if (!valor) continue
    if (!/^\d+(?:\.\d+)?$/.test(valor) || !Number.isFinite(Number(valor)))
      throw new Error('Informe preços válidos e não negativos.')
    params[campo] = valor
  }
  if (
    params.preco_min !== undefined &&
    params.preco_max !== undefined &&
    Number(params.preco_min) > Number(params.preco_max)
  )
    throw new Error('O preço mínimo deve ser menor ou igual ao máximo.')
  if (!Number.isInteger(page) || page < 1) throw new Error('Página inválida.')
  return params
}

export function erroOportunidades(error, detalhe = false) {
  const status = error.response?.status
  if (status === 401) return 'Sua sessão expirou. Entre novamente para continuar.'
  if (status === 403) return 'Sua conta não tem permissão para acessar estas oportunidades.'
  if (status === 404)
    return detalhe
      ? 'Oportunidade não encontrada.'
      : 'Página não encontrada. Volte à primeira página.'
  if (status === 400) {
    const mensagens = Object.values(error.response.data || {})
      .flat()
      .filter((v) => typeof v === 'string')
    return mensagens.length
      ? mensagens.join(' ')
      : 'Pesquisa ou filtros inválidos. Revise os valores informados.'
  }
  if (!error.response && error.message && !error.config) return error.message
  return status
    ? 'Não foi possível carregar as oportunidades. Tente novamente.'
    : 'Não foi possível conectar à API. Verifique sua conexão e tente novamente.'
}

export function formatarPreco(valor) {
  if (valor == null || String(valor).trim() === '') return 'Não informado'
  const numero = Number(valor)
  return Number.isFinite(numero)
    ? new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
        numero,
      )
    : 'Não informado'
}
