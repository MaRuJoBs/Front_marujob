// Valores já utilizados pelos filtros de oportunidades. A API aceita tag como texto.
export const categoriasVaga = [
  { value: 'Desenvolvimento Web', label: 'Desenvolvimento Web' },
  { value: 'Mobile', label: 'Mobile' },
  { value: 'UI/UX', label: 'UI/UX' },
  { value: 'Design Gráfico', label: 'Design Gráfico' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Vídeo', label: 'Edição de vídeo' },
  { value: 'Suporte', label: 'Suporte técnico' },
  { value: 'Outros', label: 'Outros' },
]

export const limitesVaga = { titulo: 100, descricao: 200, tag: 50, tempo: 50 }
export const modalidadesVaga = ['Remoto', 'Híbrido', 'Presencial']
const prefixoModalidade = (modalidade) =>
  modalidadesVaga.includes(modalidade) ? `Modalidade: ${modalidade}\n\n` : ''
export const limiteDescricaoVaga = (modalidade) =>
  limitesVaga.descricao - [...prefixoModalidade(modalidade)].length

export const novoRascunhoVaga = () => ({
  titulo: '',
  categoria: '',
  modalidade: '',
  descricao: '',
  preco: '',
  tempo: '',
})

export function normalizarPagamento(valor) {
  const texto = String(valor ?? '').trim()
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(texto)) return null
  const [inteiro, decimal = ''] = texto.replace(',', '.').split('.')
  const parteInteira = inteiro.replace(/^0+(?=\d)/, '')
  if (parteInteira.length > 8) return null
  return `${parteInteira}.${decimal.padEnd(2, '0')}`
}

export function validarVaga(form) {
  const erros = {}
  if (!form.titulo.trim()) erros.titulo = 'Informe o título da vaga.'
  else if ([...form.titulo.trim()].length > limitesVaga.titulo)
    erros.titulo = 'Use até 100 caracteres no título.'
  if (!categoriasVaga.some((categoria) => categoria.value === form.categoria))
    erros.categoria = 'Selecione uma categoria válida.'
  if (!modalidadesVaga.includes(form.modalidade))
    erros.modalidade = 'Selecione Remoto, Híbrido ou Presencial.'
  if (!form.descricao.trim()) erros.descricao = 'Descreva a oportunidade.'
  else if ([...form.descricao.trim()].length > limiteDescricaoVaga(form.modalidade))
    erros.descricao = `Use até ${limiteDescricaoVaga(form.modalidade)} caracteres na descrição para incluir a modalidade.`
  if (!String(form.preco).trim()) erros.preco = 'Informe o pagamento da oportunidade.'
  else if (normalizarPagamento(form.preco) === null)
    erros.preco = 'Informe de 0 a 99.999.999,99, com até 2 casas decimais. Ex.: 1500,00.'
  const tempo = String(form.tempo).trim()
  if (!tempo) erros.tempo = 'Informe a duração estimada em horas.'
  else if (
    tempo.length > limitesVaga.tempo ||
    !/^\d+(?:[.,]\d+)?$/.test(tempo) ||
    !Number.isFinite(Number(tempo.replace(',', '.'))) ||
    Number(tempo.replace(',', '.')) <= 0
  ) {
    erros.tempo = 'Informe uma duração maior que zero, em horas. Ex.: 40 ou 2,5.'
  }
  return erros
}

export function montarPayloadVaga(form) {
  return {
    titulo: form.titulo.trim(),
    descricao: prefixoModalidade(form.modalidade) + form.descricao.trim(),
    tag: form.categoria,
    preco: normalizarPagamento(form.preco),
    tempo: String(form.tempo).trim().replace(',', '.'),
  }
}

const camposApi = {
  titulo: 'titulo',
  descricao: 'descricao',
  tag: 'categoria',
  preco: 'preco',
  tempo: 'tempo',
}

export function interpretarErroPublicacao(error) {
  const status = error.response?.status
  const erros = {}
  const gerais = []
  if (status === 400 && error.response?.data && typeof error.response.data === 'object') {
    for (const [campo, valor] of Object.entries(error.response.data)) {
      if (campo === 'code') continue
      const mensagem = (Array.isArray(valor) ? valor : [valor])
        .filter((item) => typeof item === 'string')
        .join(' ')
      if (!mensagem) continue
      if (camposApi[campo]) erros[camposApi[campo]] = mensagem
      else gerais.push(mensagem)
    }
  }
  let mensagem
  if (status === 401)
    mensagem =
      'Sua sessão expirou. Entre novamente para publicar. Seus dados foram mantidos nesta sessão.'
  else if (status === 403)
    mensagem = 'Sua conta não tem permissão para publicar vagas. Use uma conta de empresa.'
  else if (status >= 500)
    mensagem =
      'O servidor está indisponível. Seus dados foram mantidos; tente novamente em instantes.'
  else if (!error.response && error.isAxiosError)
    mensagem =
      'Não foi possível conectar ao servidor. Verifique sua conexão. Seus dados foram mantidos.'
  else
    mensagem =
      gerais.join(' ') ||
      (error.code === 'PUBLICACAO_NAO_CONFIRMADA'
        ? error.message
        : 'Não foi possível publicar. Revise os campos e tente novamente.')
  return { erros, mensagem }
}

export const formatarPagamento = (valor) => {
  const numero = Number(String(valor ?? '').replace(',', '.'))
  return Number.isFinite(numero)
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numero)
    : 'Pagamento não informado'
}
