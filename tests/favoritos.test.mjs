// Testes isolados do frontend: respostas simuladas, sem alterar a API real.
import test, { after, afterEach, beforeEach } from 'node:test'
import assert from 'node:assert/strict'
import axios from 'axios'
import { createPinia, disposePinia, setActivePinia } from 'pinia'
import { createServer } from 'vite'
import { setImmediate as aguardarTransporte } from 'node:timers/promises'

const storage = new Map()
const armazenamento = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
  removeItem: (key) => storage.delete(key),
}
globalThis.localStorage = { ...armazenamento }
globalThis.window = new EventTarget()
const vite = await createServer({
  configFile: false,
  mode: 'test',
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, watch: null, ws: false },
  appType: 'custom',
})
const { useFavoritosStore, normalizarIdFavorito, chaveFavoritosUsuario } = await vite.ssrLoadModule(
  '/src/stores/favoritos.js',
)
const { useFavoritosLocais } = await vite.ssrLoadModule('/src/composables/useFavoritosLocais.js')
const { sessao, limparSessao } = await vite.ssrLoadModule('/src/services/authSession.js')
const { default: api } = await vite.ssrLoadModule('/src/services/api.js')
const chave = chaveFavoritosUsuario(38)
let pinia, chamadas, transporte
api.defaults.adapter = async (config) => {
  chamadas.push(config)
  return { config, data: await transporte(config), status: 200, headers: {}, statusText: '' }
}
const falhar = (config, status) => {
  throw new axios.AxiosError(
    'Falha simulada',
    'ERR_TEST',
    config,
    null,
    status ? { status, data: {} } : undefined,
  )
}
const adiar = () => {
  let resolver
  const promise = new Promise((r) => {
    resolver = r
  })
  return { promise, resolver }
}

beforeEach(() => {
  storage.clear()
  globalThis.localStorage = { ...armazenamento }
  sessao.usuario = { id: 38 }
  sessao.tipo = 'usuario'
  sessao.revisao++
  pinia = createPinia()
  setActivePinia(pinia)
  chamadas = []
  transporte = (config) => ({ id: Number(config.url.split('/').at(-2)), titulo: 'Vaga de teste' })
})
afterEach(() => disposePinia(pinia))
after(async () => {
  await vite.close()
  delete globalThis.localStorage
  delete globalThis.window
})

test('normaliza IDs e recusa valores inválidos sem persistir nem chamar API', () => {
  const store = useFavoritosStore()
  assert.equal(normalizarIdFavorito(' 0011 '), 11)
  for (const id of [
    null,
    undefined,
    {},
    [],
    true,
    '',
    ' ',
    0,
    -1,
    1.5,
    Infinity,
    '1e3',
    '1/2',
    Number.MAX_SAFE_INTEGER + 1,
  ]) {
    assert.equal(store.adicionarFavorito(id), false)
    assert.equal(normalizarIdFavorito(id), null)
  }
  assert.deepEqual(store.favoritos, [])
  assert.equal(storage.size, 0)
  assert.equal(chamadas.length, 0)
})

test('adiciona/remove números e strings sem duplicar e sincroniza consumidores', () => {
  const store = useFavoritosStore()
  const home = useFavoritosLocais(),
    detalhes = useFavoritosLocais()
  home.toggleFavorito({ id: '11' })
  assert.equal(detalhes.ehFavorito(11), true)
  store.adicionarFavorito(11)
  store.adicionarFavorito('011')
  assert.deepEqual(store.favoritos, [11])
  detalhes.toggleFavorito('11')
  assert.deepEqual(home.favoritos.value, [])
  assert.deepEqual(JSON.parse(storage.get(chave)), [])
  assert.equal(chamadas.length, 0)
})

test('restaura após recriar Pinia, preserva ordem e elimina duplicatas/dados inválidos', () => {
  storage.set(chave, JSON.stringify(['11', 11, null, {}, 27, '003', -1, true]))
  const store = useFavoritosStore()
  assert.deepEqual(store.favoritos, [11, 27, 3])
  store.adicionarFavorito('99')
  disposePinia(pinia)
  pinia = createPinia()
  setActivePinia(pinia)
  assert.deepEqual(useFavoritosStore().favoritos, [11, 27, 3, 99])
})

for (const dados of ['{', '{}', 'null', '123'])
  test(`dados corrompidos (${dados}) têm feedback e permitem novos favoritos`, () => {
    storage.set(chave, dados)
    const store = useFavoritosStore()
    assert.ok(store.erroFavorito)
    assert.deepEqual(store.favoritos, [])
    assert.equal(store.adicionarFavorito(11), true)
    assert.equal(store.erroFavorito, '')
    assert.deepEqual(JSON.parse(storage.get(chave)), [11])
  })

test('falhas de escrita não alteram o coração nem a lista persistida', () => {
  const store = useFavoritosStore()
  store.adicionarFavorito(11)
  localStorage.setItem = () => {
    throw new Error('Quota excedida')
  }
  assert.equal(store.removerFavorito(11), false)
  assert.equal(store.adicionarFavorito(22), false)
  assert.deepEqual(store.favoritos, [11])
  assert.deepEqual(JSON.parse(storage.get(chave)), [11])
  assert.ok(store.erroFavorito)
})

test('falha de leitura não sobrescreve dados desconhecidos; permite recuperar', () => {
  storage.set(chave, '[11]')
  localStorage.getItem = () => {
    throw new Error('Bloqueado')
  }
  const store = useFavoritosStore()
  assert.ok(store.erroFavorito)
  assert.equal(store.adicionarFavorito(22), false)
  assert.equal(storage.get(chave), '[11]')
  localStorage.getItem = armazenamento.getItem
  store.carregarFavoritos()
  assert.deepEqual(store.favoritos, [11])
})

test('logout limpa imediatamente sem apagar favoritos; conta B e retorno a A são isolados', () => {
  storage.set('favoritos', '[999]')
  const store = useFavoritosStore()
  assert.deepEqual(store.favoritos, [])
  store.adicionarFavorito(11)
  limparSessao()
  assert.deepEqual(store.favoritos, [])
  assert.equal(store.adicionarFavorito(22), false)
  assert.equal(storage.get(chave), '[11]')
  sessao.usuario = { id: 39 }
  sessao.tipo = 'usuario'
  assert.deepEqual(store.favoritos, [])
  store.adicionarFavorito(22)
  assert.equal(storage.get(chaveFavoritosUsuario(39)), '[22]')
  sessao.usuario = { id: '38' }
  assert.deepEqual(store.favoritos, [11])
  assert.equal(storage.get('favoritos'), '[999]')
  sessao.tipo = 'empresa'
  assert.deepEqual(store.favoritos, [])
  assert.equal(store.adicionarFavorito(33), false)
})

test('consulta IDs fora da primeira página, reutiliza cache e deduplica consultas em andamento', async () => {
  const store = useFavoritosStore()
  store.adicionarFavorito(27)
  store.adicionarFavorito(99)
  const bloqueio = adiar()
  transporte = async (config) => {
    await bloqueio.promise
    return { id: Number(config.url.split('/').at(-2)) }
  }
  const primeira = store.carregarOportunidades(),
    segunda = store.carregarOportunidades()
  await aguardarTransporte()
  assert.equal(store.carregando, true)
  assert.equal(chamadas.length, 2)
  bloqueio.resolver()
  await Promise.all([primeira, segunda])
  assert.deepEqual(
    chamadas.map((c) => c.url),
    ['freelances/27/', 'freelances/99/'],
  )
  assert.deepEqual(
    store.oportunidadesFavoritas.map((e) => e.job.id),
    [27, 99],
  )
  assert.equal(store.carregando, false)
  await store.carregarOportunidades()
  assert.equal(chamadas.length, 2)
  assert.ok(chamadas.every((c) => c.method === 'get'))
})

test('cache expira e remoção invalida dados antes de adicionar a mesma vaga novamente', async () => {
  const store = useFavoritosStore()
  store.adicionarFavorito(11)
  await store.carregarOportunidades()
  const agora = Date.now
  try {
    Date.now = () => agora() + 60_001
    await store.carregarOportunidades()
    assert.equal(chamadas.length, 2)
  } finally {
    Date.now = agora
  }
  store.removerFavorito('11')
  store.adicionarFavorito(11)
  assert.equal(store.oportunidadesFavoritas[0].status, 'carregando')
  await store.carregarOportunidades()
  assert.equal(chamadas.length, 3)
})

test('favorito indisponível continua removível após recriar a aplicação', async () => {
  let store = useFavoritosStore()
  store.adicionarFavorito(404)
  transporte = (config) => falhar(config, 404)
  await store.carregarOportunidades()
  disposePinia(pinia)
  pinia = createPinia()
  setActivePinia(pinia)
  store = useFavoritosStore()
  assert.deepEqual(store.favoritos, [404])
  await store.carregarOportunidades()
  assert.equal(store.oportunidadesFavoritas[0].status, 'indisponivel')
  store.removerFavorito(404)
  assert.deepEqual(store.favoritos, [])
  assert.deepEqual(JSON.parse(storage.get(chave)), [])
})

test('limita a quatro consultas simultâneas e preserva ordem independentemente da resposta', async () => {
  const store = useFavoritosStore()
  for (let id = 1; id <= 12; id++) store.adicionarFavorito(id)
  let ativas = 0,
    maximo = 0
  transporte = async (config) => {
    maximo = Math.max(maximo, ++ativas)
    await new Promise((r) => setTimeout(r, 5))
    ativas--
    return { id: Number(config.url.split('/').at(-2)) }
  }
  await Promise.all([store.carregarOportunidades(), store.carregarOportunidades()])
  assert.equal(maximo, 4)
  assert.equal(chamadas.length, 12)
  assert.deepEqual(
    store.oportunidadesFavoritas.map((e) => e.job.id),
    store.favoritos,
  )
})

test('404/410 e erros de rede/500/403 são distintos; falhas parciais não apagam IDs', async () => {
  const store = useFavoritosStore()
  for (const id of [11, 12, 13, 14, 15, 16]) store.adicionarFavorito(id)
  transporte = (config) => {
    const id = Number(config.url.split('/').at(-2))
    if (id !== 11) return falhar(config, { 12: 404, 13: 0, 14: 410, 15: 500, 16: 403 }[id])
    return { id }
  }
  await store.carregarOportunidades()
  assert.deepEqual(
    store.oportunidadesFavoritas.map((e) => e.status),
    ['disponivel', 'indisponivel', 'erro', 'indisponivel', 'erro', 'erro'],
  )
  assert.deepEqual(JSON.parse(storage.get(chave)), [11, 12, 13, 14, 15, 16])
  assert.equal(store.removerFavorito(12), true)
  assert.equal(
    store.oportunidadesFavoritas.some((e) => e.id === 12),
    false,
  )
  transporte = (config) => ({ id: Number(config.url.split('/').at(-2)) })
  await store.carregarOportunidades({ recarregar: true })
  assert.ok(store.oportunidadesFavoritas.every((e) => e.status === 'disponivel'))
})

test('resposta com ID diferente gera erro sem alterar favoritos', async () => {
  const store = useFavoritosStore()
  store.adicionarFavorito(11)
  transporte = () => ({ id: 12 })
  await store.carregarOportunidades()
  assert.equal(store.oportunidadesFavoritas[0].status, 'erro')
  assert.equal(store.ehFavorito(11), true)
})

test('respostas tardias após remoção/troca de conta são descartadas e consultas abortadas', async () => {
  const store = useFavoritosStore()
  const bloqueio = adiar()
  transporte = async (config) => {
    await bloqueio.promise
    return { id: Number(config.url.split('/').at(-2)) }
  }
  store.adicionarFavorito(11)
  store.adicionarFavorito(12)
  const carga = store.carregarOportunidades()
  await aguardarTransporte()
  store.removerFavorito(11)
  assert.equal(chamadas[0].signal.aborted, true)
  sessao.usuario = { id: 39 }
  assert.equal(chamadas[1].signal.aborted, true)
  bloqueio.resolver()
  await carga
  assert.deepEqual(store.oportunidadesFavoritas, [])
  assert.deepEqual(store.favoritos, [])
  assert.deepEqual(JSON.parse(storage.get(chave)), [12])
})

test('1001 cliques rápidos alternam estado sem duplicatas e sem chamadas remotas', () => {
  const store = useFavoritosStore()
  for (let i = 0; i < 1001; i++) store.toggleFavorito(i % 2 ? '11' : 11)
  assert.deepEqual(store.favoritos, [11])
  assert.deepEqual(JSON.parse(storage.get(chave)), [11])
  assert.equal(chamadas.length, 0)
})

test('evento nativo de armazenamento atualiza somente a conta atual', () => {
  const store = useFavoritosStore()
  const evento = (key) => {
    const e = new Event('storage')
    e.key = key
    window.dispatchEvent(e)
  }
  storage.set(chave, '[11]')
  evento(chave)
  assert.deepEqual(store.favoritos, [11])
  storage.set(chave, '[22]')
  evento(chaveFavoritosUsuario(39))
  assert.deepEqual(store.favoritos, [11])
  evento(chave)
  assert.deepEqual(store.favoritos, [22])
})
