import test, { after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import { setTimeout as esperar } from 'node:timers/promises'
import { createServer } from 'vite'
import { createRenderer, h, nextTick } from 'vue'

const storage = new Map()
globalThis.localStorage = {
  getItem: (k) => storage.get(k) ?? null,
  setItem: (k, v) => storage.set(k, v),
  removeItem: (k) => storage.delete(k),
}
const vite = await createServer({
  configFile: false,
  optimizeDeps: { noDiscovery: true },
  server: { middlewareMode: true, watch: null, ws: false },
  appType: 'custom',
})
const load = (p) => vite.ssrLoadModule('/src/' + p)
const { default: api } = await load('services/api.js')
const { sessao, limparSessao } = await load('services/authSession.js')
const { usePerfilEmpresa } = await load('composables/usePerfilEmpresa.js')
const { default: geo } = await load('services/geocodingApi.js')
const { extractCityState } = await load('utils/location.js')
const navOriginal = Object.getOwnPropertyDescriptor(globalThis, 'navigator'),
  reverseOriginal = geo.reverse
let leituraGps
Object.defineProperty(globalThis, 'navigator', {
  configurable: true,
  value: { geolocation: { getCurrentPosition: (...args) => leituraGps(...args) } },
})
after(async () => {
  geo.reverse = reverseOriginal
  if (navOriginal) Object.defineProperty(globalThis, 'navigator', navOriginal)
  else delete globalThis.navigator
  await vite.close()
})
const renderer = createRenderer({
  createElement: () => ({}),
  createText: () => ({}),
  createComment: () => ({}),
  setText() {},
  setElementText() {},
  patchProp() {},
  insert() {},
  remove() {},
  parentNode() {},
  nextSibling() {},
})
function montar() {
  let e
  const app = renderer.createApp({
    setup() {
      e = usePerfilEmpresa()
      return () => h('div')
    },
  })
  app.mount({})
  return { e, fechar: () => app.unmount() }
}
const posicao = {
  coords: { latitude: -26.3, longitude: -48.8, accuracy: 5 },
  timestamp: Date.now(),
}
let banco, chamadas, falha, ignorar, statusResposta
beforeEach(() => {
  limparSessao()
  storage.set('token', 'f58-somente-teste')
  sessao.tipo = 'empresa'
  sessao.usuario = { id: 1, groups: ['Empresa'] }
  banco = { empresa: 1, name: 'Empresa teste', cidade: '', uf: '', profile_image: null }
  chamadas = []
  falha = null
  ignorar = false
  statusResposta = 200
  leituraGps = (ok) => ok(posicao)
  geo.reverse = async () => ({ cidade: 'Joinville', uf: 'SC', label: 'Joinville, SC' })
  api.defaults.adapter = async (config) => {
    chamadas.push(config)
    if (falha) {
      const e = new Error('Falha isolada de teste')
      e.config = config
      if (falha !== 'rede') e.response = { status: falha, data: { cidade: ['Cidade inválida.'] } }
      throw e
    }
    if (config.method === 'patch' && !ignorar) Object.assign(banco, JSON.parse(config.data))
    return { config, status: statusResposta, data: { ...banco }, headers: {} }
  }
})

test('GPS só inicia por ação; cidade/UF persistem com PATCH mínimo e releitura, sem coordenadas', async () => {
  let leituras = 0
  leituraGps = (ok) => {
    leituras++
    ok(posicao)
  }
  geo.reverse = async (lat, lon) => {
    assert.equal(lat, -26.3)
    assert.equal(lon, -48.8)
    return { cidade: 'Joinville', uf: 'SC' }
  }
  const { e, fechar } = montar()
  try {
    await e.carregar()
    e.editando.value = true
    assert.equal(leituras, 0)
    await e.localizacao.usarLocalizacaoAtual()
    assert.equal(leituras, 1)
    assert.deepEqual(e.localizacao.confirmada.value, { cidade: 'Joinville', uf: 'SC' })
    assert.equal(e.localizacao.gpsOcupado.value, false)
    assert.equal(chamadas.length, 1)
    await Promise.all([e.salvar(), e.salvar()])
    assert.equal(chamadas.filter((c) => c.method === 'patch').length, 1)
    assert.deepEqual(JSON.parse(chamadas[1].data), { cidade: 'Joinville', uf: 'SC' })
    assert.ok(e.sucesso.value)
    await e.carregar()
    assert.equal(e.form.value.cidade, 'Joinville')
    assert.equal(e.form.value.uf, 'SC')
  } finally {
    fechar()
  }
})

test('GPS negado, indisponível, timeout, resposta inválida e rede preservam cidade anterior', async () => {
  const { e, fechar } = montar()
  try {
    banco.cidade = 'Blumenau'
    banco.uf = 'SC'
    await e.carregar()
    e.editando.value = true
    for (const [codigo, mensagem] of [
      [1, /negou/],
      [2, /identificar/],
      [3, /esgotado/],
    ]) {
      leituraGps = (_, erro) => erro({ code: codigo })
      await e.localizacao.usarLocalizacaoAtual()
      assert.match(e.localizacao.locationError.value, mensagem)
      assert.equal(e.form.value.cidade, 'Blumenau')
      assert.equal(e.localizacao.gpsOcupado.value, false)
    }
    leituraGps = (ok) => ok(posicao)
    geo.reverse = async () => {
      throw Error('Sem rede')
    }
    await e.localizacao.usarLocalizacaoAtual()
    assert.match(e.localizacao.erroLocalizacao.value, /identificar/)
    geo.reverse = async () => ({ label: null })
    await e.localizacao.usarLocalizacaoAtual()
    assert.match(e.localizacao.erroLocalizacao.value, /brasileira/)
    assert.equal(e.form.value.cidade, 'Blumenau')
    assert.equal(chamadas.length, 1)
  } finally {
    fechar()
  }
})

test('GPS pendente bloqueia salvar e descartar invalida geocodificação atrasada', async () => {
  let liberarGps,
    liberarEndereco,
    leituras = 0
  leituraGps = (ok) => {
    leituras++
    liberarGps = () => ok(posicao)
  }
  geo.reverse = () =>
    new Promise((resolve) => {
      liberarEndereco = () => resolve({ cidade: 'Joinville', uf: 'SC' })
    })
  const { e, fechar } = montar()
  try {
    await e.carregar()
    e.editando.value = true
    const gps = e.localizacao.usarLocalizacaoAtual()
    await e.localizacao.usarLocalizacaoAtual()
    assert.equal(leituras, 1)
    assert.equal(e.localizacao.loadingLocation.value, true)
    await e.salvar()
    assert.equal(chamadas.length, 1)
    assert.match(e.erros.value.cidade, /Aguarde/)
    liberarGps()
    await esperar(0)
    assert.equal(e.localizacao.buscandoEndereco.value, true)
    e.localizacao.descartar()
    liberarEndereco()
    await gps
    assert.equal(e.form.value.cidade, '')
    assert.equal(e.localizacao.confirmada.value, null)
    assert.equal(e.localizacao.gpsOcupado.value, false)
  } finally {
    fechar()
  }
})

test('cancelar, remover e descartar restauram os dados corretos', async () => {
  const { e, fechar } = montar()
  try {
    banco.cidade = 'Blumenau'
    banco.uf = 'SC'
    await e.carregar()
    e.editando.value = true
    await e.localizacao.usarLocalizacaoAtual()
    e.localizacao.descartar()
    assert.equal(e.form.value.cidade, 'Blumenau')
    await e.localizacao.usarLocalizacaoAtual()
    e.cancelar()
    assert.equal(e.form.value.cidade, 'Blumenau')
    assert.equal(e.localizacao.confirmada.value, null)
    e.editando.value = true
    e.localizacao.remover()
    await e.salvar()
    assert.deepEqual(JSON.parse(chamadas[1].data), { cidade: '', uf: '' })
    assert.ok(e.sucesso.value)
  } finally {
    fechar()
  }
})

test('falhas no PATCH preservam cidade do GPS; resposta ignorando campos não produz sucesso', async () => {
  const { e, fechar } = montar()
  try {
    await e.carregar()
    e.editando.value = true
    await e.localizacao.usarLocalizacaoAtual()
    for (const status of [400, 403, 404, 503, 'rede']) {
      falha = status
      await e.salvar()
      assert.equal(e.form.value.cidade, 'Joinville')
      assert.equal(e.localizacao.confirmada.value.cidade, 'Joinville')
      assert.equal(e.sucesso.value, '')
      assert.ok(e.erro.value)
      assert.equal(e.editando.value, true)
    }
    falha = null
    ignorar = true
    await e.salvar()
    assert.match(e.erro.value, /não confirmou/)
    assert.equal(e.perfil.value.cidade, '')
    ignorar = false
    statusResposta = 202
    await e.salvar()
    assert.equal(e.sucesso.value, '')
    statusResposta = 200
    await e.salvar()
    assert.ok(e.sucesso.value)
  } finally {
    fechar()
  }
})

test('outra conta, logout e desmontagem impedem GPS atrasado de atualizar o formulário', async () => {
  let liberarGps,
    leituras = 0
  leituraGps = (ok) => {
    leituras++
    liberarGps = () => ok(posicao)
  }
  const { e, fechar } = montar()
  try {
    await e.carregar()
    e.editando.value = true
    sessao.tipo = 'usuario'
    await e.localizacao.usarLocalizacaoAtual()
    await e.salvar()
    assert.equal(leituras, 0)
    assert.equal(chamadas.length, 1)
    sessao.tipo = 'empresa'
    const gps = e.localizacao.usarLocalizacaoAtual()
    limparSessao()
    liberarGps()
    await gps
    await nextTick()
    assert.equal(e.perfil.value, null)
    assert.equal(e.localizacao.confirmada.value, null)
    assert.equal(e.localizacao.gpsOcupado.value, false)
  } finally {
    fechar()
  }
  sessao.tipo = 'empresa'
  const outro = montar()
  outro.e.editando.value = true
  const gps = outro.e.localizacao.usarLocalizacaoAtual()
  outro.fechar()
  liberarGps()
  await gps
  assert.equal(outro.e.localizacao.confirmada.value, null)
})

test('geocodificação extrai cidade e UF estruturadas e rejeita país ou UF inválidos', () => {
  assert.deepEqual(
    extractCityState({
      address: { city: 'Joinville', state: 'Santa Catarina', country_code: 'br' },
    }),
    { cidade: 'Joinville', uf: 'SC' },
  )
  assert.deepEqual(
    extractCityState({
      address: { town: 'São Paulo', 'ISO3166-2-lvl4': 'BR-SP', country_code: 'br' },
    }),
    { cidade: 'São Paulo', uf: 'SP' },
  )
  assert.equal(extractCityState({ address: { city: 'Paris', country_code: 'fr' } }), null)
  assert.equal(
    extractCityState({
      address: { city: 'Inválida', country_code: 'br', 'ISO3166-2-lvl4': 'BR-XX' },
    }),
    null,
  )
})
