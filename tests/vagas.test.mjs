import test, { beforeEach, after } from 'node:test'
import assert from 'node:assert/strict'
import { setImmediate as aguardar } from 'node:timers/promises'
import axios from 'axios'
import { createServer } from 'vite'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createRenderer, h, nextTick } from 'vue'
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

const criarRouter = () => {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: routes.map((route) => (route.component ? { ...route, component: {} } : route)),
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

test('payload envia somente os cinco campos reais, com textos normalizados', () => {
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
