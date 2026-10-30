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
// Contrato conferido no model/serializer da DEV do backend (PR #17).
export const camposComplementaresVaga = [
  {
    nome: 'requisitos',
    rotulo: 'Requisitos',
    tipo: 'textarea',
    limite: 1000,
    placeholder: 'Liste os conhecimentos e qualificações necessários',
  },
  {
    nome: 'beneficios',
    rotulo: 'Benefícios',
    tipo: 'textarea',
    limite: 1000,
    placeholder: 'Informe os benefícios oferecidos',
  },
  {
    nome: 'tipo_contratacao',
    rotulo: 'Tipo de contratação',
    tipo: 'select',
    opcoes: ['CLT', 'PJ', 'Autônomo', 'Temporário', 'Estágio', 'Outros'],
  },
  {
    nome: 'nivel_experiencia',
    rotulo: 'Nível de experiência',
    tipo: 'select',
    opcoes: ['Iniciante', 'Júnior', 'Pleno', 'Sênior', 'Especialista'],
  },
  {
    nome: 'jornada_trabalho',
    rotulo: 'Jornada de trabalho',
    tipo: 'text',
    limite: 100,
    placeholder: 'Ex.: Segunda a sexta, das 9h às 18h',
  },
  { nome: 'data_publicacao', rotulo: 'Data de publicação', tipo: 'date' },
  {
    nome: 'salario_minimo',
    rotulo: 'Faixa salarial — mínimo (R$)',
    tipo: 'moeda',
    placeholder: 'Ex.: 2000,00',
  },
  {
    nome: 'salario_maximo',
    rotulo: 'Faixa salarial — máximo (R$)',
    tipo: 'moeda',
    placeholder: 'Ex.: 3500,00',
  },
]
const textoCampo = (valor) => String(valor ?? '')
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
  ...Object.fromEntries(camposComplementaresVaga.map(({ nome }) => [nome, ''])),
})

export function normalizarPagamento(valor) {
  const texto = String(valor ?? '').trim()
  if (!/^\d+(?:[.,]\d{1,2})?$/.test(texto)) return null
  const [inteiro, decimal = ''] = texto.replace(',', '.').split('.')
  const parteInteira = inteiro.replace(/^0+(?=\d)/, '')
  if (parteInteira.length > 8) return null
  return `${parteInteira}.${decimal.padEnd(2, '0')}`
}

export function formularioDaVaga(vaga) {
  const descricao = String(vaga.descricao ?? '')
  const modalidade =
    modalidadesVaga.find((valor) => descricao.startsWith(prefixoModalidade(valor))) || ''
  return {
    titulo: String(vaga.titulo ?? ''),
    categoria: String(vaga.tag ?? ''),
    modalidade,
    descricao: modalidade ? descricao.slice(prefixoModalidade(modalidade).length) : descricao,
    preco: String(vaga.preco ?? ''),
    tempo: String(vaga.tempo ?? ''),
    ...Object.fromEntries(
      camposComplementaresVaga.map(({ nome, tipo }) => [
        nome,
        tipo === 'date' ? textoCampo(vaga[nome]).slice(0, 10) : textoCampo(vaga[nome]),
      ]),
    ),
  }
}

export function validarEdicaoVaga(form, original) {
  const erros = validarVaga(form)
  if (!original) return erros
  const anterior = formularioDaVaga(original)
  for (const { nome } of camposComplementaresVaga) {
    if (
      !['salario_minimo', 'salario_maximo'].includes(nome) &&
      textoCampo(form[nome]) === anterior[nome]
    )
      delete erros[nome]
  }
  for (const campo of ['titulo', 'categoria', 'preco', 'tempo']) {
    if (form[campo] === anterior[campo] && form[campo].trim()) delete erros[campo]
  }
  if (
    form.descricao === anterior.descricao &&
    form.modalidade === anterior.modalidade &&
    anterior.modalidade
  )
    delete erros.descricao
  return erros
}

export function montarPayloadEdicao(form, original) {
  const anterior = formularioDaVaga(original)
  const payload = montarPayloadVaga(form)
  for (const [campo, api] of Object.entries({
    titulo: 'titulo',
    categoria: 'tag',
    preco: 'preco',
    tempo: 'tempo',
  })) {
    if (form[campo] === anterior[campo]) delete payload[api]
  }
  if (form.descricao === anterior.descricao && form.modalidade === anterior.modalidade)
    delete payload.descricao
  for (const { nome, tipo } of camposComplementaresVaga) {
    if (textoCampo(form[nome]) === anterior[nome]) delete payload[nome]
    else if (!textoCampo(form[nome]).trim())
      payload[nome] = ['date', 'moeda'].includes(tipo) ? null : ''
  }
  return payload
}

export const formatarTempo = (valor) =>
  /^\d+(?:[.,]\d+)?$/.test(String(valor ?? '').trim())
    ? `${valor} horas`
    : String(valor || 'Duração não informada')

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
  for (const { nome, rotulo, limite, opcoes, tipo } of camposComplementaresVaga) {
    const valor = textoCampo(form[nome]).trim()
    if (!valor) continue
    if (limite && [...valor].length > limite) erros[nome] = `Use até ${limite} caracteres.`
    if (opcoes && !opcoes.includes(valor))
      erros[nome] = `Selecione uma opção válida para ${rotulo.toLowerCase()}.`
    if (tipo === 'moeda' && normalizarPagamento(valor) === null)
      erros[nome] = 'Informe um valor válido em reais, com até 2 casas decimais.'
    if (tipo === 'date' && !dataPublicacaoValida(valor)) erros[nome] = 'Informe uma data válida.'
  }
  const minimo = textoCampo(form.salario_minimo).trim()
  const maximo = textoCampo(form.salario_maximo).trim()
  if (minimo && !maximo) erros.salario_maximo = 'Informe também o valor máximo da faixa.'
  if (maximo && !minimo) erros.salario_minimo = 'Informe também o valor mínimo da faixa.'
  if (
    normalizarPagamento(minimo) !== null &&
    normalizarPagamento(maximo) !== null &&
    Number(normalizarPagamento(minimo)) > Number(normalizarPagamento(maximo))
  )
    erros.salario_maximo = 'O valor máximo deve ser maior ou igual ao mínimo.'
  return erros
}

function dataPublicacaoValida(valor) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor) || valor.startsWith('0000-')) return false
  const data = new Date(`${valor}T00:00:00Z`)
  return Number.isFinite(data.getTime()) && data.toISOString().slice(0, 10) === valor
}

export function camposNaoConfirmados(vaga, payload) {
  return camposComplementaresVaga
    .filter(({ nome, tipo }) => {
      if (!Object.hasOwn(payload, nome)) return false
      if (!Object.hasOwn(vaga || {}, nome)) return true
      if (payload[nome] === null || payload[nome] === '')
        return vaga[nome] != null && vaga[nome] !== ''
      if (tipo === 'moeda') return normalizarPagamento(vaga[nome]) !== payload[nome]
      if (tipo === 'date') return textoCampo(vaga[nome]).slice(0, 10) !== payload[nome]
      return textoCampo(vaga[nome]).trim() !== payload[nome]
    })
    .map(({ rotulo }) => rotulo)
}

export function formatarDataPublicacao(valor) {
  const texto = textoCampo(valor).slice(0, 10)
  return dataPublicacaoValida(texto) ? texto.split('-').reverse().join('/') : 'Não disponível'
}

export function formatarFaixaSalarial(minimo, maximo) {
  if (minimo == null || minimo === '' || maximo == null || maximo === '') return 'Não disponível'
  const de = normalizarPagamento(minimo)
  const ate = normalizarPagamento(maximo)
  return de !== null && ate !== null && Number(de) <= Number(ate)
    ? `${formatarPagamento(de)} a ${formatarPagamento(ate)}`
    : 'Não disponível'
}

export function montarPayloadVaga(form) {
  return {
    titulo: form.titulo.trim(),
    descricao: prefixoModalidade(form.modalidade) + form.descricao.trim(),
    tag: form.categoria,
    preco: normalizarPagamento(form.preco),
    tempo: String(form.tempo).trim().replace(',', '.'),
    ...Object.fromEntries(
      camposComplementaresVaga.flatMap(({ nome, tipo }) => {
        const valor = textoCampo(form[nome]).trim()
        return valor ? [[nome, tipo === 'moeda' ? normalizarPagamento(valor) : valor]] : []
      }),
    ),
  }
}

const camposApi = {
  titulo: 'titulo',
  descricao: 'descricao',
  tag: 'categoria',
  preco: 'preco',
  tempo: 'tempo',
  ...Object.fromEntries(camposComplementaresVaga.map(({ nome }) => [nome, nome])),
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
