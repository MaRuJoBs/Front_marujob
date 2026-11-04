export const statusCandidatura = Object.freeze({
  pendente: 'Pendente',
  aprovada: 'Aprovada',
  recusada: 'Recusada',
})
export const filtrosNotificacoes = Object.freeze([
  { valor: '', texto: 'Todas' },
  { valor: 'pendente', texto: 'Pendentes' },
  { valor: 'aprovada', texto: 'Aprovadas' },
  { valor: 'recusada', texto: 'Recusadas' },
])
export const idValido = (id) =>
  (typeof id === 'string' && /^[1-9]\d*$/.test(id)) ||
  (typeof id === 'number' && Number.isSafeInteger(id) && id > 0)
export const statusValido = (valor) => Object.hasOwn(statusCandidatura, valor)
const texto = (valor) => (typeof valor === 'string' ? valor : '')

// Guarde somente a projeção profissional autorizada, mesmo que a API adicione campos.
export function candidatoProfissional(valor) {
  return {
    id: idValido(valor?.id) ? valor.id : null,
    name: texto(valor?.name),
    profissao: texto(valor?.profissao),
    habilidades: Array.isArray(valor?.habilidades)
      ? valor.habilidades.filter((v) => typeof v === 'string' && v.trim())
      : [],
    profile_image: texto(valor?.profile_image),
  }
}
export function urlWhatsApp(candidatura) {
  if (
    candidatura?.status !== 'aprovada' ||
    candidatura.whatsapp?.disponivel !== true ||
    typeof candidatura.whatsapp.url !== 'string'
  )
    return ''
  try {
    const original = candidatura.whatsapp.url
    const url = new URL(original)
    if (
      url.protocol !== 'https:' ||
      url.hostname !== 'wa.me' ||
      url.port ||
      url.username ||
      url.password ||
      url.hash ||
      !/^\/[1-9]\d{7,14}$/.test(url.pathname)
    )
      return ''
    // Não reserializa nem recodifica a mensagem fornecida pelo backend.
    return original
  } catch {
    return ''
  }
}
export function normalizarNotificacao(data) {
  if (
    !data ||
    !idValido(data.id) ||
    !idValido(data.candidatura) ||
    !idValido(data.freelancer) ||
    !idValido(data.oportunidade) ||
    !statusValido(data.status)
  )
    throw new Error('Resposta de notificação inválida.')
  return {
    id: data.id,
    candidatura: data.candidatura,
    freelancer: data.freelancer,
    oportunidade: data.oportunidade,
    freelancer_detalhes: candidatoProfissional(data.freelancer_detalhes),
    oportunidade_titulo: texto(data.oportunidade_titulo),
    status: data.status,
    candidatura_criado_em: texto(data.candidatura_criado_em),
    criado_em: texto(data.criado_em),
    lida: typeof data.lida === 'boolean' ? data.lida : null,
  }
}
export function normalizarCandidatura(data) {
  if (
    !data ||
    !idValido(data.id) ||
    !idValido(data.freelancer) ||
    !idValido(data.oportunidade) ||
    !statusValido(data.status)
  )
    throw new Error('Resposta de candidatura inválida.')
  return {
    id: data.id,
    freelancer: data.freelancer,
    oportunidade: data.oportunidade,
    status: data.status,
    freelancer_detalhes: candidatoProfissional(data.freelancer_detalhes),
    whatsapp: {
      disponivel: Boolean(urlWhatsApp(data)),
      url: urlWhatsApp(data) || null,
      modo: 'link',
      mensagem_enviada: false,
    },
  }
}
export function dataCandidatura(valor) {
  if (!valor || typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}T/.test(valor)) return ''
  const data = new Date(valor)
  return Number.isNaN(data.getTime())
    ? ''
    : new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(data)
}
export function erroNotificacoes(error) {
  return (
    {
      400: 'Não foi possível processar a solicitação. Atualize e tente novamente.',
      401: 'Sua sessão expirou. Entre novamente.',
      403: 'Você não tem permissão para acessar esta candidatura ou notificação.',
      404: 'Registro não encontrado ou não acessível. Atualize a lista.',
      409: 'Esta candidatura já foi analisada. Consulte o estado atualizado antes de continuar.',
      503: 'Serviço temporariamente indisponível. Tente novamente em instantes.',
    }[error.response?.status] ||
    (error.response
      ? 'Não foi possível concluir a operação. Tente novamente em instantes.'
      : 'Não foi possível carregar os dados. Verifique sua conexão e tente novamente.')
  )
}
