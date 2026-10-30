// Integração do frontend com transporte Axios simulado; nenhuma API real é alterada.
import test, { after, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import axios from 'axios'
import { createServer } from 'vite'
import { createRenderer, h, nextTick } from 'vue'
import { setTimeout as esperar } from 'node:timers/promises'
const storage = new Map()
globalThis.localStorage = {
  getItem: (k) => storage.get(k) ?? null,
  setItem: (k, v) => storage.set(k, v),
  removeItem: (k) => storage.delete(k),
}
globalThis.window = new EventTarget()
const vite = await createServer({
  configFile: false,
  mode: 'test',
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, watch: null, ws: false },
  appType: 'custom',
})
const { useOportunidades } = await vite.ssrLoadModule('/src/composables/useOportunidades.js')
const { obterOportunidade } = await vite.ssrLoadModule('/src/services/freelanceService.js')
const { default: api } = await vite.ssrLoadModule('/src/services/api.js')
let chamadas, transporte
api.defaults.adapter = async (config) => {
  chamadas.push(config)
  return { config, data: await transporte(config), status: 200, headers: {}, statusText: '' }
}
const pagina = (page = 1) => ({
  count: 11,
  next: page === 1 ? '?page=2' : null,
  previous: page === 2 ? '?page=1' : null,
  results: Array.from({ length: page === 1 ? 10 : 1 }, (_, i) => ({
    id: (page - 1) * 10 + i + 1,
    titulo: 'Oportunidade de teste',
    descricao: null,
    tag: null,
    preco: null,
    tempo: null,
  })),
})
const renderer = createRenderer({
  createElement: () => ({ children: [] }),
  createText: () => ({}),
  createComment: () => ({}),
  setText() {},
  setElementText() {},
  patchProp() {},
  insert(c, p) {
    p.children.push(c)
  },
  remove() {},
  parentNode: () => null,
  nextSibling: () => null,
})
function montar() {
  let estado
  const app = renderer.createApp({
    setup() {
      estado = useOportunidades()
      return () => h('div')
    },
  })
  app.mount({ children: [] })
  return { estado, fechar: () => app.unmount() }
}
beforeEach(() => {
  storage.clear()
  chamadas = []
  transporte = (config) => pagina(config.params.page)
})
after(async () => {
  await vite.close()
  delete globalThis.localStorage
  delete globalThis.window
})
test('navega além dos dez itens, preserva filtros, reinicia e limpa', async () => {
  const { estado: e, fechar } = montar()
  try {
    await esperar(20)
    assert.equal(e.jobs.value.length, 10)
    assert.equal(e.proxima.value, true)
    assert.equal(e.anterior.value, false)
    e.aplicar({ tag: 'design', preco_min: '100', preco_max: '500' })
    await esperar(20)
    await e.carregar(2)
    assert.equal(e.jobs.value[0].id, 11)
    assert.equal(e.proxima.value, false)
    assert.equal(e.anterior.value, true)
    assert.deepEqual(chamadas.at(-1).params, {
      page: 2,
      tag: 'design',
      preco_min: '100',
      preco_max: '500',
    })
    e.pesquisa.value = 'designer'
    await nextTick()
    await esperar(400)
    assert.deepEqual(chamadas.at(-1).params, {
      page: 1,
      search: 'designer',
      tag: 'design',
      preco_min: '100',
      preco_max: '500',
    })
    e.limpar()
    await esperar(20)
    assert.deepEqual(chamadas.at(-1).params, { page: 1, search: 'designer' })
  } finally {
    fechar()
  }
})
test('debounce e respostas antigas não substituem a pesquisa atual', async () => {
  const { estado: e, fechar } = montar()
  try {
    await esperar(20)
    let resolver
    transporte = () =>
      new Promise((r) => {
        resolver = r
      })
    const antiga = e.carregar(2)
    await esperar(20)
    transporte = () => ({ count: 0, next: null, previous: null, results: [] })
    e.pesquisa.value = 'a'
    await nextTick()
    e.pesquisa.value = 'atual'
    await nextTick()
    await esperar(400)
    resolver(pagina(2))
    await antiga
    assert.equal(e.jobs.value.length, 0)
    assert.equal(e.pagina.value, 1)
    assert.equal(chamadas.filter((c) => c.params.search).length, 1)
  } finally {
    fechar()
  }
})
for (const status of [400, 401, 404, 500, 0])
  test(`falha ${status} não quebra listagem e permite recuperação`, async () => {
    transporte = (config) => {
      throw new axios.AxiosError(
        'Falha',
        'ERR_TEST',
        config,
        null,
        status ? { status, data: {} } : undefined,
      )
    }
    const { estado: e, fechar } = montar()
    try {
      await esperar(20)
      assert.ok(e.erro.value)
      assert.equal(e.carregando.value, false)
      assert.deepEqual(e.jobs.value, [])
      transporte = () => pagina(1)
      await e.carregar(1)
      assert.equal(e.erro.value, '')
      assert.equal(e.jobs.value.length, 10)
    } finally {
      fechar()
    }
  })
test('favoritos preservam localStorage e JSON inválido não quebra tela', async () => {
  storage.set('favoritos', '{')
  const { estado: e, fechar } = montar()
  try {
    await esperar(20)
    e.toggleFavorito({ id: 11 })
    assert.deepEqual(JSON.parse(storage.get('favoritos')), [11])
    e.toggleFavorito({ id: 11 })
    assert.deepEqual(JSON.parse(storage.get('favoritos')), [])
  } finally {
    fechar()
  }
})
test('detalhes utilizam endpoint existente e aceitam campos opcionais nulos', async () => {
  transporte = () => ({
    id: 11,
    titulo: 'Detalhe',
    descricao: null,
    tag: null,
    tempo: null,
    preco: null,
  })
  const data = await obterOportunidade(11)
  assert.equal(chamadas[0].url, 'freelances/11/')
  assert.equal(data.descricao, null)
  transporte = () => ({})
  await assert.rejects(obterOportunidade(11), /inválida/)
})

test('duas visualizações compartilham os mesmos favoritos locais sem chamadas extras', async () => {
  const primeira = montar()
  const segunda = montar()
  try {
    await esperar(20)
    const antes = chamadas.length
    primeira.estado.toggleFavorito({ id: 11 })
    assert.equal(segunda.estado.favoritos.value.includes(11), true)
    segunda.estado.toggleFavorito({ id: 11 })
    assert.equal(primeira.estado.favoritos.value.includes(11), false)
    assert.equal(chamadas.length, antes)
  } finally {
    primeira.fechar()
    segunda.fechar()
  }
})

test('falha ao persistir favorito preserva cards e estado salvo', async () => {
  const { estado, fechar } = montar()
  const salvar = localStorage.setItem
  try {
    await esperar(20)
    localStorage.setItem = () => {
      throw new Error('Storage indisponível')
    }
    estado.toggleFavorito({ id: 11 })
    assert.ok(estado.erroFavorito.value)
    assert.equal(estado.erro.value, '')
    assert.equal(estado.jobs.value.length, 10)
    assert.equal(estado.favoritos.value.includes(11), false)
  } finally {
    localStorage.setItem = salvar
    fechar()
  }
})
