import test, { beforeEach, after } from 'node:test'
import assert from 'node:assert/strict'
import { setImmediate as aguardar } from 'node:timers/promises'
import axios from 'axios'
import { createServer } from 'vite'
import { createRouter, createMemoryHistory, RouterView, useRoute } from 'vue-router'
import { createRenderer, h, nextTick, onBeforeUnmount } from 'vue'
import { createPinia, setActivePinia, disposePinia } from 'pinia'

// Testes exclusivamente do frontend: transporte em memória, sem servidor ou publicação real.
const storage = new Map()
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
}
globalThis.window = new EventTarget()
let transporte
const chamadas = []
const adapterOriginal = axios.defaults.adapter
axios.defaults.adapter = async (config) => {
  chamadas.push(config)
  assert.ok(transporte, 'Requisição inesperada: ' + config.url)
  return transporte(config)
}
const resposta = (config, data = {}, status = 201) => ({
  config,
  data,
  status,
  headers: {},
  statusText: '',
})
const falhar = (config, status, data = {}) => {
  throw new axios.AxiosError(
    'HTTP ' + status,
    'ERR_BAD_REQUEST',
    config,
    null,
    resposta(config, data, status),
  )
}
const corpo = (config) => (typeof config.data === 'string' ? JSON.parse(config.data) : config.data)
const formularioValido = () => ({
  requisitos: '',
  beneficios: '',
  tipo_contratacao: '',
  nivel_experiencia: '',
  jornada_trabalho: '',
  data_publicacao: '',
  salario_minimo: '',
  salario_maximo: '',
  modalidade: 'Remoto',
  titulo: 'Criar uma página responsiva',
  descricao: 'Desenvolver a apresentação dos serviços com formulário de contato.',
  categoria: 'Desenvolvimento Web',
  preco: '1500,50',
  tempo: '40',
})
const vagaCriada = {
  id: 923,
  titulo: 'Criar uma página responsiva',
  descricao: 'Desenvolver a apresentação dos serviços com formulário de contato.',
  tag: 'Desenvolvimento Web',
  preco: '1500.50',
  tempo: '40',
}
const pendente = () => {
  let resolve
  const promise = new Promise((r) => {
    resolve = r
  })
  return { promise, resolve }
}

const vite = await createServer({
  configFile: false,
  mode: 'test',
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, watch: null, ws: false },
  appType: 'custom',
})
const formUtils = await vite.ssrLoadModule('/src/utils/vagaForm.js')
const { publicarVaga } = await vite.ssrLoadModule('/src/services/freelanceService.js')
const auth = await vite.ssrLoadModule('/src/services/authService.js')
const session = await vite.ssrLoadModule('/src/services/authSession.js')
const { useVagasStore } = await vite.ssrLoadModule('/src/stores/vagas.js')
const { useCriarVaga } = await vite.ssrLoadModule('/src/composables/useCriarVaga.js')
const { routes } = await vite.ssrLoadModule('/src/router/routes.js')
const { protegerRota } = await vite.ssrLoadModule('/src/router/authGuard.js')
const servicoGestao = await vite.ssrLoadModule('/src/services/freelanceService.js')
const { useGerenciamentoVagas } = await vite.ssrLoadModule('/src/stores/gerenciamentoVagas.js')
const { useEditarVaga } = await vite.ssrLoadModule('/src/composables/useEditarVaga.js')
const { useChaveFormularioVaga } = await vite.ssrLoadModule(
  '/src/composables/useChaveFormularioVaga.js',
)
const { useDetalheVagaEmpresa } = await vite.ssrLoadModule(
  '/src/composables/useDetalheVagaEmpresa.js',
)
let pinia

function autenticar(tipo = 'empresa', id = 7) {
  session.salvarTokens({ access: 'access-frontend-teste', refresh: 'refresh-frontend-teste' })
  auth.sessao.usuario = {
    id,
    name: 'Conta de teste',
    groups: [tipo === 'empresa' ? 'Empresa' : 'Usuário'],
  }
  auth.sessao.tipo = tipo
}

const criarRouter = (componentes = {}) => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: routes.map((route) =>
      route.component
        ? { ...route, component: componentes[route.name] || { render: () => h('div') } }
        : route,
    ),
  })
  router.beforeEach(protegerRota)
  return router
}
const renderer = createRenderer({
  createElement: () => ({ children: [] }),
  createText: () => ({}),
  createComment: () => ({}),
  setText: () => {},
  setElementText: () => {},
  patchProp: () => {},
  insert: (child, parent) => {
    parent.children.push(child)
    child.parent = parent
  },
  remove: () => {},
  parentNode: (node) => node.parent,
  nextSibling: () => null,
})

async function montar() {
  let estado
  const router = criarRouter()
  await router.push('/criar-vaga')
  const app = renderer.createApp({
    setup() {
      estado = useCriarVaga()
      return () => h('div')
    },
  })
  app.use(pinia)
  app.use(router)
  app.mount({ children: [] })
  return { estado, router, store: useVagasStore(), desmontar: () => app.unmount() }
}

beforeEach(async () => {
  if (pinia) disposePinia(pinia)
  auth.logout()
  await nextTick()
  storage.clear()
  chamadas.length = 0
  transporte = null
  pinia = createPinia()
  setActivePinia(pinia)
})
after(async () => {
  if (pinia) disposePinia(pinia)
  axios.defaults.adapter = adapterOriginal
  await vite.close()
  delete globalThis.window
  delete globalThis.localStorage
})

test('formulário começa vazio, incluindo select e pagamento', () => {
  assert.deepEqual(formUtils.novoRascunhoVaga(), {
    titulo: '',
    categoria: '',
    modalidade: '',
    descricao: '',
    preco: '',
    tempo: '',
    requisitos: '',
    beneficios: '',
    tipo_contratacao: '',
    nivel_experiencia: '',
    jornada_trabalho: '',
    data_publicacao: '',
    salario_minimo: '',
    salario_maximo: '',
  })
  assert.equal(Object.keys(formUtils.validarVaga(formUtils.novoRascunhoVaga())).length, 6)
})

test('campos obrigatórios e textos somente com espaços são recusados', () => {
  const form = { ...formUtils.novoRascunhoVaga(), titulo: '   ', descricao: '\n\t ' }
  const erros = formUtils.validarVaga(form)
  assert.ok(erros.titulo)
  assert.ok(erros.descricao)
  assert.ok(erros.categoria)
  assert.ok(erros.modalidade)
  assert.ok(erros.preco)
  assert.ok(erros.tempo)
})

test('limites de título e descrição respeitam o contrato da API', () => {
  const form = {
    ...formularioValido(),
    titulo: 'a'.repeat(100),
    descricao: 'b'.repeat(formUtils.limiteDescricaoVaga('Remoto')),
  }
  assert.deepEqual(formUtils.validarVaga(form), {})
  form.titulo += 'a'
  form.descricao += 'b'
  assert.ok(formUtils.validarVaga(form).titulo)
  assert.ok(formUtils.validarVaga(form).descricao)
})

test('categoria aceita os valores dos filtros existentes e rejeita seleção desconhecida', () => {
  for (const categoria of formUtils.categoriasVaga) {
    assert.equal(
      formUtils.validarVaga({ ...formularioValido(), categoria: categoria.value }).categoria,
      undefined,
    )
    assert.ok(categoria.value.length <= 50)
  }
  assert.ok(
    formUtils.validarVaga({ ...formularioValido(), categoria: 'categoria-inexistente' }).categoria,
  )
})

test('modalidade exige uma opção conhecida e é salva na descrição dentro do limite da API', () => {
  for (const modalidade of ['Remoto', 'Híbrido', 'Presencial']) {
    const form = {
      ...formularioValido(),
      modalidade,
      descricao: 'a'.repeat(formUtils.limiteDescricaoVaga(modalidade)),
    }
    assert.deepEqual(formUtils.validarVaga(form), {})
    const payload = formUtils.montarPayloadVaga(form)
    assert.ok(payload.descricao.startsWith(`Modalidade: ${modalidade}\n\n`))
    assert.equal([...payload.descricao].length, 200)
    assert.equal('modalidade' in payload, false)
  }
  for (const modalidade of ['', 'Outro', 'remoto']) {
    assert.ok(formUtils.validarVaga({ ...formularioValido(), modalidade }).modalidade)
  }
})

test('troca de modalidade valida o novo limite sem truncar o texto digitado', () => {
  const form = {
    ...formularioValido(),
    descricao: 'a'.repeat(formUtils.limiteDescricaoVaga('Remoto')),
  }
  const descricao = form.descricao
  assert.deepEqual(formUtils.validarVaga(form), {})
  form.modalidade = 'Presencial'
  assert.ok(formUtils.validarVaga(form).descricao)
  assert.equal(form.descricao, descricao)
})

test('pagamento aceita vírgula ou ponto e mantém precisão de duas casas', () => {
  for (const [entrada, esperado] of [
    ['0', '0.00'],
    ['0,50', '0.50'],
    ['1500,5', '1500.50'],
    ['12.34', '12.34'],
    ['99999999,99', '99999999.99'],
    ['00012,50', '12.50'],
  ]) {
    assert.equal(formUtils.normalizarPagamento(entrada), esperado)
  }
})

test('pagamento negativo, não numérico, acima do limite ou com precisão inválida é bloqueado', () => {
  for (const preco of [
    '-1',
    'NaN',
    'Infinity',
    '12,345',
    '100000000',
    '1e3',
    '1.500,00',
    'R$ 50',
    '.',
    '',
  ]) {
    assert.ok(formUtils.validarVaga({ ...formularioValido(), preco }).preco, preco)
  }
})

test('duração exige horas positivas e respeita o limite de tamanho', () => {
  for (const tempo of ['', '0', '-5', 'NaN', '1e3', 'três dias', '1'.repeat(51)]) {
    assert.ok(formUtils.validarVaga({ ...formularioValido(), tempo }).tempo, tempo)
  }
  assert.equal(formUtils.validarVaga({ ...formularioValido(), tempo: '2,5' }).tempo, undefined)
})

test('payload sem complementos preserva os cinco campos existentes, com textos normalizados', () => {
  const payload = formUtils.montarPayloadVaga({
    ...formularioValido(),
    titulo: ' Título ',
    descricao: ' Descrição ',
    tempo: ' 2,5 ',
    modalidade: 'Remoto',
    salarioMin: '1',
    salarioMax: '2',
    empresa: 99,
  })
  assert.deepEqual(payload, {
    titulo: 'Título',
    descricao: 'Modalidade: Remoto\n\nDescrição',
    tag: 'Desenvolvimento Web',
    preco: '1500.50',
    tempo: '2.5',
  })
})

test('serviço utiliza POST freelances/ e JWT da instância Axios existente', async () => {
  autenticar()
  transporte = (config) => resposta(config, vagaCriada)
  const payload = formUtils.montarPayloadVaga(formularioValido())
  assert.deepEqual(await publicarVaga(payload), vagaCriada)
  assert.equal(chamadas[0].url, 'freelances/')
  assert.equal(chamadas[0].method, 'post')
  assert.equal(chamadas[0].headers.Authorization, 'Bearer access-frontend-teste')
  assert.deepEqual(corpo(chamadas[0]), payload)
})

test('formulário inválido não faz requisição', async () => {
  autenticar()
  const tela = await montar()
  try {
    await tela.estado.publicar()
    assert.equal(chamadas.length, 0)
    assert.equal(Object.keys(tela.estado.erros.value).length, 6)
  } finally {
    tela.desmontar()
  }
})

test('publicação bloqueia envio duplicado e confirma somente depois do 201', async () => {
  autenticar()
  const espera = pendente()
  transporte = async (config) => {
    await espera.promise
    return resposta(config, vagaCriada)
  }
  const tela = await montar()
  try {
    Object.assign(tela.estado.form, formularioValido())
    const envio = tela.estado.publicar()
    await aguardar()
    assert.equal(tela.estado.publicando.value, true)
    assert.equal(tela.store.confirmacao, '')
    assert.equal(tela.store.ultimaPublicada, null)
    assert.equal(tela.estado.form.titulo, formularioValido().titulo)
    await tela.estado.publicar()
    assert.equal(chamadas.length, 1)
    espera.resolve()
    await envio
    assert.equal(tela.estado.publicando.value, false)
    assert.equal(tela.estado.publicada.value, true)
    assert.equal(tela.store.ultimaPublicada.id, 923)
    assert.match(tela.store.confirmacao, /sucesso/)
    assert.equal(tela.router.currentRoute.value.name, 'homeEmpresa')
    assert.equal(tela.estado.form.titulo, '')
    await tela.estado.publicar()
    assert.equal(chamadas.length, 1)
  } finally {
    tela.desmontar()
  }
})

test('erros 400 aparecem nos campos corretos e preservam o rascunho para nova tentativa', async () => {
  autenticar()
  transporte = (config) =>
    falhar(config, 400, {
      titulo: ['Título recusado.'],
      tag: ['Categoria recusada.'],
      preco: ['Pagamento inválido.'],
      tempo: ['Duração inválida.'],
      non_field_errors: ['Revise sua oportunidade.'],
    })
  const tela = await montar()
  try {
    Object.assign(tela.estado.form, formularioValido())
    await tela.estado.publicar()
    assert.equal(tela.estado.erros.value.categoria, 'Categoria recusada.')
    assert.equal(tela.estado.erros.value.preco, 'Pagamento inválido.')
    assert.equal(tela.estado.erros.value.tempo, 'Duração inválida.')
    assert.equal(tela.estado.erroGeral.value, 'Revise sua oportunidade.')
    assert.deepEqual({ ...tela.estado.form }, formularioValido())
    assert.equal(tela.store.confirmacao, '')
    assert.equal(tela.estado.publicando.value, false)
    assert.equal(tela.router.currentRoute.value.path, '/criar-vaga')
    transporte = (config) => resposta(config, vagaCriada)
    await tela.estado.publicar()
    assert.equal(chamadas.length, 2)
    assert.equal(tela.estado.publicada.value, true)
  } finally {
    tela.desmontar()
  }
})

for (const [status, trecho] of [
  [403, /permissão/],
  [500, /indisponível/],
]) {
  test(`erro ${status} preserva campos e permite nova tentativa`, async () => {
    autenticar()
    transporte = (config) => falhar(config, status)
    const tela = await montar()
    try {
      Object.assign(tela.estado.form, formularioValido())
      await tela.estado.publicar()
      assert.match(tela.estado.erroGeral.value, trecho)
      assert.deepEqual({ ...tela.estado.form }, formularioValido())
      assert.equal(tela.estado.publicada.value, false)
      assert.equal(tela.store.confirmacao, '')
      assert.equal(tela.estado.publicando.value, false)
    } finally {
      tela.desmontar()
    }
  })
}

test('sessão expirada preserva o rascunho para a mesma conta', async () => {
  autenticar()
  localStorage.removeItem('refresh')
  transporte = (config) => falhar(config, 401)
  const tela = await montar()
  try {
    Object.assign(tela.estado.form, formularioValido())
    await tela.estado.publicar()
    assert.match(tela.estado.erroGeral.value, /sessão expirou/)
    await nextTick()
    autenticar()
    tela.store.prepararRascunho(7)
    assert.deepEqual({ ...tela.estado.form }, formularioValido())
    assert.equal(tela.store.confirmacao, '')
  } finally {
    tela.desmontar()
  }
})

test('falha de conexão não apresenta sucesso nem apaga os dados', async () => {
  autenticar()
  transporte = (config) => {
    throw new axios.AxiosError('Network Error', 'ERR_NETWORK', config)
  }
  const tela = await montar()
  try {
    Object.assign(tela.estado.form, formularioValido())
    await tela.estado.publicar()
    assert.match(tela.estado.erroGeral.value, /conectar/)
    assert.deepEqual({ ...tela.estado.form }, formularioValido())
    assert.equal(tela.store.ultimaPublicada, null)
    assert.equal(chamadas.length, 1)
  } finally {
    tela.desmontar()
  }
})

test('resposta sem status de criação não gera confirmação falsa', async () => {
  autenticar()
  transporte = (config) => resposta(config, vagaCriada, 200)
  const tela = await montar()
  try {
    Object.assign(tela.estado.form, formularioValido())
    await tela.estado.publicar()
    assert.equal(tela.estado.publicada.value, false)
    assert.match(tela.estado.erroGeral.value, /não confirmou/)
    assert.equal(tela.store.confirmacao, '')
  } finally {
    tela.desmontar()
  }
})

for (const [tipo, esperado] of [
  [null, 'login'],
  ['usuario', 'home'],
  ['empresa', 'criar-vaga'],
]) {
  test(`guard de criação e alias histórico para ${tipo || 'visitante'}`, async () => {
    if (tipo) autenticar(tipo)
    const router = criarRouter()
    await router.push('/criar-vaga')
    assert.equal(router.currentRoute.value.name, esperado)
    await router.push('/CriarVaga')
    assert.equal(router.currentRoute.value.name, esperado)
    assert.equal(chamadas.length, 0)
  })
}

test('troca de conta remove rascunho e publicação da empresa anterior', async () => {
  autenticar()
  const store = useVagasStore()
  store.prepararRascunho(7)
  store.registrarPublicacao(vagaCriada)
  Object.assign(store.rascunho, formularioValido())
  autenticar('empresa', 8)
  await nextTick()
  assert.equal(store.ultimaPublicada, null)
  assert.equal(store.confirmacao, '')
  assert.equal(store.rascunho.titulo, '')
})

test('resposta após logout não exibe publicação nem redireciona a conta seguinte', async () => {
  autenticar()
  const espera = pendente()
  transporte = async (config) => {
    await espera.promise
    return resposta(config, vagaCriada)
  }
  const tela = await montar()
  try {
    Object.assign(tela.estado.form, formularioValido())
    const envio = tela.estado.publicar()
    await aguardar()
    auth.logout()
    espera.resolve()
    await envio
    assert.equal(tela.store.ultimaPublicada, null)
    assert.equal(tela.store.confirmacao, '')
    assert.notEqual(tela.router.currentRoute.value.name, 'homeEmpresa')
  } finally {
    tela.desmontar()
  }
})

const propria = (id = 12, empresa = 7) => ({
  ...vagaCriada,
  id,
  empresa,
  descricao: 'Modalidade: Remoto\n\nDescrição original',
})

test('listagem percorre páginas, filtra proprietário e nulos, usa JWT e mantém histórico após nova consulta', async () => {
  autenticar()
  transporte = async (c) =>
    resposta(
      c,
      c.url.includes('?')
        ? { results: [propria(22)], next: null }
        : {
            results: [propria(), propria(13, 9), propria(14, null)],
            next: '/api/freelances/?page=2',
          },
      200,
    )
  const store = useGerenciamentoVagas()
  await store.carregar()
  assert.deepEqual(
    store.vagas.map((v) => v.id),
    [22, 12],
  )
  assert.equal(store.ultima.id, 22)
  assert.equal(chamadas[1].url, 'freelances/?page=2')
  assert.equal(chamadas[1].headers.Authorization, 'Bearer access-frontend-teste')
  await store.carregar()
  assert.equal(store.vagas.length, 2)
})

for (const next of [
  'https://externo.test/api/freelances/?page=2',
  '/api/usuarios/',
  'freelances/',
]) {
  test('paginação insegura ou circular é rejeitada: ' + next, async () => {
    autenticar()
    transporte = async (c) => resposta(c, { results: [propria()], next }, 200)
    await assert.rejects(servicoGestao.listarVagasEmpresa())
    assert.equal(chamadas.length, 1)
  })
}

test('estado vazio e falha de rede têm resultados distintos', async () => {
  autenticar()
  const store = useGerenciamentoVagas()
  transporte = async (c) => resposta(c, { results: [], next: null }, 200)
  await store.carregar()
  assert.equal(store.vagas.length, 0)
  assert.equal(store.erro, '')
  transporte = async (c) => {
    throw new axios.AxiosError('rede', 'ERR_NETWORK', c)
  }
  await store.carregar()
  assert.match(store.erro, /conectar/)
  assert.equal(store.carregando, false)
})

test('logout e troca de conta limpam sincronamente e descartam resposta atrasada', async () => {
  autenticar()
  const atraso = pendente()
  transporte = async (c) => {
    await atraso.promise
    return resposta(c, { results: [propria()], next: null }, 200)
  }
  const store = useGerenciamentoVagas()
  const tarefa = store.carregar()
  await aguardar()
  autenticar('empresa', 9)
  assert.equal(store.vagas.length, 0)
  atraso.resolve()
  await tarefa
  assert.equal(store.vagas.length, 0)
  auth.logout()
  assert.equal(store.ultima, null)
})

test('edição extrai somente prefixo exato, preserva categoria, duração e descrição legadas', () => {
  const vaga = propria()
  const form = formUtils.formularioDaVaga(vaga)
  assert.equal(form.modalidade, 'Remoto')
  assert.equal(form.descricao, 'Descrição original')
  form.preco = '1200,50'
  assert.deepEqual(formUtils.montarPayloadEdicao(form, vaga), { preco: '1200.50' })
  for (const descricao of [
    'Modalidade: Remoto sem separador',
    'Texto\nModalidade: Remoto',
    'x'.repeat(220),
  ]) {
    const legado = { ...vaga, descricao, tag: 'Categoria legada', tempo: '2 dias' }
    const dados = formUtils.formularioDaVaga(legado)
    assert.equal(dados.descricao, descricao)
    assert.equal(dados.modalidade, '')
    assert.ok(formUtils.validarEdicaoVaga(dados, legado).modalidade)
    assert.equal(dados.categoria, legado.tag)
    assert.equal(dados.tempo, legado.tempo)
  }
  form.modalidade = 'Presencial'
  assert.equal(
    formUtils.montarPayloadEdicao(form, vaga).descricao,
    'Modalidade: Presencial\n\nDescrição original',
  )
  assert.equal(formUtils.formatarTempo('2 dias'), '2 dias')
})

test('detalhe e mutações alheias são bloqueadas antes de PATCH ou DELETE', async () => {
  autenticar()
  transporte = async (c) => resposta(c, propria(12, 9), 200)
  await assert.rejects(servicoGestao.consultarVagaPropria(12))
  await assert.rejects(servicoGestao.editarVaga(12, { titulo: 'Inválido' }))
  await assert.rejects(servicoGestao.excluirVaga(12))
  assert.ok(chamadas.every((c) => c.method === 'get'))
})

test('PATCH envia somente contrato e exige 200; não transfere empresa', async () => {
  autenticar()
  transporte = async (c) => resposta(c, propria(), 200)
  await servicoGestao.editarVaga(12, { titulo: 'Novo', empresa: 9, status: 'ativo' })
  assert.equal(chamadas[1].url, 'freelances/12/')
  assert.deepEqual(corpo(chamadas[1]), { titulo: 'Novo' })
  transporte = async (c) => resposta(c, propria(), c.method === 'patch' ? 202 : 200)
  await assert.rejects(servicoGestao.editarVaga(12, {}))
})

test('cancelar não envia DELETE; confirmar impede duplicação, remove após 204 e recalcula última', async () => {
  autenticar()
  const store = useGerenciamentoVagas()
  store.vagas = [propria(22), propria(12)]
  store.pedirExclusao(store.ultima)
  store.cancelarExclusao()
  await store.confirmarExclusao()
  assert.equal(chamadas.length, 0)
  store.pedirExclusao(store.ultima)
  const atraso = pendente()
  transporte = async (c) => {
    if (c.method === 'get') return resposta(c, propria(22), 200)
    await atraso.promise
    return resposta(c, null, 204)
  }
  const tarefa = store.confirmarExclusao()
  await store.confirmarExclusao()
  await aguardar()
  assert.equal(store.vagas.length, 2)
  atraso.resolve()
  await tarefa
  assert.equal(chamadas.filter((c) => c.method === 'delete').length, 1)
  assert.equal(store.ultima.id, 12)
  assert.match(store.sucesso, /excluída/)
})

for (const status of [400, 401, 403, 404, 500]) {
  test('exclusão com erro ' + status + ' mantém vaga e informa falha', async () => {
    autenticar()
    const store = useGerenciamentoVagas()
    store.vagas = [propria()]
    store.pedirExclusao(store.ultima)
    transporte = async (c) => (c.method === 'get' ? resposta(c, propria(), 200) : falhar(c, status))
    // 401 sem refresh evita uma renovação real; a sessão limpa os dados por segurança.
    if (status === 401) storage.delete('refresh')
    await store.confirmarExclusao()
    if (status !== 401) {
      assert.equal(store.vagas.length, 1)
      assert.ok(store.erroExclusao)
    } else assert.equal(auth.sessao.usuario, null)
    assert.equal(store.sucesso, '')
  })
}

async function montarEdicao(id = 12) {
  let estado
  const router = criarRouter()
  await router.push('/editar-vaga/' + id)
  const app = renderer.createApp({
    setup() {
      estado = useEditarVaga()
      return () => h('div')
    },
  })
  app.use(pinia)
  app.use(router)
  app.mount({ children: [] })
  await aguardar()
  return { estado, router, desmontar: () => app.unmount() }
}

test('formulário de edição carrega dados reais, valida, preserva erro e bloqueia PATCH repetido', async () => {
  autenticar()
  transporte = async (c) => resposta(c, propria(), 200)
  const tela = await montarEdicao()
  assert.equal(tela.estado.form.titulo, propria().titulo)
  assert.equal(tela.estado.form.modalidade, 'Remoto')
  tela.estado.form.titulo = ''
  await tela.estado.publicar()
  assert.ok(tela.estado.erros.value.titulo)
  assert.equal(chamadas.length, 1)
  tela.estado.form.titulo = 'Alterada'
  transporte = async (c) =>
    c.method === 'get' ? resposta(c, propria(), 200) : falhar(c, 400, { titulo: ['Revise'] })
  await tela.estado.publicar()
  assert.equal(tela.estado.form.titulo, 'Alterada')
  assert.equal(tela.estado.erros.value.titulo, 'Revise')
  const atraso = pendente()
  transporte = async (c) => {
    if (c.method === 'get') return resposta(c, propria(), 200)
    await atraso.promise
    return resposta(c, { ...propria(), titulo: 'Alterada' }, 200)
  }
  const antes = chamadas.length
  const tarefa = tela.estado.publicar()
  await tela.estado.publicar()
  await aguardar()
  atraso.resolve()
  await tarefa
  assert.equal(chamadas.slice(antes).filter((c) => c.method === 'patch').length, 1)
  assert.equal(tela.router.currentRoute.value.path, '/homeEmpresa')
  assert.match(useGerenciamentoVagas().sucesso, /editada/)
  tela.desmontar()
})

test('rota de edição exige empresa e mantém rotas freelancer', () => {
  const rota = routes.find((r) => r.name === 'editar-vaga')
  assert.equal(rota.meta.tipo, 'empresa')
  assert.equal(rota.meta.requiresAuth, true)
  assert.equal(routes.find((r) => r.name === 'freelances').meta.tipo, 'usuario')
})

test('edição alheia não libera formulário nem salvamento', async () => {
  autenticar()
  transporte = async (c) => resposta(c, propria(12, 9), 200)
  const tela = await montarEdicao()
  assert.equal(tela.estado.autorizada.value, false)
  assert.ok(tela.estado.erroGeral.value)
  await tela.estado.publicar()
  assert.equal(chamadas.length, 1)
  tela.desmontar()
})

for (const metodo of ['patch', 'delete']) {
  test('troca de sessão durante ' + metodo + ' não exibe sucesso na conta nova', async () => {
    autenticar()
    const atraso = pendente()
    transporte = async (c) => {
      if (c.method === 'get') return resposta(c, propria(), 200)
      await atraso.promise
      return resposta(c, propria(), metodo === 'patch' ? 200 : 204)
    }
    const tarefa =
      metodo === 'patch'
        ? servicoGestao.editarVaga(12, { titulo: 'Novo' })
        : servicoGestao.excluirVaga(12)
    const rejeitada = assert.rejects(tarefa, /sessão/)
    await aguardar()
    autenticar('empresa', 9)
    atraso.resolve()
    await rejeitada
    assert.equal(useGerenciamentoVagas().sucesso, '')
  })
}

test('troca de sessão durante verificação de propriedade impede mutação', async () => {
  autenticar()
  const atraso = pendente()
  transporte = async (c) => {
    await atraso.promise
    return resposta(c, propria(), 200)
  }
  const tarefa = assert.rejects(servicoGestao.editarVaga(12, { titulo: 'Novo' }))
  await aguardar()
  autenticar('empresa', 9)
  atraso.resolve()
  await tarefa
  assert.ok(chamadas.every((c) => c.method === 'get'))
})

test('paginação aceita URL absoluta da API e relativa sem duplicar api', async () => {
  autenticar()
  for (const next of ['http://localhost/api/freelances/?page=2', '?page=2']) {
    chamadas.length = 0
    transporte = async (c) =>
      resposta(c, { results: [propria()], next: c.url.includes('?') ? null : next }, 200)
    await servicoGestao.listarVagasEmpresa()
    assert.equal(chamadas[1].url, 'freelances/?page=2')
  }
})

test('seleção alheia e confirmação sem seleção não enviam requisições', async () => {
  autenticar()
  const store = useGerenciamentoVagas()
  store.pedirExclusao(propria(12, 9))
  assert.equal(store.selecionada, null)
  await store.confirmarExclusao()
  assert.equal(chamadas.length, 0)
})

async function montarDetalhe(id = 12) {
  let estado
  const router = criarRouter()
  await router.push('/empresa/vagas/' + id)
  const app = renderer.createApp({
    setup() {
      estado = useDetalheVagaEmpresa()
      return () => h('div')
    },
  })
  app.use(pinia)
  app.use(router)
  app.mount({ children: [] })
  return { estado, router, desmontar: () => app.unmount() }
}

test('detalhe consulta vaga real, funciona sem store prévia e reconsulta ao trocar o ID', async () => {
  autenticar()
  transporte = async (c) => resposta(c, propria(Number(c.url.split('/')[1])), 200)
  const tela = await montarDetalhe()
  await aguardar()
  assert.equal(tela.estado.vaga.value.id, 12)
  assert.equal(useGerenciamentoVagas().vagas.length, 0)
  await tela.router.push('/empresa/vagas/22')
  await aguardar()
  assert.equal(tela.estado.vaga.value.id, 22)
  assert.equal(chamadas[1].url, 'freelances/22/')
  tela.desmontar()
})

for (const status of [403, 404, 500]) {
  test('detalhe trata erro ' + status + ' sem exibir vaga e permite tentar novamente', async () => {
    autenticar()
    transporte = async (c) => falhar(c, status)
    const tela = await montarDetalhe()
    await aguardar()
    assert.equal(tela.estado.vaga.value, null)
    assert.ok(tela.estado.erro.value)
    assert.equal(tela.estado.carregando.value, false)
    transporte = async (c) => resposta(c, propria(), 200)
    tela.estado.recarregar()
    await aguardar()
    assert.equal(tela.estado.vaga.value.id, 12)
    assert.equal(tela.estado.erro.value, '')
    tela.desmontar()
  })
}

test('detalhe alheio bloqueia dados e troca de sessão descarta detalhe atrasado', async () => {
  autenticar()
  transporte = async (c) => resposta(c, propria(12, 9), 200)
  const tela = await montarDetalhe()
  await aguardar()
  assert.equal(tela.estado.vaga.value, null)
  assert.match(tela.estado.erro.value, /permissão/)
  const atraso = pendente()
  transporte = async (c) => {
    await atraso.promise
    return resposta(c, propria(), 200)
  }
  tela.estado.recarregar()
  await aguardar()
  auth.logout()
  assert.equal(tela.estado.vaga.value, null)
  atraso.resolve()
  await aguardar()
  assert.equal(tela.estado.vaga.value, null)
  tela.desmontar()
})

test('rota de detalhe permite apenas empresa autenticada', async () => {
  const rota = routes.find((r) => r.name === 'detalhe-vaga-empresa')
  assert.equal(rota.meta.requiresAuth, true)
  assert.equal(rota.meta.tipo, 'empresa')
  const router = criarRouter()
  await router.push('/empresa/vagas/12')
  assert.equal(router.currentRoute.value.name, 'login')
  autenticar('usuario')
  await router.push('/empresa/vagas/12')
  assert.equal(router.currentRoute.value.path, '/home')
})

const complementosValidos = () => ({
  requisitos: 'Conhecimento em Vue',
  beneficios: 'Horário flexível',
  tipo_contratacao: 'PJ',
  nivel_experiencia: 'Pleno',
  jornada_trabalho: 'Segunda a sexta, das 9h às 18h',
  data_publicacao: '2026-10-30',
  salario_minimo: '2000,50',
  salario_maximo: '3500.00',
})

test('complementos são opcionais, normalizados e independentes da descrição', () => {
  const form = { ...formularioValido(), ...complementosValidos() }
  assert.deepEqual(formUtils.validarVaga(form), {})
  const payload = formUtils.montarPayloadVaga(form)
  assert.equal(payload.requisitos, form.requisitos)
  assert.equal(payload.salario_minimo, '2000.50')
  assert.equal(payload.salario_maximo, '3500.00')
  assert.equal(payload.data_publicacao, '2026-10-30')
  assert.equal(payload.descricao, 'Modalidade: Remoto\n\n' + form.descricao)
  assert.equal(Object.hasOwn(payload, 'empresa'), false)
  assert.equal(formUtils.formatarDataPublicacao('2026-10-30T00:00:00Z'), '30/10/2026')
  assert.equal(formUtils.formatarDataPublicacao('2026-02-30'), 'Não disponível')
  assert.match(formUtils.formatarFaixaSalarial('2000.50', '3500.00'), /2\.000,50.*3\.500,00/)
})

test('validação de complementos rejeita limites, opções, datas e faixas inválidas', () => {
  const form = {
    ...formularioValido(),
    ...complementosValidos(),
    requisitos: 'x'.repeat(1001),
    beneficios: 'x'.repeat(1001),
    jornada_trabalho: 'x'.repeat(101),
    data_publicacao: '2026-02-30',
    tipo_contratacao: 'Inválido',
    nivel_experiencia: 'Inválido',
    salario_minimo: '4000',
    salario_maximo: '3000',
  }
  const erros = formUtils.validarVaga(form)
  for (const campo of [
    'requisitos',
    'beneficios',
    'jornada_trabalho',
    'data_publicacao',
    'tipo_contratacao',
    'nivel_experiencia',
    'salario_maximo',
  ])
    assert.ok(erros[campo], campo)
  assert.ok(formUtils.validarVaga({ ...formularioValido(), salario_minimo: '2000' }).salario_maximo)
  assert.ok(formUtils.validarVaga({ ...formularioValido(), salario_maximo: '3000' }).salario_minimo)
  assert.ok(
    formUtils.validarVaga({ ...formularioValido(), salario_minimo: '-1', salario_maximo: '3000' })
      .salario_minimo,
  )
})

test('edição preenche, preserva e limpa complementos sem alterar campos alheios', () => {
  const vaga = {
    ...propria(),
    ...formUtils.montarPayloadVaga({ ...formularioValido(), ...complementosValidos() }),
  }
  const form = formUtils.formularioDaVaga(vaga)
  assert.equal(form.beneficios, 'Horário flexível')
  assert.deepEqual(formUtils.montarPayloadEdicao(form, vaga), {})
  form.beneficios = ''
  form.data_publicacao = ''
  form.salario_minimo = form.salario_maximo = ''
  assert.deepEqual(formUtils.montarPayloadEdicao(form, vaga), {
    beneficios: '',
    data_publicacao: null,
    salario_minimo: null,
    salario_maximo: null,
  })
})

test('serviço PATCH permite os complementos e continua bloqueando empresa/status', async () => {
  autenticar()
  const payload = formUtils.montarPayloadVaga({ ...formularioValido(), ...complementosValidos() })
  transporte = async (c) => resposta(c, { ...propria(), ...payload }, 200)
  await servicoGestao.editarVaga(12, { ...payload, empresa: 9, status: 'ativo' })
  assert.deepEqual(corpo(chamadas.find((c) => c.method === 'patch')), payload)
})

test('campos complementares ignorados ou alterados pelo servidor não são confirmados', () => {
  const payload = formUtils.montarPayloadVaga({ ...formularioValido(), ...complementosValidos() })
  assert.equal(formUtils.camposNaoConfirmados(propria(), payload).length, 8)
  assert.deepEqual(
    formUtils.camposNaoConfirmados(
      { ...payload, salario_minimo: '2000.5', data_publicacao: '2026-10-30T00:00:00Z' },
      payload,
    ),
    [],
  )
  assert.deepEqual(
    formUtils.camposNaoConfirmados({ beneficios: 'Outro' }, { beneficios: 'Texto' }),
    ['Benefícios'],
  )
})

test('criação envia complementos; HTTP 400 mapeia erros sem apagar os campos', async () => {
  autenticar()
  const tela = await montar()
  Object.assign(tela.estado.form, formularioValido(), complementosValidos())
  transporte = async (c) =>
    falhar(c, 400, { requisitos: ['Revise os requisitos'], salario_minimo: ['Valor inválido'] })
  await tela.estado.publicar()
  assert.equal(corpo(chamadas[0]).tipo_contratacao, 'PJ')
  assert.equal(tela.estado.form.requisitos, 'Conhecimento em Vue')
  assert.equal(tela.estado.erros.value.requisitos, 'Revise os requisitos')
  assert.equal(tela.estado.erros.value.salario_minimo, 'Valor inválido')
  tela.desmontar()
})

test('POST 201 com complementos ignorados avisa, retém rascunho e bloqueia republicação', async () => {
  autenticar()
  const tela = await montar()
  Object.assign(tela.estado.form, formularioValido(), complementosValidos())
  transporte = async (c) => resposta(c, propria(), 201)
  await tela.estado.publicar()
  assert.equal(tela.estado.publicada.value, true)
  assert.match(tela.estado.erroGeral.value, /não confirmou/)
  assert.equal(tela.estado.form.requisitos, 'Conhecimento em Vue')
  assert.equal(tela.router.currentRoute.value.path, '/criar-vaga')
  await tela.estado.publicar()
  assert.equal(chamadas.length, 1)
  tela.desmontar()
})

test('edição mantém dados complementares quando o servidor os ignora', async () => {
  autenticar()
  transporte = async (c) => resposta(c, propria(), 200)
  const tela = await montarEdicao()
  Object.assign(tela.estado.form, complementosValidos())
  await tela.estado.publicar()
  assert.equal(tela.estado.publicada.value, false)
  assert.match(tela.estado.erroGeral.value, /não confirmou/)
  assert.equal(tela.estado.form.beneficios, 'Horário flexível')
  assert.equal(tela.router.currentRoute.value.path, '/editar-vaga/12')
  tela.desmontar()
})

// Exercita RouterView e ciclo de vida real dos composables. O teste Chrome também
// monta os SFCs originais e comprova que CriarVagaView não é desmontada.
async function montarRotasFormulario(inicial = '/criar-vaga') {
  const instancias = []
  let montagensView = 0
  const Formulario = {
    setup() {
      const editando = useRoute().name === 'editar-vaga'
      const item = {
        editando,
        estado: editando ? useEditarVaga() : useCriarVaga(),
        desmontada: false,
      }
      instancias.push(item)
      onBeforeUnmount(() => {
        item.desmontada = true
      })
      return () => h('form')
    },
  }
  const View = {
    setup() {
      montagensView++
      const chave = useChaveFormularioVaga()
      return () =>
        session.sessao.tipo === 'empresa' && session.sessao.usuario
          ? h(Formulario, { key: chave.value })
          : h('p')
    },
  }
  const router = criarRouter({ 'criar-vaga': View, 'editar-vaga': View })
  await router.push(inicial)
  const app = renderer.createApp({ render: () => h(RouterView) })
  app.use(pinia)
  app.use(router)
  app.mount({ children: [] })
  const estabilizar = async () => {
    await aguardar()
    await nextTick()
  }
  await estabilizar()
  return {
    router,
    instancias,
    atual: () => instancias.at(-1),
    montagens: () => montagensView,
    ir: async (rota) => {
      await router.push(rota)
      await estabilizar()
    },
    estabilizar,
    desmontar: () => app.unmount(),
  }
}

test('SPA mantém a view e reinicia formulário entre criação, edição A, edição B e criação', async () => {
  autenticar()
  transporte = async (c) =>
    resposta(
      c,
      { ...propria(Number(c.url.split('/')[1])), titulo: 'Vaga ' + c.url.split('/')[1] },
      200,
    )
  const tela = await montarRotasFormulario()
  try {
    const criacao = tela.atual()
    Object.assign(criacao.estado.form, formularioValido(), { titulo: 'Rascunho próprio' })
    await tela.ir('/editar-vaga/12')
    assert.equal(criacao.desmontada, true)
    assert.equal(tela.atual().editando, true)
    assert.equal(tela.atual().estado.form.titulo, 'Vaga 12')
    await tela.ir('/editar-vaga/22')
    assert.equal(tela.atual().estado.form.titulo, 'Vaga 22')
    await tela.ir('/criar-vaga')
    assert.equal(tela.atual().editando, false)
    assert.equal(tela.atual().estado.form.titulo, 'Rascunho próprio')
    assert.equal(tela.montagens(), 1)
    assert.deepEqual(
      chamadas.map((c) => c.method),
      ['get', 'get'],
    )
  } finally {
    tela.desmontar()
  }
})

test('SPA envia POST na criação e PATCH no ID correto, sem executar instâncias desmontadas', async () => {
  autenticar()
  transporte = async (c) =>
    resposta(
      c,
      { ...propria(c.method === 'post' ? 923 : Number(c.url.split('/')[1])), ...corpo(c) },
      c.method === 'post' ? 201 : 200,
    )
  const tela = await montarRotasFormulario('/editar-vaga/12')
  try {
    const edicao = tela.atual()
    await tela.ir('/criar-vaga')
    await edicao.estado.publicar()
    const criacao = tela.atual()
    Object.assign(criacao.estado.form, formularioValido())
    await criacao.estado.publicar()
    await criacao.estado.publicar()
    await tela.ir('/editar-vaga/22')
    tela.atual().estado.form.titulo = 'Edição da vaga 22'
    await criacao.estado.publicar()
    await tela.atual().estado.publicar()
    const mutacoes = chamadas.filter((c) => c.method !== 'get')
    assert.deepEqual(
      mutacoes.map((c) => [c.method, c.url]),
      [
        ['post', 'freelances/'],
        ['patch', 'freelances/22/'],
      ],
    )
  } finally {
    tela.desmontar()
  }
})

test('SPA troca de conta limpa formulário e ignora GET atrasado de outra vaga', async () => {
  autenticar()
  const atraso = pendente()
  transporte = async (c) => {
    if (c.url === 'freelances/12/') await atraso.promise
    return resposta(
      c,
      {
        ...propria(Number(c.url.split('/')[1]), session.sessao.usuario.id),
        titulo: 'Conta ' + session.sessao.usuario.id + ' vaga ' + c.url.split('/')[1],
      },
      200,
    )
  }
  const tela = await montarRotasFormulario('/editar-vaga/12')
  try {
    await tela.ir('/editar-vaga/22')
    assert.equal(tela.atual().estado.form.titulo, 'Conta 7 vaga 22')
    atraso.resolve()
    await tela.estabilizar()
    assert.equal(tela.atual().estado.form.titulo, 'Conta 7 vaga 22')
    await tela.ir('/criar-vaga')
    Object.assign(tela.atual().estado.form, formularioValido(), { titulo: 'Privado da conta 7' })
    autenticar('empresa', 9)
    await tela.estabilizar()
    assert.equal(tela.atual().estado.form.titulo, '')
    assert.equal(tela.montagens(), 1)
    await tela.ir('/editar-vaga/22')
    assert.equal(tela.atual().estado.form.titulo, 'Conta 9 vaga 22')
  } finally {
    atraso.resolve()
    tela.desmontar()
  }
})

test('SPA bloqueia POST duplicado ao sair e voltar enquanto a publicação está pendente', async () => {
  autenticar()
  const atraso = pendente()
  transporte = async (c) => {
    if (c.method === 'get') return resposta(c, propria(), 200)
    await atraso.promise
    return resposta(c, propria(), 201)
  }
  const tela = await montarRotasFormulario()
  try {
    Object.assign(tela.atual().estado.form, formularioValido())
    const envio = tela.atual().estado.publicar()
    await aguardar()
    await tela.ir('/editar-vaga/12')
    await tela.ir('/criar-vaga')
    assert.equal(tela.atual().estado.publicando.value, true)
    await tela.atual().estado.publicar()
    assert.equal(chamadas.filter((c) => c.method === 'post').length, 1)
    atraso.resolve()
    await envio
    assert.equal(tela.router.currentRoute.value.path, '/criar-vaga')
    assert.equal(tela.atual().estado.form.titulo, '')
    assert.equal(tela.atual().estado.publicando.value, false)
  } finally {
    atraso.resolve()
    tela.desmontar()
  }
})

test('SPA bloqueia PATCH duplicado ao voltar à mesma vaga e recarrega após a resposta', async () => {
  autenticar()
  const atraso = pendente()
  let vaga = propria()
  transporte = async (c) => {
    if (c.method === 'patch') {
      await atraso.promise
      vaga = { ...vaga, ...corpo(c) }
    }
    return resposta(c, vaga, 200)
  }
  const tela = await montarRotasFormulario('/editar-vaga/12')
  try {
    tela.atual().estado.form.titulo = 'Atualizada no servidor'
    const envio = tela.atual().estado.publicar()
    await aguardar()
    await tela.ir('/criar-vaga')
    await tela.ir('/editar-vaga/12')
    assert.equal(tela.atual().estado.publicando.value, true)
    assert.equal(tela.atual().estado.carregando.value, true)
    await tela.atual().estado.publicar()
    atraso.resolve()
    await envio
    await tela.estabilizar()
    assert.equal(tela.atual().estado.form.titulo, 'Atualizada no servidor')
    assert.equal(chamadas.filter((c) => c.method === 'patch').length, 1)
    assert.equal(tela.router.currentRoute.value.path, '/editar-vaga/12')
  } finally {
    atraso.resolve()
    tela.desmontar()
  }
})

test('contrato DEV: faixa considera máximo intacto e data não aceita ano zero', () => {
  const vaga = { ...propria(), salario_minimo: '2000.00', salario_maximo: '3000.00' }
  const form = formUtils.formularioDaVaga(vaga)
  form.salario_minimo = '4000'
  assert.ok(formUtils.validarEdicaoVaga(form, vaga).salario_maximo)
  assert.ok(
    formUtils.validarVaga({ ...formularioValido(), data_publicacao: '0000-01-01' }).data_publicacao,
  )
  form.salario_minimo = '2500'
  assert.deepEqual(formUtils.validarEdicaoVaga(form, vaga), {})
  assert.deepEqual(formUtils.montarPayloadEdicao(form, vaga), { salario_minimo: '2500.00' })
})

test('SPA resposta antiga da mesma rota não vaza entre contas', async () => {
  autenticar()
  const atraso = pendente()
  transporte = async (c) => {
    const empresa = session.sessao.usuario.id
    if (empresa === 7) await atraso.promise
    return resposta(c, { ...propria(12, empresa), titulo: 'Dados da conta ' + empresa }, 200)
  }
  const tela = await montarRotasFormulario('/editar-vaga/12')
  try {
    autenticar('empresa', 9)
    await tela.estabilizar()
    assert.equal(tela.atual().estado.form.titulo, 'Dados da conta 9')
    atraso.resolve()
    await tela.estabilizar()
    assert.equal(tela.atual().estado.form.titulo, 'Dados da conta 9')
    assert.equal(tela.montagens(), 1)
  } finally {
    atraso.resolve()
    tela.desmontar()
  }
})

test('SPA mantém bloqueio de republicação ao voltar após POST parcialmente confirmado', async () => {
  autenticar()
  transporte = async (c) => resposta(c, propria(), c.method === 'post' ? 201 : 200)
  const tela = await montarRotasFormulario()
  try {
    Object.assign(tela.atual().estado.form, formularioValido(), complementosValidos())
    await tela.atual().estado.publicar()
    await tela.ir('/editar-vaga/12')
    await tela.ir('/criar-vaga')
    assert.equal(tela.atual().estado.publicada.value, true)
    assert.match(tela.atual().estado.erroGeral.value, /não confirmou/)
    assert.equal(tela.atual().estado.form.requisitos, 'Conhecimento em Vue')
    await tela.atual().estado.publicar()
    assert.equal(chamadas.filter((c) => c.method === 'post').length, 1)
  } finally {
    tela.desmontar()
  }
})

test('contrato DEV: opções exatas e defaults vazios/nulos retornados pelo serializer', () => {
  const opcoes = {
    tipo_contratacao: ['CLT', 'PJ', 'Autônomo', 'Temporário', 'Estágio', 'Outros'],
    nivel_experiencia: ['Iniciante', 'Júnior', 'Pleno', 'Sênior', 'Especialista'],
  }
  for (const [campo, valores] of Object.entries(opcoes)) {
    assert.deepEqual(
      formUtils.camposComplementaresVaga.find((c) => c.nome === campo).opcoes,
      valores,
    )
    for (const valor of valores)
      assert.equal(
        formUtils.validarVaga({ ...formularioValido(), [campo]: valor })[campo],
        undefined,
      )
    assert.ok(
      formUtils.validarVaga({ ...formularioValido(), [campo]: 'valor desconhecido' })[campo],
    )
  }
  const respostaAntiga = {
    ...propria(),
    requisitos: '',
    beneficios: '',
    tipo_contratacao: '',
    nivel_experiencia: '',
    jornada_trabalho: '',
    data_publicacao: null,
    salario_minimo: null,
    salario_maximo: null,
  }
  const form = formUtils.formularioDaVaga(respostaAntiga)
  assert.deepEqual(formUtils.validarEdicaoVaga(form, respostaAntiga), {})
  assert.deepEqual(formUtils.montarPayloadEdicao(form, respostaAntiga), {})
})
